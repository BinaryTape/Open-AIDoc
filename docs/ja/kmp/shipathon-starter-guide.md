[//]: # (title: Kotlin Multiplatform スタートガイド)

## どこから始めるか

1. Kotlin Multiplatform (KMP) および Compose Multiplatform (CMP) について学びます。
   [これらがどのようなものであるか、その利点とユースケース](kmp-overview.md)を確認してください。
2. [サンプルプロジェクトで KMP を試して](quickstart.md)、プロジェクトがどのように構成され、異なるプラットフォームでどのように動作するかを確認してください。

## KMP の基本を学ぶ

基本事項には以下が含まれます：

* [KMP / CMP プロジェクトがどのように構成されているかを理解する](multiplatform-discover-project.md)。
  これには以下が含まれます：
    * 共有モジュール内の共通コードとプラットフォーム固有のコード。
    * ターゲットプラットフォームの宣言。
* [KMP プロジェクトへの依存関係の追加](multiplatform-add-dependencies.md)。
    * マルチプラットフォームおよびプラットフォーム固有の依存関係の構成に関する具体的な例については、こちらの[サンプル](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)を参照してください。
    * そのサンプルの最終状態に至るまでのチュートリアルは、[ドキュメントで公開されています](multiplatform-upgrade-app.md)。
* すでに KMP に慣れている場合は、一般的なプロジェクト向けの[推奨されるプロジェクト構造](multiplatform-project-recommended-structure.md)について最新の情報を確認してください。
  これには、Android Gradle プラグイン 9.0 のリリースが KMP プロジェクトの要件にどのように影響したかが考慮されており、以下の内容をカバーしています：
    * モジュール構造（ライブラリとして使用される共有コードモジュールを持つ独立したアプリモジュール）。
    * 新しいアプリモジュールの作成、および AGP 8 で使用されていた古い構造からの移行。
* JetBrains のデベロッパーアドボケイトが録画した、[プロジェクト構造に関する推奨ビデオ](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## コードの共有

KMP プロジェクトでコードを共有する方法はいくつかあり、プラットフォーム固有の事項も存在します：

* アプリモジュールから共通コードを呼び出す基本的な例は、オンボーディングチュートリアルで説明されています：
    * [ネイティブ UI と共有ロジックの場合](multiplatform-create-first-app.md)
    * [共有 UI とロジックの場合](compose-multiplatform-create-first-app.md)
* [プラットフォーム固有の API へのアクセス方法](multiplatform-connect-to-apis.md)：
    * 可能な場合はマルチプラットフォームライブラリを使用してください。
    * 適切なマルチプラットフォームライブラリが利用できない場合は、`expect`/`actual` メカニズムを使用してください。
* Android Kotlin から共有 Kotlin を呼び出すのは比較的簡単ですが、iOS の相互運用性（interoperability）についてはいくつか知っておくべきことがあります：
    * 一般的に、相互運用（interop）は少ないほど良いため、よりスムーズな体験を得るには、Compose Multiplatform を使用して全プラットフォーム向けの UI の大部分を構築することをお勧めします。
    * [共有コードを iOS アプリと統合する方法を学ぶ](multiplatform-ios-integration-overview.md#local-integration)（このドキュメントで参照されているすべてのサンプルには、iOS 統合の設定例が含まれています）。
      > CocoaPods パッケージマネージャーは一般的に Swift Package Manager への移行が進んでおり、新しいプロジェクトでの使用は推奨されません。
      >
      {style="note"}   
    * Kotlin コルーチンを iOS で動作させる方法を含む[サンプルとチュートリアル](multiplatform-upgrade-app.md#add-more-dependencies)を確認してください。
    * KMP iOS アプリで既存の [SPM パッケージを使用する](multiplatform-spm-import.md)ためのガイドを参照してください。
    * [Kotlin から Swift / ObjC を呼び出す方法、およびその逆の方法](https://kotlinlang.org/docs/native-objc-interop.html)についての詳細な解説を読んでください。
    * より簡潔な [Swift export](https://kotlinlang.org/docs/native-swift-export.html) アプローチ（現在はアルファ版）について学びます。
    

## エコシステムを探る

マルチプラットフォームライブラリの包括的なカタログは [klibs.io](https://klibs.io/) で公開されています：

* 最も一般的なケースについては、すでに堅牢なソリューションが存在し、通常は代替案も利用可能です：
  データベース用の [SQLDelight](https://sqldelight.github.io/sqldelight/) と [Room](https://developer.android.com/kotlin/multiplatform/room)、ネットワーキング用の [Ktor](https://ktor.io/) と [OkHttp](https://square.github.io/okhttp/)、画像読み込み用の [Coil](https://coil-kt.github.io/coil/) など。
* 最も一般的なユースケースにマルチプラットフォームライブラリを使用するように構築されたアプリサンプルが用意されています：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) と対応する [チュートリアル](multiplatform-ktor-sqldelight.md)。
    * [元の Android サンプル](https://github.com/android/compose-samples/tree/main/Jetcaster)から移行された[マルチプラットフォーム Jetcaster アプリ](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## KMP ライブラリの作成

共有コードをマルチプラットフォームライブラリとしてパッケージ化する場合は、以下のドキュメントページを確認してください：

* [ライブラリの基本チュートリアル](create-kotlin-multiplatform-library.md)
* [KMP ライブラリの公開設定](multiplatform-publish-lib-setup.md)
* [Maven Central](multiplatform-publish-libraries-to-maven.md) および [npm](multiplatform-publish-libraries-to-npm.md) にアーティファクトを公開するためのチュートリアル

## アーティファクトの公開

* [KMP アプリの公開に関する全般的な記事](multiplatform-publish-apps.md)を読んでください。
* Apple App Store で必要となる[プライバシーマニフェスト](multiplatform-privacy-manifest.md)についても忘れないでください。

## KMP 開発での AI の活用

### 始める前に

#### Junie への無料アクセスの利用

Junie は JetBrains の AI エージェントです。
Shipaton の参加者向けに、JetBrains は Junie CLI エージェントの EAP 版への無料アクセスを提供しています。
また、[IntelliJ IDE の AI チャット機能](https://www.jetbrains.com/ai-ides/#getstarted)を通じて Junie エージェントを使用することもできます。

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">Junie へのアクセスをリクエストする</a>

#### AGENTS.md のセットアップとコミット

AI エージェントは、慣れないコードベースを調査する際に `AGENTS.md` ファイルを非常に重視します。
そのため、正確で包括的なコンテキストを提供することで、エージェントの洞察や生成されるコードの品質を顕著に向上させることができます。
例えば、プロジェクトが Kotlin Multiplatform を使用していることを明記するだけで、多くのクロスプラットフォーム関連の問題を回避するのに役立ちます。

フォーマットの詳細や例については、[AGENTS.md](https://agents.md/) のウェブサイトを確認してください。

#### 便利な MCP サーバーの設定

以下の MCP サーバーは、KMP コンテキストでアプリを構築する AI エージェントにとって有用です：

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) サーバー：適切なマルチプラットフォームライブラリを探すのに役立ちます。
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) サーバー：エージェントが UI を迅速に反復して改善できるようにします。

### 機能の構築

#### プランニングモードの活用

大規模なタスクや分散作業において、ほとんどのエージェントは**プランニングモード**をサポートしています。これにより、タスクを分解し、本格的なコード生成を開始する前に検証可能な明確なステップバイステップの指示を生成できます。

プランニングモードで行われた作業の結果をレビューし洗練させることに時間をかけると、以下のような実装において大幅に優れた結果が得られます：
* ユーザー向け機能のゼロからの実装
* アーキテクチャの変更
* ライブラリの統合
* 大規模なリファクタリング

#### AI が生成した変更の検証

AI 全般の非決定性に加え、Kotlin Multiplatform は包括的なカバーが難しい多面的なコンテキストを導入します。
例えば、あるプラットフォームでは適切に動作するが、別のプラットフォームでは動作を損なうような変更が実装されることはよくあります。

これに対処するために、特定の受け入れ基準を定義することをお勧めします：

* 変更を導入した後、ターゲット固有のテストが利用可能な場合はそれを実行する。
* タスク完了と見なす前に、設定されたすべての KMP ターゲットが正常にビルドできることを確認する。
* プラットフォーム固有の API が共通コード（common code）に漏れ出していないか実装をレビューする：これが原因で、エージェント（および人間）が後の段階でそれらの API を誤って使用してしまう可能性があります。

#### Kotlin AI スキルの活用

Kotlin チームは、Kotlin 固有の問題を解決することを目的とした AI スキルを構築および保守しています。
[スキルリポジトリ](https://github.com/Kotlin/kotlin-agent-skills)を確認し、お使いのエージェントにスキルをインストールしてください。

#### ネイティブ iOS ライブラリ統合のための Swift Package Manager の使用

マルチプラットフォームライブラリがまだ存在しない iOS 機能については、ネイティブ iOS ライブラリを統合する必要がある場合があります。
そのような依存関係の構成には、SwiftPM パッケージと[対応する DSL](multiplatform-spm-import.md) を使用することをお勧めします。

Kotlin チームは、[CocoaPods から SwiftPM への移行を目的とした AI スキル](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)を保守しており、これは SwiftPM 統合をゼロからセットアップする場合にも役立ちます。

#### エージェント・オーケストレーションのセットアップ

JetBrains Air はエージェント・オーケストレーションを提供しており、プロジェクトの異なる部分で複数のエージェントを同時に調整することで、作業をスピードアップさせることができます。

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">Air を試す</a>

### UI の反復的な改善

#### Figma を使用した UI デザインと Compose コードの生成

[Figma MCP サーバー](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)は、デザインを Compose コードに変換するのに役立ちます。

UI デザインをゼロから生成する場合は、[Google Stitch](https://stitch.withgoogle.com/) または [Figma Make](https://www.figma.com/make/) を検討してください。

#### Compose UI タスクのエージェントとして Gemini CLI を使用する

Google のモデル（[Flash ファミリー](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable)のモデルを含む）を使用して Compose コードを生成すると、一貫して良好な結果が得られることがわかっています。生成速度、トークン消費量、および UI 品質において優れたバランスを提供します。

#### Compose Hot Reload を使用した UI の反復改善

[Compose Hot Reload](compose-hot-reload.md) を使用すると、あなた（またはエージェント）が Compose コードに加えた変更をほぼリアルタイムで UI に反映できます。

エージェントが UI 作業を行えるようにするには、エージェントの設定に [Compose Hot Reload MCP サーバー](compose-hot-reload.md#mcp-server-for-ai-agents)を追加してください。これにより、エージェントがリロードを直接トリガーしたり、スクリーンショットを撮ったり、UI を操作したりすることが可能になります。

## 学習リソースカタログ

前述のすべてのリソースは、より詳細なガイドやサードパーティのコンテンツとともに、[学習リソース](kmp-learning-resources.md)ページにまとめられています。