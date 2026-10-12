/* ===== DATA LAYER (shared by index.html and admin.html) =====
   Leave SUPABASE_* empty = local demo mode (changes only visible in this browser).
   Fill both = production mode (changes visible to every visitor). */
const CONFIG = {
  SUPABASE_URL: 'https://bwftjthrwuwccvbrfhrs.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_ysWexM6HJ1sBD4ux4FDCiQ_w4tOWIe-',
  LOCAL_ADMIN_PASSWORD: 'change-me' // local demo mode only; NOT secure
};
const DEFAULTS = {
  brand: 'Adjei David',
  hero_kicker: 'Accra, Ghana',
  hero_title: 'Design that gets noticed. Marketing that gets results.',
  hero_sub: 'Graphic Designer, Video Editor and Digital Marketer helping brands look sharp and sell more.',
  about_title: 'Craft with a commercial purpose.',
  about_body: 'I am Adjei David Sekyere Marfo, a creative based in Accra. I design brand visuals, edit video that holds attention, and run digital campaigns that turn attention into customers. Every piece of work is built around one question: what will make the client more money?',
  skills: 'Brand identity, Social media graphics, Motion and video editing, Meta and TikTok campaigns, Content strategy',
  email: 'adjeidavid372@gmail.com',
  whatsapp_display: '0530179643',
  whatsapp_intl: '233530179643',
  instagram: '', tiktok: '', facebook: ''
};
const sb = (CONFIG.SUPABASE_URL && window.supabase)
  ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) : null;
const LS = k => JSON.parse(localStorage.getItem(k) || 'null');
const SV = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^(https?:|data:image\/|\/)/i.test(u || '') ? u : '';

const Store = {
  mode: sb ? 'supabase' : 'local',
  async content() {
    const c = { ...DEFAULTS };
    if (sb) { const { data } = await sb.from('content').select('*'); (data || []).forEach(r => c[r.key] = r.value); }
    else Object.assign(c, LS('content') || {});
    return c;
  },
  async setContent(obj) {
    if (sb) { const { error } = await sb.from('content').upsert(Object.entries(obj).map(([key, value]) => ({ key, value }))); if (error) throw error; }
    else SV('content', { ...(LS('content') || {}), ...obj });
  },
  async works() {
    if (sb) { const { data, error } = await sb.from('works').select('*').order('created_at', { ascending: false }); if (error) throw error; return data; }
    return LS('works') || [];
  },
  async saveWork(w) {
    if (sb) {
      const { id, ...rest } = w;
      const { error } = await (id ? sb.from('works').update(rest).eq('id', id) : sb.from('works').insert(rest));
      if (error) throw error;
    } else {
      const a = LS('works') || [];
      if (w.id) { const i = a.findIndex(x => x.id === w.id); a[i] = { ...a[i], ...w }; }
      else a.unshift({ ...w, id: String(Date.now()) });
      SV('works', a);
    }
  },
  async delWork(id) {
    if (sb) { const { error } = await sb.from('works').delete().eq('id', id); if (error) throw error; }
    else SV('works', (LS('works') || []).filter(x => x.id !== id));
  },
  async upload(file) {
    if (sb) {
      const p = Date.now() + '-' + file.name.replace(/[^\w.]/g, '_');
      const { error } = await sb.storage.from('media').upload(p, file); if (error) throw error;
      return sb.storage.from('media').getPublicUrl(p).data.publicUrl;
    }
    if (file.size > 1.5e6) throw new Error('Local mode: keep images under 1.5MB');
    return new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(file); });
  },
  async authed() { if (sb) return !!(await sb.auth.getSession()).data.session; return sessionStorage.getItem('adm') === '1'; },
  async login(email, pw) {
    if (sb) { const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) throw error; }
    else { if (pw !== CONFIG.LOCAL_ADMIN_PASSWORD) throw new Error('Wrong password'); sessionStorage.setItem('adm', '1'); }
  },
  async logout() { if (sb) await sb.auth.signOut(); sessionStorage.removeItem('adm'); }
};
