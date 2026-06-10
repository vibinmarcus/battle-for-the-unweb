function renderBestiary() {
  const list = save.bestiary;
  if (!list.length) { hide('bestiary'); return; }
  show('bestiary');
  const victories = list.filter(e => e.outcome === 'victory').length;
  const defeats   = list.filter(e => e.outcome === 'defeat').length;
  document.getElementById('bestiaryCount').textContent =
    list.length + ' encountered · ' + victories + ' defeated · ' + defeats + ' lost';
  document.getElementById('bestiaryList').innerHTML = list.map(e => {
    const tier    = getTier(e.score);
    const outcome = e.outcome || 'pending';
    const outcomeIcon = outcome === 'victory'
      ? `<i class="ti ti-sword" style="font-size:10px;color:var(--green);margin-right:3px"></i>`
      : outcome === 'defeat'
      ? `<i class="ti ti-skull" style="font-size:10px;color:var(--text-danger);margin-right:3px"></i>`
      : `<i class="ti ti-hourglass" style="font-size:10px;color:var(--text-tertiary);margin-right:3px"></i>`;
    const outcomeColor = outcome === 'victory' ? 'var(--green)' : outcome === 'defeat' ? 'var(--text-danger)' : 'var(--text-tertiary)';
    const outcomeLabel = outcome === 'victory' ? 'Victory' : outcome === 'defeat' ? 'Lost' : 'In progress';
    return `<div class="bentry">
      <div style="flex-shrink:0">${tier.draw(28, true)}</div>
      <div class="bentry-info">
        <div class="bentry-name">${outcomeIcon}${e.monsterName}</div>
        <div class="bentry-url">${new URL(e.url).hostname}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
        <span class="pill" style="background:${e.bg};color:${e.color};border:0.5px solid ${e.color}40">LVL ${e.score}</span>
        <span style="font-size:10px;font-weight:600;color:${outcomeColor}">${outcomeLabel}</span>
      </div>
    </div>`;
  }).join('');
}

function copyMonster() {
  if (!fightState) return;
  const e    = fightState.entry;
  const tier = getTier(e.score);
  const xp   = calcXP(e.score, tier);
  const text = `LVL ${e.score} — ${e.monsterName}\n${e.url}\n${tier.suffix.toUpperCase()} CLASS · +${xp.total} XP\nThis creature ${e.flavor}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn  = event.target.closest('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="ti ti-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = orig, 2000);
  });
}
