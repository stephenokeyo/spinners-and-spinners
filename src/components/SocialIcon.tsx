import React from 'react';
import type { IconType } from 'react-icons';
import {
  FaFacebookF, FaInstagram, FaXTwitter, FaTiktok, FaYoutube, FaWhatsapp,
  FaLinkedinIn, FaPinterestP, FaSnapchat, FaTelegram, FaGlobe
} from 'react-icons/fa6';

export const SOCIAL_PLATFORMS: { id: string; name: string; Icon: IconType }[] = [
  { id: 'facebook', name: 'Facebook', Icon: FaFacebookF },
  { id: 'instagram', name: 'Instagram', Icon: FaInstagram },
  { id: 'x', name: 'X (Twitter)', Icon: FaXTwitter },
  { id: 'tiktok', name: 'TikTok', Icon: FaTiktok },
  { id: 'youtube', name: 'YouTube', Icon: FaYoutube },
  { id: 'whatsapp', name: 'WhatsApp', Icon: FaWhatsapp },
  { id: 'linkedin', name: 'LinkedIn', Icon: FaLinkedinIn },
  { id: 'pinterest', name: 'Pinterest', Icon: FaPinterestP },
  { id: 'snapchat', name: 'Snapchat', Icon: FaSnapchat },
  { id: 'telegram', name: 'Telegram', Icon: FaTelegram },
  { id: 'other', name: 'Other website', Icon: FaGlobe }
];

export const SocialIcon: React.FC<{ platform: string; icon?: string; className?: string }> = ({ platform, icon, className = 'w-4 h-4' }) => {
  if (icon) return <img src={icon} alt="" className={`${className} object-contain rounded-sm`} />;
  const Icon = SOCIAL_PLATFORMS.find(p => p.id === platform)?.Icon || FaGlobe;
  return <Icon className={className} />;
};
