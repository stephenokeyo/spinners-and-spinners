import React, { useEffect, useState } from 'react';
import { Globe, Mail, MapPin, Phone, MessageCircle, Star, LifeBuoy, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { normalizeWhatsApp } from '../utils/helpers';

export type ContactSection = 'details' | 'reviews' | 'support';
const SECTION_KEY = 'contact_section';

// Navigates to the contact page and scrolls to the requested section.
export const openContactSection = (navigate: (v: 'contact') => void, section: ContactSection) => {
  sessionStorage.setItem(SECTION_KEY, section);
  navigate('contact');
  window.dispatchEvent(new Event('contact-section'));
};

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="inline-flex" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} className={`w-3.5 h-3.5 ${n <= value ? 'fill-[#c5a059] text-[#c5a059]' : 'text-neutral-600'}`} />
    ))}
  </span>
);

export const ContactPage: React.FC = () => {
  const { contact, reviews, setReviews, products, currentUser } = useApp();
  const [author, setAuthor] = useState(currentUser.role === 'client' ? '' : currentUser.name);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [productId, setProductId] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const go = () => {
      const s = sessionStorage.getItem(SECTION_KEY);
      if (!s) return;
      sessionStorage.removeItem(SECTION_KEY);
      setTimeout(() => document.getElementById(`contact-${s}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    };
    go();
    window.addEventListener('contact-section', go);
    return () => window.removeEventListener('contact-section', go);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await api('POST', '/api/reviews', { author, rating, text, productId: productId || undefined });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Could not post your review.' });
    setReviews(prev => [r.review, ...prev]);
    setText('');
    setProductId('');
    setMsg({ ok: true, text: 'Thank you! Your review is now live.' });
  };

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const inputCls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';
  const hasDetails = contact.website || contact.location || contact.emails.length || contact.salesPhones.length;
  const hasSupport = contact.supportPhone || contact.supportEmail || contact.supportNote;
  const jump = (s: ContactSection) => document.getElementById(`contact-${s}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="w-full px-6 py-10 space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-editorial text-3xl text-white mr-4">Contact us</h2>
        {([['details', 'Contact details'], ['reviews', 'Client reviews'], ['support', 'Partner support']] as [ContactSection, string][]).map(([k, label]) => (
          <button key={k} onClick={() => jump(k)} className="px-3 py-1.5 text-xs rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5">
            {label}
          </button>
        ))}
      </div>

      <section id="contact-details" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        {!hasDetails && <p className="text-sm text-neutral-400 md:col-span-2">Contact details will appear here soon.</p>}
        {(contact.website || contact.location || contact.emails.length > 0) && (
          <div className="bg-neutral-950 border border-white/10 rounded p-5 space-y-4 text-sm">
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-neutral-200 hover:text-[#c5a059]">
                <Globe className="w-4 h-4 text-[#c5a059] shrink-0" /> {contact.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {contact.emails.map(m => (
              <a key={m} href={`mailto:${m}`} className="flex items-center gap-3 text-neutral-200 hover:text-[#c5a059] break-all">
                <Mail className="w-4 h-4 text-[#c5a059] shrink-0" /> {m}
              </a>
            ))}
            {contact.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 text-neutral-200 hover:text-[#c5a059]"
              >
                <MapPin className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" /> {contact.location}
              </a>
            )}
          </div>
        )}
        {contact.salesPhones.length > 0 && (
          <div className="bg-neutral-950 border border-white/10 rounded p-5 space-y-3 text-sm">
            <h3 className="text-xs uppercase tracking-wider text-white font-semibold">Sales team</h3>
            {contact.salesPhones.map(p => (
              <div key={p.phone} className="flex items-center justify-between gap-3">
                <span className="text-neutral-200">{p.name || 'Sales'} · <span className="font-mono text-xs text-neutral-400">{p.phone}</span></span>
                <span className="flex items-center gap-2 shrink-0">
                  <a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`} title="Call" className="p-2 rounded bg-white/5 hover:bg-white/15 border border-white/10"><Phone className="w-3.5 h-3.5 text-[#c5a059]" /></a>
                  <a href={`https://wa.me/${normalizeWhatsApp(p.phone)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40"><MessageCircle className="w-3.5 h-3.5 text-emerald-300" /></a>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="contact-reviews" className="scroll-mt-24 space-y-5">
        <div className="flex items-center gap-3">
          <h3 className="font-editorial text-2xl text-white">Client reviews</h3>
          {reviews.length > 0 && (
            <span className="flex items-center gap-2 text-xs text-neutral-400"><Stars value={Math.round(average)} /> {average.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
          )}
        </div>

        <form onSubmit={submit} className="bg-neutral-950 border border-white/10 rounded p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <p className="md:col-span-2 text-xs text-neutral-400">Bought from us? Tell other clients what you think.</p>
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name" required maxLength={80} className={inputCls} />
          <select value={productId} onChange={e => setProductId(e.target.value)} className={inputCls}>
            <option value="">Product you bought (optional)</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.title} — {p.partnerName}</option>)}
          </select>
          <div className="md:col-span-2 flex items-center gap-2 text-xs text-neutral-300">
            Rating:
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                <Star className={`w-5 h-5 ${n <= rating ? 'fill-[#c5a059] text-[#c5a059]' : 'text-neutral-600'}`} />
              </button>
            ))}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Your review" required rows={3} maxLength={1000} className={`${inputCls} md:col-span-2`} />
          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={busy} className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded disabled:opacity-60 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Post review
            </button>
            {msg && <span className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</span>}
          </div>
        </form>

        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(r => (
              <article key={r.id} className="bg-neutral-950 border border-white/10 rounded p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white font-medium">{r.author}</span>
                  <Stars value={r.rating} />
                </div>
                {r.productTitle && <p className="text-[11px] text-[#c5a059]">{r.productTitle}{r.partnerName ? ` · ${r.partnerName}` : ''}</p>}
                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">{r.text}</p>
                <p className="text-[10px] text-neutral-500">{new Date(r.createdAt).toLocaleDateString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="contact-support" className="scroll-mt-24 bg-neutral-950 border border-white/10 rounded p-5 space-y-3">
        <h3 className="font-editorial text-2xl text-white flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-[#c5a059]" /> Partner technical support</h3>
        <p className="text-xs text-neutral-400">Partners: having trouble with uploads, your login or your dashboard? Reach our technical team.</p>
        {contact.supportNote && <p className="text-xs text-neutral-300 whitespace-pre-line">{contact.supportNote}</p>}
        {!hasSupport && <p className="text-sm text-neutral-500">Support details will appear here soon.</p>}
        <div className="flex flex-wrap gap-3 text-xs">
          {contact.supportPhone && (
            <>
              <a href={`https://wa.me/${normalizeWhatsApp(contact.supportPhone)}?text=${encodeURIComponent('Hello, I need technical support on texStyle.')}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 font-semibold uppercase tracking-wider text-black bg-[#c5a059] hover:bg-[#d4b069] rounded flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp support
              </a>
              <a href={`tel:${contact.supportPhone.replace(/[^\d+]/g, '')}`} className="px-4 py-2 rounded border border-white/10 text-neutral-200 hover:bg-white/5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c5a059]" /> {contact.supportPhone}
              </a>
            </>
          )}
          {contact.supportEmail && (
            <a href={`mailto:${contact.supportEmail}`} className="px-4 py-2 rounded border border-white/10 text-neutral-200 hover:bg-white/5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c5a059]" /> {contact.supportEmail}
            </a>
          )}
        </div>
      </section>
    </div>
  );
};
