"use client";

import { useState, useEffect } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Save } from "lucide-react";

type TranslationDict = Record<string, Record<string, string>>;

export default function EditTranslationsPage() {
  const [translations, setTranslations] = useState<{ hu: TranslationDict; en: TranslationDict }>({
    hu: {},
    en: {},
  });
  const [activeTab, setActiveTab] = useState<"hu" | "en">("hu");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load translations from files
    Promise.all([
      fetch("/content/translations/hu.json").then((r) => r.json()),
      fetch("/content/translations/en.json").then((r) => r.json()),
    ]).then(([hu, en]) => {
      setTranslations({ hu, en });
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      // Note: In production, you would create an API route to save translations
      // For now, translations are static JSON files
      console.log("Translations to save:", translations);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateValue = (section: string, key: string, value: string) => {
    setTranslations({
      ...translations,
      [activeTab]: {
        ...translations[activeTab],
        [section]: {
          ...(translations[activeTab][section] || {}),
          [key]: value,
        },
      },
    });
  };

  const currentTranslations = translations[activeTab];

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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Megjegyzés:</strong> A fordítások jelenleg statikus JSON fájlokban vannak tárolva.
          A módosításokhoz manuálisan kell szerkeszteni a <code>/content/translations/</code> mappában lévő fájlokat.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(currentTranslations).map(([section, values]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="capitalize">{section}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(values as Record<string, string>).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-600 py-2">
                      {key}
                    </label>
                    <div className="col-span-2">
                      <Input
                        value={value}
                        onChange={(e) => updateValue(section, key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
