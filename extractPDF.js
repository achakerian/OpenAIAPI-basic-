// Import required modules
const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require('openai');

// Load and configure OpenAI API
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdf(dataBuffer);
    return data.text; // Extracted text from PDF
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

async function processPrompt(prompt) {
  try {
      const response = await client.chat.completions.create({
          model: "gpt-4o-mini", // Use the appropriate model
          messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content;
  } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return "Error processing prompt";
  }
}

// Main function to handle the workflow
async function main(prompt) {
  try {
    const pdf = await extractTextFromPDF('example.pdf'); // Replace with your PDF path
    const response = await processPrompt(prompt + pdf);
    console.log('Response from OpenAI:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

main("give me ten viva style questions for an academic to test a students understanding of this document");
