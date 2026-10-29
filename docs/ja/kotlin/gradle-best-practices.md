[//]: # (title: Gradle のベストプラクティス)

[Gradle](https://docs.gradle.org/current/userguide/userguide.html) は、多くの Kotlin プロジェクトでビルドプロセスの自動化と管理に使用されているビルドシステムです。

Gradle を最大限に活用することは、ビルドの管理や待機時間を減らし、コーディングにより多くの時間を割くために不可欠です。ここでは、プロジェクトの **「整理 (organizing)」** と **「最適化 (optimizing)」** という 2 つの主要な領域に分けたベストプラクティスを紹介します。

## 整理 (Organize) {id="organize"}

このセクションでは、明快さ、保守性、拡張性を向上させるための Gradle プロジェクトの構造化に焦点を当てます。

### Kotlin DSL の使用 {id="use-kotlin-dsl"}

従来の Groovy DSL の代わりに Kotlin DSL を使用してください。別の言語を学習する必要がなくなり、厳密な型付け (strict typing) の恩恵を受けることができます。厳密な型付けにより、IDE はリファクタリングや自動補完のより優れたサポートを提供できるため、開発がより効率的になります。

詳細は、Gradle の [Kotlin DSL 入門](https://docs.gradle.org/current/userguide/kotlin_dsl.html) を参照してください。

Kotlin DSL が Gradle ビルドのデフォルトになったことについては、Gradle の [ブログ](https://blog.gradle.org/kotlin-dsl-is-now-the-default-for-new-gradle-builds) をお読みください。

### バージョンカタログの使用 {id="use-a-version-catalog"}

依存関係の管理を一元化するために、`libs.versions.toml` ファイルでバージョンカタログを使用してください。これにより、プロジェクト全体でバージョン、ライブラリ、プラグインを一貫して定義および再利用できるようになります。

```toml
[versions]
kotlinxCoroutines = "%coroutinesVersion%"

[libraries]
kotlinxCoroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinxCoroutines" }
```

`build.gradle.kts` ファイルに以下の依存関係を追加して使用します：

```kotlin
dependencies {
    implementation(libs.kotlinxCoroutines)
}
```

詳細は、Gradle ドキュメントの [依存関係管理の基本 (Dependency management basics)](https://docs.gradle.org/current/userguide/dependency_management_basics.html#version_catalog) を参照してください。

### コンベンションプラグインの使用 {id="use-convention-plugins"}

<primary-label ref="advanced"/>

コンベンションプラグインを使用して、共通のビルドロジックをカプセル化し、複数のビルドファイルで再利用できるようにします。共有設定をプラグインに移動することで、ビルドスクリプトを簡素化し、モジュール化できます。

初期設定には時間がかかるかもしれませんが、一度完了すれば、新しいビルドロジックの保守や追加が容易になります。

詳細は、Gradle ドキュメントの [コンベンションプラグイン (Convention plugins)](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins) を参照してください。

## 最適化 (Optimize) {id="optimize"}

このセクションでは、Gradle ビルドのパフォーマンスと効率を高めるための戦略を提供します。

### ローカルビルドキャッシュの使用 {id="use-local-build-cache"}

ローカルビルドキャッシュを使用して、他のビルドで生成された出力を再利用することで時間を節約します。ビルドキャッシュは、以前に作成した任意のビルドから出力を取得できます。

詳細は、Gradle ドキュメントの [ビルドキャッシュ (Build cache)](https://docs.gradle.org/current/userguide/build_cache.html) を参照してください。

### 設定キャッシュの使用 {id="use-configuration-cache"}

> 設定キャッシュ (configuration cache) は、まだすべてのコア Gradle プラグインをサポートしているわけではありません。最新情報については、Gradle の [サポートされているプラグインの表](https://docs.gradle.org/current/userguide/configuration_cache_status.html#config_cache:plugins:core) を参照してください。
>
{style="note"}

設定キャッシュを使用して、設定フェーズの結果をキャッシュし、その後のビルドで再利用することで、ビルドパフォーマンスを大幅に向上させます。Gradle がビルド設定や関連する依存関係に変更がないことを検出した場合、設定フェーズをスキップします。

設定キャッシュは、単一プロジェクト内での独立したタスクの並列実行も可能にし、ビルドパフォーマンスをさらに向上させることができます。さらに、`org.gradle.parallel` プロパティを暗黙的に有効にし、異なるプロジェクト間のタスクを [並列実行](https://docs.gradle.org/current/userguide/performance.html#sec:enable_parallel_execution) できるようにします。

設定キャッシュの詳細については、[Gradle のドキュメント](https://docs.gradle.org/current/userguide/configuration_cache.html) を参照してください。

### マルチターゲットのビルド時間の改善 {id="improve-build-times-for-multiple-targets"}

マルチプラットフォームプロジェクトに複数のターゲットが含まれている場合、`build` や `assemble` などのタスクがターゲットごとに同じコードを複数回コンパイルし、コンパイル時間が長くなることがあります。

特定のプラットフォームをアクティブに開発およびテストしている場合は、代わりに対応する `linkDebug*` タスクを実行してください。

詳細については、 [コンパイル時間を改善するためのヒント](native-improving-compilation-time.md#gradle-configuration) を参照してください。

### kapt から KSP への移行 {id="migrate-from-kapt-to-ksp"}

[kapt](kapt.md) コンパイラプラグインに依存しているライブラリを使用している場合は、代わりに [Kotlin Symbol Processing (KSP) API](ksp-overview.md) の使用に切り替えられるか確認してください。KSP API は、アノテーション処理時間を短縮することでビルドパフォーマンスを向上させます。KSP は、中間的な Java スタブを生成せずにソースコードを直接処理するため、kapt よりも高速で効率的です。

移行手順のガイダンスについては、[移行ガイド](ksp-kapt-migration.md) を参照してください。

### モジュール化の使用 {id="use-modularization"}

<primary-label ref="advanced"/>

> モジュール化の恩恵を受けられるのは、中規模から大規模のプロジェクトのみです。マイクロサービスアーキテクチャに基づいたプロジェクトには利点はありません。
>
{style="note"}

モジュール化されたプロジェクト構造を使用して、ビルド速度を向上させ、並列開発を容易にします。プロジェクトを 1 つのルートプロジェクトと 1 つ以上のサブプロジェクトに構造化します。変更が 1 つのサブプロジェクトのみに影響する場合、Gradle はその特定のサブプロジェクトのみを再ビルドします。

```none
.
└── root-project/
    ├── settings.gradle.kts
    ├── app subproject/
    │   └── build.gradle.kts
    └── lib subproject/
        └── build.gradle.kts
```

詳細は、Gradle ドキュメントの [Gradle によるプロジェクトの構造化](https://docs.gradle.org/current/userguide/multi_project_builds.html) を参照してください。

### CI/CD のセットアップ {id="set-up-ci-cd"}
<primary-label ref="advanced"/>

増分ビルド (incremental builds) と依存関係のキャッシュを使用して、ビルド時間を大幅に短縮するために CI/CD プロセスをセットアップします。これらの利点を得るには、永続ストレージを追加するか、リモートビルドキャッシュを使用してください。このプロセスは、[GitHub](https://github.com/features/actions) などの一部のプロバイダーがほぼそのまま利用できるサービスを提供しているため、それほど時間はかかりません。

Gradle コミュニティのクックブックにある [継続的インテグレーション (CI) システムでの Gradle の使用](https://cookbook.gradle.org/ci/) を参照してください。

### リモートビルドキャッシュの使用 {id="use-remote-build-cache"}
<primary-label ref="advanced"/>

[ローカルビルドキャッシュ](#use-local-build-cache) と同様に、リモートビルドキャッシュは他のビルドからの出力を再利用することで時間を節約するのに役立ちます。直前のビルドだけでなく、誰かが実行した以前の任意のビルドからタスク出力を取得できます。

リモートビルドキャッシュは、キャッシュサーバーを使用してビルド間でタスク出力を共有します。例えば、CI/CD サーバーがある開発環境では、サーバー上のすべてのビルドがリモートキャッシュにデータを蓄積します。新しい機能を開始するためにメインブランチをチェックアウトすると、すぐに増分ビルドの恩恵を受けることができます。

ただし、インターネット接続が遅い場合、キャッシュされた結果の転送が、ローカルでタスクを実行するよりも遅くなる可能性があることに注意してください。

詳細は、Gradle ドキュメントの [ビルドキャッシュ (Build cache)](https://docs.gradle.org/current/userguide/build_cache.html) を参照してください。