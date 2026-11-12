import type { Metadata } from "next";
import "../styles/sistema.css";

export const metadata: Metadata = {
  title: {
    template: "%s · Sistema del Club Domingo Matheu",
    default: "Sistema del Club Domingo Matheu",
  },
  robots: { index: false, follow: false },
};

export default function SistemaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="sys">{children}</div>;
}
