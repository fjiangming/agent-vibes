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

if (!version) {
  throw new Error(`Version not found in ${extensionPkgPath}`)
}

const installLines = {
  darwinArm64: `cursor --install-extension agent-vibes-darwin-arm64-${version}.vsix --force`,
  darwinX64: `cursor --install-extension agent-vibes-darwin-x64-${version}.vsix --force`,
  linuxX64: `cursor --install-extension agent-vibes-linux-x64-${version}.vsix --force`,
  win32X64: `cursor --install-extension agent-vibes-win32-x64-${version}.vsix --force`,
}

function updateReadme(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`README not found: ${filePath}`)
  }

  let content = fs.readFileSync(filePath, "utf8")
  content = content.replace(
    /cursor --install-extension agent-vibes-darwin-arm64-[^\s`]+\.vsix --force/g,
    installLines.darwinArm64
  )
  content = content.replace(
    /cursor --install-extension agent-vibes-darwin-x64-[^\s`]+\.vsix --force/g,
    installLines.darwinX64
  )
  content = content.replace(
    /cursor --install-extension agent-vibes-linux-x64-[^\s`]+\.vsix --force/g,
    installLines.linuxX64
  )
  content = content.replace(
    /cursor --install-extension agent-vibes-win32-x64-[^\s`]+\.vsix --force/g,
    installLines.win32X64
  )
  fs.writeFileSync(filePath, content)
}

updateReadme(readmeEnPath)
updateReadme(readmeZhPath)
fs.copyFileSync(readmeEnPath, extensionReadmePath)

console.log(
  `Updated install commands to v${version} in README.md and README_zh.md`
)
console.log(
  `Synced README.md → ${path.relative(repoRoot, extensionReadmePath)}`
)
