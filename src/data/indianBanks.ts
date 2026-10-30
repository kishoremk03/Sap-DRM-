export interface BankInfo {
  code: string;
  name: string;
  logoColor: string;
  shortName: string;
  ifscPrefix: string;
  sampleIfsc: string;
  popularBranch: string;
}

export const POPULAR_INDIAN_BANKS: BankInfo[] = [
  {
    code: 'SBI',
    name: 'State Bank of India',
    shortName: 'SBI',
    logoColor: '#1d4ed8',
    ifscPrefix: 'SBIN',
    sampleIfsc: 'SBIN0000691',
    popularBranch: 'Mumbai Main Branch, Fort',
  },
  {
    code: 'HDFC',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    logoColor: '#004c8f',
    ifscPrefix: 'HDFC',
    sampleIfsc: 'HDFC0000001',
    popularBranch: 'Kanjurmarg Branch, Mumbai',
  },
  {
    code: 'ICICI',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    logoColor: '#b91c1c',
    ifscPrefix: 'ICIC',
    sampleIfsc: 'ICIC0000101',
    popularBranch: 'Bandra Kurla Complex, Mumbai',
  },
  {
    code: 'AXIS',
    name: 'Axis Bank',
    shortName: 'Axis',
    logoColor: '#831843',
    ifscPrefix: 'UTIB',
    sampleIfsc: 'UTIB0000005',
    popularBranch: 'Worli Branch, Mumbai',
  },
  {
    code: 'PNB',
    name: 'Punjab National Bank',
    shortName: 'PNB',
    logoColor: '#991b1b',
    ifscPrefix: 'PUNB',
    sampleIfsc: 'PUNB0000100',
    popularBranch: 'Connaught Place, New Delhi',
  },
  {
    code: 'BOB',
    name: 'Bank of Baroda',
    shortName: 'Baroda',
    logoColor: '#ea580c',
    ifscPrefix: 'BARB',
    sampleIfsc: 'BARB0MANDVI',
    popularBranch: 'Mandvi Branch, Vadodara',
  },
  {
    code: 'CANARA',
    name: 'Canara Bank',
    shortName: 'Canara',
    logoColor: '#0284c7',
    ifscPrefix: 'CNRB',
    sampleIfsc: 'CNRB0000001',
    popularBranch: 'Town Hall Branch, Bengaluru',
  },
  {
    code: 'KOTAK',
    name: 'Kotak Mahindra Bank',
    shortName: 'Kotak',
    logoColor: '#dc2626',
    ifscPrefix: 'KKBK',
    sampleIfsc: 'KKBK0000001',
    popularBranch: 'Nariman Point, Mumbai',
  },
  {
    code: 'INDUSIND',
    name: 'IndusInd Bank',
    shortName: 'IndusInd',
    logoColor: '#7c2d12',
    ifscPrefix: 'INDB',
    sampleIfsc: 'INDB0000001',
    popularBranch: 'Opera House Branch, Mumbai',
  },
  {
    code: 'UNION',
    name: 'Union Bank of India',
    shortName: 'Union',
    logoColor: '#2563eb',
    ifscPrefix: 'UBIN',
    sampleIfsc: 'UBIN0530018',
    popularBranch: 'Samachar Marg, Mumbai',
  },
  {
    code: 'INDIAN',
    name: 'Indian Bank',
    shortName: 'Indian',
    logoColor: '#0369a1',
    ifscPrefix: 'IDIB',
    sampleIfsc: 'IDIB000M001',
    popularBranch: 'Harbour Branch, Chennai',
  },
  {
    code: 'IDFC',
    name: 'IDFC FIRST Bank',
    shortName: 'IDFC FIRST',
    logoColor: '#9f1239',
    ifscPrefix: 'IDFB',
    sampleIfsc: 'IDFB0040101',
    popularBranch: 'Naman Chambers, BKC, Mumbai',
  },
];

export function validateIfsc(ifsc: string): boolean {
  // Standard RBI / NPCI IFSC Format: 4 letters + 0 + 6 alphanumeric
  const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return regex.test(ifsc.trim().toUpperCase());
}

export function lookupIfscBranch(ifsc: string): { bankName: string; branch: string; isValid: boolean } {
  const clean = ifsc.trim().toUpperCase();
  if (!validateIfsc(clean)) {
    return { bankName: 'Unknown Bank', branch: 'Invalid IFSC Format (Example: HDFC0000001)', isValid: false };
  }

  const prefix = clean.substring(0, 4);
  const matchedBank = POPULAR_INDIAN_BANKS.find((b) => b.ifscPrefix === prefix);

  if (matchedBank) {
    if (clean === matchedBank.sampleIfsc) {
      return { bankName: matchedBank.name, branch: matchedBank.popularBranch, isValid: true };
    }
    return {
      bankName: matchedBank.name,
      branch: `Commercial Core Banking Branch (${clean.substring(5)})`,
      isValid: true,
    };
  }

  return {
    bankName: `${prefix} Banking Corporation`,
    branch: `Authorized NPCI Branch (${clean.substring(5)})`,
    isValid: true,
  };
}

export async function simulatePennyDropVerification(data: {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  holderName: string;
}): Promise<{
  success: boolean;
  pennyDropAmount: number;
  utr: string;
  verifiedName: string;
  matchPercentage: number;
  message: string;
}> {
  // Simulate network delay to NPCI IMPS Switch
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const utr = `IMPS${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  const verifiedName = data.holderName.trim().toUpperCase();

  return {
    success: true,
    pennyDropAmount: 1.0,
    utr,
    verifiedName,
    matchPercentage: 100,
    message: `Account successfully verified via ₹1.00 IMPS penny-drop credit. UTR: ${utr}`,
  };
}
