"use client";

import { useMemo, useState } from "react";
import type { Homestay } from "@/types/homestay";
import HomestayListItem from "./HomestayListItem";
import { SearchIcon } from "./icons";

type SortKey = "recommended" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
];

export default function HomestayList({ homestays }: { homestays: Homestay[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? homestays.filter((h) =>
          [h.name, h.address, h.area].some((field) =>
            field.toLowerCase().includes(q)
          )
        )
      : [...homestays];

    switch (sort) {
      case "price-asc":
        matched.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        matched.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        matched.sort((a, b) => b.rating - a.rating);
        break;
    }
    return matched;
  }, [homestays, query, sort]);

  return (
    <div>
      <div className="relative z-10 -mt-10 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-zinc-200">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search homestays in Tawau..."
            className="w-full rounded-xl border-0 bg-zinc-50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none ring-1 ring-transparent transition placeholder:text-zinc-400 focus:bg-white focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          {filtered.length} {filtered.length === 1 ? "stay" : "stays"} in Tawau
        </p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setSort(option.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                sort === option.key
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {filtered.map((homestay) => (
          <HomestayListItem key={homestay.id} homestay={homestay} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-zinc-500 ring-1 ring-zinc-200">
            No homestays match your search. Try a different name or area.
          </p>
        )}
      </div>
    </div>
  );
}
