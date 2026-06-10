/* ═══════════════════════════════════════════════════════════
   AUTH  —  Supabase magic-link + cloud save
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://npkbnwwmuhyzlgbqtlgi.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa2Jud3dtdWh5emxnYnF0bGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDg5MzEsImV4cCI6MjA5NjYyNDkzMX0.vTHoWfzorr19a8PNEw35Hm-jtSmxdS3T9CeoqBshv_4';

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let _currentUser = null;

function sbUser() { return _currentUser; }

/* Resolve existing session (handles magic-link redirect hash automatically) */
async function sbInit() {
  const { data: { session } } = await _sb.auth.getSession();
  _currentUser = session?.user ?? null;
  _sb.auth.onAuthStateChange((_event, session) => {
    _currentUser = session?.user ?? null;
  });
  return _currentUser;
}

/* Send magic link — returns error or null */
async function sbSendMagicLink(email) {
  const { error } = await _sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  return error;
}

async function sbSignOut() {
  await _sb.auth.signOut();
  _currentUser = null;
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

/* Name uniqueness check — returns true if name is already taken by another user */
async function sbCheckNameTaken(name) {
  try {
    const { data, error } = await _sb
      .from('leaderboard')
      .select('user_id')
      .ilike('char_name', name)
      .limit(1);
    if (error || !data) return false;
    if (data.length === 0) return false;
    // Allow the current user's own name (e.g. re-creating after delete)
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
