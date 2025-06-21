import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const jobId = pathSegments.pop();

    if (!jobId) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    try {
        const store = getStore('results');
        const data = await store.get(jobId, { type: 'json' });

        if (!data) {
            return NextResponse.json({ status: 'pending' });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching status for job ${jobId}:`, error);
        return NextResponse.json(
            { status: 'failed', error: 'Could not retrieve job status.' },
            { status: 500 }
        );
    }
} 