import { signInFormSchema } from "@/app/(auth)/signin/components/SignInForm/formSchema";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedCredentials = signInFormSchema.safeParse(body);

    if (!parsedCredentials.success) {
      console.error("Validation error:", parsedCredentials.error.message);
      return NextResponse.json({ error: "Invalid SignIn" }, { status: 400 });
    }

    const { email, password } = parsedCredentials.data;
    const auth = await prisma.auth.findUnique({
      where: { email },
      include: {
        user: true,
      },
    });

    const isPasswordValid = await bcrypt.compare(
      password,
      auth?.password || ""
    );
    if (!isPasswordValid || !auth?.user) {
      return NextResponse.json({ error: "Invalid SignIn" }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Success", user: auth.user },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
