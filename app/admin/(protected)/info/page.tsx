"use client";

import { useState, useEffect } from "react";
import { Button, Textarea, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { InfoSection } from "@/components/sections/InfoSection";
import { normalizeInfoContent } from "@/lib/localizedContent";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
import { Save, Plus, Trash2 } from "lucide-react";
import type { InfoContent, LanguageCode } from "@/types/content";

export default function EditInfoPage() {
  const [content, setContent] = useState<InfoContent>({
    mainText: { hu: "", en: "" },
    subsections: [],
  });
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("hu");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.info) {
          setContent(normalizeInfoContent(data.info));
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
        body: JSON.stringify({ info: content }),
      });
      if (!response.ok) {
        throw new Error("Failed to save info content");
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

  const addSubsection = () => {
    setContent({
      ...content,
      subsections: [
        ...content.subsections,
        { title: { hu: "", en: "" }, content: { hu: "", en: "" } },
      ],
    });
  };

  const updateSubsection = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    const updated = [...content.subsections];
    const subsection = updated[index];
    updated[index] = {
      ...subsection,
      [field]: {
        ...subsection[field],
        [activeLanguage]: value,
      },
    };
    setContent({ ...content, subsections: updated });
  };

  const removeSubsection = (index: number) => {
    setContent({
      ...content,
      subsections: content.subsections.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-gray-900">Információk</h1>
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
              Fő tartalom ({activeLanguage === "hu" ? "Magyar" : "English"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              label="Markdown formátumban"
              value={content.mainText[activeLanguage]}
              onChange={(e) =>
                setContent({
                  ...content,
                  mainText: {
                    ...content.mainText,
                    [activeLanguage]: e.target.value,
                  },
                })
              }
              rows={10}
              placeholder="# Cím\n\nSzöveg **félkövérrel** vagy *dőlten*..."
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">Alszakaszok</h2>
            <Button variant="outline" size="sm" onClick={addSubsection}>
              <Plus className="h-4 w-4 mr-2" />
              Új szakasz
            </Button>
          </div>

          {content.subsections.map((sub, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <Input
                  value={sub.title[activeLanguage]}
                  onChange={(e) =>
                    updateSubsection(index, "title", e.target.value)
                  }
                  placeholder="Szakasz címe"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubsection(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={sub.content[activeLanguage]}
                  onChange={(e) =>
                    updateSubsection(index, "content", e.target.value)
                  }
                  rows={5}
                  placeholder="Szakasz tartalma (markdown)..."
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Tipp: Használj Markdown formázást: <code># Cím</code>,{" "}
          <code>**félkövér**</code>, <code>*dőlt*</code>,{" "}
          <code>[link](url)</code>
        </p>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Előnézet</h2>
        <div className="border rounded-lg bg-secondary/30 h-[70vh] lg:h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain">
          <InfoSection
            content={content}
            language={activeLanguage}
            title={activeLanguage === "hu" ? "Információk" : "Information"}
            animate={false}
            fullscreen={false}
          />
        </div>
      </div>
    </div>
  );
}
