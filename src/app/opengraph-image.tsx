import { ImageResponse } from "next/og";

export const alt = "Woosh — The creator marketplace Naija always needed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(125deg, #091B68 0%, #003AF4 62%, #0DE3AF 145%)",
          padding: 72,
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Woosh
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            The creator
            <br />
            Marketplace Naija
            <br />
            always needed.
          </div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
            Discover · run campaigns · get paid
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
