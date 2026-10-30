import React, { useEffect, useState } from 'react';
import { Trash2, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';

export const ContactManager: React.FC = () => {
  const { contact, setContact, reviews, setReviews } = useApp();
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [emails, setEmails] = useState('');
  const [sales, setSales] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportNote, setSupportNote] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Fill the form once the saved details arrive, without overwriting edits afterwards.
  useEffect(() => {
    if (loaded) return;
    setWebsite(contact.website);
    setLocation(contact.location);
    setEmails(contact.emails.join('\n'));
    setSales(contact.salesPhones.map(p => `${p.name}, ${p.phone}`).join('\n'));
    setSupportPhone(contact.supportPhone);
    setSupportEmail(contact.supportEmail);
    setSupportNote(contact.supportNote);
    if (contact.website || contact.location || contact.emails.length || contact.salesPhones.length || contact.supportPhone) setLoaded(true);
  }, [contact, loaded]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const salesPhones = sales
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const i = l.lastIndexOf(',');
        return i === -1 ? { name: '', phone: l } : { name: l.slice(0, i).trim(), phone: l.slice(i + 1).trim() };
      });
    const r = await api('PUT', '/api/contact', {
      website, location, supportPhone, supportEmail, supportNote,
      emails: emails.split('\n').map(x => x.trim()).filter(Boolean),
      salesPhones
    });
    if (r.success) {
      setContact({ ...contact, ...r.contact });
      setMsg({ ok: true, text: 'Saved. The contact page and footer now show these details.' });
    } else setMsg({ ok: false, text: r.error || 'Could not save.' });
  };

  const removeReview = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    const r = await api('DELETE', `/api/reviews/${encodeURIComponent(id)}`);
    if (r.success) setReviews(prev => prev.filter(x => x.id !== id));
  };

  const cls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="bg-[#121417] border border-white/10 rounded-lg p-5 space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact us details</h3>
        <p className="text-[11px] text-neutral-400">Shown on the Contact page and in the website footer.</p>
        <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website (e.g. https://weartexstyle.onrender.com)" className={cls} />
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location / address" className={cls} />
        <label className="block space-y-1">
          <span className="text-neutral-400">Emails (one per line)</span>
          <textarea value={emails} onChange={e => setEmails(e.target.value)} rows={3} className={cls} />
        </label>
        <label className="block space-y-1">
          <span className="text-neutral-400">Sales team phone numbers (one per line: Name, +254712345678)</span>
          <textarea value={sales} onChange={e => setSales(e.target.value)} rows={4} placeholder={'Jane, +254712345678\nPeter, +254798765432'} className={cls} />
        </label>
        <h4 className="pt-2 text-white font-semibold uppercase tracking-wider">Partner technical support</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={supportPhone} onChange={e => setSupportPhone(e.target.value)} placeholder="Support phone / WhatsApp (+254…)" className={cls} />
          <input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="Support email" className={cls} />
        </div>
        <textarea value={supportNote} onChange={e => setSupportNote(e.target.value)} rows={2} placeholder="Note to partners (e.g. support hours)" className={cls} />
        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold uppercase tracking-wider rounded flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save details
          </button>
          {msg && <span className={msg.ok ? 'text-emerald-400' : 'text-red-400'}>{msg.text}</span>}
        </div>
      </form>

      <section className="bg-[#121417] border border-white/10 rounded-lg p-5 space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Client reviews ({reviews.length})</h3>
        {reviews.length === 0 && <p className="text-neutral-500">No reviews yet.</p>}
        <ul className="divide-y divide-white/5">
          {reviews.map(r => (
            <li key={r.id} className="py-2 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{r.author} <span className="text-[#c5a059]">{'★'.repeat(r.rating)}</span></p>
                {r.productTitle && <p className="text-[11px] text-neutral-500">{r.productTitle}</p>}
                <p className="text-neutral-300 break-words">{r.text}</p>
              </div>
              <button onClick={() => void removeReview(r.id)} title="Delete review" aria-label="Delete review" className="text-neutral-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
