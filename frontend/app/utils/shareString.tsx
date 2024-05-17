import { UploadRequest } from "../types";

export function decodeShareString(
  encodedShareString: string
): UploadRequest | null {
  const uriDecoded = decodeURIComponent(encodedShareString);
  const decoded = atob(uriDecoded);

  const version = decoded.substring(0, 1);
  if (version === "1") {
    const [container, token] = decoded.substring(1).split("|");
    const expiryDate = extractExpiryDateFromSasToken(token);
    return { version, container, token, expiryDate };
  }
  return null;
}

export function encodeShareString(uploadRequest: UploadRequest): string {
  const version = "1";
  const buf = Buffer.from(
    `${version}${uploadRequest.container}|${uploadRequest.token}`
  );
  const b64 = buf.toString("base64");
  return encodeURIComponent(b64);
}

// Function to extract the expiry date from the SAS token
const extractExpiryDateFromSasToken = (token: string): Date => {
  const params = new URLSearchParams(token);
  const expiryDateString = params.get("se");

  if (!expiryDateString) {
    throw new Error("Missing expiry date in the SAS token.");
  }

  const expiryDate = new Date(expiryDateString);
  if (isNaN(expiryDate.getTime())) {
    throw new Error("Invalid expiry date in the SAS token.");
  }

  return expiryDate;
};
