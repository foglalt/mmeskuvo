"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CopyableCodeBlockProps {
  code: string;
  language?: string;
}

async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") return;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function CopyableCodeBlock({ code, language }: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copied]);

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(code);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy markdown code block:", error);
    }
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-primary/20 bg-gray-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/25 px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.16em] text-white/70">
          {language ?? "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="rounded-md border border-white/25 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-4 py-3 text-sm leading-relaxed text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose-wedding", className)}>
      <ReactMarkdown
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const plainCode = String(children).replace(/\n$/, "");
            const language = className?.replace("language-", "").split(" ")[0];
            const isCodeBlock =
              Boolean(className?.includes("language-")) || plainCode.includes("\n");

            if (isCodeBlock) {
              return <CopyableCodeBlock code={plainCode} language={language} />;
            }

            return (
              <code className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.95em] text-primary">
                {children}
              </code>
            );
          },
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
