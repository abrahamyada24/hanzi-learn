/**
 * Speech synthesis utility for native Chinese Mandarin pronunciation
 */
class SpeechManager {
  private isSupported: boolean;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (this.isSupported) {
      this.initVoice();
    }
  }

  private initVoice() {
    if (!this.isSupported) return;

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for Chinese voices: zh-CN, zh-TW, zh, cmn
      const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('cmn'));
      if (zhVoice) {
        this.voice = zhVoice;
      }
    };

    findVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  public speak(text: string, rate: number = 0.85): void {
    if (!this.isSupported) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = rate; // slightly slower for language learners

      if (this.voice) {
        utterance.voice = this.voice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech error:', err);
    }
  }

  public stop(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechManager = new SpeechManager();
