const DEMO_EMAIL = "demo@builtlocal.ca";
const DEMO_PIN = "2468";

const keys = {
  session: "builtlocal_pro_session",
  profile: "builtlocal_demo_profile",
  leads: "builtlocal_demo_leads",
  reviews: "builtlocal_demo_reviews",
  areas: "builtlocal_demo_service_areas",
  settings: "builtlocal_demo_settings",
};

const defaults = {
  profile: {
    name: "BuiltLocal Demo Co.",
    service: "General Contractor",
    phone: "613-555-0198",
    email: DEMO_EMAIL,
    website: "https://builtlocal.ca/demo",
    photo: "",
    description: "Rural general contracting, fencing, deck repair, and property maintenance across South Dundas.",
    tags: "Fencing, decks, home repair, renovations, rural property maintenance",
  },
  leads: [
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
  ],
  reviews: [],
  areas: {
    primaryTown: "Morrisburg",
    radius: 30,
    allSdg: false,
    towns: "Morrisburg, Iroquois, Williamsburg, Brinston",
  },
  settings: {
    plan: "Demo Pro Account",
    email: DEMO_EMAIL,
    leadAlerts: true,
    reviewAlerts: true,
  },
};

const state = {
  profile: readObject(keys.profile, defaults.profile),
  leads: readArray(keys.leads, defaults.leads),
  reviews: readArray(keys.reviews, defaults.reviews),
  areas: readObject(keys.areas, defaults.areas),
  settings: readObject(keys.settings, defaults.settings),
  selectedLeadId: "",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

init();

function init() {
  seedMissingState();
  wireEvents();
  showAuthenticatedView(localStorage.getItem(keys.session) === "true");
  renderAll();
  initIcons();
}

function seedMissingState() {
  if (!localStorage.getItem(keys.profile)) writeObject(keys.profile, state.profile);
  if (!localStorage.getItem(keys.leads)) writeObject(keys.leads, state.leads);
  if (!localStorage.getItem(keys.reviews)) writeObject(keys.reviews, state.reviews);
  if (!localStorage.getItem(keys.areas)) writeObject(keys.areas, state.areas);
  if (!localStorage.getItem(keys.settings)) writeObject(keys.settings, state.settings);
}

function wireEvents() {
  $("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const pin = $("#loginPin").value.trim();
    if (email !== DEMO_EMAIL || pin !== DEMO_PIN) {
      $("#loginError").hidden = false;
      return;
    }
    $("#loginError").hidden = true;
    localStorage.setItem(keys.session, "true");
    showAuthenticatedView(true);
  });

  document.addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-pro-tab]");
    const signOutButton = event.target.closest("[data-sign-out]");
    const leadButton = event.target.closest("[data-lead-id]");
    const createLeadButton = event.target.closest("[data-create-lead]");
    const saveLeadButton = event.target.closest("[data-save-lead]");
    const addReviewButton = event.target.closest("[data-add-review]");
    const copyReviewButton = event.target.closest("[data-copy-review]");

    if (tabButton) setProTab(tabButton.dataset.proTab);
    if (signOutButton) {
      localStorage.removeItem(keys.session);
      showAuthenticatedView(false);
    }
    if (leadButton) {
      state.selectedLeadId = leadButton.dataset.leadId;
      renderLeads();
    }
    if (createLeadButton) {
      createManualLead();
      renderAll();
      setProTab("leads");
    }
    if (saveLeadButton) saveSelectedLead();
    if (addReviewButton) {
      addMockReview();
      renderAll();
    }
    if (copyReviewButton) copyReviewInvite();
  });

  $("#profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      name: $("#profileName").value.trim(),
      service: $("#profileService").value.trim(),
      phone: $("#profilePhoneInput").value.trim(),
      email: $("#profileEmail").value.trim(),
      website: $("#profileWebsite").value.trim(),
      photo: $("#profilePhoto").value.trim(),
      description: $("#profileDescription").value.trim(),
      tags: $("#profileTagsInput").value.trim(),
    };
    writeObject(keys.profile, state.profile);
    flash("#profileSaved");
    renderHeader();
  });

  $("#areasForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.areas = {
      primaryTown: $("#areaPrimaryTown").value.trim(),
      radius: Number($("#areaRadius").value) || 0,
      allSdg: $("#areaAllSdg").checked,
      towns: $("#areaTowns").value.trim(),
    };
    writeObject(keys.areas, state.areas);
    flash("#areasSaved");
  });

  $("#settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = {
      plan: $("#settingsPlan").value,
      email: $("#settingsEmail").value.trim(),
      leadAlerts: $("#settingsLeadAlerts").checked,
      reviewAlerts: $("#settingsReviewAlerts").checked,
    };
    writeObject(keys.settings, state.settings);
    flash("#settingsSaved");
  });
}

function showAuthenticatedView(isSignedIn) {
  $("#loginView").hidden = isSignedIn;
  $("#dashboardView").hidden = !isSignedIn;
  if (isSignedIn) {
    setProTab("leads");
  }
}

function renderAll() {
  renderHeader();
  renderMetrics();
  renderLeads();
  renderAnalytics();
  renderProfileForm();
  renderReviews();
  renderAreasForm();
  renderSettingsForm();
  initIcons();
}

function renderHeader() {
  $("#dashboardTitle").textContent = `Welcome back, ${state.profile.name || "BuiltLocal Demo Co."}`;
}

function renderMetrics() {
  const newLeads = state.leads.filter((lead) => lead.status === "New").length;
  const openLeads = state.leads.filter((lead) => !["Won", "Archived"].includes(lead.status)).length;
  const approvedReviews = state.reviews.filter((review) => review.status === "Approved").length;
  const actioned = state.leads.filter((lead) => ["Contacted", "Quoted", "Won"].includes(lead.status)).length;
  const responseRate = state.leads.length ? Math.round((actioned / state.leads.length) * 100) : 0;

  $("#metricNewLeads").textContent = newLeads;
  $("#metricOpenLeads").textContent = openLeads;
  $("#metricReviews").textContent = approvedReviews;
  $("#metricResponse").textContent = `${responseRate}%`;
}

function renderLeads() {
  if (!state.selectedLeadId && state.leads.length) state.selectedLeadId = state.leads[0].id;

  $("#leadList").innerHTML = state.leads.map((lead) => `
    <button class="lead-item pro-lead-item${lead.id === state.selectedLeadId ? " active" : ""}" type="button" data-lead-id="${escapeHtml(lead.id)}">
      <i data-lucide="file-text"></i>
      <div>
        <strong>${escapeHtml(lead.title)}</strong>
        <span>${escapeHtml(lead.town)} - ${relativeDate(lead.createdAt)}</span>
      </div>
      <em class="${statusClass(lead.status)}">${escapeHtml(lead.status)}</em>
    </button>
  `).join("");

  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  $("#leadDetail").innerHTML = selected ? leadDetailHtml(selected) : `
    <i data-lucide="file-text"></i>
    <strong>No leads yet</strong>
    <span>Quote requests from the public site will appear here.</span>
  `;
  initIcons();
}

function leadDetailHtml(lead) {
  return `
    <div class="detail-card">
      <p class="section-kicker">Lead detail</p>
      <h2>${escapeHtml(lead.title)}</h2>
      <dl class="detail-list">
        <div><dt>Service</dt><dd>${escapeHtml(lead.service)}</dd></div>
        <div><dt>Town</dt><dd>${escapeHtml(lead.town)}</dd></div>
        <div><dt>Urgency</dt><dd>${escapeHtml(lead.urgency)}</dd></div>
        <div><dt>Contact</dt><dd>${escapeHtml(lead.contact)}</dd></div>
        <div><dt>Source</dt><dd>${escapeHtml(lead.source)}</dd></div>
      </dl>
      <p>${escapeHtml(lead.details)}</p>
      <label>Status
        <select id="leadStatus">
          ${["New", "Contacted", "Quoted", "Won", "Archived"].map((status) =>
            `<option value="${status}"${status === lead.status ? " selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </label>
      <label>Internal notes
        <textarea id="leadNotes" rows="4">${escapeHtml(lead.notes)}</textarea>
      </label>
      <button class="primary-button compact" type="button" data-save-lead>
        <i data-lucide="save"></i>
        Save Lead
      </button>
      <span class="inline-success" id="leadSaved" hidden>Lead saved.</span>
    </div>
  `;
}

function saveSelectedLead() {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (!selected) return;
  selected.status = $("#leadStatus").value;
  selected.notes = $("#leadNotes").value.trim();
  writeObject(keys.leads, state.leads);
  renderMetrics();
  renderAnalytics();
  renderLeads();
  flash("#leadSaved");
}

function createManualLead() {
  const lead = {
    id: `manual-${Date.now()}`,
    title: "Manual follow-up lead",
    service: state.profile.service || "General contractor",
    town: state.areas.primaryTown || "Morrisburg",
    details: "Added from the Pro dashboard to test lead handling.",
    contact: state.settings.email || DEMO_EMAIL,
    urgency: "Flexible",
    status: "New",
    notes: "",
    source: "Manual Pro entry",
    createdAt: new Date().toISOString(),
  };
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  writeObject(keys.leads, state.leads);
}

function renderAnalytics() {
  const won = state.leads.filter((lead) => lead.status === "Won").length;
  const contacted = state.leads.filter((lead) => ["Contacted", "Quoted", "Won"].includes(lead.status)).length;
  const archived = state.leads.filter((lead) => lead.status === "Archived").length;
  const towns = [...new Set(state.leads.map((lead) => lead.town).filter(Boolean))];
  $("#analyticsTotal").textContent = state.leads.length;
  $("#analyticsWon").textContent = won;
  $("#analyticsContacted").textContent = contacted;
  $("#analyticsArchived").textContent = archived;
  $("#analyticsSummary").textContent = state.leads.length
    ? `${state.leads.length} leads across ${towns.length || 1} local areas. Most recent requests are shown first.`
    : "Lead activity will appear as residents request quotes.";
}

function renderProfileForm() {
  $("#profileName").value = state.profile.name;
  $("#profileService").value = state.profile.service;
  $("#profilePhoneInput").value = state.profile.phone;
  $("#profileEmail").value = state.profile.email;
  $("#profileWebsite").value = state.profile.website;
  $("#profilePhoto").value = state.profile.photo;
  $("#profileDescription").value = state.profile.description;
  $("#profileTagsInput").value = state.profile.tags;
}

function renderReviews() {
  $("#reviewInvite").value = `${location.origin}${basePath()}review/demo-co`;
  $("#reviewList").innerHTML = state.reviews.length ? state.reviews.map((review) => `
    <article class="lead-item review-row">
      <i data-lucide="message-square-heart"></i>
      <div>
        <strong>${escapeHtml(review.name)} - ${escapeHtml(review.rating)} stars</strong>
        <span>${escapeHtml(review.text)}</span>
      </div>
      <em class="${review.status === "Approved" ? "blue" : "gold"}">${escapeHtml(review.status)}</em>
    </article>
  `).join("") : `
    <div class="empty-state">
      <i data-lucide="message-square-heart"></i>
      <strong>No reviews yet</strong>
      <span>Use Add Mock Review to test the moderation workflow.</span>
    </div>
  `;
}

function addMockReview() {
  state.reviews.unshift({
    id: `review-${Date.now()}`,
    name: "Local homeowner",
    rating: 5,
    text: "Responsive, clear, and easy to work with.",
    status: state.reviews.length % 2 === 0 ? "Pending" : "Approved",
    createdAt: new Date().toISOString(),
  });
  writeObject(keys.reviews, state.reviews);
}

async function copyReviewInvite() {
  const input = $("#reviewInvite");
  input.select();
  try {
    await navigator.clipboard.writeText(input.value);
  } catch (error) {
    document.execCommand("copy");
  }
  flash("#reviewCopied");
}

function renderAreasForm() {
  $("#areaPrimaryTown").value = state.areas.primaryTown;
  $("#areaRadius").value = state.areas.radius;
  $("#areaAllSdg").checked = state.areas.allSdg;
  $("#areaTowns").value = state.areas.towns;
}

function renderSettingsForm() {
  $("#settingsPlan").value = state.settings.plan;
  $("#settingsEmail").value = state.settings.email;
  $("#settingsLeadAlerts").checked = state.settings.leadAlerts;
  $("#settingsReviewAlerts").checked = state.settings.reviewAlerts;
}

function setProTab(tabName) {
  $$("[data-pro-tab]").forEach((button) => button.classList.toggle("active", button.dataset.proTab === tabName));
  $$("[data-pro-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.proPanel === tabName));
}

function readObject(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ...fallback, ...parsed } : { ...fallback };
  } catch (error) {
    return { ...fallback };
  }
}

function readArray(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(parsed) ? parsed : fallback.map((item) => ({ ...item }));
  } catch (error) {
    return fallback.map((item) => ({ ...item }));
  }
}

function writeObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function relativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffHours = Math.max(1, Math.round((Date.now() - date.getTime()) / 36e5));
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function statusClass(status) {
  if (status === "Contacted" || status === "Quoted") return "blue";
  if (status === "Won") return "";
  if (status === "Archived") return "gold";
  return "";
}

function flash(selector) {
  const element = $(selector);
  if (!element) return;
  element.hidden = false;
  setTimeout(() => {
    element.hidden = true;
  }, 2200);
}

function basePath() {
  return location.pathname.replace(/\/pro\/?$/, "/");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
