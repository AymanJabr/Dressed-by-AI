import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource.js';
import { generateImage } from './functions/generate-image/resource.js';


// define the backend and expose the function as a public API
defineBackend({
    generateImage,
    data,
});
