const LINK_NOISE = /ad(s|sby|system|server|nxs|srvr)?[.\-]|doubleclick|googlesyndication|google-analytics|googletagmanager|googletagservices|amazon-ads|adsystem|adnxs|pubmatic|rubiconproject|openx|criteo|taboola|outbrain|sharethrough|moatads|scorecardresearch|chartbeat|newrelic|jsdelivr|cloudflare\.com|akamai|fastly|cdn\.|\.cdn\.|assets\.|static\.|media\.|img\.|images\.|fonts\.|gravatar|wp-content|wp-includes/i;

function stripWayback(html) {
  html = html.replace(/<!-- BEGIN WAYBACK TOOLBAR INSERT -->[\s\S]*?<!-- END WAYBACK TOOLBAR INSERT -->/gi, '');
  html = html.replace(/<script[^>]*web-static\.archive\.org[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*archive\.org[^>]*><\/script>/gi, '');
  html = html.replace(/<!--\s*FILE ARCHIVED[\s\S]*?-->/gi, '');
  return html;
}

function scrapeLinks(html, sourceUrl, limit = 7) {
  const sourceHost = new URL(sourceUrl).hostname.replace(/^www\./, '');
  const re = /<a\s[^>]*href=["'](https?:\/\/[^"'\s>]+)["']/gi;
  const seen = new Set(); const links = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    if (links.length >= limit) break;
    try {
      const h = new URL(m[1]).hostname.replace(/^www\./, '');
      if (h !== sourceHost && !seen.has(h) && !LINK_NOISE.test(h)) {
        seen.add(h); links.push(m[1]);
      }
    } catch(_) {}
  }
  return links;
}

function mergeLinks(host, html, sourceUrl) {
  if (!save.domainLinks) save.domainLinks = {};
  const fresh = scrapeLinks(html, sourceUrl, 7);
  const existing = save.domainLinks[host] || [];
  const merged = [...new Set([...existing, ...fresh])].slice(0, 20);
  save.domainLinks[host] = merged;
  writeSave();
}

function pickLinks(host, n = 4) {
  if (!save.domainLinks) return [];
  const pool = save.domainLinks[host] || [];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

function analyzeHtml(rawHtml, url) {
  const domain = (() => { try { return new URL(url).hostname.replace(/^www\./,''); } catch(_) { return url; } })();

  for (const [key, data] of Object.entries(KNOWN_SITES)) {
    if (domain === key || domain.endsWith('.' + key)) {
      return { ...data };
    }
  }

  const h = rawHtml || '';
  const len = h.length;

  const seed = hashStr(domain);
  const rng = (range) => ((seed >>> 0) % range);

  const tags = (h.match(/<[a-zA-Z][^>]*>/g) || []).length;
  const divDepth = (h.match(/<div/gi) || []).length;
  const semanticTags = (h.match(/<(article|section|main|aside|header|footer|nav|figure)/gi) || []).length;
  const totalTags = tags + divDepth;
  const htmlDepth = clamp(
    len === 0 ? 20 + rng(30) :
    Math.log10(Math.max(totalTags, 1)) * 20 + semanticTags * 0.5 + rng(15),
    5, 95
  );

  const styleTags   = (h.match(/<style[^>]*>/gi) || []).length;
  const inlineStyles= (h.match(/style="/gi) || []).length;
  const classNames  = new Set((h.match(/class="([^"]+)"/gi) || []).map(m => m.slice(7,-1).split(' ')).flat()).size;
  const linkTags    = (h.match(/<link[^>]+stylesheet/gi) || []).length;
  const cssComplexity = clamp(
    len === 0 ? 25 + rng(35) :
    styleTags * 8 + linkTags * 10 + Math.min(classNames, 200) * 0.3 + inlineStyles * 0.2 + rng(12),
    5, 95
  );

  const scriptTags  = (h.match(/<script/gi) || []).length;
  const externalJs  = (h.match(/<script[^>]+src=/gi) || []).length;
  const inlineJs    = (h.match(/onclick|onload|addEventListener/gi) || []).length;
  const frameworks  = (h.match(/react|angular|vue|svelte|next|nuxt|ember|backbone/gi) || []).length;
  const jsWeight = clamp(
    len === 0 ? 30 + rng(40) :
    externalJs * 8 + scriptTags * 5 + frameworks * 15 + inlineJs * 0.5 + rng(10),
    5, 95
  );

  const textLen    = h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().length;
  const images     = (h.match(/<img/gi) || []).length;
  const links      = (h.match(/<a\s/gi) || []).length;
  const contentDensity = clamp(
    len === 0 ? 20 + rng(25) :
    Math.min(textLen / 100, 50) + images * 1.5 + Math.min(links, 50) * 0.5 + rng(10),
    5, 95
  );

  const subdomains = (domain.split('.').length - 1);
  const domainLen  = domain.length;
  const domainBonus = Math.min(domainLen * 0.5 + subdomains * 3, 15);
  const score = clamp(
    (htmlDepth * 0.25 + cssComplexity * 0.25 + jsWeight * 0.35 + contentDensity * 0.15) + domainBonus,
    1, 99
  );

  let siteTitle = '';
  const ogTitle = h.match(/property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
                || h.match(/content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const titleTag = h.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (ogTitle)   siteTitle = ogTitle[1].split(/[|:,\-––·]/)[0].trim().slice(0, 30);
  else if (titleTag) siteTitle = titleTag[1].split(/[|:,\-––·]/)[0].trim().slice(0, 30);
  if (siteTitle && siteTitle.split(' ').length > 3) {
    siteTitle = siteTitle.split(' ').slice(0, 2).join(' ');
  }
  if (!siteTitle) {
    siteTitle = domain.split('.')[0];
    siteTitle = siteTitle.charAt(0).toUpperCase() + siteTitle.slice(1);
  }

  const complexity = score > 75 ? 'extremely complex' : score > 55 ? 'moderately complex' : score > 35 ? 'fairly simple' : 'minimal';
  const jsDesc     = jsWeight > 70 ? 'heavy JavaScript framework usage' : jsWeight > 40 ? 'moderate scripting' : 'light JavaScript usage';
  const cssDesc    = cssComplexity > 70 ? 'sophisticated styling systems' : cssComplexity > 40 ? 'custom stylesheets' : 'simple CSS';
  const analysis   = `${siteTitle} is ${complexity}, featuring ${jsDesc} and ${cssDesc}. `
    + (len > 0
      ? `The fetched HTML contains ${tags.toLocaleString()} tags across ${Math.round(len/1024)}KB of markup.`
      : `No HTML was fetched — stats estimated from domain characteristics.`);

  return { siteTitle, score, htmlDepth, cssComplexity, jsWeight, contentDensity, analysis };
}

async function fetchFavicon(url, rawHtml) {
  // For Wayback URLs extract the real domain for favicon resolution
  const waybackM = url.match(/web\.archive\.org\/web\/(\d+)\/(https?:\/\/)?([^/]+)/);
  const realDomain = waybackM ? waybackM[3] : null;

  const origin = (() => { try { const u = new URL(url.startsWith('http') ? url : 'https://' + url); return u.origin; } catch(_) { return ''; } })();
  if (!origin) return null;

  const tryOne = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.onload  = () => (img.naturalWidth > 1 ? res(src) : rej());
    img.onerror = rej;
    img.src = src;
    setTimeout(rej, 1500);
  });

  const race = (srcs) => srcs.length
    ? Promise.any(srcs.map(tryOne)).catch(() => null)
    : Promise.resolve(null);

  const htmlCandidates = [];
  if (rawHtml) {
    const iconRels = ['apple-touch-icon', 'icon', 'shortcut icon', 'fluid-icon', 'mask-icon'];
    const linkRe = /<link[^>]+>/gi;
    let m;
    while ((m = linkRe.exec(rawHtml)) !== null) {
      const tag = m[0];
      const relM = tag.match(/rel=["']([^"']+)["']/i);
      const hrefM = tag.match(/href=["']([^"']+)["']/i);
      if (relM && hrefM) {
        const rel = relM[1].toLowerCase();
        if (iconRels.some(r => rel.includes(r))) {
          let href = hrefM[1];
          if (href.startsWith('//'))    href = 'https:' + href;
          else if (href.startsWith('/')) href = origin + href;
          else if (!href.startsWith('http')) href = origin + '/' + href;
          htmlCandidates.push(href);
        }
      }
    }
  }

  const fallbacks = realDomain ? [
    // Wayback-served favicon for the archived domain
    `https://web.archive.org/web/${waybackM[1]}/${realDomain}/favicon.ico`,
    `https://web.archive.org/web/${waybackM[1]}/${realDomain}/favicon.png`,
    // Google favicon using real domain (not web.archive.org)
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(realDomain)}&sz=128`,
  ] : [
    origin + '/apple-touch-icon.png',
    origin + '/apple-touch-icon-precomposed.png',
    origin + '/favicon.ico',
    origin + '/favicon.png',
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=128`,
  ];

  if (htmlCandidates.length) {
    const r = await race(htmlCandidates);
    if (r) return r;
  }
  return race(fallbacks);
}

function buildMonsterIllustration(faviconUrl, tier, size, mini) {
  const S = size || 100;
  if (!faviconUrl) return tier.draw(S, mini || false);
  const iSz = Math.round(S * 0.62);
  const svgFallback = tier.draw(S, mini || false).replace(/`/g,"'").replace(/"/g,'&quot;');
  return `<div style="
    width:${S}px;height:${S}px;flex-shrink:0;
    border-radius:50%;
    background:${tier.bg};
    border:2px solid ${tier.color}80;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 16px ${tier.color}50;
    overflow:hidden;position:relative;
  ">
    <img src="${faviconUrl}"
      width="${iSz}" height="${iSz}"
      style="object-fit:contain;image-rendering:auto;display:block;position:relative;z-index:1;"
      onerror="this.parentElement.outerHTML='${svgFallback}';"
      alt="site icon" />
  </div>`;
}

async function summonMonster() {
  const raw = document.getElementById('urlInput').value.trim();
  if (!raw) return;
  const url = raw.startsWith('http') ? raw : 'https://' + raw;
  const isLinkedHunt = !!window._linkedHunt;
  window._linkedHunt = false;

  hide('monsterPanel'); hide('errBox'); show('loading');
  document.getElementById('loadingMsg').textContent = 'Entering the Unweb…';
  document.getElementById('loadingUrl').textContent = url;
  resetLootPanel();

  try {
    const domain = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch(_) { return url; } })();
    const isKnown = Object.keys(KNOWN_SITES).some(k => domain === k || domain.endsWith('.' + k));

    let html = '';
    let cachedParsed = null;
    if (isKnown) {
      document.getElementById('loadingMsg').textContent = 'Known domain — skipping fetch…';
      // Background fetch for link scraping only — non-blocking
      fetch(PROXY + encodeURIComponent(url))
        .then(r => r.ok ? r.text() : '')
        .then(h => { if (h) mergeLinks(domain, h, url); })
        .catch(() => {});
    } else {
      // Check monster score cache first
      document.getElementById('loadingMsg').textContent = 'Checking bestiary…';
      cachedParsed = await sbGetMonster(domain);
      if (!cachedParsed) {
        document.getElementById('loadingMsg').textContent = 'Summoning Site…';
        try {
          const r = await fetch(PROXY + encodeURIComponent(url));
          if (r.ok) {
            html = await r.text();
            if (url.includes('web.archive.org')) html = stripWayback(html);
          }
        } catch(_) {}
      } else {
        document.getElementById('loadingMsg').textContent = 'Monster found in bestiary…';
      }
    }

    document.getElementById('loadingMsg').textContent = 'Seeking the creature…';
    const [faviconUrl, parsed] = await Promise.all([
      fetchFavicon(url, html),
      Promise.resolve(cachedParsed || analyzeHtml(html, url)),
    ]);
    parsed.score = Math.min(parsed.score, 100);

    // Cache the analysis for future visits (only for unknown sites we actually fetched)
    if (!isKnown && !cachedParsed && html) {
      sbSetMonster(domain, parsed); // fire-and-forget
    }

    const metaTokens = parseMetaTags(html);

    const tier  = getTier(parsed.score);
    const entry = {
      url,
      siteTitle:       parsed.siteTitle,
      monsterName:     `${parsed.siteTitle} ${tier.suffix}`,
      score:           parsed.score,
      htmlDepth:       parsed.htmlDepth,
      cssComplexity:   parsed.cssComplexity,
      jsWeight:        parsed.jsWeight,
      contentDensity:  parsed.contentDensity,
      analysis:        parsed.analysis,
      color:           tier.color,
      bg:              tier.bg,
      flavor:          tier.flavor,
      tierMin:         tier.min,
      tierMax:         tier.max,
      metaTokens,
      faviconUrl,
      ts:              Date.now(),
      linkedHunt:      isLinkedHunt,
    };

    if (html) mergeLinks(domain, html, url);
    entry.suggestedLinks = pickLinks(domain, 4);
    entry.outcome = 'pending';
    save.bestiary = [entry, ...save.bestiary.filter(e => e.url !== url)].slice(0,20);
    writeSave();
    hide('loading');

    const already = save.defeated.includes(url);
    // Generate two independent drops. Re-roll slot 2 once if it lands on an
    // identical item (same slot + name as slot 1) — keeps duplicates rare but
    // intentionally possible if the re-roll still matches.
    const slot3 = parsed.score >= 25;
    const slot4 = parsed.score >= 40;
    let _d1, _d2, _d3, _d4;
    if (!already) {
      const { rank: dropRank } = getHunterRank(save.playerXP);
      const dropLvl = dropRank.lvl;
      _d1 = dropToGoldIfDuplicate(generateDrop(parsed.score, metaTokens, parsed.siteTitle), parsed.score, dropLvl);
      _d2 = generateDrop(parsed.score, metaTokens, parsed.siteTitle);
      if (_d2 && !_d2._goldDrop && _d1 && !_d1._goldDrop && _d1.slot === _d2.slot && _d1.name === _d2.name)
        _d2 = generateDrop(parsed.score, metaTokens, parsed.siteTitle);
      _d2 = dropToGoldIfDuplicate(_d2, parsed.score, dropLvl);
      if (slot3) _d3 = dropToGoldIfDuplicate(generateDrop(parsed.score, metaTokens, parsed.siteTitle), parsed.score, dropLvl);
      if (slot4) _d4 = dropToGoldIfDuplicate(generateDrop(parsed.score, metaTokens, parsed.siteTitle), parsed.score, dropLvl);
    }
    window._pendingDrops = already ? [null,null,null,null] : [_d1, _d2, _d3||null, _d4||null];
    window._claimedLoot  = {};
    window._fightActive  = !already;  // lock equip until monster is beaten

    resetLootPanel(parsed.score);

    if (!already) {
      renderLootSlot(document.getElementById('loot-slot-1'), window._pendingDrops[0], 0);
      renderLootSlot(document.getElementById('loot-slot-2'), window._pendingDrops[1], 1);
      if (slot3) renderLootSlot(document.getElementById('loot-slot-3'), window._pendingDrops[2], 2);
      if (slot4) renderLootSlot(document.getElementById('loot-slot-4'), window._pendingDrops[3], 3);
    } else {
      document.getElementById('loot-slot-1').innerHTML = '<div class="loot-empty">Already defeated — reduced XP only</div>';
    }

    document.getElementById('monsterIllustration').innerHTML = buildMonsterIllustration(entry.faviconUrl, tier, 100, false);
    const badge = document.getElementById('levelBadge');
    badge.style.background = entry.bg;
    badge.style.color      = entry.color;
    badge.style.border     = `0.5px solid ${entry.color}60`;
    document.getElementById('levelNum').textContent      = entry.score;
    document.getElementById('monsterName').textContent   = entry.monsterName;
    document.getElementById('monsterFlavor').textContent = 'This creature ' + entry.flavor;

    const pill = document.getElementById('scorePill');
    pill.textContent       = 'Score: ' + entry.score + ' / 100';
    pill.style.background  = entry.bg;
    pill.style.color       = entry.color;
    pill.style.border      = `0.5px solid ${entry.color}50`;

    document.getElementById('tierClass').textContent = tier.suffix.replace('the ','').toUpperCase() + ' CLASS';

    hide('postFight');
    document.getElementById('combatLog').innerHTML = '';

    // Danger warning: show if monster tier is 2+ tiers above player rank tier
    const { rank: pRank } = getHunterRank(save.playerXP);
    const playerTierIdx  = Math.min(9, Math.floor((pRank.lvl - 1) / 10));
    const monsterTierIdx = TIERS.findIndex(t => entry.score >= t.min && entry.score <= t.max);
    const dangerEl = document.getElementById('dangerWarning');
    if (dangerEl) {
      if (monsterTierIdx - playerTierIdx >= 2) {
        dangerEl.style.display = '';
        dangerEl.innerHTML = `<i class="ti ti-alert-triangle"></i> This entity is far beyond your current power — proceed at your own peril. <i class="ti ti-alert-triangle"></i>`;
      } else {
        dangerEl.style.display = 'none';
      }
    }

    show('monsterPanel');
    if (window.innerWidth <= 640) {
      var _mp = document.getElementById('monsterPanel');
      _mp.classList.add('mob-modal');
      document.body.appendChild(_mp); // escape .center-col stacking context
      document.getElementById('mobFightBackdrop').classList.add('active');
    }
    initFight(entry);
    renderBestiary();

  } catch(err) {
    hide('loading');
    document.getElementById('errBox').textContent = 'Summoning failed: ' + err.message;
    show('errBox');
  }
}
