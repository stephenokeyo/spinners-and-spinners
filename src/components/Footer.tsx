import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { SocialIcon } from './SocialIcon';

export const Footer: React.FC = () => {
  const { partners, navigateTo, socialLinks } = useApp();

  return (
    <footer className="bg-[#08090a] border-t border-white/10 text-neutral-400 text-xs py-14 px-6">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
        <div className="md:col-span-5 space-y-4">
          <span className="font-editorial text-2xl tracking-[0.2em] font-medium text-white block">
           Spinners&Spinners
          </span>
          <p className="text-neutral-400 font-light leading-relaxed max-w-sm">
            A digital guild connecting private clients directly to historic and avant-garde couture spinners. Each partner operates a dedicated webpage, an isolated technical vault, and strictly guarded transactional communications.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-[#c5a059] font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Tenant Partner Isolation Protocol Enforced</span>
          </div>
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
              {[{ id: null as string | null, name: 'Spinners&Spinners' }, ...partners.map(p => ({ id: p.id as string | null, name: p.name }))]
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
        </div>

        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
            Security & Client Confidentiality
          </h4>
          <p className="text-neutral-400 font-light leading-relaxed text-[11px]">
            Inquiries, bespoke measurements, and order conversations are strictly sealed between client and chosen spinner. Competing partners have zero clearance to access client records or order dialogues.
          </p>
        </div>
      </div>

      <div className="w-full pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} Spinners&Spinners. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>Private Client Encrypted Protocol</span>
          <span>·</span>
          <span>Paris · Milan · Kyoto · Marseille</span>
        </div>
      </div>
    </footer>
  );
};
