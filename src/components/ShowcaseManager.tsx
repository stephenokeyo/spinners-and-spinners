import React, { useState } from 'react';
import { Video, Trash2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MAX_VIDEO_MB, videoUrl } from '../utils/api';

export const ShowcaseManager: React.FC = () => {
  const { showcaseVideos, addShowcaseVideo, deleteShowcaseVideo } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('video/')) return setFeedback({ ok: false, msg: 'Please choose a video file.' });
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) return setFeedback({ ok: false, msg: `Video must be under ${MAX_VIDEO_MB} MB.` });
    setFeedback(null);
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setFeedback({ ok: false, msg: 'Choose a video first.' });
    if (!title.trim() || !description.trim()) return setFeedback({ ok: false, msg: 'Add a title and a description.' });
    setBusy(true);
    const r = await addShowcaseVideo({ file, title: title.trim(), description: description.trim() });
    setBusy(false);
    if (!r.success) return setFeedback({ ok: false, msg: r.error || 'Could not add the video.' });
    setFile(null);
    setTitle('');
    setDescription('');
    setFeedback({ ok: true, msg: 'Video is now showing on the home page for everyone.' });
  };

  return (
    <div className="bg-[#111213] border border-white/10 rounded-xl p-5">
      <h3 className="font-serif text-lg text-white flex items-center gap-2">
        <Video className="w-5 h-5 text-amber-400" /> Fashion showcase videos
      </h3>
      <p className="text-xs text-neutral-400 mt-1 mb-4">
        These videos autoplay (muted, looping) on the home page for every visitor, with the title and description shown over the video.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <label className="flex items-center gap-2 text-xs text-neutral-300 bg-black/40 border border-white/10 rounded px-3 py-2.5 cursor-pointer hover:border-amber-400/50">
          <Upload className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">{file ? file.name : `Choose a video (max ${MAX_VIDEO_MB} MB)`}</span>
          <input type="file" accept="video/*" onChange={pick} className="hidden" />
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Title, e.g. Autumn Kente Collection"
          className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-sm text-white"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={600}
          rows={3}
          placeholder="Describe the fashion item: fabric, style, nature of the piece..."
          className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-sm text-white"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded"
        >
          {busy ? 'Uploading…' : 'Publish video'}
        </button>
        {feedback && <p className={`text-xs ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>}
      </form>

      {showcaseVideos.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {showcaseVideos.map(v => (
            <li key={v.id} className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
              <video src={videoUrl(v.videoId)} muted playsInline preload="metadata" controls className="w-full aspect-video bg-black" />
              <div className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{v.title}</p>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{v.description}</p>
                </div>
                <button
                  onClick={() => void deleteShowcaseVideo(v.id)}
                  className="text-neutral-500 hover:text-red-400 shrink-0"
                  aria-label={`Remove ${v.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
