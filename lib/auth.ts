import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";

export type AnonymousUser = {
  id: number;
  anonToken: string;
  displayName: string;
};

const COOKIE_NAME = "anon_token";

function randomGuestName() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `Guest${n}`;
}

export async function getOrCreateAnonymousUser(): Promise<AnonymousUser> {
  const cookieStore = await cookies();
  let anonToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!anonToken) {
    anonToken = randomUUID();
  }

  const [rows] = await db.query(
    `
      SELECT id, anon_token, display_name
      FROM users
      WHERE anon_token = ?
      LIMIT 1
    `,
    [anonToken]
  );

  const existing = Array.isArray(rows) ? (rows[0] as any) : null;

  if (existing) {
    if (!cookieStore.get(COOKIE_NAME)?.value) {
      cookieStore.set(COOKIE_NAME, anonToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return {
      id: Number(existing.id),
      anonToken: existing.anon_token,
      displayName: existing.display_name,
    };
  }

  const displayName = randomGuestName();

  const [result] = await db.execute(
    `
      INSERT INTO users (anon_token, display_name)
      VALUES (?, ?)
    `,
    [anonToken, displayName]
  );

  const insertId = (result as any).insertId;

  cookieStore.set(COOKIE_NAME, anonToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return {
    id: Number(insertId),
    anonToken,
    displayName,
  };
}