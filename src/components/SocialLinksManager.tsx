import React, { useState } from 'react';
import { Trash2, Plus, ImagePlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SOCIAL_PLATFORMS, SocialIcon } from './SocialIcon';

const MAX_ICON_BYTES = 200 * 1024;

export const SocialLinksManager: React.FC<{ partnerId: string | null; title: string }> = ({ partnerId, title }) => {
  const { socialLinks, addSocialLink, deleteSocialLink } = useApp();
  const [platform, setPlatform] = useState('instagram');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = socialLinks.filter(l => (l.partnerId || null) === partnerId);

  const pickIcon = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return setError('Icon must be a PNG, JPG, WEBP or GIF image.');
    if (file.size > MAX_ICON_BYTES) return setError('Icon must be under 200 KB.');
    const reader = new FileReader();
    reader.onload = () => { setIcon(String(reader.result)); setError(null); };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const r = await addSocialLink({ partnerId, platform, label, url, icon });
    setBusy(false);
    if (!r.success) return setError(r.error || 'Could not add this page.');
    setLabel('');
    setUrl('');
    setIcon(undefined);
  };

  return (
    <section className="bg-[#121417] border border-white/10 rounded-lg p-5 space-y-4 mt-8">
      <div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        <p className="text-[11px] text-neutral-400 mt-1">
          Add your social media pages. They appear in the website footer under Partner Boutiques. The platform's own icon is used unless you upload a different one.
        </p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
        <label className="sm:col-span-2 space-y-1">
          <span className="text-neutral-400">Platform</span>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-2 text-white"
          >
            {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="sm:col-span-3 space-y-1">
          <span className="text-neutral-400">Display name (optional)</span>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            maxLength={60}
            placeholder="e.g. Our Instagram"
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-white"
          />
        </label>
        <label className="sm:col-span-4 space-y-1">
          <span className="text-neutral-400">Page link</span>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
            placeholder="https://instagram.com/yourpage"
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-white"
          />
        </label>
        <div className="sm:col-span-3 flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-2 py-2 border border-white/10 rounded cursor-pointer text-neutral-300 hover:text-white">
            {icon ? <img src={icon} alt="" className="w-4 h-4 object-contain" /> : <ImagePlus className="w-4 h-4" />}
            <span>{icon ? 'Icon set' : 'Own icon'}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => pickIcon(e.target.files?.[0])} />
          </label>
          {icon && (
            <button type="button" onClick={() => setIcon(undefined)} className="text-neutral-400 hover:text-white">Clear</button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="ml-auto flex items-center gap-1 px-3 py-2 bg-[#c5a059] hover:bg-[#d4b069] text-black font-semibold uppercase tracking-wider rounded disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {mine.length === 0 ? (
        <p className="text-xs text-neutral-500">No social pages added yet.</p>
      ) : (
        <ul className="divide-y divide-white/5 text-xs">
          {mine.map(l => (
            <li key={l.id} className="flex items-center gap-3 py-2">
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059]">
                <SocialIcon platform={l.platform} icon={l.icon} />
              </span>
              <span className="text-white font-medium">{l.label}</span>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white truncate min-w-0 flex-1">{l.url}</a>
              <button onClick={() => void deleteSocialLink(l.id)} className="text-neutral-500 hover:text-red-400" aria-label={`Remove ${l.label}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
