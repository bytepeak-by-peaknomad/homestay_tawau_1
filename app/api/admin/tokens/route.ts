import { issueTokens } from "@/lib/reviews";
import { getHomestays } from "@/lib/homestays";

export async function POST(request: Request) {
  let body: { secret?: string; homestayId?: string; count?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { secret, homestayId, count } = body;

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || secret !== adminSecret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (
    typeof homestayId !== "string" ||
    !getHomestays().some((h) => h.id === homestayId)
  ) {
    return Response.json({ error: "Unknown homestay." }, { status: 400 });
  }

  const n = Math.floor(Number(count));
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    return Response.json(
      { error: "Count must be a whole number between 1 and 100." },
      { status: 400 },
    );
  }

  try {
    const tokens = await issueTokens(homestayId, n);
    return Response.json({ homestayId, tokens });
  } catch {
    return Response.json(
      { error: "Failed to issue review links. Check DATABASE_URL." },
      { status: 500 },
    );
  }
}
