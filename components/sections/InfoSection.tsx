import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import type { InfoContent } from "@/types/content";

interface InfoSectionProps {
  content: InfoContent;
}

export function InfoSection({ content }: InfoSectionProps) {
  return (
    <SectionWrapper id="info" className="bg-secondary/30">
      {/* Main content */}
      <MarkdownRenderer content={content.mainText} />

      {/* Subsections */}
      {content.subsections?.map((subsection, index) => (
        <div key={index} className="mt-12">
          <h3 className="font-serif text-2xl md:text-3xl text-primary mb-4">
            {subsection.title}
          </h3>
          <MarkdownRenderer content={subsection.content} />
        </div>
      ))}
    </SectionWrapper>
  );
}
