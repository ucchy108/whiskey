import { Typography } from "@mui/material";
import { auth } from "../lib/auth";

async function Home() {
  const session = await auth();

  return (
    <>
      <Typography variant="h3">Test</Typography>
      <p>{JSON.stringify(session, null, 2)}</p>
    </>
  );
}

export default Home;
