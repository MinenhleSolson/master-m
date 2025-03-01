import type { Metadata } from "next";
import { Libre_Baskerville, Raleway } from "next/font/google";
import "./globals.css";
import "@/styles/player.scss";

const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"] });
const raleway = Raleway({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Master M",
  description: "Master M's Personal Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       className={`${libreBaskerville.className} ${raleway.className}`}>
      
        {children}
      </body>
    </html>
  );
}
