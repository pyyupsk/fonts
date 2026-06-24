import { codeToHtml } from "shiki";

export function highlightCss(code: string): Promise<string> {
  return codeToHtml(code, { lang: "css", theme: "nord" });
}

export function highlightJson(code: string): Promise<string> {
  return codeToHtml(code, { lang: "json", theme: "nord" });
}

export function highlightText(code: string): Promise<string> {
  return codeToHtml(code, { lang: "text", theme: "nord" });
}
