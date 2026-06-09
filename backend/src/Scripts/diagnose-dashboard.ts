import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || "5000";

async function diagnose() {
    try {
        console.log(`Calling local API: http://localhost:${PORT}/api/trustlayer/all`);
        const res = await axios.get(`http://localhost:${PORT}/api/trustlayer/all`, { timeout: 10000 });
        console.log("Success:", res.status);
        process.exit(0);
    } catch (error: any) {
        console.error("❌ API Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Error Detail JSON:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Message:", error.message);
        }
        process.exit(1);
    }
}

diagnose();
