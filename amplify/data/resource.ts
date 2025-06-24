import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateImage } from "../functions/generate-image/resource";

const schema = a.schema({
    generateImage: a
        .query()
        .arguments({
            personImage: a.string().required(),
            clothingImage: a.string().required(),
            apiKey: a.string().required(),
        })
        .returns(a.json())
        .authorization((allow) => [allow.guest()])
        .handler(a.handler.function(generateImage)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "iam",
    },
}); 