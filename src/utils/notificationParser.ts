export interface ParsedWebPayment {
  amount: number;
  appName: string;
  senderName: string;
  upiReference: string;
  isCredit: boolean;
}

export function parseIncomingNotification(title: string, body: string): ParsedWebPayment | null {
  const combined = `${title} ${body}`.trim();
  if (!combined) return null;

  const lower = combined.toLowerCase();

  // Outgoing check
  const debitKeywords = ['paid', 'debited', 'sent', 'transferred to', 'withdrawn'];
  const creditKeywords = ['received', 'credited', 'added', 'accepted', 'deposited', 'பெறப்பட்டது', 'प्राप्त'];

  if (debitKeywords.some((k) => lower.includes(k)) && !creditKeywords.some((k) => lower.includes(k))) {
    return null;
  }

  // Currency extraction
  const regexAmount = /(?:₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;
  const match = combined.match(regexAmount);
  if (!match) return null;

  const rawNum = match[1].replace(/,/g, '');
  const amount = parseFloat(rawNum);
  if (isNaN(amount) || amount <= 0) return null;

  // App detection
  let appName = 'UPI Payment';
  if (/phonepe/i.test(combined)) appName = 'PhonePe';
  else if (/gpay|google\s*pay/i.test(combined)) appName = 'Google Pay';
  else if (/paytm/i.test(combined)) appName = 'Paytm';
  else if (/bhim/i.test(combined)) appName = 'BHIM UPI';
  else if (/cred/i.test(combined)) appName = 'CRED';
  else if (/amazon/i.test(combined)) appName = 'Amazon Pay';

  // Sender detection
  const senderMatch = combined.match(/(?:from|by)\s+([A-Za-z\s]{3,25}?)(?:\s+(?:on|via|through|using|ref|\.|,)|$)/i);
  const senderName = senderMatch ? senderMatch[1].trim() : 'UPI Customer';

  // Reference detection
  const refMatch = combined.match(/(?:UPI\s*Ref|UTR|Txn\s*ID|Ref)[\s:]*([0-9A-Za-z]{8,16})/i);
  const upiReference = refMatch ? refMatch[1].trim() : `UPI${Date.now().toString().slice(-10)}`;

  return {
    amount,
    appName,
    senderName,
    upiReference,
    isCredit: true,
  };
}
