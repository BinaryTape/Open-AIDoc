[//]: # (title: Kotlin AIスキル)
<web-summary>Kotlin AIスキルの概要、AIエージェントをどのように支援するか、および利用可能なスキルの探し方について学びます。</web-summary>

Kotlin AIスキルは、AIエージェントがKotlin特有のタスクをより信頼性高く実行できるように支援する、再利用可能な指示（インストラクション）です。

スキルは、AIエージェントがタスクの実行を開始する前に必要なコンテキストを提供します。
例えば、スキルによって関連するAPIを示したり、前提条件を定義したり、
段階的なワークフローのガイダンスを提供したりできます。

Kotlin AIスキルは、エージェントがより正確な結果を生成するのを助け、開発者自身がタスクを説明する時間を削減します。
チームにとっては、一般的なタスクに対する共有フレームワークも提供されるため、誰もが一貫した結果を得られるようになります。

<a href="https://github.com/Kotlin/kotlin-agent-skills" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin AIスキルを見る</a>

Kotlin AIスキルは[Agent Skills標準](https://agentskills.io/home)に準拠しているため、[Junie](https://www.jetbrains.com/junie/)、Claude Code、OpenAI Codex、Google Gemini、GitHub Copilotなどの互換性のあるAIエージェントで使用できます。

## AIスキルのセットアップ {id="set-up-ai-skills"}

AIスキルのセットアップと使用方法について学びます:

* [ターミナルのエージェントで使用する場合](https://github.com/Kotlin/kotlin-agent-skills#installation)
* IDEで使用する場合:
  * [IntelliJ IDEA](https://www.jetbrains.com/help/ai-assistant/agent-skills.html)
  * [Android Studio](https://developer.android.com/tools/agents/android-skills)

## サポートされているワークフロー {id="supported-workflows"}

Kotlin特有のさまざまなシナリオでKotlin AIスキルを使用できます。AIスキルが支援できるさまざまなタスクを確認してください。

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-ai-skills">
    <panel>
        <title>JavaソースファイルをKotlinに変換</title>
        <p>動作を維持し、Kotlin特有の規約を適用しながら、Javaソースファイルを慣用的なKotlinに変換します。<br/>
        詳細は<a href="mixing-java-kotlin-intellij.md">チュートリアル</a>をご覧ください。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-java-to-kotlin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-java-to-kotlin">AIスキル</a>
    </panel>
    <panel>
        <title>マルチプラットフォームプロジェクトをAGP 9に移行</title>
        <p>Kotlin MultiplatformプロジェクトをAGP 9に移行し、AIエージェントが必要なプロジェクトおよびGradle設定の変更を適用できるようにします。<br/>
        詳細は<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html">ガイド</a>をご覧ください。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-agp9-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-agp9-migration">AIスキル</a>
    </panel>
    <panel>
        <title>JPAエンティティマッピングの設計</title>
        <p>識別子、リレーション、制約、フェッチ、一般的なORMの落とし穴を含め、Spring Data JPAおよびHibernate向けの信頼性の高いKotlinエンティティを設計します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-backend-jpa-entity-mapping" as="button" icon="arrow-right" icon-position="right" id="kotlin-backend-jpa-entity-mapping">AIスキル</a>
    </panel>
    <panel>
        <title>CocoaPodsからSwiftPMへの移行</title>
        <p>Kotlin Multiplatformプロジェクトの依存関係をCocoaPodsからSwift Package Managerに移行します。<br/>
         詳細は<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html">ガイド</a>をご覧ください。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-cocoapods-spm-migration">AIスキル</a>
    </panel>
    <panel>
        <title>immutable collections 0.5.xへの移行</title>
        <p>プロジェクトを<code>kotlinx.collections.immutable</code>ライブラリのバージョン<code>0.5.x</code>に更新し、非推奨となった永続コレクション操作を置き換えます。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-immutable-collections-0-5-x-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-immutable-collections-0-5-x-migration">AIスキル</a>
    </panel>
    <panel>
        <title>Kotlin/Nativeのビルドパフォーマンスを改善</title>
        <p>低速なKotlin/NativeおよびiOSビルドを診断し、コンパイル、リンク、キャッシュ、ターゲット、CI設定に関する的確な変更の推奨事項を取得します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-native-build-performance" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-native-build-performance">AIスキル</a>
    </panel>
    <panel>
        <title>GradleプロジェクトをKotlin Toolchainに移行</title>
        <p>設定、プラグイン、CIワークフローを含め、GradleベースのKotlinプロジェクト全体を<a href="https://kotlin-toolchain.org/latest/">Kotlin Toolchain</a>に移行します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-project" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-project">AIスキル</a>
    </panel>
    <panel>
        <title>GradleプラグインをKotlin Toolchainプラグインに変換</title>
        <p>既存のGradleプラグインをローカルのKotlin Toolchainプラグインとして再実装します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-plugin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-plugin">AIスキル</a>
    </panel>
    <panel>
        <title>Kotlin Toolchainでプロジェクトをビルド</title>
        <p>Kotlin Toolchainを使用して、KotlinおよびJavaプロジェクトの作成、設定、ビルド、テスト、パッケージ化を行います。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain">AIスキル</a>
    </panel>
    <panel>
        <title>Kotlin Toolchainプラグインを作成</title>
        <p>カスタムビルドタスク、コード生成、検証、またはパッケージ化のためのローカルプラグインを作成します。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain-plugin-authoring" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain-plugin-authoring">AIスキル</a>
    </panel>
</panels>

## コントリビューションとフィードバックの共有 {id="contribute-and-share-feedback"}

Kotlin AIスキルはオープンソースです。利用可能なスキルを試してみて、[課題を報告する](https://github.com/Kotlin/kotlin-agent-skills/issues/new)ことでフィードバックを共有してください。

新しいスキルを提供したり、既存のスキルを改善したりすることも可能です。詳細については、[コントリビューションガイドライン](https://github.com/Kotlin/kotlin-agent-skills/blob/main/CONTRIBUTING.md)をご覧ください。

## サポートを受ける {id="get-support"}

質問がある場合や問題が発生した場合は、![Slack](slack.svg){width=25}{type="joined"} Slackで支援を求めてください。[招待を受け取り](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)、`#ai`チャンネルで体験を共有してください。