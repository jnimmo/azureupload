import { ContainerItem } from "@azure/storage-blob";
import { createShareLink } from "@/app/actions/createSASToken";
import ShareLinkButton from "./ShareLinkButton";
import { ListContainersResponse } from "../types";
import "server-only";
import { getAuthenticatedBlobStorageClient } from "../data/getAuthenticatedBlobClient";

export const dynamic = "force-dynamic";

async function getContainers(): Promise<ListContainersResponse> {
  "use server";

  const blobServiceClient = await getAuthenticatedBlobStorageClient();
  if (!blobServiceClient) {
    return {
      error: "An error occurred getting the blob service client",
    };
  }
  try {
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
