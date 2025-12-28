"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Image,
  FileText,
  Heart,
  Users,
  Mail,
  Palette,
  Languages,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/hero", label: "Hero / Meghívó", icon: Image },
  { href: "/admin/info", label: "Információk", icon: FileText },
  { href: "/admin/support", label: "Támogatás", icon: Heart },
  { href: "/admin/about", label: "Rólunk", icon: Users },
  { href: "/admin/rsvp", label: "Visszajelzések", icon: Mail },
  { href: "/admin/theme", label: "Téma / Színek", icon: Palette },
  { href: "/admin/translations", label: "Fordítások", icon: Languages },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="font-serif text-xl">Esküvő Admin</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-3"
        >
          <Home className="h-4 w-4" />
          Oldal megtekintése
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 w-full"
        >
          <LogOut className="h-4 w-4" />
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}
