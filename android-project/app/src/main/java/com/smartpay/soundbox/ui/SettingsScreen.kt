package com.smartpay.soundbox.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartpay.soundbox.R
import com.smartpay.soundbox.data.SoundBoxSettings

data class LanguageOption(
    val code: String,
    val nativeName: String,
    val englishName: String
)

val INDIAN_LANGUAGES = listOf(
    LanguageOption("en", "English", "English"),
    LanguageOption("ta", "தமிழ்", "Tamil"),
    LanguageOption("hi", "हिन्दी", "Hindi"),
    LanguageOption("te", "తెలుగు", "Telugu"),
    LanguageOption("kn", "ಕನ್ನಡ", "Kannada"),
    LanguageOption("ml", "മലയാളം", "Malayalam"),
    LanguageOption("bn", "বাংলা", "Bengali"),
    LanguageOption("mr", "मराठी", "Marathi"),
    LanguageOption("gu", "ગુજરાતી", "Gujarati"),
    LanguageOption("pa", "ਪੰਜਾਬੀ", "Punjabi"),
    LanguageOption("or", "ଓଡ଼ିଆ", "Odia"),
    LanguageOption("as", "অসমীয়া", "Assamese"),
    LanguageOption("ur", "اردو", "Urdu"),
    LanguageOption("sa", "संस्कृतम्", "Sanskrit"),
    LanguageOption("kok", "कोंकणी", "Konkani"),
    LanguageOption("ks", "کٲشُر", "Kashmiri"),
    LanguageOption("ne", "नेपाली", "Nepali"),
    LanguageOption("sd", "سنڌي", "Sindhi"),
    LanguageOption("mni", "মৈতৈলোন্", "Manipuri"),
    LanguageOption("mai", "मैथिली", "Maithili")
)

@Composable
fun SettingsScreen(
    settings: SoundBoxSettings,
    onUpdateDisplayLanguage: (String) -> Unit,
    onUpdateAnnouncementLanguage: (String) -> Unit,
    onUpdateSpeechRate: (Float) -> Unit,
    onUpdateSpeechPitch: (Float) -> Unit,
    onToggleChime: (Boolean) -> Unit,
    onToggleDarkMode: (Boolean) -> Unit,
    onTogglePackage: (String, Boolean) -> Unit,
    onTestVoice: (String) -> Unit
) {
    var showDisplayLangDialog by remember { mutableStateOf(false) }
    var showAnnouncementLangDialog by remember { mutableStateOf(false) }

    val displayLang = INDIAN_LANGUAGES.find { it.code == settings.displayLanguage } ?: INDIAN_LANGUAGES[0]
    val announceLang = INDIAN_LANGUAGES.find { it.code == settings.announcementLanguage } ?: INDIAN_LANGUAGES[1] // Default Tamil

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {

        // Section: Language Settings
        Text(
            text = stringResource(R.string.settings_section_languages),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Display Language Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showDisplayLangDialog = true },
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = stringResource(R.string.display_language_title),
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "${displayLang.nativeName} (${displayLang.englishName})",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null)
                }

                HorizontalDivider()

                // Announcement Language Row (Independent!)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showAnnouncementLangDialog = true },
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = stringResource(R.string.announcement_voice_language_title),
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "${announceLang.nativeName} (${announceLang.englishName})",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    IconButton(onClick = { onTestVoice(settings.announcementLanguage) }) {
                        Icon(Icons.Default.VolumeUp, contentDescription = "Test voice")
                    }
                }
            }
        }

        // Section: Voice & Speech Engine Settings
        Text(
            text = stringResource(R.string.settings_section_speech),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Speech Rate Slider
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = stringResource(R.string.speech_rate_label), fontWeight = FontWeight.Medium)
                        Text(text = "${String.format("%.2f", settings.speechRate)}x", color = MaterialTheme.colorScheme.primary)
                    }
                    Slider(
                        value = settings.speechRate,
                        onValueChange = onUpdateSpeechRate,
                        valueRange = 0.5f..2.0f,
                        steps = 5
                    )
                }

                HorizontalDivider()

                // Soundbox Chime Switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = stringResource(R.string.chime_sound_label), fontWeight = FontWeight.Medium)
                        Text(
                            text = stringResource(R.string.chime_sound_desc),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = settings.soundChimeEnabled,
                        onCheckedChange = onToggleChime
                    )
                }
            }
        }

        // Section: Theme & Appearance
        Text(
            text = stringResource(R.string.settings_section_appearance),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = stringResource(R.string.theme_dark_mode_title), fontWeight = FontWeight.Medium)
                    Text(
                        text = stringResource(R.string.theme_dark_mode_desc),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Switch(
                    checked = settings.isDarkMode,
                    onCheckedChange = onToggleDarkMode
                )
            }
        }

        // Section: Monitored UPI Applications
        Text(
            text = stringResource(R.string.supported_upi_apps_title),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                val appPackages = listOf(
                    Pair("PhonePe & PhonePe Business", "com.phonepe.app"),
                    Pair("Google Pay (GPay)", "com.google.android.apps.nbu.paisa.user"),
                    Pair("Paytm & Paytm for Business", "net.one97.paytm"),
                    Pair("BHIM NPCI UPI", "in.org.npci.upiapp"),
                    Pair("CRED App", "com.dreamplug.androidapp"),
                    Pair("Amazon Pay", "in.amazon.mShop.android.shopping"),
                    Pair("BharatPe", "com.bharatpe.app")
                )

                appPackages.forEach { (name, pkg) ->
                    val isChecked = settings.enabledPackages.contains(pkg)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onTogglePackage(pkg, !isChecked) },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = name, style = MaterialTheme.typography.bodyMedium)
                        Checkbox(
                            checked = isChecked,
                            onCheckedChange = { onTogglePackage(pkg, it) }
                        )
                    }
                }
            }
        }
    }

    // Language Selection Dialog
    if (showDisplayLangDialog) {
        LanguageSelectionDialog(
            title = stringResource(R.string.select_display_language),
            currentCode = settings.displayLanguage,
            onSelect = {
                onUpdateDisplayLanguage(it)
                showDisplayLangDialog = false
            },
            onDismiss = { showDisplayLangDialog = false }
        )
    }

    if (showAnnouncementLangDialog) {
        LanguageSelectionDialog(
            title = stringResource(R.string.select_announcement_language),
            currentCode = settings.announcementLanguage,
            onSelect = {
                onUpdateAnnouncementLanguage(it)
                showAnnouncementLangDialog = false
                onTestVoice(it)
            },
            onDismiss = { showAnnouncementLangDialog = false }
        )
    }
}

@Composable
fun LanguageSelectionDialog(
    title: String,
    currentCode: String,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 400.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                INDIAN_LANGUAGES.forEach { lang ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(lang.code) }
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = lang.nativeName, fontWeight = FontWeight.Bold)
                            Text(text = lang.englishName, style = MaterialTheme.typography.bodySmall)
                        }
                        if (currentCode == lang.code) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.btn_close))
            }
        }
    )
}
