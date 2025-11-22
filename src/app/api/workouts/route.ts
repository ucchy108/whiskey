import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        Detail: {
          include: {
            Exercise: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(
      { message: "Success", workouts: workouts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { name, type, duration, date } = await request.json();

  // 新しいワークアウトを作成
  const newWorkout = {
    id: Date.now().toString(),
    name,
    type,
    duration,
    date,
  };

  // TODO: 保存処理を実装する
  console.log("New workout created:", newWorkout);

  return new Response(JSON.stringify(newWorkout), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
