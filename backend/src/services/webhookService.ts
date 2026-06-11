// src/services/webhookService.ts
import logger from "../utils/logger";

export const webhookService = {
    /**
     * Sends a notification to Slack if SLACK_WEBHOOK_URL is configured.
     * Otherwise, falls back to mock console logs.
     */
    sendNotification: async (text: string, fields?: { title: string; value: string }[]) => {
        const webhookUrl = process.env.SLACK_WEBHOOK_URL;

        if (!webhookUrl) {
            // Mock Console Log
            console.log("\n==================================================");
            console.log("🔔 [SLACK NOTIFICATION MOCK]");
            console.log(`💬 Message: ${text}`);
            if (fields && fields.length > 0) {
                fields.forEach(f => console.log(`   • ${f.title}: ${f.value}`));
            }
            console.log("==================================================\n");
            return;
        }

        try {
            const blocks = [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: text,
                    },
                },
            ];

            if (fields && fields.length > 0) {
                blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: fields.map(f => `*${f.title}:*\n${f.value}`).join("\n\n"),
                    },
                } as any);
            }

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blocks }),
            });

            if (!response.ok) {
                logger.error(`[Slack Webhook] Failed to send: ${response.statusText}`);
            } else {
                logger.info("[Slack Webhook] Notification dispatched successfully");
            }
        } catch (err: any) {
            logger.error(`[Slack Webhook] Error dispatching webhook: ${err.message}`);
        }
    }
};
