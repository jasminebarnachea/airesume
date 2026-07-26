declare module "pdf-parse" {
  export default function parse(buffer: Buffer): Promise<{ text: string; numpages: number }>;
}
declare module "pdf-parse/lib/pdf-parse.js" {
  export default function parse(buffer: Buffer): Promise<{ text: string; numpages: number }>;
}
