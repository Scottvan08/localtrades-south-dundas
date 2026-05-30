const state = {
  rows: [],
  selected: null,
  reviews: [],
};

const defaultApiBaseUrl = location.hostname.endsWith("github.io") || location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "https://localtrades-south-dundas.vercel.app"
  : "";
const apiBaseUrl = (window.BUILTLOCAL_API_BASE || localStorage.getItem("builtlocal_api_base") || defaultApiBaseUrl).replace(/\/$/, "");

const imagePoolsByCategory = {
  Plumbing: ["https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80"],
  HVAC: ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80"],
  Electrical: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80"],
  "General Contractor": ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80"],
  "Home Repair": ["https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?auto=format&fit=crop&w=900&q=80"],
  Roofing: ["https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=900&q=80"],
  Landscaping: ["https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80"],
  Excavation: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=900&q=80"],
  default: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80"],
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

const reviewTownOptions = [
  ...Object.values(localAreaConfig).flatMap((areas) => Object.keys(areas)),
  ...Object.values(localAreaConfig).flatMap((areas) => Object.values(areas)).flat(),
  "Cornwall",
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

init();

async function init() {
  wireEvents();
  initIcons();

  try {
    const response = await fetch("../sdg-seed-listings.csv");
    const csv = await response.text();
    state.rows = enrichRows(parseCsv(csv));
  } catch (error) {
    state.rows = [];
  }

  const id = new URLSearchParams(location.search).get("id");
  state.selected = state.rows.find((row) => row.id === id) || state.rows[0] || null;
  await loadApprovedReviews();
  renderProfile();
  initIcons();
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-direct-quote]")) openQuoteDialog();
    if (event.target.closest("[data-open-review]")) openReviewDialog();
    if (event.target.closest("[data-close-dialog]")) event.target.closest("dialog")?.close();
  });

  $("#quoteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveQuoteLead(event.submitter);
  });

  $("#reviewForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitReview(event.submitter);
  });
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
    const localTown = row.town || "South Dundas";
    const localArea = row.local_area || localAreaForTown(localTown) || "South Dundas";
    const areas = serviceAreasFor(row, localArea);
    const serviceRadiusKm = localArea === "Cornwall & Area" || /serves sd&g/i.test(row.service_area_notes || "") ? 55 : 30;

    return {
      ...row,
      id: `${slugify(row.name)}-${index}`,
      displayCategory: primary,
      tags: buildTags(row, primary),
      image: imageForCategory(primary, row.name),
      replies: 12 + (seed % 47),
      jobs: 18 + (seed % 126),
      claimed: row.source === "BuiltLocal demo",
      sourceVerified: row.confidence === "High",
      availableToday: seed % 3 !== 0,
      distance: serviceRadiusKm === 30 ? "0-30 km" : "Serves region",
      serviceAreas: areas,
      serviceText: areas.slice(0, 4).join(", "),
      serviceRadiusKm,
    };
  });
}

function demoBusinessRow() {
  return {
    name: "BuiltLocal Demo Co.",
    primary_category: "General Contractor",
    secondary_categories: "Fencing; decks; home repair; renovations; rural property maintenance",
    town: "Morrisburg",
    phone: "613-555-0198",
    email: "demo@builtlocal.ca",
    website: "",
    source: "BuiltLocal demo",
    confidence: "Medium",
    notes: "Prototype demo business for testing claimed profile and Pro Dashboard flow.",
    county: "Dundas",
    local_area: "South Dundas",
    service_area_notes: "Demo profile serving SD&G",
  };
}

function renderProfile() {
  const row = state.selected;
  if (!row) {
    $("#profileTitle").textContent = "Contractor not found";
    $("#profileSubtitle").textContent = "Return to the directory and choose another listing.";
    return;
  }

  document.title = `${row.name} | BuiltLocal SD&G`;
  const reviews = reviewsForProvider(row);
  const summary = reviewSummaryFor(row);
  const phoneHref = row.phone ? `tel:${row.phone.replace(/[^0-9+]/g, "")}` : "#";

  $("#profileImage").src = row.image;
  $("#profileImage").alt = `${row.name} project image`;
  $("#profileTitle").textContent = row.name;
  $("#profileSubtitle").textContent = `${row.displayCategory} serving ${row.serviceText}`;
  $("#profileReviews").textContent = summary.label;
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
  $("#messageButton").href = phoneHref;
  $("#stickyCallButton").href = phoneHref;
  $("#messageButton").hidden = !row.phone;
  $("#stickyCallButton").hidden = !row.phone;
  $("#profileTags").innerHTML = row.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  renderProfileReviews(reviews);
}

async function loadApprovedReviews() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/reviews`);
    if (!response.ok) throw new Error(await response.text());
    const payload = await response.json();
    state.reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
  } catch (error) {
    state.reviews = [];
  }
}

function reviewsForProvider(row) {
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
  };
}

function renderProfileReviews(reviews) {
  const container = $("#profileReviewList");
  const publicGrid = $("#publicReviewGrid");
  if (!reviews.length) {
    const empty = `
      <div class="profile-review-empty">
        <strong>No local reviews yet</strong>
        <span>Submitted reviews are checked before publishing.</span>
        <button class="secondary-button compact" type="button" data-open-review>
          <i data-lucide="message-square-plus"></i>
          Be the first to review
        </button>
      </div>
    `;
    container.innerHTML = empty;
    publicGrid.innerHTML = `<article class="review-card">${empty}</article>`;
    return;
  }

  container.innerHTML = reviews.slice(0, 3).map(reviewCardHtml).join("");
  publicGrid.innerHTML = reviews.slice(0, 6).map(reviewCardHtml).join("");
}

function reviewCardHtml(review) {
  const firstName = review.reviewer_first_name || review.firstName || "Local resident";
  const town = review.reviewer_town || review.town || "SD&G";
  const service = review.service_used || review.serviceUsed || "Service";
  const text = review.review_text || review.reviewText || "";
  return `
    <article class="review-card published-review">
      <div class="avatar">${escapeHtml(String(review.rating || ""))}</div>
      <div>
        <strong>${escapeHtml(firstName)} in ${escapeHtml(town)}</strong>
        <span>${escapeHtml(service)}</span>
        <p>${escapeHtml(text)}</p>
      </div>
    </article>
  `;
}

function openQuoteDialog() {
  const row = state.selected;
  $("#quoteSuccess").hidden = true;
  $("#quoteError").hidden = true;
  $("#quoteTitle").textContent = `Request a quote from ${row.name}.`;
  $("#quoteModeNote").textContent = `This request goes directly to ${row.name}. BuiltLocal will not match it with other providers from this page.`;
  setSelectValue("#quoteService", row.displayCategory);
  $("#quoteTown").value = row.town || "";
  $("#quoteDialog").showModal();
  initIcons();
}

async function saveQuoteLead(submitButton) {
  const payload = buildLeadPayload();
  const originalButtonHtml = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader-circle"></i> Sending...';
    initIcons();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    saveLocalLead(payload);
    $("#quoteSuccess").hidden = false;
    $("#quoteError").hidden = true;
    $("#quoteForm").reset();
    setSelectValue("#quoteService", state.selected.displayCategory);
    $("#quoteTown").value = state.selected.town || "";
  } catch (error) {
    saveLocalLead({ ...payload, apiError: error.message });
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
  const row = state.selected;
  return {
    leadType: "direct",
    routingMode: "direct_company",
    rerouteAllowed: false,
    service: $("#quoteService").value,
    town: $("#quoteTown").value.trim() || row.town || "SD&G",
    details: $("#quoteDetails").value.trim() || "Resident requested follow-up from the public contractor profile.",
    contactName: $("#quoteName").value.trim(),
    contact: $("#quoteContact").value.trim() || "Contact not provided",
    preferredContact: $("#quoteContactMethod").value,
    urgency: $("#quoteUrgency").value,
    propertyType: $("#quoteProperty").value,
    budget: "Not sure",
    availability: $("#quoteAvailability").value.trim(),
    photoCount: 0,
    photos: [],
    selectedProviderId: row.id,
    selectedProviderName: row.name,
  };
}

function saveLocalLead(payload) {
  const leads = readStoredArray("builtlocal_demo_leads", []);
  leads.unshift({
    id: `lead-${Date.now()}`,
    title: `${payload.service} for ${payload.selectedProviderName}`,
    ...payload,
    status: "New",
    source: "Direct company request",
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("builtlocal_demo_leads", JSON.stringify(leads));
}

function openReviewDialog() {
  const row = state.selected;
  $("#reviewError").hidden = true;
  $("#reviewProviderName").value = row.name;
  $("#reviewServiceUsed").value = row.displayCategory;
  $("#reviewTown").value = row.town || "";
  $("#reviewDialog").showModal();
  initIcons();
}

async function submitReview(submitButton) {
  const row = state.selected;
  const payload = {
    providerId: row.id,
    providerName: row.name,
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
    const response = await fetch(`${apiBaseUrl}/api/reviews`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await readResponseError(response));
    $("#reviewForm").reset();
    $("#reviewDialog").close();
    showSiteNotice("Thanks. Your review was submitted and will be checked before publishing.");
  } catch (error) {
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

function validateReviewPayload(payload) {
  if (!payload.providerId) return "Choose a business from the BuiltLocal directory list.";
  if (!/^[a-z][a-z .'-]{1,39}$/i.test(payload.firstName)) return "Enter your first name only.";
  if (!reviewTownOptions.some((town) => normalizeSearchText(town) === normalizeSearchText(payload.town))) {
    return "Choose a town or area from the SD&G suggestions.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(payload.email)) return "Enter a valid email address.";
  if (!/[a-z]/i.test(payload.serviceUsed) || payload.serviceUsed.length < 3 || payload.serviceUsed.length > 80) return "Enter the service that was used.";
  if (payload.workDate && !isValidReviewWorkDate(payload.workDate)) return "Use a month and year like May 2026.";
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

function normalizePrimaryCategory(primary, secondary) {
  const haystack = `${primary} ${secondary}`.toLowerCase();
  if (haystack.includes("paving") || haystack.includes("asphalt")) return "Paving";
  if (haystack.includes("snow")) return "Snow Removal";
  if (haystack.includes("septic")) return "Septic Services";
  if (haystack.includes("concrete") || haystack.includes("cement")) return "Concrete";
  if (haystack.includes("roof")) return "Roofing";
  if (haystack.includes("plumb")) return "Plumbing";
  if (haystack.includes("electric")) return "Electrical";
  if (haystack.includes("hvac") || haystack.includes("heating") || haystack.includes("cooling")) return "HVAC";
  if (haystack.includes("tree")) return "Tree Service";
  if (haystack.includes("drywall") || haystack.includes("handyman") || haystack.includes("home repair")) return "Home Repair";
  if (haystack.includes("lawn") || haystack.includes("landscap")) return "Landscaping";
  return primary || "General Contractor";
}

function buildTags(row, primary) {
  return [primary]
    .concat((row.secondary_categories || "").split(";"))
    .concat(row.confidence === "High" ? ["Verified source"] : ["Needs verification"])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, 5);
}

function imageForCategory(category, businessName) {
  const pool = imagePoolsByCategory[category] || imagePoolsByCategory.default;
  return pool[hashString(businessName || category) % pool.length];
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
  const localTowns = localAreaConfig[localAreaToCounty[localArea]]?.[localArea] || [];
  const areas = [localArea].concat(localTowns);
  if (row.town && !areas.includes(row.town)) areas.push(row.town);
  if (/serves sd&g/i.test(row.service_area_notes || "")) areas.push("SD&G", "Stormont", "Dundas", "Glengarry", "Cornwall");
  return areas.filter(Boolean);
}

function setSelectValue(selector, value) {
  const select = $(selector);
  const option = Array.from(select.options).find((item) => item.textContent.toLowerCase() === String(value).toLowerCase());
  if (option) select.value = option.value;
}

function readStoredArray(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch (error) {
    return fallback;
  }
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

function normalizeBusinessNameForReviews(value) {
  return String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function slugify(value) {
  return normalizeSearchText(value).replace(/\s+/g, "-") || "listing";
}

function hashString(value) {
  return String(value || "").split("").reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0) >>> 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}
