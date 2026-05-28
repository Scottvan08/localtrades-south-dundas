const defaultApiBaseUrl = location.hostname.endsWith("github.io") || location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "https://localtrades-south-dundas.vercel.app"
  : "";
const apiBaseUrl = (window.BUILTLOCAL_API_BASE || localStorage.getItem("builtlocal_api_base") || defaultApiBaseUrl || location.origin).replace(/\/$/, "");
const sessionKey = "builtlocal_admin_review_secret";

const $ = (selector) => document.querySelector(selector);

let adminSecret = sessionStorage.getItem(sessionKey) || "";

init();

function init() {
  initIcons();
  wireEvents();
  if (adminSecret) loadPendingReviews();
}

function wireEvents() {
  $("#adminLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    adminSecret = $("#adminSecret").value.trim();
    sessionStorage.setItem(sessionKey, adminSecret);
    loadPendingReviews();
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-review-action]");
    const refreshButton = event.target.closest("[data-refresh-reviews]");
    if (refreshButton) loadPendingReviews();
    if (actionButton) moderateReview(actionButton.dataset.reviewId, actionButton.dataset.reviewAction);
  });
}

async function loadPendingReviews() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/reviews`, {
      headers: { authorization: `Bearer ${adminSecret}` },
    });
    if (!response.ok) throw new Error(await readErrorMessage(response));
    const payload = await response.json();
    const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
    $("#adminLogin").hidden = true;
    $("#adminWorkspace").hidden = false;
    $("#adminLoginError").hidden = true;
    renderReviews(reviews);
  } catch (error) {
    $("#adminLogin").hidden = false;
    $("#adminWorkspace").hidden = true;
    $("#adminLoginError").hidden = false;
    $("#adminLoginError").textContent = error.message || "Could not open admin. Check that ADMIN_REVIEW_SECRET is set in Vercel.";
  }
}

function renderReviews(reviews) {
  $("#pendingCount").textContent = `${reviews.length} pending`;
  $("#adminReviewList").innerHTML = reviews.length ? reviews.map((review) => `
    <article class="admin-review-card">
      <div class="admin-review-main">
        <span class="coverage-pill">${escapeHtml(review.rating)} stars</span>
        <h2>${escapeHtml(review.providerName)}</h2>
        <p>${escapeHtml(review.reviewText)}</p>
        <dl class="admin-review-facts">
          <div><dt>Reviewer</dt><dd>${escapeHtml(review.firstName)} in ${escapeHtml(review.town)}</dd></div>
          <div><dt>Private email</dt><dd>${escapeHtml(review.email)}</dd></div>
          <div><dt>Service</dt><dd>${escapeHtml(review.serviceUsed)}</dd></div>
          <div><dt>Work date</dt><dd>${escapeHtml(review.workDate || "Not provided")}</dd></div>
        </dl>
      </div>
      <div class="admin-review-actions">
        <button class="primary-button compact" type="button" data-review-id="${escapeHtml(review.id)}" data-review-action="approve">
          <i data-lucide="check"></i>
          Approve
        </button>
        <button class="secondary-button compact danger-button" type="button" data-review-id="${escapeHtml(review.id)}" data-review-action="reject">
          <i data-lucide="x"></i>
          Reject
        </button>
      </div>
    </article>
  `).join("") : `
    <div class="empty-state">
      <i data-lucide="message-square-heart"></i>
      <strong>No pending reviews</strong>
      <span>New public review submissions will appear here before they go live.</span>
    </div>
  `;
  initIcons();
}

async function moderateReview(id, action) {
  $("#adminSuccess").hidden = true;
  $("#adminError").hidden = true;
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/reviews`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminSecret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, action }),
    });
    if (!response.ok) throw new Error(await readErrorMessage(response));
    $("#adminSuccess").hidden = false;
    await loadPendingReviews();
  } catch (error) {
    $("#adminError").hidden = false;
    $("#adminError").textContent = error.message || "Could not update this review.";
  }
}

function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function readErrorMessage(response) {
  const text = await response.text();
  try {
    const payload = JSON.parse(text);
    return payload.error || text;
  } catch (error) {
    return text || "Could not open admin. Check that ADMIN_REVIEW_SECRET is set in Vercel.";
  }
}
