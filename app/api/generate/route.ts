import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'crypto';

export const maxDuration = 45; // Keep a slightly longer duration for safety, though it should be fast.

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

        const jobId = randomUUID();
        const store = getStore('results');

        // Set an initial "pending" status
        await store.setJSON(jobId, { status: 'pending', jobId });

        // Get the base URL to construct the background function URL
        const url = new URL(request.url);
        const backgroundFunctionUrl = `${url.origin}/api/generate-background`;

        // Trigger the background function without awaiting the response
        fetch(backgroundFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personImage: personBase64,
                clothingImage: clothingBase64,
                apiKey,
                jobId,
            }),
        });

        // Immediately return the jobId to the client
        return NextResponse.json({ jobId });

    } catch (error) {
        console.error('Error starting image generation job:', error);
        return NextResponse.json(
            { error: 'Failed to start image generation job.' },
            { status: 500 }
        );
    }
} 