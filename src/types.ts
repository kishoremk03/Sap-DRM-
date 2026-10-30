export interface Transaction {
  id: string;
  amount: number;
  sourceApp: string; // "PhonePe" | "Google Pay" | "Paytm" | "BHIM UPI" | "CRED" | "Amazon Pay"
  sourcePackage: string;
  senderName: string;
  upiReference: string;
  rawNotificationText: string;
  timestamp: number;
  detectionStatus: "Detected — Not Bank Verified" | "Bank Verified Settlement";
  isBankVerified: boolean;
  settledBankName?: string;
  settledAccountNumberMasked?: string;
  isSampleDemo: boolean;
}

export interface MerchantUser {
  id: string;
  email: string;
  mobileNumber: string; // Indian 10-digit mobile number with +91
  ownerName: string;
  businessName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isLoggedIn: boolean;
  joinedAt: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountNumberMasked: string; // e.g. "•••• •••• 4892"
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountType: 'CURRENT' | 'SAVINGS';
  isVerified: boolean;
  verifiedAt?: number;
  pennyDropAmount?: number; // e.g. 1.00
  pennyDropUtr?: string; // IMPS/UPI UTR
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'FAILED';
}

export interface UpiComplianceRule {
  id: string;
  ruleCode: string;
  title: string;
  category: 'QR_SPEC' | 'SECURITY' | 'LIMITS' | 'DISCLOSURE' | 'SETTLEMENT';
  description: string;
  npciCircularRef: string;
  isCompliant: boolean;
  details: string;
}

export type SupportedLanguageCode =
  | 'en'
  | 'ta'
  | 'hi'
  | 'te'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur'
  | 'sa'
  | 'kok'
  | 'ks'
  | 'ne'
  | 'sd'
  | 'mni'
  | 'mai';

export interface LanguageInfo {
  code: SupportedLanguageCode;
  nativeName: string;
  englishName: string;
  speechLocale: string;
  samplePhrase: (amount: number, app: string, sender?: string) => string;
}

export type SuccessToneStyle = 'classic' | 'upbeat_synth' | 'coin_drop' | 'celebration';

export interface SoundBoxSettings {
  displayLanguage: SupportedLanguageCode;
  announcementLanguage: SupportedLanguageCode;
  speechRate: number; // 0.5 to 2.0
  speechPitch: number; // 0.5 to 1.5
  volume: number; // 0.1 to 1.0
  chimeSoundEnabled: boolean;
  successToneStyle: SuccessToneStyle;
  highAmountCelebrationEnabled: boolean;
  highAmountThreshold: number;
  isDarkMode: boolean;
  demoModeActive: boolean;
  notificationAccessGranted: boolean;
  merchantUpiId: string;
  merchantName: string;
  browserNotificationsEnabled: boolean;
  mccCode?: string; // Merchant Category Code e.g. "5411"
  enabledApps: {
    phonepe: boolean;
    gpay: boolean;
    paytm: boolean;
    bhim: boolean;
    cred: boolean;
    amazon: boolean;
  };
}

