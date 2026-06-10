let fightState = null;

function _allEquippedItems() {
  const eq = save.equipped || {};
  const gear = Object.entries(eq)
    .filter(([k]) => k !== 'charms')
    .map(([, v]) => v)
    .filter(Boolean);
  const charms = (eq.charms || []).filter(Boolean);
  return [...gear, ...charms];
}

function calcEquipmentBonuses() {
  let atkBonus = 0, defBonus = 0, hpBonus = 0, atkPct = 0;
  for (const item of _allEquippedItems()) {
    if (!item.props) continue;
    for (const prop of item.props) {
      const s   = prop.toLowerCase();
      const num = parseInt((prop.match(/\d+/) || ['0'])[0]);
      if (s.includes('atk rating'))                              atkBonus += Math.round(num * 0.3);
      if (s.includes('defense') && !s.includes('deadly'))       defBonus += num;
      if (s.includes('strength'))                                { atkBonus += Math.round(num * 0.2); defBonus += Math.round(num * 0.1); }
      if (s.includes('life') && !s.includes('stolen') && !s.includes('mana') && !s.includes('per level')) hpBonus += num;
      if (s.includes('enh') && (s.includes('dmg') || s.includes('damage'))) atkPct += num;
      if (s.includes('max dmg'))                                 atkBonus += num;
      if (s.includes('all skills'))                              atkBonus += num * 2;
      if (s.includes('deadly strike'))                           atkBonus += Math.round(num * 0.2);
      if (s.includes('resist'))                                  defBonus += Math.round(num * 0.15);
      if (s.includes('to str') || s.includes('to strength'))    { atkBonus += Math.round(num * 0.2); defBonus += Math.round(num * 0.1); }
      const dmgM = prop.match(/Dmg:\s*(\d+)-(\d+)/i);
      if (dmgM) atkBonus += Math.round((+dmgM[1] + +dmgM[2]) / 2 * 0.3);
      const defM = prop.match(/Def:\s*(\d+)-(\d+)/i);
      if (defM) defBonus += Math.round((+defM[1] + +defM[2]) / 2 * 0.3);
    }
  }
  return { atkBonus, defBonus, hpBonus, atkPct };
}

function calcGoldBonuses() {
  let goldPct = 0, goldFlat = 0, goldDouble = 0, goldPerRound = 0, goldElite = 0;
  for (const charm of (save.equipped?.charms || []).filter(Boolean)) {
    for (const prop of (charm.props || [])) {
      const s   = prop.toLowerCase();
      const num = parseFloat((prop.match(/[\d.]+/) || ['0'])[0]);
      if (s.includes('% gold find'))             goldPct       += num;
      if (s.includes('gold find') && !s.includes('%')) goldFlat += num;
      if (s.includes('double gold'))             goldDouble    += num;
      if (s.includes('gold per round'))          goldPerRound  += num;
      if (s.includes('gold from elite'))         goldElite     += num;
    }
  }
  return { goldPct, goldFlat, goldDouble, goldPerRound, goldElite };
}

function rollBaseGold(score, lvl) {
  // 4 tiers: T1 lvl 1-19, T2 lvl 20-29, T3 lvl 30-39, T4 lvl 40+
  const ranges = [[1, 30], [10, 80], [30, 150], [80, 300]];
  const t = lvl < 20 ? 0 : lvl < 30 ? 1 : lvl < 40 ? 2 : 3;
  const [mn, mx] = ranges[t];
  const base = mn + Math.floor(Math.random() * (mx - mn + 1));
  // scale by monster difficulty (50–100% of base at score 0–50)
  return Math.round(base * (0.5 + (Math.min(score, 50) / 50) * 0.5));
}

function initFight(entry) {
  const tier  = getTier(entry.score);
  const cls   = getClassById(save.classId) || CLASSES[0];
  const { rank } = getHunterRank(save.playerXP);
  const eq    = calcEquipmentBonuses();

  const playerMaxHP  = 100 + rank.lvl * 5 + eq.hpBonus;
  const baseATK      = Math.round(10 + rank.lvl * 2 + cls.atkBonus + (entry.htmlDepth||50) * 0.1 + eq.atkBonus);
  const playerATK    = Math.round(baseATK * (1 + eq.atkPct / 100));
  const playerDEF    = Math.round(5  + rank.lvl     + cls.defBonus + (entry.cssComplexity||50) * 0.05 + eq.defBonus);
  const monsterMaxHP = Math.round((50 + entry.score * 3) * 0.7);
  const monsterATK   = Math.round((5  + entry.score * 0.8  + (entry.jsWeight||50) * 0.15) * 0.7);
  const monsterDEF   = Math.round((2  + entry.score * 0.3  + (entry.contentDensity||50) * 0.05) * 0.7);

  fightState = { entry, tier, cls, playerHP:playerMaxHP, playerMaxHP, playerATK, playerDEF, monsterHP:monsterMaxHP, monsterMaxHP, monsterATK, monsterDEF, round:0, over:false, won:false };

  document.getElementById('combatLog').innerHTML   = '';
  document.getElementById('playerHPLabel').textContent  = save.charName || 'You';
  document.getElementById('monsterHPLabel').textContent = entry.siteTitle || 'Monster';
  updateFightBars();
  document.getElementById('statATK').textContent  = playerATK;
  document.getElementById('statDEF').textContent  = playerDEF;
  document.getElementById('statMATK').textContent = monsterATK;

  const btn = document.getElementById('fightBtn');
  btn.disabled  = false;
  btn.innerHTML = '<i class="ti ti-sword"></i> Fight!';
  logCombat(`The battle begins! ${entry.monsterName} emerges from the Unweb.`);

  const eqBonusParts = [];
  if (eq.atkBonus > 0 || eq.atkPct > 0) eqBonusParts.push(`+${playerATK - Math.round(10 + rank.lvl * 2 + cls.atkBonus + (entry.htmlDepth||50) * 0.1)} ATK from gear`);
  if (eq.defBonus > 0)                   eqBonusParts.push(`+${eq.defBonus} DEF from gear`);
  if (eq.hpBonus > 0)                    eqBonusParts.push(`+${eq.hpBonus} HP from gear`);
  if (eqBonusParts.length) logCombat(`Equipment: ${eqBonusParts.join(', ')}.`);
}

function updateFightBars() {
  if (!fightState) return;
  const { playerHP, playerMaxHP, monsterHP, monsterMaxHP } = fightState;
  document.getElementById('playerHPBar').style.width  = Math.max(0, Math.round((playerHP  / playerMaxHP)  * 100)) + '%';
  document.getElementById('monsterHPBar').style.width = Math.max(0, Math.round((monsterHP / monsterMaxHP) * 100)) + '%';
  document.getElementById('playerHPVal').textContent  = `${Math.max(0,Math.round(playerHP))}/${playerMaxHP}`;
  document.getElementById('monsterHPVal').textContent = `${Math.max(0,Math.round(monsterHP))}/${monsterMaxHP}`;
}

function logCombat(msg, cls='') {
  const log  = document.getElementById('combatLog');
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  log.appendChild(line);
  // Trim oldest lines until content fits within the box (handles wrapped lines)
  while (log.children.length > 1 && log.scrollHeight > log.clientHeight) {
    log.removeChild(log.firstChild);
  }
}

function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function doFightRound() {
  if (!fightState || fightState.over) return;
  fightState.round++;
  const f   = fightState;
  const cls = f.cls;

  // Ranger: free first-strike at 60% ATK before round 1
  if (f.round === 1 && cls.id === 'ranger') {
    const fsDmg = Math.max(1, Math.round(f.playerATK * 0.6));
    f.monsterHP -= fsDmg;
    logCombat(`First strike! You loose an arrow for ${fsDmg} damage before it can react!`, 'hit-monster');
    if (f.monsterHP <= 0) { f.over = true; f.won = true; updateFightBars(); endFight(true); return; }
  }

  // Player attack — Mage 20% crit at 1.75×
  if (Math.random() > 0.15) {
    let mult = 1, critMsg = '';
    if (cls.id === 'mage' && Math.random() < 0.20) { mult = 1.75; critMsg = ' (CRITICAL!)'; }
    const dmg = Math.max(1, Math.round((f.playerATK - f.monsterDEF * 0.5 + ri(-3,3)) * mult));
    f.monsterHP -= dmg;
    logCombat(`Round ${f.round}: You strike for ${dmg} damage!${critMsg}`, 'hit-monster');
  } else {
    logCombat(`Round ${f.round}: Your attack misses!`, 'miss');
  }

  if (f.monsterHP <= 0) { f.over = true; f.won = true; updateFightBars(); endFight(true); return; }

  // Paladin: regen 2 HP per round
  if (cls.id === 'paladin') {
    f.playerHP = Math.min(f.playerMaxHP, f.playerHP + 2);
    logCombat(`Your holy aura restores 2 HP. (${Math.round(f.playerHP)}/${f.playerMaxHP})`, 'miss');
  }

  // Monster attack — Rogue 25% dodge, Warrior 15% block
  if (Math.random() > 0.2) {
    if (cls.id === 'rogue' && Math.random() < 0.25) {
      logCombat(`${f.entry.siteTitle||'Monster'} attacks — you dodge it!`, 'miss');
    } else if (cls.id === 'warrior' && Math.random() < 0.15) {
      logCombat(`${f.entry.siteTitle||'Monster'} attacks — you block it!`, 'miss');
    } else {
      const dmg = Math.max(1, Math.round(f.monsterATK - f.playerDEF * 0.5 + ri(-2,2)));
      f.playerHP -= dmg;
      logCombat(`${f.entry.siteTitle||'Monster'} retaliates for ${dmg} damage!`, 'hit-player');
    }
  } else {
    logCombat(`${f.entry.siteTitle||'Monster'}'s attack is deflected!`, 'miss');
  }

  if (f.playerHP <= 0) { f.over = true; f.won = false; updateFightBars(); endFight(false); return; }
  updateFightBars();
}

function endFight(won) {
  const f       = fightState;
  const already = save.defeated.includes(f.entry.url);
  const btn     = document.getElementById('fightBtn');
  btn.disabled  = true;

  if (won) {
    btn.innerHTML = '<i class="ti ti-check"></i> Victory!';
    logCombat(`Victory! ${f.entry.monsterName} defeated in ${f.round} rounds!`, 'victory');
    const bEntry = save.bestiary.find(e => e.url === f.entry.url); if (bEntry) bEntry.outcome = 'victory';
    const xp        = calcXP(f.entry.score, f.tier);
    const baseXP    = already ? Math.round(xp.total * 0.1) : xp.total;
    const linkBonus = (!already && f.entry.linkedHunt) ? Math.round(baseXP * 0.15) : 0;
    const awarded   = baseXP + linkBonus;
    save.playerXP += awarded;
    if (!already) {
      save.defeated.push(f.entry.url);
      (window._pendingDrops || []).filter(Boolean).forEach(d => save.equipment.push(d));
    }
    // Track best monster score ever beaten
    if (!save.bestScore || f.entry.score > save.bestScore) save.bestScore = f.entry.score;
    // Unlock loot equip buttons now that the monster is defeated
    window._fightActive = false;
    if (!already && window._pendingDrops) {
      [0,1,2,3].forEach(i => {
        const el = document.getElementById(`loot-slot-${i+1}`);
        if (el && !el.classList.contains('locked')) renderLootSlot(el, window._pendingDrops[i], i);
      });
    }
    // ── Gold drop ────────────────────────────────────────────
    const { rank: gRank } = getHunterRank(save.playerXP);
    const gb  = calcGoldBonuses();
    let gold  = rollBaseGold(f.entry.score, gRank.lvl);
    const doubled = gb.goldDouble > 0 && Math.random() * 100 < gb.goldDouble;
    if (doubled) gold *= 2;
    if (f.entry.score >= 25 && gb.goldElite > 0) gold = Math.round(gold * (1 + gb.goldElite / 100));
    gold += Math.round(gb.goldPerRound * f.round);
    gold  = Math.min(Math.round(gold * (1 + gb.goldPct / 100)) + Math.round(gb.goldFlat), 500);
    if (!already) {
      save.gold = (save.gold || 0) + gold;
      logCombat(`+${gold}g dropped${doubled ? ' (doubled!)' : ''}.`, 'victory');
    }
    // ─────────────────────────────────────────────────────────
    writeSave();
    renderGold();
    if (window.innerWidth <= 640) {
      document.getElementById('mobFightDismiss').style.display = 'flex';
    }
    sbWriteLeaderboard(save);
    updateXpBar();
    renderBestiary();
    setTimeout(() => showToast(`+${awarded} XP${already?' (repeat)':''}${linkBonus ? ' +15% linked domain bonus!' : ''}${!already ? ` · +${gold}g${doubled?' (doubled!)':''}` : ''}${(window._pendingDrops||[]).some(Boolean)?' · loot dropped!':''}`), 300);
    document.getElementById('postFight').style.display = '';

    const metrics = [
      { label:'HTML Structure', value:f.entry.htmlDepth,      color:'#5a8fd0' },
      { label:'CSS Complexity', value:f.entry.cssComplexity,  color:'#4a9e6a' },
      { label:'JS Weight',      value:f.entry.jsWeight,       color:'#d85a30' },
      { label:'Content Density',value:f.entry.contentDensity, color:'#8a70d0' },
    ];
    document.getElementById('breakdown').innerHTML = metrics.map(m => `
      <div class="metric-card">
        <div style="font-size:10px;color:var(--text-tertiary);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.05em">${m.label}</div>
        <div style="font-size:18px;font-weight:700;color:${m.color}">${m.value}<span style="font-size:11px;font-weight:400;color:var(--text-tertiary)">/100</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${m.value}%;background:${m.color}"></div></div>
      </div>`).join('');

    const suggested = f.entry.suggestedLinks || [];
    document.getElementById('suggestedLinks').innerHTML = suggested.length ? `
      <div class="divider" style="margin:10px 0 8px">— linked domains —</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
        ${suggested.map(u => {
          const host = new URL(u).hostname.replace(/^www\./,'');
          return `<button data-hunt="${u.replace(/"/g,'&quot;')}" onclick="window._linkedHunt=true;document.getElementById('urlInput').value=this.dataset.hunt;summonMonster()" style="font-size:10px;padding:4px 10px">${host}</button>`;
        }).join('')}
      </div>` : '';

  } else {
    btn.innerHTML = '<i class="ti ti-x"></i> Defeated…';
    logCombat(`You have been slain by ${f.entry.monsterName} after ${f.round} rounds. No loot claimed.`, 'defeat');
    resetLootPanel();
    const bEntryD = save.bestiary.find(e => e.url === f.entry.url); if (bEntryD) bEntryD.outcome = 'defeat';
    writeSave();
    if (window.innerWidth <= 640) {
      document.getElementById('mobFightDismiss').style.display = 'flex';
    }
  }
}

function closeMobFight() {
  var panel = document.getElementById('monsterPanel');
  panel.classList.remove('mob-modal');
  // Return panel to its original position inside #screen-game
  var sg = document.getElementById('screen-game');
  var pf = document.getElementById('postFight');
  sg.insertBefore(panel, pf);
  document.getElementById('mobFightBackdrop').classList.remove('active');
  document.getElementById('mobFightDismiss').style.display = 'none';
  // Show loot as bottom-sheet on victory
  if (fightState && fightState.won) {
    var lootCol = document.querySelector('.loot-col');
    if (lootCol) {
      document.getElementById('lootPanel').style.display = ''; // ensure visible
      lootCol.classList.add('mob-modal');
      document.body.appendChild(lootCol); // escape stacking context
      document.getElementById('mobFightBackdrop').classList.add('active');
    }
  }
}
