import AdminPanel from "@/components/AdminPanel";
import { getHomestays } from "@/lib/homestays";

export default function AdminPage() {
  const homestays = getHomestays().map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Issue review links
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Generate one-time review links to send to guests who have stayed with
        you. Each link can only be used once.
      </p>
      <div className="mt-6">
        <AdminPanel homestays={homestays} />
      </div>
    </div>
  );
}
