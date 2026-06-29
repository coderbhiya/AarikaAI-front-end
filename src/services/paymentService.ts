import axiosInstance from "@/lib/axios";

export const createRazorpayOrder = async (amount: number, currency: string = "INR") => {
  try {
    const response = await axiosInstance.post("/api/payment/create-order", {
      amount,
      currency,
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
