import React, { useState, useEffect } from 'react';
import { Check, Circle } from 'lucide-react';

const DEFAULT_STAGES = [
  "Understanding your lifestyle...",
  "Analyzing neighborhoods...",
  "Matching properties...",
  "Calculating scores...",
  "Preparing results..."
];

const TIPS = [
  "Tip: Properties with high green scores typically retain 14% higher long-term resale value.",
  "Tip: Minimizing commute time below 25 minutes correlates with significantly higher daily wellness.",
  "Tip: Our AI evaluates acoustic buffers, tree canopy coverage, and pedestrian walkability indices.",
  "Tip: SmartNest matches are personalized to your habits, not just arbitrary price brackets."
];

export const LoadingStages = ({
  stages = DEFAULT_STAGES,
  title = "Analyzing with SmartNest AI Engine",
  currentStageIndex = 2
}) => {
  const [activeStage, setActiveStage] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Progressive stage advancement
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    return () => clearInterval(stageInterval);
  }, [stages.length]);

  // Cycling tips every 2.5s
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 2500);

    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 27, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Processing request"
    >
      <div
        className="smartnest-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px 32px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'fadeUpPage 300ms ease-out'
        }}
      >
        {/* Pulsing logo icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--teal-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'pulse 1.8s infinite ease-in-out'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--teal)'
            }}
          />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '24px' }}>
          Real-time neural indexing of lifestyle parameters against live listings.
        </p>

        {/* Stages Checklist */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', textAlign: 'left' }}>
          {stages.map((stage, idx) => {
            const isCompleted = idx < activeStage;
            const isCurrent = idx === activeStage;

            return (
              <div
                key={stage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCompleted
                    ? 'var(--teal)'
                    : isCurrent
                    ? 'var(--ink)'
                    : '#94A3B8',
                  transition: 'color 200ms ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted
                      ? 'var(--teal)'
                      : isCurrent
                      ? 'var(--teal-light)'
                      : 'var(--mist)',
                    color: isCompleted ? '#FFFFFF' : 'var(--teal)',
                    flexShrink: 0
                  }}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isCurrent ? (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--teal)',
                        animation: 'pulse 1s infinite'
                      }}
                    />
                  ) : (
                    <Circle size={10} color="#CBD5E1" />
                  )}
                </div>

                <span>{stage}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Tip Strip */}
        <div
          style={{
            width: '100%',
            padding: '12px 14px',
            backgroundColor: 'var(--mist)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--slate)',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 250ms ease'
          }}
        >
          <span>{TIPS[tipIndex]}</span>
        </div>
      </div>
    </div>
  );
};
