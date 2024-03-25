import { UploadRequest } from "../types";

export function decodeShareString(
  encodedShareString: string
): UploadRequest | null {
  const uriDecoded = decodeURIComponent(encodedShareString);
  const decoded = atob(uriDecoded);

  const version = decoded.substring(0, 1);
  if (version === "1") {
    const [container, token] = decoded.substring(1).split("|");
    return { version, container, token };
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
