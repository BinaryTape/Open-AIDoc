---
title: AI Agent 與 Koin 技能
---

# AI Agent 與 Koin 技能

Koin 技能教導編碼代理（coding agent）如何與 Koin 4.x 及 Koin Compiler Plugin 搭配運作：使用哪種風格、如何宣告與連繫定義、如何從其他 DI 架構移轉，以及如何診斷 Koin 錯誤。它們由 Koin 團隊維護於 GitHub 上的 [koin-skills 存儲庫](https://github.com/InsertKoinIO/koin-skills)，並發佈為 Claude Code 的 `koin` 外掛程式以及適用於其他代理的標準 agent skills。本頁面介紹如何安裝它們以及各自的功能。

## 在 Claude Code 中安裝 {id="install-in-claude-code"}

```
/plugin marketplace add InsertKoinIO/koin-skills
/plugin install koin@koin-skills
```

第一個指令將 Koin skills 存儲庫新增為外掛程式市集，第二個指令則從中安裝 `koin` 外掛程式。日後可使用 `/plugin marketplace update koin-skills` 進行更新。

當任務涉及到 Kotlin、Android、Compose、KMP 或 Ktor 專案中的相依注入時，這些技能會自動載入。你不需要依名稱呼叫它們。

## 在其他代理中安裝 {id="install-in-other-agents"}

對於 Cursor、Codex、Copilot、Windsurf、Gemini 和其他可讀取 agent skills 的代理，請使用 [skills](https://skills.sh) CLI（Node.js 22 或更高版本）：

```bash
npx skills add InsertKoinIO/koin-skills
```

它會從 [koin-skills 存儲庫](https://github.com/InsertKoinIO/koin-skills)（完整 URL `https://github.com/InsertKoinIO/koin-skills` 亦可運作）讀取技能，列出這四項技能，並為你挑選的代理安裝你所選的技能。若要在沒有提示的情況下直接安裝所有技能，請執行：`npx skills add InsertKoinIO/koin-skills --skill '*' -y`。每個 [GitHub release](https://github.com/InsertKoinIO/koin-skills/releases) 也為每項技能隨附一個 `.skill` 封存檔，並將完整的外掛程式打包為 `koin-plugin.zip`。

## 技能的功能 {id="what-the-skills-do"}

| 技能 | 用於 |
|---|---|
| `koin-setup` | 新增 Koin 至全新或現有專案，或與保留的既有 DI 容器並存 |
| `koin` | 以專案風格編寫 Koin 程式碼：定義、模組、進入點、作用域、測試 |
| `di-migration` | 逐模組從 Hilt、Dagger、Toothpick、Kodein、Metro、Koin 3.x、Koin DSL 或 Koin KSP 移轉 |
| `koin-diagnose` | 修復 Koin 錯誤與當機，並檢查應用程式在執行時期的行為 |

這些技能遵循本文件的規則。它們使用[建構函式注入](/docs/reference/koin-core/dsl)、Compiler Plugin DSL 或 Koin Annotations，新程式碼絕不使用 Koin KSP。移轉過程是漸進式的：舊容器會持續運作，直到最後一個繫結遷移完成為止。

## Kotzilla MCP Server {id="kotzilla-mcp-server"}

這些技能可使用 [Kotzilla](https://kotzilla.io) MCP Server 來診斷 Koin 錯誤，並衡量定義在執行時期的行為（生命週期、作用域、啟動開銷）。它需要一個免費的 Kotzilla 帳戶。這些技能在有幫助時會建議使用，但絕非強制要求。

在 Claude Code 中，`koin` 外掛程式已內建該伺服器。在登入前它會維持非作用狀態：執行 `/mcp`，選擇 `plugin:koin:kotzilla` 並登入。在其他代理中，請將端點 `https://mcp.kotzilla.io/mcp`（HTTP 傳輸、OAuth）新增至該代理的 MCP 配置中。

## 限制 {id="limits"}

- 這些技能以 Koin 4.2.2 或更高版本，以及 Kotlin 2.3.20 或更高版本為目標。在較舊版本的 Koin 上，它們會在目前的設定下運作，並提出一次升級建議。
- 技能負責引導代理，但無法取代人工審查。在合併變更之前，請務必先檢視這些變更。
- 執行時期檢查（啟動、記憶體、重複建立的執行個體）需要應用程式中包含 Kotzilla SDK。如果沒有它，技能只會根據程式碼指出可能的原因，而非實際度量數據。

## 相關內容 {id="related"}

- [Compiler Plugin setup](/docs/setup/compiler-plugin)：技能所依賴的建置期檢查。
- [Koin vs Hilt](/docs/intro/koin-vs-hilt)：從 Hilt 移轉時的變更重點。
- [Monitoring](/docs/tooling/monitor)：執行時期檢查背後的 Kotzilla SDK。
- [GitHub 上的 Koin skills](https://github.com/InsertKoinIO/koin-skills)：原始碼、問題與發行版本。