import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { type, slug } = req.query;
  const id = slug.split('-')[0];
  const isAlbum = type === 'album';

  // Scegliamo la tabella e i campi in base al tipo
  const table = isAlbum ? 'album' : 'squeeze_tracks';
  
  const { data: item, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) return res.status(404).send('Content not found');

  const title = `${item.title} ${isAlbum ? '(Music Pack)' : ''} | Pinegroove`;
  const description = item.description?.substring(0, 160) || "Listen on Pinegroove";
  const image = item.cover_url;
  const url = `https://pinegroove.net/${type}/${slug}`;

  // Dati Strutturati per Google (Schema.org)
  const jsonLd = isAlbum 
    ? {
        "@context": "https://schema.org",
        "@type": "MusicAlbum",
        "name": item.title,
        "image": image,
        "description": description,
        "offers": item.price ? {
          "@type": "Offer",
          "price": item.price,
          "priceCurrency": "USD",
          "url": item.gumroad_link
        } : undefined
      }
    : {
        "@context": "https://schema.org",
        "@type": "MusicRecording",
        "name": item.title,
        "byArtist": { "@type": "MusicGroup", "name": item.artist_name },
        "image": image,
        "description": description
      };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta name="description" content="${description}">
      <meta property="og:type" content="${isAlbum ? 'music.album' : 'music.song'}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta property="og:url" content="${url}">
      <meta name="twitter:card" content="summary_large_image">
      <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
      <script>window.location.href = '${url}';</script>
    </head>
    <body><p>Redirecting...</p></body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).send(html);
}