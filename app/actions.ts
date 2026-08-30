"use server";

import { revalidatePath } from "next/cache";
import { submitReview } from "@/lib/reviews";

export interface ReviewFormState {
  status: "idle" | "error" | "success";
  message?: string;
}

export async function submitReviewAction(
  homestayId: string,
  token: string,
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const rating = Number(formData.get("rating") ?? 0);
  const reviewerName = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || undefined;
  const comment = String(formData.get("comment") ?? "").trim();

  const result = await submitReview({
    token,
    homestayId,
    rating,
    reviewerName,
    title,
    comment,
  });

  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(`/homestays/${homestayId}`);
  return { status: "success", message: "Thanks for your review!" };
}
