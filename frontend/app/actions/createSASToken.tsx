"use server";

import "server-only";
import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { encodeShareString } from "../utils/shareString";
import { getAuthenticatedBlobStorageClient } from "../data/getAuthenticatedBlobClient";

function generateContainerSasToken(
  containerName: string,
  credential: StorageSharedKeyCredential
) {
  const sasOptions = {
    containerName,
    permissions: BlobSASPermissions.parse("cw"),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour expiration
  };

  // Generate SAS token
  const sasQueryParameters = generateBlobSASQueryParameters(
    sasOptions,
    credential
  );
  return sasQueryParameters.toString();
}

export async function createShareLink(containerName: string) {
  const blobServiceClient = await getAuthenticatedBlobStorageClient();
  if (!blobServiceClient) {
    return { error: "Error getting blob service client." };
  }

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containerClient || !containerClient.credential) {
      return { error: "Error getting container client credentials" };
    }

    // Check if the container exists
    const exists = await containerClient.exists();
    if (!exists) {
      return { error: "Container does not exist" };
    }

    const credential = containerClient.credential as StorageSharedKeyCredential;
    const token = generateContainerSasToken(containerName, credential);

    const encodedShareString = encodeShareString({
      container: containerName,
      token: token,
    });
    return { token: encodedShareString };
  } catch (error) {
    console.error("Error creating container: ", error);
    return {
      error: "An error occurred creating the container",
    };
  }
}
