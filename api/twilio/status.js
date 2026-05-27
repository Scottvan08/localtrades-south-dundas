const { readBody, sendJson, supabase, validateTwilioSignature } = require("../_lib/sms-leads");

module.exports = async function twilioStatusHandler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readBody(req);
    if (!validateTwilioSignature(req, body)) {
      return sendJson(res, 403, { error: "Invalid Twilio signature" });
    }

    if (body.MessageSid) {
      await supabase(`messages?provider_message_id=eq.${encodeURIComponent(body.MessageSid)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: body.MessageStatus || body.SmsStatus || "updated",
          status_payload: body,
        }),
      });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Could not record Twilio status" });
  }
};
