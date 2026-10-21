import {resolve} from 'node:path';
import {defineConfig,loadEnv} from 'vite';
export default defineConfig(({mode})=>{
  const env=loadEnv(mode,process.cwd(),'VITE_');
  const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
  let secret=key.startsWith('sb_secret_');
  if(key.split('.').length===3){try{secret=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role!=='anon';}catch{secret=true;}}
  if(secret)throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY must be a public publishable/anon key. Never use secret/service_role keys in browser code.');
  return {build:{rollupOptions:{input:{home:resolve('index.html'),world:resolve('the-gioi/index.html'),vietnam:resolve('viet-nam/index.html')}}}};
});
