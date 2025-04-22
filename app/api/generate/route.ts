import { NextResponse } from 'next/server';

// Set a longer response processing timeout
export const maxDuration = 300; // 5 minutes timeout for serverless function

// Helper function to format bytes into human-readable format
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to log memory usage
function logMemoryUsage() {
    const memUsage = process.memoryUsage();
    console.log('MEMORY USAGE:');
    console.log(`  RSS: ${formatBytes(memUsage.rss)} - Total memory allocated`);
    console.log(`  Heap Total: ${formatBytes(memUsage.heapTotal)} - Total size of heap`);
    console.log(`  Heap Used: ${formatBytes(memUsage.heapUsed)} - Actual memory used`);
    console.log(`  External: ${formatBytes(memUsage.external)} - Memory used by C++ objects`);
}

export async function POST(request: Request) {
    try {
        console.log('🔍 Starting image generation request');
        logMemoryUsage();

        const formData = await request.formData();
        const personImage = formData.get('personImage') as File;
        const clothingImage = formData.get('clothingImage') as File;
        const apiKey = formData.get('apiKey') as string;
        const modelDescription = formData.get('modelDescription') as string || '';
        const clothDescription = formData.get('clothDescription') as string || '';

        // Log input image sizes
        console.log('📊 Input image sizes:');
        console.log(`  Clothing image: ${clothingImage ? formatBytes(clothingImage.size) : 'Not provided'}`);
        console.log(`  Person image: ${personImage ? formatBytes(personImage.size) : 'Not provided'}`);

        if (!clothingImage) {
            return NextResponse.json(
                { error: 'Clothing image is required' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Segmind API key is required' },
                { status: 400 }
            );
        }

        // Convert images to base64
        const clothingBase64 = Buffer.from(await clothingImage.arrayBuffer()).toString('base64');
        // Person image is optional in Segfit v1.1
        const personBase64 = personImage
            ? Buffer.from(await personImage.arrayBuffer()).toString('base64')
            : null;

        console.log('📊 Base64 data sizes:');
        console.log(`  Clothing base64: ${formatBytes(clothingBase64.length)}`);
        console.log(`  Person base64: ${personBase64 ? formatBytes(personBase64.length) : 'Not provided'}`);
        logMemoryUsage();

        // Create data for Segmind API
        const data: Record<string, any> = {
            outfit_image: clothingBase64,
            background_description: "aesthetic studio shoot",
            aspect_ratio: "2:3",
            model_type: "Balanced",
            controlnet_type: "Depth",
            cn_strength: 0.3,
            cn_end: 0.3,
            image_format: "png",
            image_quality: 85,
            seed: -1,
            upscale: false,
            base64: true
        };

        // Add optional parameters if provided
        if (modelDescription) {
            data.model_description = modelDescription;
        }

        if (clothDescription) {
            data.cloth_description = clothDescription;
        }

        // Add model_image if provided
        if (personBase64) {
            data.model_image = personBase64;
        }

        const url = "https://api.segmind.com/v1/segfit-v1.1";

        console.log('🔄 Sending request to Segmind API');
        console.log(`  Request payload size: ${formatBytes(JSON.stringify(data).length)}`);
        logMemoryUsage();

        // Call Segmind API using native fetch with increased timeout
        try {
            const controller = new AbortController();
            // We'll set a long timeout just for the external API call (2 minutes)
            const timeoutId = setTimeout(() => controller.abort(), 120000);

            const requestStartTime = Date.now();
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const requestDuration = Date.now() - requestStartTime;

            console.log(`✅ Received response from Segmind API in ${requestDuration}ms`);
            console.log(`  Response status: ${response.status}`);
            console.log(`  Content-Type: ${response.headers.get('content-type')}`);
            console.log(`  Content-Length: ${formatBytes(parseInt(response.headers.get('content-length') || '0'))}`);
            logMemoryUsage();

            if (!response.ok) {
                const status = response.status;

                if (status === 401) {
                    return NextResponse.json(
                        { error: 'Invalid Segmind API key. Please check your API key and try again.' },
                        { status: 401 }
                    );
                } else if (status === 429) {
                    return NextResponse.json(
                        { error: 'Segmind API rate limit exceeded. In the free tier, this is about 1 generation a minute.' },
                        { status: 429 }
                    );
                } else if (status === 406) {
                    return NextResponse.json(
                        { error: 'Not enough credits in your Segmind account.' },
                        { status: 406 }
                    );
                }

                // Try to parse error message
                let errorMessage = 'Segmind API error';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Error parsing API error response:', parseError);
                }

                return NextResponse.json(
                    { error: errorMessage },
                    { status }
                );
            }

            // Handle the response based on what the API returns
            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                // If the API returns JSON with a base64 image
                try {
                    const jsonResponse = await response.json();
                    console.log('📊 Received JSON response from API');
                    logMemoryUsage();

                    // If the API returns a base64 string directly
                    if (typeof jsonResponse === 'string' && jsonResponse.startsWith('data:image')) {
                        console.log(`  Base64 image size: ${formatBytes(jsonResponse.length)}`);
                        // Try to determine image dimensions
                        try {
                            const base64Data = jsonResponse.split(',')[1];
                            console.log(`  Decoded base64 size: ${formatBytes(base64Data.length * 0.75)}`); // Approximate size
                        } catch (e) {
                            console.error('  Error determining image size:', e);
                        }
                        return NextResponse.json({ imageUrl: jsonResponse });
                    }
                    // If the API returns an object with a base64 property
                    else if (jsonResponse.base64 || jsonResponse.image) {
                        const base64Data = jsonResponse.base64 || jsonResponse.image;
                        console.log(`  Base64 image size: ${formatBytes(base64Data.length)}`);
                        // Try to determine image dimensions
                        try {
                            if (typeof base64Data === 'string') {
                                const plainBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
                                console.log(`  Decoded base64 size: ${formatBytes(plainBase64.length * 0.75)}`); // Approximate size
                            }
                        } catch (e) {
                            console.error('  Error determining image size:', e);
                        }

                        const imageUrl = base64Data.startsWith('data:')
                            ? base64Data
                            : `data:image/png;base64,${base64Data}`;

                        console.log(`  Final imageUrl size: ${formatBytes(imageUrl.length)}`);
                        logMemoryUsage();

                        return NextResponse.json({ imageUrl });
                    }
                } catch (e) {
                    console.error('Error parsing JSON response:', e);
                }
            }

            // Default handling - treat as binary image data
            try {
                console.log('📊 Processing binary response');

                // Get response as arrayBuffer
                const imageBuffer = await response.arrayBuffer();
                console.log(`  Binary image size: ${formatBytes(imageBuffer.byteLength)}`);

                // Convert to base64
                const base64Data = Buffer.from(imageBuffer).toString('base64');
                console.log(`  Converted base64 size: ${formatBytes(base64Data.length)}`);

                const resultImageBase64 = `data:image/png;base64,${base64Data}`;
                console.log(`  Final imageUrl size with mime type: ${formatBytes(resultImageBase64.length)}`);

                logMemoryUsage();

                console.log('✅ Successfully processed image response');

                // Return the generated image as base64 with a smaller response size
                return NextResponse.json({
                    imageUrl: resultImageBase64
                }, {
                    headers: {
                        'Cache-Control': 'no-store, must-revalidate',
                        'Content-Type': 'application/json'
                    }
                });
            } catch (bufferError) {
                console.error('Error processing image buffer:', bufferError);
                return NextResponse.json(
                    { error: 'Failed to process image response' },
                    { status: 500 }
                );
            }
        } catch (apiError: any) {
            // Check if the error is an abort error
            if (apiError.name === 'AbortError') {
                console.error('API request timed out');
                return NextResponse.json(
                    { error: 'The request to the image generation API timed out. The service might be experiencing high load.' },
                    { status: 504 }
                );
            }

            console.error('Segmind API error:', apiError);

            // Generic error handling
            return NextResponse.json(
                { error: apiError.message || 'Segmind API error' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error generating image:', error);
        logMemoryUsage();
        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
} 