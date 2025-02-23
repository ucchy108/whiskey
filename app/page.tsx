import { prisma } from "@/lib/prisma/prisma";
import { Typography } from "@mui/material";
import { Earning } from "@prisma/client";

export default async function Home() {
  const earnings = await prisma.earning.findMany();

  return (
    <div>
      <Typography variant="h1">Test</Typography>
      {earnings.map((earning: Earning) => (
        <Typography key={earning.id}>{earning.amount}</Typography>
      ))}
    </div>
  );
}
