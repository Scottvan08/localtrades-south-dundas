const { sendJson } = require("./_lib/sms-leads");

module.exports = async function healthHandler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  return sendJson(res, 200, {
    ok: true,
    checks: {
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      twilio: Boolean(
        process.env.TWILIO_ACCOUNT_SID
        && process.env.TWILIO_AUTH_TOKEN
        && (process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_FROM_NUMBER),
      ),
      openai: Boolean(process.env.OPENAI_API_KEY),
      publicSiteUrl: process.env.PUBLIC_SITE_URL || "",
      publicApiUrl: process.env.PUBLIC_API_URL || "",
      webhookValidation: process.env.TWILIO_VALIDATE_WEBHOOKS === "true",
    },
  });
};
