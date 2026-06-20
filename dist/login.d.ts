// login.ts
import axios from "axios";
import { parsePhoneNumber } from "awesome-phonenumber";
import { device } from "./data/phones.js";

interface LoginResponse {
  status: number;
  message: string;
  domain: string;
  parsedPhoneNumber: number;
  parsedCountryCode: string;
  requestId: string;
  method: string;
  tokenTtl: number;
}

function generateRandomString(length: number): string {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Login to Truecaller.
 * @param phoneNumber - Phone number in international format (e.g., +919876543210).
 * @returns Promise that resolves to the login response containing the requestId used for OTP verification.
 */
export async function login(phoneNumber: string): Promise<LoginResponse> {
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
        manufacturer: device.manufacturer,
        model: device.model,
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
