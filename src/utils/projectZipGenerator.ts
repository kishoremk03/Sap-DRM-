import JSZip from 'jszip';

export interface ProjectFileEntry {
  path: string;
  category: 'kotlin' | 'gradle' | 'manifest' | 'xml' | 'workflow' | 'doc';
  content: string;
}

export const ANDROID_PROJECT_FILES: ProjectFileEntry[] = [
  {
    path: 'build.gradle.kts',
    category: 'gradle',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.kapt) apply false
}`,
  },
  {
    path: 'settings.gradle.kts',
    category: 'gradle',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SmartPaySoundBox"
include(":app")`,
  },
  {
    path: 'gradle.properties',
    category: 'gradle',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`,
  },
  {
    path: 'gradle/libs.versions.toml',
    category: 'gradle',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.9.0"
composeBom = "2024.04.01"
room = "2.6.1"
datastore = "1.1.0"
coroutines = "1.8.0"
material3 = "1.2.1"
navigationCompose = "2.7.7"
junit = "4.13.2"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3", version.ref = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
junit = { group = "junit", name = "junit", version.ref = "junit" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-kapt = { id = "org.jetbrains.kotlin.kapt", version.ref = "kotlin" }`,
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    category: 'gradle',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
  },
  {
    path: 'gradlew',
    category: 'gradle',
    content: `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
APP_HOME="\`pwd -P\`"
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
else
    JAVACMD="java"
fi
exec "$JAVACMD" -classpath "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"`,
  },
  {
    path: '.gitignore',
    category: 'doc',
    content: `*.iml
.gradle
/local.properties
/.idea
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    category: 'workflow',
    content: `name: Build SmartPay Sound Box Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build & Package Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Gradle 8.4
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.4'

      - name: Accept Android SDK Licenses
        run: |
          yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true

      - name: Auto-Generate Android XML Resources & Rules
        run: |
          python3 -c "
          import os

          target_dir = '.'
          for root, dirs, files in os.walk('.'):
              if 'settings.gradle.kts' in files or 'settings.gradle' in files:
                  target_dir = root
                  break

          print(f'Located Android project in: {target_dir}')
          os.chdir(target_dir)

          os.makedirs('app/src/main/res/values', exist_ok=True)
          os.makedirs('app/src/main/res/xml', exist_ok=True)
          os.makedirs('app/src/main/res/drawable', exist_ok=True)
          os.makedirs('app/src/main/res/mipmap-anydpi-v26', exist_ok=True)
          os.makedirs('app/src/main/java/com/smartpay/soundbox/ui/theme', exist_ok=True)

          with open('app/src/main/res/values/themes.xml', 'w') as f:
              f.write('<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n<resources>\\n    <style name=\\"Theme.SmartPaySoundBox\\" parent=\\"android:Theme.Material.NoActionBar\\">\\n        <item name=\\"android:statusBarColor\\">#020617</item>\\n        <item name=\\"android:navigationBarColor\\">#020617</item>\\n    </style>\\n</resources>\\n')

          with open('app/src/main/res/xml/backup_rules.xml', 'w') as f:
              f.write('<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n<full-backup-content>\\n    <include domain=\\"sharedpref\\" path=\\".\\" />\\n    <include domain=\\"database\\" path=\\".\\" />\\n</full-backup-content>\\n')

          with open('app/src/main/res/xml/data_extraction_rules.xml', 'w') as f:
              f.write('<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n<data-extraction-rules>\\n    <cloud-backup>\\n        <include domain=\\"sharedpref\\" path=\\".\\" />\\n    </cloud-backup>\\n    <device-transfer>\\n        <include domain=\\"sharedpref\\" path=\\".\\" />\\n    </device-transfer>\\n</data-extraction-rules>\\n')

          with open('app/src/main/res/drawable/ic_launcher_background.xml', 'w') as f:
              f.write('<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n<vector xmlns:android=\\"http://schemas.android.com/apk/res/android\\" android:width=\\"108dp\\" android:height=\\"108dp\\" android:viewportWidth=\\"108\\" android:viewportHeight=\\"108\\">\\n    <path android:fillColor=\\"#0F172A\\" android:pathData=\\"M0,0h108v108h-108z\\"/>\\n</vector>\\n')

          with open('app/src/main/res/drawable/ic_launcher_foreground.xml', 'w') as f:
              f.write('<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n<vector xmlns:android=\\"http://schemas.android.com/apk/res/android\\" android:width=\\"108dp\\" android:height=\\"108dp\\" android:viewportWidth=\\"108\\" android:viewportHeight=\\"108\\">\\n    <path android:fillColor=\\"#10B981\\" android:pathData=\\"M54,20A34,34 0 1,0 88,54A34,34 0 0,0 54,20ZM54,78A24,24 0 1,1 78,54A24,24 0 0,1 54,78Z\\"/>\\n    <path android:fillColor=\\"#06B6D4\\" android:pathData=\\"M48,36h12v36h-12z\\"/>\\n</vector>\\n')

          adaptive_icon = '<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n<adaptive-icon xmlns:android=\\"http://schemas.android.com/apk/res/android\\">\\n    <background android:drawable=\\"@drawable/ic_launcher_background\\" />\\n    <foreground android:drawable=\\"@drawable/ic_launcher_foreground\\" />\\n</adaptive-icon>\\n'

          with open('app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', 'w') as f:
              f.write(adaptive_icon)

          with open('app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', 'w') as f:
              f.write(adaptive_icon)

          with open('app/proguard-rules.pro', 'w') as f:
              f.write('-keepattributes *Annotation*\\n-keepclassmembers class * {\\n    @androidx.room.* *;\\n}\\n-dontwarn java.lang.instrument.**\\n')

          theme_file = 'app/src/main/java/com/smartpay/soundbox/ui/theme/Theme.kt'
          if not os.path.exists(theme_file):
              with open(theme_file, 'w') as f:
                  f.write('package com.smartpay.soundbox.ui.theme\\nimport androidx.compose.material3.MaterialTheme\\nimport androidx.compose.material3.darkColorScheme\\nimport androidx.compose.runtime.Composable\\nimport androidx.compose.ui.graphics.Color\\nprivate val DarkColorScheme = darkColorScheme(primary = Color(0xFF00E599), secondary = Color(0xFF00F2FE), background = Color(0xFF030712), surface = Color(0xFF0F172A))\\n@Composable\\nfun SmartPaySoundBoxTheme(darkTheme: Boolean = true, content: @Composable () -> Unit) {\\n    MaterialTheme(colorScheme = DarkColorScheme, content = content)\\n}\\n')

          if os.path.exists('app/src/main/java'):
              for root, dirs, files in os.walk('app/src/main/java'):
                  for file in files:
                      if file.endswith('.kt'):
                          kt_path = os.path.join(root, file)
                          with open(kt_path, 'r', encoding='utf-8') as kf:
                              content = kf.read()
                          modified = False
                          if 'CircleShape' in content and 'shape.CircleShape' not in content:
                              if 'import androidx.compose.foundation.shape.RoundedCornerShape' in content:
                                  content = content.replace(
                                      'import androidx.compose.foundation.shape.RoundedCornerShape',
                                      'import androidx.compose.foundation.shape.CircleShape\\nimport androidx.compose.foundation.shape.RoundedCornerShape'
                                  )
                              else:
                                  lines = content.split('\\n')
                                  for i, line in enumerate(lines):
                                      if line.startswith('package '):
                                          lines.insert(i + 1, 'import androidx.compose.foundation.shape.CircleShape')
                                          break
                                  content = '\\n'.join(lines)
                              modified = True
                          if modified:
                              with open(kt_path, 'w', encoding='utf-8') as kf:
                                  kf.write(content)
                              print(f'✅ Auto-healed missing imports in {kt_path}')

          print('✅ All Android XML resources verified!')
          "

      - name: Build Android APK
        run: |
          SETTINGS_FILE=$(find . -maxdepth 4 \\( -name "settings.gradle.kts" -o -name "settings.gradle" \\) | head -n 1)
          PROJECT_DIR=$(dirname "$SETTINGS_FILE")
          cd "$PROJECT_DIR"

          if [ -f "gradlew" ]; then
            chmod +x gradlew || true
          fi

          if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
            echo "Generating Gradle 8.4 wrapper..."
            gradle wrapper --gradle-version 8.4 --distribution-type bin
            chmod +x gradlew || true
          fi

          echo "🚀 Starting APK Compilation..."
          ./gradlew assembleDebug --no-daemon || gradle assembleDebug --no-daemon

      - name: Upload APK to Artifacts (Phone Download)
        uses: actions/upload-artifact@v4
        with:
          name: SmartPay-SoundBox-APK
          path: "**/app/build/outputs/apk/debug/*.apk"
          if-no-files-found: error
          retention-days: 30

      - name: Publish Step Summary
        run: |
          echo "### 🚀 SmartPay Sound Box APK Built Successfully!" >> $GITHUB_STEP_SUMMARY
          echo "Your installable Android APK is ready for download:" >> $GITHUB_STEP_SUMMARY
          echo "- **Download Location:** Scroll to **Artifacts** at the bottom of this run and tap **SmartPay-SoundBox-APK**!" >> $GITHUB_STEP_SUMMARY`,
  },
  {
    path: 'app/build.gradle.kts',
    category: 'gradle',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
}

android {
    namespace = "com.smartpay.soundbox"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.smartpay.soundbox"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    kapt(libs.androidx.room.compiler)

    implementation(libs.androidx.datastore.preferences)
    implementation(libs.kotlinx.coroutines.android)

    testImplementation(libs.junit)
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <queries>
        <package android:name="com.phonepe.app" />
        <package android:name="com.phonepe.app.business" />
        <package android:name="com.google.android.apps.nbu.paisa.user" />
        <package android:name="net.one97.paytm" />
        <package android:name="in.org.npci.upiapp" />
        <package android:name="com.dreamplug.androidapp" />
        <package android:name="in.amazon.mShop.android.shopping" />
        <package android:name="com.bharatpe.app" />
    </queries>

    <application
        android:name=".SmartPayApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmartPaySoundBox"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.SmartPaySoundBox">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.SmartPayNotificationListenerService"
            android:label="@string/notification_listener_service_name"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>
    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/data/PaymentTransaction.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Represents a payment transaction detected via Android notification listener.
 * Strictly labelled as "Detected — Not Bank Verified".
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
    val detectionStatus: String = "Detected — Not Bank Verified",
    val isBankVerified: Boolean = false,
    val isSampleDemo: Boolean = false
)`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/data/TransactionDao.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<PaymentTransaction>>

    @Query("SELECT COALESCE(SUM(amount), 0.0) FROM transactions WHERE timestamp >= :startTime")
    fun getTotalAmountSince(startTime: Long): Flow<Double>

    @Query("SELECT COUNT(*) FROM transactions WHERE timestamp >= :startTime")
    fun getTransactionCountSince(startTime: Long): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: PaymentTransaction): Long

    @Delete
    suspend fun deleteTransaction(transaction: PaymentTransaction)

    @Query("DELETE FROM transactions WHERE isSampleDemo = 1")
    suspend fun clearDemoTransactions()

    @Query("DELETE FROM transactions")
    suspend fun clearAll()
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/data/AppDatabase.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [PaymentTransaction::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "smartpay_soundbox.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/data/SoundBoxPreferences.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.data

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "soundbox_preferences")

data class SoundBoxSettings(
    val displayLanguage: String = "en",
    val announcementLanguage: String = "ta", // Tamil default
    val speechRate: Float = 1.0f,
    val speechPitch: Float = 1.0f,
    val soundChimeEnabled: Boolean = true,
    val isDemoModeActive: Boolean = false,
    val isDarkMode: Boolean = true
)

class SoundBoxPreferences(private val context: Context) {
    val settingsFlow: Flow<SoundBoxSettings> = context.dataStore.data.map { preferences ->
        SoundBoxSettings(
            displayLanguage = preferences[stringPreferencesKey("display_language")] ?: "en",
            announcementLanguage = preferences[stringPreferencesKey("announcement_language")] ?: "ta",
            speechRate = preferences[floatPreferencesKey("speech_rate")] ?: 1.0f,
            speechPitch = preferences[floatPreferencesKey("speech_pitch")] ?: 1.0f,
            soundChimeEnabled = preferences[booleanPreferencesKey("sound_chime")] ?: true,
            isDarkMode = preferences[booleanPreferencesKey("dark_mode")] ?: true
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/service/TransactionParser.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.service

import java.util.regex.Pattern

data class ParsedPaymentResult(
    val amount: Double,
    val senderName: String?,
    val upiReference: String?,
    val isCredit: Boolean
)

object TransactionParser {
    private val AMOUNT_PATTERN = Pattern.compile(
        """(?:₹|Rs\\.?|INR)\\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)""",
        Pattern.CASE_INSENSITIVE
    )

    private val CREDIT_KEYWORDS = listOf("received", "credited", "added", "accepted", "பெறப்பட்டது", "प्राप्त")
    private val DEBIT_KEYWORDS = listOf("paid", "sent", "debited", "withdrawn")

    fun parse(title: String?, text: String?): ParsedPaymentResult? {
        val combined = "\${title.orEmpty()} \${text.orEmpty()}".trim()
        if (combined.isEmpty()) return null

        val lower = combined.lowercase()
        if (DEBIT_KEYWORDS.any { lower.contains(it) } && !CREDIT_KEYWORDS.any { lower.contains(it) }) {
            return null // Reject outgoing payments
        }

        val matcher = AMOUNT_PATTERN.matcher(combined)
        if (!matcher.find()) return null

        val amountStr = matcher.group(1)?.replace(",", "") ?: return null
        val amount = amountStr.toDoubleOrNull() ?: return null

        return ParsedPaymentResult(amount = amount, senderName = "Customer", upiReference = null, isCredit = true)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/service/SmartPayTtsManager.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.service

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Bundle
import android.speech.tts.TextToSpeech
import java.util.Locale

class SmartPayTtsManager(private val context: Context) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var isInitialized = false

    init {
        tts = TextToSpeech(context.applicationContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
        }
    }

    fun isLanguageAvailable(locale: Locale): Boolean {
        return (tts?.isLanguageAvailable(locale) ?: -1) >= TextToSpeech.LANG_AVAILABLE
    }

    fun speak(text: String, locale: Locale, speechRate: Float = 1.0f) {
        val engine = tts ?: return
        try {
            val toneGen = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
            toneGen.startTone(ToneGenerator.TONE_PROP_BEEP2, 180)
        } catch (_: Exception) {}

        engine.language = if (isLanguageAvailable(locale)) locale else Locale.ENGLISH
        engine.setSpeechRate(speechRate)
        engine.speak(text, TextToSpeech.QUEUE_ADD, Bundle(), "TTS_\${System.currentTimeMillis()}")
    }
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/service/SmartPayNotificationListenerService.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.service

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.smartpay.soundbox.data.AppDatabase
import com.smartpay.soundbox.data.PaymentTransaction
import kotlinx.coroutines.*

class SmartPayNotificationListenerService : NotificationListenerService() {
    private val scope = CoroutineScope(Dispatchers.IO)
    private lateinit var ttsManager: SmartPayTtsManager

    override fun onCreate() {
        super.onCreate()
        ttsManager = SmartPayTtsManager(this)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val extras = sbn?.notification?.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()

        val result = TransactionParser.parse(title, text) ?: return
        scope.launch {
            val db = AppDatabase.getDatabase(applicationContext)
            db.transactionDao().insertTransaction(
                PaymentTransaction(
                    amount = result.amount,
                    sourcePackage = sbn.packageName ?: "com.phonepe.app",
                    sourceAppName = "UPI Payment",
                    rawNotificationText = "\$title: \$text",
                    detectionStatus = "Detected — Not Bank Verified"
                )
            )
        }
    }
}`,
  },
  {
    path: 'app/proguard-rules.pro',
    category: 'gradle',
    content: `# ProGuard rules for SmartPay Sound Box
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* *;
}
-dontwarn java.lang.instrument.**`,
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.SmartPaySoundBox" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#020617</item>
        <item name="android:navigationBarColor">#020617</item>
    </style>
</resources>`,
  },
  {
    path: 'app/src/main/res/xml/backup_rules.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="sharedpref" path="." />
    <include domain="database" path="." />
</full-backup-content>`,
  },
  {
    path: 'app/src/main/res/xml/data_extraction_rules.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="sharedpref" path="." />
    </cloud-backup>
    <device-transfer>
        <include domain="sharedpref" path="." />
    </device-transfer>
</data-extraction-rules>`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_background.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0F172A"
        android:pathData="M0,0h108v108h-108z"/>
</vector>`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#10B981"
        android:pathData="M54,20A34,34 0 1,0 88,54A34,34 0 0,0 54,20ZM54,78A24,24 0 1,1 78,54A24,24 0 0,1 54,78Z"/>
    <path
        android:fillColor="#06B6D4"
        android:pathData="M48,36h12v36h-12z"/>
</vector>`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    category: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/SmartPayApplication.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox

import android.app.Application
import com.smartpay.soundbox.data.AppDatabase

class SmartPayApplication : Application() {
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/ui/theme/Color.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.ui.theme

import androidx.compose.ui.graphics.Color

val Emerald500 = Color(0xFF10B981)
val Emerald400 = Color(0xFF34D399)
val EmeraldNeon = Color(0xFF00E599)
val Cyan500 = Color(0xFF06B6D4)
val Cyan400 = Color(0xFF22D3EE)
val CyanNeon = Color(0xFF00F2FE)
val Obsidian950 = Color(0xFF030712)
val Obsidian900 = Color(0xFF0F172A)
val Obsidian800 = Color(0xFF1E293B)
val AmberWarning = Color(0xFFF59E0B)`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/ui/theme/Theme.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = EmeraldNeon,
    onPrimary = Obsidian950,
    primaryContainer = Obsidian800,
    onPrimaryContainer = Emerald400,
    secondary = CyanNeon,
    background = Obsidian950,
    surface = Obsidian900
)

@Composable
fun SmartPaySoundBoxTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = DarkColorScheme, content = content)
}`,
  },
  {
    path: 'app/src/main/java/com/smartpay/soundbox/MainActivity.kt',
    category: 'kotlin',
    content: `package com.smartpay.soundbox

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import com.smartpay.soundbox.data.AppDatabase
import com.smartpay.soundbox.data.PaymentTransaction
import com.smartpay.soundbox.data.SoundBoxPreferences
import com.smartpay.soundbox.data.SoundBoxSettings
import com.smartpay.soundbox.service.SmartPayTtsManager
import com.smartpay.soundbox.ui.theme.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Locale
import kotlin.random.Random

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
            val startOfToday = remember {
                val cal = Calendar.getInstance()
                cal.set(Calendar.HOUR_OF_DAY, 0)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.timeInMillis
            }

            val todayTotal by database.transactionDao().getTotalAmountSince(startOfToday).collectAsState(initial = 0.0)
            val todayCount by database.transactionDao().getTransactionCountSince(startOfToday).collectAsState(initial = 0)
            val transactions by database.transactionDao().getAllTransactions().collectAsState(initial = emptyList())

            SmartPaySoundBoxTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = Obsidian950) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        // Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("SmartPay Sound Box", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Native Android Audio Console", fontSize = 12.sp, color = Emerald400)
                            }
                            IconButton(onClick = {
                                startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
                            }) {
                                Icon(Icons.Default.Notifications, contentDescription = "Notification Access", tint = Cyan400)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Today's Total Card
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Obsidian900)
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Text("TODAY'S DETECTED TOTAL", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Emerald400)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(String.format("₹%.2f", todayTotal), fontSize = 36.sp, fontWeight = FontWeight.Black, color = Color.White)
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    SuggestionChip(
                                        onClick = {},
                                        label = { Text("$todayCount transactions", fontSize = 11.sp) }
                                    )
                                    SuggestionChip(
                                        onClick = {},
                                        label = { Text("Detected — Not Bank Verified", fontSize = 10.sp, color = AmberWarning) }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Controls Row
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = {
                                    val text = if (settings.announcementLanguage == "ta") "போன்பே மூலம் ஐந்து நூறு ரூபாய் பெறப்பட்டது" else "Received five hundred rupees on PhonePe"
                                    val loc = if (settings.announcementLanguage == "ta") Locale("ta", "IN") else Locale.ENGLISH
                                    ttsManager.speak(text, loc, settings.speechRate)
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald500)
                            ) {
                                Icon(Icons.Default.VolumeUp, contentDescription = null, modifier = Modifier.size(16.dp), tint = Obsidian950)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Test Sound", color = Obsidian950, fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = {
                                    lifecycleScope.launch {
                                        val amt = listOf(50.0, 100.0, 250.0, 500.0, 1200.0).random()
                                        database.transactionDao().insertTransaction(
                                            PaymentTransaction(
                                                amount = amt,
                                                sourcePackage = "com.phonepe.app",
                                                sourceAppName = "PhonePe",
                                                senderName = "Customer",
                                                rawNotificationText = "Sample Demo: Received ₹$amt on PhonePe",
                                                detectionStatus = "Detected — Not Bank Verified",
                                                isSampleDemo = true
                                            )
                                        )
                                        val loc = if (settings.announcementLanguage == "ta") Locale("ta", "IN") else Locale.ENGLISH
                                        val speakText = if (settings.announcementLanguage == "ta") "போன்பே மூலம் ரூபாய் $amt பெறப்பட்டது" else "Received rupees $amt on PhonePe"
                                        ttsManager.speak(speakText, loc, settings.speechRate)
                                    }
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Cyan500)
                            ) {
                                Icon(Icons.Default.AddCircle, contentDescription = null, modifier = Modifier.size(16.dp), tint = Obsidian950)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Demo Txn", color = Obsidian950, fontWeight = FontWeight.Bold)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Transactions List
                        Text("Detected Transactions", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.height(8.dp))

                        LazyColumn(
                            modifier = Modifier.fillMaxWidth().weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(transactions) { txn ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = Obsidian900)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(txn.sourceAppName, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                            Text("Detected — Not Bank Verified", fontSize = 10.sp, color = AmberWarning)
                                        }
                                        Text(String.format("₹%.2f", txn.amount), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Emerald400)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    category: 'xml',
    content: `<resources>
    <string name="app_name">SmartPay Sound Box</string>
    <string name="notification_listener_service_name">SmartPay Payment Listener</string>
    <string name="status_detected_not_bank_verified">Detected — Not Bank Verified</string>
</resources>`,
  },
  {
    path: 'app/src/main/res/values-ta/strings.xml',
    category: 'xml',
    content: `<resources>
    <string name="app_name">SmartPay சவுண்ட் பாக்ஸ்</string>
    <string name="status_detected_not_bank_verified">கண்டறியப்பட்டது — வங்கி சரிபார்க்கப்படவில்லை</string>
</resources>`,
  },
  {
    path: 'app/src/main/res/values-hi/strings.xml',
    category: 'xml',
    content: `<resources>
    <string name="app_name">SmartPay साउंड बॉक्स</string>
    <string name="status_detected_not_bank_verified">पहचाना गया — बैंक द्वारा सत्यापित नहीं</string>
</resources>`,
  },
  {
    path: 'README.md',
    category: 'doc',
    content: `# SmartPay Sound Box Android Project
Instructions to build APK directly from your Android phone without a computer using GitHub Actions or Termux.`,
  },
];

export async function generateAndDownloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add all files
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Generate blob and download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'SmartPay-SoundBox-Android-Native.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
