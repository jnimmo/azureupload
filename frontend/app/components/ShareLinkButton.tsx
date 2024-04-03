"use client";
import { ClipboardIcon } from "@heroicons/react/24/outline";

const ShareLinkButton = ({ containerName }: ShareLinkButtonProps) => {
  const handleGetShareLink = async () => {
    // Call an API endpoint to generate the SAS token for the container
    const res = await fetch(`/api?container=${containerName}`);
    const { token } = res.json();

    console.log(JSON.stringify(res));
    if (!token) {
      alert(`Failed to generate share link.: ${JSON.stringify(res)}`);
      return;
    }

    const { protocol, hostname, port, pathname } = window.location;
    const shareLink = `${protocol}//${hostname}${
      port ? ":" + port : ""
    }/?u=${token}`;

    // Copy the share link to the clipboard
    navigator.clipboard
      .writeText(shareLink)
      .then(() => alert("Share link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy share link:", err));
  };

  return (
    <div>
      <ClipboardIcon
        className="h-5 w-5 text-gray-600 hover:text-blue-500"
        onClick={handleGetShareLink}
      />
    </div>
  );
};

export default ShareLinkButton;
