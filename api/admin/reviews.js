const { handleCorsPreflight, readBody, sendJson, supabase } = require("../_lib/sms-leads");

module.exports = async function adminReviewsHandler(req, res) {
  if (handleCorsPreflight(req, res)) return;
  if (!isAuthorized(req)) return sendJson(res, 401, { error: "Admin passcode required" });

  try {
    if (req.method === "GET") return listPendingReviews(res);
    if (req.method === "POST") return moderateReview(req, res);
    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not moderate reviews" });
  }
};

function isAuthorized(req) {
  const configured = process.env.ADMIN_REVIEW_SECRET;
  if (!configured) return false;
  const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.headers["x-admin-secret"];
  return supplied === configured;
}

async function listPendingReviews(res) {
  const reviews = await supabase(
    "reviews?status=eq.pending&select=*&order=created_at.asc&limit=100",
    { method: "GET", headers: { prefer: "" } },
  );
  return sendJson(res, 200, { reviews: reviews.map(adminReview) });
}

async function moderateReview(req, res) {
  const body = await readBody(req);
  const id = String(body.id || "").trim();
  const action = String(body.action || "").trim().toLowerCase();
  if (!id) return sendJson(res, 400, { error: "Review id is required" });
  if (!["approve", "reject"].includes(action)) return sendJson(res, 400, { error: "Action must be approve or reject" });

  const status = action === "approve" ? "approved" : "rejected";
  const now = new Date().toISOString();
  const [review] = await supabase(`reviews?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      approved_at: status === "approved" ? now : null,
      rejected_at: status === "rejected" ? now : null,
    }),
  });
  return sendJson(res, 200, { ok: true, review: adminReview(review) });
}

function adminReview(review) {
  return {
    id: review.id,
    providerId: review.provider_id,
    providerName: review.provider_name,
    firstName: review.reviewer_first_name,
    town: review.reviewer_town,
    email: review.reviewer_email,
    serviceUsed: review.service_used,
    rating: review.rating,
    workDate: review.work_date,
    reviewText: review.review_text,
    status: review.status,
    createdAt: review.created_at,
  };
}
