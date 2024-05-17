"use client";

import { useSearchParams } from "next/navigation";
import { decodeShareString } from "./shareString";
import { UploadRequest } from "../types";

export const useContainerToken = (): UploadRequest | null => {
  const searchParams = useSearchParams();
  const u = searchParams.get("u");

  if (!u) {
    console.error("Error: Missing upload token in the URL.");
    return null;
  }

  let uploadRequest: UploadRequest | null;
  try {
    uploadRequest = decodeShareString(u);
  } catch (error) {
    console.error("Error: Invalid or malformed share link.", error);
    return null;
  }

  if (!uploadRequest || !isValidSASToken(uploadRequest.token)) {
    console.error("Error: Invalid SAS write-only upload token.");
    return null;
  }

  return uploadRequest;
};

const isValidSASToken = (token: string): boolean => {
  // Implement your SAS token validation logic here
  // For demonstration, we will assume a basic length check
  return token.length > 20;
};
