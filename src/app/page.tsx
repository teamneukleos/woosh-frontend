import { Surface } from "@/components/surface";
import { HomeExperience } from "@/components/marketing/home-experience";
import { defaultDescription, defaultTitle, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: defaultTitle,
  description: defaultDescription,
  path: "/",
});

export default function Home() {
  return (
    <Surface name="marketing">
      <HomeExperience />
    </Surface>
  );
}
