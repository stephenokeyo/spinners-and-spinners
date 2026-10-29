import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { fileToCompressedDataUrl, formatPrice } from '../utils/helpers';
import { MAX_VIDEO_MB } from '../utils/api';
import { VideoButton } from './VideoButton';
import { ImagePlus, Trash2, CheckCircle, AlertTriangle, Video, X } from 'lucide-react';
import { FulfilmentSettings } from './FulfilmentSettings';


export const ProductManager: React.FC<{ partnerId: string }> = ({ partnerId }) => {
  const { products, partners, addProduct, uploadVideo, deleteProduct, markProductSold, setProductStock } = useApp();
  const partner = partners.find(p => p.id === partnerId);
  const partnerProducts = products.filter(p => p.partnerId === partnerId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) return setFeedback({ ok: false, msg: 'Please choose a video file.' });
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return setFeedback({ ok: false, msg: `Video must be under ${MAX_VIDEO_MB} MB.` });
    setVideo(file);
    setFeedback(null);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImage(await fileToCompressedDataUrl(file));
      setFeedback(null);
    } catch (err) {
      setFeedback({ ok: false, msg: (err as Error).message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let videoId: string | undefined;
    if (video) {
      const up = await uploadVideo(video);
      if (!up.success) return setFeedback({ ok: false, msg: up.error || 'Could not upload the video.' });
      videoId = up.videoId;
    }
    const result = await addProduct(partnerId, {
      title,
      description,
      image,
      category,
      price: price ? Number(price) : undefined,
      stock: Number(quantity),
      videoId
    });
    if (result.success) {
      setVideo(null);
      setQuantity('1');
      setTitle('');
      setDescription('');
      setPrice('');
      setImage('');
      setFeedback({ ok: true, msg: 'Product published. It is now live in the global catalog.' });
    } else {
      setFeedback({ ok: false, msg: result.error || 'Could not publish product.' });
    }
  };

  const inputCls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';

  return (
    <>
    <FulfilmentSettings key={partnerId} partnerId={partnerId} />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-5 bg-neutral-950 border border-white/10 rounded p-5 space-y-4 self-start">
        <h3 className="font-editorial text-lg text-white">Upload a product to {partner?.name}</h3>

        <label className="block cursor-pointer">
          <div className="aspect-[4/3] border border-dashed border-white/20 hover:border-[#c5a059] rounded flex items-center justify-center overflow-hidden bg-neutral-900">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-neutral-400 text-xs space-y-1">
                <ImagePlus className="w-6 h-6 mx-auto text-[#c5a059]" />
                <span>Click to upload a photo</span>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>

        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer flex items-center gap-2 border border-dashed border-white/20 hover:border-[#c5a059] rounded px-3 py-2 text-xs text-neutral-300">
            <Video className="w-4 h-4 text-[#c5a059] shrink-0" />
            <span className="truncate">{video ? video.name : `Upload a product video (optional, max ${MAX_VIDEO_MB} MB)`}</span>
            <input type="file" accept="video/*" onChange={handleVideo} className="hidden" />
          </label>
          {video && (
            <button type="button" onClick={() => setVideo(null)} title="Remove video" className="text-neutral-400 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Item name" className={inputCls} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Item description" className={inputCls} />

        <div className="grid grid-cols-2 gap-3">
          <input
            list="category-options"
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Category (type any, e.g. Shoes)"
            className={inputCls}
          />
          <datalist id="category-options">
            {[...new Set(products.map(p => p.category))].map(c => <option key={c} value={c} />)}
          </datalist>
          <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price in KSh (optional)" className={inputCls} />
        </div>
        <input type="number" min="1" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity in stock" className={inputCls} />

                {feedback && (
          <div className={`flex items-start gap-2 text-xs p-2.5 rounded border ${feedback.ok ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-red-300 border-red-500/30 bg-red-500/10'}`}>
            {feedback.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
        )}

        <button type="submit" className="w-full py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded transition-colors">
          Publish Product
        </button>
      </form>

      <div className="lg:col-span-7">
        <div className="text-xs text-neutral-400 mb-3">{partnerProducts.length} product(s) in this section</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {partnerProducts.map(p => (
            <div key={p.id} className="bg-neutral-950 border border-white/10 rounded overflow-hidden">
              <div className="relative">
                <img src={p.image} alt={p.title} className="w-full aspect-[4/3] object-cover" />
                {p.videoId && <div className="absolute top-2 right-2"><VideoButton videoId={p.videoId} title={p.title} className="bg-black/75" /></div>}
              </div>
              <div className="p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-editorial text-white text-sm">{p.title}</h4>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    title="Delete product"
                    className="text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-mono text-[#c5a059]">{formatPrice(p)}</span>
                  <span className={`text-[11px] font-semibold ${p.stock === 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                    {p.stock === 0 ? 'Sold out' : `${p.stock ?? '∞'} in stock`}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={p.stock === 0}
                    onClick={() => markProductSold(p.id)}
                    className="flex-1 py-1.5 text-[11px] rounded border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Mark 1 as sold
                  </button>
                  <button
                    onClick={() => {
                      const v = window.prompt('Set stock quantity:', String(p.stock ?? 0));
                      if (v !== null && v.trim() !== '') setProductStock(p.id, Number(v));
                    }}
                    className="flex-1 py-1.5 text-[11px] rounded border border-white/10 text-neutral-300 hover:bg-white/5"
                  >
                    Edit stock
                  </button>
                </div>
              </div>
            </div>
          ))}
          {partnerProducts.length === 0 && (
            <div className="sm:col-span-2 text-center text-xs text-neutral-500 border border-dashed border-white/10 rounded py-12">
              No products yet. Upload the first one.
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
