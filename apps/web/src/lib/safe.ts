export type Safe<T> = [T, null] | [null, Error];

export async function safe<T>(fn: Promise<T>): Promise<Safe<T>> {
  try {
    return [await fn, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
