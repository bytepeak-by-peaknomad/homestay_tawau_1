"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ReviewFormState } from "@/app/actions";
import { StarIcon } from "./icons";

const initialState: ReviewFormState = { status: "idle" };

export default function ReviewForm({
  homestayId,
  token,
}: {
  homestayId: string;
  token: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitReviewAction.bind(null, homestayId, token),
    initialState,
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.status === "success") {
    return (
      <div className="rounded-xl bg-green-50 p-6 ring-1 ring-green-200">
        <p className="font-semibold text-green-800">{state.message}</p>
        <p className="mt-2 text-sm text-green-700">
          Your review is now live on the homestay page.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="rating" value={rating} />

      <div>
        <span className="block text-sm font-medium text-zinc-700">
          Your rating
        </span>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              className="text-zinc-300 transition hover:text-orange-500"
            >
              <StarIcon
                className={`h-7 w-7 ${
                  value <= (hover || rating) ? "text-orange-500" : ""
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-700"
        >
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={60}
          placeholder="e.g. Ahmad"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-700"
        >
          Headline (optional)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={80}
          placeholder="Sum up your stay in a few words"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-zinc-700"
        >
          Your review
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          maxLength={1000}
          rows={4}
          placeholder="Tell others what you liked about your stay"
          className={inputClass}
        />
      </div>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
