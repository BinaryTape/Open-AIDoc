[//]: # (title: Kotlin AI skills)
[//]: # (description: Kotlin AI skills とは何か、AI エージェントにどのように役立つか、利用可能なスキルの探し方について学びます。)

Kotlin AI skills は、AI エージェントが Kotlin 固有のタスクをより確実に実行できるように支援する、再利用可能な指示（インストラクション）です。

スキルは、AI エージェントがタスクの実行を開始する前に必要なコンテキストを提供します。
例えば、スキルによって関連する API を指定したり、前提条件を定義したり、段階的なワークフローガイダンスを提供したりできます。

Kotlin AI skills を使用することで、エージェントはより正確な結果を生成できるようになり、タスクの内容を自分自身で説明する時間を削減できます。
チームにおいては、スキルが一般的なタスクに対する共有フレームワークとしても機能するため、全員が一貫した結果を得られるようになります。

<a href="https://github.com/Kotlin/kotlin-agent-skills" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin AI skills を探索する</a>

Kotlin AI skills は [Agent Skills standard](https://agentskills.io/home) に準拠しているため、[Junie](https://www.jetbrains.com/junie/)、Claude Code、OpenAI Codex、Google Gemini、GitHub Copilot などの互換性のある AI エージェントで使用できます。

## AI スキルのセットアップ {id="set-up-ai-skills"}

AI スキルのセットアップ方法と使用方法について説明します。

* [ターミナルのエージェントで使用する](https://github.com/Kotlin/kotlin-agent-skills#installation)
* IDE で使用する:
  * [IntelliJ IDEA](https://www.jetbrains.com/help/ai-assistant/agent-skills.html)
  * [Android Studio](https://developer.android.com/tools/agents/android-skills)

## サポートされているワークフロー {id="supported-workflows"}

Kotlin AI skills は、Kotlin 特有のさまざまなシナリオで使用できます。AI スキルが支援できるさまざまなタスクを確認してください。

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-ai-skills">
    <panel>
        <title>Java ソースファイルを Kotlin に変換</title>
        <p>動作を維持し、Kotlin 固有の規約を適用しながら、Java ソースファイルをイディオマティックな Kotlin に変換します。<br/>
        詳細については、<a href="mixing-java-kotlin-intellij.md">チュートリアル</a>を参照してください。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-java-to-kotlin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-java-to-kotlin">AI skill</a>
    </panel>
    <panel>
        <title>マルチプラットフォームプロジェクトを AGP 9 に移行</title>
        <p>Kotlin Multiplatform プロジェクトを AGP 9 に移行し、AI エージェントに必要なプロジェクトおよび Gradle 設定の変更を適用させます。<br/>
        詳細については、<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html">ガイド</a>を参照してください。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-agp9-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-agp9-migration">AI skill</a>
    </panel>
    <panel>
        <title>JPA エンティティマッピングの設計</title>
        <p>識別子（identity）、リレーションシップ、制約、フェッチ、一般的な ORM の落とし穴などを含め、Spring Data JPA および Hibernate 向けの信頼性の高い Kotlin エンティティを設計します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-backend-jpa-entity-mapping" as="button" icon="arrow-right" icon-position="right" id="kotlin-backend-jpa-entity-mapping">AI skill</a>
    </panel>
    <panel>
        <title>CocoaPods から SwiftPM への移行</title>
        <p>Kotlin Multiplatform プロジェクトを CocoaPods の依存関係から Swift Package Manager の依存関係へと移行します。<br/>
         詳細については、<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html">ガイド</a>を参照してください。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-cocoapods-spm-migration">AI skill</a>
    </panel>
    <panel>
        <title>immutable collections 0.5.x への移行</title>
        <p>プロジェクトを <code>kotlinx.collections.immutable</code> ライブラリのバージョン <code>0.5.x</code> にアップデートし、非推奨となった永続コレクション操作を置き換えます。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-immutable-collections-0-5-x-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-immutable-collections-0-5-x-migration">AI skill</a>
    </panel>
    <panel>
        <title>Kotlin/Native のビルドパフォーマンスを改善</title>
        <p>Kotlin/Native および iOS の遅いビルドを診断し、コンパイル、リンク、キャッシュ、ターゲット、CI 設定に対する的を絞った変更の提案を取得します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-native-build-performance" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-native-build-performance">AI skill</a>
    </panel>
    <panel>
        <title>Gradle プロジェクトを Kotlin Toolchain に移行</title>
        <p>設定、プラグイン、CI ワークフローを含め、Gradle ベースの Kotlin プロジェクト全体を <a href="https://kotlin-toolchain.org/latest/">Kotlin Toolchain</a> に移行します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-project" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-project">AI skill</a>
    </panel>
    <panel>
        <title>Gradle プラグインを Kotlin Toolchain プラグインに変換</title>
        <p>既存の Gradle プラグインをローカルの Kotlin Toolchain プラグインとして再実装します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-plugin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-plugin">AI skill</a>
    </panel>
    <panel>
        <title>Kotlin Toolchain でプロジェクトをビルド</title>
        <p>Kotlin Toolchain を使用して、Kotlin および Java プロジェクトの作成、設定、ビルド、テスト、パッケージ化を行います。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain">AI skill</a>
    </panel>
    <panel>
        <title>Kotlin Toolchain プラグインを作成</title>
        <p>カスタムビルドタスク、コード生成、検証、またはパッケージ化用のローカルプラグインを作成します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain-plugin-authoring" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain-plugin-authoring">AI skill</a>
    </panel>
</panels>

## コントリビュートとフィードバックの共有 {id="contribute-and-share-feedback"}

Kotlin AI skills はオープンソースです。利用可能なスキルをテストし、[Issue の報告](https://github.com/Kotlin/kotlin-agent-skills/issues/new)を通じてフィードバックを共有してください。

また、新しいスキルのコントリビュートや既存のスキルの改善も行えます。詳細については、[コントリビューションガイドライン](https://github.com/Kotlin/kotlin-agent-skills/blob/main/CONTRIBUTING.md)を参照してください。

## サポートを受ける {id="get-support"}

質問がある場合や問題が発生した場合は、![Slack](slack.svg){width=25}{type="joined"} Slack でサポートを求めてください: [招待を受ける](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)
そして `#ai` チャンネルで体験を共有してください。