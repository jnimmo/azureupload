// src/utils/upload.ts
import {
  AnonymousCredential,
  BlobServiceClient,
  RestError,
} from "@azure/storage-blob";
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
    `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net?${sasToken}`,
    new AnonymousCredential()
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(file.file.name);
  let errorMessage = "Unknown error.";

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
      }
    );
    console.log(
      `Upload block blob ${file.file.name} sucessfully`,
      uploadBlobResponse.requestId
    );
    return { success: true, requestId: uploadBlobResponse.requestId };
  } catch (error) {
    if (error instanceof RestError) {
      switch (error.statusCode) {
        case 403:
          errorMessage =
            "Unauthorized access. Please check the share link is valid.";
          break;
        case 404:
          errorMessage =
            "Container not found. Please request a new share link.";
          break;
        case 409:
          errorMessage = "Conflict. The file already exists.";
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later.";
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    } else {
      // add handler for 'error object "name": AbortError'
      console.log("Error type: ", typeof error);
      console.log(JSON.stringify(error));
      errorMessage = error.message || errorMessage;
    }

    console.error("Upload failed:", errorMessage);
    onProgress(0);
    return { success: false, message: errorMessage };
  }
};
