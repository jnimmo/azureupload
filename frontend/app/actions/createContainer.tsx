"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAuthenticatedBlobStorageClient } from "../data/getAuthenticatedBlobClient";

const schema = z.object({
  containerName: z.string().regex(/^[a-z0-9-]{4,20}$/, {
    message:
      "Names can only contain lowercase letters and numbers and hypens, between 4 and 20 characters long.",
  }),
  containerDescription: z.string().optional(),
});

export async function createContainer(
  prevState: { message: string; success: boolean },
  formData: FormData
) {
  const parse = schema.safeParse({
    containerName: formData.get("containerName"),
    containerDescription: formData.get("containerDescription"),
  });

  if (!parse.success) {
    console.error("Error parsing form");
    return { message: "Failed to create todo", success: false };
  }

  const containerName = parse.data.containerName;
  const blobServiceClient = await getAuthenticatedBlobStorageClient();
  if (!blobServiceClient) {
    return { message: "Failed to get blob service client", success: false };
  }

  try {
    // Create the container if it doesn't exist
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
