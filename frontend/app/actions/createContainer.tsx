"use server";

import "server-only";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  containerName: z.string().min(4),
  containerDescription: z.string().optional(),
});

export async function createContainer(
  prevState: { message: string; success: boolean },
  formData: FormData
) {
  const storageAccountName = process.env.NEXT_PUBLIC_STORAGE_ACCOUNT;
  const secretAccountKey = process.env.SECRET_ACCESS_KEY;

  if (!storageAccountName || !secretAccountKey) {
    console.error(
      "Error creating container, missing caseNumber or storage account SAS token"
    );
    return { message: "Missing credentials", success: false };
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(
    storageAccountName,
    secretAccountKey
  );

  const parse = schema.safeParse({
    containerName: formData.get("containerName"),
    containerDescription: formData.get("containerDescription"),
  });

  if (!parse.success) {
    console.error("Error parsing form");
    return { message: "Failed to create todo", success: false };
  }

  try {
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Create the container if it doesn't exist
    const containerName = parse.data.containerName;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const res = await containerClient.createIfNotExists({
      metadata: {
        description: parse.data.containerDescription || "",
      },
    });

    revalidatePath("/portal");
    return {
      message: `Created container ${parse.data.containerName}`,
      success: true,
    };
  } catch (error) {
    console.error("Error creating container: ", error);
    return {
      message: "An error occurred creating the container",
      success: false,
    };
  }
}
