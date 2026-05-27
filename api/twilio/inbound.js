const {
  normalizePhone,
  handleCorsPreflight,
  providerLeadUrl,
  readBody,
  routeLeadToNextProvider,
  sendJson,
  sendSms,
  supabase,
  validateTwilioSignature,
} = require("../_lib/sms-leads");

module.exports = async function inboundSmsHandler(req, res) {
  if (handleCorsPreflight(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readBody(req);
    if (!validateTwilioSignature(req, body)) {
      return sendJson(res, 403, { error: "Invalid Twilio signature" });
    }

    const from = normalizePhone(body.From);
    const command = String(body.Body || "").trim().toUpperCase();
    const [provider] = await supabase(
      `providers?sms_number=eq.${encodeURIComponent(from)}&limit=1`,
      { method: "GET", headers: { prefer: "" } },
    );

    await supabase("messages", {
      method: "POST",
      body: JSON.stringify({
        provider_id: provider?.id || null,
        direction: "inbound",
        channel: "sms",
        body: body.Body || "",
        provider_message_id: body.MessageSid || null,
        status: "received",
      }),
    });

    if (!provider) {
      await sendSms({ to: from, body: "BuiltLocal could not match this number to an opted-in provider. Reply STOP to opt out." });
      return sendJson(res, 200, { ok: true, matched: false });
    }

    if (command === "STOP") {
      await supabase(`providers?id=eq.${provider.id}`, {
        method: "PATCH",
        body: JSON.stringify({ accepts_leads: false, paused: true, opt_out_at: new Date().toISOString() }),
      });
      return sendJson(res, 200, { ok: true, command: "STOP" });
    }

    if (command === "PAUSE") {
      await supabase(`providers?id=eq.${provider.id}`, {
        method: "PATCH",
        body: JSON.stringify({ paused: true, paused_at: new Date().toISOString() }),
      });
      await sendSms({ to: from, body: "BuiltLocal lead alerts paused. Reply RESUME when you want new leads again." });
      return sendJson(res, 200, { ok: true, command: "PAUSE" });
    }

    if (command === "RESUME") {
      await supabase(`providers?id=eq.${provider.id}`, {
        method: "PATCH",
        body: JSON.stringify({ paused: false, accepts_leads: true }),
      });
      await sendSms({ to: from, body: "BuiltLocal lead alerts resumed." });
      return sendJson(res, 200, { ok: true, command: "RESUME" });
    }

    const [attempt] = await supabase(
      `routing_attempts?provider_id=eq.${provider.id}&status=eq.sent&select=*,leads(*)&order=created_at.desc&limit=1`,
      { method: "GET", headers: { prefer: "" } },
    );

    if (!attempt) {
      await sendSms({ to: from, body: "BuiltLocal: no open lead is waiting for this number right now." });
      return sendJson(res, 200, { ok: true, command: "NO_OPEN_LEAD" });
    }

    if (command === "YES" || command === "Y" || command === "CLAIM") {
      await claimLead({ attempt, provider, from });
      return sendJson(res, 200, { ok: true, command: "YES" });
    }

    if (command === "NO" || command === "N" || command === "PASS") {
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
      await sendSms({ to: from, body: routed ? "Passed. BuiltLocal offered this lead to another provider." : "Passed. No other matched providers are available yet." });
      return sendJson(res, 200, { ok: true, command: "NO" });
    }

    if (command === "INFO" || command === "DETAILS") {
      const leadUrl = providerLeadUrl(req, attempt.token);
      await sendSms({ to: from, body: `Lead details: ${leadUrl}\nReply YES to claim or NO to pass.` });
      return sendJson(res, 200, { ok: true, command: "INFO" });
    }

    await sendSms({ to: from, body: "BuiltLocal: reply YES to claim, NO to pass, INFO for details, PAUSE to stop temporarily, or STOP to opt out." });
    return sendJson(res, 200, { ok: true, command: "HELP" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not handle inbound SMS" });
  }
};

async function claimLead({ attempt, provider, from }) {
  const lead = attempt.leads || {};
  const now = new Date().toISOString();

  await supabase(`routing_attempts?id=eq.${attempt.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "claimed", responded_at: now, claimed_at: now }),
  });
  await supabase(`leads?id=eq.${attempt.lead_id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "claimed", claimed_provider_id: provider.id, claimed_at: now }),
  });

  const script = lead.snapshot?.nextStepScript || "Thanks for reaching out through BuiltLocal. I can take a quick look and confirm next steps.";
  const homeowner = [lead.contact_name, lead.contact].filter(Boolean).join(" | ") || "Contact not provided";
  await sendSms({
    to: from,
    body: [
      `Claimed: ${lead.service || "Lead"} in ${lead.town || "SD&G"}.`,
      `Homeowner: ${homeowner}`,
      `Prefers: ${lead.preferred_contact || "Text"}. Available: ${lead.availability || "not specified"}.`,
      `Suggested reply: ${script}`,
    ].join("\n"),
  });

  if (lead.contact && /\d{10,}/.test(String(lead.contact).replace(/\D/g, ""))) {
    await sendSms({
      to: lead.contact,
      body: `${provider.business_name} accepted your BuiltLocal request and should follow up shortly.`,
    });
  }
}
