import { prisma } from "@/src/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const earnings = await prisma.earning.findMany();

  return NextResponse.json(earnings);
}
