import { SupportedLanguageCode, SuccessToneStyle } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';

class SoundBoxAudioEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (typeof window === 'undefined') return null;
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('AudioContext not available or blocked by autoplay policy', e);
      return null;
    }
  }

  /**
   * Plays custom success sound effects:
   * - classic: Iconic dual-tone merchant chirp
   * - upbeat_synth: Modern 3-note cheerful major arpeggio
   * - coin_drop: Crisp metallic golden coin register pings
   * - celebration: Upbeat celebratory fanfare
   * - isHighAmount: Triumphant high-value celebratory flourish
   */
  public playTone(style: SuccessToneStyle = 'classic', isHighAmount: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) {
          resolve();
          return;
        }
        const now = ctx.currentTime;

        if (isHighAmount) {
          // Grand Triumphant Flourish for high-value transactions
          const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 to G6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteStart = now + idx * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);
            gain.gain.setValueAtTime(0.28, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(noteStart);
            osc.stop(noteStart + 0.35);
          });
          setTimeout(() => resolve(), 650);
          return;
        }

        switch (style) {
          case 'upbeat_synth': {
            // Cheerful 3-note ascending synth arpeggio (C5 -> E5 -> G5)
            const freqs = [523.25, 659.25, 783.99];
            freqs.forEach((freq, idx) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              const noteStart = now + idx * 0.09;
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, noteStart);
              gain.gain.setValueAtTime(0.3, noteStart);
              gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(noteStart);
              osc.stop(noteStart + 0.28);
            });
            setTimeout(() => resolve(), 450);
            break;
          }

          case 'coin_drop': {
            // Dual metallic coin register pings
            [1568, 2093].forEach((freq, idx) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              const noteStart = now + idx * 0.12;
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, noteStart);
              osc.frequency.exponentialRampToValueAtTime(freq * 1.5, noteStart + 0.05);
              gain.gain.setValueAtTime(0.35, noteStart);
              gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(noteStart);
              osc.stop(noteStart + 0.25);
            });
            setTimeout(() => resolve(), 400);
            break;
          }

          case 'celebration': {
            // 4-note lively fanfare (E5 -> G#5 -> B5 -> E6)
            const fanfare = [659.25, 830.61, 987.77, 1318.51];
            fanfare.forEach((freq, idx) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              const noteStart = now + idx * 0.08;
              osc.type = idx === 3 ? 'triangle' : 'sine';
              osc.frequency.setValueAtTime(freq, noteStart);
              gain.gain.setValueAtTime(0.32, noteStart);
              gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(noteStart);
              osc.stop(noteStart + 0.3);
            });
            setTimeout(() => resolve(), 520);
            break;
          }

          case 'classic':
          default: {
            // Standard dual-frequency chirp (880Hz -> 1760Hz)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(880, now);
            osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1320, now);
            osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.14);

            gainNode.gain.setValueAtTime(0.35, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.35);
            osc2.stop(now + 0.35);

            setTimeout(() => resolve(), 380);
            break;
          }
        }
      } catch (e) {
        console.warn('Audio tone playback fallback', e);
        resolve();
      }
    });
  }

  /**
   * Backward-compatible playChime alias
   */
  public playChime(style: SuccessToneStyle = 'classic', isHighAmount: boolean = false): Promise<void> {
    return this.playTone(style, isHighAmount);
  }

  /**
   * Checks if the device/browser supports voices for the given language code
   */
  public checkVoiceAvailability(langCode: SupportedLanguageCode): { available: boolean; voiceName?: string } {
    if (!('speechSynthesis' in window)) {
      return { available: false };
    }

    const voices = window.speechSynthesis.getVoices();
    const langConfig = INDIAN_LANGUAGES.find((l) => l.code === langCode);
    if (!langConfig) return { available: false };

    const targetPrefix = langConfig.code;
    const targetLocale = langConfig.speechLocale.toLowerCase();

    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === targetLocale ||
        v.lang.toLowerCase().startsWith(targetPrefix) ||
        v.name.toLowerCase().includes(langConfig.englishName.toLowerCase())
    );

    if (matchingVoice) {
      return { available: true, voiceName: matchingVoice.name };
    }

    // Default Indian English fallback
    const fallbackVoice = voices.find((v) => v.lang.toLowerCase().includes('in') || v.lang.startsWith('en'));
    return { available: false, voiceName: fallbackVoice?.name || 'Default System Voice' };
  }

  /**
   * Speaks the payment announcement aloud
   */
  public async speakAnnouncement(params: {
    text: string;
    langCode: SupportedLanguageCode;
    speechRate?: number;
    speechPitch?: number;
    volume?: number;
    playChimeFirst?: boolean;
    successToneStyle?: SuccessToneStyle;
    isHighAmount?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  }): Promise<void> {
    const {
      text,
      langCode,
      speechRate = 1.0,
      speechPitch = 1.0,
      volume = 1.0,
      playChimeFirst = true,
      successToneStyle = 'classic',
      isHighAmount = false,
      onStart,
      onEnd,
    } = params;

    if (playChimeFirst) {
      await this.playTone(successToneStyle, isHighAmount);
    }

    if (!('speechSynthesis' in window)) {
      onStart?.();
      setTimeout(() => onEnd?.(), 1000);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(speechRate, 1.8));
    utterance.pitch = Math.max(0.6, Math.min(speechPitch, 1.5));
    utterance.volume = Math.max(0.1, Math.min(volume, 1.0));

    const langConfig = INDIAN_LANGUAGES.find((l) => l.code === langCode);
    const voices = window.speechSynthesis.getVoices();

    if (langConfig) {
      utterance.lang = langConfig.speechLocale;

      // Find best matching voice
      const bestVoice =
        voices.find((v) => v.lang.toLowerCase() === langConfig.speechLocale.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langConfig.code)) ||
        voices.find((v) => v.lang.includes('IN')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error', e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const soundEngine = new SoundBoxAudioEngine();
