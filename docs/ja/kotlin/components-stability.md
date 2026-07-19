[//]: # (title: Kotlinコンポーネントの安定性)

Kotlin言語とツールセットは、JVM、JS、Nativeターゲット向けのコンパイラ、標準ライブラリ（Standard Library）、さまざまな付随ツールなど、多くのコンポーネントに分かれています。
これらのコンポーネントの多くは**Stable（安定版）**として公式にリリースされています。これは、[「スムーズなアップデート（Comfortable Updates）」と「言語を最新の状態に保つ（Keeping the Language Modern）」の原則](kotlin-evolution-principles.md)に従い、後方互換性を保ちながら進化してきたことを意味します。

「フィードバックループ（Feedback Loop）」の原則に従い、コミュニティが試用できるように多くの機能を早期にリリースしているため、一部のコンポーネントはまだ**Stable**としてリリースされていません。
それらの中には、非常に初期段階のものもあれば、成熟が進んでいるものもあります。
各コンポーネントの進化の速さと、採用する際にユーザーが負うリスクのレベルに応じて、それらを **Experimental（実験的）**、**Alpha（アルファ）**、または **Beta（ベータ）** としてマークしています。

## 安定性レベルの解説

各安定性レベルとその意味についてのクイックガイドは以下の通りです。

**Experimental** は「おもちゃのプロジェクト（toy projects）でのみ試してください」を意味します：
* 私たちはアイデアとその実現可能性をテストしている段階です。一部のユーザーに実際に試してもらい、フィードバックを共有してほしいと考えています。スコープは最小限であり、機能はいつでも変更または削除される可能性があります。安定性や互換性は保証されません。

**Alpha** は「製品化の準備が整うかどうかをテストしている」ことを意味します：
* 私たちはこれを製品にする意向があり、最終的な形を決定するためにユーザー価値とマーケットフィット（市場適合性）を検証しています。機能セットはまだ不完全であり、破壊的な変更が予想されます。もし仮説が正しくないことが判明した場合、機能を大幅に変更したり、中止したりする可能性があります。

**Beta** は「使用可能です。移行に伴う問題が最小限になるよう最善を尽くします」を意味します：
* ほぼ完成しており、ユーザーからのフィードバックが特に重要な時期です。
* ただし、100%完成しているわけではないため、（ユーザーからのフィードバックに基づくものを含め）変更の可能性があります。
* 最高のアップデート体験を得るために、事前に出される非推奨（deprecation）警告に注意してください。

私たちは、*Experimental*、*Alpha*、*Beta* を総称して **pre-stable（安定前）** レベルと呼んでいます。

<a name="stable"/>

**Stable** は「最も保守的なシナリオでも使用してください」を意味します：
* 完成しています。私たちは、厳格な[後方互換性ルール](https://kotlinfoundation.org/language-committee-guidelines/)に従って進化させていきます。

安定性レベルは、そのコンポーネントがどれくらい早く Stable としてリリースされるかについては何も示していません。同様に、リリースまでにコンポーネントがどれほど変更されるかを示すものでもありません。それらは単に、コンポーネントがどれほど速く変化しているか、およびユーザーがアップデートに関する問題のリスクをどれほど負っているかを示すものです。

## KotlinコンポーネントのGitHubバッジ

[Kotlin GitHub organization](https://github.com/Kotlin) には、さまざまなKotlin関連プロジェクトがあります。
私たちがフルタイムで開発しているものもあれば、サイドプロジェクトとして開発しているものもあります。

各Kotlinプロジェクトには、その安定性とサポート状況を示す2つのGitHubバッジがあります：

* **Stability（安定性）** ステータス。これは、各プロジェクトがどれほど速く進化しているか、およびユーザーがそれを採用する際にどれほどのリスクを負っているかを示します。
  この安定性ステータスは、[Kotlin言語機能およびそのコンポーネントの安定性レベル](#安定性レベルの解説)と完全に一致します：
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} は **Experimental** を表します。
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} は **Alpha** を表します。
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} は **Beta** を表します。
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} は **Stable** を表します。

* **Support（サポート）** ステータス。これは、プロジェクトの保守とユーザーの問題解決に対する私たちのコミットメントを示します。
  サポートのレベルは、すべてのJetBrains製品で統一されています。  
  [詳細は JetBrains Open Source ドキュメントを参照してください](https://github.com/JetBrains#jetbrains-on-github)。

## サブコンポーネントの安定性

安定した（Stable）コンポーネントが、実験的な（Experimental）サブコンポーネントを持つ場合があります。例：
* 安定したコンパイラが実験的な機能を持っている。
* 安定したAPIに実験的なクラスや関数が含まれている。
* 安定したコマンドラインツールに実験的なオプションがある。

私たちは、どのサブコンポーネントが **Stable** ではないかを正確にドキュメント化するようにしています。
また、可能な限りユーザーに警告し、明示的なオプトインを求めることで、安定版としてリリースされていない機能を誤って使用してしまうことを避けるよう最善を尽くしています。

## Kotlinコンポーネントの現在の安定性

> デフォルトでは、すべての新しいコンポーネントは Experimental ステータスを持ちます。
>
{style="note"}

### Kotlinコンパイラ

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|---------------------------------------------------------------------|------------|--------------------------|--------------|
| Kotlin/JVM                                                          | Stable     | 1.0.0                    |              |
| Kotlin/Native                                                       | Stable     | 1.9.0                    |              |
| Kotlin/JS                                                           | Stable     | 1.3.0                    |              |
| Kotlin/Wasm                                                         | Beta       | 2.2.20                   |              |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable     |                          |              |

### 主要なコンパイラプラグイン

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|--------------------------------------------------|--------------|--------------------------|--------------|
| [All-open](all-open-plugin.md)                   | Stable       | 1.3.0                    |              |
| [No-arg](no-arg-plugin.md)                       | Stable       | 1.3.0                    |              |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable       | 1.3.0                    |              |
| [kapt](kapt.md)                                  | Stable       | 1.3.0                    |              |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20                   |              |
| [Power-assert](power-assert.md)                  | Experimental | 2.0.0                    |              |

### Kotlinライブラリ

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|-------------------------------|------------|--------------------------|--------------|
| kotlin-stdlib (JVM)           | Stable     | 1.0.0                    |              |
| kotlinx-coroutines            | Stable     | 1.3.0                    |              |
| kotlinx-serialization         | Stable     | 1.0.0                    |              |
| kotlin-metadata-jvm           | Stable     | 2.0.0                    |              |
| kotlin-reflect (JVM)          | Beta       | 1.0.0                    |              |
| kotlinx-datetime              | Alpha      | 0.2.0                    |              |
| kotlinx-io                    | Alpha      | 0.2.0                    |              |
| kotlinx-collections-immutable | Alpha      | 0.3.5                    |              |

### Kotlinマルチプラットフォーム

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|------------------------------------------------|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform                           | Stable     | 1.9.20                   |                                                                                                                                      |
| Kotlin Multiplatform plugin for Android Studio | Beta       | 0.8.0                    | [言語とは別にバージョン管理されています](https://kotlinlang.org/docs/multiplatform/multiplatform-plugin-releases.html) |

### Kotlin/Native

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|----------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native Runtime                        | Stable     | 1.9.20                   |                                                                                                                               |
| Kotlin/Native interop with C and Objective-C | Beta       | 1.3.0                    | [CおよびObjective-Cライブラリのインポートの安定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| klibバイナリ                                 | Stable     | 1.9.20                   | cinterop klibは含まれません。以下を参照してください。 |
| cinterop klibバイナリ                        | Beta       | 1.3.0                    | [CおよびObjective-Cライブラリのインポートの安定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| CocoaPodsインテグレーション                  | Stable     | 1.9.20                   |                                                                                                                               |

さまざまなターゲットのサポートレベルの詳細については、[](native-target-support.md) を参照してください。

### ビルドツール

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|-----------------------------------------------------|------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle プラグイン](gradle-configure-project.md) | Stable     | 1.1.1                    | [Kotlin Multiplatform Gradle プラグイン](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version) は Kotlin 1.9.20 から安定しています。 |
| [Kotlin Maven プラグイン](maven-configure-project.md)   | Stable     | 1.0.0                    |                                                                                                                       |

### 言語ツール

| **コンポーネント** | **ステータス** | **バージョン以降のステータス** | **コメント** |
|---------------------------------------|--------------|--------------------------|------------------------------------------------|
| スクリプティングの構文とセマンティクス | Alpha        | 1.2.0                    |                                                |
| スクリプティングの埋め込みおよび拡張API | Beta         | 1.5.0                    |                                                |
| スクリプティングのIDEサポート         | Beta         |                          | IntelliJ IDEA 2023.1 以降で使用可能 |
| CLI スクリプティング                  | Alpha        | 1.2.0                    |                                                |

## 言語機能と設計提案

言語機能と新しい設計提案については、[](kotlin-language-features-and-proposals.md) を参照してください。