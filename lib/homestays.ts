import homestaysData from "@/data/homestays.json";
import type { Homestay } from "@/types/homestay";

export function getHomestays(): Homestay[] {
  return homestaysData as Homestay[];
}
