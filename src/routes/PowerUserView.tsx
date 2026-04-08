import { useState, useCallback, useEffect } from 'react';
import { powerScreens } from '../data/powerScreens';
import { Navigation } from '../components/Navigation';
import { useWebSocket } from '../hooks/useWebSocket';
import type { VoteTally, WSMessageToClient } from '../types';

export function PowerUserView() {
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

  const screen = powerScreens[screenIndex];

  const notifyScreenChange = useCallback(
    (idx: number) => {
      const s = powerScreens[idx];
      if (s.type === 'poll' && s.pollOptions) {
        send({
          type: 'set_screen',
          screenIndex: idx,
          sessionType: 'poweruser',
          poll: {
            questionId: s.id,
            question: s.title ?? '',
            options: s.pollOptions,
          },
        } as any);
      }
    },
    [send],
  );

  useEffect(() => {
    if (connected) {
      notifyScreenChange(screenIndex);
    }
  }, [screenIndex, connected, notifyScreenChange]);

  const goBack = useCallback(() => setScreenIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setScreenIndex((i) => Math.min(powerScreens.length - 1, i + 1)),
    [],
  );

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

  const tally = votes[screen.id] ?? {};
  const isRevealed = revealed[screen.id] ?? false;
  const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);

  return (
    <div className="presenter poweruser">
      <div className="section-label">Power Users</div>

      <div className="screen-content">
        <div className="screen-poll">
          <h1 className="question-text">{screen.title}</h1>

          <div className="poll-controls">
            <button className="poll-action-btn" onClick={() => toggleReveal(screen.id)}>
              {isRevealed ? 'Hide Results' : 'Show Results'}
            </button>
            <button className="poll-action-btn poll-reset-btn" onClick={() => resetVotes(screen.id)}>
              Reset
            </button>
            <span className="poll-total-votes">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
          </div>

          <div className="poll-options">
            {screen.pollOptions?.map((opt) => {
              const count = tally[opt.id] ?? 0;
              const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              return (
                <div key={opt.id} className="poll-option-row">
                  <button
                    className="tally-btn"
                    onClick={() => manualVote(screen.id, opt.id)}
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
      </div>

      <Navigation current={screenIndex} total={powerScreens.length} onBack={goBack} onNext={goNext}>
        <div className="audience-counter">
          <span className={`audience-counter-dot${connected ? '' : ' disconnected'}`} />
          <span>{audienceCount} connected</span>
        </div>
      </Navigation>
    </div>
  );
}
