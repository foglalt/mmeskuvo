"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Textarea, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { AboutSection } from "@/components/sections/AboutSection";
import { normalizeAboutContent } from "@/lib/localizedContent";
import { formatImageDateFromPath, sortGalleryItemsByDate } from "@/lib/imageDates";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
import { Save, Trash2, ArrowUp, ArrowDown, Check } from "lucide-react";
import type { AboutContent, LanguageCode } from "@/types/content";

export default function EditAboutPage() {
  const [content, setContent] = useState<AboutContent>({
    story: { hu: "", en: "" },
    images: [],
  });
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("hu");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/content").then((res) => res.json()),
      fetch("/api/images").then((res) => res.json()),
    ])
      .then(([contentData, imagesData]) => {
        if (contentData?.about) {
          const normalizedAbout = normalizeAboutContent(contentData.about);
          setContent({
            ...normalizedAbout,
            images: sortGalleryItemsByDate(normalizedAbout.images),
          });
        }
        if (imagesData?.images) {
          setAvailableImages(imagesData.images);
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
        body: JSON.stringify({ about: content }),
      });
      if (!response.ok) {
        throw new Error("Failed to save about content");
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

  const addImage = (src: string) => {
    if (!content.images.some((img) => img.src === src)) {
      const dateCaptionHu = formatImageDateFromPath(src, "hu") ?? "";
      const dateCaptionEn = formatImageDateFromPath(src, "en") ?? dateCaptionHu;

      setContent({
        ...content,
        images: sortGalleryItemsByDate([
          ...content.images,
          { src, caption: { hu: dateCaptionHu, en: dateCaptionEn } },
        ]),
      });
    }
  };

  const updateImageCaption = (index: number, caption: string) => {
    const updated = [...content.images];
    const currentCaption = updated[index].caption ?? { hu: "", en: "" };
    updated[index] = {
      ...updated[index],
      caption: {
        ...currentCaption,
        [activeLanguage]: caption,
      },
    };
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-gray-900">Rólunk</h1>
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
              Történetünk ({activeLanguage === "hu" ? "Magyar" : "English"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content.story[activeLanguage]}
              onChange={(e) =>
                setContent({
                  ...content,
                  story: {
                    ...content.story,
                    [activeLanguage]: e.target.value,
                  },
                })
              }
              rows={10}
              placeholder="Hogyan ismerkedtünk meg..."
            />
          </CardContent>
        </Card>

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
                        value={img.caption?.[activeLanguage] ?? ""}
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
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === content.images.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
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

        <Card>
          <CardHeader>
            <CardTitle>Elérhető képek</CardTitle>
          </CardHeader>
          <CardContent>
            {availableImages.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Nincs elérhető kép. Helyezz képeket a{" "}
                <code>/public/images/</code> mappába.
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
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary" />
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

      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Előnézet</h2>
        <div className="border rounded-lg bg-white h-[70vh] lg:h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain">
          <AboutSection
            content={content}
            language={activeLanguage}
            title="Rólunk"
            animate={false}
            fullscreen={false}
          />
        </div>
      </div>
    </div>
  );
}
