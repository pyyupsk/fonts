export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace";

export type FontLicense = "ofl" | "apache" | "ufl";

export interface FontFamily {
  id: string;
  name: string;
  designer: string;
  category: FontCategory;
  license: FontLicense;
  isNoto: boolean;
  dateAdded: string;
  sourceRepositoryUrl: string;
}
