import { ContainerItem } from "@azure/storage-blob";

// src/types/index.ts
export interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  fileType: string;
  assetName: string;
  error: string;
  abortController?: AbortController;
}

export interface UploadRequest {
  version?: string;
  container: string;
  token: string;
  expiryDate: Date;
}

export interface ListContainersResponse {
  containers?: ContainerItem[];
  error?: string;
}
