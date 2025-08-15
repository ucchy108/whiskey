import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RequestParams = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RequestParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        Detail: {
          include: {
            Exercise: true,
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(workout, { status: 200 });
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
