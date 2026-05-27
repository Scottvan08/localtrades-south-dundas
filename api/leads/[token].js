const { readBody, routeLeadToNextProvider, sendJson, sendSms, supabase } = require("../_lib/sms-leads");

module.exports = async function leadTokenHandler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const token = req.query?.token || req.url.split("/").pop()?.split("?")[0];
  if (!token) return sendJson(res, 400, { error: "Missing lead token" });

  try {
    const attempts = await supabase(
      `routing_attempts?token=eq.${encodeURIComponent(token)}&select=*,providers(*),leads(*)&limit=1`,
      { method: "GET", headers: { prefer: "" } },
    );
    const attempt = attempts[0];
    if (!attempt) return sendJson(res, 404, { error: "Lead link not found" });
    if (attempt.token_expires_at && new Date(attempt.token_expires_at).getTime() < Date.now()) {
      return sendJson(res, 410, { error: "Lead link expired" });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const action = String(body.action || "").toLowerCase();
      if (action === "claim") return claimLead(res, attempt);
      if (action === "pass") return passLead(req, res, attempt);
      return sendJson(res, 400, { error: "Unknown action" });
    }

    const lead = attempt.leads || {};
    const claimed = lead.status === "claimed" && attempt.status === "claimed";
    return sendJson(res, 200, {
      id: lead.id,
      service: lead.service,
      town: lead.town,
      urgency: lead.urgency,
      propertyType: lead.property_type,
      details: lead.details,
      budget: lead.budget_range,
      preferredContact: lead.preferred_contact,
      availability: lead.availability,
      photoCount: lead.photo_count,
      photos: lead.photo_metadata || [],
      snapshot: lead.snapshot,
      status: lead.status,
      provider: {
        id: attempt.provider_id,
        businessName: attempt.providers?.business_name || "Provider",
      },
      contact: claimed ? {
        name: lead.contact_name,
        value: lead.contact,
      } : null,
      maskedContact: claimed ? "" : "Reply YES or tap Claim to unlock homeowner contact.",
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not load lead" });
  }
};

async function claimLead(res, attempt) {
  const lead = attempt.leads || {};
  const provider = attempt.providers || {};
  const now = new Date().toISOString();

  await supabase(`routing_attempts?id=eq.${attempt.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "claimed", responded_at: now, claimed_at: now }),
  });
  await supabase(`leads?id=eq.${attempt.lead_id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "claimed", claimed_provider_id: attempt.provider_id, claimed_at: now }),
  });

  if (provider.sms_number) {
    const homeowner = [lead.contact_name, lead.contact].filter(Boolean).join(" | ") || "Contact not provided";
    await sendSms({
      to: provider.sms_number,
      body: [
        `Claimed: ${lead.service || "Lead"} in ${lead.town || "SD&G"}.`,
        `Homeowner: ${homeowner}`,
        `Suggested reply: ${lead.snapshot?.nextStepScript || "Thanks for reaching out through BuiltLocal. I can take a quick look and confirm next steps."}`,
      ].join("\n"),
    });
  }

  return sendJson(res, 200, { ok: true, status: "claimed", contact: { name: lead.contact_name, value: lead.contact } });
}

async function passLead(req, res, attempt) {
  await supabase(`routing_attempts?id=eq.${attempt.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "passed", responded_at: new Date().toISOString() }),
  });
  const previousAttempts = await supabase(
    `routing_attempts?lead_id=eq.${attempt.lead_id}&select=provider_id`,
    { method: "GET", headers: { prefer: "" } },
  );
  const routed = await routeLeadToNextProvider({
    lead: attempt.leads,
    req,
    excludeProviderIds: previousAttempts.map((item) => item.provider_id),
  });
  return sendJson(res, 200, { ok: true, status: "passed", rerouted: Boolean(routed) });
}
