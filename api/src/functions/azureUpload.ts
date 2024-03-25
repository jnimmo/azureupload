import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function azureUpload(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
    const storageAccountKey = process.env.STORAGE_ACCOUNT_KEY; // Ensure this is securely stored, e.g., in Application Settings
    const { caseNumber, caseName, contactEmail, validityPeriod } = req.body;

    if (!caseNumber) {
        context.res = {
            status: 400,
            body: "Please provide a caseNumber in the request body."
        };
        return;
    }

    try {
        const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);
        const blobServiceClient = new BlobServiceClient(
            `https://${storageAccountName}.blob.core.windows.net`, 
            sharedKeyCredential
        );

        // Create the container if it doesn't exist
        const containerName = caseNumber;
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists({
            metadata: {
                caseName,
                contactEmail
            }
        });

        // Generate write-only SAS for the container
        const sasPermissions = new ContainerSASPermissions();
        sasPermissions.write = true;

        const sasOptions = {
            containerName,
            permissions: sasPermissions.toString(),
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + validityPeriod * 60 * 1000), // validityPeriod in minutes
        };

        const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

        context.res = {
            body: {
                message: "Container created and SAS generated successfully.",
                sasToken: `?${sasToken}`,
                containerUrl: containerClient.url
            }
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: `An error occurred: ${error.message}`
        };
    }
};

app.http('azureUpload', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: azureUpload
});
