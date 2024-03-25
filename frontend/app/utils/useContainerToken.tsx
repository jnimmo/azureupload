"use client";

import { useSearchParams } from "next/navigation";
import { decodeShareString } from "./shareString";
import { UploadRequest } from "../types";

export const useContainerToken = (): UploadRequest | null => {
  const searchParams = useSearchParams();
  const u = searchParams.get("u");

  if (!u) return null;

  const uploadRequest = decodeShareString(u);
  return uploadRequest;
};
