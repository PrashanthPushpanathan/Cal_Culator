import { OpenAI } from 'openai';  // Importiere OpenAI-Paket
import * as FileSystem from 'expo-file-system';

// Define the structure of the Nutrients object (all in grams)
type Nutrients = {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
};

// Convert the image to base64
async function getImgInBase64(imageUri: string): Promise<string> {
    try {
        // Read the image file as base64 string
        const base64String = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64String;
    } catch (error) {
        console.error('Error reading image as base64:', error);
        throw error;
    }
}

// Definiere die Klasse für die Bildanalyse
export class ImageAnalyzer {
    private static openAI = new OpenAI({
        apiKey: '', // Replace with your OpenAI API key
    });

    // Function to create the assistant (this is not used in your `analyseImage` method but could be useful to set up an assistant)
    public static async createAssistant() {
        const analyseFoodImage = await this.openAI.beta.assistants.create({
            instructions: `You are a food analysis Bot. Your responses all have the exact same structure. 
                You are given Images and you will give a JSON response in which you contain the following properties:
                calories (as calories), protein (in grams), fat (in grams), carbohydrates (in grams)
                They are displayed like this:
                {
                    "calories": 300,
                    "protein": 10,
                    "fat": 20,
                    "carbohydrates": 40
                }
                If you can't identify the food, just put four Zeros.
                {
                    "calories": 0,
                    "protein": 0,
                    "fat": 0,
                    "carbohydrates": 0
                }
                BUT YOUR RESPONSE IS ALWAYS IN THIS JSON (WITH THESE EXACT PROPERTIES).`,
            name: "FoodAnalyser",
            tools: [{ type: "code_interpreter" }],
            model: "gpt-4o",
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "Nutrients",
                    schema: {
                        calories: { type: "number" },
                        protein: { type: "number" },
                        fat: { type: "number" },
                        carbohydrates: { type: "number" },
                        additionalProperties: false
                    },
                    strict: true
                },
            }
        });
    }

    // Function to analyze an image
    public static async analyseImage(imageUrl: string): Promise<Nutrients> {
        try {
            const base64Image = await getImgInBase64(imageUrl); // Await the base64 conversion

            const response = await this.openAI.chat.completions.create({
                model: "gpt-4.1",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: `You are a food analysis Bot. Your responses all have the exact same structure. 
                                You are given Images and you will give a JSON response in which you contain the following properties:
                                calories (as calories), protein (in grams), fat (in grams), carbohydrates (in grams)
                                They are displayed like this:
                                {
                                    "calories": 300,
                                    "protein": 10,
                                    "fat": 20,
                                    "carbohydrates": 40
                                }
                                If you can't identify the food, just put four Zeros.
                                {
                                    "calories": 0,
                                    "protein": 0,
                                    "fat": 0,
                                    "carbohydrates": 0
                                }
                                BUT YOUR RESPONSE IS ALWAYS IN THIS JSON (WITH THESE EXACT PROPERTIES).`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            }
                        ]
                    }
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "Nutrients",
                        schema: {
                            calories: { type: "number" },
                            protein: { type: "number" },
                            fat: { type: "number" },
                            carbohydrates: { type: "number" },
                            additionalProperties: false
                        },
                        strict: true
                    },
                }
            });

            // Parse the response to get the structured data
            const content = response.choices[0].message.content??"";
            const nutrients: Nutrients = JSON.parse(content);

            // Return the structured Nutrients object
            return nutrients;

        } catch (error) {
            console.error("Error during image analysis:", error);
            // Return a default value in case of error
            return {
                calories: 0,
                protein: 0,
                fat: 0,
                carbohydrates: 0
            };
        }
    }
}