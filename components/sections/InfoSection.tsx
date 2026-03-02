import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import type { InfoContent } from "@/types/content";
import { localizeText } from "@/lib/localizedContent";

interface InfoSectionProps {
  content: InfoContent;
  language?: "hu" | "en";
  title?: string;
  animate?: boolean;
  fullscreen?: boolean;
}

export function InfoSection({
  content,
  language = "hu",
  title,
  animate = true,
  fullscreen = true,
}: InfoSectionProps) {
  return (
    <SectionWrapper
      id="info"
      className="bg-secondary/30"
      animate={animate}
      fullscreen={fullscreen}
    >
      {title && (
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
            {title}
          </h2>
        </div>
      )}

      {/* Main content */}
      <MarkdownRenderer content={localizeText(content.mainText, language)} />

      {/* Subsections */}
      {content.subsections?.map((subsection, index) => (
        <div key={index} className="mt-12">
          <h3 className="font-serif text-2xl md:text-3xl text-primary mb-4">
            {localizeText(subsection.title, language)}
          </h3>
          <MarkdownRenderer content={localizeText(subsection.content, language)} />
        </div>
      ))}
    </SectionWrapper>
  );
}
