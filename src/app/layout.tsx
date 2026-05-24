import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kikoscope - 透视英语，精读进阶",
  description: "Kikoscope 是一个陪伴式英语精读工具，逐句拆解、生词沉淀、长难句透视，让你的英语学习有猫可循。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
