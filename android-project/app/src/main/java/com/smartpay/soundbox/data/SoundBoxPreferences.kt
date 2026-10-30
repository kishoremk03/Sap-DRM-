package com.smartpay.soundbox.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "soundbox_preferences")

data class SoundBoxSettings(
    val displayLanguage: String = "en",
    val announcementLanguage: String = "ta", // Tamil as requested or English
    val speechRate: Float = 1.0f,
    val speechPitch: Float = 1.0f,
    val soundChimeEnabled: Boolean = true,
    val isDemoModeActive: Boolean = false,
    val isDarkMode: Boolean = true,
    val enabledPackages: Set<String> = defaultEnabledPackages
) {
    companion object {
        val defaultEnabledPackages = setOf(
            "com.phonepe.app",
            "com.phonepe.app.business",
            "com.google.android.apps.nbu.paisa.user",
            "com.google.android.apps.nbu.paisa.merchant",
            "net.one97.paytm",
            "com.paytm.business",
            "in.org.npci.upiapp",
            "com.dreamplug.androidapp",
            "in.amazon.mShop.android.shopping",
            "com.bharatpe.app"
        )
    }
}

class SoundBoxPreferences(private val context: Context) {

    private object PreferencesKeys {
        val DISPLAY_LANGUAGE = stringPreferencesKey("display_language")
        val ANNOUNCEMENT_LANGUAGE = stringPreferencesKey("announcement_language")
        val SPEECH_RATE = floatPreferencesKey("speech_rate")
        val SPEECH_PITCH = floatPreferencesKey("speech_pitch")
        val SOUND_CHIME = booleanPreferencesKey("sound_chime")
        val DEMO_MODE = booleanPreferencesKey("demo_mode")
        val DARK_MODE = booleanPreferencesKey("dark_mode")
        val ENABLED_PACKAGES = stringSetPreferencesKey("enabled_packages")
    }

    val settingsFlow: Flow<SoundBoxSettings> = context.dataStore.data.map { preferences ->
        SoundBoxSettings(
            displayLanguage = preferences[PreferencesKeys.DISPLAY_LANGUAGE] ?: "en",
            announcementLanguage = preferences[PreferencesKeys.ANNOUNCEMENT_LANGUAGE] ?: "ta",
            speechRate = preferences[PreferencesKeys.SPEECH_RATE] ?: 1.0f,
            speechPitch = preferences[PreferencesKeys.SPEECH_PITCH] ?: 1.0f,
            soundChimeEnabled = preferences[PreferencesKeys.SOUND_CHIME] ?: true,
            isDemoModeActive = preferences[PreferencesKeys.DEMO_MODE] ?: false,
            isDarkMode = preferences[PreferencesKeys.DARK_MODE] ?: true,
            enabledPackages = preferences[PreferencesKeys.ENABLED_PACKAGES] ?: SoundBoxSettings.defaultEnabledPackages
        )
    }

    suspend fun setDisplayLanguage(langCode: String) {
        context.dataStore.edit { it[PreferencesKeys.DISPLAY_LANGUAGE] = langCode }
    }

    suspend fun setAnnouncementLanguage(langCode: String) {
        context.dataStore.edit { it[PreferencesKeys.ANNOUNCEMENT_LANGUAGE] = langCode }
    }

    suspend fun setSpeechRate(rate: Float) {
        context.dataStore.edit { it[PreferencesKeys.SPEECH_RATE] = rate }
    }

    suspend fun setSpeechPitch(pitch: Float) {
        context.dataStore.edit { it[PreferencesKeys.SPEECH_PITCH] = pitch }
    }

    suspend fun setSoundChimeEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.SOUND_CHIME] = enabled }
    }

    suspend fun setDemoMode(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.DEMO_MODE] = enabled }
    }

    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.DARK_MODE] = enabled }
    }

    suspend fun togglePackage(packageName: String, enabled: Boolean) {
        context.dataStore.edit { preferences ->
            val current = preferences[PreferencesKeys.ENABLED_PACKAGES]?.toMutableSet()
                ?: SoundBoxSettings.defaultEnabledPackages.toMutableSet()
            if (enabled) {
                current.add(packageName)
            } else {
                current.remove(packageName)
            }
            preferences[PreferencesKeys.ENABLED_PACKAGES] = current
        }
    }
}
