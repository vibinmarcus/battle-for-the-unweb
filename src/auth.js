/* ═══════════════════════════════════════════════════════════
   AUTH  —  username/password via /api/auth + cloud save
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://npkbnwwmuhyzlgbqtlgi.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa2Jud3dtdWh5emxnYnF0bGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDg5MzEsImV4cCI6MjA5NjYyNDkzMX0.vTHoWfzorr19a8PNEw35Hm-jtSmxdS3T9CeoqBshv_4';
const SESSION_KEY   = 'bftuw_auth';

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let _currentUser = null;

function sbUser() { return _currentUser; }

/* Load session from localStorage */
function sbInit() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) _currentUser = JSON.parse(raw);
  } catch(_) {}
  return _currentUser;
}

/* Register — returns { error } or null */
async function sbRegister(username, password) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Registration failed' };
    _currentUser = { id: data.id, username: data.username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(_currentUser));
    return null;
  } catch(_) {
    return { error: 'Network error. Try again.' };
  }
}

/* Login — returns { error } or null */
async function sbLogin(username, password) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Login failed' };
    _currentUser = { id: data.id, username: data.username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(_currentUser));
    return null;
  } catch(_) {
    return { error: 'Network error. Try again.' };
  }
}

function sbSignOut() {
  _currentUser = null;
  localStorage.removeItem(SESSION_KEY);
}

/* Cloud save read */
async function sbLoadSave() {
  if (!_currentUser) return null;
  try {
    const { data, error } = await _sb
      .from('saves')
      .select('save_json')
      .eq('user_id', _currentUser.id)
      .single();
    if (error || !data) return null;
    return data.save_json;
  } catch(_) { return null; }
}

/* Cloud save write (upsert) */
async function sbWriteSave(saveObj) {
  if (!_currentUser) return;
  try {
    await _sb.from('saves').upsert({
      user_id:    _currentUser.id,
      save_json:  saveObj,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch(_) {}
}

/* Leaderboard — write own row */
async function sbWriteLeaderboard(saveObj) {
  if (!_currentUser) return;
  const { rank } = typeof getHunterRank === 'function' ? getHunterRank(saveObj.playerXP) : { rank: { lvl: 0 } };
  try {
    await _sb.from('leaderboard').upsert({
      user_id:    _currentUser.id,
      char_name:  saveObj.charName  || 'Unknown',
      char_class: saveObj.classId   || '',
      level:      rank.lvl          || 0,
      xp:         saveObj.playerXP  || 0,
      kills:      (saveObj.defeated || []).length,
      best_score: saveObj.bestScore || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch(_) {}
}

/* Leaderboard — fetch top 20 */
async function sbFetchLeaderboard() {
  try {
    const { data, error } = await _sb
      .from('leaderboard')
      .select('user_id,char_name,char_class,level,kills,best_score')
      .order('level', { ascending: false })
      .order('kills', { ascending: false })
      .limit(20);
    if (error || !data) return [];
    return data;
  } catch(_) { return []; }
}

/* Monster score cache — read */
async function sbGetMonster(domain) {
  try {
    const { data, error } = await _sb
      .from('monsters')
      .select('parsed')
      .eq('domain', domain)
      .single();
    if (error || !data) return null;
    return data.parsed;
  } catch(_) { return null; }
}

/* Monster score cache — write (upsert) */
async function sbSetMonster(domain, parsed) {
  try {
    await _sb.from('monsters').upsert({
      domain,
      parsed,
      updated_at: new Date().toISOString()
    }, { onConflict: 'domain' });
  } catch(_) {}
}

/* Name uniqueness check */
async function sbCheckNameTaken(name) {
  try {
    const { data, error } = await _sb
      .from('leaderboard')
      .select('user_id')
      .ilike('char_name', name)
      .limit(1);
    if (error || !data) return false;
    if (data.length === 0) return false;
    return data[0].user_id !== (_currentUser?.id ?? null);
  } catch(_) { return false; }
}

/* Cloud save delete */
async function sbDeleteSave() {
  if (!_currentUser) return;
  try {
    await _sb.from('saves').delete().eq('user_id', _currentUser.id);
  } catch(_) {}
}
