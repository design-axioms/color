export class Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static parse(value: string): Rgba {
    const v = value.trim();
    if (v === "transparent") return new Rgba(0, 0, 0, 0);

    // color(srgb r g b / a)
    const srgb = v.match(
      /^color\(srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/,
    );
    if (srgb) {
      const r01 = Number(srgb[1]);
      const g01 = Number(srgb[2]);
      const b01 = Number(srgb[3]);

      let a = 1;
      const alphaRaw = srgb[4];
      if (alphaRaw !== undefined) {
        if (alphaRaw.endsWith("%")) a = Number(alphaRaw.slice(0, -1)) / 100;
        else a = Number(alphaRaw);
      }

      return new Rgba(r01 * 255, g01 * 255, b01 * 255, a);
    }

    // rgb()/rgba() comma or space syntax
    const m = v.match(
      /^rgba?\(\s*(\d+(?:\.\d+)?)\s*(?:,|\s)\s*(\d+(?:\.\d+)?)\s*(?:,|\s)\s*(\d+(?:\.\d+)?)(?:\s*(?:\/|,)\s*([0-9.]+%?))?\s*\)$/,
    );
    if (!m) return new Rgba(0, 0, 0, 0);

    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);

    let a = 1;
    const alphaRaw = m[4];
    if (alphaRaw !== undefined) {
      if (alphaRaw.endsWith("%")) a = Number(alphaRaw.slice(0, -1)) / 100;
      else a = Number(alphaRaw);
    }

    return new Rgba(r, g, b, a);
  }

  toString(): string {
    // Canonical string: integers for rgb, float for alpha.
    const r = Math.round(this.r);
    const g = Math.round(this.g);
    const b = Math.round(this.b);
    const a = Number.isFinite(this.a) ? this.a : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  distanceTo(other: Rgba): number {
    const dr = this.r - other.r;
    const dg = this.g - other.g;
    const db = this.b - other.b;
    const da = (this.a - other.a) * 255;
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da);
  }

  static distance(a: string, b: string): number {
    return Rgba.parse(a).distanceTo(Rgba.parse(b));
  }
}
