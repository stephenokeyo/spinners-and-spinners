import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp, ShowcaseVideo } from '../context/AppContext';
import { videoUrl } from '../utils/api';

const ShowcaseCard: React.FC<{ item: ShowcaseVideo }> = ({ item }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [tries, setTries] = useState(0);
  const [processing, setProcessing] = useState(false);

  // A freshly uploaded phone video is converted on the server first; keep retrying until it is ready.
  useEffect(() => {
    if (!processing) return;
    const t = setTimeout(() => {
      setTries(n => n + 1);
      setProcessing(false);
    }, 15000);
    return () => clearTimeout(t);
  }, [processing]);

  // Play only while on screen so many videos don't load at once.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [tries]);

  if (tries >= 80) return null;

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-video">
      {processing ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">Preparing video…</div>
      ) : (
        <video
          key={tries}
          ref={ref}
          src={videoUrl(item.videoId)}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onError={() => setProcessing(true)}
          className="w-full h-full object-cover"
        />
      )}      <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        <h3 className="font-serif text-lg text-white leading-tight">{item.title}</h3>
        <p className="text-xs sm:text-sm text-neutral-300 font-light mt-1 line-clamp-3">{item.description}</p>
      </div>
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

export const ShowcaseVideos: React.FC = () => {
  const { showcaseVideos } = useApp();
  if (showcaseVideos.length === 0) return null;
  return (
    <section className="w-full px-4 sm:px-6 py-10 border-b border-white/5">
      <h2 className="font-serif text-2xl text-white mb-1">Spinners&amp;Spinners Fashion Showcase</h2>
      <p className="text-xs text-neutral-400 mb-5">Watch the fashion pieces available from our partner houses.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {showcaseVideos.map(v => (
          <ShowcaseCard key={v.id} item={v} />
        ))}
      </div>
    </section>
  );
};
