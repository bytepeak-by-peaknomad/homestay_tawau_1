import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let sql: Sql | null = null;

export function getSql(): Sql {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add your Neon Postgres connection string to .env.local and to your Vercel project environment variables.",
      );
    }
    sql = neon(url);
  }
  return sql;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const s = getSql();
    schemaReady = s
      .transaction([
        s`CREATE TABLE IF NOT EXISTS review_tokens (
          token text PRIMARY KEY,
          homestay_id text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          used_at timestamptz
        )`,
        s`CREATE TABLE IF NOT EXISTS reviews (
          id text PRIMARY KEY,
          homestay_id text NOT NULL,
          rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
          title text,
          comment text NOT NULL,
          reviewer_name text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )`,
      ])
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}
