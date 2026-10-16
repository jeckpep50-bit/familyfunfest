/* Family Fun Fest 2026 · MODO DEMOSTRACIÓN
 * Backend simulado con nombres ficticios, guardado solo en este navegador.
 * index.html lo descarga únicamente cuando API_URL y GOOGLE_CLIENT_ID están vacíos. */
window.createFFFDemo = function (helpers) {
  'use strict';
  const { appError, tc, norm } = helpers;
  const KEY = 'fff-demo-v2';
  const L = { get(){ try { return JSON.parse(localStorage.getItem(KEY)); } catch(e){ return null; } }, set(v){ try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){} }, del(){ try { localStorage.removeItem(KEY); } catch(e){} } };
  const ME = { email:'familia.demo@gmail.com', name:'Familia Demo', picture:'', isAdmin:true };
  function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seed(){
    const r = rng(2026), pick = a => a[Math.floor(r() * a.length)];
    const SUR = ['ANDRADE','BENÍTEZ','CALERO','DÁVILA','ESPINOZA','FIGUEROA','GARCÉS','HIDALGO','IZURIETA','JARAMILLO','LARREA','MALDONADO','NARVÁEZ','OLMEDO','PAREDES','QUIROLA','ROSERO','SALAZAR','TAPIA','URRESTA','VALLEJO','YÉPEZ','ZAMBRANO','CORDERO','MONCAYO','TERÁN','PROAÑO','VILLACÍS'];
    const NAMES = [['VALENTINA','EMILIA','ISABELLA','CAMILA','RENATA','AMELIA','MARTINA','SOFÍA','LUCÍA','ANTONELLA','PAULA','JULIETA','DOMÉNICA','VICTORIA'],
                   ['MATEO','SANTIAGO','SEBASTIÁN','NICOLÁS','JOAQUÍN','TOMÁS','GAEL','BENJAMÍN','DAVID','ESTEBAN','ALEJANDRO','MARTÍN','SAMUEL','ANDRÉS']];
    const PARS = [[3,'A',19],[3,'B',19],[4,'A',20],[4,'B',20],[4,'C',20],[5,'A',19],[5,'B',19],[5,'C',17],[6,'A',23],[6,'B',26],[7,'A',21],[7,'B',21],[7,'C',22]];
    const students = [];
    // Pares de apellidos únicos y luego 16 grupos de hermanos (mismos dos apellidos en otro curso).
    const pairs = new Set(), given = () => { const NAM = NAMES[r() < .5 ? 0 : 1]; const a = pick(NAM); let b = pick(NAM); while (b === a) b = pick(NAM); return a + ' ' + b; };
    const plan = PARS.map(([g,p,n]) => { const list = []; while (list.length < n){ const sp = pick(SUR) + ' ' + pick(SUR); if (pairs.has(sp)) continue; pairs.add(sp); list.push(sp + ' ' + given()); } return { g, p, list }; });
    for (let k = 0; k < 16; k++){ const A = pick(plan), B = pick(plan); if (A === B) continue; const ia = Math.floor(r() * A.list.length), ib = Math.floor(r() * B.list.length);
      const sur = A.list[ia].split(' ').slice(0,2).join(' '); B.list[ib] = sur + ' ' + given(); }
    plan.forEach(({g,p,list}) => [...new Set(list)].sort((a,b) => a.localeCompare(b,'es')).forEach((nm,i) => students.push({ id:`${g}${p}-${String(i+1).padStart(2,'0')}`, g, p, n:nm, ced:'17' + String(Math.floor(r()*1e8)).padStart(8,'0') })));
    const families = autoFamilies(students);
    const fam = {}; families.forEach(f => f.ids.forEach(id => fam[id] = f));
    const regs = []; const used = new Set();
    for (let i = 0; i < 70; i++){
      const s = students[Math.floor(r() * students.length)]; if (used.has(s.id)) continue;
      const ids = fam[s.id] ? fam[s.id].ids.slice() : [s.id]; if (ids.some(id => used.has(id))) continue; ids.forEach(id => used.add(id));
      const total = Math.min(4, ids.length + 1 + Math.floor(r() * 3));
      regs.push(mkReg(ids, total, `familia${i + 1}@gmail.com`, students, new Date(Date.now() - (70 - i) * 3600e3 * 2)));
    }
    return { students, regs, families, open:true, deadline:'2026-10-21 13:00' };
  }
  function autoFamilies(students){
    const g = {}; students.forEach(s => { const t = norm(s.n).toUpperCase().split(/\s+/); if (t.length >= 3) (g[t[0] + ' ' + t[1]] = g[t[0] + ' ' + t[1]] || []).push(s.id); });
    return Object.keys(g).sort().filter(k => g[k].length > 1).map((k,i) => ({ id:'FAM-' + String(i+1).padStart(2,'0'), ids:g[k], status:'CONFIRMADA', origin:'AUTO · mismos dos apellidos', note:'' }));
  }
  function mkReg(ids, total, email, students, date){
    const st = ids.map(id => students.find(s => s.id === id));
    return { code:`FFF-${st[0].g}${st[0].p}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, date:(date || new Date()).toISOString(), email, account:email.split('@')[0],
      ids, names: st.map(s => s.n), courses: st.map(s => `${s.g}.º EGB ${s.p}`), total, companions: total - ids.length, status:'ACTIVO', mail: 'ENVIADO', note:'', sibs: ids.length > 1 ? 'NÓMINA' : '' };
  }
  let db = null;
  const load = () => { if (!db) db = L.get() || seed(); return db; };
  const save = () => L.set(db);
  const taken = () => { const m = {}; db.regs.forEach(r => { if (r.status === 'ACTIVO') r.ids.forEach(id => m[id] = r.code); }); return m; };
  const deadlineDate = s => s ? new Date(s.replace(' ', 'T') + ':00-05:00') : null;
  const event = () => { const d = deadlineDate(db.deadline); return { name:'Family Fun Fest 2026', open: db.open && !(d && new Date() >= d), manualOpen: db.open, closesAt: d ? d.toISOString() : '', maxTotal:4, minCompanions:0, maxPerAccount:1, contact:'coordinacion@colegio.edu.ec' }; };
  const pub = r => ({ code:r.code, ids:r.ids, date:r.date, students:r.names.map((n,i) => ({ name:n, course:r.courses[i] })), total:r.total, companions:r.companions });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function call(action, p){
    load(); await wait(action === 'register' ? 700 : 250);
    const t = taken();
    const fam = {}; db.families.filter(f => f.status === 'CONFIRMADA').forEach(f => f.ids.forEach(id => fam[id] = f));
    if (action === 'bootstrap') return { user: ME, event: event(), students: db.students.map(s => { const o = { id:s.id, g:s.g, p:s.p, n:s.n, r: !!t[s.id] || !!(fam[s.id] && fam[s.id].ids.some(id => t[id])) }; if (fam[s.id]) o.f = fam[s.id].id; return o; }), mine: db.regs.filter(r => r.status === 'ACTIVO' && r.email === ME.email).map(pub) };
    if (action === 'register'){
      if (!event().open) throw appError('CLOSED','El registro está cerrado.');
      if (db.regs.some(r => r.status === 'ACTIVO' && r.email === ME.email)) throw appError('LIMIT','Esta cuenta ya realizó su registro.');
      const ids = p.studentIds; if (!ids.length || ids.length > 4 || p.total < ids.length || p.total > 4) throw appError('VALIDATION','Datos no válidos.');
      const tk = ids.filter(id => t[id]); if (tk.length) throw appError('TAKEN','Ya existe un registro para: ' + tk.map(id => tc(db.students.find(s => s.id === id).n)).join(', ') + '.');
      const miss = [...new Set(ids.flatMap(id => fam[id] ? fam[id].ids : []))].filter(id => !ids.includes(id));
      if (miss.length) throw appError('FAMILY','Según la nómina del colegio, ' + miss.map(id => tc(db.students.find(s => s.id === id).n)).join(', ') + ' debe registrarse en este mismo registro porque es hermano o hermana.');
      const reg = mkReg(ids, p.total, ME.email, db.students); db.regs.push(reg); save();
      return { registration: pub(reg), emailStatus:'ENVIADO' };
    }
    if (action === 'admin.data') return { event: event(), config: { REGISTRO_ABIERTO: db.open ? 'SI' : 'NO', FECHA_CIERRE: db.deadline, ADMIN_EMAILS:[ME.email] },
      students: db.students.map(s => ({ id:s.id, g:s.g, p:s.p, n:s.n, ced:s.ced, code:t[s.id] || '' })), registrations: db.regs, families: db.families, mailQuota: 1500 };
    if (action === 'admin.config'){ if (typeof p.open === 'boolean') db.open = p.open; if (typeof p.deadline === 'string') db.deadline = p.deadline.replace('T',' '); save(); return { event: event() }; }
    if (action === 'admin.annul'){ if ((p.reason || '').trim().length < 3) throw appError('VALIDATION','Escribe el motivo de la anulación.'); const r = db.regs.find(x => x.code === p.code); r.status = 'ANULADO'; r.note = 'Anulado (demo): ' + p.reason; save(); return { code:p.code }; }
    if (action === 'admin.resend') return { sent: 0 };
    throw appError('BAD_REQUEST','Acción no reconocida.');
  }
  return { call, reset(){ L.del(); db = null; } };
};
