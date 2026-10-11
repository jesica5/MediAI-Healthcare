import { Language } from '../types';

export type SpeechState = 'idle' | 'listening' | 'processing' | 'transcript_ready' | 'error';

export type SpeechErrorCode =
  | 'not-allowed'
  | 'not-supported'
  | 'no-speech'
  | 'network'
  | 'fallback-failed'
  | 'unknown';

export interface SpeechError {
  code: SpeechErrorCode;
  message: string;
  originalError?: unknown;
}

export interface SpeechRecognitionAdapter {
  readonly name: string;
  isSupported(): boolean;
  start(lang: Language): Promise<void> | void;
  stop(): void;
  onResult(callback: (transcript: string) => void): void;
  onError(callback: (error: SpeechError) => void): void;
  onStateChange(callback: (state: SpeechState) => void): void;
}
