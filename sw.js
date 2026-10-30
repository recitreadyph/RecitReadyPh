/* RecitReady offline mode. Version: 20261030174711 */
const CACHE = "rr-20261030174711";
const PRE = ["./", "codal-civil-procedure.html", "codal-constitution.html", "codal-corporation-code.html", "codal-criminal-law-1.html", "codal-criminal-law-2.html", "codal-criminal-procedure.html", "codal-evidence.html", "codal-obligations-and-contracts.html", "codal-partnership-agency-trusts.html", "codal-persons-and-family-relations.html", "codal-property.html", "codal-sales.html", "elements-criminal-law-2.html", "index.html", "maps-procedure-maps.html", "quizzes-civil-procedure-tf.html", "quizzes-sales-tf.html", "support.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const FONT_CACHE = "rr-fonts";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function timeout(ms){ return new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), ms)); }
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // web fonts: use the saved copy if there is one
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONT_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit))));
    return;
  }
  if (url.origin !== location.origin) return;
  // own pages: get the newest copy when online (save it), fall back to the saved copy when offline or slow
  e.respondWith(
    Promise.race([fetch(req), timeout(6000)]).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
