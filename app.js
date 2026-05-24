const state = {
  rows: [],
  filtered: [],
  selected: null,
  category: "",
  service: "",
  area: "",
  confidence: "",
  availableToday: false,
  map: null,
  mapLayer: null,
  serviceCircle: null,
  markers: new Map(),
  categoriesExpanded: false,
};

const tourState = {
  active: false,
  index: 0,
  highlighted: null,
  placementTimer: null,
};

const imageByCategory = {
  Plumbing: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80",
  HVAC: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  Electrical: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80",
  "General Contractor": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  Excavation: "https://images.unsplash.com/photo-1581093458791-9d42cc0f87bf?auto=format&fit=crop&w=900&q=80",
  Roofing: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  Landscaping: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
  "Tree Service": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
  "Pest Control": "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&w=900&q=80",
  "Waste Removal": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
  "Farm Equipment": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
  "Building Supplies": "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=900&q=80",
  default: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
};

const iconByCategory = {
  "All Services": "layout-grid",
  Plumbing: "wrench",
  HVAC: "fan",
  Electrical: "zap",
  "General Contractor": "hammer",
  Excavation: "construction",
  Roofing: "home",
  Septic: "droplets",
  Landscaping: "trees",
  "Snow Removal": "cloud-snow",
  "Tree Service": "tree-pine",
  "Pest Control": "bug",
  "Waste Removal": "trash-2",
  "Farm Equipment": "tractor",
  "Building Supplies": "package",
  Logistics: "truck",
  Drilling: "drill",
  Concrete: "brick-wall",
  "Home Repair": "house-plus",
  "Pressure Washing": "waves",
  Painting: "paint-roller",
  Millwright: "settings",
  Installation: "panel-top",
  "Outdoor Power Equipment": "tractor",
  Towing: "car",
  default: "briefcase-business",
};

const popularCategoryLimit = 11;

const popularTradeCategories = [
  "General Contractor",
  "Electrical",
  "Plumbing",
  "Roofing",
  "HVAC",
  "Excavation",
  "Landscaping",
  "Snow Removal",
  "Septic",
  "Tree Service",
  "Home Repair",
  "Pest Control",
];

const preferredCategories = [
  "Farm Equipment",
  "General Contractor",
  "Electrical",
  "Building Supplies",
  "Logistics",
  "Tree Service",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Septic",
  "Excavation",
  "Snow Removal",
  "HVAC",
  "Landscaping",
  "General Contractor",
  "Tree Service",
  "Pest Control",
  "Waste Removal",
];

const southDundasAreas = [
  "Morrisburg",
  "Iroquois",
  "Williamsburg",
  "Brinston",
  "Matilda",
  "Riverside Heights",
  "Dixons Corners",
];

const townCenters = {
  "South Dundas": { lat: 44.9104, lng: -75.2139 },
  Morrisburg: { lat: 44.8997, lng: -75.1857 },
  Iroquois: { lat: 44.8497, lng: -75.3167 },
  Williamsburg: { lat: 44.9722, lng: -75.2447 },
  Brinston: { lat: 44.8736, lng: -75.3586 },
  Matilda: { lat: 44.8759, lng: -75.2931 },
  "Riverside Heights": { lat: 44.9288, lng: -75.1398 },
  "Dixons Corners": { lat: 44.8679, lng: -75.2576 },
};

const tourSteps = [
  {
    selector: ".search-panel",
    title: "Start With A Job",
    body: "Search by service and area so residents can answer the real rural question: who can help me here?",
  },
  {
    selector: "#categoryGrid",
    title: "Popular Services",
    body: "These shortcuts make common needs fast: plumbing, electrical, roofing, septic, snow removal, HVAC, and more.",
  },
  {
    selector: ".map-card",
    title: "Real Map View",
    body: "The map now uses live tiles, clustered markers, popups, and service-radius circles instead of a mock graphic.",
  },
  {
    selector: ".results-panel",
    title: "Searchable Directory",
    body: "The result list is powered by the seed CSV, and it stays in sync with filters and map markers.",
  },
  {
    selector: ".profile-section",
    title: "Contractor Profiles",
    body: "Each profile shows category, service area, contact details, trust signals, recommendations, and local job activity.",
  },
  {
    selector: ".profile-section [data-open-quote]",
    title: "Quote Requests",
    body: "Residents can start a request from a profile, which becomes the future lead-generation path for paid members.",
  },
  {
    selector: ".profile-section [data-claim-link]",
    title: "Claim Listings",
    body: "Businesses can claim a public listing, verify ownership, correct details, and later manage service areas and visibility.",
  },
  {
    selector: "#reviews",
    title: "Local Reviews",
    body: "This is the trust layer: recommendations from nearby residents, not just generic star ratings.",
  },
  {
    selector: "#pros",
    title: "Contractor Dashboard",
    body: "The pro view previews the membership value: leads, profile views, response rate, reviews, and profile strength.",
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

init();

async function init() {
  wireEvents();
  initIcons();

  try {
    const response = await fetch("./south-dundas-seed-listings.csv");
    const csv = await response.text();
    state.rows = enrichRows(parseCsv(csv));
  } catch (error) {
    console.error("Could not load seed listings", error);
    state.rows = [];
  }

  initMap();
  applyFilters();
  restoreHashPosition();
  initIcons();
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (field || row.length) {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
      if (char === "\r" && next === "\n") i += 1;
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((line) => line.some(Boolean))
    .map((line) => Object.fromEntries(headers.map((header, index) => [header, line[index] || ""])));
}

function enrichRows(rows) {
  return rows.map((row, index) => {
    const primary = normalizePrimaryCategory(row.primary_category, row.secondary_categories);
    const seed = hashString(row.name);
    const rating = (4.6 + (seed % 5) / 10).toFixed(1);
    const recommendations = 12 + (seed % 118);
    const replies = 12 + (seed % 47);
    const jobs = 18 + (seed % 126);
    const sourceVerified = row.confidence === "High";
    const claimed = false;
    const localTown = row.town || "South Dundas";
    const areas = serviceAreasFor(localTown);
    const isLocal = localTown.match(/Morrisburg|Iroquois|Williamsburg|Brinston|Matilda|Riverside Heights|Dixons Corners/i);
    const serviceRadiusKm = isLocal ? 30 : 55;
    const geo = geoForRow(row, localTown, seed, index, isLocal);

    return {
      ...row,
      id: `${slugify(row.name)}-${index}`,
      displayCategory: primary,
      tags: buildTags(row, primary),
      image: imageByCategory[primary] || imageByCategory.default,
      rating,
      recommendations,
      replies,
      jobs,
      claimed,
      sourceVerified,
      availableToday: seed % 3 !== 0,
      distance: isLocal ? "0-30 km" : "Serves region",
      serviceAreas: areas,
      serviceText: areas.slice(0, 4).join(", "),
      serviceRadiusKm,
      latitude: geo.lat,
      longitude: geo.lng,
      locationPrecision: geo.precision,
      mapLabel: geo.label,
      publishExactLocation: false,
    };
  });
}

function normalizePrimaryCategory(primary, secondary) {
  const haystack = `${primary} ${secondary}`.toLowerCase();
  if (haystack.includes("snow")) return "Snow Removal";
  if (haystack.includes("septic")) return "Excavation";
  if (haystack.includes("roof")) return "Roofing";
  if (haystack.includes("plumb")) return "Plumbing";
  if (haystack.includes("electric")) return "Electrical";
  if (haystack.includes("hvac") || haystack.includes("heating") || haystack.includes("cooling")) return "HVAC";
  if (haystack.includes("tree")) return "Tree Service";
  if (haystack.includes("pest")) return "Pest Control";
  if (haystack.includes("waste") || haystack.includes("junk")) return "Waste Removal";
  if (haystack.includes("lawn") || haystack.includes("landscap")) return "Landscaping";
  if (haystack.includes("farm") || haystack.includes("agri")) return "Farm Equipment";
  if (haystack.includes("building supplies") || haystack.includes("home improvement")) return "Building Supplies";
  return primary || "General Contractor";
}

function buildTags(row, primary) {
  const raw = [primary]
    .concat((row.secondary_categories || "").split(";"))
    .concat(row.confidence === "High" ? ["Verified source"] : ["Needs verification"]);

  return raw
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, 5);
}

function serviceAreasFor(town) {
  const cleanTown = town || "";
  if (cleanTown.match(/Morrisburg|Iroquois|Williamsburg|Brinston/i)) {
    return southDundasAreas;
  }
  return ["South Dundas", "Morrisburg", "Iroquois", "Williamsburg", cleanTown].filter(Boolean);
}

function geoForRow(row, town, seed, index, isLocal) {
  const base = isLocal ? townCenterFor(town) : townCenters["South Dundas"];
  const jitter = jitterFor(seed, index);

  return {
    lat: base.lat + jitter.lat,
    lng: base.lng + jitter.lng,
    precision: isLocal ? "Approximate town pin" : "Regional coverage marker",
    label: isLocal
      ? `Approximate ${town || "South Dundas"} location`
      : `${row.town || "Regional"} provider serving South Dundas`,
  };
}

function townCenterFor(town) {
  const cleanTown = town || "South Dundas";
  const direct = townCenters[cleanTown];
  if (direct) return direct;

  const match = Object.entries(townCenters).find(([name]) => cleanTown.toLowerCase().includes(name.toLowerCase()));
  return match ? match[1] : townCenters["South Dundas"];
}

function jitterFor(seed, index) {
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = 0.006 + ((index % 7) * 0.0022);

  return {
    lat: Math.sin(angle) * radius,
    lng: Math.cos(angle) * radius * 1.25,
  };
}

function renderCategories() {
  const grid = $("#categoryGrid");
  const counts = state.rows.reduce((acc, row) => {
    acc[row.displayCategory] = (acc[row.displayCategory] || 0) + 1;
    return acc;
  }, {});
  const rankedNames = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const popularNames = [
    ...popularTradeCategories.filter((category) => counts[category]),
    ...rankedNames.filter((category) => !popularTradeCategories.includes(category)),
  ].filter((category, index, arr) => arr.indexOf(category) === index);
  let visibleNames = state.categoriesExpanded
    ? rankedNames
    : popularNames.slice(0, popularCategoryLimit);
  if (!state.categoriesExpanded && state.category && counts[state.category] && !visibleNames.includes(state.category)) {
    visibleNames = visibleNames.concat(state.category);
  }
  const hiddenCount = Math.max(0, rankedNames.length - visibleNames.length);
  const categories = visibleNames.map((name) => ({ name, count: counts[name], filter: name }));

  $("#categoryCoverage").textContent = `${state.rows.length} profiles across ${Object.keys(counts).length} categories`;
  $("[data-toggle-categories]").textContent = state.categoriesExpanded
    ? "Show popular"
    : `See all ${Object.keys(counts).length} categories`;
  $("[data-toggle-categories]").setAttribute("aria-expanded", String(state.categoriesExpanded));

  grid.innerHTML = categories
    .map((category) => {
      const icon = iconByCategory[category.name] || iconByCategory.default;
      const active = category.filter === state.category ? " active" : "";
      const label = category.name === "All Services"
        ? `${category.count} total profiles`
        : `${category.count} ${category.count === 1 ? "profile" : "profiles"}`;
      return `
        <button class="category-card${active}" type="button" data-category="${escapeHtml(category.filter)}">
          <span class="category-icon"><i data-lucide="${icon}"></i></span>
          <strong>${escapeHtml(category.name)}</strong>
          <span>${label}</span>
        </button>
      `;
    })
    .join("") + (!state.categoriesExpanded && hiddenCount
      ? `
        <button class="category-card category-card-more" type="button" data-toggle-categories aria-expanded="false">
          <span class="category-icon"><i data-lucide="plus"></i></span>
          <strong>More Categories</strong>
          <span>${hiddenCount} more service areas</span>
        </button>
      `
      : "");

  initIcons();
}

function applyFilters() {
  const searchText = state.service.trim().toLowerCase();
  const areaText = state.area.trim().toLowerCase();
  const categoryText = state.category.trim().toLowerCase();

  state.filtered = state.rows.filter((row) => {
    const haystack = [
      row.name,
      row.primary_category,
      row.secondary_categories,
      row.town,
      row.notes,
      row.displayCategory,
      row.serviceAreas.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const serviceMatch = !searchText || haystack.includes(searchText);
    const categoryMatch = !categoryText || haystack.includes(categoryText) || row.displayCategory.toLowerCase() === categoryText;
    const areaMatch = !areaText || haystack.includes(areaText);
    const confidenceMatch = !state.confidence || row.confidence === state.confidence;
    const availabilityMatch = !state.availableToday || row.availableToday;

    return serviceMatch && categoryMatch && areaMatch && confidenceMatch && availabilityMatch;
  });

  if (!state.filtered.length && (state.service || state.category)) {
    state.filtered = state.rows.filter((row) => {
      if (!state.area) return true;
      return row.serviceAreas.join(" ").toLowerCase().includes(areaText);
    });
  }

  syncSelectedWithFilter();
  renderResults();
  renderCategories();
  updateSummary();
  updateMap();
}

function syncSelectedWithFilter() {
  if (!state.filtered.length) return;
  const selectedStillVisible = state.filtered.some((row) => row.id === state.selected?.id);
  if (!selectedStillVisible) {
    state.selected = state.filtered[0];
    updateProfile(state.selected);
  }
}

function renderResults() {
  const list = $("#resultsList");
  const selectedId = state.selected?.id;
  $("#resultCount").textContent = `${state.filtered.length} contractors`;

  list.innerHTML = state.filtered
    .map((row) => `
      <button class="listing-card${row.id === selectedId ? " active" : ""}" type="button" data-listing-id="${row.id}">
        <span class="listing-thumb">
          <img src="${row.image}" alt="" loading="lazy" />
          <span class="status-badge">${row.availableToday ? "Available Today" : "Taking Requests"}</span>
        </span>
        <span class="listing-body">
          <span class="listing-head">
            <strong>${escapeHtml(row.name)}</strong>
            ${row.sourceVerified ? '<span class="verified-dot"><i data-lucide="check"></i></span>' : ""}
          </span>
          <span class="listing-meta">
            <span><i data-lucide="star"></i>${row.rating} (${row.recommendations})</span>
            <span><i data-lucide="clock"></i>Replies in ${row.replies} min</span>
          </span>
          <span class="listing-category">${escapeHtml(row.displayCategory)}</span>
          <span class="listing-foot">
            <span><i data-lucide="map-pin"></i>${escapeHtml(row.town || "South Dundas")}</span>
            <span><i data-lucide="badge-check"></i>${row.sourceVerified ? "Verified source" : "Needs source check"}</span>
          </span>
        </span>
      </button>
    `)
    .join("");

  initIcons();
}

function selectListing(row) {
  if (!row) return;
  state.selected = row;
  updateProfile(row);
  renderResults();
  focusMapOn(row);
  initIcons();
}

function updateProfile(row) {
  if (!row) return;
  $("#profileImage").src = row.image;
  $("#profileImage").alt = `${row.name} project image`;
  $("#profileTitle").textContent = row.name;
  $("#profileSubtitle").textContent = `${row.displayCategory} serving ${row.serviceText}`;
  $("#profileRating").textContent = row.rating;
  $("#profileResponse").textContent = `${row.replies} min`;
  $("#profileDistance").textContent = row.distance;
  $("#profilePhone").textContent = row.phone || "Phone not yet verified";
  $("#profileAreas").textContent = `Serves ${row.serviceText}`;
  $("#profileClaim").textContent = row.sourceVerified ? "Verified public source - unclaimed profile" : "Unclaimed public listing";
  $("#profileJobs").textContent = `Completed ${row.jobs} local jobs nearby`;
  $("#verifiedPill").style.display = row.sourceVerified ? "inline-flex" : "none";
  $("#verifiedPill").innerHTML = '<i data-lucide="badge-check"></i> Verified Source';
  $("#messageButton").href = row.phone ? `tel:${row.phone.replace(/[^0-9+]/g, "")}` : "#";

  $("#profileTags").innerHTML = row.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function updateSummary() {
  const total = state.filtered.length || state.rows.length;
  const area = state.area || "South Dundas";
  const service = state.category || state.service || "service";
  $("#mapSummary").textContent = `${total} ${service.toLowerCase()} profiles near ${area}`;
  $("#mapFootnote").textContent = state.selected
    ? `${state.selected.locationPrecision}. Selected radius: ${state.selected.serviceRadiusKm} km.`
    : "Approximate pins until listings are claimed. Circle shows selected service radius.";
}

function initMap() {
  if (!window.L || !$("#directoryMap")) return;

  state.map = window.L.map("directoryMap", {
    center: [townCenters["South Dundas"].lat, townCenters["South Dundas"].lng],
    zoom: 11,
    scrollWheelZoom: false,
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(state.map);

  state.mapLayer = window.L.markerClusterGroup
    ? window.L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 44,
      }).addTo(state.map)
    : window.L.layerGroup().addTo(state.map);
}

function updateMap() {
  if (!state.map || !state.mapLayer) return;

  state.mapLayer.clearLayers();
  state.markers.clear();

  const bounds = [];
  state.filtered.forEach((row) => {
    const marker = window.L.marker([row.latitude, row.longitude], {
      icon: makeMarkerIcon(row, row.id === state.selected?.id),
      title: row.name,
    });

    marker.bindPopup(`
      <div class="map-popup">
        <strong>${escapeHtml(row.name)}</strong>
        <span>${escapeHtml(row.displayCategory)} · ${escapeHtml(row.town || "South Dundas")}</span>
        <em>${escapeHtml(row.mapLabel)}</em>
      </div>
    `);

    marker.on("click", () => {
      selectListing(row);
    });

    marker.addTo(state.mapLayer);
    state.markers.set(row.id, marker);
    bounds.push([row.latitude, row.longitude]);
  });

  if (bounds.length > 1) {
    state.map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
  } else if (bounds.length === 1) {
    state.map.setView(bounds[0], 12);
  } else {
    state.map.setView([townCenters["South Dundas"].lat, townCenters["South Dundas"].lng], 11);
  }

  drawServiceCircle(state.selected);
  setTimeout(() => state.map.invalidateSize(), 80);
}

function focusMapOn(row) {
  if (!state.map || !row) return;

  drawServiceCircle(row);
  updateMarkerIcons();

  const marker = state.markers.get(row.id);
  if (marker) {
    state.map.setView([row.latitude, row.longitude], Math.max(state.map.getZoom(), 11), { animate: true });
    if (state.mapLayer.zoomToShowLayer) {
      state.mapLayer.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      marker.openPopup();
    }
  }
}

function drawServiceCircle(row) {
  if (!state.map) return;

  if (state.serviceCircle) {
    state.map.removeLayer(state.serviceCircle);
    state.serviceCircle = null;
  }

  if (!row) return;

  state.serviceCircle = window.L.circle([row.latitude, row.longitude], {
    radius: row.serviceRadiusKm * 1000,
    color: "#137a46",
    weight: 2,
    fillColor: "#137a46",
    fillOpacity: 0.09,
  }).addTo(state.map);
}

function updateMarkerIcons() {
  state.markers.forEach((marker, id) => {
    const row = state.rows.find((item) => item.id === id);
    if (row) marker.setIcon(makeMarkerIcon(row, id === state.selected?.id));
  });
}

function makeMarkerIcon(row, selected = false) {
  const initials = categoryInitials(row.displayCategory);
  return window.L.divIcon({
    className: "",
    html: `<span class="trade-marker${selected ? " selected" : ""}">${escapeHtml(initials)}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

function categoryInitials(category) {
  const words = String(category || "LT").split(/\s+/).filter(Boolean);
  if (category === "Electrical") return "E";
  if (category === "Plumbing") return "P";
  if (category === "Roofing") return "R";
  if (category === "HVAC") return "H";
  if (category === "Excavation") return "X";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function wireEvents() {
  $("#heroSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    state.service = $("#serviceSearch").value;
    state.area = $("#areaSearch").value;
    $("#filterService").value = state.service;
    $("#filterArea").value = state.area;
    state.category = "";
    applyFilters();
    setDirectoryView("list");
    scrollToResults();
  });

  $("#filterService").addEventListener("input", (event) => {
    state.service = event.target.value;
    applyFilters();
  });

  $("#filterArea").addEventListener("change", (event) => {
    state.area = event.target.value;
    applyFilters();
  });

  $("#filterType").addEventListener("change", (event) => {
    state.confidence = event.target.value;
    applyFilters();
  });

  $("#openToday").addEventListener("change", (event) => {
    state.availableToday = event.target.checked;
    applyFilters();
  });

  document.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-category]");
    const listingButton = event.target.closest("[data-listing-id]");
    const quoteButton = event.target.closest("[data-open-quote]");
    const claimButton = event.target.closest("[data-claim-link]");
    const clearButton = event.target.closest("[data-clear-filters]");
    const categoryToggleButton = event.target.closest("[data-toggle-categories]");
    const filterButton = event.target.closest("[data-filter-button]");
    const dashboardButton = event.target.closest("[data-dashboard-link]");
    const viewButton = event.target.closest("[data-view]");
    const tourStartButton = event.target.closest("[data-tour-start]");
    const tourNextButton = event.target.closest("[data-tour-next]");
    const tourPrevButton = event.target.closest("[data-tour-prev]");
    const tourCloseButton = event.target.closest("[data-tour-close]");

    if (categoryButton) {
      state.category = categoryButton.dataset.category === state.category ? "" : categoryButton.dataset.category;
      state.service = "";
      $("#filterService").value = "";
      applyFilters();
      setDirectoryView("list");
      scrollToResults();
    }

    if (listingButton) {
      const row = state.rows.find((item) => item.id === listingButton.dataset.listingId);
      selectListing(row);
      if (window.innerWidth < 760) $("#profile").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (quoteButton) {
      $("#quoteDialog").showModal();
      initIcons();
    }

    if (claimButton) {
      $("#claimDialog").showModal();
      initIcons();
    }

    if (clearButton) {
      state.category = "";
      state.service = "";
      state.area = "";
      state.confidence = "";
      state.availableToday = false;
      $("#serviceSearch").value = "";
      $("#areaSearch").value = "";
      $("#filterService").value = "";
      $("#filterArea").value = "";
      $("#filterType").value = "";
      $("#openToday").checked = false;
      applyFilters();
    }

    if (categoryToggleButton) {
      state.categoriesExpanded = !state.categoriesExpanded;
      renderCategories();
    }

    if (filterButton) {
      $("#filtersPanel").classList.toggle("open");
    }

    if (dashboardButton) {
      $("#pros").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (viewButton) {
      setDirectoryView(viewButton.dataset.view);
      const target = viewButton.dataset.view === "map" ? ".map-panel" : ".results-panel";
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (state.map) setTimeout(() => state.map.invalidateSize(), 240);
    }

    if (tourStartButton) {
      startTour();
    }

    if (tourNextButton) {
      nextTourStep();
    }

    if (tourPrevButton) {
      previousTourStep();
    }

    if (tourCloseButton) {
      endTour();
    }
  });

  window.addEventListener("resize", () => {
    if (tourState.active) positionTourCard();
    if (state.map) state.map.invalidateSize();
  });

  window.addEventListener("keydown", (event) => {
    if (!tourState.active) return;
    if (event.key === "Escape") endTour();
    if (event.key === "ArrowRight") nextTourStep();
    if (event.key === "ArrowLeft") previousTourStep();
  });
}

function setDirectoryView(view) {
  $$("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
}

function scrollToResults() {
  const target = window.innerWidth < 760 ? ".results-panel" : "#directory";
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function restoreHashPosition() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  setTimeout(() => {
    target.scrollIntoView({ behavior: "auto", block: "start" });
    if (state.map) state.map.invalidateSize();
  }, 250);
}

function startTour() {
  closeOpenDialogs();
  tourState.active = true;
  tourState.index = 0;
  document.body.classList.add("tour-active");
  showTourStep();
}

function nextTourStep() {
  if (!tourState.active) return;
  if (tourState.index >= tourSteps.length - 1) {
    endTour();
    return;
  }

  tourState.index += 1;
  showTourStep();
}

function previousTourStep() {
  if (!tourState.active || tourState.index === 0) return;
  tourState.index -= 1;
  showTourStep();
}

function showTourStep() {
  const step = tourSteps[tourState.index];
  const target = document.querySelector(step.selector);
  const card = $("#tourCard");
  const scrim = $("#tourScrim");

  clearTourHighlight();

  if (!target || !card || !scrim) {
    nextTourStep();
    return;
  }

  $("#tourStepLabel").textContent = `Step ${tourState.index + 1} of ${tourSteps.length}`;
  $("#tourTitle").textContent = step.title;
  $("#tourBody").textContent = step.body;
  $('[data-tour-prev]').disabled = tourState.index === 0;
  $('[data-tour-next]').innerHTML =
    tourState.index === tourSteps.length - 1
      ? 'Done <i data-lucide="check"></i>'
      : 'Next <i data-lucide="arrow-right"></i>';

  scrim.hidden = false;
  card.hidden = false;
  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

  window.clearTimeout(tourState.placementTimer);
  tourState.placementTimer = window.setTimeout(() => {
    tourState.highlighted = target;
    target.classList.add("tour-highlight");
    positionTourCard(target);
    if (state.map) state.map.invalidateSize();
    initIcons();
  }, 420);
}

function positionTourCard(target = tourState.highlighted) {
  const card = $("#tourCard");
  if (!card || !target || card.hidden) return;

  if (window.innerWidth <= 760) {
    card.style.left = "";
    card.style.top = "";
    return;
  }

  const rect = target.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const margin = 16;
  const left = clamp(rect.left + rect.width / 2 - cardRect.width / 2, margin, window.innerWidth - cardRect.width - margin);
  const below = rect.bottom + margin;
  const above = rect.top - cardRect.height - margin;
  const top = below + cardRect.height < window.innerHeight ? below : Math.max(margin, above);

  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
}

function endTour() {
  window.clearTimeout(tourState.placementTimer);
  tourState.active = false;
  document.body.classList.remove("tour-active");
  clearTourHighlight();
  $("#tourScrim").hidden = true;
  $("#tourCard").hidden = true;
}

function clearTourHighlight() {
  if (tourState.highlighted) {
    tourState.highlighted.classList.remove("tour-highlight");
    tourState.highlighted = null;
  }
}

function closeOpenDialogs() {
  $$("dialog[open]").forEach((dialog) => dialog.close());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashString(value) {
  return String(value || "").split("").reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
}
