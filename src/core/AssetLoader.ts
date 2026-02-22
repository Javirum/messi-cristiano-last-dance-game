export class AssetLoader {
  private cache = new Map<string, HTMLImageElement>();

  async loadAll(manifest: Record<string, string>): Promise<void> {
    const entries = Object.entries(manifest);
    const promises = entries.map(([key, src]) => this.loadImage(key, src));
    await Promise.all(promises);
  }

  private loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(key, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  get(key: string): HTMLImageElement {
    const img = this.cache.get(key);
    if (!img) {
      throw new Error(`Image not found in cache: ${key}`);
    }
    return img;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}
