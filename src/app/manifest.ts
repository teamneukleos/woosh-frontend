import type { MetadataRoute } from "next";
import { defaultDescription } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Woosh",
    short_name: "Woosh",
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#003AF4",
    icons: [
      {
        src: "/brand/app-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
