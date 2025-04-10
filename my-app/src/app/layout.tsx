import type { Metadata } from "next";
import { Container } from "@mui/material";
import { NavigationBar } from "@/app/_components";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationBar />
        <Container maxWidth="md">{children}</Container>
      </body>
    </html>
  );
}
