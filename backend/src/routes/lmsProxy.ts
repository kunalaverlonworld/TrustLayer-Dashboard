import express, { Request, Response } from "express";
import { User } from "../models/User";
import { Company } from "../models/Company";

const router = express.Router();

const LMS_BASE   = process.env.LMS_BASE || "https://license-system-v6ht.onrender.com";
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
// Body: { name, email, password, source?, companyName? }
// After syncing to LMS, also upsert User + Company in our own MongoDB so the
// user is immediately visible in the backend DB — not just after their first
// SSO redirect to the dashboard.
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, source, companyName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required" });
    }

    // 1. Sync to LMS first — fail fast if LMS is unavailable
    const { status, data } = await proxyToLMS("POST", "/api/external/customer-sync", {
      name,
      email,
      password,
      source: source || "trustlayer",
    });

    // 2. If LMS accepted the registration, mirror the user in our own DB
    if (status === 200 || status === 201) {
      try {
        const normalizedEmail = email.toLowerCase().trim();
        const finalCompanyName = (companyName || "").trim() || "Default Company";

        // Find or create the Company record
        let company = await Company.findOne({ name: finalCompanyName });
        if (!company) {
          let codeBase = finalCompanyName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
          if (!codeBase) codeBase = "COMP";
          let uniqueCode = codeBase;
          let counter = 1;
          while (await Company.findOne({ companyCode: uniqueCode })) {
            uniqueCode = `${codeBase}_${counter}`;
            counter++;
          }
          company = await Company.create({
            name: finalCompanyName,
            companyCode: uniqueCode,
            subscriptionPlan: "basic",
          });
          console.log(`[LMSProxy] Created new company "${finalCompanyName}" (${company._id})`);
        }

        // Find or create the User record (idempotent — safe to call multiple times)
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (!existingUser) {
          const bcrypt = await import("bcrypt");
          const passwordHash = await bcrypt.hash(password, 10);
          await User.create({
            companyId:    company._id,
            name:         name,
            email:        normalizedEmail,
            role:         "manager",
            passwordHash,
            isActive:     true,
          });
          console.log(`[LMSProxy] Created backend user for "${normalizedEmail}" under company "${finalCompanyName}"`);
        } else {
          console.log(`[LMSProxy] Backend user already exists for "${normalizedEmail}", skipping creation`);
        }
      } catch (dbErr: any) {
        // DB errors are non-fatal — LMS registration succeeded, so still return success
        console.error("[LMSProxy] Failed to mirror user in backend DB:", dbErr.message);
      }
    }

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
      `/api/external/actve-license/${encodeURIComponent(email)}?productId=${productId}`
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

// ── POST /api/lms/webhook ─────────────────────────────────────────────────────
// Webhook callback listener for LMS license activation events
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-api-key"] || req.headers["x-webhook-secret"] || req.query.secret;
    const webhookSecret = process.env.TL_WEBHOOK_SECRET || "tl-trustlayer-secret-2024-xK9mP3qR";

    if (signature !== webhookSecret) {
      console.warn("[LMS Webhook] Unauthorized request received. Invalid secret.");
      return res.status(401).json({ success: false, message: "Unauthorized. Invalid secret key." });
    }

    const email = req.body.email || req.body.activeLicense?.email || req.body.customer?.email || req.body.userEmail;
    const planName = req.body.planName || req.body.licenseType?.name || req.body.activeLicense?.licenseType?.name || req.body.license?.licenseType?.name || req.body.licenseName;
    const licenseId = req.body.licenseId || req.body.licenseTypeId || req.body.licenseType?._id || req.body.activeLicense?.licenseType?._id || req.body.license?.licenseType?._id;
    const status = req.body.status || req.body.activeLicense?.status || req.body.license?.status || "active";

    console.log(`[LMS Webhook] Processing activation: Email: "${email}", Plan: "${planName}", License: "${licenseId}", Status: "${status}"`);

    if (!email) {
      return res.status(400).json({ success: false, message: "Missing email in payload" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.warn(`[LMS Webhook] User not found: "${email}"`);
      return res.status(404).json({ success: false, message: "User not found in TrustLayer" });
    }

    // Map plans dynamically
    let localPlan: "basic" | "starter" | "pro" | "enterprise" = "basic";
    const normalizedPlan = (planName || "").toLowerCase();

    if (normalizedPlan.includes("enterprise")) {
      localPlan = "enterprise";
    } else if (normalizedPlan.includes("pro") || normalizedPlan.includes("professional") || normalizedPlan.includes("business")) {
      localPlan = "pro";
    } else if (normalizedPlan.includes("starter") || licenseId === "6a27b7c3df1fbf19bce318e1") {
      localPlan = "starter";
    } else if (normalizedPlan.includes("basic") || licenseId === "6a27b79fdf1fbf19bce318d6") {
      localPlan = "basic";
    }

    // Update Company
    const company = await Company.findById(user.companyId);
    if (!company) {
      console.warn(`[LMS Webhook] Company not found for user: "${email}"`);
      return res.status(404).json({ success: false, message: "Company not found for user" });
    }

    company.subscriptionPlan = localPlan;
    await company.save();

    console.log(`[LMS Webhook] Successfully updated company "${company.name}" subscriptionPlan to "${localPlan}"`);

    return res.status(200).json({
      success: true,
      message: "Webhook processed and subscription updated successfully",
      updatedPlan: localPlan,
    });
  } catch (err: any) {
    console.error("[LMS Webhook] Error processing webhook:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
