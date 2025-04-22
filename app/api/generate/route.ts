import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const personImage = formData.get('personImage') as File;
        const clothingImage = formData.get('clothingImage') as File;
        const apiKey = formData.get('apiKey') as string;
        const modelDescription = formData.get('modelDescription') as string || '';
        const clothDescription = formData.get('clothDescription') as string || '';

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
            image_quality: 95,
            seed: -1,
            upscale: false,
            base64: false
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