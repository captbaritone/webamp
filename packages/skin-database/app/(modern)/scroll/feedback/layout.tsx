import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FEEDBACK_METADATA } from "../../../museumMetadata";

// The page is a client component, which can't export metadata.
export const metadata: Metadata = FEEDBACK_METADATA;

export default function FeedbackLayout({ children }: { children: ReactNode }) {
  return children;
}
