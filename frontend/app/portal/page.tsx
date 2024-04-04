import { Suspense } from "react";

import CreateUploadRequestDialog from "@/app/components/CreateUploadRequestDialog";
import ContainerList from "../components/ContainerList";
import { UserInfo } from "../components/UserInfo";

export const revalidate = 1; // revalidate cache at most every second

export default async function Portal() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <div className="z-10 max-w-5xl w-full flex flex-col">
        <h1 className="text-2xl font-bold">Upload Requests</h1>
        <Suspense fallback={<p>Loading user info...</p>}>
          <UserInfo />
        </Suspense>
        <Suspense fallback={<p>Loading containers...</p>}>
          <ContainerList />
        </Suspense>
        <CreateUploadRequestDialog />
      </div>
    </main>
  );
}
