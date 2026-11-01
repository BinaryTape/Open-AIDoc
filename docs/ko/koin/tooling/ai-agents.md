---
title: AI 에이전트와 Koin Skills
---

# AI 에이전트와 Koin Skills

Koin skills는 코딩 에이전트에게 Koin 4.x 및 Koin Compiler Plugin을 사용하는 방법(어떤 스타일을 사용할지, 정의(definition)를 선언하고 연결하는 방법, 다른 DI 프레임워크에서 마이그레이션하는 방법, Koin 오류를 진단하는 방법)을 알려줍니다. 이 스킬들은 GitHub의 [koin-skills 저장소](https://github.com/InsertKoinIO/koin-skills)에서 Koin 팀에 의해 유지 관리되며, Claude Code용 `koin` 플러그인 및 기타 에이전트를 위한 표준 에이전트 스킬로 제공됩니다. 이 페이지에서는 설치 방법과 각 스킬의 역할을 설명합니다.

## Claude Code에 설치하기 {id="install-in-claude-code"}

```
/plugin marketplace add InsertKoinIO/koin-skills
/plugin install koin@koin-skills
```

첫 번째 명령어는 Koin skills 저장소를 플러그인 마켓플레이스로 추가하고, 두 번째 명령어는 해당 마켓플레이스에서 `koin` 플러그인을 설치합니다. 나중에 업데이트하려면 `/plugin marketplace update koin-skills`를 실행하세요.

Kotlin, Android, Compose, KMP 또는 Ktor 프로젝트에서 의존성 주입과 관련된 작업을 수행할 때 스킬이 자동으로 로드됩니다. 스킬을 이름으로 직접 호출할 필요는 없습니다.

## 기타 에이전트에 설치하기 {id="install-in-other-agents"}

Cursor, Codex, Copilot, Windsurf, Gemini 및 에이전트 스킬을 지원하는 기타 에이전트의 경우, [skills](https://skills.sh) CLI(Node.js 22 이상)를 사용하세요:

```bash
npx skills add InsertKoinIO/koin-skills
```

이 명령어는 [koin-skills 저장소](https://github.com/InsertKoinIO/koin-skills)(전체 URL인 `https://github.com/InsertKoinIO/koin-skills`도 사용 가능)에서 스킬 목록을 읽어온 뒤 4가지 스킬을 나열하고, 지정한 에이전트에 대해 선택한 스킬을 설치합니다. 확인 메시지 없이 모두 설치하려면 `npx skills add InsertKoinIO/koin-skills --skill '*' -y`를 실행하세요. 각 [GitHub 릴리스](https://github.com/InsertKoinIO/koin-skills/releases)에는 스킬당 하나의 `.skill` 아카이브와 전체 플러그인이 포함된 `koin-plugin.zip` 파일도 첨부되어 있습니다.

## 스킬의 역할 {id="what-the-skills-do"}

| 스킬 | 용도 |
|---|---|
| `koin-setup` | 신규 또는 기존 프로젝트에 Koin을 추가하거나, 기존에 유지 중인 DI 컨테이너와 함께 추가 |
| `koin` | 프로젝트 스타일에 맞는 Koin 코드 작성: 정의(definitions), 모듈, 진입점, 스코프, 테스트 |
| `di-migration` | Hilt, Dagger, Toothpick, Kodein, Metro, Koin 3.x, Koin DSL 또는 Koin KSP에서 모듈 단위로 마이그레이션 |
| `koin-diagnose` | Koin 오류 및 비정상 종료(crash) 해결, 런타임 시 앱 동작 확인 |

이 스킬들은 본 문서의 규칙을 따릅니다. [생성자 주입(constructor injection)](/docs/reference/koin-core/dsl), Compiler Plugin DSL 또는 Koin Annotations를 사용하며, 새로운 코드에는 Koin KSP를 절대 사용하지 않습니다. 마이그레이션은 점진적으로 진행되며, 마지막 바인딩이 이전될 때까지 기존 컨테이너가 계속 실행됩니다.

## Kotzilla MCP 서버 {id="kotzilla-mcp-server"}

스킬은 [Kotzilla](https://kotzilla.io) MCP 서버를 사용하여 Koin 오류를 진단하고 런타임에서 정의(definition)가 어떻게 동작하는지(수명 주기, 스코프, 시작 비용 등)를 측정할 수 있습니다. 무료 Kotzilla 계정이 필요합니다. 스킬은 도움이 될 때 이를 제안하지만, 필수로 요구하지는 않습니다.

Claude Code에서는 `koin` 플러그인에 이 서버가 포함되어 있습니다. 로그인할 때까지는 비활성 상태로 유지됩니다. `/mcp`를 실행하고 `plugin:koin:kotzilla`를 선택한 후 로그인하세요. 다른 에이전트에서는 에이전트의 MCP 구성에 엔드포인트 `https://mcp.kotzilla.io/mcp`(HTTP 전송, OAuth)를 추가하세요.

## 제한 사항 {id="limits"}

- 이 스킬들은 Kotlin 2.3.20 이상 및 Koin 4.2.2 이상을 대상으로 합니다. 이전 버전의 Koin에서는 현재 설정대로 작동하며 업그레이드를 한 번 제안합니다.
- 스킬은 에이전트를 안내할 뿐 코드 리뷰를 대체하지 않습니다. 변경 사항을 병합하기 전에 직접 검토하세요.
- 런타임 검사(시작 시간, 메모리, 중복 생성된 인스턴스 등)를 수행하려면 앱에 Kotzilla SDK가 필요합니다. SDK가 없으면 스킬은 측정값이 아닌 코드를 기반으로 가능성 있는 원인을 제시합니다.

## 관련 문서 {id="related"}

- [Compiler Plugin 설정](/docs/setup/compiler-plugin): 스킬이 의존하는 빌드 타임 검사.
- [Koin vs Hilt](/docs/intro/koin-vs-hilt): Hilt에서 마이그레이션할 때 변경되는 사항.
- [모니터링](/docs/tooling/monitor): 런타임 검사를 지원하는 Kotzilla SDK.
- [GitHub의 Koin skills](https://github.com/InsertKoinIO/koin-skills): 소스 코드, 이슈 및 릴리스.