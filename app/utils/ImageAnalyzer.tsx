import { OpenAI } from 'openai';
import * as FileSystem from 'expo-file-system';

type Nutrients = {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
};

async function getImgInBase64(imageUri: string): Promise<string> {
  try {
    const base64String = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64String;
  } catch (error) {
    console.error('Error reading image as base64:', error);
    throw error;
  }
}

export class ImageAnalyzer {
  private static openAI = new OpenAI({
    apiKey: '', // Replace with your actual API key
  });

  public static async analyseImage(imageUri: string): Promise<Nutrients> {
    try {
      const base64Image = await getImgInBase64(imageUri);

      const response = await this.openAI.chat.completions.create({
        model: "gpt-4.1-mini", // Updated to current vision model
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
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content ?? "";
      
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        throw new Error("AI response was not valid JSON");
      }

      if (typeof parsed !== "object" || 
          typeof parsed.calories !== "number" ||
          typeof parsed.protein !== "number" ||
          typeof parsed.fat !== "number" ||
          typeof parsed.carbohydrates !== "number") {
        throw new Error("AI response did not match expected nutrition format");
      }

      return {
        calories: parsed.calories,
        protein: parsed.protein,
        fat: parsed.fat,
        carbohydrates: parsed.carbohydrates
      };

    } catch (error) {
      console.error("Error during image analysis:", error);
      throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}