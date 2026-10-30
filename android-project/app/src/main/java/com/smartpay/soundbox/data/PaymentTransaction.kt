package com.smartpay.soundbox.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Represents a payment transaction detected via Android notification listener.
 * 
 * IMPORTANT PAYMENT SAFETY GUARANTEE:
 * A notification does NOT prove that funds have settled into the merchant bank account.
 * All notification-derived records are strictly labelled:
 * "Detected — Not Bank Verified".
 */
@Entity(tableName = "transactions")
data class PaymentTransaction(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val amount: Double,
    val sourcePackage: String,
    val sourceAppName: String,
    val senderName: String? = null,
    val upiReference: String? = null,
    val rawNotificationText: String,
    val timestamp: Long = System.currentTimeMillis(),
    
    // Safety verification status indicator
    val detectionStatus: String = "Detected — Not Bank Verified",
    val isBankVerified: Boolean = false,
    
    // Distinguishes synthetic demo samples from actual device notifications
    val isSampleDemo: Boolean = false
)
