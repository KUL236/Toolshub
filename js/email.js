/* ToolHub 5D - EmailJS sender (REST API, no SDK or extra script needed). */
(function () {
  'use strict';
  var ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

  function cfg() { return window.EMAILJS_CONFIG || {}; }
  function filled(v) { return typeof v === 'string' && v.trim() !== '' && !/^YOUR_/i.test(v.trim()); }
  function isConfigured() { var c = cfg(); return filled(c.serviceId) && filled(c.templateId) && filled(c.publicKey); }

  // Resolves to { ok: true } or { ok: false, reason } - never throws.
  async function send(templateParams) {
    if (!isConfigured()) return { ok: false, reason: 'not-configured' };
    var c = cfg(), ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, 15000);
    try {
      var res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: c.serviceId.trim(),
          template_id: c.templateId.trim(),
          user_id: c.publicKey.trim(),
          template_params: templateParams
        }),
        signal: ctrl.signal
      });
      if (res.ok) return { ok: true };
      var detail = ''; try { detail = (await res.text()).slice(0, 200); } catch (e) {}
      console.warn('[ToolHub] EmailJS ' + res.status + ': ' + detail);
      return { ok: false, reason: 'http-' + res.status, detail: detail };
    } catch (e) {
      return { ok: false, reason: e && e.name === 'AbortError' ? 'timeout' : 'network' };
    } finally { clearTimeout(timer); }
  }

  window.ThEmail = { isConfigured: isConfigured, send: send };
})();
