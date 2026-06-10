# Battle for the Unweb — Project Memory

## What this project is

A browser-based RPG where the player enters a URL, the app fetches and analyzes the page's HTML complexity, generates a monster from it, and fights it in round-by-round combat to earn XP and D2-style loot. Inspired by the game "Unweb" by hanzo (postmortem: https://www.gamegrene.com/node/183).

## Active files

**Entry point:** `index.html` — clean HTML shell with no inline logic, loads external CSS and JS.

**Styles:** `styles/main.css`

**Scripts (load order matters):**
```
src/data.js      ← constants, KNOWN_SITES, CLASSES, HUNTER_RANKS, RC, D2 item bases
src/tiers.js     ← TIERS array (SVG drawings), getTier(), getHunterRank(), calcXP()
src/meta.js      ← parseMetaTags(), pickMeta(), STOPWORDS
src/loot.js      ← D2_SPRITES (base64 WebP), getSpriteUrl(), generateDrop(), rollQuality()
src/monster.js   ← analyzeHtml(), fetchFavicon(), buildMonsterIllustration(), summonMonster()
src/combat.js    ← initFight(), doFightRound(), endFight(), logCombat()
src/bestiary.js  ← renderBestiary(), copyMonster()
src/main.js      ← save/load, screen routing, renderInventory(), equipFromLoot(), renderHome()
src/pentagram.js ← SVG draw animation (IIFE, runs on load)
```

## Architecture

- **Stack:** Multi-file vanilla JS + CSS. No build step, no framework, no API key required.
- **Monster analysis:** Deterministic `analyzeHtml()` in `monster.js` — no Claude API call needed. Falls back to tag counting, class counting, JS weight estimation.
- **KNOWN_SITES database:** 22 sites hardcoded with accurate scores (google, youtube, facebook, twitter/x, reddit, github, wikipedia, amazon, netflix, apple, microsoft, nytimes, cnn, stackoverflow, twitch, linkedin, instagram, example, cloudflare, vercel, cnet).
- **CORS proxy:** `https://api.allorigins.win/raw?url=` for fetching HTML from arbitrary URLs.
- **Save system:** `localStorage` key `bftuw_v1`, JSON blob. Managed in `main.js`.
- **Favicon:** `fetchFavicon()` tries HTML icon links → standard paths → Google favicon service (sz=128). og:image excluded.

## Layout

- 728px fixed-height card (`max-width: 900px`), centered on page via flex `page-wrapper`.
- Three-column: left inventory (`inv-col`, 130px) | center content (`center-col`, flex:1) | right loot (`loot-col`, 130px).
- Pentagram SVG behind content, `z-index` layering ensures columns are above it.
- Three screens: `screen-home`, `screen-create`, `screen-game`.
- Responsive: columns shrink to 100px at ≤640px, hide at ≤480px.

## Theme / design tokens

```css
--bg-page:        #050208   /* near-black void */
--gold:           #e8304a   /* primary crimson-gold */
--gold-lt:        #ff5566
--ember:          #cc1a2a
--green:          #4a9e6a
--bg-card:        #0e0614
--border-dark:    #2a1020
--border-mid:     #5a1a3a
--border-light:   #3a0a2e
--text-primary:   #e8c0c8
--text-secondary: #8a3a4a
--text-tertiary:  #5a1a2a
--text-danger:    #e8304a
--bg-danger:      #1a0510
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 10px
```

Scrollbar: 1.5px wide, transparent track, `#3a0a2e` thumb.

**Note:** CSS also defines `--c-normal`, `--c-magic`, etc. rarity vars, but the JS uses the `RC` object in `data.js` for rarity colors — both exist currently.

## Character classes

| Class   | ATK bonus | DEF bonus | Special (description only — NOT wired to combat) |
|---------|-----------|-----------|---------------------------------------------------|
| Warrior | 8         | 5         | 15% block (negate incoming hit) |
| Mage    | 12        | 2         | 20% crit (1.75× damage) |
| Rogue   | 10        | 4         | 25% dodge (evade incoming hit) |
| Ranger  | 9         | 6         | First-strike (free hit at 60% ATK on round 1) |
| Paladin | 7         | 8         | Regen 2 HP per round |

**Important:** Class specials are listed in descriptions but `doFightRound()` does NOT implement any of them. Combat is flat random-hit with ATK/DEF only.

## Monster system

- 10 tiers: Feeble (lv1–10) → Boundless (lv91–100)
- Name = `{siteTitle} {tier.suffix}` e.g. "CNET the Relentless"
- Stats derived from: htmlDepth, cssComplexity, jsWeight, contentDensity
- SVG pixel-art illustration per tier (inline draw functions in `tiers.js`)
- Favicon used as circular monster image frame (falls back to SVG)

## Site title parsing

Splits on `[|:,\-––·]`, takes first segment, caps at 2 words if >3 words remain, max 30 chars. Prevents "CNET: Product reviews, advice..." → "CNET".

## Loot system (`loot.js`)

- **D2_SPRITES:** Base64 WebP sprites, 5 categories: `armor` (chest), `helmet`, `boots`, `gloves`, `amulet`
- **Item quality tiers:** Normal / Magic / Rare / Set / Unique / Rune / Gem / Charm
- **Rarity colors:** `RC` object in `data.js` (not CSS vars — the `--c-*` vars in CSS are redundant/unused by JS)
- **Item names:** Generated from page meta-tags (keywords, og:title, description, title tag) filtered through stopwords
- **4 loot slots:** 2 active drops + 2 locked (always locked — unlock mechanic not implemented)
- **`generateDrop(score, metaTokens, siteTitle)`** — rolls quality + builds item object
- **`getSpriteUrl(itemName, gameSlot)`** — exact name match → partial match → random from pool

### Sprite slot mapping

```js
const SLOT_TO_SPRITE = {
  helmet: 'helmet', amulet: 'amulet', chest: 'chest',
  gloves: 'gloves', pants: 'boots', boots: 'boots',
};
```

`pants` key maps to `boots` sprites — do not change this.

## Inventory slots

Equipment keys: `helmet`, `amulet`, `chest`, `gloves`, `pants`. The "Boots" label in UI uses internal key `pants` — `SLOT_TO_SPRITE` handles the translation.

## Pentagram animation (`pentagram.js`)

SVG drawn on page load via `stroke-dashoffset` animation. Five lines in order: **1→3, 3→5, 5→2, 2→4, 4→1**:
- Start: bottom (450, 602)
- Upper-right (578, 196)
- Lower-left (250, 450)
- Lower-right (650, 450)
- Upper-left (322, 196)
- Back to bottom (450, 602)

Vertex dots light up at each arrival. Outer circle traces after lines complete. Embers fade in last.

## Combat (`combat.js`)

Multi-round, player clicks "Fight" each round. `doFightRound()` resolves a player attack then a monster counterattack with flat miss chances (15% player miss, 20% monster miss). HP bars update after each round.

**Player stats formula:**
- `playerMaxHP = 100 + rank.lvl * 5`
- `playerATK = 10 + rank.lvl * 2 + cls.atkBonus + htmlDepth * 0.1`
- `playerDEF = 5 + rank.lvl + cls.defBonus + cssComplexity * 0.05`
- `monsterMaxHP = 50 + score * 3`
- `monsterATK = 5 + score * 0.8 + jsWeight * 0.15`
- `monsterDEF = 2 + score * 0.3 + contentDensity * 0.05`

## Battle Record (`bestiary.js`)

Shows outcome icon: ⚔️ Defeated (green) / 💀 Lost (crimson) / ⏳ In progress. Header: "X encountered · Y defeated · Z lost". Outcomes stored as `entry.outcome = 'victory'|'defeat'|'pending'`. Max 20 entries.

## XP & ranking

8 hunter ranks: Novice → Mythic. Label reads "Lvl" (not "Hunter Lvl"). Repeat victories award 10% XP.

## Home screen

- Save preview card shows character name, class, rank, XP, defeated count, item count.
- "Load adventure" button is disabled when no save exists.
- No "Delete save" button currently — was mentioned in old notes but not present in current code.

## Key JS functions

| Function | File | Purpose |
|---|---|---|
| `analyzeHtml(rawHtml, url)` | monster.js | Deterministic monster stat generator |
| `fetchFavicon(url, rawHtml)` | monster.js | Priority: HTML links → standard paths → Google |
| `summonMonster()` | monster.js | Full flow: fetch → analyze → build entry → init fight |
| `parseMetaTags(html)` | meta.js | Extracts loot name tokens from meta |
| `generateDrop(score, metaTokens, siteTitle)` | loot.js | Rolls item quality + builds item object |
| `getSpriteUrl(itemName, gameSlot)` | loot.js | D2 sprite lookup with slot translation |
| `initFight(entry)` | combat.js | Sets up fight state and renders stats |
| `doFightRound()` | combat.js | One combat round (no class specials implemented) |
| `endFight(won)` | combat.js | Awards XP, saves loot, renders post-fight |
| `renderBestiary()` | bestiary.js | Renders battle record panel |
| `renderInventory()` | main.js | Updates equipment slots from save.equipped |
| `equipFromLoot(idx)` | main.js | Moves loot drop into equipped slot |
| `getTier(score)` | tiers.js | Returns tier object for a given score |
| `getHunterRank(xp)` | tiers.js | Returns rank, next rank, and progress % |

## What's pending / not yet done

- **Charm stats not applied to combat** — `calcEquipmentBonuses()` iterates `Object.values(save.equipped)` but `charms` is an array `[null,null]`, so charm props are never parsed. Need to flatten charms into the loop.
- **Charm sprites** — charms display a generic `ti-hexagon` icon. No sprite art exists for them; consider adding charm-specific base64 sprites to `D2_SPRITES` in `loot.js` or using a distinct colored icon per charm type.
- **Host on a git repository (GitHub recommended)** — see details below.


- **Class specials not implemented** — Warrior block, Mage crit, Rogue dodge, Ranger first-strike, Paladin regen are all described in class cards but `doFightRound()` is flat — no special logic exists.
- **Item stats not applied to combat** — item props like `+ATK` are cosmetic strings only, not parsed into player stats.
- **Loot slots 3 & 4 always locked** — no mechanic to unlock them (e.g. by rank or monster tier).
- **Delete save button** — referenced in old notes but not present in current UI.
- **Gold drops + gambling system** — planned but not started.
- **Player-to-player item trading** — requires backend, not started.
- **Drag-and-drop inventory** — not started.

## Hosting on GitHub

### Why
- Version history and rollback for every change
- Easy to continue on any machine with just `git clone`
- Required prerequisite for deploying the game publicly (GitHub Pages, Netlify, Vercel all read from a repo)
- Replaces the current OneDrive-only sync with a proper source of truth

### Requirements
- [Git](https://git-scm.com/download/win) installed on the machine
- A [GitHub](https://github.com) account (free)
- GitHub CLI (`gh`) optional but makes auth easier: `winget install GitHub.cli`

### How to set it up (one-time)
```powershell
# 1. From inside the project folder:
cd "C:\Users\marcu\OneDrive\Desktop\claude\battle for the unweb"

# 2. Initialise a local repo
git init
git add .
git commit -m "Initial commit"

# 3. Create the remote repo and push (GitHub CLI)
gh auth login       # follow prompts, browser-based
gh repo create battle-for-the-unweb --public --source=. --remote=origin --push

# Without GitHub CLI, create the repo at github.com manually,
# then: git remote add origin https://github.com/YOUR_USERNAME/battle-for-the-unweb.git
#       git push -u origin main
```

### Day-to-day workflow after setup
```powershell
git add .
git commit -m "describe what changed"
git push
```
On another machine: `git clone https://github.com/YOUR_USERNAME/battle-for-the-unweb.git`

### Things to do before first commit
- Add a `.gitignore` to exclude `node_modules/` if you ever add any
- The project has no secrets or API keys so everything else is safe to commit publicly
- Consider whether to keep `loot.js` public — it contains the full base64 sprite data (large but not sensitive)

### Public hosting (optional next step)
Once on GitHub, deploying is trivial:
- **GitHub Pages**: repo Settings → Pages → deploy from `main` branch root. Free, instant.
- **Netlify / Vercel**: connect repo, zero config needed for a static site. Also free.

## Things to preserve / never break

- The `pants` → `boots` SLOT_TO_SPRITE mapping
- Site title parsing: colon must be in the split pattern
- Pentagram draw order: 1→3→5→2→4→1
- "Lvl" label (not "Hunter Lvl")
- Scrollbar at 1.5px
- Rarity colors live in the `RC` object in `data.js` — the JS does not read CSS `--c-*` vars
- Script load order: `data → tiers → meta → loot → monster → combat → bestiary → main → pentagram`
