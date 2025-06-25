import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource.ts';
import { generateImage } from './functions/generate-image/resource.ts';


// define the backend and expose the function as a public API
defineBackend({
    generateImage,
    data,
});
