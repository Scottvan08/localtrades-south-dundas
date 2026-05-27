const crypto = require("node:crypto");

const LEAD_STATUSES = {
  NEW: "new",
  ROUTING: "routing",
  CLAIMED: "claimed",
  PASSED: "passed",
  EXPIRED: "expired",
  PAUSED: "paused",
  STOPPED: "stopped",
};

const ROUTING_TIMEOUT_MINUTES = {
  asap: 5,
  default: 12,
};

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(payload));
}

function publicBaseUrl(req) {
  return process.env.PUBLIC_SITE_URL
    || `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
}

function apiBaseUrl(req) {
  return process.env.PUBLIC_API_URL || publicBaseUrl(req);
}

function isConfigured() {
  return Boolean(
    process.env.SUPABASE_URL
    && process.env.SUPABASE_SERVICE_ROLE_KEY
    && process.env.TWILIO_ACCOUNT_SID
    && process.env.TWILIO_AUTH_TOKEN
    && (process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_FROM_NUMBER),
  );
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return String(value || "").trim();
}

function leadTimeoutMinutes(urgency) {
  return /asap|emergency|today/i.test(urgency || "")
    ? ROUTING_TIMEOUT_MINUTES.asap
    : ROUTING_TIMEOUT_MINUTES.default;
}

function createLeadToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function scoreLead(input) {
  let score = 35;
  if (/asap|emergency|today/i.test(input.urgency || "")) score += 18;
  if ((input.details || "").trim().length > 24) score += 12;
  if (Number(input.photoCount || 0) > 0) score += 14;
  if (input.budget && input.budget !== "Not sure") score += 9;
  if ((input.availability || "").trim()) score += 6;
  if ((input.contact || "").trim()) score += 6;
  return Math.min(100, score);
}

function intentLabel(score) {
  if (score >= 78) return "High intent";
  if (score >= 58) return "Good fit";
  return "Needs follow-up";
}

function createSnapshot(input, aiSummary) {
  const score = scoreLead(input);
  const summary = aiSummary || fallbackSummary(input);
  const photoText = Number(input.photoCount || 0) === 1 ? "1 photo" : `${Number(input.photoCount || 0)} photos`;
  return {
    title: `${input.service || "Service"} | ${input.town || "SD&G"} | ${input.urgency || "Timing flexible"}`,
    score,
    intent: intentLabel(score),
    summary,
    smsLine: `${input.service || "Service"} in ${input.town || "SD&G"}. ${input.urgency || "Timing flexible"}. ${photoText}. ${intentLabel(score)}.`,
    nextStepScript: `Thanks for reaching out through BuiltLocal. Based on your request, I can take a quick look and confirm next steps. Are you available ${input.availability || "this week"}?`,
  };
}

function fallbackSummary(input) {
  const property = input.propertyType || "property";
  const timing = input.urgency || "timing not specified";
  const details = input.details || "Resident requested help through BuiltLocal.";
  return `${input.service || "Service"} request for a ${property} in ${input.town || "SD&G"}; ${timing}. ${details}`.slice(0, 360);
}

async function generateAiSummary(input) {
  if (!process.env.OPENAI_API_KEY) return "";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "Create a concise contractor-facing lead summary. Use one or two sentences. Include likely scope, urgency, town, property type, photo count, budget/timeline signal, and preferred contact method when present. Do not invent facts.",
      input: JSON.stringify(input),
      max_output_tokens: 140,
    }),
  });

  if (!response.ok) return "";
  const data = await response.json();
  return data.output_text || "";
}

async function supabase(path, options = {}) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(`${process.env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ${response.status}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function sendSms({ to, body }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return { skipped: true, reason: "Twilio is not configured" };
  }

  const params = new URLSearchParams({ To: normalizePhone(to), Body: body });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    params.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  } else {
    params.set("From", process.env.TWILIO_FROM_NUMBER);
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );

  const payload = await response.json();
  if (!response.ok) throw new Error(`Twilio ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

async function findProvidersForLead(lead, excludeProviderIds = []) {
  const category = encodeURIComponent(lead.service || "");
  const area = encodeURIComponent(lead.town || "");
  const providers = await supabase(
    `providers?accepts_leads=eq.true&paused=eq.false&order=priority.desc,created_at.asc&limit=20`,
    { method: "GET", headers: { prefer: "" } },
  );

  return providers
    .filter((provider) => !excludeProviderIds.includes(provider.id))
    .filter((provider) => {
      const categories = provider.categories || [];
      const towns = provider.towns_served || [];
      const serviceMatch = !category || categories.some((item) => String(item).toLowerCase().includes(decodeURIComponent(category).toLowerCase()));
      const townMatch = provider.serves_all_sdg || !area || towns.some((item) => String(item).toLowerCase().includes(decodeURIComponent(area).toLowerCase()));
      return serviceMatch && townMatch && provider.sms_number;
    })
    .slice(0, 5);
}

async function routeLeadToNextProvider({ lead, req, excludeProviderIds = [] }) {
  const providers = await findProvidersForLead(lead, excludeProviderIds);
  if (!providers.length) return null;

  const provider = providers[0];
  const token = createLeadToken();
  const timeoutMinutes = leadTimeoutMinutes(lead.urgency);
  const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString();
  const leadUrl = `${publicBaseUrl(req).replace(/\/$/, "")}/lead/?token=${token}`;
  const smsBody = [
    `BuiltLocal lead: ${lead.snapshot?.smsLine || `${lead.service} in ${lead.town}`}`,
    `Reply YES to claim, NO to pass, INFO for details.`,
    `Link: ${leadUrl}`,
  ].join("\n");

  const [attempt] = await supabase("routing_attempts", {
    method: "POST",
    body: JSON.stringify({
      lead_id: lead.id,
      provider_id: provider.id,
      token,
      token_expires_at: expiresAt,
      status: "sent",
      timeout_minutes: timeoutMinutes,
      sms_body: smsBody,
    }),
  });

  const message = await sendSms({ to: provider.sms_number, body: smsBody });
  await supabase("messages", {
    method: "POST",
    body: JSON.stringify({
      lead_id: lead.id,
      provider_id: provider.id,
      direction: "outbound",
      channel: "sms",
      body: smsBody,
      provider_message_id: message.sid || null,
      status: message.status || "queued",
    }),
  });

  return { provider, attempt, sms: message };
}

function validateTwilioSignature(req, params) {
  if (process.env.TWILIO_VALIDATE_WEBHOOKS !== "true") return true;
  if (!process.env.TWILIO_AUTH_TOKEN) return false;

  const signature = req.headers["x-twilio-signature"];
  if (!signature) return false;

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const url = `${protocol}://${req.headers.host}${req.url}`;
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => `${acc}${key}${params[key]}`, url);
  const expected = crypto
    .createHmac("sha1", process.env.TWILIO_AUTH_TOKEN)
    .update(Buffer.from(data, "utf-8"))
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = {
  LEAD_STATUSES,
  apiBaseUrl,
  createSnapshot,
  generateAiSummary,
  isConfigured,
  leadTimeoutMinutes,
  normalizePhone,
  publicBaseUrl,
  readBody,
  routeLeadToNextProvider,
  sendJson,
  sendSms,
  supabase,
  validateTwilioSignature,
};
