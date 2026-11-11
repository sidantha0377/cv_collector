import { EmailClient } from "@azure/communication-email";

let _emailClient: EmailClient | null = null;

export function getEmailClient(): EmailClient {
  if (_emailClient) return _emailClient;

  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error(
      "Missing AZURE_COMMUNICATION_CONNECTION_STRING in .env.local",
    );
  }

  _emailClient = new EmailClient(connectionString);
  return _emailClient;
}

export function getSenderAddress(): string {
  const sender = process.env.AZURE_SENDER_ADDRESS;

  if (!sender) {
    throw new Error("Missing AZURE_SENDER_ADDRESS in .env.local");
  }
  return sender;
}

// otp - email
export function getEmailClientOTP(): EmailClient {
  if (_emailClient) return _emailClient;

  const connectionString =
    process.env.AZURE_COMMUNICATION_CONNECTION_STRING_OTP;

  if (!connectionString) {
    throw new Error(
      "Missing AZURE_COMMUNICATION_CONNECTION_STRING_OTP in .env.local",
    );
  }

  _emailClient = new EmailClient(connectionString);
  return _emailClient;
}

export function getSenderAddressOTP(): string {
  const sender = process.env.AZURE_SENDER_ADDRESS_OTP;

  if (!sender) {
    throw new Error("Missing AZURE_SENDER_ADDRESS in .env.local");
  }
  return sender;
}
