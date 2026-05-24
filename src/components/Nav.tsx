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
    { path: "/footprint", label: "我的足迹" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#EEDDCC] h-14 flex items-center justify-between px-8">
      <Link href="/" className="sf flex items-center gap-1.5 text-lg font-bold text-[#8B5E3C]">
        <span>Kikoscope</span>
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="shrink-0"
        >
          <ellipse cx="6.2" cy="6" rx="1.8" ry="2.4" stroke="#8B5E3C" strokeWidth="1.5" />
          <ellipse cx="10" cy="4.8" rx="1.8" ry="2.4" stroke="#8B5E3C" strokeWidth="1.5" />
          <ellipse cx="13.8" cy="6" rx="1.8" ry="2.4" stroke="#8B5E3C" strokeWidth="1.5" />
          <ellipse cx="4.8" cy="10" rx="1.6" ry="2.1" stroke="#8B5E3C" strokeWidth="1.5" />
          <path
            d="M7.2 11.2c.8-1.7 4.8-1.7 5.6 0 .5 1.1 1.7 1.6 1.9 3 .2 1.8-1.4 2.8-3.1 2.1a4.2 4.2 0 0 0-3.2 0c-1.7.7-3.3-.3-3.1-2.1.2-1.4 1.4-1.9 1.9-3Z"
            stroke="#8B5E3C"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <nav className="flex space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`border-b-2 py-1 text-sm transition-colors ${
              isActive(item.path)
                ? "border-[#8B5E3C] text-[#8B5E3C]"
                : "border-transparent text-[#8D7B6B] hover:text-[#8B5E3C]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
