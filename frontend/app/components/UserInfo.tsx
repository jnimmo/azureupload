"use server";

import { headers } from "next/headers";

export async function UserInfo() {
  const headersList = headers();
  let clientPrincipal = null;
  try {
    clientPrincipal = JSON.parse(
      atob(headersList.get("x-ms-client-principal") || "")
    );
  } catch (error) {}

  return (
    <>
      <div>
        <p>
          Welcome {clientPrincipal ? clientPrincipal.userId : "unknown user"}
        </p>
      </div>
    </>
  );
}
