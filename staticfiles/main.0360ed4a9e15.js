(() => {
  "use strict";

  const CFG = window.RATEBOARD_CONFIG || {};
  const RATES_URL = CFG.ratesUrl || "/api/rates/";
  const CURRENCIES_URL = CFG.currenciesUrl || "/api/currencies/";
  const POPULAR = ["EUR","GBP","JPY","INR","AUD","CAD","CHF","CNY","AED","SGD"];

  const state = { currencies: {}, from: "USD", to: "INR", amount: 1000 };

  const el = {
    amount: document.getElementById("amountInput"),
    fromFlap: document.getElementById("fromFlap"),
    toFlap: document.getElementById("toFlap"),
    fromCode: document.getElementById("fromCode"),
    toCode: document.getElementById("toCode"),
    fromName: document.getElementById("fromName"),
    toName: document.getElementById("toName"),
    fromList: document.getElementById("fromList"),
    toList: document.getElementById("toList"),
    swapBtn: document.getElementById("swapBtn"),
    resultFlap: document.getElementById("resultFlap"),
    resultSub: document.getElementById("resultSub"),
    lastUpdated: document.getElementById("lastUpdated"),
    statusDot: document.getElementById("statusDot"),
    statusText: document.getElementById("statusText"),
    tickerGrid: document.getElementById("tickerGrid"),
    baseLabel: document.getElementById("baseLabel"),
  };

  function setStatus(mode, text) {
    el.statusDot.className = "w-1.5 h-1.5 rounded-full transition-colors " +
      (mode === "live" ? "bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]"
        : mode === "err" ? "bg-red-400 shadow-[0_0_8px_theme(colors.red.400)]"
        : "bg-slate-600");
    el.statusText.textContent = text;
  }

  const TILE_BASE = "relative bg-tile border border-tileedge rounded-sm flex items-center justify-center font-mono font-bold text-amber overflow-hidden w-[clamp(20px,4.2vw,34px)] h-[clamp(34px,6.5vw,52px)] text-[clamp(16px,3.4vw,28px)]";

  function renderFlap(text) {
    const container = el.resultFlap;
    const chars = text.split("");
    if (container.children.length !== chars.length) {
      container.innerHTML = "";
      chars.forEach(() => {
        const tile = document.createElement("div");
        tile.className = TILE_BASE;
        container.appendChild(tile);
      });
    }
    chars.forEach((ch, i) => {
      const tile = container.children[i];
      tile.className = TILE_BASE + (ch === " " ? " !bg-transparent !border-none w-2.5" : "");
      const prevChar = tile.textContent;
      if (prevChar !== ch) {
        tile.classList.remove("flipping");
        void tile.offsetWidth;
        tile.classList.add("flipping");
        setTimeout(() => { tile.textContent = ch; }, 140);
      }
    });
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "— — —";
    const abs = Math.abs(n);
    const decimals = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function buildList(listEl, onPick) {
    listEl.innerHTML = "";
    Object.keys(state.currencies).sort().forEach((code) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.tabIndex = 0;
      li.className = "px-2.5 py-2 rounded-sm cursor-pointer flex justify-between gap-2.5 text-sm text-paper hover:bg-white/5";
      li.innerHTML = `<span class="font-mono text-amber font-bold">${code}</span><span class="text-slate-400">${state.currencies[code]}</span>`;
      const pick = () => onPick(code);
      li.addEventListener("click", pick);
      li.addEventListener("keydown", (e) => { if (e.key === "Enter") pick(); });
      listEl.appendChild(li);
    });
  }

  function toggleList(listEl, flapBtn) {
    const isHidden = listEl.hasAttribute("hidden");
    closeAllLists();
    if (isHidden) {
      listEl.removeAttribute("hidden");
      flapBtn.setAttribute("aria-expanded", "true");
    }
  }
  function closeAllLists() {
    [el.fromList, el.toList].forEach((l) => l.setAttribute("hidden", ""));
    [el.fromFlap, el.toFlap].forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative")) closeAllLists();
  });

  function setSide(side, code) {
    state[side] = code;
    (side === "from" ? el.fromCode : el.toCode).textContent = code;
    (side === "from" ? el.fromName : el.toName).textContent = state.currencies[code] || "";
    closeAllLists();
    convert();
    loadTicker();
  }

  el.fromFlap.addEventListener("click", (e) => { e.stopPropagation(); toggleList(el.fromList, el.fromFlap); });
  el.toFlap.addEventListener("click", (e) => { e.stopPropagation(); toggleList(el.toList, el.toFlap); });
  el.swapBtn.addEventListener("click", () => {
    const f = state.from, t = state.to;
    setSide("from", t);
    setSide("to", f);
  });

  let debounceTimer;
  el.amount.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 250);
  });

  async function convert() {
    const raw = el.amount.value.replace(/,/g, "");
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount < 0) {
      el.resultSub.textContent = "enter a valid amount";
      return;
    }
    state.amount = amount;

    if (state.from === state.to) {
      renderFlap(formatNumber(amount));
      el.resultSub.textContent = `1 ${state.from} = 1.000000 ${state.to}`;
      return;
    }

    try {
      setStatus("", "fetching rate…");
      const res = await fetch(`${RATES_URL}?amount=${amount || 1}&from=${state.from}&to=${state.to}`);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      const value = data.rates[state.to];
      renderFlap(formatNumber(value));

      const unitRes = await fetch(`${RATES_URL}?amount=1&from=${state.from}&to=${state.to}`);
      const unitData = await unitRes.json();
      const unitRate = unitData.rates[state.to];
      el.resultSub.textContent = `1 ${state.from} = ${formatNumber(unitRate)} ${state.to}`;
      el.lastUpdated.textContent = `Reference date: ${data.date} — European Central Bank`;
      setStatus("live", "feed live");
    } catch (err) {
      setStatus("err", "feed unavailable");
      el.resultSub.textContent = "could not reach exchange rate feed";
    }
  }

  async function loadTicker() {
    el.baseLabel.textContent = state.from;
    const targets = POPULAR.filter((c) => c !== state.from).slice(0, 8);
    el.tickerGrid.innerHTML = `<div class="bg-panel px-4 py-4 text-xs text-slate-400 font-mono">loading…</div>`;

    try {
      const today = new Date();
      const past = new Date(today); past.setDate(past.getDate() - 7);
      const fmt = (d) => d.toISOString().slice(0, 10);

      const [nowRes, pastRes] = await Promise.all([
        fetch(`${RATES_URL}?from=${state.from}&to=${targets.join(",")}`),
        fetch(`${RATES_URL}?from=${state.from}&to=${targets.join(",")}&date=${fmt(past)}`),
      ]);
      const now = await nowRes.json();
      const past7 = pastRes.ok ? await pastRes.json() : { rates: {} };

      el.tickerGrid.innerHTML = "";
      targets.forEach((code) => {
        const rate = now.rates ? now.rates[code] : undefined;
        if (rate === undefined) return;
        const oldRate = past7.rates ? past7.rates[code] : undefined;
        let changeHtml = `<span class="font-mono text-xs font-semibold text-slate-400">—</span>`;
        if (oldRate) {
          const pct = ((rate - oldRate) / oldRate) * 100;
          const dir = pct > 0.01 ? "up" : pct < -0.01 ? "down" : "flat";
          const colorClass = dir === "up" ? "text-emerald-400" : dir === "down" ? "text-red-400" : "text-slate-400";
          const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "◆";
          changeHtml = `<span class="font-mono text-xs font-semibold ${colorClass}">${arrow} ${Math.abs(pct).toFixed(2)}%</span>`;
        }
        const row = document.createElement("div");
        row.className = "bg-panel px-4 md:px-5 py-4 flex flex-col gap-1.5";
        row.innerHTML = `
          <span class="font-mono text-xs text-slate-400 tracking-wide">${state.from} / ${code}</span>
          <div class="flex items-baseline gap-2">
            <span class="font-mono text-xl font-bold text-paper">${formatNumber(rate)}</span>
            ${changeHtml}
          </div>`;
        el.tickerGrid.appendChild(row);
      });
    } catch (err) {
      el.tickerGrid.innerHTML = `<div class="bg-panel px-4 py-4 text-xs text-slate-400 font-mono">Board unavailable — check connection</div>`;
    }
  }

  async function init() {
    setStatus("", "connecting to feed…");
    try {
      const res = await fetch(CURRENCIES_URL);
      state.currencies = await res.json();
    } catch (err) {
      setStatus("err", "could not load currency list");
      state.currencies = { USD: "US Dollar", EUR: "Euro", GBP: "British Pound", INR: "Indian Rupee" };
    }

    el.fromName.textContent = state.currencies[state.from] || "";
    el.toName.textContent = state.currencies[state.to] || "";
    buildList(el.fromList, (code) => setSide("from", code));
    buildList(el.toList, (code) => setSide("to", code));

    await convert();
    await loadTicker();
  }

  init();
})();