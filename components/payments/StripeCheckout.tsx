"use client";

import { FormEvent, useMemo, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";

type Props = {
  onClose: () => void;
  jobId: string;              // NEW: used in return_url
  onSuccess?: () => void;     // optional callback to refresh UI
};

export default function StripeCheckout({ onClose, jobId, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const isTestMode = useMemo(
    () => (process.env.NEXT_PUBLIC_STRIPE_PK || "").startsWith("pk_test_"),
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/lender/pay/success?jobId=${encodeURIComponent(jobId)}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed. Try again.");
        return;
      }

      // If succeeded without redirect
      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful.");
        onSuccess?.();
        onClose();
      } else {
        // For 3DS flows, Stripe will redirect and come back to return_url
        toast.success("Payment submitted. Follow any bank prompts.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl" aria-label="Close">
            &times;
          </button>
        </div>

        

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement options={{ layout: "tabs" }} />
          <button
            type="submit"
            disabled={submitting || !stripe || !elements}
            className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-3 rounded-lg text-base disabled:opacity-60"
          >
            {submitting ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}