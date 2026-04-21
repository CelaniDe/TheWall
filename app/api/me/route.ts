import { NextResponse } from "next/server";
import { getOrCreateAnonymousUser } from "@/lib/auth";

export async function GET() {
  const user = await getOrCreateAnonymousUser();

  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.displayName,
    },
  });
}