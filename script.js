/**
 * script.js
 * Presentation Engine & Interactivity for History 10: Industry 4.0
 * Works cleanly on both file:// and http://localhost with zero dependencies.
 */
(function () {
  "use strict";

  const LOGICAL_WIDTH = 1920;
  const LOGICAL_HEIGHT = 1080;
  const TRANSITION_MS = 580;
  const HUD_IDLE_MS = 3500;
  const PARTICLE_COUNT = 34;
  const PARTICLE_FPS_INTERVAL = 1000 / 30;

  const STORAGE_KEYS = {
    slideIndex: "industry40_slide_index",
    soundEnabled: "industry40_sound_enabled",
    animationsPaused: "industry40_anim_paused",
    metaPrefix: "industry40_meta_"
  };

  const slidesData = Array.isArray(window.SLIDES_DATA) ? window.SLIDES_DATA : [];
  const presentationMeta = window.PRESENTATION_META || {};
  const totalSlides = slidesData.length;

  const dom = {
    body: document.body,
    root: document.documentElement,
    progressBar: document.getElementById("progressBar"),
    bgCanvas: document.getElementById("bgCanvas"),
    viewport: document.getElementById("viewport"),
    slideStage: document.getElementById("slideStage"),
    hudBar: document.getElementById("hudBar"),
    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
    slideCounter: document.getElementById("slideCounter"),
    btnToc: document.getElementById("btnToc"),
    btnOverview: document.getElementById("btnOverview"),
    btnPause: document.getElementById("btnPause"),
    btnSound: document.getElementById("btnSound"),
    btnFullscreen: document.getElementById("btnFullscreen"),
    tocDrawer: document.getElementById("tocDrawer"),
    btnCloseToc: document.getElementById("btnCloseToc"),
    tocList: document.getElementById("tocList"),
    overviewModal: document.getElementById("overviewModal"),
    btnCloseOverview: document.getElementById("btnCloseOverview"),
    overviewGrid: document.getElementById("overviewGrid"),
    toastNotice: document.getElementById("toastNotice")
  };

  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const state = {
    currentIndex: 0,
    animationsPaused: false,
    soundEnabled: true,
    tocOpen: false,
    overviewOpen: false,
    slideElements: [],
    transitionTimers: new WeakMap(),
    pipelineTimer: null,
    pipelineStep: 0,
    activeHotspot: 0,
    highlightedEraRow: 3,
    quizAnswers: [],
    toastTimer: null,
    hudIdleTimer: null,
    scaleRaf: null,
    lastScale: null,
    audioCtx: null,
    touchStart: null,
    coverDriftRaf: null,
    coverParallax: { pointerX: 0, pointerY: 0 }
  };

  // =========================================================================
  // UTILITIES: ESCAPING, SAFE URLS, STORAGE, HASH
  // =========================================================================

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeUrl(url) {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (
      /^(https?:\/\/|data:image\/svg\+xml)/i.test(trimmed) ||
      /^[a-z0-9._-]+\.(jpg|jpeg|png|webp|svg)$/i.test(trimmed)
    ) {
      return trimmed;
    }
    return "";
  }

  function pad2(num) {
    return String(num).padStart(2, "0");
  }

  function storageGet(key, fallback) {
    try {
      const val = window.localStorage.getItem(key);
      return val === null ? fallback : val;
    } catch (_) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (_) {
      // Ignore storage errors in restricted file:// contexts
    }
  }

  function clampIndex(idx) {
    if (totalSlides === 0) return 0;
    return Math.max(0, Math.min(totalSlides - 1, idx));
  }

  function parseSlideHash() {
    const match = /^#slide-(\d+)$/i.exec(window.location.hash || "");
    if (!match) return null;
    const num = parseInt(match[1], 10);
    if (Number.isNaN(num) || num < 1 || num > totalSlides) return null;
    return num - 1;
  }

  function writeSlideHash(index) {
    const hash = "#slide-" + pad2(index + 1);
    if (window.location.hash === hash) return;
    try {
      window.history.replaceState(null, "", hash);
    } catch (_) {
      try {
        window.location.hash = hash;
      } catch (__) {
        // Ignore if hash navigation is restricted
      }
    }
  }

  function isMotionDisabled() {
    return state.animationsPaused || Boolean(reducedMotionQuery.matches);
  }

  // =========================================================================
  // SVG FALLBACK & LAZY IMAGE LOADER
  // =========================================================================

  function buildFallbackSvgUri(label) {
    const safeLabel = escapeHtml((label || "Industry 4.0").slice(0, 64));
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">',
      "<defs>",
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="#0A1020"/>',
      '<stop offset="100%" stop-color="#132242"/>',
      "</linearGradient>",
      "</defs>",
      '<rect width="800" height="500" fill="url(#g)"/>',
      '<g stroke="#22D3EE" stroke-opacity="0.18" stroke-width="1">',
      '<line x1="0" y1="125" x2="800" y2="125"/>',
      '<line x1="0" y1="250" x2="800" y2="250"/>',
      '<line x1="0" y1="375" x2="800" y2="375"/>',
      '<line x1="200" y1="0" x2="200" y2="500"/>',
      '<line x1="400" y1="0" x2="400" y2="500"/>',
      '<line x1="600" y1="0" x2="600" y2="500"/>',
      "</g>",
      '<circle cx="400" cy="210" r="68" fill="#2563EB" fill-opacity="0.2" stroke="#22D3EE" stroke-width="2.5"/>',
      '<circle cx="400" cy="210" r="32" fill="none" stroke="#8B5CF6" stroke-width="2"/>',
      '<circle cx="400" cy="210" r="8" fill="#22D3EE"/>',
      '<text x="400" y="334" text-anchor="middle" fill="#F8FAFC" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700">',
      safeLabel,
      "</text>",
      '<text x="400" y="368" text-anchor="middle" fill="#22D3EE" font-family="monospace" font-size="15">',
      "INDUSTRY 4.0 VISUAL",
      "</text>",
      "</svg>"
    ].join("");
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function buildOverviewCardSvg(slide) {
    const num = escapeHtml(slide.number || "");
    const title = escapeHtml((slide.navTitle || slide.title || "").slice(0, 42));
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">',
      "<defs>",
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="#080D18"/>',
      '<stop offset="55%" stop-color="#102042"/>',
      '<stop offset="100%" stop-color="#1B1848"/>',
      "</linearGradient>",
      "</defs>",
      '<rect width="640" height="360" fill="url(#bg)"/>',
      '<circle cx="520" cy="90" r="90" fill="#22D3EE" fill-opacity="0.12"/>',
      '<circle cx="130" cy="290" r="110" fill="#2563EB" fill-opacity="0.15"/>',
      '<rect x="36" y="42" width="110" height="34" rx="17" fill="#22D3EE" fill-opacity="0.16" stroke="#22D3EE" stroke-opacity="0.5"/>',
      '<text x="91" y="65" text-anchor="middle" fill="#22D3EE" font-family="monospace" font-size="16" font-weight="700">SLIDE ' + num + "</text>",
      '<text x="36" y="164" fill="#F8FAFC" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">' + title + "</text>",
      '<line x1="36" y1="210" x2="260" y2="210" stroke="#22D3EE" stroke-width="3" stroke-linecap="round"/>',
      '<text x="36" y="256" fill="#94A3B8" font-family="monospace" font-size="15">LỊCH SỬ 10 • INDUSTRY 4.0</text>',
      "</svg>"
    ].join("");
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function applySvgFallback(img) {
    if (!img || img.dataset.fallbackApplied === "1") return;
    img.dataset.fallbackApplied = "1";
    const label = img.dataset.fallbackLabel || img.alt || "Industry 4.0";
    img.src = buildFallbackSvgUri(label);
  }

  function hydrateImageElement(img) {
    if (!img) return;
    if (!img.dataset.errorBound) {
      img.dataset.errorBound = "1";
      img.addEventListener("error", function () {
        applySvgFallback(img);
      });
    }
    const pendingSrc = img.getAttribute("data-src");
    if (pendingSrc) {
      img.removeAttribute("data-src");
      img.src = pendingSrc;
    } else if (img.complete && img.getAttribute("src") && img.naturalWidth === 0) {
      applySvgFallback(img);
    }
  }

  function hydrateContainerImages(container) {
    if (!container) return;
    const imgs = container.querySelectorAll("img[data-src], img[src]");
    for (let i = 0; i < imgs.length; i += 1) {
      hydrateImageElement(imgs[i]);
    }
  }

  function loadImagesAround(index) {
    const indices = [0, index - 1, index, index + 1];
    const seen = Object.create(null);
    for (let i = 0; i < indices.length; i += 1) {
      const idx = indices[i];
      if (idx < 0 || idx >= totalSlides || seen[idx]) continue;
      seen[idx] = true;
      hydrateContainerImages(state.slideElements[idx]);
    }
  }

  function renderImgMarkup(src, alt, className, fallbackLabel) {
    const cleanSrc = safeUrl(src);
    const clsAttr = className ? ' class="' + escapeHtml(className) + '"' : "";
    const altText = escapeHtml(alt || "");
    const labelText = escapeHtml(fallbackLabel || alt || "Industry 4.0");
    if (!cleanSrc) {
      return (
        "<img" +
        clsAttr +
        ' src="' +
        buildFallbackSvgUri(labelText) +
        '" alt="' +
        altText +
        '" decoding="async">'
      );
    }
    return (
      "<img" +
      clsAttr +
      ' data-src="' +
      escapeHtml(cleanSrc) +
      '" alt="' +
      altText +
      '" data-fallback-label="' +
      labelText +
      '" decoding="async">'
    );
  }

  // =========================================================================
  // 16:9 STAGE AUTO-SCALER
  // =========================================================================

  function updateStageScale() {
    state.scaleRaf = null;
    const scale = Math.min(
      window.innerWidth / LOGICAL_WIDTH,
      window.innerHeight / LOGICAL_HEIGHT
    );
    const clamped = Math.max(0.1, Number(scale.toFixed(5)));
    if (state.lastScale !== clamped) {
      state.lastScale = clamped;
      dom.root.style.setProperty("--stage-scale", String(clamped));
    }
  }

  function scheduleStageScale() {
    if (state.scaleRaf !== null) return;
    state.scaleRaf = window.requestAnimationFrame(updateStageScale);
  }

  // =========================================================================
  // WEB AUDIO API SOUND FX
  // =========================================================================

  function getAudioContext() {
    if (state.audioCtx) return state.audioCtx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      state.audioCtx = new AudioCtx();
      return state.audioCtx;
    } catch (_) {
      return null;
    }
  }

  function playSfx(type, direction) {
    if (!state.soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(function () {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "whoosh") {
        osc.type = "sine";
        const startFreq = direction < 0 ? 340 : 210;
        const endFreq = direction < 0 ? 185 : 390;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.032, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === "correct") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(145, now + 0.14);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.022, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.17);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(860, now + 0.04);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.024, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (_) {
      // Ignore Web Audio errors gracefully
    }
  }

  // =========================================================================
  // LIGHTWEIGHT AMBIENT PARTICLE NETWORK (#bgCanvas)
  // =========================================================================

  const bgNetwork = {
    ctx: null,
    width: 0,
    height: 0,
    nodes: [],
    rafId: null,
    lastFrameTime: 0,

    init: function () {
      if (!dom.bgCanvas || !dom.bgCanvas.getContext) return;
      this.ctx = dom.bgCanvas.getContext("2d");
      if (!this.ctx) return;
      this.resize();
      this.seedNodes();
      this.renderFrame();
      this.syncLoop();
    },

    resize: function () {
      if (!dom.bgCanvas || !this.ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      dom.bgCanvas.width = Math.max(1, Math.floor(this.width * dpr));
      dom.bgCanvas.height = Math.max(1, Math.floor(this.height * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    seedNodes: function () {
      this.nodes = [];
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        this.nodes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.48,
          vy: (Math.random() - 0.5) * 0.48,
          r: 1.4 + Math.random() * 1.8
        });
      }
    },

    step: function () {
      for (let i = 0; i < this.nodes.length; i += 1) {
        const n = this.nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > this.width) n.vx *= -1;
        if (n.y < 0 || n.y > this.height) n.vy *= -1;
        n.x = Math.max(0, Math.min(this.width, n.x));
        n.y = Math.max(0, Math.min(this.height, n.y));
      }
    },

    renderFrame: function () {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      const maxDist = Math.min(180, Math.max(120, w * 0.11));
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < this.nodes.length; i += 1) {
        const a = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j += 1) {
          const b = this.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.22;
            ctx.strokeStyle = "rgba(34, 211, 238, " + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < this.nodes.length; i += 1) {
        const n = this.nodes[i];
        ctx.fillStyle = i % 3 === 0 ? "rgba(139, 92, 246, 0.55)" : "rgba(34, 211, 238, 0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    tick: function (timestamp) {
      if (document.hidden || isMotionDisabled()) {
        bgNetwork.rafId = null;
        return;
      }
      if (timestamp - bgNetwork.lastFrameTime >= PARTICLE_FPS_INTERVAL) {
        bgNetwork.lastFrameTime = timestamp;
        bgNetwork.step();
        bgNetwork.renderFrame();
      }
      bgNetwork.rafId = window.requestAnimationFrame(bgNetwork.tick);
    },

    syncLoop: function () {
      if (document.hidden || isMotionDisabled()) {
        if (this.rafId !== null) {
          window.cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        return;
      }
      if (this.rafId === null) {
        this.lastFrameTime = performance.now();
        this.rafId = window.requestAnimationFrame(this.tick);
      }
    }
  };

  // =========================================================================
  // SLIDE TEMPLATES: SHARED HEADER & LAYOUT BUILDERS
  // =========================================================================

  function renderHeaderBadges(slide) {
    const badges = [];
    if (slide.layout === "concept-split") {
      badges.push('<span class="badge badge-sgk">Kiến thức cốt lõi SGK</span>');
      badges.push('<span class="badge badge-ext">Thông tin mở rộng</span>');
    } else if (slide.knowledgeTag) {
      badges.push('<span class="badge badge-sgk">' + escapeHtml(slide.knowledgeTag) + "</span>");
    }

    if (slide.layout === "quad-grid-positive") {
      badges.push('<span class="badge badge-positive">Động lực phát triển</span>');
    } else if (slide.layout === "quad-grid-negative") {
      badges.push('<span class="badge badge-negative">Thách thức kiểm soát</span>');
    } else if (slide.layout === "quiz-single") {
      const q = slide.quiz || {};
      const qNum = Number.isInteger(q.questionIndex) ? q.questionIndex + 1 : 1;
      const qTotal = q.totalQuestions || 4;
      badges.push(
        '<span class="badge badge-accent">Trắc nghiệm tương tác • Câu ' +
          qNum +
          "/" +
          qTotal +
          "</span>"
      );
    }

    if (slide.icon) {
      badges.push(
        '<div class="icon-badge">' +
          renderImgMarkup(slide.icon, slide.title, "", slide.navTitle) +
          "</div>"
      );
    }
    return badges.join("");
  }

  function renderSlideHeader(slide) {
    const subtitleHtml = slide.subtitle
      ? '<p class="slide-subtitle">' + escapeHtml(slide.subtitle) + "</p>"
      : "";
    return [
      '<header class="slide-header anim-item" style="--stagger: 0">',
      '  <div class="slide-header-left">',
      '    <div class="slide-eyebrow">',
      '      <span class="slide-num-pill">SLIDE ' + escapeHtml(slide.number) + "</span>",
      "      <span>" + escapeHtml(slide.eyebrow || "") + "</span>",
      "    </div>",
      '    <h2 class="slide-title">' + escapeHtml(slide.title) + "</h2>",
      "    " + subtitleHtml,
      "  </div>",
      '  <div class="slide-header-badges">' + renderHeaderBadges(slide) + "</div>",
      "</header>"
    ].join("\n");
  }

  function formatCoverTitle(titleText) {
    const text = String(titleText || "");
    const marker = "LẦN THỨ TƯ";
    const idx = text.indexOf(marker);
    if (idx === -1) {
      return '<span class="anim-item" style="--stagger: 1; display: inline-block">' + escapeHtml(text) + "</span>";
    }
    const prefix = text.slice(0, idx).trimEnd();
    const highlight = text.slice(idx);
    return (
      '<span class="anim-item" style="--stagger: 1; display: inline-block">' +
      escapeHtml(prefix) +
      "</span> " +
      '<span class="cover-title-highlight anim-item" style="--stagger: 2; display: inline-block">' +
      escapeHtml(highlight) +
      "</span>"
    );
  }

  function getSavedMetaValue(item) {
    if (!item.editable) return item.value;
    const saved = storageGet(STORAGE_KEYS.metaPrefix + item.key, "");
    const trimmed = saved ? saved.trim() : "";
    if (!trimmed || trimmed === "[Tên học sinh]" || trimmed === "[Lớp]") {
      return item.value;
    }
    return trimmed;
  }

  function buildCoverSlide(slide) {
    const metaRows = (slide.meta || [])
      .map(function (item) {
        const val = getSavedMetaValue(item);
        const valueEl = item.editable
          ? '<span class="cover-meta-value editable-meta" contenteditable="true" role="textbox" tabindex="0" data-meta-key="' +
            escapeHtml(item.key) +
            '" data-default-value="' +
            escapeHtml(item.value) +
            '" aria-label="Chỉnh sửa ' +
            escapeHtml(item.label) +
            '">' +
            escapeHtml(val) +
            "</span>"
          : '<span class="cover-meta-value">' + escapeHtml(val) + "</span>";
        return [
          '<div class="cover-meta-item">',
          '  <span class="cover-meta-label">' + escapeHtml(item.label) + "</span>",
          "  " + valueEl,
          "</div>"
        ].join("\n");
      })
      .join("\n");

    const img = slide.image || {};
    return [
      '<div class="cover-bg">',
      "  " + renderImgMarkup(img.src, img.alt, "cover-bg-img", slide.title),
      '  <div class="cover-scrim"></div>',
      "</div>",
      '<div class="cover-content">',
      '  <div class="cover-hero">',
      '    <div class="cover-kicker anim-item" style="--stagger: 0">',
      "      <span>" + escapeHtml(slide.eyebrow) + "</span>",
      "    </div>",
      '    <h1 class="cover-title">' +
        formatCoverTitle(slide.title) +
        "</h1>",
      '    <p class="cover-subtitle anim-item" style="--stagger: 3">' +
        escapeHtml(slide.subtitle) +
        "</p>",
      '    <div class="cover-actions anim-item" style="--stagger: 4">',
      '      <button id="btnStartPresentation" class="btn-cta" type="button">',
      "        <span>" + escapeHtml(slide.ctaLabel || "START PRESENTATION") + "</span>",
      '        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
      "      </button>",
      '      <span class="cover-hint">Nhấn → hoặc Space để bắt đầu</span>',
      "    </div>",
      "  </div>",
      '  <aside class="cover-meta-card glass-card glass-card--accent anim-item" style="--stagger: 5">',
      '    <div class="cover-meta-header">',
      "      <span>HỒ SƠ BÀI THUYẾT TRÌNH</span>",
      "      <span>16:9 • " + totalSlides + " SLIDES</span>",
      "    </div>",
      '    <div class="cover-meta-list">' + metaRows + "</div>",
      "  </aside>",
      "</div>"
    ].join("\n");
  }

  function buildTimelineSlide(slide) {
    const nodesHtml = (slide.eras || [])
      .map(function (era, idx) {
        const currentClass = era.highlight ? " timeline-node--current is-focused" : "";
        return [
          '<article class="timeline-node glass-card' +
            currentClass +
            ' anim-item" style="--stagger: ' +
            (idx + 1) +
            '" tabindex="0" role="button" data-era-index="' +
            idx +
            '" aria-pressed="' +
            (era.highlight ? "true" : "false") +
            '">',
          '  <span class="timeline-dot" aria-hidden="true"></span>',
          '  <div class="timeline-node-head">',
          '    <span class="timeline-era">' + escapeHtml(era.version) + "</span>",
          '    <span class="timeline-period">' + escapeHtml(era.era) + "</span>",
          "  </div>",
          '  <div class="timeline-media media-frame">' +
            renderImgMarkup(era.image, era.imageAlt, "", era.title) +
            "</div>",
          '  <h3 class="timeline-heading">' + escapeHtml(era.title) + "</h3>",
          '  <p class="timeline-desc">' + escapeHtml(era.summary) + "</p>",
          '  <div class="timeline-keyword">' + escapeHtml(era.coreTech) + "</div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      '<div class="slide-body"><div class="timeline-wrapper"><div class="timeline-track">' +
      '<div class="timeline-line" aria-hidden="true"></div>' +
      nodesHtml +
      "</div></div></div>"
    );
  }

  function buildConceptSplitSlide(slide) {
    const core = slide.coreSection || {};
    const exp = slide.expandedSection || {};
    const img = slide.image || {};

    const corePoints = (core.points || [])
      .map(function (pt) {
        return (
          "<li><strong>" +
          escapeHtml(pt.label) +
          ":</strong> " +
          escapeHtml(pt.text) +
          "</li>"
        );
      })
      .join("");

    const expPoints = (exp.points || [])
      .map(function (pt) {
        return [
          '<div class="milestone-chip">',
          '  <span class="milestone-year">' + escapeHtml(pt.year) + "</span>",
          '  <span class="milestone-desc"><strong>' +
            escapeHtml(pt.label) +
            ":</strong> " +
            escapeHtml(pt.text) +
            "</span>",
          "</div>"
        ].join("");
      })
      .join("");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="concept-grid">',
        '    <div class="concept-cards">',
        '      <article class="concept-card concept-card--sgk glass-card anim-item" style="--stagger: 1">',
        '        <div class="concept-card-head">',
        '          <h3 class="concept-card-title">' + escapeHtml(core.heading) + "</h3>",
        '          <span class="badge badge-sgk">' + escapeHtml(core.badge) + "</span>",
        "        </div>",
        '        <blockquote class="concept-quote">“' + escapeHtml(core.exactQuote) + "”</blockquote>",
        '        <ul class="bullet-list">' + corePoints + "</ul>",
        "      </article>",
        '      <article class="concept-card concept-card--ext glass-card anim-item" style="--stagger: 2">',
        '        <div class="concept-card-head">',
        '          <h3 class="concept-card-title">' + escapeHtml(exp.heading) + "</h3>",
        '          <span class="badge badge-ext">' + escapeHtml(exp.badge) + "</span>",
        "        </div>",
        '        <div class="milestone-row">' + expPoints + "</div>",
        "      </article>",
        "    </div>",
        '    <div class="concept-visual anim-item" style="--stagger: 3">',
        '      <figure class="media-frame">',
        "        " + renderImgMarkup(img.src, img.alt, "", slide.title),
        '        <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
        "      </figure>",
        '      <div class="concept-stat-strip">',
        '        <div class="stat-mini glass-card">',
        '          <span class="stat-mini-val">Đầu TK XXI</span>',
        '          <span class="stat-mini-label">Thời điểm khởi phát (SGK)</span>',
        "        </div>",
        '        <div class="stat-mini glass-card">',
        '          <span class="stat-mini-val">3 Lĩnh vực</span>',
        '          <span class="stat-mini-label">Vật lý • Kỹ thuật số • Sinh học</span>',
        "        </div>",
        "      </div>",
        "    </div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildPipelineDiagramSlide(slide) {
    const pillarsHtml = (slide.pillars || [])
      .map(function (p, idx) {
        return [
          '<article class="pillar-chip glass-card anim-item" style="--stagger: ' + (idx + 1) + '">',
          '  <div class="icon-badge">' +
            renderImgMarkup(p.icon, p.vnName, "", p.code) +
            "</div>",
          "  <div>",
          '    <h3 class="pillar-chip-title">' + escapeHtml(p.vnName) + "</h3>",
          '    <p class="pillar-chip-desc">' + escapeHtml(p.role) + "</p>",
          "  </div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    const stepsHtml = (slide.steps || [])
      .map(function (s, idx) {
        return [
          '<button class="pipeline-step glass-card' +
            (idx === 0 ? " is-current" : "") +
            '" type="button" data-pipeline-step="' +
            idx +
            '">',
          '  <div class="pipeline-step-top">',
          '    <span class="pipeline-step-num">' + pad2(s.step) + "</span>",
          '    <span class="badge badge-accent">' + escapeHtml(s.techBadge) + "</span>",
          "  </div>",
          '  <h4 class="pipeline-step-title">' + escapeHtml(s.title) + "</h4>",
          '  <p class="pipeline-step-desc">' + escapeHtml(s.shortDesc) + "</p>",
          "</button>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="pipeline-layout">',
        '    <div class="pillars-row">' + pillarsHtml + "</div>",
        '    <section class="pipeline-stage glass-card glass-card--accent anim-item" style="--stagger: 4">',
        '      <div class="pipeline-toolbar">',
        '        <span class="pipeline-toolbar-title">Chu trình vận hành 5 bước khép kín</span>',
        '        <button id="btnReplayPipeline" class="btn-ghost-sm" type="button">↻ ' +
          escapeHtml(slide.replayLabel || "Chạy lại chu trình") +
          "</button>",
        "      </div>",
        '      <div class="pipeline-flow">',
        '        <svg class="pipeline-svg-connectors" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">',
        '          <line class="data-flow-line" x1="100" y1="110" x2="900" y2="110" stroke="#22D3EE" stroke-width="3" stroke-opacity="0.7" />',
        '          <polygon points="198,104 208,110 198,116" fill="#22D3EE" />',
        '          <polygon points="398,104 408,110 398,116" fill="#22D3EE" />',
        '          <polygon points="598,104 608,110 598,116" fill="#22D3EE" />',
        '          <polygon points="798,104 808,110 798,116" fill="#22D3EE" />',
        "        </svg>",
        "        " + stepsHtml,
        "      </div>",
        '      <div class="pipeline-loop-note">',
        "        <span><strong>Chu trình tự tối ưu:</strong> Thiết bị thông minh → Thu thập dữ liệu → Phân tích bằng AI → Đưa ra quyết định → Tự động hóa</span>",
        "      </div>",
        "    </section>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildTechShowcaseSlide(slide) {
    const appsHtml = (slide.applications || [])
      .map(function (app, idx) {
        const wideClass = idx === 4 ? " app-card--wide" : "";
        const stagger = 2 + Math.floor(idx / 2);
        return [
          '<article class="app-card glass-card' +
            wideClass +
            ' anim-item" style="--stagger: ' +
            stagger +
            '">',
          '  <span class="app-card-index">' + pad2(idx + 1) + "</span>",
          "  <div>",
          '    <h3 class="app-card-title">' + escapeHtml(app.title) + "</h3>",
          '    <p class="app-card-desc">' + escapeHtml(app.detail) + "</p>",
          "  </div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    const hc = slide.highlightCase || {};
    const hcPoints = (hc.points || [])
      .map(function (pt) {
        return "<li>" + escapeHtml(pt) + "</li>";
      })
      .join("");
    const img = slide.image || {};

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="showcase-grid">',
        '    <div class="showcase-info">',
        '      <div class="definition-box glass-card anim-item" style="--stagger: 1">',
        '        <div class="definition-head">',
        '          <div class="icon-badge">' +
          renderImgMarkup(slide.icon, slide.title, "", "AI") +
          "</div>",
        "          <div>",
        '            <div class="definition-term">Trí tuệ nhân tạo</div>',
        '            <div class="definition-en">' + escapeHtml(slide.termExplanation) + "</div>",
        "          </div>",
        "        </div>",
        '        <p class="definition-text">' + escapeHtml(slide.definition) + "</p>",
        "      </div>",
        '      <div class="app-grid">' + appsHtml + "</div>",
        "    </div>",
        '    <div class="showcase-feature">',
        '      <figure class="sophia-frame media-frame media-frame--portrait anim-item" style="--stagger: 2">',
        "        " + renderImgMarkup(img.src, img.alt, "", hc.title || "AI"),
        '        <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
        "      </figure>",
        '      <aside class="spotlight-card glass-card glass-card--accent anim-item" style="--stagger: 3">',
        '        <div class="concept-card-head">',
        '          <h3 class="spotlight-title">' + escapeHtml(hc.title) + "</h3>",
        '          <span class="badge badge-ext">' + escapeHtml(hc.badge) + "</span>",
        "        </div>",
        '        <ul class="bullet-list">' + hcPoints + "</ul>",
        "      </aside>",
        "    </div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildIotHubSlide(slide) {
    const img = slide.image || {};
    const appsHtml = (slide.applications || [])
      .map(function (app, idx) {
        return [
          '<article class="iot-app-item glass-card anim-item" style="--stagger: ' + Math.min(5, idx + 1) + '">',
          '  <span class="app-card-index">' + pad2(idx + 1) + "</span>",
          "  <div>",
          '    <h3 class="iot-app-title">' + escapeHtml(app.title) + "</h3>",
          '    <p class="iot-app-desc">' + escapeHtml(app.detail) + "</p>",
          "  </div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="iot-grid">',
        '    <div class="iot-visual-col">',
        '      <div class="definition-box glass-card anim-item" style="--stagger: 1">',
        '        <div class="definition-head">',
        '          <div class="icon-badge">' +
          renderImgMarkup(slide.icon, slide.title, "", "IoT") +
          "</div>",
        "          <div>",
        '            <div class="definition-term">Internet vạn vật</div>',
        '            <div class="definition-en">' + escapeHtml(slide.termExplanation) + "</div>",
        "          </div>",
        "        </div>",
        '        <p class="definition-text">' + escapeHtml(slide.definition) + "</p>",
        "      </div>",
        '      <figure class="media-frame anim-item" style="--stagger: 2">',
        "        " + renderImgMarkup(img.src, img.alt, "", slide.title),
        '        <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
        "      </figure>",
        "    </div>",
        '    <div class="iot-apps-col">' + appsHtml + "</div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildDualPillarSlide(slide) {
    const synergyNotes = [
      "Tài nguyên dữ liệu quy mô lớn làm cơ sở huấn luyện AI và phát triển ngành công nghệ mới.",
      "Hạ tầng tính toán đám mây giúp lưu trữ, xử lý và chia sẻ Big Data linh hoạt qua Internet."
    ];

    const panelsHtml = (slide.pillars || [])
      .map(function (pillar, idx) {
        const img = pillar.image || {};
        const traitsHtml = (pillar.traits || [])
          .map(function (t) {
            return (
              "<li><strong>" +
              escapeHtml(t.label) +
              ":</strong> " +
              escapeHtml(t.text) +
              "</li>"
            );
          })
          .join("");
        return [
          '<article class="pillar-panel glass-card ' +
            (idx === 0 ? "glass-card--primary" : "glass-card--secondary") +
            ' anim-item" style="--stagger: ' +
            (idx + 1) +
            '">',
          '  <div class="pillar-panel-head">',
          '    <div class="pillar-panel-title-wrap">',
          '      <div class="icon-badge">' +
            renderImgMarkup(pillar.icon, pillar.title, "", pillar.title) +
            "</div>",
          '      <h3 class="pillar-panel-title">' + escapeHtml(pillar.title) + "</h3>",
          "    </div>",
          '    <span class="badge ' +
            (idx === 0 ? "badge-sgk" : "badge-ext") +
            '">' +
            escapeHtml(pillar.termExplanation) +
            "</span>",
          "  </div>",
          '  <figure class="pillar-media media-frame">',
          "    " + renderImgMarkup(img.src, img.alt, "", pillar.title),
          '    <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
          "  </figure>",
          '  <p class="pillar-definition">' + escapeHtml(pillar.definition) + "</p>",
          '  <ul class="bullet-list">' + traitsHtml + "</ul>",
          '  <div class="pillar-synergy">' + escapeHtml(synergyNotes[idx] || "") + "</div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      '<div class="slide-body"><div class="dual-pillar-grid">' +
      panelsHtml +
      "</div></div>"
    );
  }

  function buildRoboticsFeatureSlide(slide) {
    const img = slide.image || {};
    const typesHtml = (slide.types || [])
      .map(function (item, idx) {
        return [
          '<article class="robot-type-card glass-card anim-item" style="--stagger: ' + Math.min(5, idx + 1) + '">',
          '  <span class="app-card-index">' + pad2(idx + 1) + "</span>",
          "  <div>",
          '    <h3 class="robot-type-title">' + escapeHtml(item.name) + "</h3>",
          '    <p class="robot-type-desc">' + escapeHtml(item.desc) + "</p>",
          "  </div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="robotics-grid">',
        '    <div class="robotics-visual">',
        '      <figure class="media-frame anim-item" style="--stagger: 1">',
        "        " + renderImgMarkup(img.src, img.alt, "", slide.title),
        '        <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
        "      </figure>",
        '      <aside class="robotics-deploy-card glass-card glass-card--accent anim-item" style="--stagger: 2">',
        '        <div class="robotics-deploy-title">' +
          escapeHtml(slide.termExplanation) +
          " • Tự động hóa sản xuất</div>",
        '        <p class="robotics-deploy-text">' +
          escapeHtml(slide.overview) +
          " " +
          escapeHtml(slide.deploymentNote) +
          "</p>",
        "      </aside>",
        "    </div>",
        '    <div class="robotics-types">' + typesHtml + "</div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildAdditiveProcessSlide(slide) {
    const img = slide.image || {};
    const stepsHtml = (slide.processSteps || [])
      .map(function (stepText, idx) {
        const cleanName = String(stepText).replace(/^\d+\.\s*/, "");
        return [
          '<div class="additive-layer-step">',
          '  <span class="additive-layer-num">LỚP ' + pad2(idx + 1) + "</span>",
          '  <span class="additive-layer-name">' + escapeHtml(cleanName) + "</span>",
          "</div>"
        ].join("\n");
      })
      .join("\n");

    const appsHtml = (slide.applications || [])
      .map(function (app, idx) {
        return [
          '<article class="additive-app-card glass-card anim-item" style="--stagger: ' +
            (idx + 2) +
            '">',
          '  <div class="pipeline-step-top">',
          '    <span class="app-card-index">' + pad2(idx + 1) + "</span>",
          '    <span class="badge badge-accent">In 3D</span>',
          "  </div>",
          '  <h3 class="additive-app-title">' + escapeHtml(app.title) + "</h3>",
          '  <p class="additive-app-desc">' + escapeHtml(app.detail) + "</p>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="additive-grid">',
        '    <div class="additive-process-col">',
        '      <div class="definition-box glass-card anim-item" style="--stagger: 1">',
        '        <div class="definition-head">',
        '          <div class="icon-badge">' +
          renderImgMarkup(slide.icon, slide.title, "", "3D") +
          "</div>",
        "          <div>",
        '            <div class="definition-term">Công nghệ In 3D</div>',
        '            <div class="definition-en">' + escapeHtml(slide.termExplanation) + "</div>",
        "          </div>",
        "        </div>",
        '        <p class="definition-text">' + escapeHtml(slide.definition) + "</p>",
        "      </div>",
        '      <div class="additive-layers-visual anim-item" style="--stagger: 2">' +
          stepsHtml +
          "</div>",
        '      <figure class="media-frame anim-item" style="--stagger: 3">',
        "        " + renderImgMarkup(img.src, img.alt, "", slide.title),
        '        <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
        "      </figure>",
        "    </div>",
        '    <div class="additive-apps-grid">' + appsHtml + "</div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildTriScienceSlide(slide) {
    const footerTags = [
      "Biotech • Gen &amp; Y học chính xác",
      "Nanotech • Kích thước 10⁻⁹ mét",
      "Graphene • Composite siêu nhẹ"
    ];

    const cardsHtml = (slide.pillars || [])
      .map(function (pillar, idx) {
        const img = pillar.image || {};
        const pointsHtml = (pillar.points || [])
          .map(function (pt) {
            return "<li>" + escapeHtml(pt) + "</li>";
          })
          .join("");
        return [
          '<article class="science-pillar glass-card anim-item" style="--stagger: ' +
            (idx + 1) +
            '">',
          '  <figure class="science-media media-frame">',
          "    " + renderImgMarkup(img.src, img.alt, "", pillar.title),
          '    <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
          "  </figure>",
          '  <div class="science-head">',
          '    <div class="icon-badge">' +
            renderImgMarkup(pillar.icon, pillar.title, "", pillar.title) +
            "</div>",
          '    <h3 class="science-title">' + escapeHtml(pillar.title) + "</h3>",
          "  </div>",
          '  <ul class="bullet-list">' + pointsHtml + "</ul>",
          '  <div class="science-footer-tag">' + (footerTags[idx] || "Công nghệ mũi nhọn 4.0") + "</div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      '<div class="slide-body"><div class="tri-science-grid">' +
      cardsHtml +
      "</div></div>"
    );
  }

  function buildSmartFactorySlide(slide) {
    const img = slide.image || {};
    const hotspots = slide.hotspots || [];
    const shortLabels = {
      sensors: "1. Cảm biến",
      iot: "2. IoT",
      bigdata: "3. Big Data",
      ai: "4. AI",
      robots: "5. Robot",
      human: "6. Con người"
    };

    const pathPoints = hotspots
      .map(function (h, i) {
        return (i === 0 ? "M " : "L ") + h.x + " " + h.y;
      })
      .join(" ");

    const dotsHtml = hotspots
      .map(function (h, idx) {
        const isActive = idx === state.activeHotspot;
        const label = shortLabels[h.id] || h.stepNum + ". " + h.title;
        return [
          '<button class="hotspot-dot' +
            (isActive ? " is-active" : "") +
            '" type="button" style="left: ' +
            Number(h.x) +
            "%; top: " +
            Number(h.y) +
            '%;" data-hotspot-index="' +
            idx +
            '" aria-label="Điểm ' +
            escapeHtml(h.stepNum) +
            ": " +
            escapeHtml(h.title) +
            '" aria-pressed="' +
            (isActive ? "true" : "false") +
            '">',
          '  <span class="hotspot-pulse" aria-hidden="true"></span>',
          '  <span class="hotspot-num">' + escapeHtml(h.stepNum) + "</span>",
          '  <span class="hotspot-label-mini">' + escapeHtml(label) + "</span>",
          "</button>"
        ].join("\n");
      })
      .join("\n");

    const active = hotspots[state.activeHotspot] || hotspots[0] || {};
    const listButtonsHtml = hotspots
      .map(function (h, idx) {
        const isActive = idx === state.activeHotspot;
        return [
          '<button class="hotspot-step-btn' +
            (isActive ? " is-active" : "") +
            '" type="button" data-hotspot-index="' +
            idx +
            '" aria-pressed="' +
            (isActive ? "true" : "false") +
            '">',
          '  <span class="hotspot-step-btn-num">' + escapeHtml(h.stepNum) + "</span>",
          "  <span>" + escapeHtml(h.title) + "</span>",
          "</button>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="factory-map-grid">',
        '    <div class="factory-canvas-card glass-card anim-item" style="--stagger: 1">',
        '      <div class="factory-image-wrap">',
        "        " + renderImgMarkup(img.src, img.alt, "factory-bg-img", slide.title),
        '        <svg class="factory-flow-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
        '          <path class="data-flow-line" d="' +
          escapeHtml(pathPoints) +
          '" fill="none" stroke="#22D3EE" stroke-width="0.55" stroke-opacity="0.85" />',
        "        </svg>",
        "        " + dotsHtml,
        "      </div>",
        '      <div class="factory-map-hint">',
        "        <span>" + escapeHtml(img.caption) + "</span>",
        "        <span>Nhấn điểm 1–6 hoặc phím 1–6</span>",
        "      </div>",
        "    </div>",
        '    <div class="factory-inspector anim-item" style="--stagger: 2">',
        '      <article class="hotspot-card glass-card glass-card--accent" id="factoryInspectorCard" aria-live="polite">',
        '        <div class="hotspot-card-top">',
        '          <span class="hotspot-step-badge">MẮT XÍCH ' +
          pad2(active.stepNum || 1) +
          " / " +
          pad2(hotspots.length) +
          "</span>",
        '          <span class="hotspot-tech-badge">' + escapeHtml(active.techBadge || "") + "</span>",
        "        </div>",
        '        <h3 class="hotspot-card-title">' + escapeHtml(active.title || "") + "</h3>",
        '        <p class="hotspot-card-desc">' + escapeHtml(active.description || "") + "</p>",
        "      </article>",
        '      <div class="hotspot-step-list">' + listButtonsHtml + "</div>",
        "    </div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildQuadGridSlide(slide) {
    const isNeg = slide.layout === "quad-grid-negative";
    const cardModifier = isNeg ? "quad-card--negative" : "quad-card--positive";
    const badgeClass = isNeg ? "badge-negative" : "badge-positive";
    const innerModifier = isNeg ? " quad-card-inner--reverse" : "";

    const cardsHtml = (slide.sectors || [])
      .map(function (sector, idx) {
        const img = sector.image || {};
        const pointsHtml = (sector.points || [])
          .map(function (pt) {
            return "<li>" + escapeHtml(pt) + "</li>";
          })
          .join("");

        const textBlock = [
          '<div class="quad-card-text">',
          '  <div class="quad-card-head">',
          '    <h3 class="quad-card-sector">' + escapeHtml(sector.area) + "</h3>",
          '    <span class="badge ' + badgeClass + '">' + escapeHtml(sector.badge) + "</span>",
          "  </div>",
          '  <ul class="bullet-list">' + pointsHtml + "</ul>",
          "</div>"
        ].join("\n");

        const mediaBlock =
          '<figure class="quad-card-media media-frame">' +
          renderImgMarkup(img.src, img.alt, "", sector.area) +
          "</figure>";

        return [
          '<article class="quad-card ' +
            cardModifier +
            ' glass-card anim-item" style="--stagger: ' +
            (idx + 1) +
            '">',
          '  <div class="quad-card-inner' + innerModifier + '">',
          isNeg ? mediaBlock + "\n" + textBlock : textBlock + "\n" + mediaBlock,
          "  </div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      '<div class="slide-body"><div class="quad-grid quad-grid--full">' +
      cardsHtml +
      "</div></div>"
    );
  }

  function buildVietnamFocusSlide(slide) {
    const appsHtml = (slide.applications || [])
      .map(function (app) {
        return [
          '<div class="vietnam-app-pill">',
          '  <h3 class="vietnam-app-title">' + escapeHtml(app.title) + "</h3>",
          '  <p class="vietnam-app-desc">' + escapeHtml(app.detail) + "</p>",
          "</div>"
        ].join("\n");
      })
      .join("\n");

    const galleryHtml = (slide.images || [])
      .map(function (img) {
        return [
          '<figure class="media-frame">',
          "  " + renderImgMarkup(img.src, img.alt, "", img.caption),
          '  <figcaption class="media-caption">' + escapeHtml(img.caption) + "</figcaption>",
          "</figure>"
        ].join("\n");
      })
      .join("\n");

    const opp = slide.opportunities || {};
    const oppPoints = (opp.points || [])
      .map(function (pt) {
        return "<li>" + escapeHtml(pt) + "</li>";
      })
      .join("");

    const chal = slide.challenges || {};
    const chalPoints = (chal.points || [])
      .map(function (pt) {
        return (
          "<li><strong>" +
          escapeHtml(pt.label) +
          ":</strong> " +
          escapeHtml(pt.text) +
          "</li>"
        );
      })
      .join("");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="vietnam-layout">',
        '    <div class="vietnam-left">',
        '      <section class="vietnam-apps-card glass-card anim-item" style="--stagger: 1">',
        '        <div class="vietnam-section-label">Ứng dụng thực tiễn tại Việt Nam</div>',
        '        <div class="vietnam-apps-grid">' + appsHtml + "</div>",
        "      </section>",
        '      <div class="vietnam-gallery anim-item" style="--stagger: 2">' + galleryHtml + "</div>",
        "    </div>",
        '    <div class="vietnam-right">',
        '      <article class="vn-box vn-box--opportunity glass-card anim-item" style="--stagger: 2">',
        '        <div class="concept-card-head">',
        '          <h3 class="vn-box-title">' + escapeHtml(opp.heading) + "</h3>",
        '          <span class="badge badge-positive">Thời cơ phát triển</span>',
        "        </div>",
        '        <ul class="bullet-list">' + oppPoints + "</ul>",
        "      </article>",
        '      <article class="vn-box vn-box--challenge glass-card anim-item" style="--stagger: 3">',
        '        <div class="concept-card-head">',
        '          <h3 class="vn-box-title">' + escapeHtml(chal.heading) + "</h3>",
        '          <span class="badge badge-negative">Cần vượt qua</span>',
        "        </div>",
        '        <ul class="bullet-list">' + chalPoints + "</ul>",
        "      </article>",
        "    </div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildComparisonMatrixSlide(slide) {
    const rows = slide.rows || [];
    const defaultIdx = rows.findIndex(function (r) {
      return r.isHighlight;
    });
    if (defaultIdx >= 0) {
      state.highlightedEraRow = defaultIdx;
    }

    const eraCardsHtml = rows
      .map(function (row, idx) {
        const isHighlighted = idx === state.highlightedEraRow;
        return [
          '<button class="era-mini-card glass-card' +
            (isHighlighted ? " is-highlighted" : "") +
            ' anim-item" style="--stagger: ' +
            (idx + 1) +
            '" type="button" data-era-row="' +
            idx +
            '" aria-pressed="' +
            (isHighlighted ? "true" : "false") +
            '">',
          '  <div class="era-mini-thumb media-frame">' +
            renderImgMarkup(row.image, row.imageAlt, "", row.name) +
            "</div>",
          "  <div>",
          '    <div class="era-mini-tag">CMCN ' + escapeHtml(row.version) + "</div>",
          '    <div class="era-mini-name">' + escapeHtml(row.name) + "</div>",
          '    <div class="era-mini-time">' + escapeHtml(row.period) + "</div>",
          "  </div>",
          "</button>"
        ].join("\n");
      })
      .join("\n");

    const thHtml = (slide.columns || [])
      .map(function (col) {
        return '<th scope="col">' + escapeHtml(col) + "</th>";
      })
      .join("");

    const trHtml = rows
      .map(function (row, idx) {
        const isHighlighted = idx === state.highlightedEraRow;
        const era4Class = row.isHighlight ? " is-era-4" : "";
        return [
          '<tr class="comparison-row' +
            era4Class +
            (isHighlighted ? " is-highlighted" : "") +
            '" data-era-row="' +
            idx +
            '" tabindex="0">',
          "  <td>" + escapeHtml(row.name) + "</td>",
          "  <td>" + escapeHtml(row.period) + "</td>",
          "  <td>" + escapeHtml(row.tech) + "</td>",
          "  <td>" + escapeHtml(row.coreFeature) + "</td>",
          "  <td>" + escapeHtml(row.impact) + "</td>",
          "</tr>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="comparison-layout">',
        '    <div class="era-strip">' + eraCardsHtml + "</div>",
        '    <div class="table-card glass-card anim-item" style="--stagger: 5">',
        '      <table class="comparison-table">',
        "        <thead><tr>" + thHtml + "</tr></thead>",
        "        <tbody>" + trHtml + "</tbody>",
        "      </table>",
        "    </div>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function buildClosingStatementSlide(slide) {
    const cardsHtml = (slide.takeaways || [])
      .map(function (item, idx) {
        return [
          '<article class="takeaway-card glass-card anim-item" style="--stagger: ' + (idx + 1) + '">',
          '  <span class="takeaway-num">' + escapeHtml(item.num) + "</span>",
          '  <h3 class="takeaway-title">' + escapeHtml(item.title) + "</h3>",
          '  <p class="takeaway-desc">' + escapeHtml(item.text) + "</p>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <div class="closing-layout">',
        '    <div class="takeaways-grid">' + cardsHtml + "</div>",
        '    <section class="hero-quote-card glass-card glass-card--accent anim-item" style="--stagger: 5">',
        '      <span class="hero-quote-kicker">THÔNG ĐIỆP TRỌNG TÂM</span>',
        '      <blockquote class="hero-quote">“' + escapeHtml(slide.closingQuote) + "”</blockquote>",
        '      <p class="hero-quote-sub">' + escapeHtml(slide.quoteNote) + "</p>",
        "    </section>",
        "  </div>",
        "</div>"
      ].join("\n")
    );
  }

  function getQuizEntries() {
    const entries = [];
    for (let i = 0; i < slidesData.length; i += 1) {
      const s = slidesData[i];
      if (s && s.layout === "quiz-single" && s.quiz && s.quiz.question) {
        const qIdx = Number.isInteger(s.quiz.questionIndex) ? s.quiz.questionIndex : entries.length;
        entries.push({
          slideIndex: i,
          slide: s,
          qIdx: qIdx,
          question: s.quiz.question
        });
      }
    }
    return entries;
  }

  function buildQuizSingleSlide(slide) {
    const quiz = slide.quiz || {};
    const q = quiz.question || {};
    const entries = getQuizEntries();
    if (state.quizAnswers.length !== entries.length) {
      state.quizAnswers = new Array(entries.length).fill(null);
    }

    const qIdx = Number.isInteger(quiz.questionIndex) ? quiz.questionIndex : 0;
    const totalQuestions = quiz.totalQuestions || entries.length || 1;
    const scoreLabel = quiz.scoreLabel || "Điểm";

    const pillsHtml = entries
      .map(function (entry) {
        const isActive = entry.qIdx === qIdx;
        return (
          '<button type="button" class="quiz-step-pill' +
          (isActive ? " is-active" : "") +
          '" data-quiz-pill="' +
          entry.qIdx +
          '" data-quiz-jump-slide="' +
          entry.slideIndex +
          '"' +
          (isActive ? ' aria-current="step"' : "") +
          ">" +
          '<span class="quiz-pill-dot" aria-hidden="true"></span>' +
          "<span>Câu " +
          (entry.qIdx + 1) +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    const optionsHtml = (q.options || [])
      .map(function (opt, oIdx) {
        return (
          '<button class="quiz-option quiz-option--hero" type="button" data-question-index="' +
          qIdx +
          '" data-option-index="' +
          oIdx +
          '">' +
          escapeHtml(opt) +
          "</button>"
        );
      })
      .join("\n");

    return (
      renderSlideHeader(slide) +
      [
        '<div class="slide-body">',
        '  <section class="quiz-single-layout" aria-label="Câu hỏi trắc nghiệm tương tác">',
        '    <div class="quiz-toolbar quiz-single-toolbar anim-item" style="--stagger: 1">',
        '      <div class="quiz-step-pills" role="navigation" aria-label="Điều hướng câu hỏi">' +
          pillsHtml +
          "</div>",
        '      <div class="quiz-toolbar-right">',
        '        <div class="quiz-score-badge" data-quiz-score aria-live="polite">' +
          escapeHtml(scoreLabel) +
          ": 0 / " +
          totalQuestions +
          "</div>",
        '        <button class="btn-ghost-sm" data-quiz-reset type="button">↻ ' +
          escapeHtml(quiz.resetLabel || "Làm lại") +
          "</button>",
        "      </div>",
        "    </div>",
        '    <article class="quiz-hero-card glass-card anim-item" style="--stagger: 2" data-question-card="' +
          qIdx +
          '">',
        '      <div class="quiz-hero-meta">',
        '        <span class="quiz-hero-tag">CÂU HỎI ' +
          pad2(qIdx + 1) +
          " / " +
          pad2(totalQuestions) +
          "</span>",
        '        <span class="quiz-hero-status" data-question-status="' +
          qIdx +
          '">Chọn 1 đáp án đúng</span>',
        "      </div>",
        '      <h3 class="quiz-hero-question">' + escapeHtml(q.question) + "</h3>",
        '      <div class="quiz-hero-options">' + optionsHtml + "</div>",
        '      <div class="quiz-hero-footer">',
        '        <div class="quiz-explanation quiz-explanation--hero" data-question-explanation="' +
          qIdx +
          '">Chọn một đáp án để kiểm tra kết quả.</div>',
        quiz.nextLabel
          ? [
              '        <button class="btn-cta quiz-next-btn" data-quiz-next type="button">',
              "          <span>" + escapeHtml(quiz.nextLabel) + "</span>",
              "        </button>"
            ].join("\n")
          : "",
        "      </div>",
        "    </article>",
        "  </section>",
        "</div>"
      ].join("\n")
    );
  }

  function buildThankYouSlide(slide) {
    const img = slide.image || {};
    const creditsHtml = (slide.credits || [])
      .map(function (item) {
        const val = getSavedMetaValue(item);
        return (
          '<div class="thankyou-credit-item">' +
          '<span class="thankyou-credit-label">' +
          escapeHtml(item.label) +
          "</span>" +
          '<span class="thankyou-credit-val"' +
          (item.editable ? ' data-credit-key="' + escapeHtml(item.key) + '"' : "") +
          ">" +
          escapeHtml(val) +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    return [
      '<div class="cover-bg">',
      "  " + renderImgMarkup(img.src, img.alt, "cover-bg-img", slide.title),
      '  <div class="cover-scrim"></div>',
      "</div>",
      '<div class="thankyou-content">',
      '  <span class="cover-kicker anim-item" style="--stagger: 1">' +
        escapeHtml(slide.eyebrow) +
        "</span>",
      '  <h2 class="thankyou-title anim-item" style="--stagger: 2">' +
        escapeHtml(slide.headlinePrefix || "XIN CẢM ƠN THẦY CÔ VÀ") +
        ' <span class="cover-title-highlight">' +
        escapeHtml(slide.highlightText || "CÁC BẠN ĐÃ LẮNG NGHE!") +
        "</span></h2>",
      '  <p class="thankyou-subtitle anim-item" style="--stagger: 3">' +
        escapeHtml(slide.subtitle) +
        "</p>",
      '  <div class="thankyou-credits glass-card glass-card--accent anim-item" style="--stagger: 4">' +
        creditsHtml +
        "</div>",
      '  <div class="thankyou-actions anim-item" style="--stagger: 5">',
      '    <button class="btn-cta thankyou-restart-btn" data-thankyou-restart type="button">↺ ' +
        escapeHtml(slide.restartLabel || "Trình chiếu lại từ đầu") +
        "</button>",
      '    <button class="btn-ghost-sm thankyou-quiz-btn" data-thankyou-quiz type="button">' +
        escapeHtml(slide.quizReviewLabel || "Xem lại câu hỏi") +
        "</button>",
      "  </div>",
      "</div>"
    ].join("\n");
  }

  const LAYOUT_BUILDERS = {
    cover: buildCoverSlide,
    timeline: buildTimelineSlide,
    "concept-split": buildConceptSplitSlide,
    "pipeline-diagram": buildPipelineDiagramSlide,
    "tech-showcase": buildTechShowcaseSlide,
    "iot-hub": buildIotHubSlide,
    "dual-pillar": buildDualPillarSlide,
    "robotics-feature": buildRoboticsFeatureSlide,
    "additive-process": buildAdditiveProcessSlide,
    "tri-science": buildTriScienceSlide,
    "smart-factory-map": buildSmartFactorySlide,
    "quad-grid-positive": buildQuadGridSlide,
    "quad-grid-negative": buildQuadGridSlide,
    "vietnam-focus": buildVietnamFocusSlide,
    "comparison-matrix": buildComparisonMatrixSlide,
    "closing-statement": buildClosingStatementSlide,
    "quiz-single": buildQuizSingleSlide,
    "thank-you": buildThankYouSlide
  };

  function renderAllSlides() {
    if (!dom.slideStage || totalSlides === 0) return;
    const frag = document.createDocumentFragment();
    state.slideElements = [];

    for (let i = 0; i < totalSlides; i += 1) {
      const slide = slidesData[i];
      const section = document.createElement("section");
      section.id = "slide-" + pad2(i + 1);
      section.className =
        "slide layout-" +
        (slide.layout || "default") +
        " transition-" +
        (slide.transition || "fade");
      section.dataset.slideIndex = String(i);
      section.dataset.layout = slide.layout || "";
      section.setAttribute("aria-hidden", "true");

      const builder = LAYOUT_BUILDERS[slide.layout];
      section.innerHTML = builder ? builder(slide) : renderSlideHeader(slide);
      frag.appendChild(section);
      state.slideElements.push(section);
    }

    dom.slideStage.innerHTML = "";
    dom.slideStage.appendChild(frag);
  }

  // =========================================================================
  // TOC DRAWER & OVERVIEW MODAL RENDERING
  // =========================================================================

  function getSlidePreviewImage(slide) {
    if (slide.image && slide.image.src) return slide.image.src;
    if (Array.isArray(slide.eras) && slide.eras[3] && slide.eras[3].image) return slide.eras[3].image;
    if (Array.isArray(slide.pillars) && slide.pillars[0] && slide.pillars[0].image) {
      return slide.pillars[0].image.src;
    }
    if (Array.isArray(slide.sectors) && slide.sectors[0] && slide.sectors[0].image) {
      return slide.sectors[0].image.src;
    }
    if (Array.isArray(slide.images) && slide.images[0] && slide.images[0].src) {
      return slide.images[0].src;
    }
    if (Array.isArray(slide.rows) && slide.rows[3] && slide.rows[3].image) {
      return slide.rows[3].image;
    }
    return "";
  }

  function renderTocAndOverview() {
    if (dom.tocList) {
      dom.tocList.innerHTML = slidesData
        .map(function (slide, idx) {
          return [
            '<button class="toc-item" type="button" data-jump-index="' + idx + '">',
            '  <span class="toc-item-num">' + escapeHtml(slide.number) + "</span>",
            '  <span class="toc-item-title">' + escapeHtml(slide.navTitle || slide.title) + "</span>",
            "</button>"
          ].join("\n");
        })
        .join("\n");
    }

    if (dom.overviewGrid) {
      dom.overviewGrid.innerHTML = slidesData
        .map(function (slide, idx) {
          const previewSrc = getSlidePreviewImage(slide);
          const thumbImg = previewSrc
            ? renderImgMarkup(previewSrc, slide.navTitle || slide.title, "", slide.navTitle)
            : '<img src="' +
              buildOverviewCardSvg(slide) +
              '" alt="' +
              escapeHtml(slide.navTitle || slide.title) +
              '" decoding="async">';
          return [
            '<button class="overview-card" type="button" data-jump-index="' + idx + '">',
            '  <div class="overview-card-thumb">' + thumbImg + "</div>",
            '  <div class="overview-card-meta">',
            "    <span>SLIDE " + escapeHtml(slide.number) + "</span>",
            "    <span>" + escapeHtml(slide.transition || "fade") + "</span>",
            "  </div>",
            '  <div class="overview-card-title">' +
              escapeHtml(slide.navTitle || slide.title) +
              "</div>",
            "</button>"
          ].join("\n");
        })
        .join("\n");
    }
  }

  // =========================================================================
  // INTERACTIVE SLIDE BEHAVIORS
  // =========================================================================

  function bindCoverSlide(slideEl) {
    const startBtn = slideEl.querySelector("#btnStartPresentation");
    if (startBtn) {
      startBtn.addEventListener("click", function () {
        playSfx("click");
        goToSlide(1);
      });
    }

    const editables = slideEl.querySelectorAll(".editable-meta");
    for (let i = 0; i < editables.length; i += 1) {
      const el = editables[i];
      el.addEventListener("focus", function () {
        const def = el.dataset.defaultValue || "";
        if (el.textContent.trim() === def && window.getSelection) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });

      el.addEventListener("input", function () {
        const key = el.dataset.metaKey;
        const val = el.textContent.trim();
        if (key) {
          storageSet(STORAGE_KEYS.metaPrefix + key, val);
          const creditEls = document.querySelectorAll('[data-credit-key="' + key + '"]');
          for (let j = 0; j < creditEls.length; j += 1) {
            creditEls[j].textContent = val || (el.dataset.defaultValue || "");
          }
        }
      });

      el.addEventListener("blur", function () {
        const key = el.dataset.metaKey;
        const def = el.dataset.defaultValue || "";
        const val = el.textContent.trim();
        if (!val) {
          el.textContent = def;
          if (key) storageSet(STORAGE_KEYS.metaPrefix + key, "");
        } else if (key) {
          el.textContent = val;
          storageSet(STORAGE_KEYS.metaPrefix + key, val);
        }
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          el.blur();
          showToast("Đã lưu thông tin người trình chiếu");
        }
      });
    }

    slideEl.addEventListener("mousemove", function (e) {
      if (state.currentIndex !== 0 || isMotionDisabled()) return;
      const rect = slideEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      state.coverParallax.pointerX = Math.max(-1, Math.min(1, nx * 2)) * 16;
      state.coverParallax.pointerY = Math.max(-1, Math.min(1, ny * 2)) * 12;
      applyCoverParallax();
    });
  }

  function applyCoverParallax(driftX, driftY) {
    const coverSlide = state.slideElements[0];
    if (!coverSlide) return;
    const bgImg = coverSlide.querySelector(".cover-bg-img");
    if (!bgImg) return;
    if (isMotionDisabled()) {
      bgImg.style.setProperty("--parallax-x", "0px");
      bgImg.style.setProperty("--parallax-y", "0px");
      return;
    }
    const px = state.coverParallax.pointerX + (driftX || 0);
    const py = state.coverParallax.pointerY + (driftY || 0);
    bgImg.style.setProperty("--parallax-x", px.toFixed(2) + "px");
    bgImg.style.setProperty("--parallax-y", py.toFixed(2) + "px");
  }

  function syncCoverDrift() {
    if (state.coverDriftRaf !== null) {
      window.cancelAnimationFrame(state.coverDriftRaf);
      state.coverDriftRaf = null;
    }
    if (state.currentIndex !== 0 || isMotionDisabled() || document.hidden) {
      applyCoverParallax(0, 0);
      return;
    }

    function loop(ts) {
      if (state.currentIndex !== 0 || isMotionDisabled() || document.hidden) {
        state.coverDriftRaf = null;
        return;
      }
      const dx = Math.sin(ts * 0.00055) * 6;
      const dy = Math.cos(ts * 0.00042) * 4;
      applyCoverParallax(dx, dy);
      state.coverDriftRaf = window.requestAnimationFrame(loop);
    }

    state.coverDriftRaf = window.requestAnimationFrame(loop);
  }

  function bindTimelineSlide(slideEl) {
    const nodes = slideEl.querySelectorAll(".timeline-node");
    function focusEra(targetIdx) {
      for (let i = 0; i < nodes.length; i += 1) {
        const active = i === targetIdx;
        nodes[i].classList.toggle("is-focused", active);
        nodes[i].setAttribute("aria-pressed", active ? "true" : "false");
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      nodes[i].addEventListener("click", function () {
        playSfx("click");
        focusEra(i);
      });
      nodes[i].addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playSfx("click");
          focusEra(i);
        }
      });
    }
  }

  function updatePipelineStep(slideEl, stepIndex) {
    if (!slideEl) return;
    const steps = slideEl.querySelectorAll(".pipeline-step");
    state.pipelineStep = stepIndex;
    for (let i = 0; i < steps.length; i += 1) {
      steps[i].classList.toggle("is-current", i === stepIndex);
      steps[i].classList.toggle("is-completed", i < stepIndex);
    }
  }

  function stopPipelineAnimation() {
    if (state.pipelineTimer !== null) {
      window.clearInterval(state.pipelineTimer);
      state.pipelineTimer = null;
    }
  }

  function startPipelineAnimation(slideEl, startFromZero) {
    stopPipelineAnimation();
    if (!slideEl) return;
    if (startFromZero) {
      updatePipelineStep(slideEl, 0);
    }
    if (isMotionDisabled()) return;

    state.pipelineTimer = window.setInterval(function () {
      const pipelineSlideIdx = slidesData.findIndex(function (s) {
        return s.layout === "pipeline-diagram";
      });
      if (state.currentIndex !== pipelineSlideIdx || isMotionDisabled()) {
        stopPipelineAnimation();
        return;
      }
      const nextStep = (state.pipelineStep + 1) % 5;
      updatePipelineStep(slideEl, nextStep);
    }, 1050);
  }

  function bindPipelineSlide(slideEl) {
    const replayBtn = slideEl.querySelector("#btnReplayPipeline");
    if (replayBtn) {
      replayBtn.addEventListener("click", function () {
        playSfx("click");
        updatePipelineStep(slideEl, 0);
        startPipelineAnimation(slideEl, true);
      });
    }

    const steps = slideEl.querySelectorAll(".pipeline-step");
    for (let i = 0; i < steps.length; i += 1) {
      steps[i].addEventListener("click", function () {
        playSfx("click");
        stopPipelineAnimation();
        updatePipelineStep(slideEl, i);
      });
    }
  }

  function selectSmartFactoryHotspot(index) {
    const slideIdx = slidesData.findIndex(function (s) {
      return s.layout === "smart-factory-map";
    });
    if (slideIdx < 0) return;
    const slide = slidesData[slideIdx];
    const slideEl = state.slideElements[slideIdx];
    const hotspots = slide.hotspots || [];
    if (!slideEl || index < 0 || index >= hotspots.length) return;

    state.activeHotspot = index;
    const h = hotspots[index];

    const dots = slideEl.querySelectorAll(".hotspot-dot");
    for (let i = 0; i < dots.length; i += 1) {
      const active = i === index;
      dots[i].classList.toggle("is-active", active);
      dots[i].setAttribute("aria-pressed", active ? "true" : "false");
    }

    const listBtns = slideEl.querySelectorAll(".hotspot-step-btn");
    for (let i = 0; i < listBtns.length; i += 1) {
      const active = i === index;
      listBtns[i].classList.toggle("is-active", active);
      listBtns[i].setAttribute("aria-pressed", active ? "true" : "false");
    }

    const card = slideEl.querySelector("#factoryInspectorCard");
    if (card) {
      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = "";
      card.innerHTML = [
        '<div class="hotspot-card-top">',
        '  <span class="hotspot-step-badge">MẮT XÍCH ' +
          pad2(h.stepNum) +
          " / " +
          pad2(hotspots.length) +
          "</span>",
        '  <span class="hotspot-tech-badge">' + escapeHtml(h.techBadge) + "</span>",
        "</div>",
        '<h3 class="hotspot-card-title">' + escapeHtml(h.title) + "</h3>",
        '<p class="hotspot-card-desc">' + escapeHtml(h.description) + "</p>"
      ].join("\n");
    }
  }

  function bindSmartFactorySlide(slideEl) {
    slideEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-hotspot-index]");
      if (!btn) return;
      const idx = parseInt(btn.dataset.hotspotIndex, 10);
      if (!Number.isNaN(idx)) {
        playSfx("click");
        selectSmartFactoryHotspot(idx);
      }
    });
  }

  function bindComparisonSlide(slideEl) {
    function highlightRow(rowIdx) {
      state.highlightedEraRow = rowIdx;
      const cards = slideEl.querySelectorAll(".era-mini-card");
      const rows = slideEl.querySelectorAll(".comparison-row");
      for (let i = 0; i < cards.length; i += 1) {
        const active = i === rowIdx;
        cards[i].classList.toggle("is-highlighted", active);
        cards[i].setAttribute("aria-pressed", active ? "true" : "false");
      }
      for (let i = 0; i < rows.length; i += 1) {
        rows[i].classList.toggle("is-highlighted", i === rowIdx);
      }
    }

    slideEl.addEventListener("click", function (e) {
      const target = e.target.closest("[data-era-row]");
      if (!target) return;
      const idx = parseInt(target.dataset.eraRow, 10);
      if (!Number.isNaN(idx)) {
        playSfx("click");
        highlightRow(idx);
      }
    });

    slideEl.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = e.target.closest("tr[data-era-row]");
      if (!target) return;
      e.preventDefault();
      const idx = parseInt(target.dataset.eraRow, 10);
      if (!Number.isNaN(idx)) {
        playSfx("click");
        highlightRow(idx);
      }
    });
  }

  function syncAllQuizUI() {
    const root = dom.slideStage || document;
    const entries = getQuizEntries();
    const scoreLabel =
      (entries[0] && entries[0].slide.quiz && entries[0].slide.quiz.scoreLabel) || "Điểm";

    let score = 0;
    const byQIdx = {};
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      byQIdx[entry.qIdx] = entry.question;
      if (state.quizAnswers[entry.qIdx] === entry.question.correctIndex) {
        score += 1;
      }
    }

    const badges = root.querySelectorAll("[data-quiz-score]");
    for (let i = 0; i < badges.length; i += 1) {
      badges[i].textContent = scoreLabel + ": " + score + " / " + entries.length;
    }

    const pills = root.querySelectorAll("[data-quiz-pill]");
    for (let i = 0; i < pills.length; i += 1) {
      const pill = pills[i];
      const pIdx = parseInt(pill.dataset.quizPill, 10);
      const q = byQIdx[pIdx];
      const ans = state.quizAnswers[pIdx];
      const isAnswered = Boolean(q && ans !== null && ans !== undefined);
      pill.classList.toggle("is-correct", Boolean(isAnswered && ans === q.correctIndex));
      pill.classList.toggle("is-wrong", Boolean(isAnswered && ans !== q.correctIndex));
    }

    const cards = root.querySelectorAll("[data-question-card]");
    for (let i = 0; i < cards.length; i += 1) {
      const card = cards[i];
      const cIdx = parseInt(card.dataset.questionCard, 10);
      const q = byQIdx[cIdx];
      if (!q) continue;
      const ans = state.quizAnswers[cIdx];
      const isAnswered = ans !== null && ans !== undefined;
      const isCorrect = Boolean(isAnswered && ans === q.correctIndex);

      const optionBtns = card.querySelectorAll(".quiz-option");
      for (let j = 0; j < optionBtns.length; j += 1) {
        const btn = optionBtns[j];
        btn.disabled = isAnswered;
        btn.classList.toggle("is-correct", Boolean(isAnswered && j === q.correctIndex));
        btn.classList.toggle("is-wrong", Boolean(isAnswered && !isCorrect && j === ans));
        btn.classList.toggle(
          "is-dimmed",
          Boolean(isAnswered && j !== q.correctIndex && (isCorrect || j !== ans))
        );
      }

      const expEl = card.querySelector('[data-question-explanation="' + cIdx + '"]');
      if (expEl) {
        expEl.textContent = isAnswered
          ? q.explanation || ""
          : "Chọn một đáp án để kiểm tra kết quả.";
        expEl.classList.toggle("is-correct", Boolean(isAnswered && isCorrect));
        expEl.classList.toggle("is-wrong", Boolean(isAnswered && !isCorrect));
      }

      const statusEl = card.querySelector('[data-question-status="' + cIdx + '"]');
      if (statusEl) {
        statusEl.textContent = !isAnswered
          ? "Chọn 1 đáp án đúng"
          : isCorrect
            ? "Chính xác!"
            : "Chưa chính xác";
        statusEl.classList.toggle("is-correct", Boolean(isAnswered && isCorrect));
        statusEl.classList.toggle("is-wrong", Boolean(isAnswered && !isCorrect));
      }
    }
  }

  function bindQuizSingleSlide(slideEl) {
    slideEl.addEventListener("click", function (e) {
      const optBtn = e.target.closest(".quiz-option");
      if (optBtn) {
        const qIdx = parseInt(optBtn.dataset.questionIndex, 10);
        const oIdx = parseInt(optBtn.dataset.optionIndex, 10);
        const entries = getQuizEntries();
        const entry = entries.find(function (item) {
          return item.qIdx === qIdx;
        });
        if (!entry || Number.isNaN(oIdx) || state.quizAnswers[qIdx] !== null) return;
        state.quizAnswers[qIdx] = oIdx;
        playSfx(oIdx === entry.question.correctIndex ? "correct" : "wrong");
        syncAllQuizUI();
        return;
      }

      const pillBtn = e.target.closest("[data-quiz-pill]");
      if (pillBtn) {
        const targetIdx = parseInt(pillBtn.dataset.quizJumpSlide, 10);
        if (!Number.isNaN(targetIdx) && targetIdx !== state.currentIndex) {
          playSfx("click");
          goToSlide(targetIdx);
        }
        return;
      }

      if (e.target.closest("[data-quiz-reset]")) {
        const entries = getQuizEntries();
        state.quizAnswers = new Array(entries.length).fill(null);
        syncAllQuizUI();
        playSfx("click");
        showToast("Đã làm mới bài kiểm tra");
        return;
      }

      if (e.target.closest("[data-quiz-next]")) {
        playSfx("click");
        nextSlide();
      }
    });
  }

  function bindThankYouSlide(slideEl) {
    slideEl.addEventListener("click", function (e) {
      if (e.target.closest("[data-thankyou-restart]")) {
        playSfx("click");
        goToSlide(0);
        return;
      }

      if (e.target.closest("[data-thankyou-quiz]")) {
        const entries = getQuizEntries();
        const firstQuizIdx = entries.length > 0 ? entries[0].slideIndex : 0;
        playSfx("click");
        goToSlide(firstQuizIdx);
      }
    });
  }

  function bindAllSlideInteractions() {
    for (let i = 0; i < state.slideElements.length; i += 1) {
      const slide = slidesData[i];
      const el = state.slideElements[i];
      if (!slide || !el) continue;

      if (slide.layout === "cover") bindCoverSlide(el);
      else if (slide.layout === "timeline") bindTimelineSlide(el);
      else if (slide.layout === "pipeline-diagram") bindPipelineSlide(el);
      else if (slide.layout === "smart-factory-map") bindSmartFactorySlide(el);
      else if (slide.layout === "comparison-matrix") bindComparisonSlide(el);
      else if (slide.layout === "quiz-single") bindQuizSingleSlide(el);
      else if (slide.layout === "thank-you") bindThankYouSlide(el);
    }
  }

  // =========================================================================
  // SLIDE NAVIGATION & GPU TRANSITION ENGINE
  // =========================================================================

  function clearSlideTransitionState(slideEl) {
    if (!slideEl) return;
    const prevTimer = state.transitionTimers.get(slideEl);
    if (prevTimer) {
      window.clearTimeout(prevTimer);
      state.transitionTimers.delete(slideEl);
    }
    slideEl.classList.remove("is-entering", "is-leaving", "is-reverse");
  }

  function updateHudAndNavState() {
    const currentNum = state.currentIndex + 1;
    if (dom.slideCounter) {
      dom.slideCounter.textContent = pad2(currentNum) + " / " + pad2(totalSlides);
    }
    if (dom.progressBar && totalSlides > 0) {
      const pct = (currentNum / totalSlides) * 100;
      dom.progressBar.style.width = pct.toFixed(2) + "%";
    }
    if (dom.btnPrev) {
      dom.btnPrev.disabled = state.currentIndex <= 0;
    }
    if (dom.btnNext) {
      dom.btnNext.disabled = state.currentIndex >= totalSlides - 1;
    }

    if (dom.tocList) {
      const tocItems = dom.tocList.querySelectorAll(".toc-item");
      for (let i = 0; i < tocItems.length; i += 1) {
        tocItems[i].classList.toggle("is-active", i === state.currentIndex);
      }
    }
    if (dom.overviewGrid) {
      const ovCards = dom.overviewGrid.querySelectorAll(".overview-card");
      for (let i = 0; i < ovCards.length; i += 1) {
        ovCards[i].classList.toggle("is-active", i === state.currentIndex);
      }
    }
  }

  function onSlideActivated(index) {
    const slide = slidesData[index];
    const slideEl = state.slideElements[index];

    if (slide && slide.layout === "pipeline-diagram") {
      startPipelineAnimation(slideEl, true);
    } else {
      stopPipelineAnimation();
    }

    syncCoverDrift();
  }

  function goToSlide(targetIndex, options) {
    if (totalSlides === 0) return;
    const opts = options || {};
    const nextIdx = clampIndex(targetIndex);
    const prevIdx = state.currentIndex;

    if (nextIdx === prevIdx && !opts.force) {
      return;
    }

    const isReverse = nextIdx < prevIdx;
    const prevSlide = state.slideElements[prevIdx];
    const nextSlide = state.slideElements[nextIdx];
    const instant = Boolean(opts.instant) || isMotionDisabled() || prevIdx === nextIdx;

    // Settle all unrelated slides cleanly so rapid clicks never leave stuck slides
    for (let i = 0; i < state.slideElements.length; i += 1) {
      const el = state.slideElements[i];
      if (el !== prevSlide && el !== nextSlide) {
        clearSlideTransitionState(el);
        el.classList.remove("is-active");
        el.setAttribute("aria-hidden", "true");
      }
    }

    state.currentIndex = nextIdx;
    loadImagesAround(nextIdx);
    updateHudAndNavState();
    storageSet(STORAGE_KEYS.slideIndex, nextIdx);
    if (!opts.skipHash) {
      writeSlideHash(nextIdx);
    }

    if (instant) {
      if (prevSlide && prevSlide !== nextSlide) {
        clearSlideTransitionState(prevSlide);
        prevSlide.classList.remove("is-active");
        prevSlide.setAttribute("aria-hidden", "true");
      }
      if (nextSlide) {
        clearSlideTransitionState(nextSlide);
        nextSlide.classList.add("is-active");
        nextSlide.setAttribute("aria-hidden", "false");
      }
    } else {
      if (prevSlide && prevSlide !== nextSlide) {
        clearSlideTransitionState(prevSlide);
        prevSlide.classList.remove("is-active");
        prevSlide.classList.add("is-leaving");
        if (isReverse) prevSlide.classList.add("is-reverse");
        prevSlide.setAttribute("aria-hidden", "true");

        const leaveTimer = window.setTimeout(function () {
          prevSlide.classList.remove("is-leaving", "is-reverse");
          state.transitionTimers.delete(prevSlide);
        }, TRANSITION_MS);
        state.transitionTimers.set(prevSlide, leaveTimer);
      }

      if (nextSlide) {
        clearSlideTransitionState(nextSlide);
        nextSlide.classList.add("is-active", "is-entering");
        if (isReverse) nextSlide.classList.add("is-reverse");
        nextSlide.setAttribute("aria-hidden", "false");

        const enterTimer = window.setTimeout(function () {
          nextSlide.classList.remove("is-entering", "is-reverse");
          state.transitionTimers.delete(nextSlide);
        }, TRANSITION_MS);
        state.transitionTimers.set(nextSlide, enterTimer);
      }

      if (!opts.silent) {
        playSfx("whoosh", isReverse ? -1 : 1);
      }
    }

    onSlideActivated(nextIdx);
    resetHudIdleTimer();
  }

  function nextSlide() {
    if (state.currentIndex < totalSlides - 1) {
      goToSlide(state.currentIndex + 1);
    }
  }

  function prevSlide() {
    if (state.currentIndex > 0) {
      goToSlide(state.currentIndex - 1);
    }
  }

  // =========================================================================
  // HUD CONTROLS, MODALS, TOAST, KEYBOARD & TOUCH
  // =========================================================================

  function showToast(message) {
    if (!dom.toastNotice) return;
    dom.toastNotice.textContent = message;
    dom.toastNotice.classList.add("is-visible");
    if (state.toastTimer !== null) {
      window.clearTimeout(state.toastTimer);
    }
    state.toastTimer = window.setTimeout(function () {
      dom.toastNotice.classList.remove("is-visible");
      state.toastTimer = null;
    }, 2000);
  }

  function resetHudIdleTimer() {
    if (!dom.hudBar) return;
    dom.hudBar.classList.remove("is-idle");
    if (state.hudIdleTimer !== null) {
      window.clearTimeout(state.hudIdleTimer);
    }
    state.hudIdleTimer = window.setTimeout(function () {
      if (!state.tocOpen && !state.overviewOpen && dom.hudBar) {
        dom.hudBar.classList.add("is-idle");
      }
    }, HUD_IDLE_MS);
  }

  function setTocOpen(open) {
    state.tocOpen = Boolean(open);
    if (state.tocOpen && state.overviewOpen) {
      setOverviewOpen(false);
    }
    if (dom.tocDrawer) {
      dom.tocDrawer.classList.toggle("is-open", state.tocOpen);
      dom.tocDrawer.setAttribute("aria-hidden", state.tocOpen ? "false" : "true");
    }
    if (dom.btnToc) {
      dom.btnToc.setAttribute("aria-expanded", state.tocOpen ? "true" : "false");
      dom.btnToc.classList.toggle("is-active", state.tocOpen);
    }
    if (state.tocOpen) {
      const activeItem = dom.tocList && dom.tocList.querySelector(".toc-item.is-active");
      if (activeItem) activeItem.focus();
    }
    resetHudIdleTimer();
  }

  function setOverviewOpen(open) {
    state.overviewOpen = Boolean(open);
    if (state.overviewOpen && state.tocOpen) {
      setTocOpen(false);
    }
    if (dom.overviewModal) {
      dom.overviewModal.classList.toggle("is-open", state.overviewOpen);
      dom.overviewModal.setAttribute("aria-hidden", state.overviewOpen ? "false" : "true");
      if (state.overviewOpen) {
        hydrateContainerImages(dom.overviewGrid);
      }
    }
    if (dom.btnOverview) {
      dom.btnOverview.setAttribute("aria-expanded", state.overviewOpen ? "true" : "false");
      dom.btnOverview.classList.toggle("is-active", state.overviewOpen);
    }
    if (state.overviewOpen) {
      const activeCard =
        dom.overviewGrid && dom.overviewGrid.querySelector(".overview-card.is-active");
      if (activeCard) activeCard.focus();
    }
    resetHudIdleTimer();
  }

  function setAnimationsPaused(paused, announce) {
    state.animationsPaused = Boolean(paused);
    dom.body.classList.toggle("animations-paused", state.animationsPaused);
    if (dom.btnPause) {
      dom.btnPause.setAttribute("aria-pressed", state.animationsPaused ? "true" : "false");
    }
    storageSet(STORAGE_KEYS.animationsPaused, state.animationsPaused ? "1" : "0");

    if (state.animationsPaused) {
      for (let i = 0; i < state.slideElements.length; i += 1) {
        clearSlideTransitionState(state.slideElements[i]);
      }
      stopPipelineAnimation();
    } else {
      const currentSlide = slidesData[state.currentIndex];
      if (currentSlide && currentSlide.layout === "pipeline-diagram") {
        startPipelineAnimation(state.slideElements[state.currentIndex], false);
      }
    }

    bgNetwork.syncLoop();
    syncCoverDrift();
    if (announce) {
      showToast(state.animationsPaused ? "Đã tạm dừng hiệu ứng" : "Đã tiếp tục hiệu ứng");
    }
  }

  function setSoundEnabled(enabled, announce) {
    state.soundEnabled = Boolean(enabled);
    dom.body.classList.toggle("is-muted", !state.soundEnabled);
    if (dom.btnSound) {
      dom.btnSound.setAttribute("aria-pressed", state.soundEnabled ? "true" : "false");
    }
    storageSet(STORAGE_KEYS.soundEnabled, state.soundEnabled ? "1" : "0");
    if (announce) {
      if (state.soundEnabled) playSfx("click");
      showToast(state.soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt");
    }
  }

  function syncFullscreenUi() {
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    dom.body.classList.toggle("is-fullscreen", isFs);
    if (dom.btnFullscreen) {
      dom.btnFullscreen.setAttribute("aria-pressed", isFs ? "true" : "false");
    }
    scheduleStageScale();
  }

  function toggleFullscreen() {
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFs) {
      const target = document.documentElement;
      const req = target.requestFullscreen || target.webkitRequestFullscreen;
      if (req) {
        try {
          const promise = req.call(target);
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              showToast("Trình duyệt không cho phép toàn màn hình tự động");
            });
          }
        } catch (_) {
          showToast("Không thể bật chế độ toàn màn hình");
        }
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        try {
          const promise = exit.call(document);
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        } catch (_) {
          // Ignore exit error
        }
      }
    }
  }

  function isEditableElement(target) {
    if (!target || !(target instanceof Element)) return false;
    if (target.isContentEditable) return true;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }

  function isInteractiveControl(target) {
    if (!target || !(target instanceof Element)) return false;
    if (isEditableElement(target)) return true;
    return Boolean(target.closest("button, a[href], [role='button'], [tabindex]:not([tabindex='-1'])"));
  }

  function handleKeyDown(e) {
    resetHudIdleTimer();

    if (isEditableElement(e.target)) {
      if (e.key === "Escape") {
        e.target.blur();
      }
      return;
    }

    if (e.key === "Escape") {
      if (state.overviewOpen) {
        e.preventDefault();
        setOverviewOpen(false);
        return;
      }
      if (state.tocOpen) {
        e.preventDefault();
        setTocOpen(false);
        return;
      }
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        e.preventDefault();
        toggleFullscreen();
      }
      return;
    }

    const lower = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (lower === "g" || lower === "o") {
      e.preventDefault();
      playSfx("click");
      setOverviewOpen(!state.overviewOpen);
      return;
    }

    if (lower === "t") {
      e.preventDefault();
      playSfx("click");
      setTocOpen(!state.tocOpen);
      return;
    }

    if (lower === "f") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    if (lower === "p") {
      e.preventDefault();
      setAnimationsPaused(!state.animationsPaused, true);
      return;
    }

    if (lower === "m") {
      e.preventDefault();
      setSoundEnabled(!state.soundEnabled, true);
      return;
    }

    if (state.overviewOpen || state.tocOpen) {
      return;
    }

    // Smart Factory 1-6 shortcuts on Slide 11
    const activeSlide = slidesData[state.currentIndex];
    if (activeSlide && activeSlide.layout === "smart-factory-map" && /^[1-6]$/.test(e.key)) {
      e.preventDefault();
      playSfx("click");
      selectSmartFactoryHotspot(parseInt(e.key, 10) - 1);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      nextSlide();
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prevSlide();
      return;
    }

    if (e.key === " " || e.code === "Space") {
      if (isInteractiveControl(e.target)) {
        return;
      }
      e.preventDefault();
      nextSlide();
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      goToSlide(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      goToSlide(totalSlides - 1);
    }
  }

  function bindGlobalControls() {
    if (dom.btnPrev) {
      dom.btnPrev.addEventListener("click", function () {
        prevSlide();
      });
    }
    if (dom.btnNext) {
      dom.btnNext.addEventListener("click", function () {
        nextSlide();
      });
    }
    if (dom.btnToc) {
      dom.btnToc.addEventListener("click", function () {
        playSfx("click");
        setTocOpen(!state.tocOpen);
      });
    }
    if (dom.btnCloseToc) {
      dom.btnCloseToc.addEventListener("click", function () {
        playSfx("click");
        setTocOpen(false);
      });
    }
    if (dom.btnOverview) {
      dom.btnOverview.addEventListener("click", function () {
        playSfx("click");
        setOverviewOpen(!state.overviewOpen);
      });
    }
    if (dom.btnCloseOverview) {
      dom.btnCloseOverview.addEventListener("click", function () {
        playSfx("click");
        setOverviewOpen(false);
      });
    }
    if (dom.btnPause) {
      dom.btnPause.addEventListener("click", function () {
        setAnimationsPaused(!state.animationsPaused, true);
      });
    }
    if (dom.btnSound) {
      dom.btnSound.addEventListener("click", function () {
        setSoundEnabled(!state.soundEnabled, true);
      });
    }
    if (dom.btnFullscreen) {
      dom.btnFullscreen.addEventListener("click", function () {
        toggleFullscreen();
      });
    }

    if (dom.tocList) {
      dom.tocList.addEventListener("click", function (e) {
        const item = e.target.closest("[data-jump-index]");
        if (!item) return;
        const idx = parseInt(item.dataset.jumpIndex, 10);
        if (!Number.isNaN(idx)) {
          setTocOpen(false);
          goToSlide(idx);
        }
      });
    }

    if (dom.overviewGrid) {
      dom.overviewGrid.addEventListener("click", function (e) {
        const card = e.target.closest("[data-jump-index]");
        if (!card) return;
        const idx = parseInt(card.dataset.jumpIndex, 10);
        if (!Number.isNaN(idx)) {
          setOverviewOpen(false);
          goToSlide(idx);
        }
      });
    }

    document.addEventListener("click", function (e) {
      if (
        state.tocOpen &&
        dom.tocDrawer &&
        !dom.tocDrawer.contains(e.target) &&
        !(dom.btnToc && dom.btnToc.contains(e.target))
      ) {
        setTocOpen(false);
      }
    });

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", syncFullscreenUi);
    document.addEventListener("webkitfullscreenchange", syncFullscreenUi);

    window.addEventListener("resize", function () {
      scheduleStageScale();
      bgNetwork.resize();
    });

    window.addEventListener("hashchange", function () {
      const idx = parseSlideHash();
      if (idx !== null && idx !== state.currentIndex) {
        goToSlide(idx, { skipHash: true });
      }
    });

    document.addEventListener("visibilitychange", function () {
      bgNetwork.syncLoop();
      syncCoverDrift();
    });

    if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", function () {
        bgNetwork.syncLoop();
        syncCoverDrift();
      });
    }

    document.addEventListener("mousemove", resetHudIdleTimer, { passive: true });

    // Touch swipe for interactive boards & tablets
    if (dom.viewport) {
      dom.viewport.addEventListener(
        "touchstart",
        function (e) {
          if (e.touches.length !== 1) return;
          state.touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            scrollable: Boolean(e.target && e.target.closest && e.target.closest(".ref-sources-list"))
          };
          resetHudIdleTimer();
        },
        { passive: true }
      );

      dom.viewport.addEventListener(
        "touchend",
        function (e) {
          if (!state.touchStart || state.touchStart.scrollable) {
            state.touchStart = null;
            return;
          }
          if (state.tocOpen || state.overviewOpen || !e.changedTouches.length) {
            state.touchStart = null;
            return;
          }
          const dx = e.changedTouches[0].clientX - state.touchStart.x;
          const dy = e.changedTouches[0].clientY - state.touchStart.y;
          state.touchStart = null;

          if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            if (dx < 0) nextSlide();
            else prevSlide();
          }
        },
        { passive: true }
      );
    }
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  function init() {
    if (totalSlides === 0) {
      showToast("Không tìm thấy dữ liệu slides-data.js");
      return;
    }

    updateStageScale();
    renderAllSlides();
    renderTocAndOverview();
    bindAllSlideInteractions();
    bindGlobalControls();

    const savedSound = storageGet(STORAGE_KEYS.soundEnabled, "1");
    setSoundEnabled(savedSound !== "0", false);

    const savedPaused = storageGet(STORAGE_KEYS.animationsPaused, "0");
    setAnimationsPaused(savedPaused === "1", false);

    const hashIndex = parseSlideHash();
    const savedIndexRaw = parseInt(storageGet(STORAGE_KEYS.slideIndex, "0"), 10);
    const initialIndex =
      hashIndex !== null
        ? hashIndex
        : Number.isNaN(savedIndexRaw)
        ? 0
        : clampIndex(savedIndexRaw);

    goToSlide(initialIndex, { force: true, instant: true, silent: true });
    bgNetwork.init();
    resetHudIdleTimer();

    if (presentationMeta && presentationMeta.title) {
      document.title = presentationMeta.title + " — " + (presentationMeta.subject || "Lịch sử 10");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
