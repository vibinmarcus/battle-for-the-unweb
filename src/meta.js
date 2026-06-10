const STOPWORDS = new Set(['the','and','for','are','but','not','you','all','can','had','was','one','our','out','get','has','its','let','new','now','see','two','way','who','did','any','may','say','she','too','use','www','com','net','org','http','https','html','page','site','web','home','menu','search','click','here','more','this','that','with','from','they','will','been','have','what','when','your','about','which','there','their','would','could','should','other','after','first','these','those','where','while']);

function parseMetaTags(html) {
  const tokens = [];

  function extractWords(str, maxWords) {
    const words = str.split(/[\s,;|·\-––]+/)
      .map(w => w.replace(/[^a-zA-Z0-9']/g,'').trim())
      .filter(w => w.length > 2 && w.length < 20 && !STOPWORDS.has(w.toLowerCase()) && !/^\d+$/.test(w));
    return maxWords ? words.slice(0, maxWords) : words;
  }

  const kwPatterns = [
    /meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/gi,
    /meta[^>]+content=["']([^"']+)["'][^>]+name=["']keywords["']/gi,
  ];
  for (const rx of kwPatterns) {
    let m; while ((m = rx.exec(html)) !== null) extractWords(m[1]).forEach(w => tokens.push(w));
  }

  const ogPatterns = [
    /meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/gi,
    /meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/gi,
  ];
  for (const rx of ogPatterns) {
    let m; while ((m = rx.exec(html)) !== null) extractWords(m[1], 4).forEach(w => tokens.push(w));
  }

  const descPatterns = [
    /meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/gi,
    /meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/gi,
  ];
  for (const rx of descPatterns) {
    let m; while ((m = rx.exec(html)) !== null) extractWords(m[1], 4).forEach(w => tokens.push(w));
  }

  const titleRx = /<title>([^<]+)<\/title>/gi;
  let tm; while ((tm = titleRx.exec(html)) !== null) extractWords(tm[1], 3).forEach(w => tokens.push(w));

  const seen = new Set(), unique = [];
  for (const t of tokens) { const k = t.toLowerCase(); if (!seen.has(k)) { seen.add(k); unique.push(t); } }
  return unique.slice(0, 20);
}

function pickMeta(tokens, fallback) {
  return tokens.length > 0 ? tokens[Math.floor(Math.random() * tokens.length)] : fallback;
}
