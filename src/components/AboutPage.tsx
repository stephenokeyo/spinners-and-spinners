import React from 'react';

const Block: React.FC<{ eyebrow: string; title?: string; image?: string; alt?: string; children: React.ReactNode }> = ({ eyebrow, title, image, alt, children }) => (
  <section className={`bg-neutral-950 border border-white/10 rounded overflow-hidden ${image ? 'grid grid-cols-1 md:grid-cols-2' : ''}`}>
    <div className="p-6 space-y-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059]">{eyebrow}</p>
      {title && <h3 className="font-editorial text-2xl text-white">{title}</h3>}
      <div className="text-sm text-neutral-300 leading-relaxed space-y-3">{children}</div>
    </div>
    {image && <img src={image} alt={alt || eyebrow} loading="lazy" className="w-full h-full object-contain bg-neutral-900" />}
  </section>
);

export const AboutPage: React.FC = () => (
  <div className="w-full px-6 py-10 max-w-5xl mx-auto space-y-6">
    <img src="/brand/logo-white.png" alt="texStyle" className="h-20 w-auto" />
    <header className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059]">Welcome</p>
        <h2 className="font-editorial text-4xl text-white">texStyle</h2>
        <p className="text-sm text-neutral-300 leading-relaxed">
          texStyle is a distinguished fashion brand that embodies the vibrant, stylish, and confident spirit of Africa. Catering to discerning individuals aged 35-50, both men and women, our brand honours the rich heritage, pride, and passion of Africa while embracing the future.
        </p>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Our designs reflect an authentic and ambitious African lifestyle, ensuring a look and feel that resonates with the continent's dynamic energy. By understanding and meeting the customers' needs for authentic, trendy, and stylish African attire with a modern edge, our designs embody a zeal for life and instil pride in being affiliated with brands made in Kenya.
        </p>
      </div>
      <figure className="rounded overflow-hidden border border-white/10 bg-neutral-900">
        <img src="/brand/story1.jpg" alt="Peggy Kigaita, Team Leader - Fashion" className="w-full h-auto" />
        <figcaption className="flex justify-between text-xs text-neutral-300 px-3 py-2"><span className="font-semibold">Peggy Kigaita</span><span>Team Leader - Fashion</span></figcaption>
      </figure>
    </header>

    <Block eyebrow="Brand story 1 · About us" image="/brand/story2.jpg">
      <p>Founded in 2017, we proudly reflect on 8 years of crafting trendy and functional clothing. Today, our brand embodies a harmonious blend of African heritage and contemporary craftsmanship, creating a unique hybrid that drives our every endeavour.</p>
      <p>Our products are informed by comfort and style, from our high-quality fabrics and components to our superior knitted fashion clothing. We are intentionally selective, choosing only to create fabrics and garments that are functional, durable, and resonate with our consumers' lifestyles.</p>
    </Block>

    <Block eyebrow="Brand story 2 · Not fast fashion" image="/brand/story3.jpg">
      <p>Each year, we meticulously craft six collections, honouring the artistry in every piece before its launch. Occasionally, we carry a beloved design across multiple seasons, knowing that a classic cut never goes out of style.</p>
      <p>texStyle is not fast fashion. With a legacy spanning forty-two years through our parent company, Spinners &amp; Spinners, texStyle is committed to enduring fashion that celebrates the diversity and vibrancy of Africa.</p>
    </Block>

    <Block eyebrow="Brand story 3 · Origin" image="/brand/story4.jpg">
      <p>The inspiration behind launching the texStyle brand and its diverse product ranges stems from our ongoing commitment to understanding the evolving needs of our valued customers. Through long-term relationships, we have garnered the goodwill that we deeply cherish today.</p>
      <p>Our customers, including those loyal to the butterfly and S&amp;S brands, expressed a desire for a variety of sleek, fashion-forward products made in Kenya. It is their trust and feedback that drives us to innovate and deliver exceptional fashionwear.</p>
    </Block>

    <Block eyebrow="Brand story 4 · Purpose, vision and values" image="/brand/story5.jpg">
      <p><span className="text-white font-semibold">Purpose: </span>Empower Authentic African Fashion.</p>
      <p><span className="text-white font-semibold">Vision: </span>To become the premier brand for all seasonal apparel in the East African region, ensuring that every wardrobe and every household around the globe includes a piece of texStyle.</p>
      <p><span className="text-white font-semibold">Values: </span>Honesty &amp; Integrity, Long-term forward-thinking, Continuous learning, Exceeding expectations, and Resilience &amp; Determination.</p>
    </Block>

    <Block eyebrow="Brand story 5 · Unique selling proposition" image="/brand/story6.jpg">
      <p>Among our competitors, we proudly stand as the only brand producing fashionwear using acrylic fiber, offering a vibrant array of colours and diverse designs tailored specifically to Kenyan sizes, rather than relying on standard UK, EU, or USA measurements.</p>
      <p>In addition, we are committed to fostering long-term, forward-thinking relationships with our customers. Beyond mere transactions, we provide services to co-create customized designs, ensuring a seamless experience with a standard minimum quantity, quick turnaround time, and complimentary delivery.</p>
    </Block>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Block eyebrow="About our customers · Desires">
        <p>Wants: purchase products made in Kenya; support local brands.</p>
        <p>Needs: feel a connection with Kenya or Africa; achieve status and prestige.</p>
      </Block>
      <Block eyebrow="Customer challenges">
        <p>External: poor fit and feel; uniform designs and styles; low quality; inconsistent offerings.</p>
        <p>Internal: frustration; dissatisfaction; mistrust.</p>
      </Block>
      <Block eyebrow="Credible guide to evoke trust">
        <p>Empathy: we understand the frustration of dealing with inconsistent, uniform, and poor quality products that don't fit well. No one should feel dissatisfied when choosing to support local brands.</p>
        <p>Competence: our team has collaborated with customers from all walks of life to create products that resonate with their lifestyles.</p>
      </Block>
    </div>
  </div>
);
