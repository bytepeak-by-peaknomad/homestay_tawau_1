import { connection } from "next/server";
import HomestayList from "@/components/HomestayList";
import { getHomestays } from "@/lib/homestays";
import { getAllReviewStats } from "@/lib/reviews";

export default async function Home() {
  await connection();
  const homestays = getHomestays();
  const stats = await getAllReviewStats();

  const withReviews = homestays.map((homestay) => {
    const s = stats[homestay.id] ?? { average: 0, count: 0 };
    return { ...homestay, rating: s.average, reviews: s.count };
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-orange-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-orange-100">
            Sabah, Malaysia
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Homestays in Tawau
          </h1>
          <p className="mt-3 max-w-xl text-orange-50">
            Explore our collection of {homestays.length} hand-picked homestays
            across Tawau — from town apartments to riverside retreats. Book
            directly by chatting with us on WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <HomestayList homestays={withReviews} />
      </section>
    </div>
  );
}
