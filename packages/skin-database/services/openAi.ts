import fs from "node:fs";
import SkinModel from "../data/SkinModel.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

const prompt = `
You are a digital preservationist being presented with a screenshot of a Winamp
skin. Write a short description of the skin which can be used to index the skin
for search retrieval.

Do not describe any features which are common to all Winamp skins, such as the
set of UI elements visible.

The description should be concise and descriptive, and should not include any
personal opinions or judgement. The description should be written in English and
should be no longer than 200 characters.`;

const prompt2 = `You are a staff digital preservationist working at the Internet Archive.
You have been tasked with identifying a comma separated list of tags for a Winamp skin to
be used for indexing purposes. Ignore the names of the tracks in the playlist.`;

export async function generateDescription(skin: SkinModel): Promise<string> {
  const url = skin.getScreenshotUrl();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt2 },
          { type: "image_url", image_url: { url } },
        ],
      },
    ],
  });
  if (typeof response.choices[0].message.content !== "string") {
    throw new Error("OpenAI response is not a string");
  }
  return response.choices[0].message.content;
}
