// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  SpeechRecognitionAdapter,
  SpeechState,
  SpeechError,
} from '../adapters/speechRecognition.interface';
import { WebSpeechAdapter } from '../adapters/webSpeechAdapter';
import { WhisperFallbackAdapter } from '../adapters/whisperFallbackAdapter';

class MockSpeechAdapter implements SpeechRecognitionAdapter {
  name: string;
  supported: boolean;
  state: SpeechState = 'idle';
  private resultCb: ((transcript: string) => void) | null = null;
  private errorCb: ((error: SpeechError) => void) | null = null;
  private stateCb: ((state: SpeechState) => void) | null = null;

  constructor(name = 'MockAdapter', supported = true) {
    this.name = name;
    this.supported = supported;
  }

  isSupported(): boolean {
    return this.supported;
  }

  start = vi.fn((_lang: string) => {
    this.setState('listening');
  });

  stop = vi.fn(() => {
    this.setState('idle');
  });

  onResult(callback: (transcript: string) => void) {
    this.resultCb = callback;
  }

  onError(callback: (error: SpeechError) => void) {
    this.errorCb = callback;
  }

  onStateChange(callback: (state: SpeechState) => void) {
    this.stateCb = callback;
  }

  private setState(state: SpeechState) {
    this.state = state;
    if (this.stateCb) {
      this.stateCb(state);
    }
  }

  simulateResult(text: string) {
    this.setState('processing');
    if (this.resultCb) {
      this.resultCb(text);
    }
    this.setState('transcript_ready');
  }

  simulateError(error: SpeechError) {
    this.setState('error');
    if (this.errorCb) {
      this.errorCb(error);
    }
  }
}

describe('Voice Symptom Input Tests', () => {
  let primaryMock: MockSpeechAdapter;
  let fallbackMock: MockSpeechAdapter;

  beforeEach(() => {
    primaryMock = new MockSpeechAdapter('PrimaryMock', true);
    fallbackMock = new MockSpeechAdapter('FallbackMock', true);
  });

  it('initializes in idle state with empty transcript', () => {
    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: fallbackMock,
      })
    );

    expect(result.current.state).toBe('idle');
    expect(result.current.transcript).toBe('');
    expect(result.current.errorMessage).toBeNull();
  });

  it('transitions from idle -> listening -> transcript_ready when speech succeeds', () => {
    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: fallbackMock,
      })
    );

    act(() => {
      result.current.startListening();
    });

    expect(primaryMock.start).toHaveBeenCalled();
    expect(result.current.state).toBe('listening');

    act(() => {
      primaryMock.simulateResult('Severe chest tightness and shortness of breath');
    });

    expect(result.current.state).toBe('transcript_ready');
    expect(result.current.transcript).toBe('Severe chest tightness and shortness of breath');
    expect(result.current.errorMessage).toBeNull();
  });

  it('handles microphone permission denied (not-allowed) with clear message without fallback', () => {
    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: fallbackMock,
      })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      primaryMock.simulateError({
        code: 'not-allowed',
        message: 'Permission denied',
      });
    });

    expect(result.current.state).toBe('error');
    expect(result.current.errorMessage).toMatch(/permission was denied/i);
    expect(fallbackMock.start).not.toHaveBeenCalled();
  });

  it('handles no speech detected (no-speech) with clear retry message', () => {
    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: fallbackMock,
      })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      primaryMock.simulateError({
        code: 'no-speech',
        message: 'No speech detected',
      });
    });

    expect(result.current.state).toBe('error');
    expect(result.current.errorMessage).toMatch(/no speech was detected/i);
    expect(fallbackMock.start).not.toHaveBeenCalled();
  });

  it('cascades to fallback adapter when primary adapter is unsupported', () => {
    const unsupportedPrimary = new MockSpeechAdapter('UnsupportedPrimary', false);

    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: unsupportedPrimary,
        fallbackAdapter: fallbackMock,
      })
    );

    act(() => {
      result.current.startListening();
    });

    expect(unsupportedPrimary.start).not.toHaveBeenCalled();
    expect(fallbackMock.start).toHaveBeenCalled();
    expect(result.current.isUsingFallback).toBe(true);

    act(() => {
      fallbackMock.simulateResult('Spoken text via fallback');
    });

    expect(result.current.transcript).toBe('Spoken text via fallback');
  });

  it('cascades to fallback when primary encounters a network error', () => {
    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: fallbackMock,
      })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      primaryMock.simulateError({
        code: 'network',
        message: 'Network failure',
      });
    });

    expect(fallbackMock.start).toHaveBeenCalled();
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('provides clear manual typing path when both primary and fallback fail', () => {
    const failingFallback = new MockSpeechAdapter('FailingFallback', false);

    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: failingFallback,
      })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      primaryMock.simulateError({
        code: 'network',
        message: 'Network failure',
      });
    });

    expect(result.current.state).toBe('error');
    expect(result.current.errorMessage).toMatch(/manually using the keyboard/i);
  });

  it('allows manual editing of the transcript and does not auto-submit', () => {
    const { result } = renderHook(() =>
      useVoiceInput({
        language: 'en',
        primaryAdapter: primaryMock,
        fallbackAdapter: fallbackMock,
      })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      primaryMock.simulateResult('chest pain');
    });

    expect(result.current.transcript).toBe('chest pain');

    // User edits the text manually
    act(() => {
      result.current.setTranscript('Severe crushing chest pain radiating to left arm');
    });

    expect(result.current.transcript).toBe('Severe crushing chest pain radiating to left arm');
  });

  it('verifies WebSpeechAdapter and WhisperFallbackAdapter instances implement the interface', () => {
    const webSpeech = new WebSpeechAdapter();
    expect(typeof webSpeech.isSupported).toBe('function');
    expect(typeof webSpeech.start).toBe('function');
    expect(typeof webSpeech.stop).toBe('function');

    const whisper = new WhisperFallbackAdapter('http://localhost:3000/api/v1/speech/transcribe');
    expect(typeof whisper.isSupported).toBe('function');
    expect(typeof whisper.start).toBe('function');
    expect(typeof whisper.stop).toBe('function');
  });
});
