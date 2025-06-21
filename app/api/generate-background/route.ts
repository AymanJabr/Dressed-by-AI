import { getStore } from '@netlify/blobs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const store = getStore('results');

    try {
        const { personImage, clothingImage, apiKey, jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

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

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        console.log(`[${jobId}] ✅ Received response from Segmind API`);

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
        // We need the jobId to update the store, but it might not be available if parsing fails.
        // This part of the code is for catching unexpected errors in the background function itself.
        console.error('[BACKGROUND_ERROR] An unexpected error occurred:', error);

        // If we can, we'll try to get the Job ID to mark it as failed.
        try {
            const { jobId } = await request.json();
            if (jobId) {
                const store = getStore('results');
                await store.setJSON(jobId, {
                    status: 'failed',
                    error: 'An unexpected background error occurred.',
                });
            }
        } catch (parseError) {
            console.error('[BACKGROUND_ERROR] Could not parse request to get Job ID for error reporting.', parseError);
        }

        return NextResponse.json(
            { error: 'An internal server error occurred in the background task.' },
            { status: 500 }
        );
    }
} 