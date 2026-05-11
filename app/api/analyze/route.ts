import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Fonction de réparation JSON
 */
function repairJSON(jsonStr: string): string {
  let repaired = jsonStr;

  // 1. Remplacer les guillemets typographiques
  repaired = repaired
    .replace(/[\u201C\u201D]/g, "'")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-');

  // 2. Nettoyer les caractères de contrôle dans les strings
  repaired = repaired.replace(
    /"((?:[^"\\]|\\.)*)"(\s*[:,}\]])/g,
    (match, content, suffix) => {
      const cleaned = content
        .replace(/[\n\r]/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/[\u0000-\u001F]/g, '')
        .replace(/\s+/g, ' ');
      return `"${cleaned}"${suffix}`;
    }
  );

  // 3. Supprimer les virgules en trop
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // 4. Découper proprement entre { et }
  const firstBrace = repaired.indexOf('{');
  const lastBrace = repaired.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    repaired = repaired.substring(firstBrace, lastBrace + 1);
  }

  return repaired;
}

export async function POST(request: NextRequest) {
  let videoPath = '';

  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ success: false, error: 'URL invalide' }, { status: 400 });

    const isTikTok = url.includes('tiktok.com');
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isTikTok && !isYouTube) {
      return NextResponse.json({ success: false, error: 'URL YouTube ou TikTok requise' }, { status: 400 });
    }

    const platform = isTikTok ? 'TikTok' : 'YouTube';
    const publicTempDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(publicTempDir)) {
      fs.mkdirSync(publicTempDir, { recursive: true });
    }

    const fileName = `video_${Date.now()}.mp4`;
    videoPath = path.join(publicTempDir, fileName);
    const videoPublicUrl = `/temp/${fileName}`;

    const cookiesPath = path.join(process.cwd(), 'cookies.txt');
    const hasCookies = fs.existsSync(cookiesPath);

    const strategies = [
      hasCookies ? `yt-dlp --cookies "${cookiesPath.replace(/\\/g, '\\\\')}" --no-warnings --no-playlist --max-filesize 20M -f "best[height<=480]/worst" -o "${videoPath}" "${url}"` : '',
      `yt-dlp --no-warnings --no-playlist --max-filesize 20M -f "best[height<=480]/worst" -o "${videoPath}" "${url}"`,
      `yt-dlp --no-warnings --no-playlist --max-filesize 20M -o "${videoPath}" "${url}"`
    ].filter(Boolean);

    let success = false;
    for (let i = 0; i < strategies.length; i++) {
      try {
        execSync(strategies[i], { stdio: 'inherit', timeout: 120000 });
        if (fs.existsSync(videoPath) && fs.statSync(videoPath).size > 50000) {
          success = true;
          break;
        }
      } catch {}
    }

    if (!success) throw new Error("Impossible de telecharger la video");

    console.log("Video prete - Analyse Gemini en cours...");

    let analysis;
    try {
      const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { 
        temperature: 0.75,
        maxOutputTokens: 8192,
          responseMimeType: "application/json"

        }
      });

      const promptAnalysis = `Tu es un expert en storytelling viral, en direction artistique et en creation de prompts IA.

Analyse cette video ${platform}.
1. Identifie le TYPE exact (clip musical, top/classement, storytime, tutoriel, danse, sketch, etc.).
2. Cree le concept d une NOUVELLE video originale du MEME TYPE.

CONTRAINTES DE CONTENU :
- Si c est un clip musical/chanson : Tu DOIS ecrire de VRAIES paroles originales completes en francais (Couplet, Refrain, Pont) avec les balises [Verse] [Chorus] [Bridge].
- Si c est une video parlee : Tu DOIS ecrire le script/dialogue complet.
- Specifie les VOIX precisement (ex: Voix masculine grave rappee, Voix feminine douce, Voix off dynamique).

REGLES JSON ULTRA-STRICTES (OBLIGATOIRE) :
- AUCUN retour a la ligne dans les valeurs (ecris tout sur une seule ligne)
- AUCUN guillemet double dans les valeurs - UNIQUEMENT des apostrophes simples
- Pas de markdown, pas de backticks

Structure JSON attendue :

{
  "analysis": {
    "type_video": "Type detecte",
    "resume_video": "Resume de l originale",
    "elements_viraux": "Pourquoi c est viral",
    "structure_narrative": "Structure",
    "public_cible": "Audience"
  },
  "main_prompt": "Prompt video TRES DETAILLE (500 mots minimum). Inclus actions, mouvements camera, style visuel, TEXTES affiches a l ecran, DIALOGUES/PAROLES precis. Une seule ligne.",
  "suno_prompt": "Prompt musical COMPLET pour Suno AI. Inclus style musical, instruments, BPM, type de VOIX precis ET PAROLES COMPLETES avec [Verse] et [Chorus]. Une seule ligne.",
  "capcut_instructions": "Instructions montage completes. Timing, effets, sound design, sous-titres avec textes exacts. Une seule ligne.",
  "viral_strategy": {
    "hook": "Accroche 3 premieres secondes",
    "caption": "Description TikTok/Reels",
    "hashtags": "#viral #trend #music",
    "call_to_action": "Question aux viewers",
    "psychologie_utilisee": "Explication"
  }
}`;

      const result = await model.generateContent([
        promptAnalysis,
        { inlineData: { data: fs.readFileSync(videoPath).toString('base64'), mimeType: 'video/mp4' } }
      ]);

      let responseText = result.response.text().trim();
      console.log("Reponse Gemini (300 premiers chars):", responseText.substring(0, 300));
      console.log("Longueur totale:", responseText.length);

      responseText = responseText.replace(/```json|```/g, '').trim();

      // TENTATIVE 1 : Parse direct
      try {
        analysis = JSON.parse(responseText);
        console.log("Parse direct reussi");
      } catch (e1: any) {
        console.warn("Parse direct echoue :", e1.message);
        console.log("Tentative de reparation automatique...");
        
        const repaired = repairJSON(responseText);
        
        try {
          analysis = JSON.parse(repaired);
          console.log("Parse apres reparation reussi !");
        } catch (e2: any) {
          console.error("Reparation echouee :", e2.message);
          
          const posMatch = e2.message.match(/position (\d+)/);
          if (posMatch) {
            const pos = parseInt(posMatch[1]);
            console.error("Zone problematique :");
            console.error(repaired.substring(Math.max(0, pos - 150), Math.min(repaired.length, pos + 150)));
          }
          throw new Error("JSON Gemini illisible apres reparation");
        }
      }

      console.log("Champs recus :");
      console.log("- main_prompt:", analysis.main_prompt?.length || 0, "chars");
      console.log("- suno_prompt:", analysis.suno_prompt?.length || 0, "chars");
      console.log("- capcut_instructions:", analysis.capcut_instructions?.length || 0, "chars");

    } catch (e: any) {
      console.error("Erreur analyse Gemini :", e.message);
      throw new Error("Erreur d analyse IA : " + e.message);
    }

    return NextResponse.json({
      success: true,
      videoUrl: videoPublicUrl,
      analysis,
      platform: isTikTok ? 'tiktok' : 'youtube'
    });

  } catch (error: any) {
    console.error("Erreur globale :", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur inconnue" 
    }, { status: 500 });
  }
}
