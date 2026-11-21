import { PolicyLink, PolicyPage, type PolicySection } from "@/components/landing/PolicyPage";
import { SUPPORT_EMAIL } from "@/components/landing/contact";

// Refund & cancellation policy. Matches how payments actually work (paymentController.js):
// each purchase is a one-time Razorpay payment for 30 days (monthly) or 365 days (yearly),
// with no auto-renewal. Have it reviewed by a lawyer before relying on it.

const SECTIONS: PolicySection[] = [
  {
    id: "plans",
    title: "How paid plans work",
    points: [
      "Creating an Aarika.AI account is free, so you can try the app before you pay.",
      "Paid plans (Basic and Professional) are bought with a one-time payment through Razorpay. A monthly plan runs for 30 days and a yearly plan for 365 days from the moment it is activated.",
      "Plans do not renew automatically. We never charge you again unless you choose to buy another plan.",
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation",
    points: [
      "Because plans don't auto-renew, there is nothing to cancel: your plan simply ends on its expiry date and you go back to the free account.",
      "You can stop using a paid plan at any time. Cancelling early does not stop access; the plan stays active until its end date.",
      <>To close your account altogether, email us from your registered email address at <PolicyLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</PolicyLink>.</>,
    ],
  },
  {
    id: "refunds",
    title: "When we refund",
    points: [
      "Once a plan is active on your account, the payment is not refundable, including for unused days of the plan.",
      "We give a full refund if money was taken from you but the plan was not activated on your account.",
      "We give a full refund of any extra charge if you were charged twice (or more) for the same purchase.",
      "We give a refund of the difference if you were charged more than the price shown at checkout.",
    ],
  },
  {
    id: "request",
    title: "How to ask for a refund",
    points: [
      <>Email <PolicyLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</PolicyLink> from your registered email address, within 7 days of the payment.</>,
      "Include your Razorpay payment ID (it starts with \"pay_\" and is in the receipt Razorpay sends you), the amount and the date of payment.",
      "We check the payment with Razorpay and reply to you by email.",
    ],
  },
  {
    id: "timeline",
    title: "Refund timeline",
    points: [
      "Approved refunds are made to the same card, UPI account or bank account you paid from, within 5 to 7 working days of approval.",
      "Your bank may take a few more days to show the money in your account.",
      "If a payment failed but money was debited, it is usually returned to you automatically by your bank or Razorpay within 5 to 7 working days. If it isn't, write to us with the payment details.",
    ],
  },
];

export default function RefundPolicy() {
  return (
    <PolicyPage
      title="Refund & cancellation policy"
      updated="21 November 2026"
      intro={
        <p>
          This policy explains how cancellations and refunds work for paid plans on Aarika.AI, the AI career co-pilot run by
          SenseforgeAI. Prices are listed on our <PolicyLink href="/pricing">pricing page</PolicyLink>, and how plans are
          delivered is covered in our <PolicyLink href="/shipping-policy">shipping & delivery policy</PolicyLink>.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
