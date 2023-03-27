import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
const storageConnectionString = process.env.VITE_RECEIPT_STORAGE_ACCOUNT;
import HTTP_CODES from "http-status-enum";
const { guid } = require("./guid");

const {
    AzureKeyCredential,
    DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
const { PrebuiltReceiptModel } = require("./prebuilt-receipt");
const fs = require("fs");
const formRecognizerEndpoint = process.env.VITE_FORM_RECOGNIZER_ENDPOINT;
const formRecognizerApiKey = process.env.VITE_FORM_RECOGNIZER_API_KEY;

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<any> {
    return await version2(context, req);
};

export default httpTrigger;

import * as multipart from "parse-multipart";
import { generateReadOnlySASUrl } from "./azure-storage-blob-sas-url";

const version1 = async (context: Context, req: HttpRequest) => {
    context.log("upload HTTP trigger function processed a request.");

    if (!storageConnectionString) {
        context.res.body = "VITE_receiptStorageAccount env var is not defined";
        context.res.status = HTTP_CODES.BAD_REQUEST;
        return context.res;
    }

    if (!req.body || !req.body.length) {
        context.res.body = `Request body is not defined`;
        context.res.status = HTTP_CODES.BAD_REQUEST;
        return context.res;
    }

    try {
        const bodyBuffer = Buffer.from(req.body);
        const boundary = multipart.getBoundary(req.headers["content-type"]);
        const parts = multipart.Parse(bodyBuffer, boundary);

        // The file buffer is corrupted or incomplete?
        if (!parts?.length) {
            context.res.body = "File buffer is incorrect";
            context.res.status = HTTP_CODES.BAD_REQUEST;
            return context.res;
        }

        context.bindings.newReceipt = parts[0]?.data;

        const fileName = "testFileName"; // see if name comes from upload
        const containerName = "receipts";

        const sasInfo = await generateReadOnlySASUrl(
            storageConnectionString,
            containerName,
            fileName
        );

        context.res.body = {
            fileName,
            storageAccountName: sasInfo.storageAccountName,
            containerName,
            url: sasInfo.accountSasTokenUrl,
        };
    } catch (err) {
        context.log.error(err.message);
        context.res.body = { error: `${err.message}` };
        context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
    }

    return context.res;
    // context.bindings.newReceipt = req.body;

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage,
    // };
};

const logger = (msg: string) => {
    console.info(`${new Date()}: ${msg}`);
};

const version2 = async (context: Context, req: HttpRequest) => {
    const data = Buffer.from(req.body, "base64");

    logger("instantiating new AzureKeyCredential");

    const credential = new AzureKeyCredential(formRecognizerApiKey);

    logger("instantiating new DocumentAnalysisClient");

    const client = new DocumentAnalysisClient(
        formRecognizerEndpoint,
        credential
    );

    logger("beginning await client.beginAnalyzeDocument");

    let poller: any;

    try {
        poller = await client.beginAnalyzeDocument(PrebuiltReceiptModel, data, {
            onProgress: ({ status }) => {
                console.log(`status: ${status}`);
            },
        });
    } catch (error) {
        console.log({ error });
    }

    logger("completed await client.beginAnalyzeDocument");

    logger("starting poller.pollUntilDone()");

    const {
        documents: [doc],
    } = await poller.pollUntilDone();

    if (doc) {
        const { merchantName, items, total, transactionDate } = doc.fields;

        // fs.writeFile("receipt_01.json", JSON.stringify(doc), (error) => {
        //     if (error) throw error;
        //     console.log({
        //         msg: "wrote ocr.json to receipt3.json file! :)",
        //     });
        // });

        console.log("=== Receipt Information ===");
        console.log("Type:", doc.docType);
        console.log("Merchant:", merchantName && merchantName.value);

        console.log("Items:");
        let purchases = [];
        for (const item of (items && items.values) || []) {
            const { description, totalPrice } = item.properties;

            console.log("- Description:", description && description.value);
            console.log("  Total Price:", totalPrice && totalPrice.value);
            purchases.push({
                description: description && description.value,
                totalPrice: totalPrice && totalPrice.value,
            });
        }

        console.log("Total:", total && total.value);

        // context.res = {
        //     status: 200,
        //     body: JSON.stringify(doc),
        // };

        //   const data = Buffer.from(req.body, "base64");

        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const time = d.toLocaleTimeString();

        const store = merchantName.value.toLowerCase();

        // const store = req.headers["authorization"];

        const fileName = `${store}-${transactionDate.value}.pdf`;

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            storageConnectionString
        );

        const containerClient =
            blobServiceClient.getContainerClient("receipts");

        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        // const response2 = await blockBlobClient.uploadFile()

        const response = await blockBlobClient.uploadData(data, {
            blobHTTPHeaders: {
                blobContentType: "application/pdf",
            },
        });

        if (response._response.status !== 201) {
            context.res.body = "something went wrong during doc blob upload";
            context.res.status = HTTP_CODES.BAD_REQUEST;
            return context.res;
        }

        const newId = guid();
        context.res.body = JSON.stringify({ newId });
        context.res.status = HTTP_CODES.CREATED;

        // context.bindings.newReceipt = JSON.stringify({
        //     body: "new file uploaded",
        //     file: `${blockBlobClient.url}`,
        //     date: new Date(),
        // });

        context.bindings.receiptDB = JSON.stringify([
            {
                id: newId,
                fileName,
                uri: blockBlobClient.url,
                store,
                transactionDate: transactionDate && transactionDate.content,
                total: total.value,
                purchases,
            },
        ]);

        return context.res;
    }
};
