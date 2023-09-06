import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import recorder from 'node-record-lpcm16';
import { main as recordAudioMain } from './record';  // ここでmainをインポート

interface ApiResponse {
  result: {
    content: string;
  };
  text: string;
}

async function genConversation(input: string) {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: input }),
    });
    const data = await response.json() as { result: { content: string } };
    await generateVoice(data.result.content);
  } catch (e) {
    console.log(e);
  }
}

async function generateVoice(userText: string) {
  try {
    const response = await fetch(
      `https://deprecatedapis.tts.quest/v2/voicevox/audio/?text=${userText}&key=${process.env.VOICE_KEY}&speaker=1`
    );
    const buffer = await response.buffer();
    const audioFilePath = "/tmp/audio_output.wav";

    await writeFile(audioFilePath, buffer);

    exec(`aplay ${audioFilePath}`, (error) => {
      if (error) {
        console.log(`Error playing audio: ${error}`);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

const startRecording = () => {
  const audioChunks: Buffer[] = [];
  const formData = new FormData();
  const endPoint = "https://api.openai.com/v1/audio/transcriptions";
  formData.append("model", "whisper-1");
  formData.append("language", "ja");

  const audioStream = recorder.record({
    sampleRate: 44100,
    threshold: 0.5
  });

  audioStream.on('data', (data: Buffer) => {
    audioChunks.push(data);
  });

  audioStream.on('end', async () => {
    const audioBlob = Buffer.concat(audioChunks);
    formData.append('file', audioBlob, 'audio.webm');

    const response = await fetch(endPoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOT_INIAD_KEY}`,
      },
      body: formData,
    });

    // ここでmain関数（録音関連の処理）を呼び出す
    await recordAudioMain();

    const data = await response.json() as {text: string };
    await genConversation(data.text);
  });
};

// 3秒ごとにstartRecording関数を呼び出す

  try {
    startRecording();
  } catch (e) {
    console.error("Error in startRecording:", e);
  }


console.log("Started 3-second interval for startRecording.");
