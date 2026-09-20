/**
 * Phone.Email Authentication Service
 * Handles backend verification of phone numbers through Phone.Email service
 */

export interface PhoneEmailUserData {
  user_country_code: string;
  user_phone_number: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
}

export interface PhoneEmailVerificationResult {
  success: boolean;
  data?: PhoneEmailUserData;
  error?: string;
  fullPhoneNumber?: string;
}

/**
 * Fetch and verify user data from Phone.Email JSON URL
 * This MUST be called from the backend for security
 * 
 * @param userJsonUrl - The URL provided by Phone.Email (e.g., https://user.phone.email/user_abcxd123fgbfg43454.json)
 * @returns Verified user phone data
 */
export async function verifyPhoneEmailUser(
  userJsonUrl: string
): Promise<PhoneEmailVerificationResult> {
  try {
    // Validate URL format
    if (!userJsonUrl || !userJsonUrl.startsWith("https://user.phone.email/")) {
      return {
        success: false,
        error: "Invalid user JSON URL format",
      };
    }

    // Fetch user data from Phone.Email's secure URL
    const response = await fetch(userJsonUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch user data: ${response.statusText}`,
      };
    }

    const userData: PhoneEmailUserData = await response.json();

    // Validate required fields
    if (!userData.user_country_code || !userData.user_phone_number) {
      return {
        success: false,
        error: "Missing required phone number data",
      };
    }

    // Construct full phone number
    const fullPhoneNumber = `${userData.user_country_code}${userData.user_phone_number}`;

    console.log(`[PhoneEmail] Verified phone: ${fullPhoneNumber}`);

    return {
      success: true,
      data: userData,
      fullPhoneNumber,
    };
  } catch (error) {
    console.error("[PhoneEmail] Verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown verification error",
    };
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(countryCode: string, phoneNumber: string): string {
  return `${countryCode} ${phoneNumber}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - adjust based on your requirements
  const cleaned = phoneNumber.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}
