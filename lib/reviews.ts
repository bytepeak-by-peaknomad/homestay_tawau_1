import { randomBytes, randomUUID } from "node:crypto";
import { ensureSchema, getSql } from "@/lib/db";
import { getHomestays } from "@/lib/homestays";
import type { Review } from "@/types/review";

export interface SubmitReviewInput {
  token: string;
  homestayId: string;
  rating: number;
  title?: string;
  comment: string;
  reviewerName: string;
}

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

function isKnownHomestay(homestayId: string): boolean {
  return getHomestays().some((h) => h.id === homestayId);
}

export async function issueTokens(
  homestayId: string,
  count: number,
): Promise<string[]> {
  if (!isKnownHomestay(homestayId)) {
    throw new Error("Unknown homestay id");
  }

  await ensureSchema();
  const tokens = Array.from({ length: count }, generateToken);
  const s = getSql();
  await s.transaction(
    tokens.map(
      (t) => s`INSERT INTO review_tokens (token, homestay_id) VALUES (${t}, ${homestayId})`,
    ),
  );
  return tokens;
}

export async function tokenIsValid(
  token: string,
  homestayId: string,
): Promise<boolean> {
  await ensureSchema();
  const s = getSql();
  const rows = await s`SELECT token FROM review_tokens WHERE token = ${token} AND homestay_id = ${homestayId} AND used_at IS NULL`;
  return rows.length > 0;
}

export async function submitReview(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  const { token, homestayId, rating, title, comment, reviewerName } = input;

  if (!isKnownHomestay(homestayId)) {
    return { ok: false, error: "Unknown homestay." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Please select a rating from 1 to 5." };
  }
  if (!reviewerName) {
    return { ok: false, error: "Please tell us your name." };
  }
  if (!comment) {
    return { ok: false, error: "Please write a short review." };
  }

  await ensureSchema();
  const s = getSql();
  const id = randomUUID();

  const rows = await s`
    WITH consumed AS (
      UPDATE review_tokens
      SET used_at = now()
      WHERE token = ${token} AND homestay_id = ${homestayId} AND used_at IS NULL
      RETURNING token
    )
    INSERT INTO reviews (id, homestay_id, rating, title, comment, reviewer_name)
    SELECT ${id}, ${homestayId}, ${rating}, ${title ?? null}, ${comment}, ${reviewerName}
    WHERE EXISTS (SELECT 1 FROM consumed)
    RETURNING id
  `;

  if (rows.length === 0) {
    return {
      ok: false,
      error: "This review link is invalid or has already been used.",
    };
  }

  return { ok: true };
}

export interface ReviewStats {
  average: number;
  count: number;
}

interface StatsRow {
  average: number | string;
  count: number | string;
}

export async function getReviewStats(homestayId: string): Promise<ReviewStats> {
  await ensureSchema();
  const s = getSql();
  const rows = (await s`
    SELECT COALESCE(AVG(rating), 0) AS average, COUNT(*) AS count
    FROM reviews
    WHERE homestay_id = ${homestayId}
  `) as StatsRow[];

  const row = rows[0];
  return {
    average: Number(row?.average ?? 0),
    count: Number(row?.count ?? 0),
  };
}

interface AllStatsRow extends StatsRow {
  homestay_id: string;
}

export async function getAllReviewStats(): Promise<Record<string, ReviewStats>> {
  await ensureSchema();
  const s = getSql();
  const rows = (await s`
    SELECT homestay_id, AVG(rating) AS average, COUNT(*) AS count
    FROM reviews
    GROUP BY homestay_id
  `) as AllStatsRow[];

  const stats: Record<string, ReviewStats> = {};
  for (const row of rows) {
    stats[row.homestay_id] = {
      average: Number(row.average),
      count: Number(row.count),
    };
  }
  return stats;
}

interface ReviewRow {
  id: string;
  homestay_id: string;
  rating: number;
  title: string | null;
  comment: string;
  reviewer_name: string;
  created_at: string | Date;
}

export async function getReviews(homestayId: string): Promise<Review[]> {
  await ensureSchema();
  const s = getSql();
  const rows = (await s`
    SELECT id, homestay_id, rating, title, comment, reviewer_name, created_at
    FROM reviews
    WHERE homestay_id = ${homestayId}
    ORDER BY created_at DESC
  `) as ReviewRow[];

  return rows.map((r) => ({
    id: r.id,
    homestayId: r.homestay_id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    reviewerName: r.reviewer_name,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}
