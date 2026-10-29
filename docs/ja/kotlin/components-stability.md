[//]: # (title: Kotlin コンポーネントの安定性)

Kotlin 言語およびツールセットは、JVM、JS、Native ターゲット向けのコンパイラ、標準ライブラリ、各種付属ツールなど、多くのコンポーネントに分かれています。
これらのコンポーネントの多くは **Stable**（安定版）として公式にリリースされており、[「快適なアップデート（_Comfortable Updates_）」および「言語のモダン性の維持（_Keeping the Language Modern_）」の原則](kotlin-evolution-principles.md)に従って後方互換性を保ちながら進化してきました。

私たちは「フィードバックループ（_Feedback Loop_）」の原則に基づき、コミュニティに試してもらうために多くの機能を早い段階でリリースしているため、まだ **Stable** としてリリースされていないコンポーネントも多数存在します。
それらの一部はごく初期の段階にあり、一部はより成熟しています。
各コンポーネントが進化する速度や、ユーザーが導入する際のリスクレベルに応じて、それらを **Experimental**（実験的）、**Alpha**、または **Beta** としてマークしています。

## 各安定性レベルの説明 {id="stability-levels-explained"}

これらの安定性レベルとその意味についてのクイックガイドです：

**Experimental**（実験的）は「トイプロジェクトでのみ試してください」を意味します：
* アイデアとその実現可能性をテストしている段階です。一部のユーザーに試してもらい、フィードバックを共有してほしいと考えています。
  対象範囲は最小限であり、機能はいつでも変更または削除される可能性があります。安定性や互換性は保証されません。

**Alpha** は「これを本番環境に対応させるべきかどうかをテストしています」を意味します：
* これを製品化する意図があり、最終的な形を整えるためにユーザー価値とマーケットフィットを検証しています。
  機能セットはまだ不完全であり、破壊的変更（breaking changes）が予想されます。仮説が成り立たない場合、機能を大幅に変更または中止する可能性があります。

**Beta** は「使用可能であり、移行に関する問題を最小限に抑えるよう最善を尽くします」を意味します：
* ほぼ完成しており、現在はユーザーフィードバックが特に重要です。
* ただし、100% 完成しているわけではないため、変更（ユーザーからのフィードバックに基づくものを含む）が生じる可能性があります。
* 最良のアップデート体験を得るために、非推奨（deprecation）の警告を事前に確認してください。

これら _Experimental_、_Alpha_、_Beta_ を総称して、**プレスタブル（pre-stable）** レベルと呼びます。

<a name="stable"/>

**Stable**（安定版）は「最も保守的なシナリオでも使用できます」を意味します：
* 完成しています。厳格な[後方互換性ルール](https://kotlinfoundation.org/language-committee-guidelines/)に従って進化していきます。

なお、安定性レベルは、コンポーネントがどれくらい早く Stable としてリリースされるかを示すものではありません。同様に、リリース前にコンポーネントがどれだけ変更されるかを示すものでもありません。コンポーネントが変化する速度と、ユーザーが直面するアップデート問題のリスクの大きさのみを示しています。

## Kotlin コンポーネント用の GitHub バッジ {id="github-badges-for-kotlin-components"}

[Kotlin GitHub オーガナイゼーション](https://github.com/Kotlin) では、Kotlin に関連するさまざまなプロジェクトをホストしています。
その中にはフルタイムで開発しているものもあれば、サイドプロジェクトもあります。

各 Kotlin プロジェクトには、その安定性とサポートステータスを説明する 2 つの GitHub バッジがあります：

* **Stability**（安定性）ステータス。各プロジェクトの進化速度と、採用時にユーザーが負うリスクの大きさを示します。
  安定性ステータスは、[Kotlin 言語機能およびそのコンポーネントの安定性レベル](#stability-levels-explained)と完全に一致します：
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} は **Experimental** を表します
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} は **Alpha** を表します
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} は **Beta** を表します
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} は **Stable** を表します

* **Support**（サポート）ステータス。プロジェクトの保守およびユーザーの問題解決を支援するという私たちの取り組みを示します。
  サポートレベルはすべての JetBrains 製品で統一されています。  
  [詳細については JetBrains オープンソースドキュメントを参照してください](https://github.com/JetBrains#jetbrains-on-github)。

## サブコンポーネントの安定性 {id="stability-of-subcomponents"}

安定したコンポーネントであっても、実験的なサブコンポーネントが含まれている場合があります。例：
* 安定したコンパイラに実験的な機能が含まれている場合
* 安定した API に実験的なクラスや関数が含まれている場合
* 安定したコマンドラインツールに実験的なオプションが含まれている場合

どのサブコンポーネントが **Stable** でないかを正確にドキュメント化するようにしています。
また、安定版としてリリースされていない機能の誤用を防ぐため、可能な限りユーザーに警告し、明示的なオプトインを求めるよう最善を尽くしています。

## Kotlin コンポーネントの現在の安定性 {id="current-stability-of-kotlin-components"}

> デフォルトでは、すべての新しいコンポーネントは Experimental ステータスになります。
>
{style="note"}

### Kotlin コンパイラ {id="kotlin-compiler"}

| **コンポーネント**                                                  | **ステータス** | **ステータス適用バージョン** | **備考** |
|---------------------------------------------------------------------|------------|--------------------------|--------------|
| Kotlin/JVM                                                          | Stable     | 1.0.0                    |              |
| Kotlin/Native                                                       | Stable     | 1.9.0                    |              |
| Kotlin/JS                                                           | Stable     | 1.3.0                    |              |
| Kotlin/Wasm                                                         | Beta       | 2.2.20                   |              |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable     |                          |              |

### コアコンパイラプラグイン {id="core-compiler-plugins"}

| **コンポーネント**                               | **ステータス** | **ステータス適用バージョン** | **備考** |
|--------------------------------------------------|--------------|--------------------------|--------------|
| [All-open](all-open-plugin.md)                   | Stable       | 1.3.0                    |              |
| [No-arg](no-arg-plugin.md)                       | Stable       | 1.3.0                    |              |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable       | 1.3.0                    |              |
| [kapt](kapt.md)                                  | Stable       | 1.3.0                    |              |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20                   |              |
| [Power-assert](power-assert.md)                  | Experimental | 2.0.0                    |              |

### Kotlin ライブラリ {id="kotlin-libraries"}

| **コンポーネント**            | **ステータス** | **ステータス適用バージョン** | **備考** |
|-------------------------------|------------|--------------------------|--------------|
| kotlin-stdlib (JVM)           | Stable     | 1.0.0                    |              |
| kotlinx-coroutines            | Stable     | 1.3.0                    |              |
| kotlinx-serialization         | Stable     | 1.0.0                    |              |
| kotlin-metadata-jvm           | Stable     | 2.0.0                    |              |
| kotlin-reflect (JVM)          | Beta       | 1.0.0                    |              |
| kotlinx-datetime              | Alpha      | 0.2.0                    |              |
| kotlinx-io                    | Alpha      | 0.2.0                    |              |
| kotlinx-collections-immutable | Alpha      | 0.3.5                    |              |

### Kotlin Multiplatform {id="kotlin-multiplatform"}

| **コンポーネント**              | **ステータス** | **ステータス適用バージョン** | **備考**                                                                                                                             |
|---------------------------------|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform            | Stable     | 1.9.20                   |                                                                                                                                      |
| Kotlin Multiplatform IDE プラグイン | Stable     | 0.9                      | [言語とは別にバージョニングされています](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-plugin-releases.html) |

### Kotlin/Native {id="kotlin-native"}

| **コンポーネント**                           | **ステータス** | **ステータス適用バージョン** | **備考**                                                                                                                      |
|----------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native Runtime                        | Stable     | 1.9.20                   |                                                                                                                               |
| C および Objective-C との Kotlin/Native 相互運用 | Beta       | 1.3.0                    | [C および Objective-C ライブラリインポートの安定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| klib バイナリ                                | Stable     | 1.9.20                   | cinterop klib は含みません。下記を参照してください                                                                            |
| cinterop klib バイナリ                       | Beta       | 1.3.0                    | [C および Objective-C ライブラリインポートの安定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| CocoaPods 連携                               | Stable     | 1.9.20                   |                                                                                                                               |

各ターゲットのサポートレベルの詳細については、[](native-target-support.md) を参照してください。

### ビルドツール {id="build-tools"}

| **コンポーネント**                                  | **ステータス** | **ステータス適用バージョン** | **備考**                                                                                                                                                          |
|-----------------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle プラグイン](gradle-configure-project.md) | Stable     | 1.1.1                    | [Kotlin Multiplatform Gradle プラグイン](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version) は、Kotlin 1.9.20 から安定しています。 |
| [Kotlin Maven プラグイン](maven-configure-project.md)   | Stable     | 1.0.0                    |                                                                                                                                                                   |

### ビルドツール API (BTA) {id="build-tools-api-bta"}

| **コンポーネント** | **ステータス** | **ステータス適用バージョン** | **備考** |
|---------------|------------|--------------------------|--------------|
| JVM 向け BTA  | Beta       | 2.4.20                   |              |
| JS 向け BTA   | Alpha      | 2.4.20                   |              |
| Wasm 向け BTA | Alpha      | 2.4.20                   |              |

> Build tools API は現在 Kotlin/Native をサポートしていません。
> 
{style="note"}

### 言語ツール {id="language-tools"}

| **コンポーネント**                    | **ステータス** | **ステータス適用バージョン** | **備考**                                   |
|---------------------------------------|--------------|--------------------------|------------------------------------------------|
| スクリプティング構文およびセマンティクス | Alpha        | 1.2.0                    |                                                |
| スクリプティング埋め込みおよび拡張 API | Beta         | 1.5.0                    |                                                |
| スクリプティング IDE サポート         | Beta         |                          | IntelliJ IDEA 2023.1 以降で利用可能            |
| CLI スクリプティング                  | Alpha        | 1.2.0                    |                                                |

## 言語機能と設計提案 {id="language-features-and-design-proposals"}

言語機能と新しい設計提案については、[](kotlin-language-features-and-proposals.md) を参照してください。