import About from "../../views/About";
import { Metadata } from "next";
import { SITE_SUMMARY, SITE_URL } from "@/components/landing/content";

const title = "About Aarika.AI | AI career co-pilot by SenseforgeAI";
const description =
  "Aarika.AI is an AI career co-pilot for India, built by SenseforgeAI: mock interviews, a job agent, resume builder and timed mock exams for students, job seekers and professionals.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["Aarika.AI", "Aarika AI", "SenseforgeAI", "Senseforge", "AI career guidance India", "AI mock interview", "mock exams"],
  alternates: { canonical: "/about" },
  openGraph: { title, description, url: `${SITE_URL}/about`, siteName: "Aarika.AI", type: "website" },
};

// Structured data: who makes Aarika.AI and how to reach them. Contact details match the page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#page`,
      url: `${SITE_URL}/about`,
      name: title,
      description: SITE_SUMMARY,
      about: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Aarika.AI",
      url: SITE_URL,
      logo: `${SITE_URL}/aarika-logo.png`,
      parentOrganization: { "@type": "Organization", name: "SenseforgeAI", url: "https://senseforge.in" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "dave@senseforge.in",
        telephone: "+91 91746 99025",
        areaServed: "IN",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <About />
    </>
  );
}
