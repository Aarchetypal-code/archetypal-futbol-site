(function () {
  var STORAGE_KEY = "af_discovered_v1";
  var LAST_KEY = "af_last_discovered";
  var TOTAL = 8;
  var NAMES = {
    lightning: "Lightning",
    immovable: "Immovable",
    inferno: "Inferno",
    refiner: "Refiner",
    director: "Director",
    visionary: "Visionary",
    flow: "Flow",
    avatar: "Avatar",
  };

  var COLORS = {
    lightning: "#22C55E",
    immovable: "#DC2626",
    inferno: "#FACC15",
    refiner: "#F97316",
    director: "#38BDF8",
    visionary: "#A855F7",
    flow: "#7C3AED",
    avatar: "#D4AF37",
  };

  var STATS = {
    lightning: { animal: "Stag", group: "Wild Card", core: "Unity" },
    immovable: { animal: "Elephant", group: "Instinctive", core: "Rootedness" },
    inferno: { animal: "Ram", group: "Instinctive", core: "Passion" },
    refiner: { animal: "Crocodile", group: "Instinctive", core: "Refinement" },
    director: { animal: "Dolphin", group: "Cognitive", core: "Imagination" },
    visionary: { animal: "Owl", group: "Cognitive", core: "Vision" },
    flow: { animal: "Eagle", group: "Cognitive", core: "Flow" },
    avatar: { animal: "All Seven", group: "Emergent", core: "Mastery" },
  };

  function getDiscovered() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function markDiscovered(slug) {
    try {
      var list = getDiscovered();
      if (list.indexOf(slug) === -1) {
        list.push(slug);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        window.sessionStorage.setItem(LAST_KEY, slug);
      }
    } catch (e) {
      /* localStorage unavailable; discovery just won't persist */
    }
  }

  var revealTimers = [];
  var revealHref = null;
  var revealSkipBound = false;

  function clearRevealTimers() {
    revealTimers.forEach(function (id) {
      window.clearTimeout(id);
    });
    revealTimers = [];
  }

  function scheduleReveal(fn, delay) {
    var id = window.setTimeout(fn, delay);
    revealTimers.push(id);
    return id;
  }

  function skipReveal() {
    if (!revealHref) return;
    var href = revealHref;
    revealHref = null;
    clearRevealTimers();
    window.location.href = href;
  }

  function bindRevealSkip(overlay) {
    if (revealSkipBound) return;
    revealSkipBound = true;
    overlay.addEventListener("click", function () {
      skipReveal();
    });
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function playCardReveal(slug, href) {
    var overlay = document.getElementById("revealOverlay");
    var inner = document.getElementById("revealCardInner");
    if (!overlay || !inner || !STATS[slug]) return false;

    var stats = STATS[slug];
    var color = COLORS[slug] || "#d4af37";
    var reduced = prefersReducedMotion();

    var iconEl = document.getElementById("revealIcon");
    var nameEl = document.getElementById("revealName");
    var animalEl = document.getElementById("revealAnimal");
    var groupEl = document.getElementById("revealGroup");
    var coreEl = document.getElementById("revealCore");

    if (iconEl) iconEl.src = "icons/icon-" + slug + ".png";
    if (iconEl) iconEl.alt = NAMES[slug] || "";
    if (nameEl) nameEl.textContent = NAMES[slug] || "";
    if (animalEl) animalEl.textContent = stats.animal;
    if (groupEl) groupEl.textContent = stats.group;
    if (coreEl) coreEl.textContent = stats.core;

    overlay.style.setProperty("--reveal-color", color);

    var statRows = overlay.querySelectorAll(".reveal-stat");
    statRows.forEach(function (row) {
      row.classList.remove("stat-in");
    });
    inner.classList.remove("flipped");
    overlay.classList.remove("show");
    overlay.classList.toggle("no-motion", reduced);
    overlay.hidden = false;

    // force a reflow so the entrance transition reliably (re)plays even if
    // triggered again in the same session
    void overlay.offsetWidth;

    bindRevealSkip(overlay);
    clearRevealTimers();
    revealHref = href;

    if (reduced) {
      // respect prefers-reduced-motion: skip the rise/flip/stagger motion,
      // snap straight to the fully revealed state, hold briefly, then go
      requestAnimationFrame(function () {
        overlay.classList.add("show");
        inner.classList.add("flipped");
        statRows.forEach(function (row) {
          row.classList.add("stat-in");
        });
      });
      scheduleReveal(skipReveal, 2850);
      return true;
    }

    requestAnimationFrame(function () {
      overlay.classList.add("show");
    });

    scheduleReveal(function () {
      inner.classList.add("flipped");
    }, 350);

    scheduleReveal(function () {
      statRows.forEach(function (row, i) {
        scheduleReveal(function () {
          row.classList.add("stat-in");
        }, i * 130);
      });
    }, 950);

    scheduleReveal(skipReveal, 4050);

    return true;
  }

  function initExploreScene() {
    var rawDiscovered = getDiscovered();
    var discovered = rawDiscovered.filter(function (slug) {
      return !!NAMES[slug];
    });
    if (discovered.length !== rawDiscovered.length) {
      // self-heal any stale entries (e.g. "about") from before it was
      // removed from the discovery mechanic
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(discovered));
      } catch (e) {
        /* ignore */
      }
    }

    var foundCount = document.getElementById("foundCount");
    if (foundCount) foundCount.textContent = String(discovered.length);

    discovered.forEach(function (slug) {
      var obj = document.getElementById("obj-" + slug);
      if (obj) obj.classList.add("discovered");
    });

    var hint = document.getElementById("hintBar");
    var lastDiscovered = null;
    try {
      lastDiscovered = window.sessionStorage.getItem(LAST_KEY);
    } catch (e) {
      lastDiscovered = null;
    }

    if (hint) {
      if (lastDiscovered && NAMES[lastDiscovered]) {
        var remaining = TOTAL - discovered.length;
        hint.textContent = remaining > 0
          ? "✦ " + NAMES[lastDiscovered] + " discovered! " + remaining + " more to find…"
          : "✦ All eight discovered.";
        hint.classList.add("found");
        try {
          window.sessionStorage.removeItem(LAST_KEY);
        } catch (e) {
          /* ignore */
        }
      } else if (discovered.length === 0) {
        hint.textContent = "Look around… find the hidden marks to unlock each archetype";
      } else {
        var left = TOTAL - discovered.length;
        hint.textContent = left > 0
          ? left + " archetype" + (left > 1 ? "s" : "") + " left to discover…"
          : "✦ All eight discovered.";
      }
    }

    document.querySelectorAll(".hidden-object[data-slug]").forEach(function (obj) {
      obj.addEventListener("click", function (e) {
        var slug = obj.getAttribute("data-slug");
        var isNew = getDiscovered().indexOf(slug) === -1;
        markDiscovered(slug);
        if (!isNew) return; // already seen: normal instant navigation
        if (playCardReveal(slug, obj.getAttribute("href"))) {
          e.preventDefault();
        }
      });
    });

    var scene = document.querySelector(".explore-scene");
    if (scene) {
      scene.addEventListener("mousemove", function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 2;
        var y = (e.clientY / window.innerHeight - 0.5) * 2;
        document.querySelectorAll(".hidden-object").forEach(function (obj, i) {
          var depth = 0.5 + i * 0.1;
          obj.style.translate = (x * 6 * depth) + "px " + (y * 4 * depth) + "px";
        });
      });
    }
  }

  function initContentPage(slug) {
    markDiscovered(slug);
  }

  window.AFDiscovery = {
    initExploreScene: initExploreScene,
    initContentPage: initContentPage,
  };
})();
