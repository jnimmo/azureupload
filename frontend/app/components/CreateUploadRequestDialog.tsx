// CreateUploadRequestDialog.client.tsx
"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus, useFormState } from "react-dom";
import { Dialog, Transition } from "@headlessui/react";
import { createContainer } from "@/app/actions/createContainer";

export default function CreateUploadRequestDialog() {
  const router = useRouter();
  const { pending } = useFormStatus();
  const [isOpen, setIsOpen] = useState(false);

  const [containerName, setContainerName] = useState("");
  const [containerDescription, setContainerDescription] = useState("");

  function closeModal() {
    setIsOpen(false);
    setContainerName("");
    setContainerDescription("");
  }

  const initialState = {
    message: "",
    success: false,
  };

  function openModal() {
    setIsOpen(true);
  }

  const [state, formAction] = useFormState(createContainer, initialState);

  useEffect(() => {
    if (state.success) {
      closeModal();
    }
  }, [state]);

  return (
    <>
      <div className="inset-0 flex items-center justify-center p-4">
        <button
          type="button"
          onClick={openModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Create New Upload Request
        </button>
      </div>

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
                as={Fragment}
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
                    New Upload Request
                  </Dialog.Title>
                  <form
                    action={async (FormData) => {
                      await formAction(FormData);
                      router.refresh();
                    }}
                    className="mt-2"
                  >
                    <div className="mt-4">
                      <label
                        htmlFor="containerName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Container Name
                      </label>
                      <input
                        type="text"
                        name="containerName"
                        id="containerName"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={containerName}
                        onChange={(e) => setContainerName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <label
                        htmlFor="containerDescription"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        name="containerDescription"
                        id="containerDescription"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={containerDescription}
                        onChange={(e) =>
                          setContainerDescription(e.target.value)
                        }
                      />
                    </div>
                    <p aria-live="polite" className="sr-only">
                      {state?.message}
                    </p>
                    <div className="mt-4">
                      <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex justify-center px-4"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
