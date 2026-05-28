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
  quoteMode: "matching",
  quoteContext: "matching",
  reviews: [],
  page: 1,
  pageSize: 12,
};

const defaultApiBaseUrl = location.hostname.endsWith("github.io") || location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "https://localtrades-south-dundas.vercel.app"
  : "";
const apiBaseUrl = (window.BUILTLOCAL_API_BASE || localStorage.getItem("builtlocal_api_base") || defaultApiBaseUrl).replace(/\/$/, "");

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
  "Septic Services": [
    "https://images.unsplash.com/photo-1581093458791-9d42cc0f87bf?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1592993180300-974cd5c9760c?auto=format&fit=crop&w=900&q=80",
  ],
  Concrete: [
    "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80",
  ],
  Paving: [
    "https://images.unsplash.com/photo-1592993180300-974cd5c9760c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=900&q=80",
  ],
  "Home Repair": [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=900&q=80",
  ],
  "Pressure Washing": [
    "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&w=900&q=80",
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
  "Septic Services": "droplets",
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
  "Environmental Services": "shield-check",
  "Industrial Equipment": "settings",
  Painting: "paint-roller",
  Paving: "construction",
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
  "Septic Services",
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
  "Septic Services",
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
  cabinet: ["Home Repair", "Building Supplies"],
  cabinetry: ["Home Repair", "Building Supplies"],
  concrete: ["Concrete", "General Contractor", "Excavation"],
  contractor: ["General Contractor"],
  deck: ["General Contractor", "Home Repair", "Landscaping"],
  demolition: ["Excavation", "Waste Removal", "General Contractor"],
  driveway: ["Paving", "Excavation", "Landscaping", "Snow Removal"],
  "driveway paving": ["Paving"],
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
  "home maintenance": ["Home Repair", "Landscaping", "Snow Removal"],
  "industrial equipment": ["Industrial Equipment"],
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
  asphalt: ["Paving"],
  patio: ["Landscaping", "General Contractor"],
  pavement: ["Paving"],
  paving: ["Paving"],
  "parking lot": ["Paving"],
  pest: ["Pest Control"],
  plumber: ["Plumbing"],
  plumbing: ["Plumbing"],
  porch: ["General Contractor", "Home Repair"],
  "property care": ["Home Repair", "Landscaping", "Snow Removal"],
  "property maintenance": ["Home Repair", "Landscaping", "Snow Removal"],
  pressure: ["Pressure Washing"],
  "pressure washing": ["Pressure Washing"],
  junk: ["Waste Removal"],
  "junk removal": ["Waste Removal"],
  millwork: ["Home Repair", "Building Supplies"],
  pump: ["Plumbing", "Septic Services", "Drilling"],
  renovation: ["General Contractor", "Home Repair"],
  renovations: ["General Contractor", "Home Repair"],
  repair: ["Home Repair", "General Contractor"],
  road: ["Excavation", "Concrete"],
  radon: ["Environmental Services"],
  "radon mitigation": ["Environmental Services"],
  "radon testing": ["Environmental Services"],
  roof: ["Roofing"],
  roofer: ["Roofing"],
  roofing: ["Roofing"],
  sealcoating: ["Paving"],
  "septic install": ["Septic Services", "Excavation"],
  "septic installation": ["Septic Services", "Excavation"],
  "septic pump": ["Septic Services"],
  "septic pumping": ["Septic Services"],
  septic: ["Septic Services"],
  shed: ["General Contractor", "Home Repair"],
  siding: ["Roofing", "General Contractor", "Home Repair"],
  snow: ["Snow Removal"],
  "snow clearing": ["Snow Removal"],
  "snow removal": ["Snow Removal"],
  "snow plowing": ["Snow Removal"],
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
  softwash: ["Pressure Washing"],
  "soft wash": ["Pressure Washing"],
  water: ["Plumbing", "Septic Services", "Drilling"],
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
const reviewTownOptions = [
  ...localAreas,
  ...Object.values(localAreaConfig).flatMap((areas) => Object.values(areas)).flat(),
  "Cornwall",
];

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

  renderProviderDatalist();
  await loadApprovedReviews();
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
  if (haystack.includes("paving") || haystack.includes("asphalt") || haystack.includes("pavement")) return "Paving";
  if (haystack.includes("snow")) return "Snow Removal";
  if (haystack.includes("septic")) return "Septic Services";
  if (haystack.includes("concrete") || haystack.includes("cement")) return "Concrete";
  if (haystack.includes("roof")) return "Roofing";
  if (haystack.includes("plumb")) return "Plumbing";
  if (haystack.includes("electric")) return "Electrical";
  if (haystack.includes("hvac") || haystack.includes("heating") || haystack.includes("cooling")) return "HVAC";
  if (haystack.includes("tree")) return "Tree Service";
  if (haystack.includes("pest")) return "Pest Control";
  if (haystack.includes("waste") || haystack.includes("junk")) return "Waste Removal";
  if (haystack.includes("pressure washing") || haystack.includes("soft wash")) return "Pressure Washing";
  if (haystack.includes("drywall") || haystack.includes("handyman") || haystack.includes("home repair")) return "Home Repair";
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
    const serviceMatch = !searchText || rowSearchScore(row, searchText) > 0 || keywordCategoryMatch;
    const categoryMatch = !categoryText || haystack.includes(categoryText) || row.displayCategory.toLowerCase() === categoryText;
    const townMatch = !townText || haystack.includes(townText);
    const confidenceMatch = !state.confidence || row.confidence === state.confidence;
    const availabilityMatch = !state.availableToday || row.availableToday;

    return serviceMatch && categoryMatch && townMatch && confidenceMatch && availabilityMatch;
  }).sort(compareRows);

  if (!state.filtered.length && state.category && !state.service) {
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
  if (searchText) score += rowSearchScore(row, searchText);
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

function rowSearchScore(row, searchText) {
  const normalizedSearch = normalizeSearchText(searchText);
  if (!normalizedSearch) return 0;

  const normalizedName = normalizeSearchText(row.name);
  const compactSearch = normalizedSearch.replace(/\s+/g, "");
  const compactName = normalizedName.replace(/\s+/g, "");
  const nameTokens = normalizedName.split(" ").filter(Boolean);
  const acronym = nameTokens.map((token) => token[0]).join("");

  if (normalizedName === normalizedSearch) return 380;
  if (compactSearch.length >= 4 && compactName.includes(compactSearch)) return 350;
  if (normalizedSearch.length >= 2 && acronym.startsWith(normalizedSearch)) return 340;
  if (normalizedName.startsWith(normalizedSearch)) return 330;
  if (nameTokens.some((token) => token === normalizedSearch)) return 315;
  if (normalizedSearch.length >= 2 && nameTokens.some((token) => token.startsWith(normalizedSearch))) return 300;
  if (queryWordsMatchTokens(normalizedSearch, nameTokens)) return 285;

  const normalizedHaystack = normalizeSearchText(rowSearchHaystack(row));
  const haystackTokens = normalizedHaystack.split(" ").filter(Boolean);

  if (normalizedSearch.length <= 3) {
    return 0;
  }

  if (normalizedHaystack.includes(normalizedSearch)) return 220;
  if (compactSearch.length >= 4 && normalizedHaystack.replace(/\s+/g, "").includes(compactSearch)) return 210;

  const fieldMatches = [
    { text: row.displayCategory, weight: 190 },
    { text: row.primary_category, weight: 180 },
    { text: row.secondary_categories, weight: 165 },
    { text: row.service_area_notes, weight: 120 },
    { text: row.notes, weight: 115 },
    { text: row.town, weight: 90 },
    { text: row.local_area, weight: 80 },
    { text: row.county, weight: 70 },
    { text: row.serviceAreas.join(" "), weight: 65 },
  ];

  const bestFieldScore = fieldMatches.reduce((best, field) => {
    const fieldTokens = normalizeSearchText(field.text).split(" ").filter(Boolean);
    if (!fieldTokens.length) return best;
    if (queryWordsMatchTokens(normalizedSearch, fieldTokens)) return Math.max(best, field.weight);
    return best;
  }, 0);

  if (bestFieldScore) return bestFieldScore;

  return queryWordsMatchTokens(normalizedSearch, haystackTokens) ? 55 : 0;
}

function queryWordsMatchTokens(searchText, tokens) {
  const searchWords = searchText.split(" ").filter((word) => word.length >= 2);
  if (!searchWords.length || !tokens.length) return false;

  let matched = 0;
  searchWords.forEach((word) => {
    if (tokens.some((token) => tokenMatchesSearch(token, word))) matched += 1;
  });

  if (searchWords.length === 1) return matched === 1;
  return matched / searchWords.length >= 0.65;
}

function tokenMatchesSearch(token, searchWord) {
  if (!token || !searchWord) return false;
  if (token === searchWord) return true;
  if (searchWord.length >= 3 && token.startsWith(searchWord)) return true;
  if (searchWord.length >= 4 && token.includes(searchWord)) return true;
  return isFuzzyWordMatch(token, searchWord);
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
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;
  const pageStart = (state.page - 1) * state.pageSize;
  const pageRows = state.filtered.slice(pageStart, pageStart + state.pageSize);
  const pageEnd = Math.min(pageStart + pageRows.length, state.filtered.length);
  $("#resultCount").textContent = state.filtered.length
    ? `${pageStart + 1}-${pageEnd} of ${state.filtered.length} contractors`
    : "0 contractors";
  const localCount = state.region ? state.filtered.filter((row) => row.local_area === state.region).length : 0;
  $("#sortLabel").textContent = state.town
    ? `Near: ${state.town}`
    : state.region
      ? `${localCount} local shown first`
      : "Sort: Best Match";

  list.innerHTML = pageRows
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
            <span><i data-lucide="message-square-heart"></i>${escapeHtml(reviewSummaryFor(row).label)}</span>
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

  renderPagination(totalPages);
  initIcons();
}

function renderPagination(totalPages) {
  const container = $("#directoryPagination");
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <button class="secondary-button compact" type="button" data-page-action="prev" ${state.page <= 1 ? "disabled" : ""}>
      <i data-lucide="chevron-left"></i>
      Previous
    </button>
    <span>Page ${state.page} of ${totalPages}</span>
    <button class="secondary-button compact" type="button" data-page-action="next" ${state.page >= totalPages ? "disabled" : ""}>
      Next
      <i data-lucide="chevron-right"></i>
    </button>
  `;
}

function resetDirectoryPage() {
  state.page = 1;
}

function changeDirectoryPage(direction) {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  state.page = Math.min(totalPages, Math.max(1, state.page + direction));
  renderResults();
  const target = window.innerWidth < 760 ? ".results-panel" : "#directory";
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const floatingBack = $(".floating-back-search");
  if (floatingBack) floatingBack.hidden = false;
  initIcons();
}

function updateProfile(row) {
  if (!row) return;
  const reviews = reviewsForProvider(row);
  const reviewSummary = reviewSummaryFor(row);
  $("#profileImage").src = row.image;
  $("#profileImage").alt = `${row.name} project image`;
  $("#profileTitle").textContent = row.name;
  $("#profileSubtitle").textContent = `${row.displayCategory} serving ${row.serviceText}`;
  $("#profileReviews").textContent = reviewSummary.label;
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
  renderProfileReviews(row, reviews);
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
      <span>${escapeHtml(reviewSummaryFor(row).label)}</span>
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

function renderProviderDatalist() {
  const datalist = $("#providerNames");
  if (!datalist) return;
  datalist.innerHTML = state.rows
    .map((row) => `<option value="${escapeHtml(row.name)}"></option>`)
    .join("");
}

async function loadApprovedReviews() {
  if (!apiBaseUrl) {
    state.reviews = [];
    renderPublicReviews();
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/reviews`);
    if (!response.ok) throw new Error(await response.text());
    const payload = await response.json();
    state.reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
  } catch (error) {
    console.warn("Could not load approved reviews", error);
    state.reviews = [];
  }
  renderPublicReviews();
}

function reviewsForProvider(row) {
  if (!row) return [];
  const normalizedName = normalizeBusinessNameForReviews(row.name);
  return state.reviews.filter((review) => {
    return review.provider_id === row.id
      || normalizeBusinessNameForReviews(review.provider_name) === normalizedName
      || normalizeBusinessNameForReviews(review.providerName) === normalizedName;
  });
}

function reviewSummaryFor(row) {
  const reviews = reviewsForProvider(row);
  if (!reviews.length) return { label: "No local reviews yet", count: 0, average: null };
  const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  return {
    label: reviews.length >= 3
      ? `${average.toFixed(1)} stars from ${reviews.length} local reviews`
      : `${reviews.length} local ${reviews.length === 1 ? "review" : "reviews"}`,
    count: reviews.length,
    average,
  };
}

function renderProfileReviews(row, reviews) {
  const container = $("#profileReviewList");
  if (!container) return;
  if (!reviews.length) {
    container.innerHTML = `
      <div class="profile-review-empty">
        <strong>No local reviews yet</strong>
        <span>Be the first to share a real local experience with ${escapeHtml(row.name)}.</span>
        <button class="secondary-button compact" type="button" data-open-review>
          <i data-lucide="message-square-plus"></i>
          Be the first to review
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.slice(0, 3).map(reviewCardHtml).join("");
}

function renderPublicReviews() {
  const grid = $("#publicReviewGrid");
  if (!grid) return;
  if (!state.reviews.length) {
    grid.innerHTML = `
      <article class="review-card">
        <div class="avatar"><i data-lucide="message-square-heart"></i></div>
        <div>
          <strong>No local reviews published yet</strong>
          <p>Submitted reviews are checked before they appear here. Add the first original BuiltLocal review for an SD&G provider.</p>
        </div>
      </article>
    `;
    initIcons();
    return;
  }

  grid.innerHTML = state.reviews.slice(0, 6).map(reviewCardHtml).join("");
  initIcons();
}

function reviewCardHtml(review) {
  const firstName = review.reviewer_first_name || review.firstName || "Local resident";
  const town = review.reviewer_town || review.town || "SD&G";
  const provider = review.provider_name || review.providerName || "Local provider";
  const service = review.service_used || review.serviceUsed || "Service";
  const text = review.review_text || review.reviewText || "";
  return `
    <article class="review-card published-review">
      <div class="avatar">${escapeHtml(String(review.rating || ""))}</div>
      <div>
        <strong>${escapeHtml(provider)}</strong>
        <span>${escapeHtml(service)} &middot; ${escapeHtml(firstName)} in ${escapeHtml(town)}</span>
        <p>${escapeHtml(text)}</p>
      </div>
    </article>
  `;
}

function normalizeBusinessNameForReviews(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inc|ltd|limited|co|company|corp|corporation)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
    resetDirectoryPage();
    applyFilters();
    setDirectoryView("list");
    scrollToResults();
  });

  $$("[data-region-select]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.region = event.target.value;
      state.town = "";
      state.category = "";
      resetDirectoryPage();
      syncRegionControls();
      applyFilters();
    });
  });

  $("#filterService").addEventListener("input", (event) => {
    state.service = event.target.value;
    resetDirectoryPage();
    applyFilters();
  });

  $("#filterArea").addEventListener("change", (event) => {
    state.town = event.target.value;
    resetDirectoryPage();
    applyFilters();
  });

  $("#filterType").addEventListener("change", (event) => {
    state.confidence = event.target.value;
    resetDirectoryPage();
    applyFilters();
  });

  $("#openToday").addEventListener("change", (event) => {
    state.availableToday = event.target.checked;
    resetDirectoryPage();
    applyFilters();
  });

  document.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-category]");
    const listingButton = event.target.closest("[data-listing-id]");
    const quoteButton = event.target.closest("[data-open-quote]");
    const directQuoteButton = event.target.closest("[data-open-direct-quote]");
    const matchingQuoteButton = event.target.closest("[data-open-matching-quote]");
    const claimButton = event.target.closest("[data-claim-link]");
    const clearButton = event.target.closest("[data-clear-filters]");
    const categoryToggleButton = event.target.closest("[data-toggle-categories]");
    const filterButton = event.target.closest("[data-filter-button]");
    const viewButton = event.target.closest("[data-view]");
    const popupProfileButton = event.target.closest("[data-popup-profile]");
    const backResultsButton = event.target.closest("[data-back-results]");
    const closeDialogButton = event.target.closest("[data-close-dialog]");
    const urgencyButton = event.target.closest("[data-urgency]");
    const quoteModeButton = event.target.closest("[data-quote-mode]");
    const reviewButton = event.target.closest("[data-open-review]");
    const pageButton = event.target.closest("[data-page-action]");

    if (popupProfileButton) {
      const row = state.rows.find((item) => item.id === popupProfileButton.dataset.popupProfile);
      selectListing(row, { scrollTo: "profile" });
      return;
    }

    if (categoryButton) {
      state.category = categoryButton.dataset.category === state.category ? "" : categoryButton.dataset.category;
      state.service = "";
      $("#filterService").value = "";
      resetDirectoryPage();
      applyFilters();
      setDirectoryView("list");
      scrollToResults();
    }

    if (listingButton) {
      const row = state.rows.find((item) => item.id === listingButton.dataset.listingId);
      selectListing(row, { scrollTo: "profile" });
    }

    if (quoteButton) openQuoteDialog(state.selected ? "direct" : "matching");

    if (directQuoteButton) openQuoteDialog("direct");

    if (matchingQuoteButton) openQuoteDialog("matching");

    if (reviewButton) openReviewDialog();

    if (pageButton) {
      changeDirectoryPage(pageButton.dataset.pageAction === "next" ? 1 : -1);
    }

    if (quoteModeButton) {
      setQuoteMode(quoteModeButton.dataset.quoteMode);
      updateJobSnapshotPreview();
    }

    if (urgencyButton) {
      $$("[data-urgency]").forEach((button) => button.classList.toggle("active", button === urgencyButton));
      updateQuoteModeCopy();
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
      resetDirectoryPage();
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
    saveQuoteLead(event.submitter);
  });

  $("#reviewForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitReview(event.submitter);
  });

  ["input", "change"].forEach((eventName) => {
    $("#quoteForm").addEventListener(eventName, (event) => {
      if (event.target.closest("#quoteForm")) updateJobSnapshotPreview();
    });
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

function setQuoteMode(mode) {
  state.quoteMode = mode === "direct" && state.selected ? "direct" : "matching";
  updateQuoteModeCopy();
}

function updateQuoteModeCopy() {
  const selectedName = state.selected?.name || "this company";
  const isDirect = state.quoteMode === "direct";
  const choiceGrid = $(".quote-choice-grid");
  if (choiceGrid) choiceGrid.hidden = state.quoteContext === "direct" || state.quoteContext === "matching";
  $$("[data-quote-mode]").forEach((button) => {
    const isActive = button.dataset.quoteMode === state.quoteMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    if (button.dataset.quoteMode === "direct") {
      button.disabled = !state.selected;
    }
  });

  $("#directChoiceText").textContent = state.selected
    ? `Send this request to ${selectedName}.`
    : "Open a company profile to send a direct request.";
  $("#quoteTitle").textContent = isDirect
    ? `Request a quote from ${selectedName}.`
    : "Post a job and get matched locally.";
  $("#quoteModeNote").textContent = isDirect
    ? `This request goes directly to ${selectedName}. BuiltLocal will not match it with other providers unless you choose the Post a Job path.`
    : "Tell BuiltLocal what you need. We package it into a short Job Snapshot and route it by SMS to one matched provider at a time.";
  $("#quoteSubmitText").textContent = isDirect ? "Send Direct Request" : "Start Local Matching";

  const successText = isDirect
    ? `Direct request saved for ${selectedName}. If this provider has SMS leads enabled, they receive the Job Snapshot and can accept by text or in Pro.`
    : "Request received. BuiltLocal will route it by SMS to one matched provider at a time. Your contact unlocks only after a provider accepts.";
  $("#quoteSuccessText").textContent = successText;
}

function openQuoteDialog(context) {
  const directContext = context === "direct" && state.selected;
  state.quoteContext = directContext ? "direct" : "matching";
  $("#quoteSuccess").hidden = true;
  $("#quoteError").hidden = true;
  if (directContext) {
    prefillQuoteFromSelection();
  } else if (!$("#quoteTown").value) {
    $("#quoteTown").value = state.region || state.town || "";
  }
  setQuoteMode(directContext ? "direct" : "matching");
  updateJobSnapshotPreview();
  $("#quoteDialog").showModal();
  initIcons();
}

function openReviewDialog() {
  $("#reviewSuccess").hidden = true;
  $("#reviewError").hidden = true;
  const selected = state.selected;
  $("#reviewProviderName").value = selected?.name || "";
  $("#reviewServiceUsed").value = selected?.displayCategory || state.category || state.service || "";
  $("#reviewTown").value = state.town || state.region || selected?.town || "";
  $("#reviewDialog").showModal();
  initIcons();
}

async function submitReview(submitButton) {
  const providerName = $("#reviewProviderName").value.trim();
  const row = state.rows.find((item) => normalizeBusinessNameForReviews(item.name) === normalizeBusinessNameForReviews(providerName));
  const payload = {
    providerId: row?.id || "",
    providerName,
    serviceUsed: $("#reviewServiceUsed").value.trim(),
    firstName: $("#reviewFirstName").value.trim(),
    town: $("#reviewTown").value.trim(),
    email: $("#reviewEmail").value.trim(),
    workDate: $("#reviewWorkDate").value.trim(),
    rating: Number($("#reviewRating").value || 0),
    reviewText: $("#reviewText").value.trim(),
  };
  const validationError = validateReviewPayload(payload);
  if (validationError) {
    $("#reviewSuccess").hidden = true;
    $("#reviewError").hidden = false;
    $("#reviewError").textContent = validationError;
    return;
  }

  const originalButtonHtml = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader-circle"></i> Submitting...';
    initIcons();
  }

  try {
    if (!apiBaseUrl) throw new Error("Review API is not configured");
    const response = await fetch(`${apiBaseUrl}/api/reviews`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const message = await readResponseError(response);
      throw new Error(message || "Could not submit review");
    }
    $("#reviewError").hidden = true;
    $("#reviewForm").reset();
    $("#reviewDialog").close();
    showSiteNotice("Thanks. Your review was submitted and will be checked before publishing.");
  } catch (error) {
    $("#reviewSuccess").hidden = true;
    $("#reviewError").hidden = false;
    $("#reviewError").textContent = error.message || "Could not submit this review yet.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHtml;
      initIcons();
    }
  }
}

function showSiteNotice(message) {
  let notice = $("#siteNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "siteNotice";
    notice.className = "site-notice";
    notice.setAttribute("role", "status");
    document.body.appendChild(notice);
  }
  notice.innerHTML = `<i data-lucide="check-circle"></i><span>${escapeHtml(message)}</span>`;
  notice.hidden = false;
  initIcons();
  window.setTimeout(() => {
    notice.hidden = true;
  }, 5200);
}

function validateReviewPayload(payload) {
  if (!payload.providerId) return "Choose a business from the BuiltLocal directory list.";
  if (!/^[a-z][a-z .'-]{1,39}$/i.test(payload.firstName)) return "Enter your first name only.";
  if (!reviewTownOptions.some((town) => normalizeSearchText(town) === normalizeSearchText(payload.town))) {
    return "Choose a town or area from the SD&G suggestions.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(payload.email)) return "Enter a valid email address.";
  if (!/[a-z]/i.test(payload.serviceUsed) || payload.serviceUsed.length < 3 || payload.serviceUsed.length > 80) {
    return "Enter the service that was used.";
  }
  if (payload.workDate && !isValidReviewWorkDate(payload.workDate)) {
    return "Use a month and year like May 2026.";
  }
  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) return "Choose a rating.";
  if (payload.reviewText.length < 20) return "Add a little more detail to the review.";
  return "";
}

function isValidReviewWorkDate(value) {
  const match = String(value || "").trim().match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})$/i);
  if (!match) return false;
  const year = Number(match[2]);
  return year >= 2000 && year <= new Date().getFullYear();
}

async function readResponseError(response) {
  const text = await response.text();
  try {
    const payload = JSON.parse(text);
    return payload.error || text;
  } catch (error) {
    return text;
  }
}

async function saveQuoteLead(submitButton) {
  const payload = buildLeadPayload();
  const snapshot = createLocalSnapshot(payload);
  const originalButtonHtml = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = `<i data-lucide="loader-circle"></i> ${payload.leadType === "direct" ? "Sending..." : "Matching..."}`;
    initIcons();
  }

  try {
    const apiResult = await submitLeadToApi(payload);
    saveLocalLead({ ...payload, snapshot, apiResult });
    $("#quoteSuccess").hidden = false;
    $("#quoteError").hidden = true;
    $("#quoteForm").reset();
    $("[data-urgency]").forEach((button) => button.classList.toggle("active", button.dataset.urgency === "ASAP"));
    setQuoteMode(state.quoteContext === "direct" ? "direct" : "matching");
    updateJobSnapshotPreview();
  } catch (error) {
    saveLocalLead({ ...payload, snapshot, apiError: error.message });
    $("#quoteSuccess").hidden = false;
    $("#quoteError").hidden = false;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHtml;
      initIcons();
    }
  }
}

function buildLeadPayload() {
  const selectedUrgency = $("[data-urgency].active")?.dataset.urgency || "ASAP";
  const photoFiles = Array.from($("#quotePhotos").files || []).slice(0, 8);
  const leadType = state.quoteMode === "direct" && state.selected ? "direct" : "matching";
  return {
    leadType,
    routingMode: leadType === "direct" ? "direct_company" : "sms_matching",
    rerouteAllowed: leadType === "matching",
    service: $("#quoteService").value,
    town: $("#quoteTown").value.trim() || state.selected?.town || state.region || "SD&G",
    details: $("#quoteDetails").value.trim() || "Resident requested follow-up from the public directory.",
    contactName: $("#quoteName").value.trim(),
    contact: $("#quoteContact").value.trim() || "Contact not provided",
    preferredContact: $("#quoteContactMethod").value,
    urgency: selectedUrgency,
    propertyType: $("#quoteProperty").value,
    budget: $("#quoteBudget").value,
    availability: $("#quoteAvailability").value.trim(),
    photoCount: photoFiles.length,
    photos: photoFiles.map((file) => ({ name: file.name, size: file.size, type: file.type })),
    selectedProviderId: state.selected?.id || "",
    selectedProviderName: state.selected?.name || "",
  };
}

async function submitLeadToApi(payload) {
  const endpoint = `${apiBaseUrl}/api/leads`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "SMS lead API unavailable");
  }

  return response.json();
}

function saveLocalLead(payload) {
  const leads = readStoredArray("builtlocal_demo_leads", defaultPublicLeads());
  const apiLead = payload.apiResult?.lead || {};
  const lead = {
    id: apiLead.id || `lead-${Date.now()}`,
    title: payload.leadType === "direct" && payload.selectedProviderName
      ? `${payload.service} for ${payload.selectedProviderName}`
      : `${payload.service} in ${payload.town}`,
    leadType: payload.leadType,
    routingMode: payload.routingMode,
    rerouteAllowed: payload.rerouteAllowed,
    service: payload.service,
    town: payload.town,
    details: payload.details,
    contact: payload.contact,
    contactName: payload.contactName,
    preferredContact: payload.preferredContact,
    urgency: payload.urgency,
    propertyType: payload.propertyType,
    budget: payload.budget,
    availability: payload.availability,
    photoCount: payload.photoCount,
    photos: payload.photos,
    selectedProviderName: payload.selectedProviderName,
    snapshot: apiLead.snapshot || payload.snapshot,
    score: apiLead.score || payload.snapshot.score,
    intent: apiLead.intent || payload.snapshot.intent,
    status: payload.apiResult?.mode === "live"
      ? payload.leadType === "direct" ? "Direct Sent" : "SMS Routing"
      : "New",
    notes: payload.apiError ? `API fallback: ${payload.apiError}` : "",
    source: payload.apiResult?.mode === "live"
      ? payload.leadType === "direct" ? "Direct company request" : "SMS matching request"
      : "Local intake fallback",
    createdAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  localStorage.setItem("builtlocal_demo_leads", JSON.stringify(leads));
}

function createLocalSnapshot(payload) {
  const score = Math.min(100, 35
    + (/asap|emergency|today/i.test(payload.urgency) ? 18 : 0)
    + (payload.details.length > 24 ? 12 : 0)
    + (payload.photoCount > 0 ? 14 : 0)
    + (payload.budget && payload.budget !== "Not sure" ? 9 : 0)
    + (payload.availability ? 6 : 0)
    + (payload.contact ? 6 : 0));
  const intent = score >= 78 ? "High intent" : score >= 58 ? "Good fit" : "Needs follow-up";
  const photoText = payload.photoCount === 1 ? "1 photo" : `${payload.photoCount} photos`;
  return {
    title: `${payload.leadType === "direct" ? "Direct" : "Match"} | ${payload.service} | ${payload.town} | ${payload.urgency}`,
    score,
    intent,
    smsLine: `${payload.leadType === "direct" && payload.selectedProviderName ? `Direct request for ${payload.selectedProviderName}: ` : ""}${payload.service} in ${payload.town}. ${payload.urgency}. ${photoText}. ${intent}.`,
    summary: `${payload.service} request for a ${payload.propertyType.toLowerCase()} in ${payload.town}. ${payload.urgency}. ${payload.details}`,
    nextStepScript: `Thanks for reaching out through BuiltLocal. I can take a quick look and confirm next steps. Are you available ${payload.availability || "this week"}?`,
  };
}

function updateJobSnapshotPreview() {
  const payload = buildLeadPayload();
  const snapshot = createLocalSnapshot(payload);
  const routingText = payload.leadType === "direct"
    ? "Direct to selected company."
    : `${rerouteCopy(payload.urgency)}.`;
  const text = `${snapshot.smsLine}${payload.budget !== "Not sure" ? ` Budget: ${payload.budget}.` : ""} ${routingText}`;
  $("#snapshotText").textContent = text;
}

function rerouteCopy(urgency) {
  if (/emergency/i.test(urgency)) return "Premium routing checks for a claim in about 5 minutes";
  if (/asap|today/i.test(urgency)) return "Premium routing checks for a claim in about 10 minutes";
  if (/week/i.test(urgency)) return "Premium routing checks for a claim in about 30 minutes";
  return "Premium routing can keep the request open without urgent rerouting";
}

function prefillQuoteFromSelection() {
  if (!state.selected) return;
  const options = Array.from($("#quoteService").options);
  const matchingOption = options.find((option) => option.textContent.toLowerCase() === state.selected.displayCategory.toLowerCase());
  if (matchingOption) $("#quoteService").value = matchingOption.value;
  if (!$("#quoteTown").value) $("#quoteTown").value = state.selected.town || state.region || "";
}

function defaultPublicLeads() {
  return [
    {
      id: "seed-roof-morrisburg",
      title: "Roof repair needed",
      leadType: "matching",
      routingMode: "sms_matching",
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
      leadType: "direct",
      routingMode: "direct_company",
      service: "General contractor",
      town: "Iroquois",
      details: "Looking for a quote to repair a loose railing and two steps.",
      contact: "613-555-0112",
      urgency: "Flexible",
      status: "Contacted",
      notes: "Left voicemail.",
      source: "Sample lead",
      selectedProviderName: "BuiltLocal Demo Co.",
      createdAt: "2026-05-24T18:10:00.000Z",
    },
    {
      id: "seed-fence-brinston",
      title: "Fence section replacement",
      leadType: "matching",
      routingMode: "sms_matching",
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
