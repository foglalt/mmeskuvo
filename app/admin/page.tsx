"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Users, Mail, FileText, Palette } from "lucide-react";
import Link from "next/link";
import type { RsvpSubmission } from "@/types/content";

export default function AdminDashboard() {
  const [rsvpCount, setRsvpCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rsvp", {
      headers: { Authorization: `Bearer ${document.cookie.split("=")[1]}` },
    })
      .then((res) => res.json())
      .then((data: RsvpSubmission[]) => {
        if (Array.isArray(data)) {
          setRsvpCount(data.length);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    {
      href: "/admin/hero",
      label: "Meghívó szerkesztése",
      icon: FileText,
      description: "Meghívó kép és kezdőlap",
    },
    {
      href: "/admin/info",
      label: "Információk",
      icon: FileText,
      description: "Esküvői részletek",
    },
    {
      href: "/admin/rsvp",
      label: "Visszajelzések",
      icon: Mail,
      description: `${rsvpCount} visszajelzés`,
    },
    {
      href: "/admin/theme",
      label: "Téma beállítások",
      icon: Palette,
      description: "Színek és betűtípusok",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif text-gray-900 mb-8">
        Üdvözöljük az Admin felületen
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Visszajelzések</p>
              <p className="text-2xl font-semibold">
                {loading ? "..." : rsvpCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Gyors műveletek
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{link.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
