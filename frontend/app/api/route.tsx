"use server";

import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import { encodeShareString } from "../utils/shareString";
import { generateContainerSasToken } from "../actions/createSASToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const containerName = searchParams.get("container");

  const storageAccountName = process.env.NEXT_PUBLIC_STORAGE_ACCOUNT;
  const secretAccountKey = process.env.SECRET_ACCESS_KEY;

  if (!containerName || !storageAccountName || !secretAccountKey) {
    console.error(
      "Error creating container, missing caseNumber or storage account SAS token"
    );
    return { error: "Missing credentials" };
  }

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

    const sasOptions = {
      containerName,
      permissions: BlobSASPermissions.parse("cw"),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour expiration
    };

    // Generate SAS token
    const sasQueryParameters = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    );

    const encodedShareString = encodeShareString({
      container: containerName,
      token: sasQueryParameters.toString(),
    });
    return Response.json({ token: encodedShareString });
  } catch (error) {
    console.error("Error creating container: ", error);
    return Response.json({ error: "An error occurred creating the container" });
  }
}
