import { SITE_NAME, waLink } from "@/lib/constants";
import { HouseIcon, WhatsAppIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
                <HouseIcon className="h-4 w-4" />
              </span>
              <span className="text-base font-bold tracking-tight text-zinc-900">{SITE_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Hand-picked homestays across Tawau, Sabah. Book directly with the
              owner on WhatsApp — no booking fees.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-zinc-900">Contact</p>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-medium text-green-700 transition hover:text-green-800"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <p className="mt-1 text-zinc-500">Tawau, Sabah, Malaysia</p>
          </div>
        </div>

        <p className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} Developed by BytePeak, a sub of PeakNomad. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
