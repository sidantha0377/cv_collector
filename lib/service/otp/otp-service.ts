import crypto from "crypto";
import {
  getEmailClientOTP,
  getSenderAddressOTP,
} from "@/lib/azure/email-client";
import { otpRepository } from "@/lib/repositories/otpRepository";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "CV Collector";

const OTP_SEND_MAX_RETRIES = 3;
const OTP_SEND_RETRY_DELAY_MS = 1500; // wait 1.5s between retries

function generateOtpCode(): string {
  const buffer = crypto.randomInt(0, 999_999);
  return String(buffer).padStart(OTP_LENGTH, "0");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildEmailHtml(otpCode: string, role: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your ${APP_NAME} Login Code</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e8e8e8; }
    .header { background: #1a1a1a; padding: 28px 36px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: -0.3px; }
    .body { padding: 36px; }
    .body p { margin: 0 0 16px; font-size: 15px; color: #444; line-height: 1.6; }
    .otp-box { background: #f8f8f8; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-code { font-size: 40px; font-weight: 600; letter-spacing: 10px; color: #1a1a1a; font-family: "Courier New", monospace; }
    .otp-expiry { font-size: 13px; color: #888; margin-top: 10px; }
    .footer { padding: 20px 36px; background: #fafafa; border-top: 1px solid #f0f0f0; font-size: 12px; color: #aaa; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>${APP_NAME}</h1></div>
    <div class="body">
      <p>Hi there,</p>
      <p>Use the code below to sign in to your <strong>${role}</strong> account. This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>.</p>
      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">Valid for ${OTP_TTL_MINUTES} minutes</div>
      </div>
      <p>If you did not request this code, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      This is an automated message from ${APP_NAME}. Please do not reply to this email.
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(otpCode: string): string {
  return `Your ${APP_NAME} login code is: ${otpCode}\n\nThis code expires in ${OTP_TTL_MINUTES} minutes.\n\nIf you did not request this, ignore this email.`;
}

export type OtpRole = "candidate" | "admin";

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface VerifyOtpResult {
  valid: boolean;
  role?: OtpRole;
  error?: string;
}

// Attempts to send via Azure, retries on 429 TooManyRequests
// async function sendWithRetry(
//   email: string,
//   otpCode: string,
//   role: string,
// ): Promise<string | undefined> {
//   const emailClient = getEmailClientOTP();
//   const senderAddress = getSenderAddressOTP();
//   console.log("send with re try , email :", email);
//   let lastError: unknown;

//   for (let attempt = 1; attempt <= OTP_SEND_MAX_RETRIES; attempt++) {
//     console.log("try no:", attempt);
//     try {
//       const poller = await emailClient.beginSend({
//         senderAddress,
//         recipients: {
//           to: [{ address: email }],
//         },
//         content: {
//           subject: `Your ${APP_NAME} login code: ${otpCode}`,
//           html: buildEmailHtml(otpCode, role),
//           plainText: buildEmailText(otpCode),
//         },
//       });

//       // No polling — fire and return immediately
//       const messageId = poller.getResult()?.id;
//       console.log("msg : ", messageId);
//       return messageId;
//     } catch (err: any) {
//       lastError = err;

//       const is429 =
//         err?.statusCode === 429 ||
//         err?.code === "TooManyRequests" ||
//         err?.details?.xMsErrorCode === "TooManyRequests";

//       if (is429 && attempt < OTP_SEND_MAX_RETRIES) {
//         // Respect Azure retry-after header if present, else use default delay
//         const retryAfterSec = parseInt(err?.details?.["retry-after"] ?? "0");
//         const waitMs =
//           retryAfterSec > 0
//             ? retryAfterSec * 1000 + 200 // a little buffer
//             : OTP_SEND_RETRY_DELAY_MS * attempt; // exponential: 1.5s, 3s

//         console.warn(
//           `[otpService.send] 429 on attempt ${attempt}/${OTP_SEND_MAX_RETRIES} — retrying in ${waitMs}ms`,
//         );

//         await sleep(waitMs);
//         continue;
//       }

//       // Not a 429, or out of retries — rethrow
//       throw lastError;
//     }
//   }

//   throw lastError;
// }

export const otpService = {
  async send(email: string, role: OtpRole): Promise<SendOtpResult> {
    console.log("try to send otp , email :", email);
    try {
      const otpCode = generateOtpCode();

      await otpRepository.create(email, otpCode, role, OTP_TTL_MINUTES);

      // const messageId = await sendWithRetry(email, otpCode, role);
      const emailClient = getEmailClientOTP();
      const senderAddress = getSenderAddressOTP();
      const poller = await emailClient.beginSend({
        senderAddress,
        recipients: {
          to: [{ address: email }],
        },
        content: {
          subject: `Your ${APP_NAME} login code: ${otpCode}`,
          html: buildEmailHtml(otpCode, role),
          plainText: buildEmailText(otpCode),
        },
      });

      const messageId = poller.getResult()?.id;

      return { success: true, messageId };
    } catch (err) {
      console.error("[otpService.send]", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  },

  async verify(email: string, otpCode: string): Promise<VerifyOtpResult> {
    try {
      const record = await otpRepository.findValid(email, otpCode);

      if (!record) {
        return { valid: false, error: "Invalid or expired code." };
      }

      await otpRepository.markUsed(email, otpCode);

      return { valid: true, role: record.role as OtpRole };
    } catch (err) {
      console.error("[otpService.verify]", err);
      return { valid: false, error: "Verification failed. Please try again." };
    }
  },
};
