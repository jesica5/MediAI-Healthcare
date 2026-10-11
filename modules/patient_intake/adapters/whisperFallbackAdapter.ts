import { Language } from '../types';
import {
  SpeechRecognitionAdapter,
  SpeechState,
  SpeechError,
} from './speechRecognition.interface';

/**
 * Whisper Fallback STUB Adapter
 * TODO(contract): The server-side speech-to-text endpoint contract is not finalized with the ML team.
 * This adapter acts as a configurable stub behind SpeechRecognitionAdapter.
 */
export class WhisperFallbackAdapter implements SpeechRecognitionAdapter {
  readonly name = 'WhisperFallbackAdapter';
  private endpointUrl: string;
  private resultCallback: ((transcript: string) => void) | null = null;
  private errorCallback: ((error: SpeechError) => void) | null = null;
  private stateCallback: ((state: SpeechState) => void) | null = null;
  private currentState: SpeechState = 'idle';
  private mediaRecorder: unknown = null;

  constructor(customEndpoint?: string) {
    this.endpointUrl =
      customEndpoint ||
      process.env.NEXT_PUBLIC_SPEECH_FALLBACK_URL ||
      process.env.SPEECH_FALLBACK_URL ||
      'http://localhost:3000/api/v1/speech/transcribe';
  }

  private setState(state: SpeechState) {
    this.currentState = state;
    if (this.stateCallback) {
      this.stateCallback(state);
    }
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async start(lang: Language): Promise<void> {
    if (!this.isSupported()) {
      this.setState('error');
      if (this.errorCallback) {
        this.errorCallback({
          code: 'not-supported',
          message: 'Audio recording is not supported in this environment.',
        });
      }
      return;
    }

    try {
      this.setState('listening');
      // Request audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = stream;
    } catch (err: unknown) {
      this.setState('error');
      const isPermissionDenied =
        err instanceof Error &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');

      if (this.errorCallback) {
        this.errorCallback({
          code: isPermissionDenied ? 'not-allowed' : 'unknown',
          message: isPermissionDenied
            ? 'Microphone permission denied for fallback recorder.'
            : 'Failed to access microphone for fallback recorder.',
          originalError: err,
        });
      }
    }
  }

  stop(): void {
    if (this.currentState === 'listening') {
      this.setState('processing');
      // Stop media tracks
      if (this.mediaRecorder && typeof (this.mediaRecorder as MediaStream).getTracks === 'function') {
        (this.mediaRecorder as MediaStream).getTracks().forEach((track) => track.stop());
      }
      // TODO(contract): In final implementation, recorded audio Blob is posted to this.endpointUrl.
      // For now, simulate/complete processing.
      this.setState('idle');
    }
  }

  /**
   * Helper to trigger transcription result (for testing and integration)
   */
  simulateTranscriptionResult(transcript: string) {
    this.setState('processing');
    if (this.resultCallback) {
      this.resultCallback(transcript);
    }
    this.setState('transcript_ready');
  }

  /**
   * Helper to simulate fallback error (for testing cascade)
   */
  simulateTranscriptionError(error: SpeechError) {
    this.setState('error');
    if (this.errorCallback) {
      this.errorCallback(error);
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
