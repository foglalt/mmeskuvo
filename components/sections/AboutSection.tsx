import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { ImageGallery } from "@/components/content/ImageGallery";
import { localizeText } from "@/lib/localizedContent";
import { formatImageDateFromPath, sortGalleryItemsByDate } from "@/lib/imageDates";
import type { AboutContent, LanguageCode } from "@/types/content";

interface AboutSectionProps {
  content: AboutContent;
  title: string;
  language?: LanguageCode;
  animate?: boolean;
  fullscreen?: boolean;
}

export function AboutSection({
  content,
  title,
  language = "hu",
  animate = true,
  fullscreen = true,
}: AboutSectionProps) {
  const localizedStory = localizeText(content.story, language);
  const localizedImages = sortGalleryItemsByDate(content.images).map((image) => ({
    src: image.src,
    caption:
      formatImageDateFromPath(image.src, language) ??
      (image.caption ? localizeText(image.caption, language) : undefined),
  }));

  return (
    <SectionWrapper
      id="about"
      className="bg-white"
      animate={animate}
      fullscreen={fullscreen}
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {title}
        </h2>
      </div>

      {/* Story */}
      {localizedStory && (
        <div className="mb-12">
          <MarkdownRenderer content={localizedStory} />
        </div>
      )}

      {/* Image Gallery */}
      {localizedImages.length > 0 && (
        <ImageGallery images={localizedImages} />
      )}
    </SectionWrapper>
  );
}
