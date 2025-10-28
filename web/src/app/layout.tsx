import "../styles/global.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rubber MES Dashboard",
  description: "Web-based MES for Rubber Manufacturing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("bg-gray-50 text-gray-900", inter.className)}>
        {children}
      </body>
    </html>
  );
}
