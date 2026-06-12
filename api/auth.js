import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'public' } }
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, username, password } = req.body || {};
  if (!action || !username || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const u = username.trim().toLowerCase();
  if (u.length < 3 || u.length > 24)
    return res.status(400).json({ error: 'Username must be 3–24 characters' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  if (action === 'register') {
    const { data: existing } = await sb
      .from('users')
      .select('id')
      .ilike('username', u)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await sb
      .from('users')
      .insert({ username: u, password_hash: hash })
      .select('id, username')
      .single();
    if (error) return res.status(500).json({ error: 'Registration failed' });
    return res.status(200).json({ id: data.id, username: data.username });
  }

  if (action === 'login') {
    const { data, error } = await sb
      .from('users')
      .select('id, username, password_hash')
      .ilike('username', u)
      .maybeSingle();
    if (error || !data) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, data.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    return res.status(200).json({ id: data.id, username: data.username });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
