import { getStore } from '@netlify/blobs';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    const { jobId } = params;

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