package com.smartpay.soundbox.service

import java.util.regex.Pattern

data class ParsedPaymentResult(
    val amount: Double,
    val senderName: String?,
    val upiReference: String?,
    val isCredit: Boolean
)

object TransactionParser {

    // Regex to match Indian currency amounts like ₹500, Rs. 1,250.00, INR 450
    private val AMOUNT_PATTERN = Pattern.compile(
        """(?:₹|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)""",
        Pattern.CASE_INSENSITIVE
    )

    // Fallback amount pattern if currency symbol is at the end: "500.00 received"
    private val AMOUNT_FALLBACK_PATTERN = Pattern.compile(
        """([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:rupees|rs|inr)""",
        Pattern.CASE_INSENSITIVE
    )

    // Sender name extractor (e.g. "from John Doe", "by Rahul Sharma")
    private val SENDER_PATTERN = Pattern.compile(
        """(?:from|by)\s+([A-Za-z\s]{3,30}?)(?:\s+(?:on|via|through|using|ref|\.|,|\sto\s)|$)""",
        Pattern.CASE_INSENSITIVE
    )

    // UPI UTR or Reference number (typically 12 digits in India)
    private val UPI_REF_PATTERN = Pattern.compile(
        """(?:UPI\s*Ref(?:\s*No)?|UTR|Txn\s*ID|Ref\s*No)[\s:]*([0-9A-Za-z]{8,16})""",
        Pattern.CASE_INSENSITIVE
    )

    // Keywords signaling money was RECEIVED (Credit)
    private val CREDIT_KEYWORDS = listOf(
        "received",
        "credited",
        "added",
        "accepted",
        "deposited",
        "பெறப்பட்டது",
        "प्राप्त",
        "स्वीकार"
    )

    // Keywords signaling money was SENT / DEBITED (must NOT be treated as incoming merchant income)
    private val DEBIT_KEYWORDS = listOf(
        "paid",
        "sent",
        "debited",
        "transferred to",
        "withdrawn"
    )

    fun parse(title: String?, text: String?): ParsedPaymentResult? {
        val combined = "${title.orEmpty()} ${text.orEmpty()}".trim()
        if (combined.isEmpty()) return null

        val lowerCombined = combined.lowercase()

        // Check if this is an outgoing payment or debit
        val isExplicitDebit = DEBIT_KEYWORDS.any { lowerCombined.contains(it) } &&
                !CREDIT_KEYWORDS.any { lowerCombined.contains(it) }
        if (isExplicitDebit) {
            return null // Ignore outgoing payments
        }

        val isCredit = CREDIT_KEYWORDS.any { lowerCombined.contains(it) }
        if (!isCredit && !lowerCombined.contains("payment") && !lowerCombined.contains("upi")) {
            return null
        }

        // Extract amount
        var matcher = AMOUNT_PATTERN.matcher(combined)
        var amount: Double? = null

        if (matcher.find()) {
            val rawNum = matcher.group(1)?.replace(",", "")
            amount = rawNum?.toDoubleOrNull()
        }

        if (amount == null) {
            matcher = AMOUNT_FALLBACK_PATTERN.matcher(combined)
            if (matcher.find()) {
                val rawNum = matcher.group(1)?.replace(",", "")
                amount = rawNum?.toDoubleOrNull()
            }
        }

        if (amount == null || amount <= 0.0) {
            return null
        }

        // Extract sender
        var senderName: String? = null
        val senderMatcher = SENDER_PATTERN.matcher(combined)
        if (senderMatcher.find()) {
            senderName = senderMatcher.group(1)?.trim()
        }

        // Extract UPI reference
        var upiRef: String? = null
        val refMatcher = UPI_REF_PATTERN.matcher(combined)
        if (refMatcher.find()) {
            upiRef = refMatcher.group(1)?.trim()
        }

        return ParsedPaymentResult(
            amount = amount,
            senderName = senderName,
            upiReference = upiRef,
            isCredit = true
        )
    }

    fun getAppNameForPackage(packageName: String): String {
        return when {
            packageName.contains("phonepe") -> "PhonePe"
            packageName.contains("nbu.paisa") -> "Google Pay"
            packageName.contains("paytm") -> "Paytm"
            packageName.contains("npci.upiapp") -> "BHIM UPI"
            packageName.contains("dreamplug") -> "CRED"
            packageName.contains("amazon") -> "Amazon Pay"
            packageName.contains("bharatpe") -> "BharatPe"
            else -> "UPI Payment"
        }
    }
}
