import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose-wedding", className)}>
      <ReactMarkdown
        components={{
        // Headings with elegant font
        h1: ({ children }) => (
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-6">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4 mt-8">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3 mt-6">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="font-serif text-xl md:text-2xl text-primary mb-2 mt-4">
            {children}
          </h4>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-gray-700 leading-relaxed mb-4">
            {children}
          </p>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-accent hover:underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">
            {children}
          </ol>
        ),
        // Emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-primary">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 my-4">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="my-8 border-t border-gray-200" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
