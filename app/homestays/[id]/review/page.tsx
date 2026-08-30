import Link from "next/link";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import { ChevronLeftIcon } from "@/components/icons";
import { getHomestays } from "@/lib/homestays";
import { tokenIsValid } from "@/lib/reviews";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ReviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;

  const homestay = getHomestays().find((h) => h.id === id);
  if (!homestay) notFound();

  const valid =
    typeof token === "string" && token.length > 0 && (await tokenIsValid(token, id));

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href={`/homestays/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-orange-600"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to {homestay.name}
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
        Review your stay
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        You stayed at {homestay.name} in {homestay.area}, Tawau.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        {valid ? (
          <ReviewForm homestayId={id} token={token} />
        ) : (
          <p className="text-sm text-zinc-600">
            This review link is invalid or has already been used. If you believe
            this is a mistake, please contact the owner on WhatsApp for a new
            link.
          </p>
        )}
      </div>
    </div>
  );
}
