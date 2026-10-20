import { createClient } from '@supabase/supabase-js';
const rawUrl=import.meta.env.VITE_SUPABASE_URL || '';
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
let origin='';
try { const url=new URL(rawUrl); if(url.protocol==='https:'&&url.hostname.endsWith('.supabase.co')&&!url.username&&!url.password)origin=url.origin; } catch {}
// Browser code must receive only a publishable/legacy anon key, never secret/service_role.
let safeKey=key.startsWith('sb_publishable_');
if(key.split('.').length===3) { try { safeKey=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon'; } catch {} }
export const cloudConfigured=Boolean(origin&&safeKey);
export const cloudClient=cloudConfigured?createClient(origin,key):null;
export function trustedPhoto(url) {
  if(!cloudConfigured||typeof url!=='string')return false;
  try { const parsed=new URL(url);return parsed.origin===origin&&/^\/storage\/v1\/object\/public\/journal-photos\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/.test(parsed.pathname)&&!parsed.search&&!parsed.hash; } catch { return false; }
}
