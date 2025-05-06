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
            const base64Image = await getImgInBase64(imageUrl);
    
            const response = await this.openAI.chat.completions.create({
                model: "gpt-4-turbo", // or "gpt-4o"
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: `Analyze this food image and return ONLY a JSON object with these exact properties:
                                - calories (number)
                                - protein (number, grams)
                                - fat (number, grams)
                                - carbohydrates (number, grams)
                                
                                Example response:
                                {
                                    "calories": 300,
                                    "protein": 20,
                                    "fat": 10,
                                    "carbohydrates": 40
                                }
                                
                                If you can't identify the food, return:
                                {
                                    "calories": 0,
                                    "protein": 0,
                                    "fat": 0,
                                    "carbohydrates": 0
                                }
                                
                                DO NOT include any additional text or explanation, ONLY the JSON object.`
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
                response_format: { type: "json_object" }
            });
    
            const content = response.choices[0].message.content ?? "";
            
            // First, check if the content is valid JSON
            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch (e) {
                throw new Error("Response was not valid JSON");
            }
    
            // Then validate the structure
            if (typeof parsed !== "object" || 
                typeof parsed.calories !== "number" ||
                typeof parsed.protein !== "number" ||
                typeof parsed.fat !== "number" ||
                typeof parsed.carbohydrates !== "number") {
                throw new Error("Response did not match expected format");
            }
    
            return {
                calories: parsed.calories,
                protein: parsed.protein,
                fat: parsed.fat,
                carbohydrates: parsed.carbohydrates
            };
    
        } catch (error) {
            console.error("Error during image analysis:", error);
            return {
                calories: 0,
                protein: 0,
                fat: 0,
                carbohydrates: 0
            };
        }
    }
}