"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/", label: "首页" },
    { path: "/import", label: "交给Kiki" },
    { path: "/ielts-flashcards", label: "词汇闪卡" },
    { path: "/vocabulary", label: "我的词库" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#EEDDCC] h-14 flex items-center justify-between px-8">
      <Link href="/" className="sf font-bold text-[#8B5E3C] text-lg">
        Kikoscope 🐾
      </Link>
      <nav className="flex space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`nv ${isActive(item.path) ? "a" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}