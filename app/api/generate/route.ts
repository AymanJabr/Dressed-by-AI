import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const personImage = formData.get('personImage') as File;
        const clothingImage = formData.get('clothingImage') as File;

        if (!personImage || !clothingImage) {
            return NextResponse.json(
                { error: 'Both person and clothing images are required' },
                { status: 400 }
            );
        }

        // Convert images to base64
        const personBase64 = Buffer.from(await personImage.arrayBuffer()).toString('base64');
        const clothingBase64 = Buffer.from(await clothingImage.arrayBuffer()).toString('base64');

        // Create vision API call with GPT-4o
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in fashion and photo editing. You'll receive two images - a person and a clothing item. Generate a realistic image of the person wearing that clothing item."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Generate a realistic image of the person wearing the clothing item. Make the result look natural and photorealistic."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${personBase64}`,
                                detail: "high"
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${clothingBase64}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: "text" }
        });

        // Extract the image URL from the response
        const generatedImageUrl = response.choices[0].message.content;

        // Return the generated image URL
        return NextResponse.json({
            imageUrl: generatedImageUrl
        });

    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: 'Failed to generate image' },
            { status: 500 }
        );
    }
} 