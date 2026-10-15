import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shown to the left of each skin's title in the feed.
export default function BackToGrid() {
  return (
    <Link
      href="/"
      className="skin-back"
      aria-label="Back to grid"
      title="Back to grid"
    >
      <ArrowLeft size={22} aria-hidden />
    </Link>
  );
}
