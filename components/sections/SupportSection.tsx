import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { localizeText } from "@/lib/localizedContent";
import type { LanguageCode, SupportContent } from "@/types/content";

interface SupportSectionProps {
  content: SupportContent;
  title: string;
  moreInfoLabel?: string;
  language?: LanguageCode;
  animate?: boolean;
  fullscreen?: boolean;
}

export function SupportSection({
  content,
  title,
  moreInfoLabel = "More info",
  language = "hu",
  animate = true,
  fullscreen = true,
}: SupportSectionProps) {
  const localizedIntro = localizeText(content.intro, language);

  return (
    <SectionWrapper
      id="support"
      className="bg-secondary/20"
      animate={animate}
      fullscreen={fullscreen}
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {title}
        </h2>
      </div>

      {localizedIntro && (
        <div className="mb-8">
          <MarkdownRenderer content={localizedIntro} />
        </div>
      )}

      {content.options?.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {content.options.map((option, index) => (
            <Card key={index} className="bg-white/80">
              <CardTitle className="font-serif text-xl text-primary">
                {localizeText(option.title, language)}
              </CardTitle>
              <CardContent>
                <MarkdownRenderer
                  content={localizeText(option.description, language)}
                />
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
