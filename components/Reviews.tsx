import { connection } from "next/server";
import { getReviews } from "@/lib/reviews";
import { StarIcon } from "./icons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function Reviews({
  homestayId,
}: {
  homestayId: string;
}) {
  await connection();
  const reviews = await getReviews(homestayId);

  if (reviews.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-zinc-900">Guest reviews</h2>
        <p className="mt-3 text-sm text-zinc-500">
          No reviews yet. Stayed here? Ask the owner for a review link after
          your stay.
        </p>
      </section>
    );
  }

  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">Guest reviews</h2>
        <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-sm font-semibold text-orange-700">
          <StarIcon className="h-3.5 w-3.5" />
          {average.toFixed(1)}
        </span>
        <span className="text-sm text-zinc-500">
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="mt-5 space-y-5">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-xl border border-zinc-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                  {review.reviewerName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {review.reviewerName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "text-orange-500" : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.title && (
              <p className="mt-3 text-sm font-medium text-zinc-800">
                {review.title}
              </p>
            )}
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              {review.comment}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
