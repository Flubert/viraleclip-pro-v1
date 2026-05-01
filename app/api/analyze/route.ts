import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
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

    // ==================== TEMP DIRECTORY ====================
    const tempDir = os.tmpdir();
    videoPath = path.join(tempDir, `video_${Date.now()}.mp4`);

    // ==================== YT-DLP STRATEGIES ====================
    const cookiesPath = path.join(process.cwd(), 'cookies.txt');
    const hasCookies = fs.existsSync(cookiesPath);

    const strategies: string[] = [
      hasCookies ? `yt-dlp --cookies "${cookiesPath}" --no-warnings --no-playlist --max-filesize 200M -f "best[height<=720]/best" -o "${videoPath}" "${url}"` : '',
      `yt-dlp --cookies-from-browser chrome --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" --extractor-args "youtube:player_client=android,web" --no-warnings --no-playlist --max-filesize 200M -f "best[height<=720]/best" -o "${videoPath}" "${url}"`,
      `yt-dlp --no-warnings --no-playlist --max-filesize 250M --extractor-args "youtube:player_client=android,web" -o "${videoPath}" "${url}"`,
      `yt-dlp --no-warnings --no-playlist --max-filesize 300M -o "${videoPath}" "${url}"`,
    ].filter(Boolean) as string[];

    let success = false;

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`Tentative de téléchargement ${i + 1}/${strategies.length}...`);
        execSync(strategies[i], { stdio: 'inherit', timeout: 90000 });

        if (fs.existsSync(videoPath) && fs.statSync(videoPath).size > 100000) {
          success = true;
          console.log("✅ Téléchargement réussi !");
          break;
        }
      } catch (err: any) {
        console.log(`Tentative ${i + 1} échouée.`);
        if (fs.existsSync(videoPath)) {
          try { fs.unlinkSync(videoPath); } catch (e) {}
        }
      }
    }

    if (!success || !fs.existsSync(videoPath) || fs.statSync(videoPath).size < 100000) {
      throw new Error("Impossible de télécharger la vidéo. Essayez d'exporter vos cookies YouTube.");
    }

    // ==================== GEMINI ====================
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const prompt = `Analyse cette vidéo YouTube Shorts et retourne UNIQUEMENT un JSON avec un prompt ultra-détaillé pour Kling AI / Veo 3 / Sora.
Vidéo : ${url}`;

        result = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        if (attempt === 3) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const responseText = result.response.text();
    let analysis;
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      analysis = match ? JSON.parse(match[0]) : { main_prompt: responseText };
    } catch {
      analysis = { main_prompt: responseText };
    }

    // Nettoyage
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error(error);
    if (videoPath && fs.existsSync(videoPath)) {
      try { fs.unlinkSync(videoPath); } catch {}
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}