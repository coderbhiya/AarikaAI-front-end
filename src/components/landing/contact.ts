import { Globe, Mail, Phone } from "lucide-react";

// One place for the support contact shown on /about, /contact and the policy pages.
export const SUPPORT_EMAIL = "dave@senseforge.in";
export const SUPPORT_PHONE = "+91 91746 99025";

export const CONTACT = [
  { icon: Mail, label: "Email", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: Phone, label: "Phone", value: SUPPORT_PHONE, href: "tel:+919174699025" },
  { icon: Globe, label: "Company website", value: "senseforge.in", href: "https://senseforge.in", external: true },
];
