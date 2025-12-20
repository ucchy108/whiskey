import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 全ての運動種目を取得
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      { message: "Success", exercises },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
