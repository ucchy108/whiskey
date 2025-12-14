import { NextRequest, NextResponse } from "next/server";
import { signUpFormSchema } from "@/app/(auth)/signup/components/SignUpForm/formSchema";
import { authService } from "@/services/AuthService";

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

    // サービス層を使用してビジネスロジックを実行
    const auth = await authService.signUp({
      email,
      password,
      name,
      age,
      weight,
      height,
    });

    return NextResponse.json(
      { message: "Success", user: auth.user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    console.error("SignUp error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
