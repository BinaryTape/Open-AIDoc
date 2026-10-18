[//]: # (title: Kotlin AI skills)
[//]: # (description: Kotlin AI skills가 무엇인지, AI 에이전트에 어떻게 도움이 되는지, 사용 가능한 스킬을 어디서 찾을 수 있는지 알아보세요.)

Kotlin AI skills는 AI 에이전트가 Kotlin 관련 작업을 더욱 안정적으로 수행할 수 있도록 돕는 재사용 가능한 지침입니다.

스킬은 AI 에이전트가 작업을 실행하기 전에 필요한 컨텍스트를 제공합니다.
예를 들어, 스킬은 관련 API를 안내하거나 필수 구성 요소를 정의하고,
단계별 워크플로 가이드를 제공할 수 있습니다.

Kotlin AI skills를 사용하면 에이전트가 보다 정확한 결과를 생성하도록 도울 수 있으며, 작업을 직접 설명하는 데 드는 시간을 줄일 수 있습니다.
또한 팀 단위에서는 공통 작업에 대한 공유 프레임워크를 제공하여 모든 구성원이 일관된 결과를 얻을 수 있도록 지원합니다.

<a href="https://github.com/Kotlin/kotlin-agent-skills" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin AI skills 살펴보기</a>

Kotlin AI skills는 [Agent Skills 표준](https://agentskills.io/home)을 따르므로, [Junie](https://www.jetbrains.com/junie/), Claude Code, OpenAI Codex, Google Gemini, GitHub Copilot 등과 같이 호환되는 AI 에이전트와 함께 사용할 수 있습니다.

## AI 스킬 설정하기 {id="set-up-ai-skills"}

AI 스킬을 설정하고 사용하는 방법을 알아보세요:

* [터미널의 에이전트와 함께 사용](https://github.com/Kotlin/kotlin-agent-skills#installation)
* IDE에서 사용:
  * [IntelliJ IDEA](https://www.jetbrains.com/help/ai-assistant/agent-skills.html)
  * [Android Studio](https://developer.android.com/tools/agents/android-skills)

## 지원되는 워크플로 {id="supported-workflows"}

다양한 Kotlin 관련 시나리오에서 Kotlin AI skills를 활용할 수 있습니다. AI 스킬이 도움을 줄 수 있는 다양한 작업을 살펴보세요.

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-ai-skills">
    <panel>
        <title>Java 소스 파일을 Kotlin으로 변환</title>
        <p>기존 동작을 유지하고 Kotlin 특화 컨벤션을 적용하면서 Java 소스 파일을 관용적인(idiomatic) Kotlin으로 변환합니다.<br/>
        자세한 내용은 <a href="mixing-java-kotlin-intellij.md">튜토리얼</a>을 참조하세요.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-java-to-kotlin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-java-to-kotlin">AI 스킬</a>
    </panel>
    <panel>
        <title>멀티플랫폼 프로젝트를 AGP 9으로 마이그레이션</title>
        <p>Kotlin Multiplatform 프로젝트를 AGP 9으로 마이그레이션하고 AI 에이전트가 필요한 프로젝트 및 Gradle 구성 변경 사항을 적용할 수 있도록 합니다.<br/>
        자세한 내용은 <a href="https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html">가이드</a>를 참조하세요.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-agp9-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-agp9-migration">AI 스킬</a>
    </panel>
    <panel>
        <title>JPA 엔티티 매핑 설계</title>
        <p>식별자(identity), 관계, 제약 조건, 페칭(fetching) 및 일반적인 ORM 문제를 고려하여 Spring Data JPA 및 Hibernate를 위한 안정적인 Kotlin 엔티티를 설계합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-backend-jpa-entity-mapping" as="button" icon="arrow-right" icon-position="right" id="kotlin-backend-jpa-entity-mapping">AI 스킬</a>
    </panel>
    <panel>
        <title>CocoaPods에서 SwiftPM으로 마이그레이션</title>
        <p>Kotlin Multiplatform 프로젝트의 종속성을 CocoaPods에서 Swift Package Manager 종속성으로 마이그레이션합니다.<br/>
         자세한 내용은 <a href="https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html">가이드</a>를 참조하세요.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-cocoapods-spm-migration">AI 스킬</a>
    </panel>
    <panel>
        <title>불변 컬렉션(immutable collections) 0.5.x로 마이그레이션</title>
        <p>프로젝트를 <code>kotlinx.collections.immutable</code> 라이브러리의 <code>0.5.x</code> 버전으로 업데이트하고 지원 중단된 영속적(persistent) 컬렉션 연산을 대체합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-immutable-collections-0-5-x-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-immutable-collections-0-5-x-migration">AI 스킬</a>
    </panel>
    <panel>
        <title>Kotlin/Native 빌드 성능 개선</title>
        <p>느린 Kotlin/Native 및 iOS 빌드를 진단하고 컴파일, 링킹, 캐싱, 타깃 및 CI 구성에 대한 타깃별 변경 권장 사항을 확인합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-native-build-performance" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-native-build-performance">AI 스킬</a>
    </panel>
    <panel>
        <title>Gradle 프로젝트를 Kotlin Toolchain으로 마이그레이션</title>
        <p>Gradle 기반 Kotlin 프로젝트 전체를 구성, 플러그인, CI 워크플로를 포함하여 <a href="https://kotlin-toolchain.org/latest/">Kotlin Toolchain</a>으로 마이그레이션합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-project" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-project">AI 스킬</a>
    </panel>
    <panel>
        <title>Gradle 플러그인을 Kotlin Toolchain 플러그인으로 변환</title>
        <p>기존 Gradle 플러그인을 로컬 Kotlin Toolchain 플러그인으로 다시 구현합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-plugin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-plugin">AI 스킬</a>
    </panel>
    <panel>
        <title>Kotlin Toolchain으로 프로젝트 빌드</title>
        <p>Kotlin Toolchain을 사용하여 Kotlin 및 Java 프로젝트를 생성, 구성, 빌드, 테스트 및 패키징합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain">AI 스킬</a>
    </panel>
    <panel>
        <title>Kotlin Toolchain 플러그인 생성</title>
        <p>사용자 지정 빌드 작업, 코드 생성, 검증 또는 패키징을 위한 로컬 플러그인을 생성합니다.</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain-plugin-authoring" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain-plugin-authoring">AI 스킬</a>
    </panel>
</panels>

## 기여 및 피드백 공유 {id="contribute-and-share-feedback"}

Kotlin AI skills는 오픈 소스입니다. 사용 가능한 스킬을 테스트하고 [이슈를 리포트](https://github.com/Kotlin/kotlin-agent-skills/issues/new)하여 의견을 공유해 주세요.

새로운 스킬을 기여하거나 기존 스킬을 개선할 수도 있습니다. 자세한 내용은 [기여 가이드라인](https://github.com/Kotlin/kotlin-agent-skills/blob/main/CONTRIBUTING.md)을 참조하세요.

## 지원 받기 {id="get-support"}

질문이 있거나 문제가 발생하면 ![Slack](slack.svg){width=25}{type="joined"} Slack에서 도움을 요청하세요. [초대 받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 링크를 통해 참여한 후 `#ai` 채널에서 경험을 공유할 수 있습니다.