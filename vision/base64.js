import 'dotenv/config'; 

import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();

function encodeImage(imagePath) {
  const image = fs.readFileSync(imagePath);
  return Buffer.from(image).toString('base64');
}

const imagePath = "<image_path>";

const base64Image = encodeImage(imagePath);

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `What's in this image?` },
          {
            type: "image_url",
            image_url: {
              "url": `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    "max_tokens": 600,
  });

  console.log("choices[0]", response.choices[0]);
}
main();