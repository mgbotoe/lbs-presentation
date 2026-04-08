import { useState, useCallback, useEffect, useMemo } from 'react';
import { mainScreens } from '../data/mainScreens';
import { Navigation } from '../components/Navigation';
import { QRJoin } from '../components/QRJoin';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Screen, VoteTally, WSMessageToClient } from '../types';

export function PresenterView() {
  const [screenIndex, setScreenIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, VoteTally>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [audienceCount, setAudienceCount] = useState(0);

  const handleMessage = useCallback((msg: WSMessageToClient) => {
    switch (msg.type) {
      case 'vote_update':
        setVotes((prev) => ({ ...prev, [msg.questionId]: msg.votes }));
        break;
      case 'audience_count':
        setAudienceCount(msg.count);
        break;
    }
  }, []);

  const { connected, send } = useWebSocket({ role: 'presenter', onMessage: handleMessage });

  const screen = mainScreens[screenIndex];

  const notifyScreenChange = useCallback(
    (idx: number) => {
      const s = mainScreens[idx];
      if (s.type === 'poll' && s.pollOptions) {
        send({
          type: 'set_screen',
          screenIndex: idx,
          sessionType: 'main',
          poll: {
            questionId: s.id,
            question: s.title ?? '',
            options: s.pollOptions,
          },
        } as any);
      } else {
        send({ type: 'set_screen', screenIndex: idx, sessionType: 'main' });
      }
    },
    [send],
  );

  useEffect(() => {
    if (connected) {
      notifyScreenChange(screenIndex);
    }
  }, [screenIndex, connected, notifyScreenChange]);

  const goBack = useCallback(() => {
    setScreenIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setScreenIndex((i) => Math.min(mainScreens.length - 1, i + 1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goBack, goNext]);

  const manualVote = useCallback(
    (questionId: string, optionId: string) => {
      send({ type: 'manual_vote', questionId, optionId } as any);
      setVotes((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [optionId]: (prev[questionId]?.[optionId] ?? 0) + 1,
        },
      }));
    },
    [send],
  );

  const resetVotes = useCallback(
    (questionId: string) => {
      send({ type: 'reset_votes', questionId });
      setVotes((prev) => ({ ...prev, [questionId]: {} }));
    },
    [send],
  );

  const toggleReveal = useCallback((questionId: string) => {
    setRevealed((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const isDivider = screen.type === 'divider';

  const audienceUrl = useMemo(() => {
    const loc = window.location;
    return `${loc.protocol}//${loc.hostname}:${loc.port || (loc.protocol === 'https:' ? '443' : '80')}/audience`;
  }, []);

  return (
    <div className={`presenter${isDivider ? ' divider-bg' : ''}`}>
      {screen.sectionLabel && (
        <div className="section-label">{screen.sectionLabel}</div>
      )}

      <div className="screen-content">
        <ScreenRenderer
          screen={screen}
          votes={votes[screen.id] ?? {}}
          isRevealed={revealed[screen.id] ?? false}
          onIncrement={(optionId) => manualVote(screen.id, optionId)}
          onReset={() => resetVotes(screen.id)}
          onToggleReveal={() => toggleReveal(screen.id)}
          audienceUrl={audienceUrl}
        />
      </div>

      <Navigation current={screenIndex} total={mainScreens.length} onBack={goBack} onNext={goNext}>
        <div className="audience-counter">
          <span className={`audience-counter-dot${connected ? '' : ' disconnected'}`} />
          <span>{audienceCount} connected</span>
        </div>
      </Navigation>
    </div>
  );
}

interface ScreenRendererProps {
  screen: Screen;
  votes: VoteTally;
  isRevealed: boolean;
  onIncrement: (optionId: string) => void;
  onReset: () => void;
  onToggleReveal: () => void;
  audienceUrl: string;
}

function ScreenRenderer({
  screen,
  votes,
  isRevealed,
  onIncrement,
  onReset,
  onToggleReveal,
  audienceUrl,
}: ScreenRendererProps) {
  switch (screen.type) {
    case 'intro':
      return (
        <div className="screen-intro">
          <p className="screen-text">{screen.title}</p>
          <QRJoin audienceUrl={audienceUrl} />
          {screen.facilitatorNote && (
            <p className="facilitator-note">{screen.facilitatorNote}</p>
          )}
        </div>
      );
    case 'close':
      return (
        <div className="screen-close">
          <p className="screen-text">{screen.title}</p>
          {screen.facilitatorNote && (
            <p className="facilitator-note">{screen.facilitatorNote}</p>
          )}
        </div>
      );

    case 'divider':
      return (
        <div className="screen-divider">
          <h1 className="divider-title">{screen.dividerTitle}</h1>
          {screen.dividerDuration && (
            <span className="divider-duration">{screen.dividerDuration}</span>
          )}
          {screen.facilitatorNote && (
            <p className="facilitator-note">{screen.facilitatorNote}</p>
          )}
        </div>
      );

    case 'discussion':
      return (
        <div className="screen-discussion">
          <h1 className="question-text">{screen.title}</h1>
          {screen.subtitle && <p className="question-subtitle">{screen.subtitle}</p>}
          {screen.facilitatorNote && (
            <p className="facilitator-note">{screen.facilitatorNote}</p>
          )}
        </div>
      );

    case 'poll': {
      const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
      return (
        <div className="screen-poll">
          <h1 className="question-text">{screen.title}</h1>
          {screen.facilitatorNote && (
            <p className="facilitator-note">{screen.facilitatorNote}</p>
          )}
          <div className="poll-controls">
            <button className="poll-action-btn" onClick={onToggleReveal}>
              {isRevealed ? 'Hide Results' : 'Show Results'}
            </button>
            <button className="poll-action-btn poll-reset-btn" onClick={onReset}>
              Reset
            </button>
            <span className="poll-total-votes">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
          </div>
          <div className="poll-options">
            {screen.pollOptions?.map((opt) => {
              const count = votes[opt.id] ?? 0;
              const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              return (
                <div key={opt.id} className="poll-option-row">
                  <button
                    className="tally-btn"
                    onClick={() => onIncrement(opt.id)}
                    aria-label={`Add vote for ${opt.label}`}
                  >
                    +
                  </button>
                  <div className="poll-option-content">
                    <div className="poll-option-header">
                      <span className="poll-option-label">{opt.label}</span>
                      <span className="poll-option-count">
                        {count}
                        {isRevealed && totalVotes > 0 && (
                          <span className="poll-option-pct"> ({Math.round(pct)}%)</span>
                        )}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: isRevealed ? `${pct}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return <div>Unknown screen type</div>;
  }
}
