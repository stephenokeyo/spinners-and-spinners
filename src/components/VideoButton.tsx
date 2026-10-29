import React, { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { getVideo } from '../utils/videoStore';

export const VideoButton: React.FC<{ videoId?: string; title: string; className?: string }> = ({ videoId, title, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!open || !videoId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    getVideo(videoId)
      .then(blob => {
        if (cancelled) return;
        if (!blob) return setMissing(true);
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setMissing(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(null);
      setMissing(false);
    };
  }, [open, videoId]);

  if (!videoId) return null;

  return (
    <>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(true); }}
        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border border-[#c5a059]/50 text-[#c5a059] hover:bg-[#c5a059]/10 ${className}`}
      >
        <Play className="w-3 h-3" /> Watch video
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={e => { e.stopPropagation(); setOpen(false); }}
        >
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/10 rounded p-3" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute -top-3 -right-3 bg-neutral-800 rounded-full p-1.5 text-white" aria-label="Close video">
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs text-neutral-300 mb-2">{title}</p>
            {url ? (
              <video src={url} controls autoPlay playsInline className="w-full max-h-[70vh] bg-black rounded" />
            ) : (
              <p className="text-xs text-neutral-500 py-10 text-center">
                {missing ? 'This video is not available on this device.' : 'Loading video…'}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
