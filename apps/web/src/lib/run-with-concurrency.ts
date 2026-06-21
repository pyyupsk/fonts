export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    const index = nextIndex;
    nextIndex += 1;
    if (index >= items.length) return;
    await worker(items[index] as T, index);
    await runNext();
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => runNext());
  await Promise.all(workers);
}
