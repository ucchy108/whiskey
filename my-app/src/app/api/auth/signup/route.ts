import { NextRequest, NextResponse } from "next/server";
import { signUpFormSchema } from "@/app/(auth)/signup/components/SignUpForm/formSchema";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedCredentials = signUpFormSchema.safeParse(body);

    if (!parsedCredentials.success) {
      console.error("Validation error:", parsedCredentials.error.message);
      return NextResponse.json({ error: "Invalid SignUp" }, { status: 400 });
    }

    const { email, password, name, age, weight, height } =
      parsedCredentials.data;
    const passwordHash = await hash(password, 12);

    const existingUser = await prisma.auth.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const auth = await prisma.auth.create({
      data: {
        email: email,
        password: passwordHash,
        user: {
          create: {
            name: name,
            age: age,
            weight: weight,
            height: height,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      { message: "Success", user: auth.user },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
