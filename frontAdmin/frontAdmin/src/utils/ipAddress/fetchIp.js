import axios from "axios";
 
export let fetchIp = async () => {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        if (response && response.status === 200) {
            return response.data;
        } else {
            throw new Error("Failed to fetch IP data");
        }
    } catch (error) {
        console.log("Error fetching IP data:", error.message);
        return {};
    }
};