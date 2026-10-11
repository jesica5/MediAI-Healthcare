'use client';

import React, { useState } from 'react';
import { Language } from '../types';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { getTranslation } from '../locales/i18n';
import styles from './VoiceInput.module.css';

interface Props {
  language: Language;
  onTranscript: (text: string) => void;
}

export function VoiceInput({ language, onTranscript }: Props) {
  const t = getTranslation(language);
  const {
    state,
    transcript,
    setTranscript,
    errorMessage,
    startListening,
    stopListening,
  } = useVoiceInput({ language });

  const [showTranscript, setShowTranscript] = useState(false);

  const handleApply = () => {
    onTranscript(transcript);
    setShowTranscript(false);
  };

  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const hasTranscript = state === 'transcript_ready' && transcript;

  const stateLabel: Record<string, string> = {
    idle: t.voice.stateIdle,
    listening: t.voice.stateListening,
    processing: t.voice.stateProcessing,
    transcript_ready: t.voice.stateTranscriptReady,
    error: t.voice.stateError,
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.voiceBtn} ${isListening ? styles.active : ''}`}
          onClick={isListening ? stopListening : () => { setShowTranscript(true); startListening(); }}
          disabled={isProcessing}
          aria-label={isListening ? t.voice.stopListening : t.voice.startListening}
          aria-pressed={isListening}
        >
          <span className={styles.micIcon} aria-hidden="true">🎤</span>
          <span>{isListening ? t.voice.stopListening : t.voice.startListening}</span>
          {isListening && <span className={styles.pulse} aria-hidden="true" />}
        </button>

        <span
          className={styles.status}
          aria-live="polite"
          aria-atomic="true"
        >
          {isProcessing && <span className={styles.spinner} aria-hidden="true" />}
          {stateLabel[state]}
        </span>
      </div>

      {errorMessage && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">⚠️</span> {errorMessage}
        </div>
      )}

      {showTranscript && (
        <div className={styles.transcriptArea}>
          <p className={styles.notice}>{t.voice.editableNotice}</p>
          <label htmlFor="voice-transcript" className={styles.transcriptLabel}>
            {t.voice.stateTranscriptReady}
          </label>
          <textarea
            id="voice-transcript"
            className={styles.transcriptInput}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            aria-label="Voice transcript — review and edit before applying"
          />
          <div className={styles.transcriptActions}>
            <button type="button" className={styles.applyBtn} onClick={handleApply} disabled={!transcript.trim()}>
              Apply to Field
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowTranscript(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {hasTranscript && !showTranscript && (
        <button
          type="button"
          className={styles.reviewBtn}
          onClick={() => setShowTranscript(true)}
        >
          Review voice transcript
        </button>
      )}
    </div>
  );
}
