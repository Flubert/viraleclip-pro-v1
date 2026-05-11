'use client';

import React, { useState } from 'react';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState('');

  // Lancement de l'analyse
  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        alert("Erreur : " + result.error);
      }
    } catch (err) {
      alert("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du presse-papier
  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Réinitialisation
  const handleReset = () => {
    setUrl('');
    setData(null);
  };

  // Liens des générateurs vidéo
  const generators = [
    { name: 'Kling AI', color: 'bg-fuchsia-600', link: 'https://klingai.com' },
    { name: 'Veo 3', color: 'bg-blue-500', link: 'https://deepmind.google/technologies/veo/' },
    { name: 'Sora', color: 'bg-emerald-500', link: 'https://openai.com/sora' },
    { name: 'Runway', color: 'bg-orange-500', link: 'https://runwayml.com' },
    { name: 'Luma', color: 'bg-indigo-500', link: 'https://lumalabs.ai/dream-machine' },
    { name: 'Pika', color: 'bg-amber-500', link: 'https://pika.art' },
    { name: 'Hailuo', color: 'bg-cyan-600', link: 'https://hailuoai.com/video' },
    { name: 'CapCut', color: 'bg-gray-800', link: 'https://www.capcut.com' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans pb-12">
      {/* HEADER */}
      <header className="text-center py-10 space-y-2">
        <h1 className="text-4xl font-black tracking-wider">
          ViraleClip <span className="text-cyan-400">Pro</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Colle un lien → Analyse avec Gemini → Prompt prêt
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        {/* BARRE DE RECHERCHE */}
        <div className="flex gap-2 bg-[#131b2e] p-2 rounded-xl border border-gray-800">
          <input
            type="text"
            placeholder="https://www.youtube.com/shorts/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 text-white outline-none text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-6 py-2 rounded-lg transition duration-200 text-sm disabled:opacity-50"
          >
            {loading ? 'Analyse...' : 'Analyser'}
          </button>
        </div>

        {/* RÉSULTATS */}
        {data && data.analysis && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* BOUTON TÉLÉCHARGEMENT */}
            {data.videoUrl && (
              <a
                href={data.videoUrl}
                download="video_originale.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/10"
              >
                📥 Télécharger la vidéo originale
              </a>
            )}

            {/* BLOCS SUNO ET CAPCUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* SUNO */}
              <div className="bg-[#131b2e] border border-gray-800 p-5 rounded-xl flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    🎵 Prompt Suno
                  </h3>
                  <button
                    onClick={() => copyToClipboard(data.analysis.suno_prompt, 'suno')}
                    className="bg-[#1e293b] hover:bg-slate-700 text-gray-300 px-3 py-1 rounded-md text-xs transition"
                  >
                    {copiedField === 'suno' ? 'Copié !' : '📋 Copier'}
                  </button>
                </div>
                <div className="bg-[#0b0f19] p-3 rounded-lg flex-1 border border-gray-900/50 max-h-40 overflow-y-auto text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {data.analysis.suno_prompt || "Non généré"}
                </div>
              </div>

              {/* CAPCUT */}
              <div className="bg-[#131b2e] border border-gray-800 p-5 rounded-xl flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    ✂️ Instructions CapCut
                  </h3>
                  <button
                    onClick={() => copyToClipboard(data.analysis.capcut_instructions, 'capcut')}
                    className="bg-[#1e293b] hover:bg-slate-700 text-gray-300 px-3 py-1 rounded-md text-xs transition"
                  >
                    {copiedField === 'capcut' ? 'Copié !' : '📋 Copier'}
                  </button>
                </div>
                <div className="bg-[#0b0f19] p-3 rounded-lg flex-1 border border-gray-900/50 max-h-40 overflow-y-auto text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {data.analysis.capcut_instructions || "Non généré"}
                </div>
              </div>

            </div>

            {/* SECTION CRÉATION CLIPS */}
            <div className="bg-[#131b2e] border border-gray-800 p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                ✨ Créer mes clips vidéos
              </h2>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold tracking-wider block">
                  PROMPT VIDÉO PRINCIPAL
                </label>
                <div className="bg-[#0b0f19] p-4 rounded-lg border border-gray-900 text-xs text-gray-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {data.analysis.main_prompt}
                </div>
                <button
                  onClick={() => copyToClipboard(data.analysis.main_prompt, 'main')}
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded-lg text-xs transition duration-200 flex items-center justify-center gap-2"
                >
                  {copiedField === 'main' ? 'Copié !' : '📋 Copier le prompt principal'}
                </button>
              </div>

              {/* GRILLE GÉNÉRATEURS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {generators.map((gen) => (
                  <div
                    key={gen.name}
                    className={`${gen.color} rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden group hover:opacity-95 transition`}
                  >
                    <span className="font-black text-white text-sm">{gen.name}</span>
                    <button
                      onClick={() => {
                        copyToClipboard(data.analysis.main_prompt, gen.name);
                        window.open(gen.link, '_blank');
                      }}
                      className="bg-black/30 hover:bg-black/50 text-white text-[10px] font-bold py-1.5 px-2 rounded backdrop-blur-sm transition flex items-center justify-center gap-1"
                    >
                      {copiedField === gen.name ? 'Copié !' : '📋 Copier + Ouvrir'}
                    </button>
                  </div>
                ))}
              </div>

            </div>

            {/* BOUTON NOUVELLE ANALYSE */}
            <button
              onClick={handleReset}
              className="w-full bg-[#1e293b] hover:bg-slate-700 text-gray-300 font-bold py-3 rounded-xl transition duration-200 text-sm flex items-center justify-center gap-2 border border-gray-700"
            >
              🔄 Nouvelle Analyse
            </button>

          </div>
        )}
      </main>
    </div>
  );
}