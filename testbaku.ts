import { exec } from "child_process";
import { writeFile } from "fs/promises";

require("dotenv").config();
async function genConversation(input: string) {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: input }),
    });
    const data = (await response.json()) as { result: { content: string } };
    await generateVoice(data.result.content);
  } catch (e) {
    console.log("genConversation error: ");
    console.log(e);
  }
}

async function generateVoice(userText: string) {
  try {
    const response = await fetch(
      `https://deprecatedapis.tts.quest/v2/voicevox/audio/?text=${userText}&key=${process.env.VOICE_KEY}&speaker=1`
    );
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioFilePath = "/tmp/audio_output.wav";

    await writeFile(audioFilePath, buffer);

    exec(`aplay ${audioFilePath}`, (error) => {
      if (error) {
        console.log(`Error playing audio: ${error}`);
      }
    });
  } catch (e) {
    console.log("generateVoice error: ");
    console.log(e);
  }
}

import * as fs from "fs";

const uploadWav = async () => {
  const formData = new FormData();
  const endPoint = "https://api.openai.com/v1/audio/transcriptions";
  formData.append("model", "whisper-1");
  formData.append("language", "ja");
  const wavFilePath = "./file.wav";

  const fileBlob = new Blob([fs.readFileSync(wavFilePath)], {
    type: "audio/wav",
  });
  formData.append("file", fileBlob, "file.wav");
  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });
  const data = (await response.json()) as { text: string };
  console.log(data);
  console.log(data.text);
  await genConversation(data.text);
};

try {
  uploadWav();
} catch (e) {
  console.error("uploadWav err:", e);
}
