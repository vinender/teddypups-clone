export const site = {
  name: "TeddyPups U.A.E.",
  short: "TeddyPups",
  tagline: "every puppy is family",
  description:
    "TeddyPups U.A.E. is a Dubai-based brand specializing in miniature puppies, offering premium services and worldwide shipping.",
  phone: "+971 54 167 6733",
  phoneHref: "tel:+971541676733",
  email: "teddypupsadmin@gmail.com",
  address: "Downtown Dubai, United Arab Emirates",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/teddypups.worldwide/" },
    { label: "TikTok", href: "https://www.tiktok.com/@teddypupsuae" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61567496944539" },
  ],
} as const;

const WA_NUMBER = "971541676733";
const WA_DEFAULT = "Hi TeddyPups! I'd love to know more about your puppies.";

export function whatsappHref(text: string = WA_DEFAULT) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const nav = [
  { href: "/", label: "Home" },
  { href: "/puppies", label: "Puppies" },
  { href: "/happy-families", label: "Happy families" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit & contact" },
] as const;

export const footerNav = [
  { href: "/puppies", label: "Available puppies" },
  { href: "/gone-home", label: "Gone home" },
  { href: "/happy-families", label: "Happy families" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/how-it-works#delivery", label: "Delivery & collection" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit & contact" },
] as const;

/** Public origin for absolute links (WhatsApp messages, JSON-LD). Vercel provides the production host. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
