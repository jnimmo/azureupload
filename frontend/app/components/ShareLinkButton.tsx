"use client";
import { Dialog, Transition } from "@headlessui/react";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";

interface ShareLinkButtonProps {
  containerName: string;
  createShareLink: (
    containerName: string
  ) => Promise<{ token?: string; error?: string }>;
}

const ShareLinkButton = ({
  containerName,
  createShareLink,
}: ShareLinkButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  async function onClick(event: MouseEvent) {
    const response = await createShareLink(containerName);

    console.log(JSON.stringify(response));
    if (!response.token) {
      alert(`Failed to generate share link.: ${JSON.stringify(response)}`);
      return;
    }

    const { protocol, hostname, port, pathname } = window.location;
    const shareLink = `${protocol}//${hostname}${port ? ":" + port : ""}/?u=${
      response.token
    }`;

    setIsOpen(true);
    setShareLink(shareLink);

    // Copy the share link to the clipboard
    navigator.clipboard
      .writeText(shareLink)
      .then(() => alert("Share link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy share link:", err));
  }

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Upload request link for
                  </Dialog.Title>
                  <div>
                    <input
                      disabled
                      className="dark:text-gray-500"
                      value={shareLink}
                    ></input>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <ClipboardIcon
        className="h-5 w-5 text-gray-600 hover:text-blue-500"
        onClick={onClick}
      />
    </div>
  );
};

export default ShareLinkButton;
