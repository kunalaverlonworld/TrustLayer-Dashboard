import express, { Request, Response } from "express";
import crypto from "crypto";

const router = express.Router();

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const LMS_BASE   = "https://license-system-v6ht.onrender.com";
const LMS_API_KEY = process.env.LMS_API_KEY || "my-secret-key-123";

// ── POST /api/razorpay/create-order ──────────────────────────────────────────
// Creates a Razorpay order directly without going through LMS payment initiation.
// Body: { amount (paise), currency?, receipt?, licenseId, userId, billingCycle }
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const {
      amount,
      currency = "INR",
      receipt,
      licenseId,
      userId,
      billingCycle,
    } = req.body;

    if (!amount || !licenseId || !userId || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: "amount, licenseId, userId and billingCycle are required",
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // ── Mock mode: no Razorpay keys configured yet ───────────────────────────
      console.warn("[Razorpay] Keys not set — returning mock order for testing");
      return res.status(200).json({
        success:  true,
        orderId:  `mock_order_${Date.now()}`,
        key:      "rzp_test_mock",
        currency: "INR",
        amount:   Number(amount),
        mock:     true,
      });
    }

    // Create order via Razorpay REST API
    const orderPayload = {
      amount:   Number(amount),           // already in paise from frontend
      currency,
      receipt:  receipt || `tl_${Date.now()}`,
      notes: {
        licenseId,
        userId,
        billingCycle,
        source: "trustlayer",
      },
    };

    const authHeader = "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    const rzpData: any = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error("[Razorpay] create-order failed:", rzpData);
      return res.status(400).json({
        success: false,
        message: rzpData?.error?.description || "Failed to create Razorpay order",
      });
    }

    return res.status(200).json({
      success:    true,
      orderId:    rzpData.id,
      key:        RAZORPAY_KEY_ID,
      currency:   rzpData.currency,
      amount:     rzpData.amount,
    });
  } catch (err: any) {
    console.error("[Razorpay] /create-order error:", err.message);
    return res.status(502).json({ success: false, message: "Payment service error" });
  }
});

// ── POST /api/razorpay/verify ─────────────────────────────────────────────────
// Verifies Razorpay payment signature. On success, activates the license in LMS.
// Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature,
//         licenseId, userId, billingCycle }
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      licenseId,
      userId,
      billingCycle,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details missing" });
    }

    // ── Mock mode: accept mock payments without signature verification ────────
    const isMock = razorpay_order_id?.startsWith("mock_order_");
    if (!isMock) {
      // Verify HMAC-SHA256 signature for real payments
      const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
      if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment signature verification failed" });
      }
    }

    // ── Activate license in LMS ───────────────────────────────────────────────
    if (licenseId && userId) {
      try {
        await fetch(`${LMS_BASE}/api/payment/create-order`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", "x-api-key": LMS_API_KEY },
          body:    JSON.stringify({
            userId,
            licenseId,
            billingCycle: billingCycle || "monthly",
            amount:       0,        // already paid via Razorpay
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          }),
        });
      } catch (lmsErr: any) {
        // Non-blocking — payment was verified, license activation failure is logged
        console.warn("[Razorpay] LMS license activation call failed (non-blocking):", lmsErr.message);
      }
    }

    return res.status(200).json({ success: true, message: "Payment verified" });
  } catch (err: any) {
    console.error("[Razorpay] /verify error:", err.message);
    return res.status(502).json({ success: false, message: "Verification service error" });
  }
});

export default router;
