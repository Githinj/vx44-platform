// Client documents may be PDF, PNG or JPEG. The browser declares a file's type from its name, so
// the upload also checks that the file's first bytes match that type: a renamed file of another
// kind isn't stored as a PDF or an image (security review on SEC-240).

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];

/** How many leading bytes `matchesDeclaredType` needs to see. */
export const SIGNATURE_BYTES = 1024;

function startsWith(bytes: Uint8Array, signature: number[], at = 0) {
  return signature.every((byte, index) => bytes[at + index] === byte);
}

/** True when a file's leading bytes match its declared type (PDF, PNG or JPEG). */
export function matchesDeclaredType(type: string, head: Uint8Array): boolean {
  switch (type) {
    case "application/pdf":
      // Readers accept the %PDF- header anywhere in the first 1,024 bytes, and some tools write a
      // few bytes before it.
      for (let at = 0; at + PDF.length <= Math.min(head.length, SIGNATURE_BYTES); at++) {
        if (startsWith(head, PDF, at)) return true;
      }
      return false;
    case "image/png":
      return startsWith(head, PNG);
    case "image/jpeg":
      return startsWith(head, JPEG);
    default:
      return false;
  }
}
