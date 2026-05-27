const {
  createSnapshot,
  generateAiSummary,
  isConfigured,
  routeLeadToNextProvider,
  sendJson,
  supabase,
} = require("./_lib/sms-leads");

module.exports = async function leadsHandler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const input = await readJson(req);
    const normalized = normalizeLeadInput(input);
    const aiSummary = await generateAiSummary(normalized);
    const snapshot = createSnapshot(normalized, aiSummary);

    if (!isConfigured()) {
      return sendJson(res, 202, {
        mode: "demo",
        message: "Lead captured in browser demo mode. Configure Supabase, Twilio, and OpenAI env vars to send SMS.",
        lead: {
          ...normalized,
          id: `demo-${Date.now()}`,
          snapshot,
          status: "routing_demo",
          createdAt: new Date().toISOString(),
        },
      });
    }

    const [lead] = await supabase("leads", {
      method: "POST",
      body: JSON.stringify({
        service: normalized.service,
        urgency: normalized.urgency,
        town: normalized.town,
        property_type: normalized.propertyType,
        details: normalized.details,
        budget_range: normalized.budget,
        contact_name: normalized.contactName,
        contact: normalized.contact,
        preferred_contact: normalized.preferredContact,
        availability: normalized.availability,
        photo_count: normalized.photoCount,
        photo_metadata: normalized.photos,
        selected_provider_name: normalized.selectedProviderName,
        selected_provider_id: normalized.selectedProviderId,
        ai_summary: snapshot.summary,
        score: snapshot.score,
        intent: snapshot.intent,
        snapshot,
        status: "routing",
      }),
    });

    const routed = await routeLeadToNextProvider({ lead, req });
    return sendJson(res, 201, {
      mode: "live",
      lead,
      routed: Boolean(routed),
      provider: routed ? { id: routed.provider.id, businessName: routed.provider.business_name } : null,
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not create lead" });
  }
};

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function normalizeLeadInput(input) {
  return {
    service: String(input.service || "General contractor").trim(),
    urgency: String(input.urgency || "Within a week").trim(),
    town: String(input.town || "SD&G").trim(),
    propertyType: String(input.propertyType || "Not sure").trim(),
    details: String(input.details || "").trim(),
    budget: String(input.budget || "Not sure").trim(),
    contactName: String(input.contactName || "").trim(),
    contact: String(input.contact || "").trim(),
    preferredContact: String(input.preferredContact || "Text").trim(),
    availability: String(input.availability || "").trim(),
    photoCount: Number(input.photoCount || 0),
    photos: Array.isArray(input.photos) ? input.photos.slice(0, 8) : [],
    selectedProviderId: String(input.selectedProviderId || "").trim(),
    selectedProviderName: String(input.selectedProviderName || "").trim(),
  };
}
