# Description
Proof of concept project to provide a simple web interface for creating containers in Azure Blob Storage for the purpose of requesting file uploads from third parties.

The admin portal enables container creation and generation of a upload request sharing link.

The generated share links include the name of the container so this can be displayed on the upload page; and a Base64 URL encoded SAS write only upload token.

The upload page can be cached by the server and the SAS write only key is extracted from the URI query params by the client.

The raw upload string consists of:
```1container_name|<SAS Key>```

Where 1 is a version number field for future use.


# Demo

- https://lemon-desert-0e568711e.5.azurestaticapps.net/portal (admin interface)

# Setup

1. Create a storage account in Azure
2. Create a .env.local file containing:

```
NEXT_PUBLIC_STORAGE_ACCOUNT=<storage account name>
SECRET_ACCESS_KEY=<storage account key>
```
Only use the SECRET_ACCESS_KEY in non-production environments, as these keys have full control over a storage account.
Leaving this blank will use the managed identity configured in Azure Static Web Apps which only needs rights to create containers and write files to the given storage account.

## Install dependencies

```
cd frontend
pnpm install
```

# Features
- Built using NextJS App router, with React Server Components (server side rendering) for the admin portal, and client side components with Stale-While-Revalidate (SWR) caching for the upload page
- Upload page utilises [Azure Storage Blob client library](https://www.npmjs.com/package/@azure/storage-blob) for browser uploads
- Uploads are split into n chunks to facilitate fast uploads of large files
- Users can drag and drop or select files to upload
- User specified metadata for file uploads
- Monitor progress or cancel uploads
- When paired with a managed identity in Azure, the credentials exposed to the web application do not require the ability to read any data, further reducing the attack surface.

# Todo

- [ ] Test with Azure Managed Identity and document exact permissions required for the identity
- [ ] Add an expiry dropdown to the share link generation to use for the SAS write only key signing
- [ ] Consider adding an expiry to container metadata to use as the expiry date for SAS signing
- [ ] Add a check to validate the SAS token when loading up the user upload page rather than 
- [ ] Consider showing metadata about the container on the admin portal (i.e. last modified time/size/number of files)
- [ ] Make the file type dropdown dynamic from a JSON file for ease of customisation
- [ ] Tidy up UI/error handling/styling
- [ ] Add a 'Show connection string' button on the upload page that users can copy and paste if they prefer to upload directly from AzCopy/Azure Storage Explorer or paste into KAPE to upload directly.
- [ ] Ensure duplicate file names are handled
- [ ] Consider hashing files on the client prior to uploading and including in the Etag for server side validation of uploaded files.


