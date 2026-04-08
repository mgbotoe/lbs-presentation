import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// ---- State ----

interface Client {
  id: string;
  role: 'presenter' | 'audience';
  ws: WebSocket;
}

interface PollState {
  questionId: string;
  question: string;
  options: { id: string; label: string }[];
}

let clients: Client[] = [];
let votes: Record<string, Record<string, string>> = {};
// votes[questionId][clientId] = optionId  (one vote per client per question)
let currentPoll: PollState | null = null;
let clientCounter = 0;

// ---- Helpers ----

function getVoteTally(questionId: string): Record<string, number> {
  const tally: Record<string, number> = {};
  const questionVotes = votes[questionId] ?? {};
  for (const optionId of Object.values(questionVotes)) {
    tally[optionId] = (tally[optionId] ?? 0) + 1;
  }
  return tally;
}

function broadcast(role: 'presenter' | 'audience' | 'all', message: unknown) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (role === 'all' || client.role === role) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }
}

function audienceCount(): number {
  return clients.filter((c) => c.role === 'audience' && c.ws.readyState === WebSocket.OPEN).length;
}

function broadcastAudienceCount() {
  broadcast('presenter', { type: 'audience_count', count: audienceCount() });
}

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ---- WebSocket ----

wss.on('connection', (ws) => {
  const clientId = `c${++clientCounter}`;
  let client: Client = { id: clientId, role: 'audience', ws };
  clients.push(client);

  ws.on('message', (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case 'register': {
        client.role = msg.role;
        ws.send(JSON.stringify({ type: 'registered', role: msg.role, clientId }));

        if (msg.role === 'audience') {
          broadcastAudienceCount();
          if (currentPoll) {
            ws.send(JSON.stringify({ type: 'show_poll', ...currentPoll }));
          } else {
            ws.send(JSON.stringify({ type: 'waiting', message: 'Waiting for the next question...' }));
          }
        }
        break;
      }

      case 'set_screen': {
        // Presenter changed screen -- check if it's a poll
        if (msg.poll) {
          currentPoll = {
            questionId: msg.poll.questionId,
            question: msg.poll.question,
            options: msg.poll.options,
          };
          broadcast('audience', { type: 'show_poll', ...currentPoll });
        } else {
          currentPoll = null;
          broadcast('audience', { type: 'waiting', message: 'Waiting for the next question...' });
        }
        // Send current vote tally for this screen's poll
        if (msg.poll) {
          broadcast('presenter', {
            type: 'vote_update',
            questionId: msg.poll.questionId,
            votes: getVoteTally(msg.poll.questionId),
          });
        }
        break;
      }

      case 'vote': {
        const { questionId, optionId } = msg;
        if (!questionId || !optionId) break;
        if (!votes[questionId]) votes[questionId] = {};
        votes[questionId][clientId] = optionId;
        broadcast('presenter', {
          type: 'vote_update',
          questionId,
          votes: getVoteTally(questionId),
        });
        ws.send(JSON.stringify({ type: 'vote_confirmed', questionId, optionId }));
        break;
      }

      case 'reset_votes': {
        const { questionId } = msg;
        if (questionId) {
          votes[questionId] = {};
          broadcast('presenter', {
            type: 'vote_update',
            questionId,
            votes: {},
          });
        }
        break;
      }

      case 'manual_vote': {
        // Fallback manual tally from presenter
        const { questionId: qId, optionId: oId } = msg;
        if (!qId || !oId) break;
        const manualId = `manual_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        if (!votes[qId]) votes[qId] = {};
        votes[qId][manualId] = oId;
        broadcast('presenter', {
          type: 'vote_update',
          questionId: qId,
          votes: getVoteTally(qId),
        });
        break;
      }
    }
  });

  ws.on('close', () => {
    clients = clients.filter((c) => c.id !== clientId);
    broadcastAudienceCount();
  });
});

// ---- Static files (production) ----

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---- Start ----

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log('');
  console.log('  LBS Fireside Polling Server');
  console.log('  ─────────────────────────────');
  console.log(`  Presenter:  http://localhost:${PORT}`);
  console.log(`  Audience:   http://${ip}:${PORT}/audience`);
  console.log(`  Power User: http://localhost:${PORT}/poweruser`);
  console.log('');
  console.log('  Audience members: scan the QR code or go to the audience URL above');
  console.log('');
});
