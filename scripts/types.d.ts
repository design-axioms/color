declare module 'apca-w3' {
  export function sRGBtoY(color: [number, number, number]): number;
  export function APCAcontrast(fgY: number, bgY: number): number | string;
}

declare module 'culori' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function converter(mode: string): (color: string | object) => any;
}
