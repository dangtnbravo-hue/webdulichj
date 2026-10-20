import {test} from 'node:test';
import assert from 'node:assert/strict';
import config from '../vite.config.js';

test('build refuses Supabase secret and service_role keys in public VITE variables',()=>{
  const previous=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  try {
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY='sb_secret_test_fixture_not_a_real_key';
    assert.throws(()=>config({mode:'test'}),/Never use secret/);
    const body=Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url');
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY=`test.${body}.test`;
    assert.throws(()=>config({mode:'test'}),/Never use secret/);
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY='sb_publishable_test_fixture';
    assert.doesNotThrow(()=>config({mode:'test'}));
  } finally {
    if(previous===undefined)delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    else process.env.VITE_SUPABASE_PUBLISHABLE_KEY=previous;
  }
});
