import { defineBackend, defineFunction } from '@aws-amplify/backend';

// define the function with a 15-minute timeout
const generateFunction = defineFunction({
    name: 'generate-image-function',
    entry: './functions/generate-image-handler.ts',
    timeoutSeconds: 900, // 15 minutes
});

// define the backend and expose the function as a public API
export const backend = defineBackend({
    generate: generateFunction,
});

// The above code automatically creates an API Gateway endpoint for the `generate` function.
// The frontend will call this new endpoint.
// We will need to configure the frontend to know the name of this new API. 