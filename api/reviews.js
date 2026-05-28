const { handleCorsPreflight, readBody, sendJson, supabase } = require("./_lib/sms-leads");

const validReviewTowns = [
  "South Dundas",
  "North Dundas",
  "South Stormont",
  "North Stormont",
  "South Glengarry",
  "North Glengarry",
  "Cornwall & Area",
  "Morrisburg",
  "Iroquois",
  "Williamsburg",
  "Brinston",
  "Matilda",
  "Riverside Heights",
  "Dixons Corners",
  "Winchester",
  "Chesterville",
  "Morewood",
  "Mountain",
  "South Mountain",
  "Long Sault",
  "Ingleside",
  "Newington",
  "Lunenburg",
  "St. Andrews West",
  "Finch",
  "Berwick",
  "Avonmore",
  "Moose Creek",
  "Crysler",
  "Lancaster",
  "South Lancaster",
  "Summerstown",
  "Bainsville",
  "Green Valley",
  "Williamstown",
  "Alexandria",
  "Maxville",
  "Glen Robertson",
  "Apple Hill",
  "Dunvegan",
  "Cornwall",
];

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
  const providerId = String(input.providerId || "").trim();
  const workDate = String(input.workDate || "").trim();

  if (!providerId || !providerName) throw new Error("Choose a business from the BuiltLocal directory list");
  if (!/^[a-z][a-z .'-]{1,39}$/i.test(firstName)) throw new Error("Enter your first name only");
  if (!validReviewTowns.some((validTown) => normalizeReviewText(validTown) === normalizeReviewText(town))) {
    throw new Error("Choose a town or area from the SD&G suggestions");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) throw new Error("Valid email is required");
  if (!/[a-z]/i.test(serviceUsed) || serviceUsed.length < 3 || serviceUsed.length > 80) throw new Error("Service used is required");
  if (workDate && !isValidWorkDate(workDate)) throw new Error("Use a month and year like May 2026");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  if (reviewText.length < 20) throw new Error("Review must be at least 20 characters");

  return {
    providerId,
    providerName,
    firstName,
    town,
    email,
    serviceUsed,
    rating,
    workDate,
    reviewText,
  };
}

function normalizeReviewText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function isValidWorkDate(value) {
  const match = String(value || "").trim().match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})$/i);
  if (!match) return false;
  const year = Number(match[2]);
  return year >= 2000 && year <= new Date().getFullYear();
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
