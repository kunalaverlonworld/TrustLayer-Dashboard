import express, { Request, Response } from "express";

const router = express.Router();

const LMS_BASE   = "https://license-system-v6ht.onrender.com";
const LMS_API_KEY = process.env.LMS_API_KEY || "my-secret-key-123";
const PRODUCT_ID  = "6a26929078d2d302b575cc10";

// Helper: forward a request to LMS and relay the response
async function proxyToLMS(
  method: string,
  path: string,
  body?: object,
  extraHeaders?: Record<string, string>
): Promise<{ status: number; data: unknown }> {
  const url = `${LMS_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": LMS_API_KEY,
    ...(extraHeaders ?? {}),
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(url, fetchOptions);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { message: "No JSON body" };
  }
  return { status: res.status, data };
}

// ── POST /api/lms/login ────────────────────────────────────────────────────────
// Body: { email, password }
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }
    const { status, data } = await proxyToLMS("POST", "/api/external/customer-login", {
      email,
      password,
    });
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /login error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

// ── POST /api/lms/register ────────────────────────────────────────────────────
// Body: { name, email, password, source? }
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, source } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required" });
    }
    const { status, data } = await proxyToLMS("POST", "/api/external/customer-sync", {
      name,
      email,
      password,
      source: source || "trustlayer",
    });
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /register error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

// ── GET /api/lms/active-license/:email ────────────────────────────────────────
// Query: ?productId=...
router.get("/active-license/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const productId = (req.query.productId as string) || PRODUCT_ID;
    const { status, data } = await proxyToLMS(
      "GET",
      `/api/external/active-license/${encodeURIComponent(email)}?productId=${productId}`
    );
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /active-license error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

// ── GET /api/lms/plans ─────────────────────────────────────────────────────────
// Returns all license plans for the TrustLayer product
router.get("/plans", async (_req: Request, res: Response) => {
  try {
    const { status, data } = await proxyToLMS(
      "GET",
      `/api/license/public/licenses-by-product/${PRODUCT_ID}`
    );
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /plans error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

// ── POST /api/lms/payment/create-order ────────────────────────────────────────
// Body: { userId, licenseId, billingCycle, amount }
router.post("/payment/create-order", async (req: Request, res: Response) => {
  try {
    const { userId, licenseId, billingCycle, amount } = req.body;
    const { status, data } = await proxyToLMS("POST", "/api/payment/create-order", {
      userId,
      licenseId,
      billingCycle,
      amount,
    });
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /payment/create-order error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

// ── POST /api/lms/payment/verify ──────────────────────────────────────────────
// Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, transactionId? }
router.post("/payment/verify", async (req: Request, res: Response) => {
  try {
    const { status, data } = await proxyToLMS("POST", "/api/payment/verify-payment", req.body);
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /payment/verify error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

// ── POST /api/lms/password-sync ───────────────────────────────────────────────
// Body: { email, passwordHash }
router.post("/password-sync", async (req: Request, res: Response) => {
  try {
    const { email, passwordHash } = req.body;
    const { status, data } = await proxyToLMS("POST", "/api/external/customer-password-sync", {
      email,
      passwordHash,
    });
    return res.status(status).json(data);
  } catch (err: any) {
    console.error("[LMSProxy] /password-sync error:", err.message);
    return res.status(502).json({ success: false, message: "LMS service unavailable" });
  }
});

export default router;
