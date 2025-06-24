import { defineFunction } from "@aws-amplify/backend";

// define the function with a 15-minute timeout
export const generateImage = defineFunction({
    name: 'generate-image',
    entry: './handler.ts',
    timeoutSeconds: 900, // 15 minutes
});