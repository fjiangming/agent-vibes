import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const extensionRoot = path.resolve(__dirname, "..")
const repoRoot = path.resolve(extensionRoot, "..", "..")
const extensionPkgPath = path.join(extensionRoot, "package.json")
const readmeEnPath = path.join(repoRoot, "README.md")
const readmeZhPath = path.join(repoRoot, "README_zh.md")
const extensionReadmePath = path.join(extensionRoot, "README.md")

const version = JSON.parse(fs.readFileSync(extensionPkgPath, "utf8")).version
const tag = `v${version}`
const releaseBase = `https://github.com/funny-vibes/agent-vibes/releases/download/${tag}`

if (!version) {
  throw new Error(`Version not found in ${extensionPkgPath}`)
}

const installBlocks = {
  darwinArm64: `#### macOS Apple Silicon\n\n\`\`\`bash\n# Download\ncurl -L -o agent-vibes-darwin-arm64-${version}.vsix ${releaseBase}/agent-vibes-darwin-arm64-${version}.vsix\n\n# Install\ncursor --install-extension agent-vibes-darwin-arm64-${version}.vsix --force\n\`\`\``,
  darwinX64: `#### macOS Intel\n\n\`\`\`bash\n# Download\ncurl -L -o agent-vibes-darwin-x64-${version}.vsix ${releaseBase}/agent-vibes-darwin-x64-${version}.vsix\n\n# Install\ncursor --install-extension agent-vibes-darwin-x64-${version}.vsix --force\n\`\`\``,
  linuxX64: `#### Linux x64\n\n\`\`\`bash\n# Download\ncurl -L -o agent-vibes-linux-x64-${version}.vsix ${releaseBase}/agent-vibes-linux-x64-${version}.vsix\n\n# Install\ncursor --install-extension agent-vibes-linux-x64-${version}.vsix --force\n\`\`\``,
  win32X64: `#### Windows x64\n\n\`\`\`powershell\n# Download\nInvoke-WebRequest -Uri "${releaseBase}/agent-vibes-win32-x64-${version}.vsix" -OutFile "agent-vibes-win32-x64-${version}.vsix"\n\n# Install\ncursor --install-extension agent-vibes-win32-x64-${version}.vsix --force\n\`\`\``,
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function replacePlatformBlock(content, platform, block) {
  const pattern = new RegExp(
    "#### " +
      escapeRegex(platform) +
      "\\n\\n```(?:bash|powershell)\\n[\\s\\S]*?\\n```",
    "g"
  )
  return content.replace(pattern, block)
}

function collapseDuplicateCommands(content, version) {
  const unixTargets = [
    `agent-vibes-darwin-arm64-${version}.vsix`,
    `agent-vibes-darwin-x64-${version}.vsix`,
    `agent-vibes-linux-x64-${version}.vsix`,
  ]

  for (const filename of unixTargets) {
    const pair = [
      `curl -L -o ${filename} ${releaseBase}/${filename}`,
      `cursor --install-extension ${filename} --force`,
    ].join("\\n")
    const pairPattern = new RegExp(`(?:${escapeRegex(pair)}\\n?){2,}`, "g")
    content = content.replace(pairPattern, `${pair}\\n`)
  }

  const winPair = [
    `Invoke-WebRequest -Uri \"${releaseBase}/agent-vibes-win32-x64-${version}.vsix\" -OutFile \"agent-vibes-win32-x64-${version}.vsix\"`,
    `cursor --install-extension agent-vibes-win32-x64-${version}.vsix --force`,
  ].join("\\n")
  const winPairPattern = new RegExp(`(?:${escapeRegex(winPair)}\\n?){2,}`, "g")
  return content.replace(winPairPattern, `${winPair}\\n`)
}

function updateReadme(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`README not found: ${filePath}`)
  }

  let content = fs.readFileSync(filePath, "utf8")
  content = collapseDuplicateCommands(content, version)
  content = replacePlatformBlock(
    content,
    "macOS Apple Silicon",
    installBlocks.darwinArm64
  )
  content = replacePlatformBlock(
    content,
    "macOS Intel",
    installBlocks.darwinX64
  )
  content = replacePlatformBlock(content, "Linux x64", installBlocks.linuxX64)
  content = replacePlatformBlock(content, "Windows x64", installBlocks.win32X64)
  fs.writeFileSync(filePath, content)
}

updateReadme(readmeEnPath)
updateReadme(readmeZhPath)

console.log(`Updated install commands to ${tag} in README.md and README_zh.md`)
