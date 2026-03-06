import { sendWelcomeEmailWithBenefits } from "./server/_core/mail";
import "dotenv/config";

async function test() {
    const email = "beshoy4703088@icloud.com";
    const name = "Bishouy";
    console.log(`Sending test welcome email to ${email}...`);
    try {
        await sendWelcomeEmailWithBenefits(email, name);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

test();
