const { handleCorsPreflight, readBody, sendJson, supabase } = require("./_lib/sms-leads");

module.exports = async function reviewsHandler(req, res) {
  if (handleCorsPreflight(req, res)) return;

  try {
    if (req.method === "GET") {
      await listApprovedReviews(req, res);
      return;
    }
    if (req.method === "POST") {
      await createReview(req, res);
      return;
    }
    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not process reviews" });
  }
};

async function listApprovedReviews(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const providerId = url.searchParams.get("providerId");
  const providerName = url.searchParams.get("providerName");
  const filters = ["status=eq.approved"];
  if (providerId) filters.push(`provider_id=eq.${encodeURIComponent(providerId)}`);
  else if (providerName) filters.push(`provider_name=eq.${encodeURIComponent(providerName)}`);

  const reviews = await getReviews(
    `reviews?${filters.join("&")}&select=id,provider_id,provider_name,reviewer_first_name,reviewer_town,service_used,rating,work_date,review_text,approved_at,created_at&order=approved_at.desc.nullslast,created_at.desc&limit=100`,
  );
  return sendJson(res, 200, { reviews });
}

async function createReview(req, res) {
  const input = normalizeReviewInput(await readBody(req));
  let review;
  try {
    [review] = await supabase("reviews", {
      method: "POST",
      body: JSON.stringify({
        provider_id: input.providerId,
        provider_name: input.providerName,
        reviewer_first_name: input.firstName,
        reviewer_town: input.town,
        reviewer_email: input.email,
        service_used: input.serviceUsed,
        rating: input.rating,
        work_date: input.workDate,
        review_text: input.reviewText,
        status: "pending",
      }),
    });
  } catch (error) {
    if (isMissingReviewsTable(error)) {
      return sendJson(res, 503, { error: "Reviews are not ready yet. Add the reviews table in Supabase, then try again." });
    }
    throw error;
  }
  return sendJson(res, 201, { ok: true, review: publicPendingReview(review) });
}

function normalizeReviewInput(input) {
  const providerName = String(input.providerName || "").trim();
  const firstName = String(input.firstName || "").trim();
  const town = String(input.town || "").trim();
  const email = String(input.email || "").trim();
  const serviceUsed = String(input.serviceUsed || "").trim();
  const reviewText = String(input.reviewText || "").trim();
  const rating = Number(input.rating || 0);

  if (!providerName) throw new Error("Business reviewed is required");
  if (!firstName) throw new Error("First name is required");
  if (!town) throw new Error("Town is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Valid email is required");
  if (!serviceUsed) throw new Error("Service used is required");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  if (reviewText.length < 12) throw new Error("Review must be at least 12 characters");

  return {
    providerId: String(input.providerId || "").trim(),
    providerName,
    firstName,
    town,
    email,
    serviceUsed,
    rating,
    workDate: String(input.workDate || "").trim(),
    reviewText,
  };
}

function publicPendingReview(review) {
  return {
    id: review.id,
    providerName: review.provider_name,
    status: review.status,
    createdAt: review.created_at,
  };
}

async function getReviews(path) {
  try {
    return await supabase(path, { method: "GET", headers: { prefer: "" } });
  } catch (error) {
    if (isMissingReviewsTable(error)) return [];
    throw error;
  }
}

function isMissingReviewsTable(error) {
  return /reviews|PGRST|42P01|does not exist|schema cache/i.test(error.message || "");
}
