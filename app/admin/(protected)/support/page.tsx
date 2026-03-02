"use client";

import { useState, useEffect } from "react";
import { Button, Textarea, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { SupportSection } from "@/components/sections/SupportSection";
import { normalizeSupportContent } from "@/lib/localizedContent";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
import { Save, Plus, Trash2 } from "lucide-react";
import type { LanguageCode, SupportContent } from "@/types/content";

export default function EditSupportPage() {
  const [content, setContent] = useState<SupportContent>({
    intro: { hu: "", en: "" },
    options: [],
    volunteerOptions: [],
  });
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("hu");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.support) {
          setContent(normalizeSupportContent(data.support));
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ support: content }),
      });
      if (!response.ok) {
        throw new Error("Failed to save support content");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useSaveShortcut(handleSave, { enabled: !isSaving });

  const addOption = () => {
    setContent({
      ...content,
      options: [
        ...content.options,
        {
          title: { hu: "", en: "" },
          description: { hu: "", en: "" },
          link: "",
        },
      ],
    });
  };

  const updateOptionText = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = [...content.options];
    const option = updated[index];
    updated[index] = {
      ...option,
      [field]: {
        ...option[field],
        [activeLanguage]: value,
      },
    };
    setContent({ ...content, options: updated });
  };

  const updateOptionLink = (index: number, link: string) => {
    const updated = [...content.options];
    updated[index] = { ...updated[index], link };
    setContent({ ...content, options: updated });
  };

  const removeOption = (index: number) => {
    setContent({
      ...content,
      options: content.options.filter((_, i) => i !== index),
    });
  };

  const updateVolunteerOption = (index: number, value: string) => {
    const updated = [...content.volunteerOptions];
    updated[index] = {
      ...updated[index],
      [activeLanguage]: value,
    };
    setContent({ ...content, volunteerOptions: updated });
  };

  const removeVolunteerOption = (index: number) => {
    setContent({
      ...content,
      volunteerOptions: content.volunteerOptions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-gray-900">Támogatás</h1>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setActiveLanguage("hu")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeLanguage === "hu"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Magyar
              </button>
              <button
                onClick={() => setActiveLanguage("en")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeLanguage === "en"
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

        <Card>
          <CardHeader>
            <CardTitle>
              Bevezető szöveg ({activeLanguage === "hu" ? "Magyar" : "English"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content.intro[activeLanguage]}
              onChange={(e) =>
                setContent({
                  ...content,
                  intro: {
                    ...content.intro,
                    [activeLanguage]: e.target.value,
                  },
                })
              }
              rows={4}
              placeholder="Hálásak vagyunk jelenlétedért..."
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">
              Támogatási lehetőségek
            </h2>
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              Új opció
            </Button>
          </div>

          {content.options.map((option, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <Input
                  value={option.title[activeLanguage]}
                  onChange={(e) =>
                    updateOptionText(index, "title", e.target.value)
                  }
                  placeholder="Opció címe"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="ml-2 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={option.description[activeLanguage]}
                  onChange={(e) =>
                    updateOptionText(index, "description", e.target.value)
                  }
                  rows={3}
                  placeholder="Leírás (markdown)..."
                />
                <Input
                  value={option.link || ""}
                  onChange={(e) => updateOptionLink(index, e.target.value)}
                  placeholder="Link (opcionális): https://..."
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Segítség opciók (checkboxok az RSVP-ben)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {content.volunteerOptions.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={opt[activeLanguage]}
                    onChange={(e) => updateVolunteerOption(index, e.target.value)}
                    placeholder="Segítség opció megnevezése"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVolunteerOption(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Előnézet</h2>
        <div className="border rounded-lg bg-secondary/20 h-[70vh] lg:h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain">
          <SupportSection
            content={content}
            language={activeLanguage}
            title="Szeretnélek támogatni"
            moreInfoLabel="További információ"
            animate={false}
            fullscreen={false}
          />
        </div>
      </div>
    </div>
  );
}
