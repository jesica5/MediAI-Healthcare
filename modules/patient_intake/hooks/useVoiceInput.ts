import { useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '../types';
import {
  SpeechRecognitionAdapter,
  SpeechState,
  SpeechError,
} from '../adapters/speechRecognition.interface';
import { WebSpeechAdapter } from '../adapters/webSpeechAdapter';
import { WhisperFallbackAdapter } from '../adapters/whisperFallbackAdapter';
import { translate } from '../locales/i18n';

interface UseVoiceInputOptions {
  language: Language;
  primaryAdapter?: SpeechRecognitionAdapter;
  fallbackAdapter?: SpeechRecognitionAdapter;
  onTranscriptChange?: (text: string) => void;
}

export function useVoiceInput({
  language,
  primaryAdapter,
  fallbackAdapter,
  onTranscriptChange,
}: UseVoiceInputOptions) {
  const [state, setState] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const primaryRef = useRef<SpeechRecognitionAdapter | null>(null);
  const fallbackRef = useRef<SpeechRecognitionAdapter | null>(null);
  const activeAdapterRef = useRef<SpeechRecognitionAdapter | null>(null);

  // Initialize adapters
  useEffect(() => {
    primaryRef.current = primaryAdapter || new WebSpeechAdapter();
    fallbackRef.current = fallbackAdapter || new WhisperFallbackAdapter();
  }, [primaryAdapter, fallbackAdapter]);

  const handleResult = useCallback(
    (text: string) => {
      setTranscript(text);
      setErrorMessage(null);
      setState('transcript_ready');
      if (onTranscriptChange) {
        onTranscriptChange(text);
      }
    },
    [onTranscriptChange]
  );

  const startFallback = useCallback(
    (primaryErr: SpeechError) => {
      setIsUsingFallback(true);
      const fallback = fallbackRef.current;
      if (!fallback || !fallback.isSupported()) {
        setState('error');
        setErrorMessage(
          translate(
            language,
            'voice.errors.fallbackFailed',
            'Voice service unavailable. Please enter symptoms manually using the keyboard.'
          )
        );
        return;
      }

      activeAdapterRef.current = fallback;
      fallback.onStateChange((s) => setState(s));
      fallback.onResult((text) => handleResult(text));
      fallback.onError((fallbackErr) => {
        setState('error');
        setErrorMessage(
          translate(
            language,
            'voice.errors.fallbackFailed',
            'Voice service unavailable. Please enter symptoms manually using the keyboard.'
          )
        );
      });

      try {
        fallback.start(language);
      } catch {
        setState('error');
        setErrorMessage(
          translate(
            language,
            'voice.errors.fallbackFailed',
            'Voice service unavailable. Please enter symptoms manually using the keyboard.'
          )
        );
      }
    },
    [language, handleResult]
  );

  const handlePrimaryError = useCallback(
    (error: SpeechError) => {
      if (error.code === 'not-allowed') {
        // Permission denied: cannot bypass with fallback
        setState('error');
        setErrorMessage(
          translate(
            language,
            'voice.errors.notAllowed',
            'Microphone permission was denied. Please allow microphone access or type manually.'
          )
        );
        return;
      }

      if (error.code === 'no-speech') {
        setState('error');
        setErrorMessage(
          translate(
            language,
            'voice.errors.noSpeech',
            'No speech was detected. Please try again or type manually.'
          )
        );
        return;
      }

      // If unsupported or network error, attempt fallback
      startFallback(error);
    },
    [language, startFallback]
  );

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setIsUsingFallback(false);

    const primary = primaryRef.current;
    if (!primary || !primary.isSupported()) {
      // Primary Web Speech not supported: try fallback immediately
      startFallback({
        code: 'not-supported',
        message: 'Primary Web Speech API is not supported.',
      });
      return;
    }

    activeAdapterRef.current = primary;
    primary.onStateChange((s) => setState(s));
    primary.onResult((text) => handleResult(text));
    primary.onError((err) => handlePrimaryError(err));

    try {
      primary.start(language);
    } catch {
      startFallback({
        code: 'unknown',
        message: 'Failed to start primary speech adapter.',
      });
    }
  }, [language, handleResult, handlePrimaryError, startFallback]);

  const stopListening = useCallback(() => {
    if (activeAdapterRef.current) {
      activeAdapterRef.current.stop();
    }
  }, []);

  const resetVoice = useCallback(() => {
    stopListening();
    setState('idle');
    setErrorMessage(null);
    setIsUsingFallback(false);
  }, [stopListening]);

  return {
    state,
    transcript,
    setTranscript,
    errorMessage,
    isUsingFallback,
    startListening,
    stopListening,
    resetVoice,
  };
}
