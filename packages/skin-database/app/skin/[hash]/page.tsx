import App from "../../App";
import type { Metadata } from "next";
import { generateSkinPageMetadata } from "./skinMetadata";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { hash } = await params;
  return generateSkinPageMetadata(hash);
}

export default function Page() {
  return <App />;
}
