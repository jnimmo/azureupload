import { Suspense } from "react";

import CreateUploadRequestDialog from "@/app/components/CreateUploadRequestDialog";
import ContainerList from "../components/ContainerList";

export const revalidate = 1; // revalidate cache at most every second

export default async function Portal() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <h1 className="text-2xl font-bold">Upload Requests</h1>
        <Suspense fallback={<p>Loading containers...</p>}>
          <ContainerList />
        </Suspense>
        <CreateUploadRequestDialog />
      </div>
    </main>
  );
}
