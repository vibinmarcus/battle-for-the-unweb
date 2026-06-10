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
}

function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(_) {}
  sbWriteSave(save); // fire-and-forget
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

function renderHome() {
  const u = sbUser();
  const lbl = document.getElementById('authUserLabel');
  if (lbl && u) lbl.textContent = u.email;
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
    document.getElementById('spClass').textContent    = (cls ? cls.name : '') + ' · ' + rank.name;
    document.getElementById('spXP').textContent       = save.playerXP.toLocaleString();
    document.getElementById('spDefeated').textContent = save.defeated.length;
    document.getElementById('spItems').textContent    = save.equipment.length;
    document.getElementById('spDelete').style.display = '';
  } else {
    lb.classList.add('disabled');
    sp.style.display = 'none';
    document.getElementById('spDelete').style.display = 'none';
  }
}

function renderClassGrid() {
  document.getElementById('classGrid').innerHTML = CLASSES.map(c => `
    <div class="class-card" id="cc-${c.id}" onclick="selectClass('${c.id}')">
      <span class="cc-icon"><i class="ti ${c.icon}"></i></span>
      <div class="cc-name">${c.name}</div>
      <div class="cc-desc">${c.desc}</div>
    </div>
  `).join('');
}

let selectedClass = '';

function selectClass(id) {
  selectedClass = id;
  document.querySelectorAll('.class-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('cc-' + id).classList.add('selected');
}

function startAdventure() {
  const name   = document.getElementById('charNameInput').value.trim();
  const errEl  = document.getElementById('createErr');
  if (!name)          { errEl.textContent = 'Please enter a name.';   errEl.style.display = ''; return; }
  if (!selectedClass) { errEl.textContent = 'Please choose a class.'; errEl.style.display = ''; return; }
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
  document.getElementById('charClassEl').textContent = cls.name;
  const inv = document.getElementById('charAvatarInv');
  inv.textContent      = cls.avatar;
  inv.style.background = cls.bg;
  inv.style.color      = cls.color;
  document.getElementById('charNameInv').textContent  = save.charName;
  document.getElementById('charClassInv').textContent = cls.name;
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

function resetLootPanel() {
  document.getElementById('loot-slot-1').className   = 'loot-slot';
  document.getElementById('loot-slot-1').innerHTML   = '<div class="loot-empty">Defeat a monster to claim loot</div>';
  document.getElementById('loot-slot-2').className   = 'loot-slot';
  document.getElementById('loot-slot-2').innerHTML   = '<div class="loot-empty" style="opacity:0.4"></div>';
  document.getElementById('loot-slot-3').className   = 'loot-slot locked';
  document.getElementById('loot-slot-3').innerHTML   = '<div class="loot-empty"><i class="ti ti-lock" style="font-size:12px;display:block;margin-bottom:3px"></i>Slot 3</div>';
  document.getElementById('loot-slot-4').className   = 'loot-slot locked';
  document.getElementById('loot-slot-4').innerHTML   = '<div class="loot-empty"><i class="ti ti-lock" style="font-size:12px;display:block;margin-bottom:3px"></i>Slot 4</div>';
}

function renderLootSlot(slotEl, item, idx) {
  if (!item) { slotEl.innerHTML = '<div class="loot-empty">No drop</div>'; return; }
  const rc        = item.rc || RC.Normal;
  const canEquip  = item.slot && ['helmet','amulet','chest','gloves','boots','charm'].includes(item.slot);
  const equipLabel = 'Equip';
  const already   = window._claimedLoot && window._claimedLoot[idx];
  const spriteUrl = getSpriteUrl(item.name, item.slot);
  slotEl.style.borderColor = rc.color + '70';
  slotEl.style.boxShadow   = `0 0 8px ${rc.color}30`;
  const tipHtml = [
    `<div style="color:${rc.color};font-weight:600;margin-bottom:2px">${(item.name||'').split('\n')[0]}</div>`,
    `<div style="color:var(--text-tertiary);font-size:9px;margin-bottom:4px">${item.quality||'Normal'}${item.slot ? ' · ' + item.slot : ''}</div>`,
    ...(item.props||[]).map(p => `<div>${p}</div>`)
  ].join('');
  slotEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;min-height:36px">
      ${spriteUrl
        ? `<img src="${spriteUrl}" width="36" height="36" style="object-fit:contain;image-rendering:pixelated;background:rgba(0,0,0,0.2);border-radius:4px;padding:2px;flex-shrink:0" alt="" />`
        : `<i class="ti ${item.icon||'ti-sword'}" style="font-size:18px;color:${rc.color};flex-shrink:0"></i>`}
      <span class="pill" style="background:${rc.bg};color:${rc.color};font-size:9px;border:0.5px solid ${rc.color}40">${item.quality}</span>
    </div>
    ${canEquip
      ? `<button class="loot-equip-btn${already?' claimed':''}" onclick="equipFromLoot(${idx})" ${already?'disabled':''}>${already?'<i class="ti ti-check"></i> Equipped':equipLabel}</button>`
      : '<div style="font-size:9px;color:var(--text-tertiary);margin-top:3px;text-align:center">Cannot equip</div>'
    }`;
  slotEl.onmouseenter = () => showSlotTip(slotEl, tipHtml, true);
  slotEl.onmouseleave = hideSlotTip;
}

function equipFromLoot(idx) {
  const item = window._pendingDrops ? window._pendingDrops[idx] : null;
  if (!item || !item.slot) return;
  if (item.slot === 'charm') {
    const { rank } = getHunterRank(save.playerXP);
    const slotIdx = item.charmSize === 'large' ? 1 : 0;
    if (slotIdx === 1 && rank.lvl < 10) {
      showToast('Reach level 10 to unlock the large charm slot!');
      return;
    }
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
}

function show(id)  { document.getElementById(id).style.display = ''; }
function hide(id)  { document.getElementById(id).style.display = 'none'; }

function resetForm() {
  ['monsterPanel','errBox','loading'].forEach(hide);
  document.getElementById('urlInput').value = '';
  document.getElementById('urlInput').focus();
  resetLootPanel();
  fightState = null;
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
    <div style="position:relative;display:flex;align-items:center;justify-content:center;margin:6px 0 4px;min-height:24px">
      <span style="position:absolute;left:0;font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.07em;white-space:nowrap">Suggested targets</span>
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

async function authSendLink() {
  const email  = document.getElementById('authEmail').value.trim();
  const errEl  = document.getElementById('authErr');
  const btnEl  = document.getElementById('authSendBtn');
  if (!email) { errEl.textContent = 'Please enter your email.'; errEl.style.display = ''; return; }
  errEl.style.display = 'none';
  btnEl.disabled = true;
  btnEl.textContent = 'Sending…';
  const error = await sbSendMagicLink(email);
  if (error) {
    errEl.textContent = error.message || 'Failed to send link. Try again.';
    errEl.style.display = '';
    btnEl.disabled = false;
    btnEl.innerHTML = '<i class="ti ti-mail"></i> Send magic link';
  } else {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('authSent').style.display = '';
  }
}

async function signOut() {
  await sbSignOut();
  save = { created:false, charName:'', classId:'', playerXP:0, bestiary:[], defeated:[], equipment:[], equipped:{ helmet:null, amulet:null, chest:null, gloves:null, boots:null, charms:[null,null] } };
  document.getElementById('invPanel').style.display  = 'none';
  document.getElementById('lootPanel').style.display = 'none';
  document.getElementById('authForm').style.display  = '';
  document.getElementById('authSent').style.display  = 'none';
  document.getElementById('authEmail').value         = '';
  document.getElementById('authSendBtn').disabled    = false;
  document.getElementById('authSendBtn').innerHTML   = '<i class="ti ti-mail"></i> Send magic link';
  showScreen('screen-auth');
}

/* ── Boot ─────────────────────────────────────────────────── */

(async () => {
  const user = await sbInit();
  if (!user) {
    showScreen('screen-auth');
    return;
  }
  await loadSave();
  showScreen('screen-home');
  renderHome();
})();

document.getElementById('urlInput').addEventListener('keydown', e => { if (e.key === 'Enter') summonMonster(); });
document.getElementById('authEmail').addEventListener('keydown', e => { if (e.key === 'Enter') authSendLink(); });
