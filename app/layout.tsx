import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:"Miobzou — AI Revenue Operating System",
  description:"AI-powered prospecting, qualification and human handoff for web agencies."
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="fr"><body>{children}</body></html>;
}
