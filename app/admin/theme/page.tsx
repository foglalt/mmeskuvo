"use client";

import { useState, useEffect } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Save } from "lucide-react";
import type { ThemeConfig } from "@/types/content";

const fontOptions = [
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Lora",
  "Merriweather",
  "Crimson Text",
  "Libre Baskerville",
];

export default function EditThemePage() {
  const [theme, setTheme] = useState<ThemeConfig>({
    primary: "#d4a574",
    secondary: "#f5f0e8",
    accent: "#8b7355",
    fontHeading: "Playfair Display",
    fontBody: "Lora",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.theme) {
          setTheme(data.theme);
        }
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-900">Téma beállítások</h1>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Mentve!" : "Mentés"}
        </Button>
      </div>

      {/* Colors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Színek</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elsődleges szín (Primary)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={theme.primary}
                onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <Input
                value={theme.primary}
                onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                placeholder="#d4a574"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Másodlagos szín (Secondary)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={theme.secondary}
                onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <Input
                value={theme.secondary}
                onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
                placeholder="#f5f0e8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kiemelő szín (Accent)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={theme.accent}
                onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <Input
                value={theme.accent}
                onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                placeholder="#8b7355"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fonts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Betűtípusok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Címsor betűtípus
            </label>
            <select
              value={theme.fontHeading}
              onChange={(e) => setTheme({ ...theme, fontHeading: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Szövegtörzs betűtípus
            </label>
            <select
              value={theme.fontBody}
              onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Előnézet</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: theme.secondary }}
          >
            <h2
              className="text-2xl mb-2"
              style={{
                color: theme.primary,
                fontFamily: theme.fontHeading,
              }}
            >
              Minta címsor
            </h2>
            <p
              style={{
                fontFamily: theme.fontBody,
              }}
            >
              Ez egy minta szöveg, ami bemutatja a kiválasztott betűtípusokat és
              színeket.{" "}
              <span style={{ color: theme.accent, fontWeight: 600 }}>
                Kiemelő szín
              </span>{" "}
              a linkekhez.
            </p>
            <button
              className="mt-4 px-4 py-2 rounded text-white"
              style={{ backgroundColor: theme.primary }}
            >
              Minta gomb
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
