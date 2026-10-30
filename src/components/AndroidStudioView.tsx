import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Terminal,
  CloudLightning,
  Smartphone,
  Copy,
  Check,
  FolderTree,
  ExternalLink,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, generateAndDownloadProjectZip } from '../utils/projectZipGenerator';

interface AndroidStudioViewProps {
  isDark: boolean;
}

export const AndroidStudioView: React.FC<AndroidStudioViewProps> = ({ isDark }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'github' | 'termux' | 'aide'>('github');
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(null), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await generateAndDownloadProjectZip();
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Zero-Computer Android Development */}
      <div
        className={`p-6 rounded-3xl border ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30'
            : 'bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Native Android Studio Codebase
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              SmartPay Sound Box Native Project
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Complete native Kotlin, Jetpack Compose, Material 3, Room DB, and NotificationListenerService architecture.
              Build and install the APK directly on your Android phone without a computer!
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Bundling ZIP…' : 'Download Complete Project (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* No-Computer APK Build Workflow Guide */}
      <div
        className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Phone-Compatible APK Build Workflows</h3>
          </div>
          <p className="text-xs text-slate-400">
            Choose your preferred method to build and install the native APK right from your Android smartphone:
          </p>

          {/* Workflow selection tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveWorkflowTab('github')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeWorkflowTab === 'github'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <CloudLightning className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. GitHub Actions Cloud (Recommended · 2 Mins)</span>
            </button>
            <button
              onClick={() => setActiveWorkflowTab('termux')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeWorkflowTab === 'termux'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Termux on Android Phone</span>
            </button>
            <button
              onClick={() => setActiveWorkflowTab('aide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeWorkflowTab === 'aide'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>3. AndroidIDE / AIDE Mobile App</span>
            </button>
          </div>
        </div>

        {/* Tab 1: GitHub Actions Cloud Build */}
        {activeWorkflowTab === 'github' && (
          <div className="p-5 space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
              <CloudLightning className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300">Automatic Free Cloud APK Compiler: </span>
                <span>
                  The workflow file <code className="text-cyan-300 bg-slate-950/80 px-1.5 py-0.5 rounded font-mono">.github/workflows/build-apk.yml</code> is already bundled in this repository. Whenever you upload or push this code to GitHub, GitHub&apos;s cloud runners automatically compile the native Kotlin code into an installable <code className="text-emerald-400 font-bold font-mono">app-debug.apk</code>!
                </span>
              </div>
            </div>

            {/* Method A: Direct Web Upload on Mobile Browser (No Computer & No Git Needed) */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Option A: 100% Mobile Browser / No Git Required
                </span>
                <span className="text-[10px] text-slate-400">Easiest on Android Phone</span>
              </div>

              <ol className="space-y-2.5 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  Tap <strong className="text-white">Download Complete Project (.ZIP)</strong> above to save <code className="text-emerald-300">SmartPay-SoundBox-Android-Native.zip</code> to your phone.
                </li>
                <li>
                  Open your phone&apos;s &quot;Files&quot; or &quot;Downloads&quot; app and tap <strong className="text-white">Extract / Unzip</strong>.
                </li>
                <li>
                  Open <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a> in your mobile browser (request Desktop Site if needed).
                </li>
                <li>
                  Name your repository <code className="text-emerald-300 font-mono">smartpay-soundbox</code> and click <strong className="text-white">Create repository</strong>.
                </li>
                <li>
                  Click <strong className="text-white">&quot;uploading an existing file&quot;</strong>, drag/select the extracted project files, and click <strong className="text-white">Commit changes</strong>.
                </li>
                <li>
                  Tap the <strong className="text-white">Actions</strong> tab &rarr; Tap <strong className="text-white">&quot;Build &amp; Package Android APK&quot;</strong>.
                </li>
                <li>
                  In ~2 minutes, the green checkmark appears. Tap the run, scroll down to <strong className="text-emerald-300">Artifacts</strong>, and tap <strong className="text-white">SmartPay-SoundBox-APK</strong> to download <code className="text-emerald-300">app-debug.apk</code> directly onto your phone!
                </li>
              </ol>
            </div>

            {/* Method B: Using Git / Terminal / Termux */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Option B: Push via Git Terminal / Termux
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      'git init\ngit add .\ngit commit -m "Initial commit of SmartPay Sound Box"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_GITHUB_USERNAME/smartpay-soundbox.git\ngit push -u origin main',
                      'git-cmds'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  {copiedCommand === 'git-cmds' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCommand === 'git-cmds' ? 'Copied Commands!' : 'Copy Git Commands'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                <div>git init</div>
                <div>git add .</div>
                <div>git commit -m &quot;Initial commit of SmartPay Sound Box&quot;</div>
                <div>git branch -M main</div>
                <div>git remote add origin https://github.com/YOUR_USERNAME/smartpay-soundbox.git</div>
                <div>git push -u origin main</div>
              </div>
              <p className="text-[11px] text-slate-400">
                As soon as you run <code className="text-slate-300">git push</code>, GitHub Actions automatically starts compiling your APK.
              </p>
            </div>

            {/* Troubleshooting Note for 'Run gradle init' error */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <span>⚠️ Troubleshooting: &quot;Run gradle init to create a new Gradle build in this directory&quot;</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                If GitHub Actions showed this error, it means your repository files were uploaded inside a subfolder (like <code className="text-amber-200">SmartPay-SoundBox-Android-Native/</code>) or <code className="text-amber-200">settings.gradle.kts</code> wasn&apos;t at the root.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-slate-300 text-[11px] space-y-1.5">
                <p className="font-semibold text-emerald-400">✅ 2 Easy Solutions:</p>
                <p><strong>Option 1 (Instant):</strong> In GitHub on your phone, navigate to <code className="text-cyan-300">.github/workflows/build-apk.yml</code>, tap the pencil (edit) icon, and paste the updated workflow (which auto-detects subfolders and uses Gradle 8.4!).</p>
                <p><strong>Option 2:</strong> When uploading to GitHub, open the unzipped folder first and upload the contents inside it (<code className="text-cyan-300">settings.gradle.kts</code>, <code className="text-cyan-300">build.gradle.kts</code>, <code className="text-cyan-300">app/</code>) so they reside at the repository root.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Termux Local Compilation */}
        {activeWorkflowTab === 'termux' && (
          <div className="p-5 space-y-4 text-xs sm:text-sm">
            <p className="text-slate-400">
              You can run Gradle compilation directly inside your Android phone hardware using Termux (free on F-Droid):
            </p>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Step 1: Install OpenJDK 17 in Termux</span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 font-mono text-emerald-400 text-xs overflow-x-auto">
                <code>pkg update -y &amp;&amp; pkg install -y openjdk-17 git</code>
                <button
                  onClick={() => handleCopy('pkg update -y && pkg install -y openjdk-17 git', 'cmd1')}
                  className="ml-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedCommand === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Step 2: Navigate to unzipped folder &amp; build APK</span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 font-mono text-emerald-400 text-xs overflow-x-auto">
                <code>cd ~/storage/downloads/SmartPay-SoundBox-Android &amp;&amp; ./gradlew assembleDebug</code>
                <button
                  onClick={() => handleCopy('cd ~/storage/downloads/SmartPay-SoundBox-Android && ./gradlew assembleDebug', 'cmd2')}
                  className="ml-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedCommand === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Your compiled APK will be at: <code className="text-cyan-300">app/build/outputs/apk/debug/app-debug.apk</code>.
            </p>
          </div>
        )}

        {/* Tab 3: AndroidIDE Mobile App */}
        {activeWorkflowTab === 'aide' && (
          <div className="p-5 space-y-3 text-xs sm:text-sm text-slate-300">
            <p className="text-slate-400">
              <strong className="text-white">AndroidIDE</strong> is a native Android app that runs full Gradle builds and AAPT2 right on Android devices.
            </p>
            <ol className="space-y-2 list-decimal list-inside leading-relaxed">
              <li>Install <strong className="text-white">AndroidIDE</strong> from F-Droid or GitHub releases on your phone.</li>
              <li>Extract <code className="text-emerald-300">SmartPay-SoundBox-Android-Native.zip</code> to your phone storage.</li>
              <li>Open AndroidIDE &rarr; Tap <strong className="text-white">Open Project</strong> &rarr; Select the project folder.</li>
              <li>Tap the <strong className="text-white">Hammer / Build</strong> icon in the top bar.</li>
              <li>AndroidIDE compiles the code and immediately opens the system installer to install your APK!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Interactive Project Source Code Explorer */}
      <div
        className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Android Source Code Explorer</h3>
              <p className="text-xs text-slate-400">Inspect all Kotlin, Gradle, Manifest &amp; Room database files</p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(selectedFile.content)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy File'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* File Tree Column */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto max-h-[300px] md:max-h-[500px] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Project Files ({ANDROID_PROJECT_FILES.length})
            </div>
            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between truncate cursor-pointer ${
                  selectedFileIndex === idx
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{file.path}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer Column */}
          <div className="md:col-span-8 flex flex-col bg-slate-950 text-slate-200 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{selectedFile.path}</span>
              <span className="capitalize">{selectedFile.category}</span>
            </div>
            <pre className="p-4 overflow-x-auto overflow-y-auto flex-1 max-h-[450px] leading-relaxed select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
