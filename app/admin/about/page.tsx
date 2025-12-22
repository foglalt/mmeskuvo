"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Textarea, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { AboutSection } from "@/components/sections/AboutSection";
import { Save, Plus, Trash2 } from "lucide-react";
import type { AboutContent, GalleryImage } from "@/types/content";

export default function EditAboutPage() {
  const [content, setContent] = useState<AboutContent>({
    story: "",
    images: [],
  });
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/content").then((res) => res.json()),
      fetch("/api/images").then((res) => res.json()),
    ]).then(([contentData, imagesData]) => {
      if (contentData?.about) {
        setContent(contentData.about);
      }
      if (imagesData?.images) {
        setAvailableImages(imagesData.images);
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
        body: JSON.stringify({ about: content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addImage = (src: string) => {
    if (!content.images.some((img) => img.src === src)) {
      setContent({
        ...content,
        images: [...content.images, { src, caption: "" }],
      });
    }
  };

  const updateImageCaption = (index: number, caption: string) => {
    const updated = [...content.images];
    updated[index] = { ...updated[index], caption };
    setContent({ ...content, images: updated });
  };

  const removeImage = (index: number) => {
    setContent({
      ...content,
      images: content.images.filter((_, i) => i !== index),
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.images.length) return;
    
    const updated = [...content.images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setContent({ ...content, images: updated });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-gray-900">Rólunk</h1>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Mentve!" : "Mentés"}
          </Button>
        </div>

        {/* Story */}
        <Card>
          <CardHeader>
            <CardTitle>Történetünk</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content.story}
              onChange={(e) => setContent({ ...content, story: e.target.value })}
              rows={10}
              placeholder="Hogyan ismerkedtünk meg..."
            />
          </CardContent>
        </Card>

        {/* Selected images */}
        <Card>
          <CardHeader>
            <CardTitle>Kiválasztott képek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.images.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Válassz képeket az alábbi galériából.
              </p>
            ) : (
              <div className="space-y-3">
                {content.images.map((img, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded">
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={img.src}
                        alt=""
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={img.caption || ""}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        placeholder="Képaláírás..."
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === content.images.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-500 ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available images */}
        <Card>
          <CardHeader>
            <CardTitle>Elérhető képek</CardTitle>
          </CardHeader>
          <CardContent>
            {availableImages.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Nincs elérhető kép. Helyezz képeket a <code>/public/images/</code> mappába.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableImages.map((img) => {
                  const isSelected = content.images.some((i) => i.src === img);
                  return (
                    <button
                      key={img}
                      onClick={() => addImage(img)}
                      disabled={isSelected}
                      className={`relative aspect-square rounded border-2 overflow-hidden ${
                        isSelected
                          ? "border-primary opacity-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-primary"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Előnézet</h2>
        <div className="border rounded-lg overflow-hidden bg-white max-h-[80vh] overflow-auto">
          <AboutSection content={content} title="Rólunk" />
        </div>
      </div>
    </div>
  );
}
