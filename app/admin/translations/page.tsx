"use client";

import { useState, useEffect } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Save } from "lucide-react";

type TranslationMap = Record<string, string>;

export default function EditTranslationsPage() {
  const [translations, setTranslations] = useState<{ hu: TranslationMap; en: TranslationMap }>({
    hu: {},
    en: {},
  });
  const [activeTab, setActiveTab] = useState<"hu" | "en">("hu");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/translations")
      .then((r) => r.json())
      .then((data) => {
        if (data?.hu && data?.en) {
          setTranslations({ hu: data.hu, en: data.en });
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translations),
      });
      if (!res.ok) {
        throw new Error("Failed to save translations");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateValue = (key: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value,
      },
    }));
  };

  const currentTranslations = translations[activeTab];
  const groupedKeys = Object.keys(currentTranslations)
    .sort()
    .reduce<Record<string, string[]>>((acc, key) => {
      const group = key.split(".")[0] || "general";
      if (!acc[group]) acc[group] = [];
      acc[group].push(key);
      return acc;
    }, {});

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-900">Fordítások</h1>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setActiveTab("hu")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "hu"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Magyar
            </button>
            <button
              onClick={() => setActiveTab("en")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "en"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              English
            </button>
          </div>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Mentve!" : "Mentés"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedKeys).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-gray-500">
              No translations loaded yet.
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedKeys).map(([group, keys]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="capitalize">{group}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {keys.map((key) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-start">
                      <label className="text-sm font-medium text-gray-600 py-2">
                        {key}
                      </label>
                      <div className="col-span-2">
                        <Input
                          value={currentTranslations[key]}
                          onChange={(e) => updateValue(key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

