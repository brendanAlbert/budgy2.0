import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const {
    AzureKeyCredential,
    DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
const { PrebuiltReceiptModel } = require("./prebuilt-receipt");
const fs = require("fs");
const formRecognizerEndpoint = process.env.VITE_FORM_RECOGNIZER_ENDPOINT;
const formRecognizerApiKey = process.env.VITE_FORM_RECOGNIZER_API_KEY;

const logger = (msg: string) => {
    console.info(`${new Date()}: ${msg}`);
};

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<any> {
    logger("instantiating new AzureKeyCredential");

    const credential = new AzureKeyCredential(formRecognizerApiKey);

    logger("instantiating new DocumentAnalysisClient");

    const client = new DocumentAnalysisClient(
        formRecognizerEndpoint,
        credential
    );

    logger("beginning await client.beginAnalyzeDocument");

    let poller;

    try {
        poller = await client.beginAnalyzeDocumentFromUrl(
            PrebuiltReceiptModel,
            "add_url_to_file_in_blob_storage",
            {
                onProgress: ({ status }) => {
                    console.log(`status: ${status}`);
                },
            }
        );
    } catch (error) {
        console.log({ error });
    }

    logger("completed await client.beginAnalyzeDocument");

    logger("starting poller.pollUntilDone()");

    let doc;

    try {
        const {
            documents: [doc],
        } = await poller.pollUntilDone();

        logger("awaiting poller.pollUntilDone()");

        poller.pollUntilDone().then((doc) => {
            const { documents, pages } = doc;
            console.log({ doc, documents, pages });

            if (doc) {
                const { merchantName, items, total } = doc.fields;

                fs.writeFile(
                    "receipt_03.json",
                    JSON.stringify(doc),
                    (error) => {
                        if (error) throw error;
                        console.log({
                            msg: "wrote ocr.json to receipt3.json file! :)",
                        });
                    }
                );

                console.log("=== Receipt Information ===");
                console.log("Type:", doc.docType);
                console.log("Merchant:", merchantName && merchantName.value);

                console.log("Items:");
                for (const item of (items && items.values) || []) {
                    const { description, totalPrice } = item.properties;

                    console.log(
                        "- Description:",
                        description && description.value
                    );
                    console.log(
                        "  Total Price:",
                        totalPrice && totalPrice.value
                    );
                }

                console.log("Total:", total && total.value);

                // return {
                //     statusCode: 200,
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify({
                //         status: 200,
                //         msg: "form rec endpoint - testing upload image",
                //     }),
                // };

                context.res = {
                    status: 200,
                    body: JSON.stringify(doc),
                };
            } else {
                // context.res = {
                //     status: 400,
                //     body: JSON.stringify({
                //         msg: "error ",
                //     }),
                // };
                // return {
                //     statusCode: 400,
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify({
                //         status: 400,
                //         msg: "ERROR: Something went wrong.  form rec endpoint - testing upload image",
                //     }),
                // };
            }
        });
    } catch (err) {
        console.log({ err });
    }

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: { status: 200, body: responseMessage },
    // };
};

export default httpTrigger;
