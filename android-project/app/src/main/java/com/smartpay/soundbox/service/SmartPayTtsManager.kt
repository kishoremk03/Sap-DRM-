package com.smartpay.soundbox.service

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale

class SmartPayTtsManager(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false
    private var pendingSpeech: String? = null
    private var pendingLocale: Locale? = null

    init {
        tts = TextToSpeech(context.applicationContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            Log.d("SmartPayTTS", "TextToSpeech engine successfully initialized")
            
            pendingSpeech?.let { text ->
                speak(text, pendingLocale ?: Locale("ta", "IN"))
                pendingSpeech = null
                pendingLocale = null
            }
        } else {
            Log.e("SmartPayTTS", "Failed to initialize TextToSpeech engine: status $status")
        }
    }

    /**
     * Checks if the device's TTS engine supports the requested language.
     * Returns true if fully supported or available with country data.
     */
    fun isLanguageAvailable(locale: Locale): Boolean {
        val engine = tts ?: return false
        val availability = engine.isLanguageAvailable(locale)
        return availability >= TextToSpeech.LANG_AVAILABLE
    }

    /**
     * Speaks the given announcement text with the chosen language, speech rate, and pitch.
     * Also checks language availability and safely falls back to English if the specific voice is missing.
     */
    fun speak(
        text: String,
        locale: Locale,
        speechRate: Float = 1.0f,
        speechPitch: Float = 1.0f,
        playChimeFirst: Boolean = true
    ) {
        if (!isInitialized) {
            pendingSpeech = text
            pendingLocale = locale
            return
        }

        val engine = tts ?: return

        // Optional payment soundbox hardware chime tone
        if (playChimeFirst) {
            playToneBeep()
        }

        // Check if device supports requested locale
        val targetLocale = if (isLanguageAvailable(locale)) {
            locale
        } else {
            Log.w("SmartPayTTS", "Locale $locale not installed on device. Falling back to English.")
            Locale.ENGLISH
        }

        engine.language = targetLocale
        engine.setSpeechRate(speechRate.coerceIn(0.5f, 2.0f))
        engine.setPitch(speechPitch.coerceIn(0.5f, 1.5f))

        val params = Bundle().apply {
            putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
        }

        engine.speak(text, TextToSpeech.QUEUE_ADD, params, "SmartPay_TTS_${System.currentTimeMillis()}")
    }

    private fun playToneBeep() {
        try {
            val toneGen = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
            toneGen.startTone(ToneGenerator.TONE_PROP_BEEP2, 180)
        } catch (e: Exception) {
            Log.e("SmartPayTTS", "Could not play chime tone", e)
        }
    }

    /**
     * Constructs localized voice announcement for Tamil, English, and other Indian languages.
     */
    fun buildAnnouncementText(
        amount: Double,
        appName: String,
        languageCode: String,
        senderName: String? = null
    ): String {
        val formattedAmount = if (amount % 1.0 == 0.0) {
            amount.toInt().toString()
        } else {
            String.format(Locale.US, "%.2f", amount)
        }

        return when (languageCode) {
            "ta" -> { // Tamil
                if (senderName != null) {
                    "$appName-யில் $senderName-டமிருந்து $formattedAmount ரூபாய் பெறப்பட்டது"
                } else {
                    "$appName-யில் $formattedAmount ரூபாய் பெறப்பட்டது"
                }
            }
            "hi" -> { // Hindi
                if (senderName != null) {
                    "$appName पर $senderName से $formattedAmount रुपये प्राप्त हुए"
                } else {
                    "$appName पर $formattedAmount रुपये प्राप्त हुए"
                }
            }
            "te" -> { // Telugu
                "$appName లో $formattedAmount రూపాయలు స్వీకరించబడ్డాయి"
            }
            "kn" -> { // Kannada
                "$appName ನಲ್ಲಿ $formattedAmount ರೂಪಾಯಿಗಳು ಸ್ವೀಕರಿಸಲ್ಪಟ್ಟಿವೆ"
            }
            "ml" -> { // Malayalam
                "$appName-ൽ $formattedAmount രൂപ ലഭിച്ചു"
            }
            "bn" -> { // Bengali
                "$appName-এ $formattedAmount টাকা পাওয়া গেছে"
            }
            "mr" -> { // Marathi
                "$appName वर $formattedAmount रुपये प्राप्त झाले"
            }
            "gu" -> { // Gujarati
                "$appName પર $formattedAmount રૂપિયા મળ્યા"
            }
            "pa" -> { // Punjabi
                "$appName 'ਤੇ $formattedAmount ਰੁਪਏ ਪ੍ਰਾਪਤ ਹੋਏ"
            }
            "or" -> { // Odia
                "$appName ରେ $formattedAmount ଟଙ୍କା ଗ୍ରହଣ କରାଗଲା"
            }
            "as" -> { // Assamese
                "$appName-ত $formattedAmount টকা লাভ হ'ল"
            }
            "ur" -> { // Urdu
                "$appName پر $formattedAmount روپے موصول ہوئے"
            }
            "sa" -> { // Sanskrit
                "$appName मध्ये $formattedAmount रुप्यकाणि प्राप्तानि"
            }
            "kok" -> { // Konkani
                "$appName चेर $formattedAmount रुपया मेळ्ळे"
            }
            "ks" -> { // Kashmiri
                "$appName ਪੈਠ ਮਿਲੇ $formattedAmount ਰੁਪਯੇ"
            }
            "ne" -> { // Nepali
                "$appName मा $formattedAmount रुपैयाँ प्राप्त भयो"
            }
            "sd" -> { // Sindhi
                "$appName تي $formattedAmount رپيا مليا"
            }
            "mni" -> { // Manipuri
                "$appName দা লুপা $formattedAmount ফংলে"
            }
            "mai" -> { // Maithili
                "$appName पर $formattedAmount टाका प्राप्त भेल"
            }
            else -> { // Default English
                if (senderName != null) {
                    "Received $formattedAmount Rupees on $appName from $senderName"
                } else {
                    "Received $formattedAmount Rupees on $appName"
                }
            }
        }
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}
