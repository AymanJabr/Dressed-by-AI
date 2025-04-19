import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const personImage = formData.get('personImage') as File;
        const clothingImage = formData.get('clothingImage') as File;
        const apiKey = formData.get('apiKey') as string;
        const category = formData.get('category') as 'upper_body' | 'lower_body' | 'dresses' || 'upper_body';

        if (!personImage || !clothingImage) {
            return NextResponse.json(
                { error: 'Both person and clothing images are required' },
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
        const personBase64 = Buffer.from(await personImage.arrayBuffer()).toString('base64');
        const clothingBase64 = Buffer.from(await clothingImage.arrayBuffer()).toString('base64');

        // Create data for Segmind API
        const data = {
            crop: false, // Set to true if image isn't 3:4 ratio
            seed: 42,
            steps: 30,
            category: category,
            force_dc: category === 'dresses', // Set force_dc to true when category is dresses as per API docs
            human_img: personBase64,  // No data:image prefix
            garm_img: clothingBase64, // No data:image prefix
            mask_only: false
        };

        const url = "https://api.segmind.com/v1/idm-vton";

        // Call Segmind API using native fetch
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const status = response.status;

                if (status === 401) {
                    return NextResponse.json(
                        { error: 'Invalid Segmind API key. Please check your API key and try again.' },
                        { status: 401 }
                    );
                } else if (status === 429) {
                    return NextResponse.json(
                        { error: 'Segmind API rate limit exceeded. Please try again later.' },
                        { status: 429 }
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

            // Get response as arrayBuffer and convert to base64
            const imageBuffer = await response.arrayBuffer();
            const resultImageBase64 = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;

            // Return the generated image as base64
            return NextResponse.json({
                imageUrl: resultImageBase64
            });
        } catch (apiError: any) {
            console.error('Segmind API error:', apiError);

            // Generic error handling
            return NextResponse.json(
                { error: apiError.message || 'Segmind API error' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
} 