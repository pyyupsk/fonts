import { safe } from "./safe";

const LOAD_TIMEOUT_MS = 5000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Font load timed out after ${ms}ms`)), ms);
  });
}

export async function loadFont(
  family: string,
  url: string,
  descriptors?: FontFaceDescriptors,
): Promise<boolean> {
  const fontFace = new FontFace(family, `url(${url})`, descriptors);

  const [loadedFace, error] = await safe(
    Promise.race([fontFace.load(), timeout(LOAD_TIMEOUT_MS)]),
  );
  if (error) return false;

  document.fonts.add(loadedFace);
  return true;
}
