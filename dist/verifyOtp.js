// truecaller-otp.js
// Complete OTP send and verify using truecallerjs API

import { parsePhoneNumber } from "awesome-phonenumber";
import axios from "axios";
import readline from "readline";

// ================================================================
// LOGIN FUNCTION (Send OTP)
// ================================================================

async function login(phoneNumber) {
    const pn = parsePhoneNumber(phoneNumber);
    if (!pn?.valid) {
        throw new Error("Invalid phone number.");
    }

    const postUrl = "https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp";
    const data = {
        countryCode: pn.regionCode,
        dialingCode: pn.countryCode,
        installationDetails: {
            app: {
                buildVersion: 5,
                majorVersion: 11,
                minorVersion: 7,
                store: "GOOGLE_PLAY",
            },
            device: {
                deviceId: generateRandomString(16),
                language: "en",
                manufacturer: "Samsung",
                model: "SM-G998B",
                osName: "Android",
                osVersion: "10",
                mobileServices: ["GMS"],
            },
            language: "en",
        },
        phoneNumber: pn.number.significant,
        region: "region-2",
        sequenceNo: 2,
    };
    const options = {
        method: "POST",
        headers: {
            "content-type": "application/json; charset=UTF-8",
            "accept-encoding": "gzip",
            "user-agent": "Truecaller/11.75.5 (Android;10)",
            clientsecret: "lvc22mp3l1sfv6ujg83rd17btt",
        },
        url: postUrl,
        data,
    };
    const res = await axios(options);
    return res.data;
}

// ================================================================
// VERIFY OTP FUNCTION
// ================================================================

async function verifyOtp(phoneNumber, loginResponse, otp) {
    const pn = parsePhoneNumber(phoneNumber);
    if (!pn.valid) {
        throw new Error("Phone number should be in international format.");
    }
    const postData = {
        countryCode: pn.regionCode,
        dialingCode: pn.countryCode,
        phoneNumber: pn.number.significant,
        requestId: loginResponse.requestId,
        token: otp,
    };
    const options = {
        method: "POST",
        headers: {
            "content-type": "application/json; charset=UTF-8",
            "accept-encoding": "gzip",
            "user-agent": "Truecaller/11.75.5 (Android;10)",
            clientsecret: "lvc22mp3l1sfv6ujg83rd17btt",
        },
        url: "https://account-asia-south1.truecaller.com/v1/verifyOnboardingOtp",
        data: postData,
    };
    const res = await axios(options);
    return res.data;
}

// ================================================================
// UTILITY: Generate Random String
// ================================================================

function generateRandomString(length) {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// ================================================================
// COMMAND LINE INTERFACE
// ================================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main() {
    console.log("\n📞 Truecaller OTP Verification Demo\n");

    rl.question("Enter phone number (e.g., +919037754895): ", async (phone) => {
        try {
            console.log("📨 Sending OTP...");
            const loginRes = await login(phone);
            console.log("✅ OTP sent successfully!");
            console.log("📋 Request ID:", loginRes.requestId);
            console.log("⏱️  OTP expires in:", loginRes.otpTtl, "seconds\n");

            rl.question("Enter the 6-digit OTP: ", async (otp) => {
                try {
                    console.log("🔍 Verifying OTP...");
                    const verifyRes = await verifyOtp(phone, loginRes, otp);
                    console.log("✅ Verification successful!");
                    console.log("🔑 Installation ID:", verifyRes.installationId);
                    console.log("📋 Full response:", JSON.stringify(verifyRes, null, 2));
                } catch (err) {
                    console.error("❌ Verification failed:", err.response?.data || err.message);
                }
                rl.close();
            });
        } catch (err) {
            console.error("❌ Login failed:", err.response?.data || err.message);
            rl.close();
        }
    });
}

main();
