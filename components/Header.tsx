import Link from "next/link";
import { SITE_NAME, waLink } from "@/lib/constants";
import { HouseIcon, WhatsAppIcon } from "./icons";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white">
            <HouseIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-900">{SITE_NAME}</span>
        </Link>

        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Chat with Us</span>
        </a>
      </div>
    </header>
  );
}
