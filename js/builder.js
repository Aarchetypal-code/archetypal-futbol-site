(function () {
  var ORDER = ["immovable", "inferno", "refiner", "lightning", "director", "visionary", "flow", "avatar"];

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

  var slotsLayer, formationPicker;
  var summaryCountEl, summaryStatusEl;
  var activePicker = null;
  var activeSlotNumber = null;

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
        closePicker();
        state.formation = key;
        state.placements = {};
        renderFormationPicker();
        renderSlots();
      });
      formationPicker.appendChild(btn);
    });
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
    slot.classList.remove("filled", "aligned", "off-position");
    slot.style.removeProperty("--slot-color");
    var img = slot.querySelector("img");
    if (img) img.remove();
    var label = slot.querySelector(".slot-fill-label");
    if (label) label.remove();
  }

  function applySlotContent(slot, slug, slotX) {
    clearSlotContent(slot);
    // force a reflow so the glow animation replays even when swapping
    // one archetype for another in an already-filled slot
    void slot.offsetWidth;

    slot.classList.add("filled");

    var img = document.createElement("img");
    img.src = "icons/icon-" + slug + ".png";
    img.alt = NAMES[slug];
    slot.insertBefore(img, slot.firstChild);

    var label = document.createElement("span");
    label.className = "slot-fill-label " + (slotX > 55 ? "label-left" : "label-right");
    label.textContent = NAMES[slug];
    slot.appendChild(label);

    var slotNumber = Number(slot.dataset.number);
    slot.style.setProperty("--slot-color", COLORS[slug]);
    slot.classList.add(isAligned(slug, slotNumber) ? "aligned" : "off-position");
  }

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

  function renderSlots() {
    closePicker();
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
        applySlotContent(slot, placed, slotData.x);
      }

      slot.addEventListener("click", function (e) {
        e.stopPropagation();
        if (activePicker && activeSlotNumber === slotData.n) {
          closePicker();
          return;
        }
        openPicker(slot, slotData.n);
      });
    });

    updateSummary();
  }

  function assignSlot(slotNumber, slug) {
    var slot = slotsLayer.querySelector('.slot[data-number="' + slotNumber + '"]');
    if (!slot) return;
    var slotData = FORMATIONS[state.formation].filter(function (s) { return s.n === slotNumber; })[0];
    state.placements[slotNumber] = slug;
    applySlotContent(slot, slug, slotData ? slotData.x : 50);
    updateSummary();
  }

  function removeSlot(slotNumber) {
    var slot = slotsLayer.querySelector('.slot[data-number="' + slotNumber + '"]');
    delete state.placements[slotNumber];
    if (slot) clearSlotContent(slot);
    updateSummary();
  }

  function closePicker() {
    if (!activePicker) return;
    activePicker.remove();
    activePicker = null;
    activeSlotNumber = null;
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onDocumentKeydown);
  }

  function onDocumentClick(e) {
    if (!activePicker) return;
    if (activePicker.contains(e.target)) return;
    closePicker();
  }

  function onDocumentKeydown(e) {
    if (e.key === "Escape") closePicker();
  }

  function buildPickerRow(slug, index, onSelect) {
    var row = document.createElement("button");
    row.type = "button";
    row.className = "slot-picker-row";
    row.style.animationDelay = (index * 35) + "ms";

    var icon = document.createElement("span");
    icon.className = "slot-picker-row-icon";
    var img = document.createElement("img");
    img.src = "icons/icon-" + slug + ".png";
    img.alt = "";
    icon.appendChild(img);

    var name = document.createElement("span");
    name.className = "slot-picker-row-name";
    name.textContent = NAMES[slug];

    row.appendChild(icon);
    row.appendChild(name);
    row.addEventListener("click", function (e) {
      e.stopPropagation();
      onSelect();
    });
    return row;
  }

  function openPicker(slotEl, slotNumber) {
    closePicker();

    var picker = document.createElement("div");
    picker.className = "slot-picker";

    var header = document.createElement("div");
    header.className = "slot-picker-header";
    var title = document.createElement("span");
    title.textContent = "Position #" + slotNumber;
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "slot-picker-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      closePicker();
    });
    header.appendChild(title);
    header.appendChild(closeBtn);
    picker.appendChild(header);

    var list = document.createElement("div");
    list.className = "slot-picker-list";

    ORDER.forEach(function (slug, i) {
      var row = buildPickerRow(slug, i, function () {
        assignSlot(slotNumber, slug);
        closePicker();
      });
      list.appendChild(row);
    });

    if (state.placements[slotNumber]) {
      var divider = document.createElement("div");
      divider.className = "slot-picker-divider";
      list.appendChild(divider);

      var removeRow = document.createElement("button");
      removeRow.type = "button";
      removeRow.className = "slot-picker-row slot-picker-remove";
      removeRow.style.animationDelay = (ORDER.length * 35) + "ms";
      var removeIcon = document.createElement("span");
      removeIcon.className = "slot-picker-row-icon slot-picker-row-icon-remove";
      removeIcon.innerHTML = "&times;";
      var removeName = document.createElement("span");
      removeName.className = "slot-picker-row-name";
      removeName.textContent = "Remove";
      removeRow.appendChild(removeIcon);
      removeRow.appendChild(removeName);
      removeRow.addEventListener("click", function (e) {
        e.stopPropagation();
        removeSlot(slotNumber);
        closePicker();
      });
      list.appendChild(removeRow);
    }

    picker.appendChild(list);

    // measure off-screen first so we can position it accurately
    picker.style.visibility = "hidden";
    picker.style.top = "0px";
    picker.style.left = "0px";
    document.body.appendChild(picker);

    var slotRect = slotEl.getBoundingClientRect();
    var pickerWidth = Math.min(240, window.innerWidth - 24);
    picker.style.width = pickerWidth + "px";

    var pickerHeight = picker.offsetHeight;
    var spaceBelow = window.innerHeight - slotRect.bottom;
    var spaceAbove = slotRect.top;
    var gap = 10;

    var top;
    if (spaceBelow >= pickerHeight + gap || spaceBelow >= spaceAbove) {
      top = slotRect.bottom + gap;
      top = Math.min(top, window.innerHeight - pickerHeight - 8);
    } else {
      top = slotRect.top - pickerHeight - gap;
    }
    top = Math.max(8, top);

    var left = slotRect.left + slotRect.width / 2 - pickerWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - pickerWidth - 8));

    picker.style.top = top + "px";
    picker.style.left = left + "px";
    picker.style.visibility = "visible";

    activePicker = picker;
    activeSlotNumber = slotNumber;

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);
  }

  function initClearAll() {
    var btn = document.getElementById("clearAllBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      closePicker();
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
    initClearAll();
  });
})();
