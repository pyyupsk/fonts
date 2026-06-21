import { codeToHtml } from "shiki";

export function highlightCss(code: string): Promise<string> {
  return codeToHtml(code, { lang: "css", theme: "nord" });
}
