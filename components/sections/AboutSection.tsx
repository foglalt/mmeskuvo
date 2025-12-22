import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { ImageGallery } from "@/components/content/ImageGallery";
import type { AboutContent } from "@/types/content";

interface AboutSectionProps {
  content: AboutContent;
  title: string;
}

export function AboutSection({ content, title }: AboutSectionProps) {
  return (
    <SectionWrapper id="about" className="bg-white">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {title}
        </h2>
      </div>

      {/* Story */}
      {content.story && (
        <div className="mb-12">
          <MarkdownRenderer content={content.story} />
        </div>
      )}

      {/* Image Gallery */}
      {content.images?.length > 0 && (
        <ImageGallery images={content.images} />
      )}
    </SectionWrapper>
  );
}
