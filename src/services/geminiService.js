import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Checks if a given string is a valid URL.
 *
 * @param {string} string - The string to validate as a URL.
 * @returns {boolean} Returns true if the string is a valid URL, otherwise false.
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Extracts and returns the main content text from a given URL.
 *
 * @param {string} url - The URL of the webpage to extract content from.
 * @returns {Promise<string|null>} A promise that resolves to the extracted article text,
 * or null if an error occurs during the extraction process.
 */
async function extractContentFromUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let articleText = $('article').text() ||
      $('div[itemprop="articleBody"]').text() ||
      $('div[class*="content"]').text() ||
      $('div.article-content').text() ||
      $('section.post-content').text();

    // Basic cleaning
    articleText = articleText.replace(/\s+/g, ' ').trim();

    return articleText;
  } catch (error) {
    console.error(`Error extracting content from URL ${url}:`, error);
    return null;
  }
}

/**
 * Sends a query to the Gemini model, optionally incorporating additional context and extracting article content from any URLs found in the query.
 *
 * If URLs are detected in the query, attempts to fetch and prepend their article content to the context for improved response relevance.
 * Returns the model's text response or an error message if the request fails.
 *
 * @param {string} query - The user's question or prompt, which may include URLs.
 * @param {Array} contexts - Optional array of context objects to provide additional information.
 * @returns {Promise<string>} The Gemini model's response or an error message.
 */
async function queryGemini(query, contexts = []) {
  let contextText = contexts.map(c => c.payload.content).join('\n');
  let finalQuery = query;

  // Check if the query contains a URL
  const urlMatches = query.match(/(https?:\/\/[^\s]+)/g);
  if (urlMatches && urlMatches.length > 0) {
    for (const url of urlMatches) {
      if (isValidUrl(url)) {
        const extractedContent = await extractContentFromUrl(url);
        if (extractedContent) {

          // Prepend it so it's prioritized
          contextText = `Article Content from ${url}:\n${extractedContent}\n\n${contextText}`;
          finalQuery = finalQuery.replace(url, '[article content]');
        } else {
          finalQuery += ` (Note: Could not retrieve content from ${url})`;
        }
      }
    }
  }

  const prompt = `Context:\n${contextText}\n\nQuestion: ${finalQuery}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // or "gemini-pro"
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const candidate = response.candidates?.[0];
    const contentParts = candidate?.content?.parts;

    if (contentParts && contentParts.length > 0) {
      const textResponse = contentParts.map(part => part.text).join('');
      return textResponse;
    } else {
      return 'No response from Gemini.';
    }
  } catch (error) {
    console.error('Error querying Gemini:', error);
    return 'Error querying Gemini.';
  }
}

export { queryGemini };