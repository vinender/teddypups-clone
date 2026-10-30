"use server";

export type EnquiryState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "email" | "area" | "message", string>>;
  /** Echoed back so the form keeps what was typed (React resets forms after an action). */
  values?: Record<string, string>;
};

const PHONE = /^\+?[\d\s()-]{7,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an enquiry (puppy page or contact letter). There is no CRM behind
 * this rebuild, so a valid enquiry is forwarded to ENQUIRY_WEBHOOK_URL when it
 * is set (e.g. a Slack/Make/Zapier hook) and otherwise just logged.
 */
export async function sendEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Honeypot: real people never fill the hidden "website" field.
  if (String(form.get("website") ?? "")) return { ok: true };

  const field = (k: string) => String(form.get(k) ?? "").trim();
  const data = {
    name: field("name"),
    phone: field("phone"),
    email: field("email"),
    area: field("area"),
    message: field("message"),
    puppy: field("puppy"),
  };

  const errors: EnquiryState["errors"] = {};
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  else if (data.name.length > 80) errors.name = "That name is a little long.";
  if (!PHONE.test(data.phone)) errors.phone = "Please add a phone number with country code.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "That email doesn't look right.";
  if (data.area.length > 80) errors.area = "Please keep this short.";
  if (data.message.length > 2000) errors.message = "Please keep your message under 2000 characters.";
  if (Object.keys(errors).length)
    return { ok: false, errors, values: data, message: "Please check the highlighted fields." };

  const hook = process.env.ENQUIRY_WEBHOOK_URL;
  try {
    if (hook) {
      const res = await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, receivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else {
      console.info("[enquiry]", data);
    }
  } catch (err) {
    console.error("[enquiry] failed", err);
    return { ok: false, values: data, message: "Something went wrong sending that. Please try again, or WhatsApp us." };
  }
  return { ok: true };
}
