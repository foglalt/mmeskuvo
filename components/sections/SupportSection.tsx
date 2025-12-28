import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import type { SupportContent } from "@/types/content";

interface SupportSectionProps {
  content: SupportContent;
  title: string;
  moreInfoLabel?: string;
}

export function SupportSection({
  content,
  title,
  moreInfoLabel = "More info",
}: SupportSectionProps) {
  return (
    <SectionWrapper id="support" className="bg-secondary/20">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {title}
        </h2>
      </div>

      {content.intro && (
        <div className="mb-8">
          <MarkdownRenderer content={content.intro} />
        </div>
      )}

      {content.options?.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {content.options.map((option, index) => (
            <Card key={index} className="bg-white/80">
              <CardTitle className="font-serif text-xl text-primary">
                {option.title}
              </CardTitle>
              <CardContent>
                <MarkdownRenderer content={option.description} />
                {option.link && (
                  <a
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-accent hover:underline"
                  >
                    {moreInfoLabel}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
