"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export default function ImageGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const showNav = images.length > 1;

  const go = (delta: number) =>
    setIndex((i) => Math.min(Math.max(i + delta, 0), images.length - 1));

  return (
    <div>
      <div
        className="relative aspect-[16/9] w-full touch-pan-y overflow-hidden rounded-2xl bg-zinc-100"
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
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-300 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {showNav && index > 0 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 touch-manipulation -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow transition hover:bg-white active:scale-95"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        {showNav && index < images.length - 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 touch-manipulation -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow transition hover:bg-white active:scale-95"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        )}

        {showNav && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {index + 1} / {images.length}
          </span>
        )}
      </div>

      {showNav && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg transition ${
                i === index
                  ? "ring-2 ring-orange-600"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
