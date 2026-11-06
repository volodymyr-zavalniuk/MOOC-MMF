/* storage.js - the only file that touches browser storage.
   Backend is chosen automatically: localStorage -> cookie -> in-memory (progress lost on reload). */
(function (M) {
  "use strict";
  const mem = {};
  const backends = {
    localStorage: {
      get: k => localStorage.getItem(k),
      set: (k, v) => localStorage.setItem(k, v),
      remove: k => localStorage.removeItem(k)
    },
    cookie: {
      get(k) {
        const row = document.cookie.split("; ").find(r => r.startsWith(k + "="));
        return row ? decodeURIComponent(row.slice(k.length + 1)) : null;
      },
      set(k, v) {
        const e = encodeURIComponent(v);
        if (e.length > 3600) throw new Error("Progress is too large for a cookie");
        document.cookie = `${k}=${e}; Max-Age=31536000; Path=/; SameSite=Lax` + (location.protocol === "https:" ? "; Secure" : "");
      },
      remove: k => { document.cookie = `${k}=; Max-Age=0; Path=/`; }
    },
    memory: { get: k => (k in mem ? mem[k] : null), set: (k, v) => { mem[k] = v; }, remove: k => { delete mem[k]; } }
  };
  const works = b => { try { b.set("__mooc_test", "1"); const ok = b.get("__mooc_test") === "1"; b.remove("__mooc_test"); return ok; } catch (e) { return false; } };
  const name = ["localStorage", "cookie", "memory"].find(n => works(backends[n]));
  const backend = backends[name];

  M.Storage = {
    backend: name,
    persistent: name !== "memory",
    read(key) { try { const raw = backend.get(key); return raw ? JSON.parse(raw) : null; } catch (e) { console.warn("Could not read progress", e); return null; } },
    write(key, obj) { try { backend.set(key, JSON.stringify(obj)); return true; } catch (e) { console.warn("Could not save progress", e); return false; } },
    remove(key) { try { backend.remove(key); } catch (e) { /* ignore */ } }
  };
})(window.MOOC = window.MOOC || {});
