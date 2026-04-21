import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateAnonymousUser } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: Params) {
  const currentUser = await getOrCreateAnonymousUser();
  const { id } = await params;
  const opinionId = Number(id);

  if (!Number.isInteger(opinionId) || opinionId <= 0) {
    return NextResponse.json({ error: "Invalid opinion id." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const reaction = body?.reaction;

  if (reaction !== "like" && reaction !== "dislike") {
    return NextResponse.json(
      { error: "Reaction must be 'like' or 'dislike'." },
      { status: 400 }
    );
  }

  const [opinionRows] = await db.query(
    `
      SELECT id
      FROM opinions
      WHERE id = ?
      LIMIT 1
    `,
    [opinionId]
  );

  if (!Array.isArray(opinionRows) || opinionRows.length === 0) {
    return NextResponse.json({ error: "Opinion not found." }, { status: 404 });
  }

  await db.execute(
    `
      INSERT INTO opinion_reactions (opinion_id, user_id, reaction)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        reaction = VALUES(reaction),
        created_at = CURRENT_TIMESTAMP
    `,
    [opinionId, currentUser.id, reaction]
  );

  return NextResponse.json({ success: true });
}