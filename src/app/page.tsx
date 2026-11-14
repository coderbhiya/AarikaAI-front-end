import type { Metadata } from "next";
import Landing from "@/views/Landing";
import { FAQS, PLANS, SITE_SUMMARY, SITE_URL } from "@/components/landing/content";

const title = "Aarika.AI | AI Career Co-pilot: Mock Interviews, Job Agent & Resume Builder";
const description =
  "Free AI career co-pilot for India. Practise HR and technical mock interviews (text or live voice), build an ATS-ready resume, get matched jobs and internships, and take timed mock exams for JEE, NEET, UPSC and SSC.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "Aarika.AI",
  keywords: [
    "Aarika.AI",
    "Aarika AI",
    "AI career guidance India",
    "AI mock interview",
    "HR interview practice",
    "ATS resume builder",
    "AI job agent",
    "internships for freshers",
    "campus placement preparation",
    "TCS NQT preparation",
    "JEE NEET mock test",
    "UPSC SSC CGL mock test",
    "career discovery quiz",
    "Senseforge",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Aarika.AI",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

// Structured data for search and answer engines. Built from the same content the
// page renders (content.ts), so it can't drift from what visitors see.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Aarika.AI",
      url: SITE_URL,
      logo: `${SITE_URL}/aarika-logo.png`,
      parentOrganization: { "@type": "Organization", name: "SenseforgeAI", url: "https://senseforge.in" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Aarika.AI",
      inLanguage: ["en-IN", "hi-IN"],
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Aarika.AI",
      url: SITE_URL,
      description: SITE_SUMMARY,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web browser",
      inLanguage: ["en-IN", "hi-IN"],
      publisher: { "@id": `${SITE_URL}/#org` },
      screenshot: [`${SITE_URL}/landing/mock-interview.webp`, `${SITE_URL}/landing/job-agent.webp`, `${SITE_URL}/landing/career-discovery.webp`],
      featureList: [
        "AI career chat that knows your profile",
        "AI mock interviews in text or live voice with answer-by-answer feedback",
        "Job Agent with Smart Apply: tailored resume, cover letter and form answers",
        "Matched job feed (Mission Hunt) and internships with an application tracker",
        "Resume Builder with PDF export and ATS keyword check",
        "Timed mock exams with negative marking for JEE, NEET, UPSC, SSC CGL, IBPS PO, CAT, CA Foundation and CBSE",
        "Exams and scholarships calendar with eligibility checks",
        "Career Discovery quiz for choosing a stream",
      ],
      offers: [
        { "@type": "Offer", name: "Free account", price: "0", priceCurrency: "INR" },
        ...PLANS.filter((p) => !("comingSoon" in p && p.comingSoon)).map((p) => ({
          "@type": "Offer",
          name: `${p.name} plan (monthly, GST extra)`,
          price: String(p.price),
          priceCurrency: "INR",
        })),
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Landing />
    </>
  );
}
