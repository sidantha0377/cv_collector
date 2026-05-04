import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { OtpRecordEntity } from "@/lib/types/azure-tables";

// Handles storage and validation of one-time passwords.
export const otpRepository = {
  // Saves a new OTP with a calculated expiry time
  async create(email: string, code: string, role: string, ttlMinutes: number) {
    const client = getTableClient(TABLE_NAMES.OTP_RECORDS);
    const safeTtl = Number(ttlMinutes) || 10;
    const expiresAt = new Date(Date.now() + safeTtl * 60_000).toISOString();

    const entity = {
      partitionKey: email.toLowerCase(),
      rowKey: code,
      role,
      expiresAt,
      used: false,
    };

    return await client.createEntity(entity);
  },

  // Finds an OTP that hasn't been used and hasn't expired
  async findValid(
    email: string,
    otpCode: string,
  ): Promise<OtpRecordEntity | null> {
    const client = getTableClient(TABLE_NAMES.OTP_RECORDS);
    try {
      const entity = await client.getEntity<OtpRecordEntity>(
        email.toLowerCase(),
        otpCode,
      );
      if (entity.used || new Date(entity.expiresAt) < new Date()) return null;
      return entity;
    } catch {
      return null;
    }
  },

  // deletes an OTP by marking it as used
  async markUsed(email: string, otpCode: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.OTP_RECORDS);
    await client.updateEntity(
      { partitionKey: email.toLowerCase(), rowKey: otpCode, used: true },
      "Merge",
    );
  },
};
