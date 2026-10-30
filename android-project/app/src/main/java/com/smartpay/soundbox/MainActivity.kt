package com.smartpay.soundbox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.lifecycleScope
import com.smartpay.soundbox.data.AppDatabase
import com.smartpay.soundbox.data.PaymentTransaction
import com.smartpay.soundbox.data.SoundBoxPreferences
import com.smartpay.soundbox.data.SoundBoxSettings
import com.smartpay.soundbox.service.SmartPayTtsManager
import com.smartpay.soundbox.ui.DashboardScreen
import com.smartpay.soundbox.ui.SettingsScreen
import com.smartpay.soundbox.ui.TransactionHistoryScreen
import com.smartpay.soundbox.ui.theme.SmartPaySoundBoxTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Locale
import kotlin.random.Random

sealed class Screen(val route: String, val titleRes: Int, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", R.string.nav_home, Icons.Default.Dashboard)
    object History : Screen("history", R.string.nav_history, Icons.Default.ReceiptLong)
    object Settings : Screen("settings", R.string.nav_settings, Icons.Default.Settings)
}

class MainActivity : ComponentActivity() {

    private lateinit var ttsManager: SmartPayTtsManager
    private lateinit var preferences: SoundBoxPreferences
    private lateinit var database: AppDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        ttsManager = SmartPayTtsManager(this)
        preferences = SoundBoxPreferences(this)
        database = AppDatabase.getDatabase(this)

        setContent {
            val settings by preferences.settingsFlow.collectAsState(initial = SoundBoxSettings())
            var currentScreen by remember { mutableStateOf<Screen>(Screen.Dashboard) }

            // Today's boundaries
            val startOfToday = remember {
                val cal = Calendar.getInstance()
                cal.set(Calendar.HOUR_OF_DAY, 0)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                cal.timeInMillis
            }

            // Month's boundaries
            val startOfMonth = remember {
                val cal = Calendar.getInstance()
                cal.set(Calendar.DAY_OF_MONTH, 1)
                cal.set(Calendar.HOUR_OF_DAY, 0)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                cal.timeInMillis
            }

            val todayTotal by database.transactionDao().getTotalAmountSince(startOfToday).collectAsState(initial = 0.0)
            val todayCount by database.transactionDao().getTransactionCountSince(startOfToday).collectAsState(initial = 0)
            val monthlyTotal by database.transactionDao().getTotalAmountSince(startOfMonth).collectAsState(initial = 0.0)
            val monthlyCount by database.transactionDao().getTransactionCountSince(startOfMonth).collectAsState(initial = 0)
            val recentTransactions by database.transactionDao().getRecentTransactions(20).collectAsState(initial = emptyList())
            val allTransactions by database.transactionDao().getAllTransactions().collectAsState(initial = emptyList())

            var historySearchQuery by remember { mutableStateOf("") }
            var historyFilterApp by remember { mutableStateOf("All") }

            SmartPaySoundBoxTheme(darkTheme = settings.isDarkMode) {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar {
                            val items = listOf(Screen.Dashboard, Screen.History, Screen.Settings)
                            items.forEach { screen ->
                                NavigationBarItem(
                                    icon = { Icon(screen.icon, contentDescription = null) },
                                    label = { Text(stringResource(screen.titleRes)) },
                                    selected = currentScreen == screen,
                                    onClick = { currentScreen = screen }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        when (currentScreen) {
                            Screen.Dashboard -> {
                                DashboardScreen(
                                    todayTotal = todayTotal,
                                    todayCount = todayCount,
                                    monthlyTotal = monthlyTotal,
                                    monthlyCount = monthlyCount,
                                    recentTransactions = recentTransactions,
                                    settings = settings,
                                    onTestSound = {
                                        playTestAnnouncement(settings)
                                    },
                                    onAddSampleTransaction = {
                                        addSampleTransaction(settings)
                                    },
                                    onNavigateToHistory = {
                                        currentScreen = Screen.History
                                    },
                                    onNavigateToSettings = {
                                        currentScreen = Screen.Settings
                                    }
                                )
                            }
                            Screen.History -> {
                                TransactionHistoryScreen(
                                    transactions = allTransactions,
                                    searchQuery = historySearchQuery,
                                    onSearchQueryChange = { historySearchQuery = it },
                                    selectedFilterApp = historyFilterApp,
                                    onFilterAppChange = { historyFilterApp = it },
                                    onClearAll = {
                                        lifecycleScope.launch {
                                            database.transactionDao().clearAll()
                                        }
                                    },
                                    onClearDemo = {
                                        lifecycleScope.launch {
                                            database.transactionDao().clearDemoTransactions()
                                        }
                                    }
                                )
                            }
                            Screen.Settings -> {
                                SettingsScreen(
                                    settings = settings,
                                    onUpdateDisplayLanguage = { lang ->
                                        lifecycleScope.launch { preferences.setDisplayLanguage(lang) }
                                    },
                                    onUpdateAnnouncementLanguage = { lang ->
                                        lifecycleScope.launch { preferences.setAnnouncementLanguage(lang) }
                                    },
                                    onUpdateSpeechRate = { rate ->
                                        lifecycleScope.launch { preferences.setSpeechRate(rate) }
                                    },
                                    onUpdateSpeechPitch = { pitch ->
                                        lifecycleScope.launch { preferences.setSpeechPitch(pitch) }
                                    },
                                    onToggleChime = { enabled ->
                                        lifecycleScope.launch { preferences.setSoundChimeEnabled(enabled) }
                                    },
                                    onToggleDarkMode = { isDark ->
                                        lifecycleScope.launch { preferences.setDarkMode(isDark) }
                                    },
                                    onTogglePackage = { pkg, enabled ->
                                        lifecycleScope.launch { preferences.togglePackage(pkg, enabled) }
                                    },
                                    onTestVoice = { langCode ->
                                        val testText = ttsManager.buildAnnouncementText(
                                            amount = 100.0,
                                            appName = "PhonePe",
                                            languageCode = langCode
                                        )
                                        val loc = getLocaleForCode(langCode)
                                        ttsManager.speak(
                                            text = testText,
                                            locale = loc,
                                            speechRate = settings.speechRate,
                                            speechPitch = settings.speechPitch,
                                            playChimeFirst = settings.soundChimeEnabled
                                        )
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private fun playTestAnnouncement(settings: SoundBoxSettings) {
        val testText = ttsManager.buildAnnouncementText(
            amount = 500.0,
            appName = "PhonePe",
            languageCode = settings.announcementLanguage
        )
        val loc = getLocaleForCode(settings.announcementLanguage)
        ttsManager.speak(
            text = testText,
            locale = loc,
            speechRate = settings.speechRate,
            speechPitch = settings.speechPitch,
            playChimeFirst = settings.soundChimeEnabled
        )
    }

    private fun addSampleTransaction(settings: SoundBoxSettings) {
        lifecycleScope.launch {
            val sampleApps = listOf(
                Pair("PhonePe", "com.phonepe.app"),
                Pair("Google Pay", "com.google.android.apps.nbu.paisa.user"),
                Pair("Paytm", "net.one97.paytm"),
                Pair("BHIM UPI", "in.org.npci.upiapp")
            )
            val sampleNames = listOf("Karthik Raja", "Priya Sundaram", "Ramesh Kumar", "Anitha Devi", "Vignesh R")
            val chosenApp = sampleApps.random()
            val chosenName = sampleNames.random()
            val amounts = listOf(50.0, 100.0, 250.0, 500.0, 750.0, 1200.0, 2000.0)
            val randomAmount = amounts.random()

            val sampleTxn = PaymentTransaction(
                amount = randomAmount,
                sourcePackage = chosenApp.second,
                sourceAppName = chosenApp.first,
                senderName = chosenName,
                upiReference = "UPI" + Random.nextLong(100000000000L, 999999999999L),
                rawNotificationText = "Sample Demo: Received ₹$randomAmount from $chosenName on ${chosenApp.first}",
                timestamp = System.currentTimeMillis(),
                detectionStatus = "Detected — Not Bank Verified",
                isBankVerified = false,
                isSampleDemo = true
            )

            database.transactionDao().insertTransaction(sampleTxn)

            // Speak announcement
            val speechText = ttsManager.buildAnnouncementText(
                amount = randomAmount,
                appName = chosenApp.first,
                languageCode = settings.announcementLanguage,
                senderName = chosenName
            )
            ttsManager.speak(
                text = speechText,
                locale = getLocaleForCode(settings.announcementLanguage),
                speechRate = settings.speechRate,
                speechPitch = settings.speechPitch,
                playChimeFirst = settings.soundChimeEnabled
            )
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

    override fun onDestroy() {
        super.onDestroy()
        ttsManager.shutdown()
    }
}
