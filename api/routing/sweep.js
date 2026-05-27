const { handleCorsPreflight, routeLeadToNextProvider, sendJson, supabase } = require("../_lib/sms-leads");

module.exports = async function routingSweepHandler(req, res) {
  if (handleCorsPreflight(req, res)) return;

  if (!["GET", "POST"].includes(req.method)) {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const secret = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.query?.secret;
  if (process.env.ROUTING_SWEEP_SECRET && secret !== process.env.ROUTING_SWEEP_SECRET) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  try {
    const expiredAttempts = await supabase(
      `routing_attempts?status=eq.sent&token_expires_at=lt.${encodeURIComponent(new Date().toISOString())}&select=*,leads(*)&limit=20`,
      { method: "GET", headers: { prefer: "" } },
    );

    const results = [];
    for (const attempt of expiredAttempts) {
      await supabase(`routing_attempts?id=eq.${attempt.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "expired", responded_at: new Date().toISOString() }),
      });

      const previousAttempts = await supabase(
        `routing_attempts?lead_id=eq.${attempt.lead_id}&select=provider_id`,
        { method: "GET", headers: { prefer: "" } },
      );
      const excludeProviderIds = previousAttempts.map((item) => item.provider_id);
      const routed = await routeLeadToNextProvider({
        lead: attempt.leads,
        req,
        excludeProviderIds,
      });

      if (!routed) {
        await supabase(`leads?id=eq.${attempt.lead_id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "expired" }),
        });
      }

      results.push({
        leadId: attempt.lead_id,
        expiredProviderId: attempt.provider_id,
        rerouted: Boolean(routed),
        nextProviderId: routed?.provider?.id || null,
      });
    }

    return sendJson(res, 200, { ok: true, processed: results.length, results });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not sweep routing attempts" });
  }
};
