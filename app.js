const state = {
  rows: [],
  filtered: [],
  selected: null,
  category: "",
  service: "",
  region: "",
  town: "",
  confidence: "",
  availableToday: false,
  map: null,
  mapLayer: null,
  serviceCircle: null,
  markers: new Map(),
  categoriesExpanded: false,
};

const imagePoolsByCategory = {
  Plumbing: [
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  ],
  HVAC: [
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1581092919535-7146ff1a590b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1581093450021-4a7360e9a7f8?auto=format&fit=crop&w=900&q=80",
  ],
  Electrical: [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1741388222137-c0d3007ec173?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=900&q=80",
  ],
  "General Contractor": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  ],
  Excavation: [
    "https://images.unsplash.com/photo-1581093458791-9d42cc0f87bf?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1592993180300-974cd5c9760c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=900&q=80",
  ],
  Roofing: [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
  ],
  Landscaping: [
    "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  ],
  "Snow Removal": [
    "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?auto=format&fit=crop&w=900&q=80",
  ],
  "Tree Service": [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=80",
  ],
  "Pest Control": [
    "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
  ],
  "Waste Removal": [
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80",
  ],
  "Farm Equipment": [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=900&q=80",
  ],
  "Building Supplies": [
    "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  ],
};

const iconByCategory = {
  "All Services": "layout-grid",
  Plumbing: "wrench",
  HVAC: "fan",
  Electrical: "zap",
  "General Contractor": "hard-hat",
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

const searchKeywordMap = {
  ac: ["HVAC"],
  "air conditioner": ["HVAC"],
  "air conditioning": ["HVAC"],
  "appliance hookup": ["Electrical", "Plumbing"],
  basement: ["Plumbing", "General Contractor", "Home Repair"],
  bathroom: ["Plumbing", "General Contractor", "Home Repair"],
  breaker: ["Electrical"],
  build: ["General Contractor", "Home Repair"],
  carpenter: ["General Contractor", "Home Repair"],
  carpentry: ["General Contractor", "Home Repair"],
  ceiling: ["Home Repair", "General Contractor"],
  concrete: ["Concrete", "General Contractor", "Excavation"],
  contractor: ["General Contractor"],
  deck: ["General Contractor", "Home Repair", "Landscaping"],
  demolition: ["Excavation", "Waste Removal", "General Contractor"],
  driveway: ["Excavation", "Landscaping", "Snow Removal"],
  drywall: ["Home Repair", "General Contractor", "Painting"],
  duct: ["HVAC"],
  eavestrough: ["Roofing", "Home Repair"],
  electrical: ["Electrical"],
  electrician: ["Electrical"],
  emergency: ["Plumbing", "Electrical", "HVAC", "Roofing", "Tree Service"],
  excavation: ["Excavation"],
  excavator: ["Excavation"],
  farm: ["Farm Equipment", "Building Supplies"],
  fence: ["General Contractor", "Landscaping", "Home Repair"],
  fencing: ["General Contractor", "Landscaping", "Home Repair"],
  furnace: ["HVAC"],
  garage: ["General Contractor", "Home Repair", "Electrical"],
  generator: ["Electrical", "Outdoor Power Equipment"],
  grading: ["Excavation", "Landscaping"],
  gravel: ["Excavation", "Building Supplies", "Landscaping"],
  gutter: ["Roofing", "Home Repair"],
  gutters: ["Roofing", "Home Repair"],
  handyman: ["Home Repair", "General Contractor"],
  heat: ["HVAC"],
  heating: ["HVAC"],
  insulation: ["General Contractor", "Home Repair", "HVAC"],
  kitchen: ["General Contractor", "Plumbing", "Electrical"],
  lawn: ["Landscaping"],
  leak: ["Plumbing", "Roofing"],
  lighting: ["Electrical"],
  mower: ["Outdoor Power Equipment", "Farm Equipment"],
  "no heat": ["HVAC"],
  outlet: ["Electrical"],
  paint: ["Painting", "Home Repair"],
  painting: ["Painting", "Home Repair"],
  patio: ["Landscaping", "General Contractor"],
  pest: ["Pest Control"],
  plumber: ["Plumbing"],
  plumbing: ["Plumbing"],
  porch: ["General Contractor", "Home Repair"],
  pressure: ["Pressure Washing"],
  "pressure washing": ["Pressure Washing"],
  pump: ["Plumbing", "Septic", "Drilling"],
  renovation: ["General Contractor", "Home Repair"],
  renovations: ["General Contractor", "Home Repair"],
  repair: ["Home Repair", "General Contractor"],
  road: ["Excavation", "Concrete"],
  roof: ["Roofing"],
  roofer: ["Roofing"],
  roofing: ["Roofing"],
  septic: ["Septic"],
  shed: ["General Contractor", "Home Repair"],
  siding: ["Roofing", "General Contractor", "Home Repair"],
  snow: ["Snow Removal"],
  "snow clearing": ["Snow Removal"],
  "snow removal": ["Snow Removal"],
  stone: ["Landscaping", "Building Supplies", "Excavation"],
  stump: ["Tree Service", "Landscaping"],
  tile: ["General Contractor", "Home Repair"],
  toilet: ["Plumbing"],
  tractor: ["Farm Equipment", "Outdoor Power Equipment"],
  tree: ["Tree Service", "Landscaping"],
  "tree down": ["Tree Service", "Snow Removal"],
  trench: ["Excavation"],
  truck: ["Logistics", "Towing"],
  waste: ["Waste Removal"],
  water: ["Plumbing", "Septic", "Drilling"],
  waterproofing: ["General Contractor", "Plumbing", "Home Repair"],
  well: ["Drilling", "Plumbing"],
  window: ["General Contractor", "Home Repair"],
  wiring: ["Electrical"],
  yard: ["Landscaping", "Waste Removal"],
};

const localAreaConfig = {
  Dundas: {
    "South Dundas": ["Morrisburg", "Iroquois", "Williamsburg", "Brinston", "Matilda", "Riverside Heights", "Dixons Corners"],
    "North Dundas": ["Winchester", "Chesterville", "Morewood", "Mountain", "South Mountain"],
  },
  Stormont: {
    "South Stormont": ["Long Sault", "Ingleside", "Newington", "Lunenburg", "St. Andrews West"],
    "North Stormont": ["Finch", "Berwick", "Avonmore", "Moose Creek", "Crysler"],
  },
  Glengarry: {
    "South Glengarry": ["Lancaster", "South Lancaster", "Summerstown", "Bainsville", "Green Valley", "Williamstown"],
    "North Glengarry": ["Alexandria", "Maxville", "Glen Robertson", "Apple Hill", "Dunvegan"],
  },
  Cornwall: {
    "Cornwall & Area": ["Cornwall"],
  },
};

const localAreaToCounty = Object.entries(localAreaConfig).reduce((acc, [county, areas]) => {
  Object.keys(areas).forEach((area) => {
    acc[area] = county;
  });
  return acc;
}, {});

const localAreas = Object.values(localAreaConfig).flatMap((areas) => Object.keys(areas));

const townCenters = {
  "SD&G": { lat: 45.0902, lng: -74.8359 },
  "South Dundas": { lat: 44.9104, lng: -75.2139 },
  "North Dundas": { lat: 45.091, lng: -75.352 },
  "South Stormont": { lat: 45.0417, lng: -74.9966 },
  "North Stormont": { lat: 45.1976, lng: -74.986 },
  "South Glengarry": { lat: 45.151, lng: -74.583 },
  "North Glengarry": { lat: 45.312, lng: -74.635 },
  "Cornwall & Area": { lat: 45.0213, lng: -74.7303 },
  Morrisburg: { lat: 44.8997, lng: -75.1857 },
  Iroquois: { lat: 44.8497, lng: -75.3167 },
  Williamsburg: { lat: 44.9722, lng: -75.2447 },
  Brinston: { lat: 44.8736, lng: -75.3586 },
  Matilda: { lat: 44.8759, lng: -75.2931 },
  "Riverside Heights": { lat: 44.9288, lng: -75.1398 },
  "Dixons Corners": { lat: 44.8679, lng: -75.2576 },
  Winchester: { lat: 45.0915, lng: -75.3523 },
  Chesterville: { lat: 45.1033, lng: -75.2327 },
  Morewood: { lat: 45.0718, lng: -75.2469 },
  Mountain: { lat: 45.0592, lng: -75.4728 },
  "South Mountain": { lat: 44.9899, lng: -75.4522 },
  "Long Sault": { lat: 45.031, lng: -74.8956 },
  Ingleside: { lat: 44.9982, lng: -74.9895 },
  Newington: { lat: 45.1142, lng: -75.0009 },
  Lunenburg: { lat: 45.0717, lng: -74.929 },
  "St. Andrews West": { lat: 45.0801, lng: -74.8034 },
  Finch: { lat: 45.1469, lng: -75.0863 },
  Berwick: { lat: 45.184, lng: -75.0524 },
  Avonmore: { lat: 45.1736, lng: -74.9689 },
  "Moose Creek": { lat: 45.2594, lng: -74.96 },
  Crysler: { lat: 45.2208, lng: -75.1533 },
  Lancaster: { lat: 45.1418, lng: -74.4976 },
  "South Lancaster": { lat: 45.1252, lng: -74.491 },
  Summerstown: { lat: 45.0966, lng: -74.5729 },
  Bainsville: { lat: 45.182, lng: -74.4149 },
  "Green Valley": { lat: 45.2556, lng: -74.5986 },
  Williamstown: { lat: 45.1469, lng: -74.5848 },
  Alexandria: { lat: 45.3127, lng: -74.6382 },
  Maxville: { lat: 45.2928, lng: -74.8538 },
  "Glen Robertson": { lat: 45.3585, lng: -74.5036 },
  "Apple Hill": { lat: 45.2239, lng: -74.7814 },
  Dunvegan: { lat: 45.3639, lng: -74.8211 },
  Cornwall: { lat: 45.0213, lng: -74.7303 },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

init();

async function init() {
  wireEvents();
  initIcons();

  try {
    const response = await fetch("./sdg-seed-listings.csv");
    const csv = await response.text();
    state.rows = enrichRows(parseCsv(csv));
  } catch (error) {
    console.error("Could not load seed listings", error);
    state.rows = [];
  }

  syncRegionControls();
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
  const hasDemoBusiness = rows.some((row) => row.name === "BuiltLocal Demo Co.");
  const prototypeRows = hasDemoBusiness ? rows : rows.concat(demoBusinessRow());

  return prototypeRows.map((row, index) => {
    const primary = normalizePrimaryCategory(row.primary_category, row.secondary_categories);
    const seed = hashString(row.name);
    const replies = 12 + (seed % 47);
    const jobs = 18 + (seed % 126);
    const sourceVerified = row.confidence === "High";
    const claimed = row.source === "BuiltLocal demo";
    const localTown = row.town || "South Dundas";
    const county = row.county || countyForLocalArea(row.local_area) || "Dundas";
    const localArea = row.local_area || localAreaForTown(localTown) || "South Dundas";
    const areas = serviceAreasFor(row, localArea);
    const isLocal = areas.some((area) => area.toLowerCase() === localTown.toLowerCase());
    const serviceRadiusKm = localArea === "Cornwall & Area" || /serves sd&g/i.test(row.service_area_notes || "") ? 55 : 30;
    const geo = geoForRow(row, localTown, localArea, seed, index, isLocal);

    return {
      ...row,
      id: `${slugify(row.name)}-${index}`,
      county,
      local_area: localArea,
      displayCategory: primary,
      tags: buildTags(row, primary),
      image: imageForCategory(primary, row.name),
      replies,
      jobs,
      claimed,
      sourceVerified,
      availableToday: seed % 3 !== 0,
      distance: serviceRadiusKm === 30 ? "0-30 km" : "Serves region",
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

function demoBusinessRow() {
  return {
    name: "BuiltLocal Demo Co.",
    primary_category: "General Contractor",
    secondary_categories: "Fencing; decks; home repair; renovations; rural property maintenance",
    town: "Morrisburg",
    address: "",
    phone: "613-555-0198",
    email: "demo@builtlocal.ca",
    website: "",
    source: "BuiltLocal demo",
    source_url: "",
    confidence: "Medium",
    notes: "Prototype demo business for testing claimed profile and Pro Dashboard flow.",
    county: "Dundas",
    local_area: "South Dundas",
    service_area_notes: "Demo profile serving SD&G",
  };
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

function imageForCategory(category, businessName) {
  const pool = imagePoolsByCategory[category] || imagePoolsByCategory.default;
  return pool[hashString(businessName || category) % pool.length];
}

function countyForLocalArea(localArea) {
  return localAreaToCounty[localArea] || "";
}

function localAreaForTown(town) {
  const cleanTown = town || "";
  const match = Object.entries(localAreaConfig).flatMap(([county, areas]) =>
    Object.entries(areas).map(([localArea, towns]) => ({ county, localArea, towns })),
  ).find(({ localArea, towns }) =>
    localArea.toLowerCase() === cleanTown.toLowerCase()
    || towns.some((item) => item.toLowerCase() === cleanTown.toLowerCase()),
  );

  return match?.localArea || "";
}

function serviceAreasFor(row, localArea) {
  const localTowns = localAreaConfig[countyForLocalArea(localArea)]?.[localArea] || [];
  const areas = [localArea].concat(localTowns);
  if (row.town && !areas.includes(row.town)) areas.push(row.town);
  if (/serves sd&g/i.test(row.service_area_notes || "")) {
    areas.push("SD&G", "Stormont", "Dundas", "Glengarry", "Cornwall");
  }
  return areas.filter(Boolean);
}

function geoForRow(row, town, localArea, seed, index, isLocal) {
  const base = isLocal ? townCenterFor(town, localArea) : townCenterFor(localArea);
  const jitter = jitterFor(seed, index);

  return {
    lat: base.lat + jitter.lat,
    lng: base.lng + jitter.lng,
    precision: isLocal ? "Approximate town pin" : "Regional coverage marker",
    label: isLocal
      ? `Approximate ${town || localArea} location`
      : `${row.town || "Regional"} provider serving ${localArea}`,
  };
}

function townCenterFor(town, fallback = state.region || "SD&G") {
  const cleanTown = town || fallback || "SD&G";
  const direct = townCenters[cleanTown];
  if (direct) return direct;

  const match = Object.entries(townCenters).find(([name]) => cleanTown.toLowerCase().includes(name.toLowerCase()));
  return match ? match[1] : townCenters[fallback] || townCenters["SD&G"];
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
  const rows = state.rows;
  const counts = rows.reduce((acc, row) => {
    acc[row.displayCategory] = (acc[row.displayCategory] || 0) + 1;
    return acc;
  }, {});
  const localCounts = state.region
    ? rows.filter((row) => row.local_area === state.region).reduce((acc, row) => {
        acc[row.displayCategory] = (acc[row.displayCategory] || 0) + 1;
        return acc;
      }, {})
    : {};
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

  $("#categoryCoverage").textContent = `${rows.length} SD&G profiles`;
  $("[data-toggle-categories]").textContent = state.categoriesExpanded
    ? "Show popular"
    : `See all ${Object.keys(counts).length} categories`;
  $("[data-toggle-categories]").setAttribute("aria-expanded", String(state.categoriesExpanded));

  grid.innerHTML = categories
    .map((category) => {
      const icon = iconByCategory[category.name] || iconByCategory.default;
      const active = category.filter === state.category ? " active" : "";
      const localCount = localCounts[category.name] || 0;
      const label = state.region
        ? `${category.count} total · ${localCount} local`
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
  syncRegionControls();
  const searchText = state.service.trim().toLowerCase();
  const townText = state.town.trim().toLowerCase();
  const categoryText = state.category.trim().toLowerCase();
  const searchCategories = categoriesForSearch(searchText);

  state.filtered = state.rows.filter((row) => {
    const haystack = [
      row.name,
      row.primary_category,
      row.secondary_categories,
      row.town,
      row.county,
      row.local_area,
      row.service_area_notes,
      row.notes,
      row.displayCategory,
      row.serviceAreas.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const keywordCategoryMatch = searchCategories.includes(row.displayCategory);
    const serviceMatch = !searchText || haystack.includes(searchText) || keywordCategoryMatch;
    const categoryMatch = !categoryText || haystack.includes(categoryText) || row.displayCategory.toLowerCase() === categoryText;
    const townMatch = !townText || haystack.includes(townText);
    const confidenceMatch = !state.confidence || row.confidence === state.confidence;
    const availabilityMatch = !state.availableToday || row.availableToday;

    return serviceMatch && categoryMatch && townMatch && confidenceMatch && availabilityMatch;
  }).sort(compareRows);

  if (!state.filtered.length && (state.service || state.category)) {
    state.filtered = state.rows.filter((row) => {
      if (!state.town) return true;
      return row.serviceAreas.join(" ").toLowerCase().includes(townText);
    }).sort(compareRows);
  }

  syncSelectedWithFilter();
  renderResults();
  renderCategories();
  updateSummary();
  updateMap();
}

function compareRows(a, b) {
  const aScore = rowPriority(a);
  const bScore = rowPriority(b);
  return bScore - aScore || a.name.localeCompare(b.name);
}

function rowPriority(row) {
  let score = 0;
  const searchText = state.service.trim().toLowerCase();
  const searchCategories = categoriesForSearch(searchText);
  if (searchText && rowSearchHaystack(row).includes(searchText)) score += 220;
  if (searchCategories.includes(row.displayCategory)) score += 150;
  if (state.region && row.local_area === state.region) score += 100;
  if (state.town && rowMatchesTown(row, state.town)) score += 120;
  if (row.sourceVerified) score += 10;
  if (row.availableToday) score += 4;
  return score;
}

function rowSearchHaystack(row) {
  return [
    row.name,
    row.primary_category,
    row.secondary_categories,
    row.town,
    row.county,
    row.local_area,
    row.service_area_notes,
    row.notes,
    row.displayCategory,
    row.serviceAreas.join(" "),
  ].join(" ").toLowerCase();
}

function categoriesForSearch(searchText) {
  const normalizedSearch = normalizeSearchText(searchText);
  if (!normalizedSearch) return [];

  const matches = new Set();
  Object.entries(searchKeywordMap).forEach(([keyword, categories]) => {
    if (keywordMatchesSearch(keyword, normalizedSearch)) {
      categories.forEach((category) => matches.add(category));
    }
  });

  return Array.from(matches);
}

function keywordMatchesSearch(keyword, searchText) {
  const normalizedKeyword = normalizeSearchText(keyword);
  if (!normalizedKeyword || !searchText) return false;
  if (searchText.includes(normalizedKeyword) || normalizedKeyword.includes(searchText)) return true;

  const keywordWords = normalizedKeyword.split(" ");
  const searchWords = searchText.split(" ");
  return keywordWords.some((keywordWord) =>
    searchWords.some((searchWord) => isFuzzyWordMatch(keywordWord, searchWord)),
  );
}

function isFuzzyWordMatch(keywordWord, searchWord) {
  if (!keywordWord || !searchWord) return false;
  if (keywordWord.length < 4 || searchWord.length < 4) return false;
  if (keywordWord[0] !== searchWord[0]) return false;
  const distance = levenshteinDistance(keywordWord, searchWord);
  const limit = Math.max(keywordWord.length, searchWord.length) >= 7 ? 2 : 1;
  return distance <= limit;
}

function levenshteinDistance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function rowMatchesTown(row, town) {
  const townText = String(town || "").toLowerCase();
  if (!townText) return true;
  return [
    row.town,
    row.local_area,
    row.service_area_notes,
    row.serviceAreas.join(" "),
  ].join(" ").toLowerCase().includes(townText);
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
  const localCount = state.region ? state.filtered.filter((row) => row.local_area === state.region).length : 0;
  $("#sortLabel").textContent = state.town
    ? `Near: ${state.town}`
    : state.region
      ? `${localCount} local shown first`
      : "Sort: Best Match";

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
            ${row.sourceVerified || row.claimed ? '<span class="verified-dot"><i data-lucide="check"></i></span>' : ""}
          </span>
          <span class="listing-meta">
            <span><i data-lucide="message-square-heart"></i>No local reviews yet</span>
            <span><i data-lucide="clock"></i>Replies in ${row.replies} min</span>
          </span>
          <span class="listing-category">${escapeHtml(row.displayCategory)}</span>
          <span class="listing-foot">
            <span><i data-lucide="map-pin"></i>${escapeHtml(row.town || "South Dundas")}</span>
            <span><i data-lucide="badge-check"></i>${row.claimed ? "Claimed demo" : row.sourceVerified ? "Verified source" : "Needs source check"}</span>
          </span>
        </span>
      </button>
    `)
    .join("");

  initIcons();
}

function selectListing(row, options = {}) {
  if (!row) return;
  state.selected = row;
  updateProfile(row);
  renderResults();
  drawServiceCircle(row);
  updateMarkerIcons();
  if (options.openMapPopup) openMapPopup(row, { pan: options.panMap });
  if (options.scrollTo === "profile") scrollToProfile();
  initIcons();
}

function updateProfile(row) {
  if (!row) return;
  $("#profileImage").src = row.image;
  $("#profileImage").alt = `${row.name} project image`;
  $("#profileTitle").textContent = row.name;
  $("#profileSubtitle").textContent = `${row.displayCategory} serving ${row.serviceText}`;
  $("#profileReviews").textContent = "No local reviews yet";
  $("#profileResponse").textContent = `${row.replies} min`;
  $("#profileDistance").textContent = row.distance;
  $("#profilePhone").textContent = row.phone || "Phone not yet verified";
  $("#profileAreas").textContent = `Serves ${row.serviceText}`;
  $("#profileClaim").textContent = row.claimed
    ? "Claimed demo profile for Pro Dashboard preview"
    : row.sourceVerified
      ? "Verified public source - unclaimed profile"
      : "Unclaimed public listing";
  $("#profileJobs").textContent = row.claimed
    ? "Claimed profile. Project history can be added in BuiltLocal Pro."
    : "Public listing. Project history appears after this business is claimed.";
  $("#verifiedPill").style.display = row.sourceVerified ? "inline-flex" : "none";
  $("#verifiedPill").innerHTML = '<i data-lucide="badge-check"></i> Verified Source';
  $("#messageButton").href = row.phone ? `tel:${row.phone.replace(/[^0-9+]/g, "")}` : "#";

  $("#profileTags").innerHTML = row.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function updateSummary() {
  const total = state.filtered.length || state.rows.length;
  const area = state.town || state.region || "SD&G";
  const service = state.category || state.service || "service";
  $("#mapSummary").textContent = state.region && !state.town
    ? `${total} ${service.toLowerCase()} profiles across SD&G`
    : `${total} ${service.toLowerCase()} profiles near ${area}`;
  $("#mapFootnote").textContent = state.selected
    ? `${state.selected.locationPrecision}. Selected radius: ${state.selected.serviceRadiusKm} km.`
    : state.region && !state.town
      ? `${state.region} profiles are shown first. Approximate pins until listings are claimed.`
      : "Approximate pins until listings are claimed. Circle shows selected service radius.";
}

function initMap() {
  if (!window.L || !$("#directoryMap")) return;

  state.map = window.L.map("directoryMap", {
    center: [townCenters["SD&G"].lat, townCenters["SD&G"].lng],
    zoom: 10,
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

    marker.bindPopup(mapPopupHtml(row));

    marker.on("click", () => {
      selectListing(row, { openMapPopup: true });
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
    const center = townCenterFor(state.region || "SD&G");
    state.map.setView([center.lat, center.lng], state.region ? 11 : 10);
  }

  drawServiceCircle(state.selected);
  setTimeout(() => state.map.invalidateSize(), 80);
}

function mapPopupHtml(row) {
  const phoneHref = row.phone ? row.phone.replace(/[^0-9+]/g, "") : "";
  return `
    <div class="map-popup">
      <strong>${escapeHtml(row.name)}</strong>
      <span>${escapeHtml(row.displayCategory)} &middot; ${escapeHtml(row.town || "South Dundas")}</span>
      <span>No local reviews yet</span>
      <em>${escapeHtml(row.mapLabel)}</em>
      <span class="map-popup-actions">
        <button type="button" data-popup-profile="${escapeHtml(row.id)}">View Profile</button>
        ${phoneHref ? `<a href="tel:${escapeHtml(phoneHref)}">Call</a>` : ""}
      </span>
    </div>
  `;
}

function focusMapOn(row) {
  if (!state.map || !row) return;

  drawServiceCircle(row);
  updateMarkerIcons();
  openMapPopup(row, { pan: true });
}

function openMapPopup(row, options = {}) {
  if (!state.map || !row) return;

  const marker = state.markers.get(row.id);
  if (marker) {
    if (options.pan) {
      state.map.setView([row.latitude, row.longitude], Math.max(state.map.getZoom(), 11), { animate: true });
    }
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

function syncRegionControls() {
  if (state.region && !localAreas.includes(state.region)) {
    state.region = "";
  }

  $$("[data-region-select]").forEach((select) => {
    select.value = state.region;
  });

  const towns = townsForRegion(state.region);
  const anywhereLabel = state.region ? `Anywhere in ${state.region}` : "Anywhere in SD&G";
  $("#filterArea").innerHTML = [`<option value="">${escapeHtml(anywhereLabel)}</option>`]
    .concat(towns.map((town) => `<option value="${escapeHtml(town)}">${escapeHtml(town)}</option>`))
    .join("");
  $("#filterArea").value = state.town;
  $("#directory-title").textContent = state.region ? `Find a service near ${state.region}` : "Find a service across SD&G";
}

function townsForRegion(region) {
  if (region) {
    const county = countyForLocalArea(region);
    return localAreaConfig[county]?.[region] || [];
  }

  return Object.values(localAreaConfig)
    .flatMap((areas) => Object.values(areas))
    .flat()
    .sort((a, b) => a.localeCompare(b));
}

function wireEvents() {
  $("#heroSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    state.service = $("#serviceSearch").value;
    state.region = $("#regionSearch").value;
    state.town = "";
    $("#filterService").value = state.service;
    syncRegionControls();
    state.category = "";
    applyFilters();
    setDirectoryView("list");
    scrollToResults();
  });

  $$("[data-region-select]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.region = event.target.value;
      state.town = "";
      state.category = "";
      syncRegionControls();
      applyFilters();
    });
  });

  $("#filterService").addEventListener("input", (event) => {
    state.service = event.target.value;
    applyFilters();
  });

  $("#filterArea").addEventListener("change", (event) => {
    state.town = event.target.value;
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
    const viewButton = event.target.closest("[data-view]");
    const popupProfileButton = event.target.closest("[data-popup-profile]");
    const backResultsButton = event.target.closest("[data-back-results]");
    const closeDialogButton = event.target.closest("[data-close-dialog]");
    const urgencyButton = event.target.closest("[data-urgency]");

    if (popupProfileButton) {
      const row = state.rows.find((item) => item.id === popupProfileButton.dataset.popupProfile);
      selectListing(row, { scrollTo: "profile" });
      return;
    }

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
      selectListing(row, { scrollTo: "profile" });
    }

    if (quoteButton) {
      $("#quoteSuccess").hidden = true;
      $("#quoteDialog").showModal();
      initIcons();
    }

    if (urgencyButton) {
      $$("[data-urgency]").forEach((button) => button.classList.toggle("active", button === urgencyButton));
    }

    if (claimButton) {
      $("#claimDialog").showModal();
      initIcons();
    }

    if (clearButton) {
      state.category = "";
      state.service = "";
      state.region = "";
      state.town = "";
      state.confidence = "";
      state.availableToday = false;
      $("#serviceSearch").value = "";
      $("#filterService").value = "";
      $("#filterType").value = "";
      $("#openToday").checked = false;
      syncRegionControls();
      applyFilters();
    }

    if (categoryToggleButton) {
      state.categoriesExpanded = !state.categoriesExpanded;
      renderCategories();
    }

    if (filterButton) {
      const workspace = $(".workspace");
      $("#filtersPanel").classList.toggle("open");
      workspace.classList.toggle("filters-hidden");
      filterButton.setAttribute("aria-pressed", String(workspace.classList.contains("filters-hidden")));
    }

    if (viewButton) {
      setDirectoryView(viewButton.dataset.view);
      const target = viewButton.dataset.view === "map" ? ".map-panel" : ".results-panel";
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (state.map) setTimeout(() => state.map.invalidateSize(), 240);
    }

    if (backResultsButton) {
      setDirectoryView("list");
      scrollToResults();
    }

    if (closeDialogButton) {
      closeDialogButton.closest("dialog")?.close();
    }
  });

  $("#quoteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveQuoteLead();
    $("#quoteSuccess").hidden = false;
    initIcons();
  });

  $("#claimForm").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#claimSuccess").hidden = false;
    initIcons();
  });

  window.addEventListener("resize", () => {
    if (state.map) state.map.invalidateSize();
  });
}

function setDirectoryView(view) {
  $$("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
}

function saveQuoteLead() {
  const leads = readStoredArray("builtlocal_demo_leads", defaultPublicLeads());
  const selectedUrgency = $("[data-urgency].active")?.dataset.urgency || "ASAP";
  const lead = {
    id: `lead-${Date.now()}`,
    title: `${$("#quoteService").value} request`,
    service: $("#quoteService").value,
    town: $("#quoteTown").value.trim() || state.selected?.town || "SD&G",
    details: $("#quoteDetails").value.trim() || "Resident requested follow-up from the public directory.",
    contact: $("#quoteContact").value.trim() || "Contact not provided",
    urgency: selectedUrgency,
    status: "New",
    notes: "",
    source: "Public quote form",
    createdAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  localStorage.setItem("builtlocal_demo_leads", JSON.stringify(leads));
}

function defaultPublicLeads() {
  return [
    {
      id: "seed-roof-morrisburg",
      title: "Roof repair needed",
      service: "Roofing",
      town: "Morrisburg",
      details: "Small leak near the rear addition after heavy rain.",
      contact: "resident@example.com",
      urgency: "Within a week",
      status: "New",
      notes: "",
      source: "Sample lead",
      createdAt: "2026-05-25T14:30:00.000Z",
    },
    {
      id: "seed-deck-iroquois",
      title: "Deck railing repair",
      service: "General contractor",
      town: "Iroquois",
      details: "Looking for a quote to repair a loose railing and two steps.",
      contact: "613-555-0112",
      urgency: "Flexible",
      status: "Contacted",
      notes: "Left voicemail.",
      source: "Sample lead",
      createdAt: "2026-05-24T18:10:00.000Z",
    },
    {
      id: "seed-fence-brinston",
      title: "Fence section replacement",
      service: "General contractor",
      town: "Brinston",
      details: "Wind damaged a short fence section near the driveway.",
      contact: "resident2@example.com",
      urgency: "ASAP",
      status: "New",
      notes: "",
      source: "Sample lead",
      createdAt: "2026-05-23T12:00:00.000Z",
    },
  ];
}

function readStoredArray(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function scrollToResults() {
  const target = window.innerWidth < 760 ? ".results-panel" : "#directory";
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToProfile() {
  $("#profile")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
