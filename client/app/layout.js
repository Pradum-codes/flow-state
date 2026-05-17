import "./globals.css";
import { Roboto_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "FlowState",
  description: "Developer-centric productivity and execution dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${robotoMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
