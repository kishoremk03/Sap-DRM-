package com.smartpay.soundbox.service

import android.app.Notification
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.smartpay.soundbox.data.AppDatabase
import com.smartpay.soundbox.data.PaymentTransaction
import com.smartpay.soundbox.data.SoundBoxPreferences
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Locale

class SmartPayNotificationListenerService : NotificationListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var ttsManager: SmartPayTtsManager
    private lateinit var preferences: SoundBoxPreferences

    override fun onCreate() {
        super.onCreate()
        ttsManager = SmartPayTtsManager(applicationContext)
        preferences = SoundBoxPreferences(applicationContext)
        Log.d("SmartPayListener", "NotificationListenerService started")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: return
        val extras = sbn.notification?.extras ?: return

        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()

        val fullBody = if (!bigText.isNullOrBlank()) bigText else text

        serviceScope.launch {
            try {
                val settings = preferences.settingsFlow.first()

                // Check if user has enabled monitoring for this application package
                val isPackageMonitored = settings.enabledPackages.contains(packageName) ||
                        settings.enabledPackages.any { packageName.contains(it) }

                if (!isPackageMonitored) {
                    return@launch
                }

                // Parse transaction details
                val parseResult = TransactionParser.parse(title, fullBody) ?: return@launch
                val appName = TransactionParser.getAppNameForPackage(packageName)

                // Save to Room Database
                val db = AppDatabase.getDatabase(applicationContext)
                val transaction = PaymentTransaction(
                    amount = parseResult.amount,
                    sourcePackage = packageName,
                    sourceAppName = appName,
                    senderName = parseResult.senderName,
                    upiReference = parseResult.upiReference,
                    rawNotificationText = "${title.orEmpty()}: ${fullBody.orEmpty()}",
                    timestamp = System.currentTimeMillis(),
                    detectionStatus = "Detected — Not Bank Verified",
                    isBankVerified = false,
                    isSampleDemo = false
                )
                db.transactionDao().insertTransaction(transaction)

                // Announce payment amount aloud
                val announcementText = ttsManager.buildAnnouncementText(
                    amount = parseResult.amount,
                    appName = appName,
                    languageCode = settings.announcementLanguage,
                    senderName = parseResult.senderName
                )

                val announcementLocale = getLocaleForCode(settings.announcementLanguage)
                ttsManager.speak(
                    text = announcementText,
                    locale = announcementLocale,
                    speechRate = settings.speechRate,
                    speechPitch = settings.speechPitch,
                    playChimeFirst = settings.soundChimeEnabled
                )

                // Gentle tactile feedback
                triggerVibration()

            } catch (e: Exception) {
                Log.e("SmartPayListener", "Error processing notification", e)
            }
        }
    }

    private fun getLocaleForCode(code: String): Locale {
        return when (code) {
            "ta" -> Locale("ta", "IN")
            "hi" -> Locale("hi", "IN")
            "te" -> Locale("te", "IN")
            "kn" -> Locale("kn", "IN")
            "ml" -> Locale("ml", "IN")
            "bn" -> Locale("bn", "IN")
            "mr" -> Locale("mr", "IN")
            "gu" -> Locale("gu", "IN")
            "pa" -> Locale("pa", "IN")
            "ur" -> Locale("ur", "IN")
            else -> Locale("en", "IN")
        }
    }

    private fun triggerVibration() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(120)
            }
        } catch (e: Exception) {
            Log.e("SmartPayListener", "Vibration failed", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ttsManager.shutdown()
    }
}
