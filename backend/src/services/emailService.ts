import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// RESEND_API_KEY is optional — server boots without it, email features will be disabled
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY is not set. Email features will be disabled.");
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendHrFeedbackEmail = async (
  hrEmail: string,
  hrName: string,
  candidateName: string,
  applicationId: string
): Promise<void> => {
  try {
    if (!resend) {
      throw new Error("Email service is not configured. RESEND_API_KEY is missing.");
    }

    if (!hrEmail) {
      throw new Error("HR email is missing");
    }

    const feedbackLink = `${process.env.FRONTEND_URL}/hr-feedback/${applicationId}`;
    const testOverride = process.env.TEST_RECIPIENT_EMAIL?.trim(); 
    const recipient = testOverride || hrEmail.trim();

    const response = await resend.emails.send({
      from: "TrustLayer <onboarding@resend.dev>",
      to: recipient,
      subject: `Employment Verification Request - ${candidateName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Employment Verification Request</h2>
          <p>Dear ${hrName || "HR Team"},</p>
          <p>
            You are listed as the previous HR for 
            <strong>${candidateName}</strong>.
          </p>
          <p>
            Kindly click the button below to submit employment feedback.
          </p>
          <a href="${feedbackLink}"
            style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
            Submit HR Feedback
          </a>
          <p style="margin-top:20px;font-size:12px;color:#888;">
            TrustLayer Recruitment System
          </p>
        </div>
      `,
    });

    console.log("=== RESEND RESPONSE ===");
    console.log(response);
    console.log("=======================");

    if (!response || (response as any).error) {
      const errorMessage =
        (response as any)?.error?.message || "Unknown Resend error";
      throw new Error(errorMessage);
    }

    console.log(`Email successfully sent to ${hrEmail}`);

  } catch (error: any) {
    console.error("=== EMAIL SENDING FAILED ===");
    console.error("Recipient:", hrEmail);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("============================");

    // VERY IMPORTANT → rethrow so route knows it failed
    throw error;
  }
};
