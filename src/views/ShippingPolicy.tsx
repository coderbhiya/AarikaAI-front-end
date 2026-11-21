import { PolicyLink, PolicyPage, type PolicySection } from "@/components/landing/PolicyPage";
import { SUPPORT_EMAIL } from "@/components/landing/contact";

// Shipping & delivery policy for a fully online service: a paid plan is switched on in the
// user's account as soon as Razorpay confirms the payment (paymentController.verifyPayment).

const SECTIONS: PolicySection[] = [
  {
    id: "online",
    title: "What we deliver",
    points: [
      "Aarika.AI is an online service. Paid plans give your account more AI mock interviews and deeper preparation features inside the app.",
      "Nothing physical is shipped, and there are no delivery charges.",
    ],
  },
  {
    id: "when",
    title: "When you get access",
    points: [
      "Your plan is activated on your Aarika.AI account as soon as Razorpay confirms your payment, usually within a few seconds.",
      "You can use it straight away at aarikaai.in after logging in with the account you paid from.",
      "A monthly plan stays active for 30 days and a yearly plan for 365 days from activation.",
    ],
  },
  {
    id: "problems",
    title: "If your plan isn't active",
    points: [
      "Log out and log in again, then check your plan on the Subscription page.",
      <>If it still isn't active, email <PolicyLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</PolicyLink> with your registered email address and Razorpay payment ID. We will activate the plan or refund you in full, as set out in our <PolicyLink href="/refund-policy">refund & cancellation policy</PolicyLink>.</>,
    ],
  },
];

export default function ShippingPolicy() {
  return (
    <PolicyPage
      title="Shipping & delivery policy"
      updated="21 November 2026"
      intro={
        <p>
          How paid plans on Aarika.AI, run by SenseforgeAI, are delivered after you pay. Plans and prices are on our{" "}
          <PolicyLink href="/pricing">pricing page</PolicyLink>.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
