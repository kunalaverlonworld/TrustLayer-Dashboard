import { sendHrFeedbackEmail } from "./emailService";

async function testEmail() {
    try {
        console.log("🚀 Testing Email Sending...");
        // I will use your own email if I find it, otherwise a placeholder for you to see the error.
        await sendHrFeedbackEmail(
            "yamank.averlon@gmail.com", // Adjust this to your Resend account email!
            "Yaman Khan",
            "Test Candidate",
            "test-app-id-123"
        );
        console.log("✅ SUCCESS: Test email sent!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ FAILED: Email test crashed.");
        console.error("Error Detail:", error.message);
        process.exit(1);
    }
}

testEmail();
