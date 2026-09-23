(function () {
  var COLORS = {
    immovable: "#DC2626",
    inferno: "#FACC15",
    refiner: "#F97316",
    lightning: "#22C55E",
    director: "#38BDF8",
    visionary: "#A855F7",
    flow: "#7C3AED",
    avatar: "#D4AF37",
  };

  var NAMES = {
    immovable: "Immovable",
    inferno: "Inferno",
    refiner: "Refiner",
    lightning: "Lightning",
    director: "Director",
    visionary: "Visionary",
    flow: "Flow",
    avatar: "Avatar",
  };

  // Aligned position numbers per archetype, as listed on each archetype's
  // own page. Avatar fits any position (no fixed position).
  //
  // Full backs (#2/#3) are added for Lightning, Inferno, and Director here
  // ONLY -- this is a builder-specific mapping, not part of the aligned
  // positions listed on those archetypes' own pages.
  var ALIGNED = {
    lightning: [6, 8, 10, 2, 3],
    immovable: [1, 5, 6],
    inferno: [9, 10, 7, 2, 3],
    refiner: [10, 11, 7],
    director: [1, 8, 6, 2, 3],
    visionary: [10, 8, 9],
    flow: [6, 10, 9],
    avatar: "any",
  };

  // Mirrored slot pairs: an archetype aligned to one side of a mirrored
  // pair (center-backs 4/5, full-backs 2/3) is treated as aligned to the
  // other side too.
  var MIRROR = { 2: 3, 3: 2, 4: 5, 5: 4 };

  // Each formation lists all 11 numbered slots with a position (x, y) as a
  // percentage of the pitch container, matching the 0-100 x 0-100 svg
  // viewBox stretched non-uniformly to a 2:3 container via preserveAspectRatio="none".
  var FORMATIONS = {
    "1-4-4-2": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 12, y: 76 }, { n: 5, x: 38, y: 78 }, { n: 4, x: 62, y: 78 }, { n: 2, x: 88, y: 76 },
      { n: 11, x: 12, y: 54 }, { n: 6, x: 38, y: 52 }, { n: 8, x: 62, y: 52 }, { n: 7, x: 88, y: 54 },
      { n: 10, x: 36, y: 22 }, { n: 9, x: 64, y: 22 },
    ],
    "1-4-3-3": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 12, y: 76 }, { n: 5, x: 38, y: 78 }, { n: 4, x: 62, y: 78 }, { n: 2, x: 88, y: 76 },
      { n: 6, x: 50, y: 58 }, { n: 8, x: 30, y: 44 }, { n: 10, x: 70, y: 44 },
      { n: 11, x: 15, y: 20 }, { n: 9, x: 50, y: 16 }, { n: 7, x: 85, y: 20 },
    ],
    "1-4-2-3-1": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 12, y: 76 }, { n: 5, x: 38, y: 78 }, { n: 4, x: 62, y: 78 }, { n: 2, x: 88, y: 76 },
      { n: 6, x: 35, y: 58 }, { n: 8, x: 65, y: 58 },
      { n: 11, x: 15, y: 38 }, { n: 10, x: 50, y: 36 }, { n: 7, x: 85, y: 38 },
      { n: 9, x: 50, y: 16 },
    ],
    "1-4-1-4-1": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 12, y: 76 }, { n: 5, x: 38, y: 78 }, { n: 4, x: 62, y: 78 }, { n: 2, x: 88, y: 76 },
      { n: 6, x: 50, y: 60 },
      { n: 11, x: 12, y: 40 }, { n: 8, x: 38, y: 38 }, { n: 10, x: 62, y: 38 }, { n: 7, x: 88, y: 40 },
      { n: 9, x: 50, y: 16 },
    ],
    "1-3-5-2": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 25, y: 78 }, { n: 4, x: 50, y: 80 }, { n: 5, x: 75, y: 78 },
      { n: 11, x: 10, y: 58 }, { n: 6, x: 35, y: 52 }, { n: 10, x: 50, y: 40 }, { n: 8, x: 65, y: 52 }, { n: 2, x: 90, y: 58 },
      { n: 7, x: 38, y: 18 }, { n: 9, x: 62, y: 18 },
    ],
    "1-4-2-2-2": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 12, y: 76 }, { n: 5, x: 38, y: 78 }, { n: 4, x: 62, y: 78 }, { n: 2, x: 88, y: 76 },
      { n: 6, x: 35, y: 58 }, { n: 8, x: 65, y: 58 },
      { n: 10, x: 25, y: 36 }, { n: 7, x: 75, y: 36 },
      { n: 9, x: 38, y: 16 }, { n: 11, x: 62, y: 16 },
    ],
    "1-4-1-2-1-2": [
      { n: 1, x: 50, y: 92 },
      { n: 3, x: 12, y: 76 }, { n: 5, x: 38, y: 78 }, { n: 4, x: 62, y: 78 }, { n: 2, x: 88, y: 76 },
      { n: 6, x: 50, y: 62 },
      { n: 8, x: 30, y: 46 }, { n: 7, x: 70, y: 46 },
      { n: 10, x: 50, y: 30 },
      { n: 9, x: 38, y: 14 }, { n: 11, x: 62, y: 14 },
    ],
  };

  var FORMATION_KEYS = Object.keys(FORMATIONS);

  var state = {
    formation: FORMATION_KEYS[0],
    placements: {}, // slotNumber -> archetype slug
  };

  var slotsLayer, formationPicker, ghostEl, dragArchetype, dragOriginSlot;
  var summaryCountEl, summaryStatusEl;

  function isAligned(slug, slotNumber) {
    var list = ALIGNED[slug];
    if (list === "any") return true;
    if (list.indexOf(slotNumber) !== -1) return true;
    var mirror = MIRROR[slotNumber];
    return mirror !== undefined && list.indexOf(mirror) !== -1;
  }

  function renderFormationPicker() {
    formationPicker.innerHTML = "";
    FORMATION_KEYS.forEach(function (key) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "formation-btn" + (key === state.formation ? " active" : "");
      btn.textContent = key;
      btn.addEventListener("click", function () {
        if (key === state.formation) return;
        state.formation = key;
        state.placements = {};
        renderFormationPicker();
        renderSlots();
      });
      formationPicker.appendChild(btn);
    });
  }

  function renderSlots() {
    slotsLayer.innerHTML = "";
    var slots = FORMATIONS[state.formation];
    slots.forEach(function (slotData) {
      var slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.number = String(slotData.n);
      slot.style.left = slotData.x + "%";
      slot.style.top = slotData.y + "%";

      var badge = document.createElement("span");
      badge.className = "slot-number";
      badge.textContent = "#" + slotData.n;
      slot.appendChild(badge);

      slotsLayer.appendChild(slot);

      var placed = state.placements[slotData.n];
      if (placed) {
        applySlotContent(slot, placed);
      }

      slot.addEventListener("pointerdown", function (e) {
        var current = state.placements[slotData.n];
        if (!current) return;
        e.preventDefault();
        delete state.placements[slotData.n];
        clearSlotContent(slot);
        updateSummary();
        startDrag(current, e, slot);
      });
    });

    updateSummary();
  }

  function updateSummary() {
    if (!summaryCountEl || !summaryStatusEl) return;
    var total = FORMATIONS[state.formation].length;
    var filledNumbers = Object.keys(state.placements);
    var filled = filledNumbers.length;
    var aligned = filledNumbers.reduce(function (count, num) {
      var slug = state.placements[num];
      return count + (isAligned(slug, Number(num)) ? 1 : 0);
    }, 0);

    summaryCountEl.textContent = aligned + " of " + total + " positions aligned";

    if (filled >= total) {
      summaryStatusEl.textContent = "Formation complete, " + aligned + " of " + total + " aligned";
    } else {
      var empty = total - filled;
      summaryStatusEl.textContent = empty + " position" + (empty === 1 ? "" : "s") + " still empty";
    }
  }

  function clearSlotContent(slot) {
    slot.classList.remove("filled", "aligned");
    slot.style.removeProperty("--slot-color");
    var img = slot.querySelector("img");
    if (img) img.remove();
  }

  function applySlotContent(slot, slug) {
    clearSlotContent(slot);
    slot.classList.add("filled");
    var img = document.createElement("img");
    img.src = "icons/icon-" + slug + ".png";
    img.alt = NAMES[slug];
    slot.insertBefore(img, slot.firstChild);

    var slotNumber = Number(slot.dataset.number);
    if (isAligned(slug, slotNumber)) {
      slot.classList.add("aligned");
      slot.style.setProperty("--slot-color", COLORS[slug]);
    }
  }

  function findSlotAtPoint(clientX, clientY) {
    if (ghostEl) ghostEl.style.display = "none";
    var el = document.elementFromPoint(clientX, clientY);
    if (ghostEl) ghostEl.style.display = "";
    if (!el) return null;
    return el.closest(".slot");
  }

  function startDrag(slug, pointerEvent, originSlot) {
    dragArchetype = slug;
    dragOriginSlot = originSlot || null;

    ghostEl = document.createElement("div");
    ghostEl.className = "drag-ghost";
    var img = document.createElement("img");
    img.src = "icons/icon-" + slug + ".png";
    img.alt = "";
    ghostEl.appendChild(img);
    document.body.appendChild(ghostEl);
    positionGhost(pointerEvent.clientX, pointerEvent.clientY);

    document.addEventListener("pointermove", onDragMove);
    document.addEventListener("pointerup", onDragEnd);
    document.addEventListener("pointercancel", onDragEnd);
  }

  function positionGhost(clientX, clientY) {
    if (!ghostEl) return;
    var halfW = ghostEl.offsetWidth / 2;
    var halfH = ghostEl.offsetHeight / 2;
    ghostEl.style.transform = "translate(" + (clientX - halfW) + "px, " + (clientY - halfH) + "px)";
  }

  var hoveredSlot = null;

  function onDragMove(e) {
    positionGhost(e.clientX, e.clientY);
    var slot = findSlotAtPoint(e.clientX, e.clientY);
    if (hoveredSlot && hoveredSlot !== slot) {
      hoveredSlot.classList.remove("drag-over");
    }
    if (slot) {
      slot.classList.add("drag-over");
    }
    hoveredSlot = slot;
  }

  function onDragEnd(e) {
    document.removeEventListener("pointermove", onDragMove);
    document.removeEventListener("pointerup", onDragEnd);
    document.removeEventListener("pointercancel", onDragEnd);

    if (hoveredSlot) hoveredSlot.classList.remove("drag-over");

    var dropSlot = findSlotAtPoint(e.clientX, e.clientY);
    if (dropSlot) {
      var slotNumber = Number(dropSlot.dataset.number);
      state.placements[slotNumber] = dragArchetype;
      applySlotContent(dropSlot, dragArchetype);
    }
    updateSummary();

    if (ghostEl) {
      ghostEl.remove();
      ghostEl = null;
    }
    dragArchetype = null;
    dragOriginSlot = null;
    hoveredSlot = null;
  }

  function initTray() {
    document.querySelectorAll(".tray-item[data-slug]").forEach(function (item) {
      item.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        startDrag(item.getAttribute("data-slug"), e, null);
      });
    });
  }

  function initClearAll() {
    var btn = document.getElementById("clearAllBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      state.placements = {};
      renderSlots();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    slotsLayer = document.getElementById("slotsLayer");
    formationPicker = document.getElementById("formationPicker");
    summaryCountEl = document.getElementById("summaryCount");
    summaryStatusEl = document.getElementById("summaryStatus");
    if (!slotsLayer || !formationPicker) return;

    renderFormationPicker();
    renderSlots();
    initTray();
    initClearAll();
  });
})();
