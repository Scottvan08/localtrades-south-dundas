const DEMO_EMAIL = "demo@builtlocal.ca";
const DEMO_PIN = "2468";
const PRIMARY_STATUSES = ["New", "Claimed", "Contacted", "Handled"];
const LEAD_FILTERS = ["Active", "Unreviewed", "New", "Claimed", "Contacted", "Handled", "Rejected"];

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
  mobileLeadOpen: false,
  leadFilter: "Active",
  leadSort: "attention",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
let activeRecognition = null;

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
    const menuToggleButton = event.target.closest("[data-pro-menu-toggle]");
    const leadButton = event.target.closest("[data-lead-id]");
    const createLeadButton = event.target.closest("[data-create-lead]");
    const saveLeadButton = event.target.closest("[data-save-lead]");
    const saveNoteButton = event.target.closest("[data-save-note]");
    const acceptLeadButton = event.target.closest("[data-accept-lead]");
    const backLeadsButton = event.target.closest("[data-back-leads]");
    const addReviewButton = event.target.closest("[data-add-review]");
    const copyReviewButton = event.target.closest("[data-copy-review]");
    const closeLeadActionsButton = event.target.closest("[data-close-lead-actions]");
    const forwardContactButton = event.target.closest("[data-forward-contact]");
    const leadFilterButton = event.target.closest("[data-lead-filter]");
    const dictateNotesButton = event.target.closest("[data-dictate-notes]");
    const statusChoiceButton = event.target.closest("[data-status-choice]");
    const rejectLeadButton = event.target.closest("[data-reject-lead]");
    const confirmRejectButton = event.target.closest("[data-confirm-reject]");
    const cancelRejectButton = event.target.closest("[data-cancel-reject]");
    const contactLeadButton = event.target.closest("[data-contact-lead]");

    if (menuToggleButton) toggleProMenu();
    if (closeLeadActionsButton) closeLeadActionSheet();
    if (forwardContactButton) forwardContactCard();
    if (contactLeadButton) showSelectedLeadActionSheet();
    if (rejectLeadButton) openRejectLeadDialog();
    if (confirmRejectButton) rejectSelectedLead();
    if (cancelRejectButton) closeRejectLeadDialog();
    if (statusChoiceButton) setSelectedLeadStatus(statusChoiceButton.dataset.statusChoice);
    if (leadFilterButton) {
      state.leadFilter = leadFilterButton.dataset.leadFilter;
      state.mobileLeadOpen = false;
      renderLeads();
    }
    if (dictateNotesButton) toggleVoiceNotes();
    if (tabButton) {
      setProTab(tabButton.dataset.proTab);
      closeProMenu();
    }
    if (signOutButton) {
      localStorage.removeItem(keys.session);
      showAuthenticatedView(false);
      closeProMenu();
    }
    if (leadButton) {
      state.selectedLeadId = leadButton.dataset.leadId;
      markLeadReviewed(state.selectedLeadId);
      state.mobileLeadOpen = isMobilePro();
      renderLeads();
      if (state.mobileLeadOpen) {
        $("#leadDetail")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    if (backLeadsButton) {
      state.mobileLeadOpen = false;
      renderLeads();
      $("#leadList")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (createLeadButton) {
      createManualLead();
      state.mobileLeadOpen = false;
      renderAll();
      setProTab("leads");
    }
    if (acceptLeadButton) acceptSelectedLead();
    if (saveLeadButton) saveSelectedLead();
    if (saveNoteButton) saveSelectedLeadNote();
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

  $("#leadSort").addEventListener("change", (event) => {
    state.leadSort = event.target.value;
    renderLeads();
  });
}

function toggleProMenu() {
  const menu = $("#proMenu");
  const button = $("[data-pro-menu-toggle]");
  const isOpen = menu.classList.toggle("open");
  button.setAttribute("aria-expanded", String(isOpen));
}

function closeProMenu() {
  const menu = $("#proMenu");
  const button = $("[data-pro-menu-toggle]");
  if (!menu || !button) return;
  menu.classList.remove("open");
  button.setAttribute("aria-expanded", "false");
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
  const unreviewedLeads = state.leads.filter((lead) => !lead.reviewedAt).length;
  const newReviews = state.reviews.filter((review) => review.status === "Pending").length;

  $("#metricUnreviewedLeads").textContent = unreviewedLeads;
  $("#metricNewReviews").textContent = newReviews;
}

function renderLeads() {
  const sortedLeads = sortedLeadList();
  if (state.selectedLeadId && !sortedLeads.some((lead) => lead.id === state.selectedLeadId)) {
    state.selectedLeadId = "";
  }
  const leadsPanel = document.querySelector('[data-pro-panel="leads"]');
  leadsPanel?.classList.toggle("mobile-detail-open", state.mobileLeadOpen);
  $(".pro-main")?.classList.toggle("mobile-detail-open", state.mobileLeadOpen);
  renderLeadControls();

  $("#leadList").innerHTML = sortedLeads.length ? sortedLeads.map((lead) => `
    <button class="lead-item pro-lead-item${lead.id === state.selectedLeadId ? " active" : ""}${isActionableLead(lead) ? " is-actionable" : ""}${!lead.reviewedAt ? " is-unreviewed" : ""}" type="button" data-lead-id="${escapeHtml(lead.id)}">
      <i data-lucide="file-text"></i>
      <div>
        <strong>${escapeHtml(lead.title)}</strong>
        <span>${escapeHtml(lead.town)} - ${relativeDate(lead.createdAt)}${!lead.reviewedAt ? " - Unreviewed" : ""}</span>
      </div>
      <em class="${statusClass(lead.status)}">${escapeHtml(lead.status)}</em>
    </button>
  `).join("") : `
    <div class="empty-state">
      <i data-lucide="inbox"></i>
      <strong>No leads match this view</strong>
      <span>Try Active or a different status filter.</span>
    </div>
  `;

  const selected = state.selectedLeadId ? state.leads.find((lead) => lead.id === state.selectedLeadId) : null;
  $("#leadDetail").innerHTML = selected ? leadDetailHtml(selected) : `
    <i data-lucide="file-text"></i>
    <strong>Select a lead</strong>
    <span>Lead details, status, and internal notes appear here.</span>
  `;
  initIcons();
}

function renderLeadControls() {
  $("#leadFilterChips").innerHTML = LEAD_FILTERS.map((filter) => `
    <button class="chip${state.leadFilter === filter ? " active" : ""}" type="button" data-lead-filter="${escapeHtml(filter)}">
      ${escapeHtml(filter)}
    </button>
  `).join("");
  $("#leadSort").value = state.leadSort;
}

function leadDetailHtml(lead) {
  const snapshot = lead.snapshot || {};
  const leadTypeLabel = lead.leadType === "direct" ? "Direct company request" : "SMS matching request";
  const statusOptions = PRIMARY_STATUSES.includes(lead.status) ? PRIMARY_STATUSES : [lead.status, ...PRIMARY_STATUSES];
  return `
    <div class="detail-card">
      <button class="secondary-button compact mobile-back-leads" type="button" data-back-leads>
        <i data-lucide="arrow-left"></i>
        Back to leads
      </button>
      <div class="lead-action-toolbar" aria-label="Lead actions">
        <details class="lead-status-menu">
          <summary class="lead-toolbar-button">
            <i data-lucide="circle-dot"></i>
            <span>Status</span>
          </summary>
          <div class="lead-status-options">
            ${statusOptions.map((status) => `
              <button class="${lead.status === status ? "active" : ""}" type="button" data-status-choice="${escapeHtml(status)}">
                ${escapeHtml(status)}
              </button>
            `).join("")}
          </div>
        </details>
        <button class="lead-toolbar-button" type="button" data-contact-lead>
          <i data-lucide="phone"></i>
          <span>Contact</span>
        </button>
        <button class="lead-toolbar-button" type="button" data-forward-contact>
          <i data-lucide="share-2"></i>
          <span>Forward</span>
        </button>
        <button class="lead-toolbar-button danger" type="button" data-reject-lead>
          <i data-lucide="x-circle"></i>
          <span>Reject</span>
        </button>
      </div>
      <p class="section-kicker">Lead detail</p>
      <div class="lead-detail-title">
        <h2>${escapeHtml(lead.title)}</h2>
        <em class="${statusClass(lead.status)}">${escapeHtml(lead.status)}</em>
      </div>
      <span class="demo-mode-note">${escapeHtml(leadTypeLabel)}${lead.selectedProviderName ? ` for ${escapeHtml(lead.selectedProviderName)}` : ""}</span>
      <div class="job-snapshot-preview">
        <i data-lucide="message-square-text"></i>
        <div>
          <strong>${escapeHtml(snapshot.intent || lead.intent || "Job Snapshot")}${snapshot.score || lead.score ? ` - ${escapeHtml(snapshot.score || lead.score)}/100` : ""}</strong>
          <span>${escapeHtml(snapshot.smsLine || snapshot.summary || lead.details)}</span>
        </div>
      </div>
      <dl class="detail-list">
        <div><dt>Service</dt><dd>${escapeHtml(lead.service)}</dd></div>
        <div><dt>Town</dt><dd>${escapeHtml(lead.town)}</dd></div>
        <div><dt>Urgency</dt><dd>${escapeHtml(lead.urgency)}</dd></div>
        <div><dt>Contact</dt><dd>${escapeHtml(lead.contact)}</dd></div>
        <div><dt>Preferred</dt><dd>${escapeHtml(lead.preferredContact || "Text")}</dd></div>
        <div><dt>Photos</dt><dd>${escapeHtml(lead.photoCount || 0)}</dd></div>
        <div><dt>Source</dt><dd>${escapeHtml(lead.source)}</dd></div>
      </dl>
      <p>${escapeHtml(lead.details)}</p>
      <label class="notes-label">
        <span class="notes-label-head">
          <span>Internal notes</span>
        </span>
        <textarea id="leadNotes" rows="4">${escapeHtml(lead.notes)}</textarea>
        <span class="notes-action-row">
          ${speechRecognitionConstructor() ? `
            <button class="secondary-button compact note-dictate-button" type="button" data-dictate-notes aria-label="Dictate note">
              <i data-lucide="mic"></i>
              Dictate
            </button>
          ` : ""}
          <button class="primary-button compact" type="button" data-save-note>
            <i data-lucide="save"></i>
            Save Note
          </button>
        </span>
      </label>
      <span class="inline-success no-margin" id="voiceNoteStatus" hidden>Listening...</span>
      <span class="inline-success" id="leadSaved" hidden>Lead saved.</span>
    </div>
  `;
}

function sortedLeadList() {
  return state.leads
    .filter((lead) => leadMatchesFilter(lead))
    .sort((a, b) => {
      if (state.leadSort === "newest") return leadDateValue(b) - leadDateValue(a);
      if (state.leadSort === "urgency") {
        const urgencyDiff = urgencyRank(a.urgency) - urgencyRank(b.urgency);
        return urgencyDiff || leadDateValue(b) - leadDateValue(a);
      }
      if (state.leadSort === "status") {
        const statusDiff = leadStatusRank(a.status) - leadStatusRank(b.status);
        return statusDiff || leadDateValue(b) - leadDateValue(a);
      }
      return attentionRank(a) - attentionRank(b) || leadDateValue(b) - leadDateValue(a);
    });
}

function leadMatchesFilter(lead) {
  if (state.leadFilter === "Active") return !isHiddenLead(lead);
  if (state.leadFilter === "Unreviewed") return !lead.reviewedAt;
  return lead.status === state.leadFilter;
}

function leadDateValue(lead) {
  return new Date(lead.createdAt || 0).getTime() || 0;
}

function attentionRank(lead) {
  if (isHiddenLead(lead)) return 99;
  if (!lead.reviewedAt && isActionableLead(lead)) return 0;
  if (!lead.reviewedAt) return 1;
  if (isActionableLead(lead)) return 2;
  return 10 + leadStatusRank(lead.status) + urgencyRank(lead.urgency) / 10;
}

function leadStatusRank(status) {
  if (["New", "SMS Routing", "Direct Sent"].includes(status)) return 0;
  if (status === "Claimed") return 1;
  if (status === "Contacted") return 2;
  if (status === "Handled") return 3;
  if (status === "Rejected") return 4;
  if (["Quoted", "Won", "Archived"].includes(status)) return 5;
  return 4;
}

function isActionableLead(lead) {
  return leadStatusRank(lead.status) === 0;
}

function isHiddenLead(lead) {
  return lead.status === "Handled" || lead.status === "Rejected";
}

function urgencyRank(urgency) {
  if (/emergency/i.test(urgency || "")) return 0;
  if (/asap|today/i.test(urgency || "")) return 1;
  if (/week/i.test(urgency || "")) return 2;
  if (/flexible|research/i.test(urgency || "")) return 4;
  return 3;
}

function markLeadReviewed(leadId) {
  const lead = state.leads.find((item) => item.id === leadId);
  if (!lead || lead.reviewedAt) return;
  lead.reviewedAt = new Date().toISOString();
  writeObject(keys.leads, state.leads);
  renderMetrics();
}

function isMobilePro() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function acceptSelectedLead() {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (!selected) return;
  setLeadStatus(selected, "Claimed");
  showLeadActionSheet(selected);
}

function saveSelectedLead() {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (!selected) return;
  selected.notes = $("#leadNotes").value.trim();
  writeObject(keys.leads, state.leads);
  renderMetrics();
  renderAnalytics();
  renderLeads();
  flash("#leadSaved");
}

function saveSelectedLeadNote() {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (!selected) return;
  selected.notes = $("#leadNotes").value.trim();
  writeObject(keys.leads, state.leads);
  flash("#leadSaved");
}

function setSelectedLeadStatus(status) {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (!selected || !status) return;
  setLeadStatus(selected, status);
}

function setLeadStatus(lead, status) {
  lead.status = status;
  if (status === "Handled") lead.handledAt = new Date().toISOString();
  if (status !== "Handled") delete lead.handledAt;
  if (status !== "Rejected") delete lead.rejectedAt;
  writeObject(keys.leads, state.leads);
  renderMetrics();
  renderAnalytics();
  if (isHiddenLead(lead) && state.leadFilter === "Active") {
    state.selectedLeadId = "";
    state.mobileLeadOpen = false;
  }
  renderLeads();
  flash("#leadSaved");
}

function openRejectLeadDialog() {
  const dialog = $("#rejectLeadDialog");
  if (!dialog) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  initIcons();
}

function closeRejectLeadDialog() {
  const dialog = $("#rejectLeadDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function rejectSelectedLead() {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (!selected) return;
  closeRejectLeadDialog();
  selected.status = "Rejected";
  selected.rejectedAt = new Date().toISOString();
  writeObject(keys.leads, state.leads);
  renderMetrics();
  renderAnalytics();
  if (state.leadFilter === "Active") {
    state.selectedLeadId = "";
    state.mobileLeadOpen = false;
  }
  renderLeads();
}

function createManualLead() {
  const lead = {
    id: `manual-${Date.now()}`,
    title: "Manual follow-up lead",
    leadType: "direct",
    routingMode: "direct_company",
    rerouteAllowed: false,
    service: state.profile.service || "General contractor",
    town: state.areas.primaryTown || "Morrisburg",
    details: "Added from the Pro dashboard to test lead handling.",
    contact: state.settings.email || DEMO_EMAIL,
    urgency: "Flexible",
    status: "New",
    notes: "",
    reviewedAt: new Date().toISOString(),
    source: "Manual Pro entry",
    selectedProviderName: state.profile.name || "BuiltLocal Demo Co.",
    preferredContact: "Text",
    propertyType: "Detached home",
    budget: "Not sure",
    availability: "Flexible",
    photoCount: 0,
    snapshot: {
      score: 58,
      intent: "Good fit",
      smsLine: `General contractor in ${state.areas.primaryTown || "Morrisburg"}. Flexible. 0 photos. Good fit.`,
      summary: "Manual lead added to test the SMS-first lead queue.",
    },
    createdAt: new Date().toISOString(),
  };
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  writeObject(keys.leads, state.leads);
}

function toggleVoiceNotes() {
  const Recognition = speechRecognitionConstructor();
  const textarea = $("#leadNotes");
  if (!Recognition || !textarea) return;

  if (activeRecognition) {
    activeRecognition.stop();
    return;
  }

  const recognition = new Recognition();
  activeRecognition = recognition;
  recognition.lang = "en-CA";
  recognition.continuous = false;
  recognition.interimResults = false;

  setVoiceNoteStatus("Listening...");
  setDictateButtonActive(true);

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
    if (transcript) appendNoteText(textarea, transcript);
  };

  recognition.onerror = () => {
    setVoiceNoteStatus("Could not capture audio. You can still type the note.");
  };

  recognition.onend = () => {
    activeRecognition = null;
    setDictateButtonActive(false);
    setTimeout(() => {
      const status = $("#voiceNoteStatus");
      if (status && status.textContent === "Listening...") status.hidden = true;
    }, 400);
  };

  recognition.start();
}

function appendNoteText(textarea, transcript) {
  const prefix = textarea.value.trim() ? "\n" : "";
  textarea.value = `${textarea.value.trim()}${prefix}${sentenceCase(transcript)}`;
  setVoiceNoteStatus("Voice note added. Tap Save Note when ready.");
}

function sentenceCase(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const withCapital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(withCapital) ? withCapital : `${withCapital}.`;
}

function setVoiceNoteStatus(message) {
  const status = $("#voiceNoteStatus");
  if (!status) return;
  status.textContent = message;
  status.hidden = false;
}

function setDictateButtonActive(isActive) {
  const button = $("[data-dictate-notes]");
  if (!button) return;
  button.classList.toggle("active", isActive);
  button.setAttribute("aria-label", isActive ? "Stop dictation" : "Dictate note");
}

function speechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function renderAnalytics() {
  const handled = state.leads.filter((lead) => lead.status === "Handled").length;
  const contacted = state.leads.filter((lead) => ["Claimed", "Contacted", "Handled"].includes(lead.status)).length;
  const rejected = state.leads.filter((lead) => lead.status === "Rejected").length;
  const towns = [...new Set(state.leads.map((lead) => lead.town).filter(Boolean))];
  $("#analyticsTotal").textContent = state.leads.length;
  $("#analyticsHandled").textContent = handled;
  $("#analyticsContacted").textContent = contacted;
  $("#analyticsRejected").textContent = rejected;
  $("#analyticsSummary").textContent = state.leads.length
    ? `${state.leads.length} leads across ${towns.length || 1} local areas. SMS-routing leads can be claimed without opening the dashboard.`
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

function showLeadActionSheet(lead) {
  const dialog = $("#leadActionDialog");
  const actionList = $("#leadActionList");
  if (!dialog || !actionList) return;

  $("#leadActionSummary").textContent = `${lead.service || "Lead"} in ${lead.town || "SD&G"} is marked claimed. Use the fastest contact option while the request is fresh.`;
  const actions = contactActionsForLead(lead);
  actionList.innerHTML = actions.length ? actions.map((action) => {
    if (action.kind === "button") {
      return `
        <button class="lead-action-button" type="button" data-forward-contact>
          <i data-lucide="${action.icon}"></i>
          <span><strong>${escapeHtml(action.label)}</strong><small>${escapeHtml(action.help)}</small></span>
        </button>
      `;
    }
    return `
      <a class="lead-action-button${action.primary ? " primary-contact" : ""}" href="${escapeHtml(action.href)}">
        <i data-lucide="${action.icon}"></i>
        <span><strong>${escapeHtml(action.label)}</strong><small>${escapeHtml(action.help)}</small></span>
      </a>
    `;
  }).join("") : `
    <div class="empty-state no-margin">
      <i data-lucide="contact"></i>
      <strong>No direct contact saved</strong>
      <span>Forward the lead card internally or add contact details to the lead notes.</span>
    </div>
  `;
  $("#contactCardCopied").hidden = true;

  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  initIcons();
}

function showSelectedLeadActionSheet() {
  const selected = state.leads.find((lead) => lead.id === state.selectedLeadId);
  if (selected) showLeadActionSheet(selected);
}

function closeLeadActionSheet() {
  const dialog = $("#leadActionDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function contactActionsForLead(lead) {
  const contact = String(lead.contact || "").trim();
  const phone = normalizeLeadPhone(contact);
  const email = emailFromContact(contact);
  const preferred = String(lead.preferredContact || "").toLowerCase();
  const script = lead.snapshot?.nextStepScript || `Hi, this is ${state.profile.name || "BuiltLocal Demo Co."}. I accepted your BuiltLocal request for ${lead.service || "service"} in ${lead.town || "SD&G"} and can confirm next steps.`;
  const actions = [];

  if (phone) {
    actions.push({
      id: "text",
      label: "Text now",
      help: phone,
      href: `sms:${phone}`,
      icon: "message-circle",
    });
    actions.push({
      id: "call",
      label: "Call now",
      help: phone,
      href: `tel:${phone}`,
      icon: "phone",
    });
  }

  if (email) {
    const subject = encodeURIComponent(`BuiltLocal request: ${lead.service || "service"} in ${lead.town || "SD&G"}`);
    const body = encodeURIComponent(script);
    actions.push({
      id: "email",
      label: "Email now",
      help: email,
      href: `mailto:${email}?subject=${subject}&body=${body}`,
      icon: "mail",
    });
  }

  const preferredId = preferred.includes("call")
    ? "call"
    : preferred.includes("email")
      ? "email"
      : preferred.includes("text")
        ? "text"
        : "";
  const sorted = actions.map((action) => ({ ...action, primary: action.id === preferredId }));
  sorted.sort((a, b) => Number(b.primary) - Number(a.primary));
  sorted.push({
    kind: "button",
    id: "forward",
    label: "Forward contact card",
    help: "Share the snapshot with someone on your team",
    icon: "share-2",
  });
  return sorted;
}

async function forwardContactCard() {
  const lead = state.leads.find((item) => item.id === state.selectedLeadId);
  if (!lead) return;
  const text = contactCardText(lead);
  try {
    if (navigator.share) {
      await navigator.share({
        title: `BuiltLocal lead: ${lead.service || "Service"} in ${lead.town || "SD&G"}`,
        text,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      copyTextFallback(text);
    }
    flash("#contactCardCopied");
  } catch (error) {
    if (error?.name === "AbortError") return;
    copyTextFallback(text);
    flash("#contactCardCopied");
  }
}

function contactCardText(lead) {
  const snapshot = lead.snapshot || {};
  return [
    "BuiltLocal lead contact",
    `Name: ${lead.contactName || "Homeowner"}`,
    `Contact: ${lead.contact || "Not provided"}`,
    `Service: ${lead.service || "Service"}`,
    `Town: ${lead.town || "SD&G"}`,
    `Urgency: ${lead.urgency || "Not specified"}`,
    `Preferred: ${lead.preferredContact || "Text"}`,
    `Availability: ${lead.availability || "Not specified"}`,
    `Snapshot: ${snapshot.smsLine || snapshot.summary || lead.details || "No snapshot saved"}`,
    `Details: ${lead.details || "No details saved"}`,
  ].join("\n");
}

function normalizeLeadPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

function emailFromContact(value) {
  const match = String(value || "").match(/[^\s|<>]+@[^\s|<>]+\.[^\s|<>]+/);
  return match ? match[0] : "";
}

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
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
  state.mobileLeadOpen = false;
  $(".pro-main")?.classList.remove("mobile-detail-open");
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
  if (status === "Claimed" || status === "Contacted") return "blue";
  if (status === "Handled") return "";
  if (status === "Rejected") return "gold";
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
