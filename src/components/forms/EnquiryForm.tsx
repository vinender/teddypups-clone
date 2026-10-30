"use client";

import { useActionState, useId } from "react";
import { type EnquiryState, sendEnquiry } from "@/app/actions/enquiry";

const INPUT =
  "mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base outline-none transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

function Field({ label, error, hint, ...input }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[0.95rem] font-semibold">
        {label}
        {input.required ? (
          <span className="text-toffee-ink"> *</span>
        ) : (
          <span className="font-normal text-cocoa-soft"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={INPUT}
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-cocoa-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

export type EnquiryFormProps = {
  /** Puppy this enquiry is about (sent along with the form). */
  puppy?: string;
  defaultMessage?: string;
  success: { heading: string; body: string };
  whatsappHref: string;
  compact?: boolean;
  submitLabel?: string;
};

export function EnquiryForm({
  puppy,
  defaultMessage,
  success,
  whatsappHref,
  compact,
  submitLabel = "Send enquiry",
}: EnquiryFormProps) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { ok: false });
  const messageId = useId();

  if (state.ok) {
    return (
      <div role="status" className="tp-sent rounded-[2rem] border-[3px] border-cocoa bg-honey p-8 text-center">
        <svg viewBox="0 0 120 84" className="tp-envelope mx-auto w-32" aria-hidden="true">
          <path d="M6 10h108v68H6z" fill="#fffdf8" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
          <path d="M6 10l54 40 54-40" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="94" cy="62" r="12" fill="#c2622b" stroke="#2a170e" strokeWidth="2.5" />
        </svg>
        <p className="font-plush mt-4 text-[2rem]">{success.heading}</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-cocoa-soft">{success.body}</p>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
          WhatsApp us
        </a>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} noValidate className="space-y-5">
      {state.message && (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 font-semibold">
          {state.message}
        </p>
      )}
      <div className={compact ? "space-y-5" : "grid gap-5 sm:grid-cols-2"}>
        <Field
          label="Your name"
          name="name"
          defaultValue={v.name}
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          error={e.name}
        />
        <Field
          label="Phone or WhatsApp"
          name="phone"
          defaultValue={v.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          hint="With country code, e.g. +971 50 123 4567"
          error={e.phone}
        />
        <Field label="Email" name="email" defaultValue={v.email} type="email" autoComplete="email" error={e.email} />
        <Field
          label="Your area"
          name="area"
          defaultValue={v.area}
          autoComplete="address-level2"
          maxLength={80}
          hint="e.g. Dubai Marina"
          error={e.area}
        />
      </div>
      {puppy && <input type="hidden" name="puppy" value={puppy} />}
      <div>
        <label htmlFor={messageId} className="block text-[0.95rem] font-semibold">
          Message <span className="font-normal text-cocoa-soft">(optional)</span>
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={4}
          maxLength={2000}
          defaultValue={v.message ?? defaultMessage}
          className="mt-1.5 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 py-3 text-base outline-none focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)]"
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" name="website" defaultValue="" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
