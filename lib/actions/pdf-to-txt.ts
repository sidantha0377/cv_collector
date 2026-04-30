// const pdf = require("pdf-parse");

// export async function extractPdfText(buffer: Buffer) {
//   try {
//     const data = await pdf(buffer);

//     return data.text; // full CV text
//   } catch (err) {
//     console.error("PDF parse error:", err);
//     return "";
//   }
// }

/**
 * lib/cv/pdf-extractor.ts
 */

/**
 * lib/cv/pdf-extractor.ts
 */

export interface PdfExtractResult {
  success: boolean;
  text: string;
  pages: number;
  error?: string;
}

export async function extractPdfText(
  buffer: Buffer,
): Promise<PdfExtractResult> {
  try {
    const PDFParser = (await import("pdf2json")).default;

    const text = await new Promise<string>((resolve, reject) => {
      const parser = new PDFParser();

      parser.on("pdfParser_dataError", (err: any) => {
        reject(new Error(err.parserError));
      });

      parser.on("pdfParser_dataReady", (data: any) => {
        const pages = data.Pages ?? [];
        const fullText = pages
          .map((page: any) =>
            (page.Texts ?? [])
              .map((t: any) =>
                (t.R ?? []).map((r: any) => decodeURIComponent(r.T)).join(""),
              )
              .join(" "),
          )
          .join("\n\n");

        resolve(fullText);
      });

      parser.parseBuffer(buffer);
    });

    return {
      success: true,
      text: cleanText(text),
      pages: 0,
    };
  } catch (err) {
    console.error("[extractPdfText] Failed to parse PDF:", err);
    return {
      success: false,
      text: "",
      pages: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
