import * as fs from "fs"
import * as path from "path"

const APP_ROOT_MARKER = "nest-cli.json"

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths.map((candidate) => path.resolve(candidate))))
}

export function resolveProtocolBridgeAppRoot(): string {
  // Traverse up from __dirname (dist/shared or src/shared) to find the app root
  let currentDir = __dirname
  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, APP_ROOT_MARKER))) {
      return currentDir
    }
    currentDir = path.dirname(currentDir)
  }

  // Fallback usually 2 levels up from shared/
  return path.resolve(__dirname, "..", "..")
}

export function resolveProtocolBridgePath(...segments: string[]): string {
  return path.resolve(resolveProtocolBridgeAppRoot(), ...segments)
}

export function getAccountConfigPathCandidates(filename: string): string[] {
  return uniquePaths([
    resolveProtocolBridgePath("data", filename),
    resolveProtocolBridgePath("data", "accounts", filename),
  ])
}

export function resolveDefaultAccountConfigPath(filename: string): string {
  return resolveProtocolBridgePath("data", filename)
}

export function getAntigravityAccountsConfigPathCandidates(): string[] {
  return uniquePaths([
    resolveDefaultAccountConfigPath("antigravity-accounts.json"),
    resolveProtocolBridgePath("data", "antigravity-accounts.json"),
    resolveProtocolBridgePath("data", "accounts.json"),
  ])
}

export function resolveDataRootFromConfigPath(
  configPath?: string | null
): string {
  if (!configPath) {
    return resolveProtocolBridgePath("data")
  }

  const directory = path.dirname(path.resolve(configPath))
  if (
    path.basename(directory) === "accounts" &&
    path.basename(path.dirname(directory)) === "data"
  ) {
    return path.dirname(directory)
  }

  if (path.basename(directory) === "data") {
    return directory
  }

  return resolveProtocolBridgePath("data")
}

export function resolveRuntimeDataPath(
  filename: string,
  _configPath?: string | null
): string {
  return path.resolve(resolveProtocolBridgeAppRoot(), ".runtime", filename)
}

export function resolveLegacyAccountStatePath(
  filename: string,
  configPath?: string | null
): string {
  return path.resolve(resolveDataRootFromConfigPath(configPath), filename)
}
