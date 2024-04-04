// src/utils/upload.ts
import { BlobServiceClient } from "@azure/storage-blob";
import { UploadFile } from "../types";

export const decodeQueryString = async (string: string) => {};

export const uploadFileToAzureBlob = async (
  file: UploadFile,
  containerName: string,
  sasToken: string,
  onProgress: (progress: number) => void,
  abortSignal: AbortSignal
) => {
  const blobServiceClient = new BlobServiceClient(
    `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net?${sasToken}`
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(file.file.name);

  try {
    const uploadBlobResponse = await blockBlobClient.uploadBrowserData(
      file.file,
      {
        abortSignal,
        blobHTTPHeaders: {
          blobContentType: file.file.type,
        },
        onProgress: (progress) => {
          onProgress((progress.loadedBytes / file.file.size) * 100);
        },
        metadata: {
          fileType: file.fileType,
          assetName: file.assetName,
        },
        blockSize: 20 * 1048576,
        concurrency: 8,
      }
    );
    console.log(
      `Upload block blob ${file.file.name} sucessfully`,
      uploadBlobResponse.requestId
    );
    return { success: true, requestId: uploadBlobResponse.requestId };
  } catch (error) {
    console.error("Upload failed:", error);
    onProgress(0);
    return { success: false, message: error };
  }
};
