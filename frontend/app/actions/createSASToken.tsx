"use server";

import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { encodeShareString } from "../utils/shareString";

export async function generateContainerSasToken(
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
  const storageAccountName = process.env.NEXT_PUBLIC_STORAGE_ACCOUNT;
  const secretAccountKey = process.env.SECRET_ACCESS_KEY;

  if (!containerName || !storageAccountName || !secretAccountKey) {
    console.error(
      "Error creating container, missing caseNumber or storage account SAS token"
    );
    return { error: "Missing credentials" };
  }

  console.log("Hi");
  try {
    // Generate SAS token
    const sharedKeyCredential = new StorageSharedKeyCredential(
      storageAccountName,
      secretAccountKey
    );
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Check if the container exists
    const exists = await containerClient.exists();
    if (!exists) {
      console.error(`Container ${containerName} does not exist`);
      return { error: "Container does not exist" };
    }
    const token = generateContainerSasToken(containerName, sharedKeyCredential);
    console.log(token);
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
