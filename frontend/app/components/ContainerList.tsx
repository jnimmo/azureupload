import {
  BlobServiceClient,
  ContainerItem,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { createShareLink } from "@/app/actions/createSASToken";
import ShareLinkButton from "./ShareLinkButton";
import { ListContainersResponse } from "../types";
import "server-only";

export const dynamic = "force-dynamic";

async function getContainers(): Promise<ListContainersResponse> {
  "use server";

  const storageAccountName = process.env.NEXT_PUBLIC_STORAGE_ACCOUNT;
  const secretAccountKey = process.env.SECRET_ACCESS_KEY;
  if (!storageAccountName || !secretAccountKey) {
    console.error(
      "Error getting containers, missing caseNumber or storage account SAS token"
    );
    return { error: "Missing storage account credentials." };
  }
  // Generate SAS token
  const sharedKeyCredential = new StorageSharedKeyCredential(
    storageAccountName,
    secretAccountKey
  );

  try {
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containers: ContainerItem[] = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container);
    }
    return { containers };
  } catch (error) {
    console.error("Error listing containers: ", error);
    return {
      error: "An error occurred listing the containers",
    };
  }
}

export default async function ContainerList() {
  const containersResponse = await getContainers();

  return (
    <>
      {containersResponse.error ? (
        <p className="text-red-500">{containersResponse.error}</p>
      ) : (
        <ul className="list-disc">
          {containersResponse.containers?.map((container, index) => (
            <li key={index} className="p-2 flex justify-between items-center">
              {container.name}
              <ShareLinkButton
                containerName={container.name}
                createShareLink={createShareLink}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
