import type { Metadata } from "next";
import { FEEDBACK_METADATA } from "../../museumMetadata";

// The classic app shows this page itself, client side.
export const metadata: Metadata = FEEDBACK_METADATA;

export default function Page() {
  return null;
}
