import { NextResponse } from 'next/server';

// Helper function to format bytes for logging
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const personImageFile = formData.get('personImage') as File;
        const clothingImageFile = formData.get('clothingImage') as File;
        const apiKey = formData.get('apiKey') as string;

        if (!clothingImageFile || !personImageFile || !apiKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const clothingBase64 = Buffer.from(await clothingImageFile.arrayBuffer()).toString('base64');
        const personBase64 = Buffer.from(await personImageFile.arrayBuffer()).toString('base64');

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
            return NextResponse.json({ error: `Segmind API Error: ${response.status}`, message: errorText }, { status: 500 });
        }

        const jsonResponse = await response.json();
        const base64Data = jsonResponse.base64 || jsonResponse.image;
        const imageUrl = base64Data.startsWith('data:')
            ? base64Data
            : `data:image/png;base64,${base64Data}`;

        console.log(`✅ Successfully processed image.`);
        // Immediately return the final image URL to the client
        return NextResponse.json({ imageUrl });

    } catch (error) {
        console.error('Error during image generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate image due to an internal error.' },
            { status: 500 }
        );
    }
} 