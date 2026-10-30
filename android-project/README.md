# SmartPay Sound Box — Native Android Application

A complete native Android application built with **Kotlin**, **Jetpack Compose**, **Material 3**, **Room Database**, **DataStore Preferences**, **Android TextToSpeech**, and **NotificationListenerService**.

Designed specifically for Indian merchants, shopkeepers, and street vendors to receive real-time voice announcements when UPI payments arrive from PhonePe, Google Pay, Paytm, BHIM, Cred, and Amazon Pay.

---

## 🛡️ Critical Payment Safety Notice
> **"Detected — Not Bank Verified"**
> An Android push notification does not legally confirm that funds have settled into your merchant bank account. All records are strictly labelled as detected until verified through official core-banking settlement channels.

---

## 📱 How to Build the APK Entirely From Your Android Phone (Zero Computer Required)

Since you are developing entirely on your Android phone without a computer, you have **three phone-compatible methods** to compile this project into an `.apk` file:

### Method 1: GitHub Actions Cloud Build (Easiest & Recommended — 2 Minutes)
1. In the SmartPay web app, tap **"Download Android Project (.ZIP)"**.
2. Open your mobile browser (Chrome/Brave) and visit [github.com/new](https://github.com/new).
3. Create a free repository named `smartpay-soundbox`.
4. Upload the files or zip, or push using Git.
5. Notice that `.github/workflows/build-apk.yml` is already included in this repository!
6. In your GitHub repository on your phone, tap the **"Actions"** tab.
7. Tap the **"Build SmartPay Sound Box Android APK"** workflow, then tap **"Run workflow"**.
8. In ~2 minutes, the runner completes. Tap on the run, scroll to **Artifacts**, and tap **`SmartPay-SoundBox-Debug-APK`** to download `app-debug.apk` directly to your phone's Downloads folder!
9. Tap the downloaded APK to install it on your Android phone.

---

### Method 2: Termux Terminal (Build Directly Inside Your Android Phone)
If you prefer running the Gradle build directly on your phone hardware:
1. Install **Termux** from F-Droid (avoid the deprecated Play Store build).
2. Open Termux on your phone and run:
   ```bash
   pkg update -y
   pkg install -y openjdk-17 git
   ```
3. Grant storage permissions:
   ```bash
   termux-setup-storage
   ```
4. Copy the unzipped project folder into Termux and navigate into it:
   ```bash
   cd ~/storage/downloads/SmartPay-SoundBox-Android
   chmod +x gradlew
   ./gradlew assembleDebug
   ```
5. Your newly compiled APK will be at:
   `app/build/outputs/apk/debug/app-debug.apk`
6. Tap to install directly!

---

### Method 3: AndroidIDE / AIDE Mobile App
1. Install **AndroidIDE** (open-source native Android IDE) from F-Droid or GitHub.
2. Open AndroidIDE and select **Open Project**.
3. Select the `SmartPay-SoundBox-Android` directory.
4. Tap the **Build (Hammer)** icon. The APK will be built and AndroidIDE will prompt you to install it immediately.

---

## 🌐 20 Indian Languages Supported
1. English (`en`)
2. தமிழ் — Tamil (`ta`)
3. हिन्दी — Hindi (`hi`)
4. తెలుగు — Telugu (`te`)
5. ಕನ್ನಡ — Kannada (`kn`)
6. മലയാളം — Malayalam (`ml`)
7. বাংলা — Bengali (`bn`)
8. मराठी — Marathi (`mr`)
9. ગુજરાતી — Gujarati (`gu`)
10. ਪੰਜਾਬੀ — Punjabi (`pa`)
11. ଓଡ଼ିଆ — Odia (`or`)
12. অসমীয়া — Assamese (`as`)
13. اردو — Urdu (`ur`)
14. संस्कृतम् — Sanskrit (`sa`)
15. कोंकणी — Konkani (`kok`)
16. کٲشُر — Kashmiri (`ks`)
17. नेपाली — Nepali (`ne`)
18. سنڌي — Sindhi (`sd`)
19. মৈতৈলোন্ — Manipuri (`mni`)
20. मैथिली — Maithili (`mai`)
