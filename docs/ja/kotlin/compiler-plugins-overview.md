[//]: # (title: コンパイラープラグイン)

<snippet id="compiler-plugin-description">
コンパイラープラグインは、コンパイラー自体を変更することなく、コンパイル中のコードを解析または変更するためにコンパイルプロセスにフックします。例えば、コードにアノテーションを付加したり、他のフレームワークやAPIとの互換性を持たせるために新しいコードを生成したりできます。
</snippet>

このページでは、利用可能なKotlinコンパイラープラグインと、ユースケースに合うものがない場合の対処方法について説明します。

Kotlinチームは以下のコンパイラープラグインを保守・管理しています：

| プラグイン | 説明 |
|---|---|
| [All-open](all-open-plugin.md) | アノテーションが付与されたクラスとそのメンバーを自動的に `open` にし、フレームワークが実行時にそれらを拡張できるようにします。 |
| [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu) | アトミック操作を、ロックフリーな並行処理のための効率的かつプラットフォーム固有の実装へと変換します。 |
| [DataFrame](https://kotlin.github.io/dataframe/compiler-plugin.html) | 型安全かつKotlinフレンドリーな方法で [`DataFrame`](https://kotlin.github.io/dataframe/home.html) を操作できるようにする型付きAPIを生成します。 |
| [JPA](kotlin-jpa-plugin.md) | JPAアノテーションが付与されたエンティティを `open` にし、引数なしコンストラクターを生成します。`all-open` と `no-arg` のラッパーです。 |
| [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects) | JSのツールやライブラリとの相互運用性を向上させるため、KotlinクラスをプレーンなJavaScriptオブジェクトとして公開します。 |
| [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen) | Application Binary Interface (ABI) JARを生成します。 |
| [kapt](kapt.md) | Kotlinコードに対してJavaアノテーションプロセッサーを実行し、追加のソースファイルを生成します。 |
| [Lombok](lombok.md) | Javaソース内のLombokアノテーションによって生成されたコードを、Kotlinコードが理解して利用できるようにします。 |
| [`no-arg`](no-arg-plugin.md) | 引数なしコンストラクターを必要とするフレームワークをサポートするため、アノテーションが付与されたクラスに引数なしコンストラクターを生成します。 |
| [Power-assert](power-assert.md) | 式の各部分の詳細な値を表示することで、アサーション失敗時の情報を強化します。 |
| [SAM with receiver](sam-with-receiver-plugin.md) | SAMインターフェースでレシーバー付きラムダを使用できるようにし、よりDSLらしい構文を実現します。 |
| [Serialization](serialization.md) | リフレクションを使わずにKotlinオブジェクトをシリアライズおよびデシリアライズするコードを生成します。 |
| [Spring](kotlin-spring-plugin.md) | Springのアノテーションが付与されたクラスとメンバーを `open` にします。あらかじめ設定された `all-open` のラッパーです。 |

GoogleのAndroidチームは以下を保守・管理しています：

| プラグイン | 説明 |
|---|---|
| [Compose compiler Gradle plugin](https://developer.android.com/develop/ui/compose/compiler) | ComposeコンパイラーをGradleと統合し、宣言型UI機能とCompose固有の最適化を有効にします。 |
| [Parcelize plugin](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize) | Androidコンポーネント間でKotlinオブジェクトを受け渡しできるように、`Parcelable` の実装を自動生成します。 |

これらのプラグインでカバーされていない方法でコンパイルプロセスを適応させる必要がある場合は、まず [Kotlin Symbol Processing (KSP) API](https://kotlinlang.org/docs/ksp-overview.html) や [Android lint](https://developer.android.com/studio/write/lint) などの外部リンターを使用できるかどうかを確認してください。[Kotlin Slack](https://slack-chats.kotlinlang.org/c/compiler) を閲覧したり、[参加して](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)ご自身のユースケースについてアドバイスを求めたりすることもできます。

_それでも_必要なものが見つからない場合は、[カスタムコンパイラープラグインを作成](custom-compiler-plugins.md)できます。ただし、KotlinコンパイラープラグインのAPIは**不安定（unstable）**であるため、このアプローチは最後の手段としてのみ使用してください。カスタムコンパイラープラグインを作成する場合、コンパイラーの新しいリリースごとに破壊的変更が導入されるため、継続的なメンテナンスに多大な労力を費やす必要があります。