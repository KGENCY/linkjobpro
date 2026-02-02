import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-7 업무 지원 툴",
  description: "E-7 비자 행정사 업무 지원 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}