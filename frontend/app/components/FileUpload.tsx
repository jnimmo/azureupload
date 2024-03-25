// src/components/FileUpload.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { UploadFile } from "../types";
import { uploadFileToAzureBlob } from "../utils/upload"; // This will be defined in the next step
import { useContainerToken } from "@/app/utils/useContainerToken";

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const uploadRequest = useContainerToken();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file: file,
      id: uuidv4(),
      progress: 0,
      error: "",
      status: "pending",
      fileType: "", // Default type, user will need to select
      assetName: "", // User defined
    }));
    setFiles((curr) => [...curr, ...mappedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const updateFileDetails = (
    id: string,
    field: keyof UploadFile,
    value: string
  ) => {
    setFiles((files) =>
      files.map((file) => (file.id === id ? { ...file, [field]: value } : file))
    );
  };

  const handleAbort = async (file: UploadFile) => {
    if (file.abortController) {
      file.abortController?.abort();
    }
  };
  const handleUpload = async (file: UploadFile) => {
    const abortController = new AbortController();
    file.abortController = abortController;

    const onProgress = (progress: number) => {
      updateFileDetails(file.id, "progress", progress.toString());
    };

    // Implement upload logic using provided utility function
    // You will need to pass file, onProgress callback, and other necessary information to `uploadFileToAzureBlob`
    try {
      if (uploadRequest?.container && uploadRequest?.token && file) {
        updateFileDetails(file.id, "status", "uploading");
        const result = await uploadFileToAzureBlob(
          file,
          uploadRequest.container,
          uploadRequest.token,
          onProgress,
          abortController.signal
        );
        if (result.success) {
          updateFileDetails(file.id, "status", "completed");
        } else {
          updateFileDetails(file.id, "status", "error");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      updateFileDetails(file.id, "status", "error");
    }
  };

  // Handle other events like selecting file type, asset name, and starting the upload
  if (!uploadRequest) {
    return (
      <div>
        <p>Invalid URL. Please check you have copied the URL correctly.</p>
      </div>
    );
  }
  return (
    <div>
      <div>
        <h1>Upload Request {uploadRequest.container}</h1>
      </div>
      <div
        {...getRootProps()}
        className="dropzone border-dashed border-2 border-gray-300 p-4 text-center"
      >
        <input {...getInputProps()} />
        <p>Click or drag and drop here to select files to upload.</p>
      </div>
      <div className="mt-4">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Size
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Asset Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={file.id} className="hover:bg-gray-100">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {file.file.name}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {Math.round(file.file.size / 1024)} KB
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <select
                    className="border border-gray-300 rounded"
                    value={file.fileType}
                    disabled={file.status !== "pending"}
                    onChange={(e) =>
                      updateFileDetails(file.id, "fileType", e.target.value)
                    }
                  >
                    <option value="">Select file type</option>
                    <option value="KAPE Image">KAPE Image</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <input
                    type="text"
                    value={file.assetName}
                    disabled={file.status !== "pending"}
                    onChange={(e) =>
                      updateFileDetails(file.id, "assetName", e.target.value)
                    }
                    className="border border-gray-300 rounded"
                  />
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {file.progress > 0 && file.progress < 100 ? (
                    <progress value={file.progress} max="100"></progress>
                  ) : (
                    ""
                  )}
                  {file.status === "completed" && <p>Complete</p>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {(file.status === "pending" || file.status === "error") && (
                    <button
                      onClick={() => handleUpload(file)}
                      disabled={!file.fileType || !file.assetName}
                      className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    >
                      Upload
                    </button>
                  )}
                  {file.status === "uploading" && (
                    <button
                      onClick={() => handleAbort(file)}
                      className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileUpload;
