/**
 * Oferty PV – synchronizacja z Dyskiem Google
 * Smart Energy Marcin Błądek
 *
 * 1. Wpisz poniżej własne hasło (to samo wpiszesz potem w aplikacji na każdym urządzeniu).
 * 2. Wdróż jako aplikację internetową: Wykonaj jako „Ja”, Dostęp „Każdy”.
 * Szczegóły: INSTRUKCJA-SYNCHRONIZACJA.md w repozytorium.
 */
const HASLO = 'WPISZ-SWOJE-HASLO';
const FOLDER = 'Oferty PV';

function doGet() {
  return out({ ok: true, info: 'Oferty PV – skrypt synchronizacji działa. Adres wklej w aplikacji.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'Nieprawidłowe dane' }); }
  if (!HASLO || HASLO === 'WPISZ-SWOJE-HASLO') return out({ ok: false, error: 'Ustaw hasło w skrypcie (stała HASLO) i wdróż nową wersję' });
  if (req.haslo !== HASLO) return out({ ok: false, error: 'Nieprawidłowe hasło' });
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const res = handle(req);
    return out(Object.assign({ ok: true }, res));
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function root() {
  const it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}
function sub(name) {
  const r = root();
  const it = r.getFoldersByName(name);
  return it.hasNext() ? it.next() : r.createFolder(name);
}
function findFile(folder, name) {
  const it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}
function writeJson(folder, name, obj) {
  const txt = JSON.stringify(obj);
  const ex = findFile(folder, name);
  if (ex) ex.setContent(txt); else folder.createFile(name, txt, 'application/json');
}
function readJson(file) {
  try { return JSON.parse(file.getBlob().getDataAsString('UTF-8')); } catch (e) { return null; }
}
function findKarta(id) {
  const it = sub('karty').getFiles();
  while (it.hasNext()) {
    const f = it.next();
    try { const m = JSON.parse(f.getDescription() || '{}'); if (m.id === id) return { file: f, meta: m }; } catch (e) {}
  }
  return null;
}

function readTomb(name) {
  const f = findFile(sub('dane'), name);
  return (f && readJson(f)) || {};
}
function addTomb(name, id) {
  const t = readTomb(name);
  t[id] = Date.now();
  writeJson(sub('dane'), name, t);
}

function handle(r) {
  switch (r.akcja) {
    case 'ping':
      return { folder: root().getUrl() };

    case 'lista': {
      const dane = sub('dane');
      const oferty = [];
      const it = dane.getFiles();
      let firma = null;
      while (it.hasNext()) {
        const f = it.next();
        const n = f.getName();
        if (!/\.json$/.test(n) || f.isTrashed()) continue;
        const o = readJson(f);
        if (!o) continue;
        if (n === '_firma.json') firma = o;
        else if (n.charAt(0) !== '_') oferty.push(o);
      }
      const karty = [];
      const ik = sub('karty').getFiles();
      while (ik.hasNext()) {
        const f = ik.next();
        if (f.isTrashed()) continue;
        try { const m = JSON.parse(f.getDescription() || '{}'); if (m.id) karty.push(m); } catch (e) {}
      }
      return { oferty: oferty, firma: firma, karty: karty, usuniete: readTomb('_usuniete.json'), usunieteKarty: readTomb('_usuniete_karty.json') };
    }

    case 'zapiszOferte':
      if (!r.oferta || !r.oferta.id) throw new Error('Brak oferty');
      writeJson(sub('dane'), r.oferta.id + '.json', r.oferta);
      return {};

    case 'usunOferte': {
      const f = findFile(sub('dane'), r.id + '.json');
      if (f) f.setTrashed(true); // trafia do kosza Dysku, można przywrócić
      addTomb('_usuniete.json', r.id);
      return {};
    }

    case 'zapiszFirme':
      writeJson(sub('dane'), '_firma.json', r.firma);
      return {};

    case 'zapiszKarte': {
      const k = r.karta;
      const old = findKarta(k.id);
      if (old) old.file.setTrashed(true);
      const meta = { id: k.id, name: k.name, label: k.label, kat: k.kat, type: k.type, size: k.size, zmieniono: k.zmieniono };
      const bytes = Utilities.base64Decode(String(k.data).split(',').pop());
      const file = sub('karty').createFile(Utilities.newBlob(bytes, k.type, k.name));
      file.setDescription(JSON.stringify(meta));
      return {};
    }

    case 'metaKarty': {
      const f = findKarta(r.meta.id);
      if (!f) return { brak: true };
      f.file.setDescription(JSON.stringify(Object.assign(f.meta, r.meta)));
      return {};
    }

    case 'pobierzKarte': {
      const f = findKarta(r.id);
      if (!f) throw new Error('Nie ma takiej karty na Dysku');
      const b = f.file.getBlob();
      return { karta: Object.assign({}, f.meta, { data: 'data:' + f.meta.type + ';base64,' + Utilities.base64Encode(b.getBytes()) }) };
    }

    case 'usunKarte': {
      const f = findKarta(r.id);
      if (f) f.file.setTrashed(true);
      addTomb('_usuniete_karty.json', r.id);
      return {};
    }

    case 'zapiszPdf': {
      const folder = sub('PDF');
      const ex = findFile(folder, r.nazwa);
      if (ex) ex.setTrashed(true);
      const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(r.data), 'application/pdf', r.nazwa));
      return { url: file.getUrl() };
    }
  }
  throw new Error('Nieznana akcja: ' + r.akcja);
}
