
import type { Schema } from '../../data/resource';


// Helper function to format bytes for logging
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export const handler: Schema['generateImage']['functionHandler'] = async (event) => {

    try {

        // The arguments are now destructured from `event.arguments`.
        const { personImage, clothingImage, apiKey } = event.arguments;

        // The base64 strings are now directly available from the event arguments.
        const clothingBase64 = clothingImage;
        const personBase64 = personImage;

        console.log(`📊 Received base64 data sizes:`);
        console.log(`  Clothing base64: ${formatBytes(clothingBase64.length)}`);
        console.log(`  Person base64: ${formatBytes(personBase64.length)}`);

        const segmindRequestBody = {
            outfit_image: clothingImage,
            model_image: personImage,
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
            throw new Error(`Segmind API Error: ${response.status} - ${errorText}`);
        }

        const jsonResponse = await response.json();
        const base64Data = jsonResponse.base64 || (jsonResponse as any).image;
        const imageUrl = base64Data.startsWith('data:')
            ? base64Data
            : `data:image/png;base64,${base64Data}`;

        console.log(`✅ Successfully processed image.`);
        return { imageUrl };

    } catch (error) {
        console.error('Error during image generation:', error);
        // return createResponse(500, { error: 'Failed to generate image due to an internal error.' });
        if (error instanceof Error) {
            throw new Error(
                `Failed to generate image due to an internal error: ${error.message}`
            );
        }
        throw new Error('Failed to generate image due to an unknown internal error.');
    }
}; 