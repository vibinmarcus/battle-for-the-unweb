let save = {
  created: false,
  charName: '',
  classId: '',
  playerXP: 0,
  bestiary: [],
  defeated: [],
  equipment: [],
  equipped: { helmet:null, amulet:null, chest:null, gloves:null, boots:null, charms:[null,null] }
};

async function loadSave() {
  // Try cloud first
  const cloud = await sbLoadSave();
  if (cloud && cloud.created) {
    save = cloud;
    _patchSave();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(_) {}
    return;
  }
  // Fall back to localStorage — migrate to cloud if found
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.created) {
      save = s;
      _patchSave();
      sbWriteSave(save); // migrate
    }
  } catch(_) {}
}

function _patchSave() {
  if (!save.equipped) save.equipped = { helmet:null, amulet:null, chest:null, gloves:null, boots:null, charms:[null,null] };
  if (!save.equipped.charms) save.equipped.charms = [null, null];
  if (!save.domainLinks) save.domainLinks = {};
  if (!save.bestScore)   save.bestScore   = 0;
  if (!save.gold)        save.gold        = 0;
}

function renderGold() {
  const el = document.getElementById('goldAmountEl');
  const wrap = document.getElementById('goldDisplay');
  if (!el || !wrap) return;
  el.textContent = (save.gold || 0).toLocaleString();
  wrap.style.display = save.created ? 'flex' : 'none';
}

let _saveTimer = null;
function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(_) {}
  // Debounce cloud writes — batch rapid changes into one request
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => sbWriteSave(save), 2000);
}

function hasSave() { return save.created; }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-game') { initScrollArrow(); renderStarterSuggestions(); }
}

function goHome() {
  document.getElementById('invPanel').style.display  = 'none';
  document.getElementById('lootPanel').style.display = 'none';
  const hc = document.getElementById('homeContent');
  if (hc) hc.style.opacity = '1';
  showScreen('screen-home');
  renderHome();
}

function goNewAdventure() { showScreen('screen-create'); renderClassGrid(); }

function goLoadAdventure() {
  if (!hasSave()) return;
  document.getElementById('invPanel').style.display  = '';
  document.getElementById('lootPanel').style.display = '';
  showScreen('screen-game');
  renderGame();
}

let _lbOpen = false;

function toggleLeaderboard() {
  _lbOpen = !_lbOpen;
  const card = document.getElementById('leaderboardCard');
  const btn  = document.getElementById('lbToggleBtn');
  card.style.display = _lbOpen ? '' : 'none';
  btn.classList.toggle('lb-open', _lbOpen);
  if (_lbOpen) renderLeaderboard();
}

async function renderLeaderboard() {
  const rows = document.getElementById('lbRows');
  if (!rows) return;
  rows.innerHTML = '<div class="lb-empty">Loading…</div>';
  const data = await sbFetchLeaderboard();
  if (!data.length) { rows.innerHTML = '<div class="lb-empty">No hunters ranked yet — be the first!</div>'; return; }
  const me = sbUser();
  const CLASSES_MAP = Object.fromEntries((typeof CLASSES !== 'undefined' ? CLASSES : []).map(c => [c.id, c.name]));
  rows.innerHTML = data.map((row, i) => {
    const rank    = i + 1;
    const isMe    = me && row.user_id === me.id;
    const topRank = rank <= 3;
    const crown   = rank === 1 ? '👑 ' : '';
    const cls     = CLASSES_MAP[row.char_class] || row.char_class || '';
    const hiScore = row.best_score >= 40;
    return `<div class="lb-row${isMe ? ' lb-me' : ''}">
      <div class="lb-rank${topRank ? ' lb-top' : ''}">${crown}${rank}</div>
      <div class="lb-name${isMe ? ' lb-me-name' : ''}">${row.char_name}<span class="lb-class-tag">${cls}</span></div>
      <div class="lb-val lb-lvl">${row.level}</div>
      <div class="lb-val">${row.kills}</div>
      <div class="lb-val${hiScore ? ' lb-best-hi' : ''}">${row.best_score}</div>
    </div>`;
  }).join('');
}

function refreshLeaderboard() { renderLeaderboard(); }

function renderHome() {
  const u = sbUser();
  const lbl = document.getElementById('authUserLabel');
  if (lbl && u) lbl.textContent = u.username;
  const lb = document.getElementById('loadBtn');
  const sp = document.getElementById('savePreview');
  if (hasSave()) {
    lb.classList.remove('disabled');
    sp.style.display = '';
    const cls    = getClassById(save.classId);
    const {rank} = getHunterRank(save.playerXP);
    const av     = document.getElementById('spAvatar');
    av.textContent = cls ? cls.avatar : '?';
    av.style.cssText = `width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;background:${cls?cls.bg:'rgba(100,100,100,0.2)'};color:${cls?cls.color:'#aaa'}`;
    document.getElementById('spName').textContent     = save.charName;
    const spCls = document.getElementById('spClass');
    spCls.textContent = (cls ? cls.name : '') + ' · ' + rank.name;
    if (cls?.special) { spCls.title = '✦ ' + cls.special; spCls.style.cursor = 'help'; }
    document.getElementById('spXP').textContent       = save.playerXP.toLocaleString();
    document.getElementById('spDefeated').textContent = save.defeated.length;
    document.getElementById('spItems').textContent    = save.equipment.length;
    document.getElementById('spDelete').style.display = '';
  } else {
    lb.classList.add('disabled');
    sp.style.display = 'none';
    document.getElementById('spDelete').style.display = 'none';
  }
  // Show the leaderboard toggle button when logged in
  const lbBtn = document.getElementById('lbToggleBtn');
  if (lbBtn && sbUser()) lbBtn.style.display = 'flex';
}

function renderClassGrid() {
  document.getElementById('classGrid').innerHTML = CLASSES.map(c => `
    <div class="class-card" id="cc-${c.id}" onclick="selectClass('${c.id}')">
      <span class="cc-icon"><i class="ti ${c.icon}"></i></span>
      <div class="cc-name">${c.name}</div>
      <div class="cc-desc">${c.desc}</div>
      <div class="cc-special"><i class="ti ti-sparkles" style="font-size:9px;margin-right:3px"></i>${c.special}</div>
    </div>
  `).join('');
}

let selectedClass = '';

const _nameFragments = {
  warrior: {
    pre:  ['Iron','Stone','Blood','Grim','Ash','Scar','Storm','War','Doom','Bone'],
    suf:  ['fist','vale','born','heart','ward','blade','bane','forge','crest','fall'],
  },
  mage: {
    pre:  ['Aether','Vex','Mira','Syl','Nox','Arc','Zeph','Lyr','Oryn','Cal'],
    suf:  ['ix','ara','wyn','ion','us','el','is','oth','ael','an'],
  },
  rogue: {
    pre:  ['Shade','Swift','Null','Dusk','Veil','Blade','Ash','Mist','Night','Edge'],
    suf:  ['runner','step','claw','whisper','dart','vane','slip','tooth','mark','fall'],
  },
  ranger: {
    pre:  ['Hawk','Fern','Crow','Thorn','River','Moss','Cedar','Wolf','Flint','Reed'],
    suf:  ['eye','song','track','stride','watch','wind','wood','arrow','bow','path'],
  },
  paladin: {
    pre:  ['Holy','Dawn','Sol','Aur','Lux','Sere','Vale','Bless','Grace','True'],
    suf:  ['fire','born','shield','heart','light','mark','sworn','vale','keep','ward'],
  },
};

function _generateName(classId) {
  const f = _nameFragments[classId] || _nameFragments.warrior;
  const pre = f.pre[Math.floor(Math.random() * f.pre.length)];
  const suf = f.suf[Math.floor(Math.random() * f.suf.length)];
  return pre + suf;
}

function selectClass(id) {
  selectedClass = id;
  document.querySelectorAll('.class-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('cc-' + id).classList.add('selected');
  // Fill the name input with a generated name each time a class is clicked
  document.getElementById('charNameInput').value = _generateName(id);
}

async function startAdventure() {
  const name   = document.getElementById('charNameInput').value.trim();
  const errEl  = document.getElementById('createErr');
  if (!name)          { errEl.textContent = 'Please enter a name.';   errEl.style.display = ''; return; }
  if (!selectedClass) { errEl.textContent = 'Please choose a class.'; errEl.style.display = ''; return; }
  errEl.textContent = 'Checking name…'; errEl.style.display = '';
  const taken = await sbCheckNameTaken(name);
  if (taken) { errEl.textContent = 'That name is already taken. Choose another.'; return; }
  errEl.style.display = 'none';
  save = { created:true, charName:name, classId:selectedClass, playerXP:0, bestiary:[], defeated:[], equipment:[], equipped:{ helmet:null, amulet:null, chest:null, gloves:null, boots:null, charms:[null,null] } };
  writeSave();
  document.getElementById('invPanel').style.display  = '';
  document.getElementById('lootPanel').style.display = '';
  showScreen('screen-game');
  renderGame();
}

function renderGame() {
  updateXpBar();
  renderCharBar();
  renderGold();
  renderInventory();
  renderBestiary();
  ['monsterPanel','errBox','loading'].forEach(id => document.getElementById(id).style.display = 'none');
  resetLootPanel();
}

function updateXpBar() {
  const { rank, next, pct } = getHunterRank(save.playerXP);
  document.getElementById('xpAvatarEl').innerHTML = `<i class="ti ${rank.icon}" style="font-size:15px;color:var(--gold)"></i>`;
  document.getElementById('xpRankTxt').textContent  = rank.name;
  document.getElementById('xpCountTxt').textContent = save.playerXP.toLocaleString() + ' XP';
  document.getElementById('hunterLvlEl').textContent = rank.lvl;
  const progressXP = save.playerXP - rank.xp;
  document.getElementById('xpCurrentTxt').textContent = progressXP.toLocaleString() + ' XP';
  document.getElementById('xpNextTxt').textContent    = next ? 'next: ' + next.xp.toLocaleString() + ' XP' : 'max rank!';
  setTimeout(() => { document.getElementById('xpFillEl').style.width = Math.min(pct, 100) + '%'; }, 80);
  renderStarterSuggestions();
}

function renderCharBar() {
  const cls = getClassById(save.classId);
  if (!cls) return;
  const el = document.getElementById('charAvatarEl');
  el.textContent      = cls.avatar;
  el.style.background = cls.bg;
  el.style.color      = cls.color;
  document.getElementById('charNameEl').textContent  = save.charName;
  const clsEl = document.getElementById('charClassEl');
  clsEl.textContent = cls.name;
  if (cls.special) { clsEl.title = '✦ ' + cls.special; clsEl.style.cursor = 'help'; }
  const inv = document.getElementById('charAvatarInv');
  inv.textContent      = cls.avatar;
  inv.style.background = cls.bg;
  inv.style.color      = cls.color;
  document.getElementById('charNameInv').textContent  = save.charName;
  const clsInv = document.getElementById('charClassInv');
  clsInv.textContent = cls.name;
  if (cls.special) { clsInv.title = '✦ ' + cls.special; clsInv.style.cursor = 'help'; }
}

function renderCharmSlots() {
  if (!save.equipped.charms) save.equipped.charms = [null, null];
  const { rank } = getHunterRank(save.playerXP);
  [0, 1].forEach(i => {
    const charm   = save.equipped.charms[i];
    const subEl   = document.getElementById(`slot-charm-${i}`);
    const contEl  = document.getElementById(`slot-charm-${i}-c`);
    const isLarge = i === 1;
    const unlocked = !isLarge || rank.lvl >= 10;
    subEl.onmouseenter = null;
    subEl.onmouseleave = null;
    if (!unlocked) {
      subEl.classList.add('charm-locked');
      contEl.innerHTML = `<span style="font-size:9px;opacity:0.6"><i class="ti ti-lock" style="font-size:9px"></i> Lvl 10</span>`;
    } else {
      subEl.classList.remove('charm-locked');
      if (charm) {
        const rc = charm.rc || RC.Charm;
        const tipHtml = [
          `<div style="color:${rc.color};font-weight:600;margin-bottom:2px">${charm.name}</div>`,
          `<div style="color:var(--text-tertiary);font-size:9px;margin-bottom:4px">Charm</div>`,
          ...(charm.props||[]).map(p => `<div>${p}</div>`)
        ].join('');
        const charmUrl = getSpriteUrl(charm.name, 'charm');
        contEl.innerHTML = charmUrl
          ? `<img src="${charmUrl}" width="32" height="32" style="object-fit:contain;image-rendering:pixelated" alt="" />`
          : `<i class="ti ti-hexagon" style="font-size:20px;color:${rc.color}"></i>`;
        subEl.style.borderColor = rc.color + '70';
        subEl.style.boxShadow   = `0 0 6px ${rc.color}30`;
        subEl.onmouseenter = () => showSlotTip(subEl, tipHtml, false);
        subEl.onmouseleave = hideSlotTip;
      } else {
        contEl.innerHTML = `<div class="slot-empty">Empty</div>`;
        subEl.style.borderColor = '';
        subEl.style.boxShadow   = '';
      }
    }
  });
}

function renderInventory() {
  ['helmet','amulet','chest','gloves','boots'].forEach(id => {
    const item   = save.equipped[id];
    const el     = document.getElementById(`slot-${id}-c`);
    const slotEl = document.getElementById(`slot-${id}`);
    if (item) {
      const rc  = item.rc || RC.Normal;
      const url = getSpriteUrl(item.name, id);
      const tipHtml = [
        `<div style="color:${rc.color};font-weight:600;margin-bottom:2px">${(item.name||'').split('\n')[0]}</div>`,
        `<div style="color:var(--text-tertiary);font-size:9px;margin-bottom:4px">${item.quality||'Normal'}</div>`,
        ...(item.props||[]).map(p => `<div>${p}</div>`)
      ].join('');
      el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:38px">
          ${url ? spriteImg(url, 40) : '<span style="opacity:0.2;font-size:20px">?</span>'}
        </div>`;
      slotEl.style.setProperty('--slot-rarity', rc.color);
      slotEl.classList.add('filled');
      slotEl.onmouseenter = () => showSlotTip(slotEl, tipHtml, false);
      slotEl.onmouseleave = hideSlotTip;
    } else {
      el.innerHTML = `<div class="slot-empty">Empty</div>`;
      slotEl.style.removeProperty('--slot-rarity');
      slotEl.classList.remove('filled');
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
    }
  });
  renderCharmSlots();
}

function resetLootPanel(score) {
  const slot3 = score >= 25;
  const slot4 = score >= 40;
  document.getElementById('loot-slot-1').className   = 'loot-slot';
  document.getElementById('loot-slot-1').innerHTML   = '<div class="loot-empty">Defeat a monster to claim loot</div>';
  document.getElementById('loot-slot-2').className   = 'loot-slot';
  document.getElementById('loot-slot-2').innerHTML   = '<div class="loot-empty" style="opacity:0.4"></div>';
  document.getElementById('loot-slot-3').className   = slot3 ? 'loot-slot' : 'loot-slot locked';
  document.getElementById('loot-slot-3').innerHTML   = slot3
    ? '<div class="loot-empty" style="opacity:0.4"></div>'
    : '<div class="loot-empty"><i class="ti ti-lock" style="font-size:12px;display:block;margin-bottom:3px"></i>Slot 3</div>';
  document.getElementById('loot-slot-4').className   = slot4 ? 'loot-slot' : 'loot-slot locked';
  document.getElementById('loot-slot-4').innerHTML   = slot4
    ? '<div class="loot-empty" style="opacity:0.4"></div>'
    : '<div class="loot-empty"><i class="ti ti-lock" style="font-size:12px;display:block;margin-bottom:3px"></i>Slot 4</div>';
}

function renderLootSlot(slotEl, item, idx) {
  if (!item) { slotEl.innerHTML = '<div class="loot-empty">No drop</div>'; return; }
  const rc        = item.rc || RC.Normal;
  const canEquip  = item.slot && ['helmet','amulet','chest','gloves','boots','charm'].includes(item.slot);
  const equipLabel = 'Equip';
  const already   = window._claimedLoot && window._claimedLoot[idx];
  const locked    = !!window._fightActive;
  const spriteUrl = getSpriteUrl(item.name, item.slot);
  slotEl.style.borderColor = rc.color + '70';
  slotEl.style.boxShadow   = `0 0 8px ${rc.color}30`;
  const tipHtml = [
    `<div style="color:${rc.color};font-weight:600;margin-bottom:2px">${(item.name||'').split('\n')[0]}</div>`,
    `<div style="color:var(--text-tertiary);font-size:9px;margin-bottom:4px">${item.quality||'Normal'}${item.slot ? ' · ' + item.slot : ''}</div>`,
    ...(item.props||[]).map(p => `<div>${p}</div>`)
  ].join('');
  slotEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:36px">
      ${spriteUrl
        ? `<img src="${spriteUrl}" width="36" height="36" style="object-fit:contain;image-rendering:pixelated;background:rgba(0,0,0,0.2);border-radius:4px;padding:2px;flex-shrink:0" alt="" />`
        : `<i class="ti ${item.icon||'ti-sword'}" style="font-size:18px;color:${rc.color};flex-shrink:0"></i>`}
    </div>
    ${canEquip
      ? (locked
          ? `<button class="loot-equip-btn" disabled style="opacity:0.35;cursor:not-allowed" title="Defeat the monster first"><i class="ti ti-lock" style="font-size:10px"></i></button>`
          : `<button class="loot-equip-btn${already?' claimed':''}" onclick="equipFromLoot(${idx})" ${already?'disabled':''}>${already?'<i class="ti ti-check"></i> Equipped':equipLabel}</button>`
        )
      : '<div style="font-size:9px;color:var(--text-tertiary);margin-top:3px;text-align:center">Cannot equip</div>'
    }`;
  slotEl.onmouseenter = () => showSlotTip(slotEl, tipHtml, true);
  slotEl.onmouseleave = hideSlotTip;
}

let _pendingEquipIdx = null;

function _itemColHtml(item, label) {
  if (!item) return `<div class="ecm-col-label">${label}</div><div class="ecm-empty">Empty slot</div>`;
  const rc = item.rc || RC.Normal;
  return `
    <div class="ecm-col-label">${label}</div>
    <div class="ecm-item-name" style="color:${rc.color}">${(item.name||'').split('\n')[0]}</div>
    <div class="ecm-item-meta">${item.quality||'Normal'}${item.slot?' · '+item.slot:''}</div>
    ${(item.props||[]).map(p=>`<div class="ecm-item-prop">${p}</div>`).join('')}`;
}

function equipFromLoot(idx) {
  const item = window._pendingDrops ? window._pendingDrops[idx] : null;
  if (!item || !item.slot) return;

  // Charm level check before showing modal
  if (item.slot === 'charm') {
    const { rank } = getHunterRank(save.playerXP);
    const slotIdx = item.charmSize === 'large' ? 1 : 0;
    if (slotIdx === 1 && rank.lvl < 10) { showToast('Reach level 10 to unlock the large charm slot!'); return; }
  }

  // Find current item in that slot for comparison
  let current = null;
  if (item.slot === 'charm') {
    const slotIdx = item.charmSize === 'large' ? 1 : 0;
    current = save.equipped.charms?.[slotIdx] || null;
  } else {
    current = save.equipped[item.slot] || null;
  }

  _pendingEquipIdx = idx;
  document.getElementById('ecmCurrent').innerHTML = _itemColHtml(current, 'Currently Equipped');
  document.getElementById('ecmNew').innerHTML     = _itemColHtml(item, 'New Drop');
  document.getElementById('equipCompareModal').style.display = 'flex';
}

function confirmEquip() {
  const idx  = _pendingEquipIdx;
  const item = window._pendingDrops ? window._pendingDrops[idx] : null;
  if (!item || !item.slot) { cancelEquip(); return; }
  if (item.slot === 'charm') {
    const slotIdx = item.charmSize === 'large' ? 1 : 0;
    if (!save.equipped.charms) save.equipped.charms = [null, null];
    save.equipped.charms[slotIdx] = item;
  } else {
    save.equipped[item.slot] = item;
  }
  if (!window._claimedLoot) window._claimedLoot = {};
  window._claimedLoot[idx] = true;
  writeSave();
  renderInventory();
  renderLootSlot(document.getElementById(`loot-slot-${idx+1}`), item, idx);
  showToast(`${(item.name||'').substring(0,20)} equipped!`);
  cancelEquip();
}

function cancelEquip() {
  _pendingEquipIdx = null;
  document.getElementById('equipCompareModal').style.display = 'none';
}

function show(id)  { document.getElementById(id).style.display = ''; }
function hide(id)  { document.getElementById(id).style.display = 'none'; }

function resetForm() {
  ['monsterPanel','errBox','loading'].forEach(hide);
  document.getElementById('urlInput').value = '';
  document.getElementById('urlInput').focus();
  resetLootPanel();
  fightState = null;
  // Clean up mobile fight modal state
  var mp = document.getElementById('monsterPanel');
  if (mp) {
    mp.classList.remove('mob-modal');
    // Return panel to screen-game if it was moved to body
    var sg = document.getElementById('screen-game');
    if (mp.parentElement !== sg) {
      var pf = document.getElementById('postFight');
      sg.insertBefore(mp, pf);
    }
  }
  var fbd = document.getElementById('mobFightBackdrop');
  if (fbd) fbd.classList.remove('active');
  var fd = document.getElementById('mobFightDismiss');
  if (fd) fd.style.display = 'none';
  // Return #lootPanel to .loot-col if it was in bottom-sheet mode
  var lp = document.getElementById('lootPanel');
  if (lp && lp.classList.contains('mob-modal')) {
    lp.classList.remove('mob-modal');
    lp.style.display = 'none';
    var lc = document.querySelector('.loot-col');
    if (lc) lc.appendChild(lp);
  }
}

function renderStarterSuggestions() {
  const el = document.getElementById('starterSuggestions');
  if (!el) return;
  const { rank } = getHunterRank(save.playerXP);
  const lvl = rank.lvl;
  const minScore = Math.max(1, lvl * 0.4 - 1);
  const maxScore = lvl * 0.5 + 24;
  const pool = STARTER_SITES.filter(s => s.score >= minScore && s.score <= maxScore);
  if (!pool.length) { el.innerHTML = ''; return; }
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;margin:6px 0 4px;gap:5px">
      <span style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.07em;white-space:nowrap">Suggested targets</span>
      <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center">
        ${picks.map(s => `<button onclick="document.getElementById('urlInput').value='${s.url}'" style="font-size:9px;padding:3px 8px;opacity:0.75">${s.url}</button>`).join('')}
      </div>
    </div>`;
}

function initScrollArrow() {
  const col  = document.getElementById('screen-game');
  const up   = document.getElementById('scrollUpBtn');
  const down = document.getElementById('scrollDownBtn');
  if (!col || !up || !down) return;
  const update = () => {
    const scrollable = col.scrollHeight > col.clientHeight + 4;
    const atTop      = col.scrollTop <= 4;
    const atBottom   = col.scrollTop + col.clientHeight >= col.scrollHeight - 4;
    up.classList.toggle('visible',   scrollable && !atTop);
    down.classList.toggle('visible', scrollable && !atBottom);
  };
  col.addEventListener('scroll', update);
  new MutationObserver(update).observe(col, { childList:true, subtree:true });
  update();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

function deleteSave() {
  document.getElementById('confirmDialog').style.display = 'flex';
}

function confirmDialogClose(confirmed) {
  document.getElementById('confirmDialog').style.display = 'none';
  if (!confirmed) return;
  localStorage.removeItem(SAVE_KEY);
  sbDeleteSave();
  save = { created:false, charName:'', classId:'', playerXP:0, bestiary:[], defeated:[], equipment:[], equipped:{ helmet:null, amulet:null, chest:null, gloves:null, boots:null, charms:[null,null] } };
  renderHome();
}

// Global slot tooltip (fixed position to escape overflow:auto clipping)
const _slotTip = (() => {
  const el = document.createElement('div');
  el.className = 'slot-tip';
  el.style.cssText = 'display:none;position:fixed;z-index:9999;pointer-events:none';
  document.body.appendChild(el);
  return el;
})();
function showSlotTip(anchorEl, html, alignLeft) {
  _slotTip.innerHTML = html;
  _slotTip.style.display = 'block';
  const r = anchorEl.getBoundingClientRect();
  _slotTip.style.top  = r.top + 'px';
  if (alignLeft) {
    _slotTip.style.left = '';
    _slotTip.style.right = (window.innerWidth - r.left + 7) + 'px';
  } else {
    _slotTip.style.right = '';
    _slotTip.style.left  = (r.right + 7) + 'px';
  }
}
function hideSlotTip() { _slotTip.style.display = 'none'; }

/* ── Auth UI ──────────────────────────────────────────────── */

let _authTab = 'login';

function authSwitchTab(tab) {
  _authTab = tab;
  const loginBtn    = document.getElementById('authTabLogin');
  const registerBtn = document.getElementById('authTabRegister');
  const submitBtn   = document.getElementById('authSubmitBtn');
  const gold = 'var(--gold)', dim = 'var(--text-tertiary)', none = 'transparent';
  loginBtn.style.borderBottomColor    = tab === 'login'    ? gold : none;
  loginBtn.style.color                = tab === 'login'    ? gold : dim;
  registerBtn.style.borderBottomColor = tab === 'register' ? gold : none;
  registerBtn.style.color             = tab === 'register' ? gold : dim;
  submitBtn.textContent = tab === 'login' ? 'Login' : 'Create Account';
  document.getElementById('authErr').style.display = 'none';
}

function authTogglePw() {
  const f = document.getElementById('authPassword');
  const b = document.getElementById('authEyeBtn');
  const show = f.type === 'password';
  f.type = show ? 'text' : 'password';
  b.innerHTML = show ? '<i class="ti ti-eye-off"></i>' : '<i class="ti ti-eye"></i>';
}

async function authSubmit() {
  const username = document.getElementById('authUsername').value.trim();
  const password = document.getElementById('authPassword').value;
  const errEl    = document.getElementById('authErr');
  const btnEl    = document.getElementById('authSubmitBtn');

  errEl.style.display = 'none';
  if (!username || !password) {
    errEl.textContent = 'Please fill in both fields.';
    errEl.style.display = '';
    return;
  }

  btnEl.disabled = true;
  btnEl.textContent = _authTab === 'login' ? 'Entering…' : 'Creating…';

  const fn    = _authTab === 'login' ? sbLogin : sbRegister;
  const error = await fn(username, password);

  btnEl.disabled = false;
  btnEl.textContent = _authTab === 'login' ? 'Login' : 'Create Account';

  if (error) {
    errEl.textContent = error.error || 'Something went wrong.';
    errEl.style.display = '';
    return;
  }

  await loadSave();
  showScreen('screen-home');
  renderHome();
}

async function signOut() {
  sbSignOut();
  save = { created:false, charName:'', classId:'', playerXP:0, bestiary:[], defeated:[], equipment:[], equipped:{ helmet:null, amulet:null, chest:null, gloves:null, boots:null, charms:[null,null] } };
  document.getElementById('invPanel').style.display  = 'none';
  document.getElementById('lootPanel').style.display = 'none';
  document.getElementById('authUsername').value      = '';
  document.getElementById('authPassword').value      = '';
  document.getElementById('authErr').style.display   = 'none';
  showScreen('screen-auth');
}

/* ── Boot ─────────────────────────────────────────────────── */

(async () => {
  const user = sbInit();
  if (!user) {
    showScreen('screen-auth');
    return;
  }
  await loadSave();
  showScreen('screen-home');
  renderHome();
})();

document.getElementById('urlInput').addEventListener('keydown', e => { if (e.key === 'Enter') summonMonster(); });
document.getElementById('authPassword').addEventListener('keydown', e => { if (e.key === 'Enter') authSubmit(); });

// Close leaderboard card when clicking outside
document.addEventListener('click', e => {
  if (!_lbOpen) return;
  const card = document.getElementById('leaderboardCard');
  const btn  = document.getElementById('lbToggleBtn');
  if (!card.contains(e.target) && !btn.contains(e.target)) {
    _lbOpen = false;
    card.style.display = 'none';
    btn.classList.remove('lb-open');
  }
});
