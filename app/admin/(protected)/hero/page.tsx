"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Input, Checkbox, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { HeroSection } from "@/components/sections/HeroSection";
import { Save } from "lucide-react";
import type { HeroContent } from "@/types/content";

export default function EditHeroPage() {
  const [content, setContent] = useState<HeroContent>({
    invitationImage: "/images/invitation-placeholder.svg",
    showScrollHint: true,
  });
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/content").then((res) => res.json()),
      fetch("/api/images").then((res) => res.json()),
    ])
      .then(([contentData, imagesData]) => {
        if (contentData?.hero) {
          setContent(contentData.hero);
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
      await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero: content }),
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-gray-900">Meghívó / Hero</h1>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Mentve!" : "Mentés"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meghívó kép</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Kép elérési útja"
              value={content.invitationImage}
              onChange={(e) =>
                setContent({ ...content, invitationImage: e.target.value })
              }
              placeholder="/images/invitation.jpg"
            />

            {availableImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elérhető képek
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableImages.map((img) => (
                    <button
                      key={img}
                      onClick={() =>
                        setContent({ ...content, invitationImage: img })
                      }
                      className={`relative aspect-square rounded border-2 overflow-hidden ${
                        content.invitationImage === img
                          ? "border-primary"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Checkbox
              label="Görgetés jelzés mutatása"
              checked={content.showScrollHint}
              onChange={(e) =>
                setContent({ ...content, showScrollHint: e.target.checked })
              }
            />
          </CardContent>
        </Card>

        <p className="mt-4 text-sm text-gray-500">
          Tipp: A meghívó képet a <code>/public/images/</code> mappába kell
          elhelyezni, majd itt kiválasztani.
        </p>
      </div>

      <div className="lg:sticky lg:top-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Előnézet</h2>
        <div className="border rounded-lg overflow-hidden bg-white max-h-[80vh] overflow-auto">
          <div className="transform scale-50 origin-top">
            <HeroSection content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
