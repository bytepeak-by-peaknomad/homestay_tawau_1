"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { formatPrice, ratingLabel } from "@/lib/constants";
import type { Homestay } from "@/types/homestay";
import { ChevronLeftIcon, ChevronRightIcon, PinIcon, StarIcon } from "./icons";

function CardGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (delta: number) =>
    setIndex((i) => Math.min(Math.max(i + delta, 0), images.length - 1));

  return (
    <div
      className="group/card relative h-full w-full touch-pan-y overflow-hidden bg-zinc-100"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx < -40) go(1);
        else if (dx > 40) go(-1);
      }}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === index ? `${name} photo ${i + 1}` : ""}
          fill
          sizes="(min-width: 768px) 320px, 100vw"
          className={`object-cover transition-all duration-300 group-hover/card:scale-105 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {index > 0 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 z-10 flex h-10 w-10 touch-manipulation -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow transition hover:bg-white active:scale-95"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}
      {index < images.length - 1 && (
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 z-10 flex h-10 w-10 touch-manipulation -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow transition hover:bg-white active:scale-95"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}

      <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {images.length} photos
      </span>

      {images.length > 1 && (
        <div className="absolute bottom-2.5 right-2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomestayListItem({ homestay }: { homestay: Homestay }) {
  const detailUrl = `/homestays/${homestay.id}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 transition hover:shadow-lg md:flex-row">
      <div className="relative h-56 w-full shrink-0 md:h-60 md:w-80">
        <CardGallery images={homestay.images} name={homestay.name} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          {homestay.area} &middot; Tawau, Sabah
        </p>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-sm font-semibold text-orange-700">
            <StarIcon className="h-3.5 w-3.5" />
            {homestay.reviews === 0 ? "0" : homestay.rating.toFixed(1)}
          </span>
          <span className="text-sm text-zinc-600">
            {homestay.reviews === 0
              ? "No reviews yet"
              : `${ratingLabel(homestay.rating)} · ${homestay.reviews} ${
                  homestay.reviews === 1 ? "review" : "reviews"
                }`}
          </span>
        </div>

        <Link
          href={detailUrl}
          className="text-lg font-semibold text-zinc-900 transition hover:text-orange-600"
        >
          {homestay.name}
        </Link>

        <p className="flex items-start gap-1.5 text-sm text-zinc-500">
          <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          <span>{homestay.address}</span>
        </p>

        <p className="line-clamp-2 text-sm text-zinc-500">{homestay.description}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {homestay.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-4 border-t border-zinc-100 p-5 md:w-56 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:p-6">
        <div>
          <p className="text-xs text-zinc-500">From</p>
          <p className="text-xl font-bold text-zinc-900">{formatPrice(homestay.price)}</p>
        </div>
        <Link
          href={detailUrl}
          className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
