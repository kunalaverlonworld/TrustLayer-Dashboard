import axios from "axios";

async function diagnose() {
    try {
        console.log("Calling local API: http://localhost:4000/api/trustlayer/all");
        const res = await axios.get("http://localhost:4000/api/trustlayer/all", { timeout: 10000 });
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
