/**
 * Shared constants for the Cursor Proxy extension.
 */

// Extension identifiers
export const EXTENSION_ID = "agent-vibes"
export const EXTENSION_DISPLAY_NAME = "Cursor Proxy"

// Context keys (for when-clause evaluation)
export const CTX_SERVER_RUNNING = "cursorProxy.serverRunning"

// Command identifiers
export const CMD = {
  START_SERVER: "cursorProxy.startServer",
  STOP_SERVER: "cursorProxy.stopServer",
  RESTART_SERVER: "cursorProxy.restartServer",
  SYNC_ANTIGRAVITY_IDE: "cursorProxy.syncAntigravityIDE",
  SYNC_ANTIGRAVITY_TOOLS: "cursorProxy.syncAntigravityTools",
  SYNC_CLAUDE: "cursorProxy.syncClaude",
  SYNC_CODEX: "cursorProxy.syncCodex",
  GENERATE_CERT: "cursorProxy.generateCert",
  ENABLE_FORWARDING: "cursorProxy.enableForwarding",
  DISABLE_FORWARDING: "cursorProxy.disableForwarding",
  FORWARDING_STATUS: "cursorProxy.forwardingStatus",
  COLLECT_DIAGNOSTICS: "cursorProxy.collectDiagnostics",
  OPEN_CONFIG: "cursorProxy.openConfig",
  PATCH_CURSOR: "cursorProxy.patchCursor",
  RESTORE_CURSOR: "cursorProxy.restoreCursor",
  REFRESH_DASHBOARD: "cursorProxy.refreshDashboard",
  OPEN_DASHBOARD: "cursorProxy.openDashboard",
} as const

// Default configuration values
export const DEFAULTS = {
  PORT: 2026,
  HEALTH_CHECK_INTERVAL: 30, // seconds
  LOOPBACK_IP: "127.0.0.2",
  FROM_PORT: 443,
} as const

// Server state
export type ServerState = "stopped" | "starting" | "running" | "error"

// Cursor domains that need to be redirected
export const CURSOR_DOMAINS = [
  "api5.cursor.sh",
  "api5geo.cursor.sh",
  "api5lat.cursor.sh",
  "api2.cursor.sh",
  "api2geo.cursor.sh",
  "api2direct.cursor.sh",
] as const

// Generate full host entries (base + agent. + agentn. prefixes)
export function getCursorHostEntries(ip: string): string[] {
  const entries: string[] = []
  for (const domain of CURSOR_DOMAINS) {
    entries.push(`${ip}   ${domain}`)
    entries.push(`${ip}   agent.${domain}`)
    entries.push(`${ip}   agentn.${domain}`)
  }
  return entries
}
