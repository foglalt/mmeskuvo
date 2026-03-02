"use client";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("renders copy button for fenced code blocks", () => {
    render(
      <MarkdownRenderer
        content={"```text\nIBAN: HU12 3456 7890 1234\n```"}
      />
    );

    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("keeps inline code without copy button", () => {
    render(<MarkdownRenderer content={"Use `npm run dev` to start."} />);

    expect(screen.queryByRole("button", { name: "Copy code" })).not.toBeInTheDocument();
    expect(screen.getByText("npm run dev")).toBeInTheDocument();
  });
});
