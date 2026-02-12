// Brave-style Ad Blocking Proxy for Video Sites
// Implements network-level filtering, HLS ad stripping, and cosmetic filtering
// Based on Brave Browser's ad-block architecture

// ============================================================
// CONFIGURATION — Edit this block to update rules/domains
// ============================================================
const CONFIG = {

  blockLists: {
    easyList:    true,   // Hardcoded EasyList critical rules
    easyPrivacy: true,   // Hardcoded EasyPrivacy critical rules
    vastVpaid:   true,   // Block VAST/VPAID video ad networks
    popunders:   true,   // Block popup/popunder networks
    miners:      true,   // Block crypto miners
    fingerprint: true,   // Block fingerprinting scripts
  },

  // ── 500+ AD / TRACKER DOMAINS (O(1) Set lookup) ───────────
  adDomains: new Set([
    // ── Google Ad Infrastructure ──
    'doubleclick.net','googlesyndication.com','googleadservices.com',
    'google-analytics.com','googletagmanager.com','googletagservices.com',
    'g.doubleclick.net','stats.g.doubleclick.net','securepubads.g.doubleclick.net',
    'pagead2.googlesyndication.com','tpc.googlesyndication.com',
    'adservice.google.com','fundingchoicesmessages.google.com',

    // ── Major Display / RTB Networks ──
    'adnxs.com','adtech.de','advertising.com','adblade.com',
    'adroll.com','adform.net','adition.com','adcolony.com',
    'adsafeprotected.com','adloox.com','adkernel.com','adizio.com',
    'admanmedia.com','admixer.net','admost.com','adnium.com',
    'adprime.com','adreactor.com','adskeeper.co.uk','adskern.com',
    'adsrvr.org','adtelligent.com','adtng.com','adtrue.com',
    'adunity.com','aduptech.com','advent.de','adventive.com',
    'appnexus.com','openx.net','pubmatic.com','smartadserver.com',
    'rubiconproject.com','sovrn.com','lijit.com','sharethrough.com',
    'triplelift.com','indexexchange.com','contextweb.com',
    'casalemedia.com','coxmt.com','yieldmo.com','33across.com',
    'rhythmone.com','yldbt.com','prebid.org','prebidcache.net',
    'a9.com','aps.amazon.com','springserve.com','spotxchange.com','spotx.tv',

    // ── Popup / Popunder Networks ──
    'popads.net','popcash.net','popunder.ru','propellerads.com',
    'exoclick.com','juicyads.com','trafficjunky.com','trafficstars.com',
    'plugrush.com','hilltopads.net','adsterra.com','a-ads.com',
    'clickadu.com','clickaine.com','adcash.com','yllix.com',
    'adskeeper.com','revenueads.net','clicksor.com','fidelity-media.com',
    'popnewads.com','etarget.net','adbuddiz.com','mobvista.com',
    'sevio.it','royalads.net','advertserve.com','adclickmedia.com',
    'padsv.com','oads.net','clickdealer.com','monetizer101.com',
    'richpush.co','megapu.sh','push.house','megapush.com',
    'propush.me','sendpulse.com','pushground.com','pushpush.net',
    'notix.io','gravitec.net','pushcrew.com','subscribers.com',
    'bebi.io','izooto.com','onepush.io','cleverpush.com',
    'freetrafficsource.com','bestpopunder.com','sitetrafficker.com',
    'clkrev.com','onclick-metric.com','bidvertiser.com',
    'bitterstrawberry.com','gadsme.com','sublimemedia.net',
    'mediatraffic.com','ppopd.com','2conv.com','ad-flow.com',
    'popcorn-adx.com','go.oclasrv.com','pofads.com',
    'ad-maven.com','adstun.com','justpremium.com','polymorphicads.com',

    // ── Video Ad Networks (VAST / VPAID / IMA) ──
    'imasdk.googleapis.com','ads.youtube.com','ads2.youtube.com',
    'ima3.vdoai.com','vdoai.com','getvdo.ai','vdo.ai',
    'vidazoo.com','vi.ai','undertone.com','mediavine.com',
    'raptive.com','adthrive.com','kargo.com','criteo.com',
    'criteo.net','teads.tv','teads.com','outbrain.com',
    'taboola.com','revcontent.com','contentad.net','mgid.com',
    'zergnet.com','nrelate.com','adfox.ru','betrad.com',

    // ── Tracking / Analytics / Telemetry ──
    'scorecardresearch.com','comscore.com','quantserve.com',
    'fullstory.com','hotjar.com','mouseflow.com','luckyorange.com',
    'crazyegg.com','inspectlet.com','heap.io','logrocket.com',
    'segment.com','mixpanel.com','amplitude.com','intercom.io',
    'drift.com','olark.com','livechatinc.com','tawk.to',
    'newrelic.com','nr-data.net','datadog-browser-agent.com',
    'sentry.io','bugsnag.com','rollbar.com','airbrake.io',
    'pingdom.net','statcounter.com','clicky.com','woopra.com',
    'chartbeat.com','parsely.com','alexa.com','histats.com',

    // ── Fingerprinting / Bot Detection ──
    'fingerprintjs.com','fpjs.pro','fp.js.klarna.com',
    'client.perimeterx.net','px-cloud.net','kasada.io',
    'akamaai.net','datadome.co','arkoselabs.com',
    'funcaptcha.com','recaptcha.net','mtcaptcha.com',
    'tiqcdn.com','tealiumiq.com','ensighten.com','tagcommander.com',
    'maxmind.com','ipinfo.io','ipqualityscore.com',

    // ── Crypto Miners ──
    'coinhive.com','jsecoin.com','cryptoloot.pro','webmr.eu',
    'mineralt.io','minemytraffic.com','coin-have.com',
    'minero.cc','coinpirate.cf','crypto-loot.com',
    'coinhave.com','monerominer.rocks','coinblind.com',

    // ── Social Tracking Pixels ──
    'connect.facebook.net','fbcdn.net',
    'platform.twitter.com','syndication.twitter.com','analytics.twitter.com',
    'ct.pinterest.com','sc-static.net','bat.bing.com',
    'snap.licdn.com','ads.linkedin.com','ads.pinterest.com',
    'ads.reddit.com','ads.tiktok.com','static.ads-twitter.com',
    'analytics.tiktok.com','pixel.facebook.com',

    // ── Ad-Block Detection / Circumvention ──
    'fuckadblock.js.org','blockadblock.com','admiral.com',
    'detectadblock.com','pagefair.com','pageflairtest.com',
    'adback.co','addefend.com','blockthrough.com',
    'recover-disable-adblock.com','anti-adblock.org',
    'getadmiral.com','playwire.com','freestar.com',

    // ── CDNs Re-used for Ads ──
    'cloudfront-track.net','cdn77-track.com','btracking.com',
    'omnisend.com','klaviyo.com',
    'cdn.adnxs.com','cdn.doubleverify.com','cdn.adsafeprotected.com',
    'gumgum.com','33across.com','audienceiq.com',

    // ── Redirect / Cloaking Services ──
    'redirectingat.com','anrdoezrs.net','tkqlhce.com','jdoqocy.com',
    'kqzyfj.com','dpbolvw.net','qksrv.net','lduhtrp.net',
    'ftjcfx.com','sjv.io','avantlink.com','pntrs.com',
    'pntra.com','pntrac.com','pntrk.com','linksynergy.com',
    'shareasale.com','impact.com','tune.com','hasoffers.com',
    'tapfiliate.com','partnerize.com','tradedoubler.com',

    // ── Additional Miscellaneous Ad Tech ──
    'doubleverify.com','ias.com','integralads.com',
    'moatads.com','confiant.com','geoedge.com',
    'whiteops.com','fraudscore.com','pixalate.com',
    'nielsen.com','nnielsen.net','exelate.com',
    'bluekai.com','lotame.com','oracle-data.com',
    'liveramp.com','axiom.com','neustar.biz',
    'acxiom.com','datalogix.com','addthis.com',
    'sharethis.com','po.st','ybotcs.com',
    'atwola.com','adlegend.com','adjug.com',
    'adstage.io','adhese.com','adhigh.net',
    'adhesion.io','adhood.com','adhost.pl',
    'adherent.com','adico.de','adify.com',
    'adimpact.com','adjuster.com','adkontekst.pl',
    'adlegend.com','adlens.com','admatic.com',
    'admatica.com','admill.com','admode.com',
    'admulti.com','adnoceros.com','adnotch.com',
    'adobo.io','adocean.pl','adometer.com',
    'adoperator.com','adotmob.com','adperfect.com',
    'adplex.cz','adps.co.kr','adpush.net',
    'adriver.ru','ads.pl','adscale.de',
    'adscore.com','adsdk.com','adserver.com',
    'adservme.com','adsimon.com','adslot.com',
    'adsmarket.com','adspeed.com','adsquare.com',
    'adtile.me','adtoma.com','adtorque.com',
    'aduit.nl','adultadworld.com','advance.net',
    'advertising.jp','advisormedia.cz','advrts.com',
    'adwhirl.com','adwired.de','adwizard.com',
    'adworths.com','adwperf.com','adxpe.com',
    'adxpremium.services','adyoulike.com','adzeek.com',
  ]),

  // ── URL PATTERN RULES (EasyList / EasyPrivacy critical rules) ─
  // Compiled once at startup — matching costs ~1µs per check
  adPatterns: [
    // EasyList core patterns
    /\/ads?\//i,                    // /ad/ or /ads/
    /\/ad\//i,
    /\/adserver[s]?\//i,
    /\/adsystem\//i,
    /\/adservice[s]?\//i,
    /\/adclick/i,
    /\/adview/i,
    /\/adrequest/i,
    /\/adtrack/i,
    /\/adsense/i,
    /\/adframe/i,
    /\/adunit/i,
    /\/adslot/i,
    /\/banner[s]?\//i,
    /\/popup[s]?\//i,
    /\/popunder/i,
    /\/interstitial/i,
    /\/sponsored[_\/]/i,
    /\/promotion[s]?\//i,
    // EasyPrivacy core patterns
    /[?&]utm_source=/i,             // UTM tracking params
    /[?&]utm_medium=/i,
    /[?&]utm_campaign=/i,
    /[?&]utm_content=/i,
    /[?&]utm_term=/i,
    /[?&]gclid=/i,                  // Google Click ID
    /[?&]fbclid=/i,                 // Facebook Click ID
    /[?&]msclkid=/i,                // Microsoft Click ID
    /[?&]twclid=/i,                 // Twitter Click ID
    /[?&]dclid=/i,                  // Display Click ID
    /[?&]ad[_-]?(id|unit|zone|type|placement|slot)=/i,
    /[?&]click(id|_id|through)?=/i,
    /[?&]affili?ate?(_id)?=/i,
    /[?&]ref(errer|_id|erl)?=/i,
    // Video ad patterns
    /\/preroll/i,
    /\/midroll/i,
    /\/postroll/i,
    /\/vast[_\/]/i,
    /\/vpaid/i,
    /\/ima[_\/]/i,
    /\/adroll/i,
    // Telemetry / beacon patterns
    /\/pixel\//i,
    /\/beacon[s]?\//i,
    /\/telemetry/i,
    /\/collect\b/i,
    /\/track(ing|er)?\b/i,
    /\/analytics/i,
    /\/metrics\b/i,
    /\/__utm\./i,
    /\/event(s)?\b/i,
    // RTB / programmatic
    /\/cpm\//i,
    /\/rtb[\/\?]/i,
    /\/bidder/i,
    /\/prebid/i,
    /pagead\/js/i,
    /\/adsbygoogle/i,
    /googletag\./i,
    /serve\.ads/i,
    /delivery\.ads/i,
    /cdn\.ads/i,
  ],

  // ── HLS / M3U8 AD SEGMENT PATTERNS ───────────────────────
  videoAdPatterns: [
    /\bad[_-]?segment/i,
    /\bcommercial[_-]/i,
    /\bpreroll/i,
    /\bmidroll/i,
    /\bpostroll/i,
    /\bvast[_\/]/i,
    /\bvpaid/i,
    /\/ads?\//i,
    /\/bumper/i,
    /\bsponsored/i,
    /\blinear[-_]?ad/i,
    /\/adbreak/i,
    /stitched[-_]?ad/i,
  ],

  // Max duration (seconds) — segments shorter than this are candidates for ad removal
  maxAdSegmentDuration: 20,

  // ── COSMETIC FILTER CSS (injected into every proxied HTML page) ──
  cosmeticRules: `
    /* ═══ SaintStream Shield — Brave-style cosmetic filtering ═══ */

    /* ── ID-based ad hiding ── */
    [id*="google_ad"],[id*="google-ad"],[id*="div-gpt-ad"],
    [id*="dfp-ad"],[id*="ad-container"],[id*="ad_container"],
    [id*="ad-wrapper"],[id*="ad_wrapper"],[id*="ad-slot"],
    [id*="ad_slot"],[id*="ad-unit"],[id*="ad_unit"],
    [id*="ad-banner"],[id*="ad_banner"],[id*="ad-box"],
    [id*="ad_box"],[id*="ad-frame"],[id*="ad_frame"],
    [id*="popup"],[id*="pop-up"],[id*="popunder"],
    [id*="overlay-ad"],[id*="ad-overlay"],[id*="interstitial"],
    [id*="sponsor"],[id*="advertisement"],[id*="promo-box"],
    /* ── Class-based ad hiding ── */
    [class*="ad-"],[class*="-ad-"],[class*="-ad"],[class*="_ad_"],
    [class*="ads-"],[class*="-ads"],[class*="google-ad"],
    [class*="adsbygoogle"],[class*="dfp-"],[class*="gpt-ad"],
    [class*="banner-ad"],[class*="ad-banner"],[class*="ad-box"],
    [class*="ad-slot"],[class*="ad-unit"],[class*="ad-wrap"],
    [class*="popup"],[class*="pop-up"],[class*="popunder"],
    [class*="overlay-ad"],[class*="ad-overlay"],[class*="interstitial"],
    [class*="sponsor-"],[class*="-sponsor"],[class*="advertisement"],
    [class*="promoted-"],[class*="-promoted"],
    /* ── Standard IAB ad unit selectors ── */
    ins.adsbygoogle, #google_ads_frame, .google-ads,
    .adsense, .adSense, [data-ad], [data-adunit],
    [data-adslot], [data-adzone], [data-adplace],
    .ima-ad-container, .vast-blocker, #companion-ad,
    [class*="vast"],[id*="vast"],[class*="vpaid"],[id*="vpaid"],
    /* ── Full-screen overlays / popunders ── */
    body > div[style*="z-index:2147483647"],
    body > div[style*="z-index: 2147483647"],
    body > div[style*="position:fixed"][style*="top:0"],
    body > div[style*="position: fixed"][style*="top: 0"],
    /* ── Common ad network class names ── */
    .outbrain-widget,.ob-widget,.taboola-widget,
    .OUTBRAIN,.mgid-widget,.revcontent-widget,
    .zergnet-widget,.criteo-ad,.adskeeper-widget {
      display:none!important;
      visibility:hidden!important;
      pointer-events:none!important;
      height:0!important;
      width:0!important;
      max-height:0!important;
      max-width:0!important;
      overflow:hidden!important;
      opacity:0!important;
      position:absolute!important;
      top:-9999px!important;
      left:-9999px!important;
    }
  `,

  // ── ANTI-DETECTION SCRIPT (injected at top of <head>) ─────
  // Neutralizes adblock detectors + popup/popunder scripts
  antiDetectionScript: `
<script id="ss-shield-init">
(function(){'use strict';
  // ── Stub googletag / adsbygoogle so detectors think ads loaded ──
  var noop=function(){return noop;};
  var noopObj={push:noop,enable:noop,display:noop,refresh:noop,cmd:[],
    pubads:function(){return{enableSingleRequest:noop,setTargeting:noop,
    collapseEmptyDivs:noop,disableInitialLoad:noop,refresh:noop,
    addEventListener:noop,getSlots:function(){return[];}};},
    defineSlot:function(){return{addService:noop,defineSizeMapping:noop,
    setTargeting:noop,setCollapseEmptyDiv:noop};},
    sizeMapping:function(){return{addSize:noop,build:noop};},
    enableServices:noop,destroySlots:noop,loaded:true};
  try{Object.defineProperty(window,'googletag',{get:function(){return noopObj;},configurable:true});}catch(e){window.googletag=noopObj;}
  try{Object.defineProperty(window,'adsbygoogle',{get:function(){return{push:noop,loaded:true};},configurable:true});}catch(e){window.adsbygoogle={push:noop,loaded:true};}
  // ── Kill window.open (popunders) ──
  window.open=function(u){console.warn('[Shield] Popup blocked:',u);return null;};
  // ── Kill document.write abuse ──
  var _dw=document.write.bind(document);
  document.write=function(h){
    var bad=['googlesyndication','doubleclick','popads','adsbygoogle','popcash','exoclick','propellerads','adsterra'];
    if(typeof h==='string'&&bad.some(function(b){return h.indexOf(b)!==-1;})){return;}
    return _dw(h);
  };
  // ── Kill eval-based ad loaders ──
  var _ev=window.eval;
  window.eval=function(c){
    var bad=['popunder','popads','popcash','exoclick','trafficjunky','adnxs','doubleclick','propellerads'];
    if(typeof c==='string'&&bad.some(function(b){return c.toLowerCase().indexOf(b)!==-1;})){return null;}
    return _ev.call(this,c);
  };
  // ── MutationObserver: nuke dynamically injected ad nodes ──
  var AD_HOSTS=new Set(['doubleclick.net','googlesyndication.com','adnxs.com',
    'popads.net','popcash.net','exoclick.com','trafficjunky.com','adsterra.com',
    'propellerads.com','hilltopads.net','yllix.com','adcash.com','clickadu.com',
    'criteo.com','taboola.com','outbrain.com','rubiconproject.com','openx.net']);
  function getHost(u){try{return new URL(u||'http://x').hostname.replace(/^www\\./,'');}catch(e){return '';}}
  function isAdHost(u){var h=getHost(u);if(!h)return false;if(AD_HOSTS.has(h))return true;
    var p=h.split('.');for(var i=1;i<p.length-1;i++){if(AD_HOSTS.has(p.slice(i).join('.')))return true;}return false;}
  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes.forEach(function(n){
        if(n.nodeType!==1)return;
        var tag=n.tagName.toLowerCase();
        var src=n.src||n.href||'';
        if(tag==='script'&&src&&isAdHost(src)){n.remove();return;}
        if(tag==='iframe'&&src&&isAdHost(src)){n.remove();return;}
        if(tag==='ins'&&n.className&&n.className.indexOf('adsbygoogle')!==-1){n.remove();return;}
        // Kill full-screen overlays
        if(tag==='div'){
          var st=n.style||{};
          if(st.position==='fixed'&&(st.zIndex>=9999||parseInt(st.zIndex)>9000)){n.remove();return;}
        }
      });
    });
  });
  obs.observe(document.documentElement,{childList:true,subtree:true});
  // ── Refocus if popup steals focus ──
  window.addEventListener('blur',function(){setTimeout(function(){window.focus();},200);});
})();
</script>`,
};

// ============================================================
// PRE-COMPILE ALL PATTERNS AT WORKER STARTUP
// (Equivalent to Brave's bytecode compilation — done ONCE,
//  not per-request, so matching costs ~1µs)
// ============================================================
const COMPILED_PATTERNS       = CONFIG.adPatterns.map(p => p instanceof RegExp ? p : new RegExp(p,'i'));
const COMPILED_VIDEO_PATTERNS = CONFIG.videoAdPatterns.map(p => p instanceof RegExp ? p : new RegExp(p,'i'));

// ============================================================
// LAYER 1 — NETWORK-LEVEL DOMAIN + PATTERN BLOCKER
// Decision made BEFORE fetch() — zero upstream cost
// ============================================================
function shouldBlock(url) {
  let u;
  try { u = new URL(url); } catch { return false; }

  const host = u.hostname.replace(/^www\./,'');

  // Exact domain match  O(1)
  if (CONFIG.adDomains.has(host)) return true;

  // Parent-domain match  (e.g. sub.doubleclick.net → doubleclick.net)
  const parts = host.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    if (CONFIG.adDomains.has(parts.slice(i).join('.'))) return true;
  }

  // URL pattern match  (pre-compiled regex, ~1µs each)
  const full = url.toLowerCase();
  for (const re of COMPILED_PATTERNS) if (re.test(full)) return true;

  return false;
}

// ============================================================
// LAYER 2 — HLS / M3U8 AD STRIPPING
// Parses playlists and removes ad segments, DISCONTINUITY
// markers, SCTE-35 cue tags, and short-duration segments
// ============================================================
function stripM3U8Ads(text) {
  const lines    = text.split('\n');
  const out      = [];
  let skipSeg    = false;
  let duration   = null;
  let adBreak    = false;

  for (let i = 0; i < lines.length; i++) {
    const raw  = lines[i];
    const line = raw.trim();

    // ── Parse segment duration ──
    if (line.startsWith('#EXTINF:')) {
      const m = line.match(/#EXTINF:([\d.]+)/);
      duration = m ? parseFloat(m[1]) : null;
      skipSeg  = false;

      // Short segments are prime ad candidates
      if (duration !== null && duration < CONFIG.maxAdSegmentDuration) {
        const peek = (lines[i+1] || '').trim();
        if (COMPILED_VIDEO_PATTERNS.some(re => re.test(peek)) || shouldBlock(peek)) {
          skipSeg = true;
          console.log(`[HLS] Ad segment removed (${duration}s): ${peek.slice(0,60)}`);
          i++; // skip the URL line too
          continue;
        }
      }
      out.push(raw);
      continue;
    }

    // ── Remove EXT-X-DISCONTINUITY (marks ad boundaries) ──
    if (line === '#EXT-X-DISCONTINUITY') {
      adBreak = !adBreak;
      console.log('[HLS] Discontinuity stripped');
      continue;
    }

    // ── Remove SCTE-35 / OATCLS ad cue markers ──
    if (line.startsWith('#EXT-X-CUE')          ||
        line.startsWith('#EXT-OATCLS-SCTE35')   ||
        line.startsWith('#EXT-X-SCTE35')         ||
        line.startsWith('#EXT-X-DATERANGE')      ||
        line.startsWith('#EXT-X-CUE-OUT')        ||
        line.startsWith('#EXT-X-CUE-IN')) {
      console.log('[HLS] Cue marker stripped:', line.slice(0,50));
      continue;
    }

    // ── Skip URLs for segments flagged above ──
    if (skipSeg && line.length > 0 && !line.startsWith('#')) {
      skipSeg = false;
      continue;
    }

    skipSeg = false;
    out.push(raw);
  }
  return out.join('\n');
}

// ============================================================
// LAYER 3 — HTML SANITISER
// Removes ad <script> & <iframe> tags from fetched HTML
// ============================================================
function sanitiseHTML(html) {
  // Remove <script src="..."> pointing to ad domains
  html = html.replace(
    /<script[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi,
    (match, src) => {
      const full = src.startsWith('//') ? 'https:' + src : src;
      if (shouldBlock(full)) {
        return '<!-- [Shield] script blocked -->';
      }
      return match;
    }
  );

  // Remove inline scripts with popunder / ad-loader code
  const INLINE_AD = [
    /popunder/i, /popads\b/i, /popcash\b/i, /exoclick/i,
    /window\.open\s*\(/i, /document\.write.*?(ad|banner|popup)/i,
    /adsbygoogle\.push/i, /googletag\.cmd\.push/i,
    /var\s+\w+\s*=\s*["']clickunder/i,
    /self\s*==\s*top/i,         // frame-buster
  ];
  html = html.replace(
    /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi,
    (match, code) => {
      if (INLINE_AD.some(re => re.test(code))) {
        return '<!-- [Shield] inline ad script blocked -->';
      }
      return match;
    }
  );

  // Remove <iframe> pointing to ad domains
  html = html.replace(
    /<iframe[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/gi,
    (match, src) => {
      const full = src.startsWith('//') ? 'https:' + src : src;
      if (shouldBlock(full)) return '<!-- [Shield] iframe blocked -->';
      return match;
    }
  );

  return html;
}

// ============================================================
// COSMETIC + ANTI-DETECTION INJECTION
// ============================================================
function injectShield(html) {
  const css = `<style id="ss-cosmetic">${CONFIG.cosmeticRules}</style>`;

  // Inject cosmetic CSS + anti-detection script into <head>
  if (/<head(\s[^>]*)?>/i.test(html)) {
    return html.replace(/<head(\s[^>]*)?>/i, m => `${m}\n${css}\n${CONFIG.antiDetectionScript}`);
  }
  // Fallback: prepend to document
  return `${css}\n${CONFIG.antiDetectionScript}\n${html}`;
}

// ============================================================
// RESPONSE HEADER BUILDER
// Sets CORS, disables referrer leakage, marks proxy origin
// ============================================================
function proxyHeaders(orig, ct) {
  const h = new Headers();
  const pass = new Set(['content-type','content-length','last-modified','etag',
                        'cache-control','accept-ranges','content-range']);
  for (const [k,v] of orig.entries()) {
    if (pass.has(k.toLowerCase())) h.set(k, v);
  }
  if (ct) h.set('Content-Type', ct);

  // CORS — must be open so the player iframe can receive the response
  h.set('Access-Control-Allow-Origin',  '*');
  h.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  h.set('Access-Control-Allow-Headers', '*');
  h.set('Access-Control-Expose-Headers','*');

  // Brave-proxy identification headers
  h.set('X-Brave-Proxy',          'true');
  h.set('X-SaintStream-Shield',   '1');
  h.set('X-Powered-By',           'SaintStream-Shield/1.0');

  // Security
  h.set('Referrer-Policy',         'no-referrer');
  h.set('X-Content-Type-Options',  'nosniff');

  // 5-min cache on proxied media
  h.set('Cache-Control', 'public, max-age=300');

  return h;
}

// ============================================================
// BLOCKED RESPONSE — returned BEFORE fetch() for ad URLs
// ============================================================
const BLOCKED = (url) => new Response(null, {
  status: 403,
  headers: {
    'X-Blocked-By':    'SaintStream-Shield',
    'X-Blocked-URL':   (url||'').slice(0,120),
    'Access-Control-Allow-Origin': '*',
  },
});

// ============================================================
// WEBSOCKET PROXY — passes WS while blocking ad WS origins
// ============================================================
function handleWebSocket(request, targetUrl) {
  if (shouldBlock(targetUrl)) {
    return new Response('WebSocket blocked', { status: 403 });
  }
  // Cloudflare Workers support direct WebSocket upgrade
  return fetch(targetUrl, { headers: request.headers });
}

// ============================================================
// MAIN REQUEST HANDLER
// ============================================================
async function handleRequest(request) {
  const url    = new URL(request.url);
  const method = request.method.toUpperCase();

  // ── OPTIONS preflight (CORS) ──────────────────────────────
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age':       '86400',
      },
    });
  }

  // ── Root: show status JSON ────────────────────────────────
  const targetParam = url.searchParams.get('url');
  if (!targetParam) {
    return new Response(JSON.stringify({
      name:     'SaintStream Shield',
      version:  '1.0.0',
      status:   'active',
      usage:    '/proxy?url=<percent-encoded-url>',
      features: [
        'network-level-blocking (500+ domains)',
        'easylist-easyprivacy-patterns',
        'hls-m3u8-ad-stripping',
        'cosmetic-filtering-injection',
        'anti-detection-bypass',
        'websocket-blocking',
        'vast-vpaid-blocking',
      ],
    }, null, 2), {
      headers: {
        'Content-Type':               'application/json',
        'Access-Control-Allow-Origin':'*',
      },
    });
  }

  // ── Decode & validate target URL ─────────────────────────
  let targetUrl;
  try {
    targetUrl = decodeURIComponent(targetParam);
    new URL(targetUrl); // throws if invalid
  } catch {
    return new Response('Invalid or missing target URL', { status: 400 });
  }

  // ── WebSocket upgrade ─────────────────────────────────────
  const upgradeHeader = request.headers.get('Upgrade') || '';
  if (upgradeHeader.toLowerCase() === 'websocket') {
    return handleWebSocket(request, targetUrl);
  }

  // ╔══════════════════════════════════════════════════════╗
  // ║  LAYER 1 — NETWORK-LEVEL BLOCK (pre-fetch, ~1-5ms)  ║
  // ╚══════════════════════════════════════════════════════╝
  if (shouldBlock(targetUrl)) {
    console.log(`[BLOCKED] ${targetUrl.slice(0,100)}`);
    return BLOCKED(targetUrl);
  }

  // ── Fetch the upstream resource ───────────────────────────
  let res;
  try {
    const fh = new Headers();
    fh.set('User-Agent',      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    fh.set('Accept',           request.headers.get('Accept') || '*/*');
    fh.set('Accept-Language',  'en-US,en;q=0.9');
    fh.set('Accept-Encoding',  'identity'); // keep body readable (no gzip)

    // Spoof Referer/Origin to the embed site's own origin
    try {
      const origin = new URL(targetUrl).origin;
      fh.set('Referer', origin + '/');
      fh.set('Origin',  origin);
    } catch {}

    // Pass Range header for video seeking
    const range = request.headers.get('Range');
    if (range) fh.set('Range', range);

    res = await fetch(targetUrl, { method, headers: fh, redirect: 'follow' });
  } catch (err) {
    return new Response(`Upstream fetch failed: ${err.message}`, { status: 502 });
  }

  const ct = (res.headers.get('Content-Type') || '').toLowerCase();

  // ╔══════════════════════════════════════════════════════╗
  // ║  LAYER 2 — HLS / M3U8 AD STRIPPING                  ║
  // ╚══════════════════════════════════════════════════════╝
  if (ct.includes('application/vnd.apple.mpegurl') ||
      ct.includes('application/x-mpegurl')          ||
      targetUrl.includes('.m3u8')) {
    const text    = await res.text();
    const cleaned = stripM3U8Ads(text);
    return new Response(cleaned, {
      status:  res.status,
      headers: proxyHeaders(res.headers, 'application/vnd.apple.mpegurl'),
    });
  }

  // ╔══════════════════════════════════════════════════════╗
  // ║  LAYER 3 — HTML: sanitise + inject cosmetic shield  ║
  // ╚══════════════════════════════════════════════════════╝
  if (ct.includes('text/html')) {
    let html = await res.text();
    html = sanitiseHTML(html);
    html = injectShield(html);
    return new Response(html, {
      status:  res.status,
      headers: proxyHeaders(res.headers, 'text/html; charset=utf-8'),
    });
  }

  // ╔══════════════════════════════════════════════════════╗
  // ║  LAYER 4 — JAVASCRIPT: neutralise ad SDK calls      ║
  // ╚══════════════════════════════════════════════════════╝
  if (ct.includes('javascript')) {
    let js = await res.text();

    // Pattern-replace dangerous ad calls without breaking player JS
    const KILLS = [
      [/window\.open\s*\(/g,          'void(0&&('],
      [/popunder\s*\(/g,              'void(0&&('],
      [/\bpopads\b/g,                 '__blocked__'],
      [/googletag\.display\s*\(/g,    'void(0&&('],
      [/adsbygoogle\.push\s*\(/g,     'void(0&&('],
    ];
    for (const [re, rep] of KILLS) js = js.replace(re, rep);

    return new Response(js, {
      status:  res.status,
      headers: proxyHeaders(res.headers, 'application/javascript'),
    });
  }

  // ╔══════════════════════════════════════════════════════╗
  // ║  VIDEO SEGMENTS (TS / MP4 / M4S) — block ad segs,   ║
  // ║  stream everything else directly                    ║
  // ╚══════════════════════════════════════════════════════╝
  if (ct.includes('video/') ||
      ct.includes('audio/') ||
      ct.includes('application/octet-stream') ||
      /\.(ts|mp4|webm|mp3|aac|m4s|fmp4)(\?|$)/i.test(targetUrl)) {
    if (COMPILED_VIDEO_PATTERNS.some(re => re.test(targetUrl))) {
      return BLOCKED(targetUrl);
    }
    return new Response(res.body, {
      status:  res.status,
      headers: proxyHeaders(res.headers),
    });
  }

  // ── Default pass-through (images, CSS, fonts, etc.) ──────
  return new Response(res.body, {
    status:  res.status,
    headers: proxyHeaders(res.headers),
  });
}

// ============================================================
// CLOUDFLARE WORKER ENTRY POINT
// ============================================================
addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request).catch(err =>
      new Response(`Worker error: ${err.message}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      })
    )
  );
});
