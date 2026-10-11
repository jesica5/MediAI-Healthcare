import { Language } from '../types';
import {
  SpeechRecognitionAdapter,
  SpeechState,
  SpeechError,
} from './speechRecognition.interface';

// Browser Web Speech API interfaces
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: {
        isFinal: boolean;
        0: { transcript: string };
      };
    };
  }) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => IWindowSpeechRecognition;
    webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
  }
}

export class WebSpeechAdapter implements SpeechRecognitionAdapter {
  readonly name = 'WebSpeechAdapter';
  private recognition: IWindowSpeechRecognition | null = null;
  private resultCallback: ((transcript: string) => void) | null = null;
  private errorCallback: ((error: SpeechError) => void) | null = null;
  private stateCallback: ((state: SpeechState) => void) | null = null;
  private currentState: SpeechState = 'idle';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechConstructor) {
      return;
    }

    try {
      this.recognition = new SpeechConstructor();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.setState('listening');
      };

      this.recognition.onresult = (event) => {
        this.setState('processing');
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.resultCallback) {
          this.resultCallback(transcript.trim());
        }
        this.setState('transcript_ready');
      };

      this.recognition.onerror = (event) => {
        this.setState('error');
        const code = event.error;
        let mappedCode: SpeechError['code'] = 'unknown';
        let message = 'Speech recognition encountered an error.';

        if (code === 'not-allowed' || code === 'service-not-allowed') {
          mappedCode = 'not-allowed';
          message = 'Microphone permission denied.';
        } else if (code === 'no-speech') {
          mappedCode = 'no-speech';
          message = 'No speech detected.';
        } else if (code === 'network') {
          mappedCode = 'network';
          message = 'Network error during speech recognition.';
        }

        if (this.errorCallback) {
          this.errorCallback({
            code: mappedCode,
            message,
            originalError: event,
          });
        }
      };

      this.recognition.onend = () => {
        if (this.currentState === 'listening') {
          this.setState('idle');
        }
      };
    } catch {
      this.recognition = null;
    }
  }

  private setState(state: SpeechState) {
    this.currentState = state;
    if (this.stateCallback) {
      this.stateCallback(state);
    }
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(lang: Language): void {
    if (!this.isSupported()) {
      this.setState('error');
      if (this.errorCallback) {
        this.errorCallback({
          code: 'not-supported',
          message: 'Speech recognition is not supported in this browser.',
        });
      }
      return;
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      this.setState('error');
      return;
    }

    // Locale mapping: en-US for English, ta-IN for Tamil
    this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-US';

    try {
      this.recognition.start();
    } catch (err) {
      this.setState('error');
      if (this.errorCallback) {
        this.errorCallback({
          code: 'unknown',
          message: 'Failed to start speech recognition.',
          originalError: err,
        });
      }
    }
  }

  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Safe no-op if already stopped
      }
    }
    if (this.currentState === 'listening') {
      this.setState('idle');
    }
  }

  onResult(callback: (transcript: string) => void): void {
    this.resultCallback = callback;
  }

  onError(callback: (error: SpeechError) => void): void {
    this.errorCallback = callback;
  }

  onStateChange(callback: (state: SpeechState) => void): void {
    this.stateCallback = callback;
  }
}
