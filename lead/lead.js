const apiBaseUrl = (window.BUILTLOCAL_API_BASE || localStorage.getItem("builtlocal_api_base") || "").replace(/\/$/, "");
const params = new URLSearchParams(location.search);
const token = params.get("token");

const $ = (selector) => document.querySelector(selector);

init();

async function init() {
  try {
    if (!token) throw new Error("Missing lead token.");
    const lead = await loadLead();
    renderLead(lead);
  } catch (error) {
    renderFallback(error.message);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lead-action]");
    if (button) handleLeadAction(button.dataset.leadAction, button);
  });

  initIcons();
}

async function loadLead() {
  const response = await fetch(`${apiBaseUrl}/api/leads/${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error("This lead link is unavailable or expired.");
  return response.json();
}

function renderLead(lead) {
  $("#leadTitle").textContent = lead.snapshot?.title || `${lead.service || "Service"} in ${lead.town || "SD&G"}`;
  $("#leadSummary").textContent = lead.snapshot?.summary || lead.details || "Lead details are ready for review.";
  $("#leadIntent").textContent = `${lead.snapshot?.intent || "Lead"}${lead.snapshot?.score ? ` - ${lead.snapshot.score}/100` : ""}`;
  $("#leadSmsLine").textContent = lead.snapshot?.smsLine || "Reply YES to claim, NO to pass, INFO for details.";
  $("#leadFacts").innerHTML = [
    ["Service", lead.service],
    ["Town", lead.town],
    ["Urgency", lead.urgency],
    ["Property", lead.propertyType],
    ["Budget", lead.budget],
    ["Photos", `${lead.photoCount || 0}`],
    ["Preferred", lead.preferredContact],
    ["Availability", lead.availability],
  ].map(([label, value]) => `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "Not provided")}</strong>
    </div>
  `).join("");

  if (lead.contact) {
    $("#leadContact").hidden = false;
    $("#leadContactText").textContent = `Unlocked contact: ${[lead.contact.name, lead.contact.value].filter(Boolean).join(" | ")}`;
  }
}

async function handleLeadAction(action, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = action === "claim" ? "Claiming..." : "Passing...";

  try {
    const response = await fetch(`${apiBaseUrl}/api/leads/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Action failed.");

    if (action === "claim") {
      $("#leadContact").hidden = false;
      $("#leadContactText").textContent = `Claimed. Contact unlocked: ${[result.contact?.name, result.contact?.value].filter(Boolean).join(" | ") || "sent by SMS"}`;
    } else {
      $("#leadError").hidden = false;
      $("#leadError").textContent = "Passed. BuiltLocal can route this lead to the next provider.";
    }
  } catch (error) {
    $("#leadError").hidden = false;
    $("#leadError").textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
    initIcons();
  }
}

function renderFallback(message) {
  $("#leadTitle").textContent = "Lead link unavailable";
  $("#leadSummary").textContent = message;
  $("#leadFacts").innerHTML = "";
  $("#leadError").hidden = false;
  $("#leadError").textContent = "If this is a local demo, submit a request from the public site first or connect the SMS API.";
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
  if (window.lucide) window.lucide.createIcons();
}
