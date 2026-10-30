package com.smartpay.soundbox

import com.smartpay.soundbox.service.TransactionParser
import org.junit.Assert.*
import org.junit.Test

class TransactionParserTest {

    @Test
    fun parse_phonePeNotification_extractsCorrectAmountAndSender() {
        val title = "PhonePe Business"
        val text = "Received ₹500.00 from Rajesh Kumar on PhonePe. Ref: UPI123456789012"

        val result = TransactionParser.parse(title, text)
        assertNotNull(result)
        assertEquals(500.0, result!!.amount, 0.001)
        assertEquals("Rajesh Kumar", result.senderName)
        assertEquals(true, result.isCredit)
    }

    @Test
    fun parse_googlePayNotification_extractsCorrectAmount() {
        val title = "Google Pay"
        val text = "₹1,250 received from Anita Sharma via UPI"

        val result = TransactionParser.parse(title, text)
        assertNotNull(result)
        assertEquals(1250.0, result!!.amount, 0.001)
        assertEquals("Anita Sharma", result.senderName)
    }

    @Test
    fun parse_paytmNotification_extractsAmount() {
        val title = "Paytm for Business"
        val text = "Payment of Rs 750 received via Paytm QR"

        val result = TransactionParser.parse(title, text)
        assertNotNull(result)
        assertEquals(750.0, result!!.amount, 0.001)
    }

    @Test
    fun parse_debitNotification_returnsNull_preventingFalseCredit() {
        // Outgoing payment or debit notification should NEVER be counted
        val title = "Bank Alert"
        val text = "Paid ₹350.00 to Grocery Store using UPI"

        val result = TransactionParser.parse(title, text)
        assertNull("Debit notification must not be treated as incoming payment", result)
    }

    @Test
    fun parse_unrelatedNotification_returnsNull() {
        val title = "WhatsApp"
        val text = "Hey, are you free for lunch tomorrow?"

        val result = TransactionParser.parse(title, text)
        assertNull(result)
    }
}
