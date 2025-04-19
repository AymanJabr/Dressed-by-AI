import { NextRequest, NextResponse } from 'next/server'

// Validate Segmind API key
export async function POST(req: NextRequest) {
    const { apiKey } = await req.json()

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key is required' },
            { status: 400 }
        )
    }

    try {
        // Simple validation of API key by checking if it's a valid format
        // Just check if the key has a reasonable length
        if (apiKey.length < 10) {
            throw new Error('API key appears to be invalid (too short)')
        }

        // For Segmind, we don't need to fetch models, just return success
        return NextResponse.json({
            valid: true,
            message: 'API key format is valid'
        })
    } catch (error) {
        console.error('Error validating API key:', error)
        return NextResponse.json({
            valid: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 400 })
    }
} 