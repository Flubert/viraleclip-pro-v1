'use client';

import { useState } from 'react';

const generateSunoPrompt = (analysis: any): string => {
  if (!analysis || typeof analysis !== 'object') {
    return "High-energy track with powerful beats, catchy hooks, emotional melody, modern production, viral potential";
  }

  const style = analysis.style || "Hip-Hop / Dance";
  const mood = analysis.mood || "energetic";
  const theme = analysis.theme || "motivation";

  return `[${style}] High-energy track with powerful beats, catchy hooks, ${mood} melody, ${theme} theme, modern production, viral potential`;
};

const generateCapCutPrompt = (analysis: any, sunoPrompt: string): string => {
  if (!analysis) {
    return `INSTRUCTIONS CAPCUT - MONTAGE AUTOMATIQUE

1. Importer :
- Vidéo générée par Kling/Sora/Veo 3
- Musique générée par Suno : "${sunoPrompt}"

2. Montage :
- Synchroniser les cuts sur les beats
- Transitions dynamiques (Zoom, Glitch, Flash) sur les temps forts
- Texte style accrocheur avec paroles ou hooks
- Étalonnage : contraste élevé, couleurs vives
- Effets : slow-motion sur mouvements puissants, particules sur drops

3. Export :
- Format : 9:16
- Qualité : 1080p ou 4K
- Nom : Viral_Clip_[Date]`;
  }

  const style = analysis.style || "Hip-Hop / Dance";
  const aspectRatio = analysis.aspect_ratio || "9:16";

  return `INSTRUCTIONS CAPCUT - MONTAGE AUTOMATIQUE

1. Importer :
- Vidéo générée par Kling/Sora/Veo 3
- Musique générée par Suno : "${sunoPrompt}"

2. Montage :
- Synchroniser les cuts sur les beats de la musique ${style}
- Transitions dynamiques (Zoom, Glitch, Flash) sur les temps forts
- Texte style accrocheur avec paroles ou hooks principaux
- Étalonnage : contraste élevé, couleurs vives, vibe ${style}
- Effets : slow-motion sur mouvements puissants, particules sur drops

3. Export :
- Format : ${aspectRatio}
- Qualité : 1080p ou 4K
- Nom : Viral_Clip_[Date]`;
};

const generateViralStrategy = (analysis: any): string => {
  return "Publier sur TikTok + Instagram Reels avec hashtags viraux (#ViralMusic #Trending), poster entre 19h et 21h, utiliser une miniature accrocheuse avec gros texte.";
};

// ====================== COMPOSANT CRÉATEUR DE CLIPS (SANS LUCIDE) ======================
const ClipCreator = ({ result }: { result: any }) => {
  const [copied, setCopied] = useState(false);

  const mainPrompt = result?.mainPrompt || result?.main_prompt || result?.prompt || JSON.stringify(result, null, 2);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(mainPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGenerator = (url: string) => {
    window.open(url, '_blank');
  };

  const generators = [
    { name: 'Kling AI', url: 'https://kling.ai', color: 'from-purple-500 to-pink-500' },
    { name: 'Veo 3', url: 'https://gemini.google.com', color: 'from-blue-500 to-cyan-500' },
    { name: 'Sora', url: 'https://chatgpt.com', color: 'from-green-500 to-emerald-500' },
    { name: 'Runway Gen-3', url: 'https://runwayml.com', color: 'from-red-500 to-orange-500' },
    { name: 'Luma Dream Machine', url: 'https://lumalabs.ai', color: 'from-indigo-500 to-purple-500' },
    { name: 'Pika Labs', url: 'https://pika.art', color: 'from-yellow-500 to-amber-500' },
    { name: 'Hailuo Minimax', url: 'https://hailuoai.com', color: 'from-teal-500 to-cyan-500' },
    { name: 'CapCut', url: 'https://www.capcut.com', color: 'from-black to-gray-800', special: true },
    { name: 'Midjourney', url: 'https://midjourney.com', color: 'from-violet-500 to-purple-600', image: true },
    { name: 'Leonardo AI', url: 'https://leonardo.ai', color: 'from-rose-500 to-pink-500', image: true },
  ];

  return (
    <div className="mt-12 bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">✨</span>
        <h2 className="text-3xl font-bold">Créer mes clips vidéos</h2>
      </div>

      {/* Prompt principal */}
      <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-6 mb-8">
        <p className="text-zinc-400 text-sm mb-3">PROMPT VIDÉO IA (prêt à coller) :</p>
        <pre className="bg-black text-emerald-300 p-5 rounded-xl text-sm max-h-64 overflow-auto whitespace-pre-wrap">
          {mainPrompt}
        </pre>
        <button
          onClick={copyPrompt}
          className="mt-4 w-full bg-white text-black hover:bg-emerald-400 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg transition-colors"
        >
          <span className="text-2xl">📋</span>
          {copied ? '✅ Prompt copié !' : 'Copier le prompt principal'}
        </button>
      </div>

      {/* Grille des générateurs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {generators.map((gen) => (
          <div
            key={gen.name}
            className={`group p-5 rounded-3xl border border-zinc-700 hover:border-white/30 transition-all hover:scale-105 flex flex-col bg-gradient-to-br ${gen.color}`}
          >
            <div className="flex-1">
              <div className="text-white font-bold text-xl mb-2">{gen.name}</div>
              {gen.special && (
                <span className="bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-medium">ÉDITEUR PRO</span>
              )}
              {gen.image && <span className="text-xs text-white/70">Images → Vidéo</span>}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  copyPrompt();
                  setTimeout(() => openGenerator(gen.url), 700);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <span className="text-xl">📋</span>
                Copier + Ouvrir
              </button>
              <button
                onClick={() => openGenerator(gen.url)}
                className="px-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center text-2xl"
              >
                🔗
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-zinc-500 text-sm mt-8">
        💡 Colle le prompt dans l’outil choisi → génère ta vidéo en quelques clics
      </p>
    </div>
  );
};

// ====================== PAGE PRINCIPALE ======================
export default function ViraleClipPro() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleAnalyze = () => {
    if (!url) {
      setError('Veuillez entrer une URL');
      return;
    }
    analyzeVideo(url, setResult, setError, setLoading, setProgress);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-center">ViraleClip <span className="text-cyan-400">Pro</span></h1>
        <p className="text-center text-gray-400 mb-10">Colle un lien → Analyse avec Gemini → Prompt prêt pour Kling / Sora / Veo 3</p>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/shorts/..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500 text-lg"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 px-12 py-5 rounded-2xl font-semibold text-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Analyse en cours...' : 'Analyser'}
          </button>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-5 rounded-2xl mb-8">{error}</div>}

        {result && (
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 space-y-10">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">📹 Prompt Suno</h3>
              <pre className="bg-black p-5 rounded-2xl text-sm overflow-auto">{result.sunoPrompt}</pre>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">✂️ Instructions CapCut</h3>
              <pre className="bg-black p-5 rounded-2xl text-sm overflow-auto">{result.capcutPrompt}</pre>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Stratégie Virale</h3>
              <p className="bg-black p-5 rounded-2xl">{result.viralStrategy}</p>
            </div>

            {/* Panneau Création de clips */}
            <ClipCreator result={result} />
          </div>
        )}
      </div>
    </div>
  );
}

const analyzeVideo = async (
  url: string,
  setResult: any,
  setError: any,
  setLoading: any,
  setProgress: any
) => {
  setLoading(true);
  setError(null);
  setProgress('Analyse en cours...');

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error || 'Erreur lors de l\'analyse');
      return;
    }

    const analysis = data.analysis || {};

    const sunoPrompt = generateSunoPrompt(analysis);
    const capcutPrompt = generateCapCutPrompt(analysis, sunoPrompt);
    const viralStrategy = generateViralStrategy(analysis);

    const completeResult = {
      ...analysis,
      sunoPrompt,
      capcutPrompt,
      viralStrategy,
      mainPrompt: analysis.main_prompt || analysis.mainPrompt || "Prompt non disponible",
    };

    setResult(completeResult);
    setError('');
  } catch (err: any) {
    console.error(err);
    setError(err.message || 'Erreur de connexion. Vérifiez que le serveur tourne.');
  } finally {
    setLoading(false);
    setProgress('');
  }
};