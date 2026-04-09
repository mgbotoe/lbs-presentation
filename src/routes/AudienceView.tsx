import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { PollOption, WSMessageToClient } from '../types';

interface ActivePoll {
  questionId: string;
  question: string;
  options: PollOption[];
}

function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Device denied or not supported — silent fail
    }
  }, []);

  useEffect(() => {
    acquire();
    // Re-acquire when tab becomes visible again (e.g. user switches back)
    const onVisible = () => { if (document.visibilityState === 'visible') acquire(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      wakeLockRef.current?.release();
    };
  }, [acquire]);
}

export function AudienceView() {
  useWakeLock();

  const [poll, setPoll] = useState<ActivePoll | null>(null);
  const [waitingMessage, setWaitingMessage] = useState('Waiting for the next question...');
  const [votedFor, setVotedFor] = useState<Record<string, string>>({});
  const [justVoted, setJustVoted] = useState(false);

  const handleMessage = useCallback((msg: WSMessageToClient) => {
    switch (msg.type) {
      case 'show_poll':
        setPoll({
          questionId: msg.questionId,
          question: msg.question,
          options: msg.options,
        });
        setJustVoted(false);
        break;
      case 'waiting':
        setPoll(null);
        setWaitingMessage(msg.message);
        setJustVoted(false);
        break;
      case 'vote_confirmed':
        setVotedFor((prev) => ({ ...prev, [msg.questionId]: msg.optionId }));
        setJustVoted(true);
        break;
    }
  }, []);

  const { connected, send } = useWebSocket({ role: 'audience', onMessage: handleMessage });

  const handleVote = useCallback(
    (questionId: string, optionId: string) => {
      send({ type: 'vote', questionId, optionId });
      setVotedFor((prev) => ({ ...prev, [questionId]: optionId }));
      setJustVoted(true);
    },
    [send],
  );

  if (!connected) {
    return (
      <div className="audience">
        <div className="audience-connecting">
          <h1>LBS AI Fireside</h1>
          <p>Connecting...</p>
          <div className="audience-pulse" />
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="audience">
        <div className="audience-waiting">
          <div className="audience-badge">✓ Connected</div>
          <div className="audience-logo">LBS<span>AI Fireside</span></div>
          <p>{waitingMessage}</p>
          <div className="audience-pulse" />
          <p className="audience-hint">Your vote is anonymous. Results shown at the presenter's discretion.</p>
        </div>
      </div>
    );
  }

  const currentVote = votedFor[poll.questionId];

  return (
    <div className="audience">
      <div className="audience-poll">
        <h1 className="audience-question">{poll.question}</h1>

        {justVoted && currentVote && (
          <div className="audience-voted-banner">
            Vote recorded — you can change it by tapping another option
          </div>
        )}

        <div className="audience-options">
          {poll.options.map((opt) => {
            const isSelected = currentVote === opt.id;
            return (
              <button
                key={opt.id}
                className={`audience-option-btn${isSelected ? ' selected' : ''}`}
                onClick={() => handleVote(poll.questionId, opt.id)}
              >
                {isSelected && <span className="audience-check">&#10003;</span>}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
