import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Sparkles, MessageCircle } from 'lucide-react';
import { SocialIcon } from './SocialIcon';
import { openContactSection } from './ContactPage';

export const Footer: React.FC = () => {
  const { partners, navigateTo, socialLinks, contact } = useApp();

  return (
    <footer className="bg-[#08090a] border-t border-white/10 text-neutral-400 text-xs py-14 px-6">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
        <div className="md:col-span-5 space-y-4">
          <img src="/brand/logo-white.png" alt="texStyle" className="h-14 w-auto block" />
          <p className="text-neutral-400 font-light leading-relaxed max-w-sm">
            A digital guild connecting private clients directly to historic and avant-garde couture spinners. Each partner operates a dedicated webpage, an isolated technical vault, and strictly guarded transactional communications.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-[#c5a059] font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Tenant Partner Isolation Protocol Enforced</span>
          </div>
          <button onClick={() => navigateTo('about')} className="text-[11px] text-neutral-300 hover:text-white underline underline-offset-4">About texStyle · our brand story</button>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
            Partner Boutiques
          </h4>
          <ul className="space-y-2">
            {partners.map(p => (
              <li key={p.id}>
                <button
                  onClick={() => navigateTo('partner', p.id)}
                  className="hover:text-white transition-colors text-left"
                >
                  {p.name} · <span className="text-neutral-500 font-mono text-[11px]">{p.location.split(',')[0]}</span>
                </button>
              </li>
            ))}
          </ul>

          {socialLinks.length > 0 && (
            <div className="pt-4 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Social Media</h4>
              {[{ id: null as string | null, name: 'texStyle' }, ...partners.map(p => ({ id: p.id as string | null, name: p.name }))]
                .map(group => {
                  const links = socialLinks.filter(l => (l.partnerId || null) === group.id);
                  if (!links.length) return null;
                  return (
                    <div key={group.id || 'global'} className="space-y-1.5">
                      <p className="text-[11px] text-neutral-500">{group.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {links.map(l => (
                          <a
                            key={l.id}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={l.label}
                            aria-label={`${group.name} on ${l.label}`}
                            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 hover:text-[#c5a059] hover:border-[#c5a059]/50 transition-colors"
                          >
                            <SocialIcon platform={l.platform} icon={l.icon} />
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="pt-4 space-y-1.5">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Designed By</h4>
            <p className="text-[11px] text-[#c5a059] font-medium">SecureTech Sln &amp; Spinners</p>
            <div className="flex items-center gap-2 text-[11px]">
              <a href="tel:+254797508993" className="hover:text-white font-mono">+254 797 508 993</a>
              <a
                href="https://wa.me/254797508993"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                aria-label="Chat with SecureTech Sln on WhatsApp"
                className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 hover:bg-emerald-600/30"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Contact us</h4>
          <ul className="space-y-1.5 text-[11px]">
            {contact.website && <li><a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:text-white break-all">{contact.website.replace(/^https?:\/\//, '')}</a></li>}
            {contact.emails.map(m => <li key={m}><a href={`mailto:${m}`} className="hover:text-white break-all">{m}</a></li>)}
            {contact.location && <li>{contact.location}</li>}
            {contact.salesPhones.map(p => <li key={p.phone}>{p.name || 'Sales'}: <a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white font-mono">{p.phone}</a></li>)}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={() => openContactSection(navigateTo as (v: 'contact') => void, 'details')} className="px-3 py-1.5 rounded border border-white/10 hover:text-white hover:bg-white/5">Contact us</button>
            <button onClick={() => openContactSection(navigateTo as (v: 'contact') => void, 'reviews')} className="px-3 py-1.5 rounded border border-white/10 hover:text-white hover:bg-white/5">Client reviews</button>
            <button onClick={() => openContactSection(navigateTo as (v: 'contact') => void, 'support')} className="px-3 py-1.5 rounded border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059]/10">Partner support</button>
          </div>

          <h4 className="pt-4 text-xs uppercase tracking-wider text-white font-semibold">
            Security & Client Confidentiality
          </h4>
          <p className="text-neutral-400 font-light leading-relaxed text-[11px]">
            Inquiries, texStyle fashions, and order conversations are strictly sealed between client and chosen spinner. Competing partners have zero clearance to access client records or order dialogues.
          </p>
        </div>
      </div>

      <div className="w-full pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} texStyle. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>Private Client Encrypted Protocol</span>
          <span>·</span>
          <span>Paris · Milan · Kyoto · Marseille</span>
        </div>
      </div>
    </footer>
  );
};
