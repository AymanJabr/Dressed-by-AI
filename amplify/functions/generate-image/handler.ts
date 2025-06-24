import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import multipart, { MultipartFile } from 'lambda-multipart-parser';

// Helper to create a standard JSON response
const createResponse = (statusCode: number, body: Record<string, any>): APIGatewayProxyResult => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Access-Control-Allow-Headers': '*',
    },
    body: JSON.stringify(body),
});

// Helper function to format bytes for logging
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod === 'OPTIONS') {
        // Handle CORS preflight requests
        return createResponse(200, {});
    }

    try {
        if (!event.body) {
            return createResponse(400, { error: 'Missing request body' });
        }

        // The body from API Gateway will be base64 encoded if it's multipart
        const parsed = await multipart.parse(event);

        const personImageFile = parsed.files.find((f: MultipartFile) => f.fieldname === 'personImage');
        const clothingImageFile = parsed.files.find((f: MultipartFile) => f.fieldname === 'clothingImage');
        const apiKey = parsed.apiKey;

        if (!clothingImageFile || !personImageFile || !apiKey) {
            return createResponse(400, { error: 'Missing required fields' });
        }

        const clothingBase64 = clothingImageFile.content.toString('base64');
        const personBase64 = personImageFile.content.toString('base64');

        console.log(`📊 Received base64 data sizes:`);
        console.log(`  Clothing base64: ${formatBytes(clothingBase64.length)}`);
        console.log(`  Person base64: ${formatBytes(personBase64.length)}`);

        const segmindRequestBody = {
            outfit_image: clothingBase64,
            model_image: personBase64,
            model_type: "Balanced",
            base64: true
        };

        const url = "https://api.segmind.com/v1/segfit-v1.2";
        console.log(`🔄 Sending request to Segmind API...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(segmindRequestBody),
        });

        console.log(`✅ Received response from Segmind API`);
        console.log(`  Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Segmind API error: ${response.status} ${errorText}`);
            return createResponse(500, { error: `Segmind API Error: ${response.status}`, message: errorText });
        }

        const jsonResponse = await response.json();
        const base64Data = jsonResponse.base64 || (jsonResponse as any).image;
        const imageUrl = base64Data.startsWith('data:')
            ? base64Data
            : `data:image/png;base64,${base64Data}`;

        console.log(`✅ Successfully processed image.`);
        return createResponse(200, { imageUrl });

    } catch (error) {
        console.error('Error during image generation:', error);
        return createResponse(500, { error: 'Failed to generate image due to an internal error.' });
    }
}; 