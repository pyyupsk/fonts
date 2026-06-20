export type FontStyle = "normal" | "italic";

export interface FontVariant {
  id: string;
  familyId: string;
  style: FontStyle;
  weight: number;
  postScriptName: string;
}
