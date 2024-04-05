import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";
import "server-only";
import { DefaultAzureCredential } from "@azure/identity";

export async function getAuthenticatedBlobStorageClient(): Promise<BlobServiceClient | null> {
  const storageAccountName = process.env.NEXT_PUBLIC_STORAGE_ACCOUNT;
  if (!storageAccountName) {
    console.error("Error: Missing storage account name or secret access key.");
    return null;
  }

  try {
    if (process.env.SECRET_ACCESS_KEY) {
      // Use SAS key
      experimental_taintUniqueValue(
        "Do not pass secrets to the client",
        globalThis,
        process.env.SECRET_ACCESS_KEY
      );
      const credential = new StorageSharedKeyCredential(
        storageAccountName,
        process.env.SECRET_ACCESS_KEY
      );

      const blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net`,
        credential
      );
      experimental_taintObjectReference(
        "Do not pass secrets to the client",
        blobServiceClient
      );
      return blobServiceClient;
    } else {
      // Use the managed identity from Azure static web apps
      const credential = new DefaultAzureCredential();
      const blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net`,
        credential
      );
      experimental_taintObjectReference(
        "Do not pass secrets to the client",
        blobServiceClient
      );
      return blobServiceClient;
    }
  } catch (error) {
    console.error("Error creating blob service client: ", error);
    return null;
  }
}
