import { prisma } from ".";
import { hash } from "bcrypt";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      age: 30,
      weight: 70,
      height: 175,
    },
  });

  const password = await hash("password", 12);
  const auth = await prisma.auth.create({
    data: {
      email: "test@example.com",
      password: password,
      userId: user.id,
    },
  });

  console.log(user, auth);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
