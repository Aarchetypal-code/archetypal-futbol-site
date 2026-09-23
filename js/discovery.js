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
      obj.addEventListener("click", function () {
        markDiscovered(obj.getAttribute("data-slug"));
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
