import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  let videoPath = '';

  try {
    const { url } = await request.json();

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ success: false, error: 'URL YouTube invalide' }, { status: 400 });
    }

    const tempDir = os.tmpdir();
    videoPath = path.join(tempDir, `video_${Date.now()}.mp4`);

    // Téléchargement avec ytdl-core (fonctionne sur Vercel)
    const stream = ytdl(url, { quality: '18' }); // 360p
    const writeStream = fs.createWriteStream(videoPath);

    await new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      stream.on('error', reject);
    });

    if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size < 50000) {
      throw new Error("Téléchargement échoué");
    }

    // Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Retourne ce JSON :
{
  "main_prompt": "prompt détaillé pour IA vidéo (200-400 mots)",
  "suno_prompt": "prompt Suno",
  "capcut_instructions": "instructions CapCut"
}
Vidéo: ${url}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let analysis;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      analysis = match ? JSON.parse(match[0]) : {
        main_prompt: text,
        suno_prompt: "Musique moderne énergique",
        capcut_instructions: "Montage dynamique"
      };
    } catch {
      analysis = {
        main_prompt: text,
        suno_prompt: "Musique moderne énergique",
        capcut_instructions: "Montage dynamique"
      };
    }

    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    if (videoPath && fs.existsSync(videoPath)) {
      try { fs.unlinkSync(videoPath); } catch {}
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}