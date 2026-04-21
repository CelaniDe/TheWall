import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateAnonymousUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getOrCreateAnonymousUser();

  const [rows] = await db.query(
    `
      SELECT
        o.id,
        o.content,
        o.created_at,
        u.display_name,
        COALESCE(SUM(CASE WHEN r.reaction = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN r.reaction = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes,
        MAX(CASE WHEN r.user_id = ? THEN r.reaction ELSE NULL END) AS my_reaction
      FROM opinions o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN opinion_reactions r ON r.opinion_id = o.id
      GROUP BY o.id, o.content, o.created_at, u.display_name
      ORDER BY o.created_at DESC
    `,
    [currentUser.id]
  );

  return NextResponse.json({ opinions: rows });
}

export async function POST(req: NextRequest) {
  const currentUser = await getOrCreateAnonymousUser();
  const body = await req.json().catch(() => null);

  const content = body?.content?.trim();

  if (!content || content.length < 2) {
    return NextResponse.json(
      { error: "Opinion must be at least 2 characters." },
      { status: 400 }
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Opinion must be 500 characters or less." },
      { status: 400 }
    );
  }

  const [result] = await db.execute(
    `
      INSERT INTO opinions (user_id, content)
      VALUES (?, ?)
    `,
    [currentUser.id, content]
  );

  return NextResponse.json(
    {
      success: true,
      opinionId: (result as any).insertId,
    },
    { status: 201 }
  );
}