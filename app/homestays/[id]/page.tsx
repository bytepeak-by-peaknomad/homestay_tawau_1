import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import {
  CheckIcon,
  ChevronLeftIcon,
  PinIcon,
  StarIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { formatPrice, ratingLabel, waLink } from "@/lib/constants";
import { getHomestays } from "@/lib/homestays";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getHomestays().map((homestay) => ({ id: homestay.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const homestay = getHomestays().find((h) => h.id === id);
  if (!homestay) return { title: "Homestay not found" };
  return {
    title: homestay.name,
    description: homestay.description,
  };
}

export default async function HomestayDetailPage({ params }: Props) {
  const { id } = await params;
  const homestay = getHomestays().find((h) => h.id === id);
  if (!homestay) notFound();

  const facts = [
    { label: "Guests", value: homestay.maxGuests },
    { label: "Bedrooms", value: homestay.bedrooms },
    { label: "Beds", value: homestay.beds },
    { label: "Bathrooms", value: homestay.bathrooms },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-orange-600"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to all homestays
      </Link>

      <header className="mt-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          {homestay.area} &middot; Tawau, Sabah
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {homestay.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
            <StarIcon className="h-4 w-4" />
            {homestay.rating.toFixed(1)}
          </span>
          <span className="text-zinc-600">
            {ratingLabel(homestay.rating)} &middot; {homestay.reviews} reviews
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500">
            <PinIcon className="h-4 w-4 text-zinc-400" />
            {homestay.address}
          </span>
        </div>
      </header>

      <div className="mt-6">
        <ImageGallery images={homestay.images} name={homestay.name} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">
              About this homestay
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              {homestay.description}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">
              What this place offers
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-xl bg-zinc-50 px-4 py-4 text-center">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-zinc-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Amenities</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {homestay.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm text-zinc-700"
                >
                  <CheckIcon className="h-4 w-4 text-orange-600" />
                  {amenity}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm text-zinc-500">From</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {formatPrice(homestay.price)}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              for up to {homestay.maxGuests} guests
            </p>

            <a
              href={waLink(homestay.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Enquire on WhatsApp
            </a>

            <p className="mt-3 text-center text-xs text-zinc-400">
              Direct chat with the owner &middot; No booking fee
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
