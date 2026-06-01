import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.RECRUITMENT_API_URL || "http://localhost:8000";

async function testFetch() {
    try {
        console.log(`Connecting to: ${API_URL}/ghosting/all-tracked`);
        const res = await axios.get(`${API_URL}/ghosting/all-tracked`, {
            timeout: 5000,
            headers: {
                "x-api-key": process.env.GHOSTING_API_KEY || ""
            }
        });
        console.log("✅ Success! Status:", res.status);
        console.log("Data sample length:", Array.isArray(res.data) ? res.data.length : "Not an array");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Connection failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Message:", error.message);
        }
        process.exit(1);
    }
}

testFetch();
