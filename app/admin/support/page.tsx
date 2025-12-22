"use client";

import { useState, useEffect } from "react";
import { Button, Textarea, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { SupportSection } from "@/components/sections/SupportSection";
import { Save, Plus, Trash2 } from "lucide-react";
import type { SupportContent, SupportOption } from "@/types/content";

export default function EditSupportPage() {
  const [content, setContent] = useState<SupportContent>({
    intro: "",
    options: [],
    volunteerOptions: [],
  });
  const [newVolunteer, setNewVolunteer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.support) {
          setContent(data.support);
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
        body: JSON.stringify({ support: content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addOption = () => {
    setContent({
      ...content,
      options: [...content.options, { title: "", description: "", link: "" }],
    });
  };

  const updateOption = (index: number, updates: Partial<SupportOption>) => {
    const updated = [...content.options];
    updated[index] = { ...updated[index], ...updates };
    setContent({ ...content, options: updated });
  };

  const removeOption = (index: number) => {
    setContent({
      ...content,
      options: content.options.filter((_, i) => i !== index),
    });
  };

  const addVolunteerOption = () => {
    if (newVolunteer.trim()) {
      setContent({
        ...content,
        volunteerOptions: [...content.volunteerOptions, newVolunteer.trim()],
      });
      setNewVolunteer("");
    }
  };

  const removeVolunteerOption = (index: number) => {
    setContent({
      ...content,
      volunteerOptions: content.volunteerOptions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-gray-900">Támogatás</h1>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Mentve!" : "Mentés"}
          </Button>
        </div>

        {/* Intro */}
        <Card>
          <CardHeader>
            <CardTitle>Bevezető szöveg</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content.intro}
              onChange={(e) => setContent({ ...content, intro: e.target.value })}
              rows={4}
              placeholder="Hálásak vagyunk jelenlétedért..."
            />
          </CardContent>
        </Card>

        {/* Support options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">Támogatási lehetőségek</h2>
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              Új opció
            </Button>
          </div>

          {content.options.map((option, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <Input
                  value={option.title}
                  onChange={(e) => updateOption(index, { title: e.target.value })}
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
                  value={option.description}
                  onChange={(e) => updateOption(index, { description: e.target.value })}
                  rows={3}
                  placeholder="Leírás (markdown)..."
                />
                <Input
                  value={option.link || ""}
                  onChange={(e) => updateOption(index, { link: e.target.value })}
                  placeholder="Link (opcionális): https://..."
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Volunteer options */}
        <Card>
          <CardHeader>
            <CardTitle>Segítség opciók (checkboxok az RSVP-ben)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newVolunteer}
                onChange={(e) => setNewVolunteer(e.target.value)}
                placeholder="Pl: Ételkészítés, Dekoráció..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVolunteerOption())}
              />
              <Button variant="outline" onClick={addVolunteerOption}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {content.volunteerOptions.map((opt, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {opt}
                  <button
                    onClick={() => removeVolunteerOption(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Előnézet</h2>
        <div className="border rounded-lg overflow-hidden bg-secondary/20 max-h-[80vh] overflow-auto">
          <SupportSection content={content} title="Szeretnélek támogatni" />
        </div>
      </div>
    </div>
  );
}
