(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var THEME_KEY = 'leo-theme';

  // ── Theme ─────────────────────────────────────────────────
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function setStoredTheme(value) {
    try {
      if (value === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, value);
    } catch (e) {}
  }

  function applyTheme(value) {
    var choice = value || 'system';
    if (choice === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);

    document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
      var active = btn.getAttribute('data-theme-choice') === choice;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  applyTheme(getStoredTheme() || 'system');

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-choice]');
    if (btn) {
      var choice = btn.getAttribute('data-theme-choice') || 'system';
      setStoredTheme(choice);
      applyTheme(choice);
    }
  });

  // ── Overlay Helpers ───────────────────────────────────────
  function openOverlay(el) {
    if (!el) return;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('is-open'); });
    body.style.overflow = 'hidden';
  }

  function closeOverlay(el) {
    if (!el) return;
    el.classList.remove('is-open');
    body.style.overflow = '';
    setTimeout(function () { el.hidden = true; }, 250);
  }

  // ── i18n ─────────────────────────────────────────────────
  var LANG_KEY = 'leo-lang';
  var currentLang = 'zh';
  var langData = null;

  function getStoredLang() {
    try { return localStorage.getItem(LANG_KEY) || 'zh'; } catch (e) { return 'zh'; }
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function applyI18n(data) {
    langData = data;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (data[key] !== undefined) {
        el.innerHTML = data[key];
      }
    });
    // Update html lang attribute
    root.setAttribute('lang', currentLang === 'zh' ? 'zh-CN' : currentLang);
  }

  function loadLang(lang) {
    currentLang = lang;
    setStoredLang(lang);
    fetch('lang/' + lang + '.json?v=' + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        applyI18n(data);
        updateLangModal(lang);
      })
      .catch(function () {
        // If lang file not found, fallback to zh
        if (lang !== 'zh') {
          currentLang = 'zh';
          setStoredLang('zh');
          fetch('lang/zh.json?v=' + Date.now())
            .then(function (res) { return res.json(); })
            .then(applyI18n);
        }
      });
  }

  function updateLangModal(lang) {
    document.querySelectorAll('[data-language-option]').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-language-option');
      if (btnLang === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  // Load language on init (only if not zh, since HTML is already in zh)
  var initLang = getStoredLang();
  if (initLang && initLang !== 'zh') {
    loadLang(initLang);
  }

  // ── Language Modal ────────────────────────────────────────
  var langModal = document.querySelector('[data-language-modal]');

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-language-open]')) {
      closeOverlay(document.querySelector('[data-mobile-drawer]'));
      openOverlay(langModal);
    }
    if (e.target.closest('[data-language-close]')) closeOverlay(langModal);
    if (e.target === langModal) closeOverlay(langModal);
  });

  // ── Language Options ──────────────────────────────────────
  document.addEventListener('click', function (e) {
    var option = e.target.closest('[data-language-option]');
    if (!option) return;
    var lang = option.getAttribute('data-language-option');
    if (!lang || lang === currentLang) {
      closeOverlay(langModal);
      return;
    }
    loadLang(lang);
    closeOverlay(langModal);
  });

  // ── Mobile Drawer ─────────────────────────────────────────
  var mobileDrawer = document.querySelector('[data-mobile-drawer]');

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-mobile-open]')) openOverlay(mobileDrawer);
    if (e.target.closest('[data-mobile-close]')) closeOverlay(mobileDrawer);
    if (e.target === mobileDrawer) closeOverlay(mobileDrawer);
  });

  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeOverlay(mobileDrawer); });
    });
  }

  // ── Keyboard ──────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeOverlay(langModal);
      closeOverlay(mobileDrawer);
    }
  });

  // ── Scroll Reveal ─────────────────────────────────────────
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // ── Contact Form ──────────────────────────────────────────
  var contactForm = document.querySelector('[data-contact-form]');

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var note = contactForm.querySelector('[data-form-note]');
      var formData = new FormData(contactForm);
      var brief = [
        'Project Brief',
        'Name: ' + (formData.get('name') || ''),
        'Company: ' + (formData.get('company') || ''),
        'Email: ' + (formData.get('email') || ''),
        'Service: ' + (formData.get('service') || ''),
        'Message: ' + (formData.get('message') || '')
      ].join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(brief).then(function () {
          if (note) note.textContent = 'Project brief copied. You can paste it into email or your preferred chat channel.';
        }).catch(function () {
          if (note) note.textContent = 'Copy failed in this browser. You can still select the form text manually.';
        });
        return;
      }
      if (note) note.textContent = 'Clipboard is unavailable. You can still select the form text manually.';
    });
  }

  // ── Back to Top ──────────────────────────────────────────
  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backBtn.classList.add('is-visible');
      } else {
        backBtn.classList.remove('is-visible');
      }
    });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Counter Animation ────────────────────────────────────
  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = start + (target - start) * easedProgress;

      if (decimals > 0) {
        el.textContent = current.toFixed(decimals);
      } else {
        el.textContent = Math.floor(current);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (decimals > 0) {
          el.textContent = target.toFixed(decimals);
        } else {
          el.textContent = target;
        }
      }
    }

    requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  // ── Visitor Tracking ────────────────────────────────────
  (function trackVisit() {
    try {
      var page = location.pathname || '/';
      var fd = new FormData();
      fd.append('page', page);
      fetch('/admin/api.php?action=track', { method: 'POST', body: fd });
    } catch (e) {}
  })();

  // ── Chain Block Ticker ─────────────────────────────────
  (function initChainTicker() {
    var ticker = document.getElementById('chainTicker');
    if (!ticker) return;

    var inner = ticker.querySelector('.chain-ticker-inner');
    // Mobile: duplicate items for seamless infinite scroll animation
    if (window.innerWidth <= 768 && inner) {
      inner.innerHTML += inner.innerHTML;
    }

    var CACHE_KEY = 'leo-chain-heights';

    var chains = {
      btc: { rpc: 'https://blockstream.info/api/blocks/tip/height', type: 'rest' },
      eth: { rpc: 'https://ethereum-rpc.publicnode.com', type: 'evm' },
      bsc: { rpc: 'https://bsc-dataseed1.binance.org', type: 'evm' },
      sol: { rpc: 'https://solana-rpc.publicnode.com', type: 'solana' },
      trx: { rpc: 'https://api.trongrid.io/wallet/getnowblock', type: 'tron' },
      arb: { rpc: 'https://arb1.arbitrum.io/rpc', type: 'evm' },
      polygon: { rpc: 'https://polygon-bor-rpc.publicnode.com', type: 'evm' },
      xlayer: { rpc: 'https://rpc.xlayer.tech', type: 'evm' }
    };

    var prevHeights = {};

    function saveCache() {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(prevHeights)); } catch (e) {}
    }

    function loadCache() {
      try {
        var cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          var data = JSON.parse(cached);
          Object.keys(data).forEach(function (key) {
            var h = data[key];
            if (h) {
              prevHeights[key] = h;
              var els = ticker.querySelectorAll('[data-chain-height="' + key + '"]');
              els.forEach(function (el) { el.textContent = h.toLocaleString(); });
            }
          });
        }
      } catch (e) {}
    }

    function highlightItem(key) {
      var items = ticker.querySelectorAll('[data-chain="' + key + '"]');
      items.forEach(function (item) {
        item.classList.add('is-updated');
        setTimeout(function () { item.classList.remove('is-updated'); }, 1500);
      });
    }

    function updateHeight(key, height) {
      var els = ticker.querySelectorAll('[data-chain-height="' + key + '"]');
      if (!els.length) return;
      var h = parseInt(height, 10) || 0;
      var formatted = h.toLocaleString();
      if (prevHeights[key] && prevHeights[key] !== h) {
        highlightItem(key);
      }
      prevHeights[key] = h;
      els.forEach(function (el) { el.textContent = formatted; });
      saveCache();
    }

    function fetchEvm(key, rpc) {
      fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.result) updateHeight(key, parseInt(data.result, 16));
        })
        .catch(function () {});
    }

    function fetchBtc() {
      fetch(chains.btc.rpc)
        .then(function (r) { return r.text(); })
        .then(function (h) { updateHeight('btc', h.trim()); })
        .catch(function () {});
    }

    function fetchSolana() {
      fetch(chains.sol.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot', params: [] })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.result) updateHeight('sol', data.result);
        })
        .catch(function () {});
    }

    function fetchTron() {
      fetch(chains.trx.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.block_header && data.block_header.raw_data) {
            updateHeight('trx', data.block_header.raw_data.number);
          }
        })
        .catch(function () {});
    }

    function fetchAll() {
      fetchBtc();
      fetchEvm('eth', chains.eth.rpc);
      fetchEvm('bsc', chains.bsc.rpc);
      fetchSolana();
      fetchTron();
      fetchEvm('arb', chains.arb.rpc);
      fetchEvm('polygon', chains.polygon.rpc);
      fetchEvm('xlayer', chains.xlayer.rpc);
    }

    loadCache();
    fetchAll();
    setInterval(fetchAll, 3000);
  })();

  // ── Crypto Bubbles ─────────────────────────────────────
  (function initCryptoBubbles() {
    var container = document.getElementById('cryptoBubbles');
    if (!container) return;

    var coins = [
      { symbol: 'BTC', pair: 'BTCUSDT', logo: 'assets/icons/btc.png', size: 'lg' },
      { symbol: 'ETH', pair: 'ETHUSDT', logo: 'assets/icons/eth.png', size: 'lg' },
      { symbol: 'BNB', pair: 'BNBUSDT', logo: 'assets/icons/bnb.png', size: 'md' },
      { symbol: 'SOL', pair: 'SOLUSDT', logo: 'assets/icons/sol.png', size: 'md' },
      { symbol: 'DOGE', pair: 'DOGEUSDT', logo: 'assets/icons/doge.png', size: 'sm' },
      { symbol: 'XRP', pair: 'XRPUSDT', logo: 'assets/icons/xrp.png', size: 'md' },
      { symbol: 'ADA', pair: 'ADAUSDT', logo: 'assets/icons/ada.png', size: 'sm' },
      { symbol: 'AVAX', pair: 'AVAXUSDT', logo: 'assets/icons/avax.png', size: 'md' },
      { symbol: 'DOT', pair: 'DOTUSDT', logo: 'assets/icons/dot.png', size: 'sm' },
      { symbol: 'MATIC', pair: 'MATICUSDT', logo: 'assets/icons/matic.png', size: 'sm' },
      { symbol: 'LINK', pair: 'LINKUSDT', logo: 'assets/icons/link.png', size: 'md' },
      { symbol: 'UNI', pair: 'UNIUSDT', logo: 'assets/icons/uni.png', size: 'sm' },
      { symbol: 'ATOM', pair: 'ATOMUSDT', logo: 'assets/icons/atom.png', size: 'sm' },
      { symbol: 'LTC', pair: 'LTCUSDT', logo: 'assets/icons/ltc.png', size: 'md' },
      { symbol: 'FIL', pair: 'FILUSDT', logo: 'assets/icons/fil.png', size: 'sm' },
      { symbol: 'APT', pair: 'APTUSDT', logo: 'assets/icons/apt.png', size: 'sm' },
      { symbol: 'ARB', pair: 'ARBUSDT', logo: 'assets/icons/arb.png', size: 'md' },
      { symbol: 'OP', pair: 'OPUSDT', logo: 'assets/icons/op.png', size: 'sm' },
      { symbol: 'NEAR', pair: 'NEARUSDT', logo: 'assets/icons/near.png', size: 'sm' },
      { symbol: 'TRX', pair: 'TRXUSDT', logo: 'assets/icons/trx.png', size: 'md' }
    ];

    var positions = [5, 22, 40, 62, 78, 12, 48, 70, 30, 55, 8, 38, 65, 82, 18, 50, 72, 28, 60, 15];
    var durations = [16, 14, 18, 15, 20, 17, 13, 19, 16, 14, 21, 15, 18, 12, 17, 20, 14, 16, 19, 15];
    var delays =    [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 1, 2.5, 5, 7, 8.5, 11, 13, 14.5, 3.5, 6.5];

    container.addEventListener('touchstart', function () {
      container.classList.add('is-touched');
    });
    container.addEventListener('touchend', function () {
      container.classList.remove('is-touched');
    });

    function formatPrice(price) {
      var p = parseFloat(price);
      if (p >= 1000) return '$' + p.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (p >= 1) return '$' + p.toFixed(2);
      return '$' + p.toFixed(4);
    }

    var bubblesCreated = false;

    function createBubbles() {
      coins.forEach(function (coin, i) {
        var bubble = document.createElement('div');
        bubble.className = 'crypto-bubble crypto-bubble--' + coin.size;
        bubble.setAttribute('data-pair', coin.pair);
        bubble.style.left = positions[i] + '%';
        bubble.style.animationDuration = durations[i] + 's';
        bubble.style.animationDelay = delays[i] + 's';
        bubble.style.animationIterationCount = 'infinite';

        bubble.innerHTML =
          '<img class="crypto-bubble-logo" src="' + coin.logo + '" alt="' + coin.symbol + '">' +
          '<span class="crypto-bubble-symbol">' + coin.symbol + '</span>' +
          '<span class="crypto-bubble-price">--</span>' +
          '<span class="crypto-bubble-change">--</span>';

        container.appendChild(bubble);
      });
      bubblesCreated = true;
    }

    function updateBubbles(data) {
      coins.forEach(function (coin) {
        var ticker = data[coin.pair];
        if (!ticker) return;

        var bubble = container.querySelector('[data-pair="' + coin.pair + '"]');
        if (!bubble) return;

        var change = parseFloat(ticker.change);
        var isUp = change >= 0;

        var priceEl = bubble.querySelector('.crypto-bubble-price');
        var changeEl = bubble.querySelector('.crypto-bubble-change');

        priceEl.textContent = formatPrice(ticker.price);
        changeEl.textContent = (isUp ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'crypto-bubble-change ' + (isUp ? 'is-up' : 'is-down');
      });
    }

    function fetchPrices() {
      var symbols = coins.map(function (c) { return '"' + c.pair + '"'; }).join(',');
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=[' + symbols + ']')
        .then(function (r) { return r.json(); })
        .then(function (list) {
          var map = {};
          list.forEach(function (item) {
            map[item.symbol] = { price: item.lastPrice, change: item.priceChangePercent };
          });
          if (!bubblesCreated) createBubbles();
          updateBubbles(map);
        })
        .catch(function () {
          if (!bubblesCreated) createBubbles();
        });
    }

    fetchPrices();
    setInterval(fetchPrices, 30000);
  })();

  // Expose overlay helpers for page-level scripts (e.g. service modal)
  window.openOverlay = openOverlay;
  window.closeOverlay = closeOverlay;

})();
