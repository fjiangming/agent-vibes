import * as os from "os"
import * as path from "path"
import * as fs from "fs"

/**
 * Unified data directory: ~/.agent-vibes/
 * Replaces the scattered legacy paths:
 *   - apps/protocol-bridge/data/
 *   - apps/protocol-bridge/.runtime/
 *   - ~/.protocol-bridge/
 */

const DEFAULT_DATA_DIR_NAME = ".cursor-proxy"

export function getCursorProxyHome(): string {
  const envOverride = process.env.AGENT_VIBES_DATA_DIR
  if (envOverride) {
    return path.resolve(envOverride)
  }
  return path.join(os.homedir(), DEFAULT_DATA_DIR_NAME)
}

export function getCursorProxyPgDataDir(): string {
  return path.join(getCursorProxyHome(), "pgdata")
}

export function getCursorProxyLogsDir(): string {
  return path.join(getCursorProxyHome(), "logs")
}

export function getCursorProxyCertsDir(): string {
  return path.join(getCursorProxyHome(), "certs")
}

export function getCursorProxyAccountsDir(): string {
  return path.join(getCursorProxyHome(), "data")
}

export function ensureCursorProxyDirs(): void {
  const dirs = [
    getCursorProxyHome(),
    getCursorProxyPgDataDir(),
    getCursorProxyLogsDir(),
    getCursorProxyCertsDir(),
    getCursorProxyAccountsDir(),
  ]
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}
