import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export function storageConfigured() {
  return Boolean(
    process.env.AWS_S3_BUCKET?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  );
}

function assertDurableStorageInProduction() {
  if (process.env.NODE_ENV === "production" && !storageConfigured()) {
    throw new Error("S3 storage is required for uploads in production");
  }
}

export type UploadKind =
  | "avatar"
  | "cover"
  | "portfolio-image"
  | "portfolio-video"
  | "deliverable";

export const UPLOAD_POLICY: Record<
  UploadKind,
  { maxBytes: number; types: readonly string[] }
> = {
  avatar: {
    maxBytes: 5_000_000,
    types: ["image/jpeg", "image/png", "image/webp"],
  },
  cover: {
    maxBytes: 8_000_000,
    types: ["image/jpeg", "image/png", "image/webp"],
  },
  "portfolio-image": {
    maxBytes: 20_000_000,
    types: ["image/jpeg", "image/png", "image/webp"],
  },
  "portfolio-video": {
    maxBytes: 100_000_000,
    types: ["video/mp4", "video/quicktime"],
  },
  deliverable: {
    maxBytes: 100_000_000,
    types: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "application/pdf",
    ],
  },
};

export function hasValidSignature(buffer: Buffer, contentType: string) {
  if (contentType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (contentType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }
  if (contentType === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (contentType === "video/mp4" || contentType === "video/quicktime") {
    return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  }
  if (contentType === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  return false;
}

export function validateUploadMetadata(input: {
  size: number;
  contentType: string;
  kind: UploadKind;
}) {
  const policy = UPLOAD_POLICY[input.kind];
  if (!policy.types.includes(input.contentType)) {
    throw new Error(`Unsupported file type for ${input.kind}`);
  }
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > policy.maxBytes) {
    throw new Error(
      `${input.kind} must be smaller than ${Math.round(policy.maxBytes / 1_000_000)} MB`,
    );
  }
}

export function validateUpload(input: {
  buffer: Buffer;
  contentType: string;
  kind: UploadKind;
}) {
  validateUploadMetadata({
    size: input.buffer.length,
    contentType: input.contentType,
    kind: input.kind,
  });
  if (!hasValidSignature(input.buffer, input.contentType)) {
    throw new Error("File contents do not match the selected file type");
  }
}

async function s3Client() {
  if (!storageConfigured()) throw new Error("S3 storage is not configured");
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: process.env.AWS_REGION || "eu-west-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function createS3UploadIntent(input: {
  filename: string;
  contentType: string;
  size: number;
  folder: string;
  kind: UploadKind;
}) {
  validateUploadMetadata(input);
  if (!storageConfigured()) {
    assertDurableStorageInProduction();
    return { mode: "multipart" as const };
  }
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${input.folder}/${randomUUID()}-${safeName}`;
  const uploadUrl = await getSignedUrl(
    await s3Client(),
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.size,
      Metadata: { "woosh-upload-kind": input.kind },
    }),
    { expiresIn: 600 },
  );
  return { mode: "s3" as const, key, uploadUrl, expiresIn: 600 };
}

export async function verifyS3Upload(input: {
  key: string;
  contentType: string;
  size: number;
  kind: UploadKind;
}) {
  validateUploadMetadata(input);
  if (!storageConfigured()) throw new Error("S3 storage is not configured");
  const { GetObjectCommand, HeadObjectCommand } = await import(
    "@aws-sdk/client-s3"
  );
  const client = await s3Client();
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: input.key,
    }),
  );
  if (head.ContentLength !== input.size || head.ContentType !== input.contentType) {
    throw new Error("Uploaded file metadata does not match the upload intent");
  }
  const range = await client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: input.key,
      Range: "bytes=0-15",
    }),
  );
  if (!range.Body) throw new Error("Uploaded file could not be verified");
  const signature = Buffer.from(await range.Body.transformToByteArray());
  if (!hasValidSignature(signature, input.contentType)) {
    throw new Error("File contents do not match the selected file type");
  }
}

/**
 * Store a deliverable file. Uses S3 when configured; otherwise local uploads/.
 * Returns a public URL path the app can serve or an S3 URL.
 */
export async function storeUpload(input: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<{ url: string; key: string; provider: "s3" | "local" }> {
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${input.folder ?? "deliverables"}/${randomUUID()}-${safeName}`;

  if (storageConfigured()) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = process.env.AWS_S3_BUCKET!;
    const region = process.env.AWS_REGION || "eu-west-1";
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      url: `${base}/api/uploads/${key}`,
      key,
      provider: "s3",
    };
  }

  assertDurableStorageInProduction();
  const full = path.join(LOCAL_UPLOAD_ROOT, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, input.buffer);
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return { url: `${base}/api/uploads/${key}`, key, provider: "local" };
}

export async function readLocalUpload(key: string) {
  const full = path.join(LOCAL_UPLOAD_ROOT, key);
  // Prevent path traversal
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(LOCAL_UPLOAD_ROOT))) {
    throw new Error("Invalid path");
  }
  return readFile(resolved);
}

export async function readUpload(key: string) {
  if (!storageConfigured()) {
    assertDurableStorageInProduction();
    return readLocalUpload(key);
  }
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: process.env.AWS_REGION || "eu-west-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const response = await client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    }),
  );
  if (!response.Body) throw new Error("Upload not found");
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function deleteUpload(key?: string | null) {
  if (!key) return;
  if (storageConfigured()) {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.AWS_REGION || "eu-west-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
    );
    return;
  }

  assertDurableStorageInProduction();
  const full = path.resolve(LOCAL_UPLOAD_ROOT, key);
  if (!full.startsWith(path.resolve(LOCAL_UPLOAD_ROOT))) {
    throw new Error("Invalid path");
  }
  await unlink(full).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}
