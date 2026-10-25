import axiosInstance from "@/lib/axios";

// The server decides the price from plan + cycle — the client no longer
// sends an amount (it used to, which let anyone pay any amount they edited
// the request to).
export const createRazorpayOrder = async (plan: string, cycle: "monthly" | "yearly") => {
  try {
    const response = await axiosInstance.post("/api/payment/create-order", {
      plan,
      cycle,
    });
    return response.data;
  } catch (error) {
    console.error("[PaymentService] Error creating order:", error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentDetails: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  try {
    const response = await axiosInstance.post("/api/payment/verify-payment", paymentDetails);
    return response.data;
  } catch (error) {
    console.error("[PaymentService] Error verifying payment:", error);
    throw error;
  }
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
