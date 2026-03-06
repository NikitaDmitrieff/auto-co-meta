/**
 * Auto-Co -- Telegram Escalation Watcher
 *
 * Watches memories/human-request.md for new escalation requests,
 * sends them to Telegram, polls for replies, and writes responses
 * back to memories/human-response.md.
 *
 * Requirements:
 *   - Node.js 18+ (uses built-in fetch)
 *   - Environment variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *
 * Usage:
 *   node watcher.js
 *   # or: make watcher
 */

import { readFileSync, writeFileSync, watchFile, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REQUEST_FILE = resolve(__dirname, "memories/human-request.md");
const RESPONSE_FILE = resolve(__dirname, "memories/human-response.md");
const MEMORIES_DIR = resolve(__dirname, "memories");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const POLL_INTERVAL_MS = parseInt(process.env.WATCHER_POLL_INTERVAL || "5000", 10);
const WATCH_INTERVAL_MS = parseInt(process.env.WATCHER_WATCH_INTERVAL || "3000", 10);

const TELEGRAM_ENABLED = !!(BOT_TOKEN && CHAT_ID);

if (!TELEGRAM_ENABLED) {
  console.warn(
    "Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.\n" +
      "Watcher running in degraded mode — escalation requests will be logged but NOT sent to Telegram.\n" +
      "To enable Telegram: copy .env.example to .env, fill in your values, then restart."
  );
}

// ---------------------------------------------------------------------------
// Telegram API helpers (built-in fetch, no dependencies)
// ---------------------------------------------------------------------------

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

/** Send a message to the configured Telegram chat. */
async function sendMessage(text) {
  const url = `${API_BASE}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.result;
}

/**
 * Long-poll for new messages using getUpdates.
 * Returns the first reply text from the configured chat, or null.
 */
let lastUpdateId = 0;

async function pollForReply() {
  const url = `${API_BASE}/getUpdates`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      offset: lastUpdateId + 1,
      timeout: 30, // long-poll 30s
      allowed_updates: ["message"],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Telegram getUpdates failed (${res.status}): ${body}`);
    return null;
  }

  const data = await res.json();
  if (!data.ok || !data.result || data.result.length === 0) {
    return null;
  }

  for (const update of data.result) {
    lastUpdateId = update.update_id;
    const msg = update.message;
    if (
      msg &&
      msg.chat &&
      String(msg.chat.id) === String(CHAT_ID) &&
      msg.text
    ) {
      return msg.text;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readFileSafe(path) {
  try {
    return existsSync(path) ? readFileSync(path, "utf-8").trim() : "";
  } catch {
    return "";
  }
}

function writeFileSafe(path, content) {
  ensureDir(dirname(path));
  writeFileSync(path, content, "utf-8");
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

let waitingForReply = false;
let lastRequestContent = "";

async function checkForNewRequest() {
  if (waitingForReply) return; // don't send duplicate requests

  const content = readFileSafe(REQUEST_FILE);
  if (!content || content === lastRequestContent) return;

  lastRequestContent = content;
  console.log(`[${new Date().toISOString()}] New escalation request detected.`);
  console.log(content.substring(0, 200) + (content.length > 200 ? "..." : ""));

  if (!TELEGRAM_ENABLED) {
    console.log(`[${new Date().toISOString()}] [DEGRADED] Escalation request logged (Telegram disabled):\n${content.substring(0, 200)}`);
    return;
  }

  try {
    const header = "** Auto-Co Escalation Request **\n\n";
    await sendMessage(header + content);
    console.log(`[${new Date().toISOString()}] Request sent to Telegram.`);
    waitingForReply = true;
    startPolling();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Failed to send to Telegram:`, err.message);
  }
}

async function startPolling() {
  console.log(`[${new Date().toISOString()}] Polling for human reply...`);

  while (waitingForReply) {
    try {
      const reply = await pollForReply();
      if (reply) {
        console.log(`[${new Date().toISOString()}] Received reply: ${reply.substring(0, 100)}`);

        // Write response
        const responseContent = [
          "## Human Response",
          `- **Date:** ${new Date().toISOString()}`,
          `- **Reply:** ${reply}`,
        ].join("\n");

        writeFileSafe(RESPONSE_FILE, responseContent);
        console.log(`[${new Date().toISOString()}] Response written to ${RESPONSE_FILE}`);

        // Clear request file
        writeFileSafe(REQUEST_FILE, "");
        lastRequestContent = "";
        console.log(`[${new Date().toISOString()}] Request file cleared.`);

        // Acknowledge in Telegram
        await sendMessage("Got it. Response written to memories/human-response.md. The team will pick it up next cycle.");

        waitingForReply = false;
        return;
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Poll error:`, err.message);
    }

    // Brief pause between polls (the long-poll itself waits 30s)
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

ensureDir(MEMORIES_DIR);

// Ensure files exist
if (!existsSync(REQUEST_FILE)) writeFileSafe(REQUEST_FILE, "");
if (!existsSync(RESPONSE_FILE)) writeFileSafe(RESPONSE_FILE, "");

console.log(`[${new Date().toISOString()}] Auto-Co Telegram Watcher started${TELEGRAM_ENABLED ? "" : " [DEGRADED — no Telegram]"}.`);
console.log(`  Request file:  ${REQUEST_FILE}`);
console.log(`  Response file: ${RESPONSE_FILE}`);
console.log(`  Chat ID:       ${TELEGRAM_ENABLED ? CHAT_ID : "(not set)"}`);
console.log(`  Watch interval: ${WATCH_INTERVAL_MS}ms`);
console.log("");

// Watch the request file for changes
watchFile(REQUEST_FILE, { interval: WATCH_INTERVAL_MS }, () => {
  checkForNewRequest();
});

// Also check on a regular interval (in case watchFile misses something)
setInterval(() => {
  checkForNewRequest();
}, WATCH_INTERVAL_MS * 2);

// Initial check
checkForNewRequest();

// Keep process alive
process.on("SIGINT", () => {
  console.log(`\n[${new Date().toISOString()}] Watcher stopped.`);
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log(`[${new Date().toISOString()}] Watcher terminated.`);
  process.exit(0);
});
