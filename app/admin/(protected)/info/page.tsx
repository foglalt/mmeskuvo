"use client";

import { useState, useEffect } from "react";
import { Button, Textarea, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { InfoSection } from "@/components/sections/InfoSection";
import { Save, Plus, Trash2 } from "lucide-react";
import type { InfoContent, InfoSubsection } from "@/types/content";

export default function EditInfoPage() {
  const [content, setContent] = useState<InfoContent>({
    mainText: "",
    subsections: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.info) {
          setContent(data.info);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ info: content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSubsection = () => {
    setContent({
      ...content,
      subsections: [...content.subsections, { title: "", content: "" }],
    });
  };

  const updateSubsection = (index: number, updates: Partial<InfoSubsection>) => {
    const updated = [...content.subsections];
    updated[index] = { ...updated[index], ...updates };
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
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Mentve!" : "Mentés"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fő tartalom</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              label="Markdown formátumban"
              value={content.mainText}
              onChange={(e) => setContent({ ...content, mainText: e.target.value })}
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
                  value={sub.title}
                  onChange={(e) => updateSubsection(index, { title: e.target.value })}
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
                  value={sub.content}
                  onChange={(e) => updateSubsection(index, { content: e.target.value })}
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
        <div className="border rounded-lg overflow-hidden bg-secondary/30 max-h-[80vh] overflow-auto">
          <InfoSection content={content} />
        </div>
      </div>
    </div>
  );
}
