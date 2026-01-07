import { OpenAI } from 'openai'; // Importiere OpenAI-Paket
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

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
// Get Token form config
const apiToken = Constants.expoConfig?.extra?.GptToken;

// ImageAnalyzer util: analyzes an image using OpenAI's GPT model to extract nutritional information
export class ImageAnalyzer {
  private static openAI = new OpenAI({
    apiKey: apiToken,
  });

  // Function to analyze an image
  public static async analyseImage(imageUrl: string): Promise<Nutrients> {
    try {
      const base64Image = await getImgInBase64(imageUrl);

      const response = await this.openAI.chat.completions.create({
        model: 'gpt-4.1-mini', // or "gpt-4o"
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `
                                Analyze this food image and return ONLY a JSON object with these exact properties:
                                - calories (number)
                                - protein (number, grams)
                                - fat (number, grams)
                                - carbohydrates (number, grams)

                                Do the whole Produkt and not per 100g.

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
                                
                                DO NOT include any additional text or explanation, ONLY the JSON object.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content ?? '';

      // First, check if the content is valid JSON
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        throw new Error('Response was not valid JSON');
      }

      // Then validate the structure
      if (
        typeof parsed !== 'object' ||
        typeof parsed.calories !== 'number' ||
        typeof parsed.protein !== 'number' ||
        typeof parsed.fat !== 'number' ||
        typeof parsed.carbohydrates !== 'number'
      ) {
        throw new Error('Response did not match expected format');
      }

      return {
        calories: parsed.calories,
        protein: parsed.protein,
        fat: parsed.fat,
        carbohydrates: parsed.carbohydrates,
      };
    } catch (error) {
      console.error('Error during image analysis:', error);
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
      };
    }
  }
}
