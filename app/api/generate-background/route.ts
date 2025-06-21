import { getStore } from '@netlify/blobs';
import { NextResponse } from 'next/server';

// Helper function to format bytes into human-readable format
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function POST(request: Request) {
    const store = getStore('results');

    try {
        const { personImage, clothingImage, apiKey, jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        console.log(`[${jobId}] 📊 Received base64 data sizes:`);
        console.log(`  Clothing base64: ${formatBytes(clothingImage.length)}`);
        console.log(`  Person base64: ${formatBytes(personImage.length)}`);

        // Convert base64 strings back to Buffers for processing if needed, though we send them directly.
        const clothingBase64 = clothingImage;
        const personBase64 = personImage;

        const data: Record<string, unknown> = {
            outfit_image: clothingBase64,
            model_image: personBase64,
            model_type: "Balanced",
            cn_strength: 0.35,
            cn_end: 0.35,
            image_format: "png",
            image_quality: 90,
            seed: 42,
            base64: true
        };

        const url = "https://api.segmind.com/v1/segfit-v1.2";
        console.log(`[${jobId}] 🔄 Sending request to Segmind API`);
        console.log(`  Request payload size: ${formatBytes(JSON.stringify(data).length)}`);

        // Use AbortController for a long timeout on the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`[${jobId}] ✅ Received response from Segmind API`);
        console.log(`  Response status: ${response.status}`);
        console.log(`  Content-Length: ${formatBytes(parseInt(response.headers.get('content-length') || '0'))}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[${jobId}] Segmind API error: ${response.status} ${errorText}`);
            await store.setJSON(jobId, {
                status: 'failed',
                error: `Segmind API Error: ${response.status}`,
                message: errorText,
            });
            return NextResponse.json({ success: false, error: 'Failed to process image' }, { status: 500 });
        }

        const jsonResponse = await response.json();

        const base64Data = jsonResponse.base64 || jsonResponse.image;
        console.log(`[${jobId}] 📊 Received Segmind base64 data size: ${formatBytes(base64Data.length)}`);

        const imageUrl = base64Data.startsWith('data:')
            ? base64Data
            : `data:image/png;base64,${base64Data}`;

        console.log(`[${jobId}] 💾 Storing result in blob store.`);
        await store.setJSON(jobId, {
            status: 'completed',
            imageUrl: imageUrl,
        });

        console.log(`[${jobId}] ✅ Successfully processed and stored image.`);
        return NextResponse.json({ success: true });

    } catch (error) {
        // This is the critical part: ensuring any error updates the blob store
        const store = getStore('results');
        let jobId: string | undefined;
        try {
            // Try to get the jobId from the request body if available
            const body = await request.json();
            jobId = body.jobId;
        } catch (e) {
            console.log("error:", e);
        }

        console.error(`[BACKGROUND_ERROR] An unexpected error occurred for job ${jobId || 'unknown'}:`, error);

        if (jobId) {
            await store.setJSON(jobId, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'An unknown background error occurred.',
            });
        }

        return NextResponse.json(
            { error: 'An internal server error occurred in the background task.' },
            { status: 500 }
        );
    }
} 