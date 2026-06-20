// verifyOtp.ts
import { parsePhoneNumber } from "awesome-phonenumber";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Verify mobile number with OTP.
 * @param phonenumber - Phone number in international format.
 * @param json_data - JSON response from the login() function.
 * @param otp - 6-digit OTP received via SMS.
 * @returns JSON output containing the installationId.
 */
export async function verifyOtp(
  phonenumber: string,
  json_data: any,
  otp: string,
): Promise<{ installationId: string }> {
  const pn = parsePhoneNumber(phonenumber);
  if (!pn.valid) {
    throw new Error("Phone number should be in international format.");
  }

  const postData = {
    countryCode: pn.regionCode,
    dialingCode: pn.countryCode,
    phoneNumber: pn.number.significant,
    requestId: json_data.requestId, // From login response
    token: otp,
  };

  const options: AxiosRequestConfig = {
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
