import {
    BlobSASPermissions,
    BlobServiceClient,
    SASProtocol,
} from "@azure/storage-blob";

export const generateReadOnlySASUrl = async (
    connectionString: string,
    containerName: string,
    filename: string
) => {
    const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlobClient(filename);

    const SIXTY_MINUTES = 60 * 60 * 1000;

    const NOW = new Date();

    const accountSasTokenUrl = await blobClient.generateSasUrl({
        startsOn: NOW,
        expiresOn: new Date(new Date().valueOf() + SIXTY_MINUTES),
        permissions: BlobSASPermissions.parse("r"),
        protocol: SASProtocol.Https,
    });
    return {
        accountSasTokenUrl,
        storageAccountName: blobClient.accountName,
    };
};
