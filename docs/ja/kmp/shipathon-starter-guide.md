[//]: # (title: Kotlin Multiplatform スターターガイド)

## どこから始めるか {id="where-to-start"}

1. Kotlin Multiplatform（KMP）と Compose Multiplatform（CMP）について学ぶ：
   [概要、メリット、ユースケース](kmp-overview.md)。
2. [サンプルプロジェクトで KMP を試して](quickstart.md)、どのように構成され、さまざまなプラットフォームでどのように動作するかを確認する。

## KMP の基礎を学ぶ {id="learn-kmp-basics"}

基礎には以下が含まれます：

* [KMP / CMP プロジェクトの構成を理解する](multiplatform-discover-project.md)。
  ここでは以下を扱います：
    * 共有モジュール内の共通コードとプラットフォーム固有コード。
    * ターゲットプラットフォームの宣言。
* [KMP プロジェクトへの依存関係の追加](multiplatform-add-dependencies.md)。
    * マルチプラットフォームおよびプラットフォーム固有の依存関係構成の実践的な例については、[サンプル](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)を参照してください。
    * そのサンプルの最終状態に至るチュートリアルは、[ドキュメントで確認できます](multiplatform-upgrade-app.md)。
* すでに KMP に精通している場合は、一般的なプロジェクト向けの[推奨プロジェクト構造](multiplatform-project-recommended-structure.md)の最新情報を確認してください。
  これは Android Gradle プラグイン 9.0 のリリースが KMP プロジェクトの要件に与えた影響を考慮したものであり、以下を扱っています：
    * モジュール構造（ライブラリとして使用される共有コードモジュールを持つ独立したアプリモジュール）。
    * 新しいアプリモジュールの作成と、AGP 8 で使用されていた古い構造からの移行。
* JetBrains デベロッパーアドボケイトが収録した[プロジェクト構造に関する推奨ビデオ](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## コードを共有する {id="share-code"}

KMP プロジェクトでコードを共有する方法はいくつかあり、プラットフォーム固有の考慮事項もあります：

* アプリモジュールから共通コードを呼び出す基本的な例は、オンボーディングチュートリアルで扱っています：
    * [ネイティブ UI と共有ロジック向け](multiplatform-upgrade-app.md)
    * [共有 UI とロジック向け](compose-multiplatform-new-project.md)
* [プラットフォーム固有の API にアクセスする方法](multiplatform-connect-to-apis.md)：
    * 可能な限りマルチプラットフォームライブラリを使用する。
    * 適切なマルチプラットフォームライブラリがない場合は、`expect`/`actual` メカニズムを使用する。
* Android の Kotlin から共有 Kotlin コードを呼び出すのは比較的簡単ですが、iOS との相互運用には慣れが必要です：
    * 一般的に、相互運用が少ないほど開発体験はスムーズになるため、すべてのプラットフォームの UI の大部分の構築には Compose Multiplatform を利用することをお勧めします。
    * [共有コードを iOS アプリに統合する方法を学ぶ](multiplatform-ios-integration-overview.md#local-integration)（このドキュメントで参照されているすべてのサンプルには、設定済みの iOS 統合の例が含まれています）。
      > CocoaPods パッケージマネージャーは、全体的に Swift Package Manager への移行に伴い段階的に廃止されており、新規プロジェクトでの使用は推奨されません。
      >
      {style="note"}   
    * Kotlin コルーチンを iOS で動作させる内容を含む[サンプルとチュートリアル](multiplatform-upgrade-app.md)をご確認ください。
    * [KMP iOS アプリで既存の SPM パッケージを使用する](multiplatform-spm-import.md)ためのガイドを参照してください。
    * [Kotlin から Swift / ObjC を呼び出す（およびその逆）詳細な解説](https://kotlinlang.org/docs/native-objc-interop.html)をお読みください。
    * より直接的なアプローチである [Swift エクスポート](https://kotlinlang.org/docs/native-swift-export.html)（現在は Alpha）について学んでください。
    

## エコシステムを探索する {id="discover-the-ecosystem"}

[klibs.io](https://klibs.io/) では、マルチプラットフォームライブラリの包括的なカタログが提供されています：

* 最も一般的なユースケースの多くは、すでに堅牢なソリューションでカバーされており、通常は代替手段も用意されています：
  データベースには [SQLDelight](https://sqldelight.github.io/sqldelight/) と [Room](https://developer.android.com/kotlin/multiplatform/room)、ネットワーキングには [Ktor](https://ktor.io/) と [OkHttp](https://square.github.io/okhttp/)、画像読み込みには [Coil](https://coil-kt.github.io/coil/) などがあります。
* 最も一般的なユースケース向けにマルチプラットフォームライブラリを使用して構築されたアプリサンプルが用意されています：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) と、対応する[チュートリアル](multiplatform-ktor-sqldelight.md)。
    * [元の Android サンプル](https://github.com/android/compose-samples/tree/main/Jetcaster)から変換された[マルチプラットフォーム Jetcaster アプリ](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## KMP ライブラリを作成する {id="create-a-kmp-library"}

共有コードをマルチプラットフォームライブラリとしてパッケージ化する場合は、以下のドキュメントページを参照してください：

* [ライブラリの基本チュートリアル](create-kotlin-multiplatform-library.md)
* [KMP ライブラリの公開設定](multiplatform-publish-lib-setup.md)
* [Maven Central](multiplatform-publish-libraries-to-maven.md) および [npm](multiplatform-publish-libraries-to-npm.md) へのアーティファクト公開チュートリアル

## アーティファクトを公開する {id="publish-the-artifacts"}

* [KMP アプリの公開に関する全般的な記事](multiplatform-publish-apps.md)をお読みください。
* Apple App Store で必要とされる[プライバシーマニフェスト](multiplatform-privacy-manifest.md)もお忘れなく。

## KMP 開発での AI の活用 {id="using-ai-for-kmp-development"}

### 始める前に {id="before-you-start"}

#### Junie への無料アクセスを利用する {id="use-the-free-junie-access"}

Junie は JetBrains の AI エージェントです。
Shipaton の参加者向けに、JetBrains は Junie CLI エージェントの EAP バージョンへの無料アクセスを提供しています。
また、[JetBrains IDE の AI チャット機能](https://www.jetbrains.com/ai-ides/#getstarted)を通じて Junie エージェントを使用することもできます。

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">Junie へのアクセスを申請</a>

#### AGENTS.md のセットアップとコミット {id="set-up-and-commit-agents-md"}

AI エージェントは見慣れないコードベースを探索する際に AGENTS.md ファイルに大きく依存するため、正確かつ包括的なコンテキストを提供することで、エージェントの洞察や生成されるコードの品質を大幅に向上させることができます。
例えば、プロジェクトが Kotlin Multiplatform を使用していると明記するだけでも、多くのクロスプラットフォーム関連の問題を回避するのに役立ちます。

フォーマットの詳細やサンプルについては、[AGENTS.md](https://agents.md/) の Web サイトを確認してください。

#### 便利な MCP サーバーを設定する {id="configure-useful-mcp-servers"}

以下の MCP サーバーは、KMP コンテキストでアプリを構築する AI エージェントにとって役立ちます：

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) サーバー：
  適切なマルチプラットフォームライブラリの検索に役立ちます。
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) サーバー：
  エージェントが UI を素早くイテレーションできるようにします。

### 機能の構築 {id="build-features"}

#### プランニングモードの活用 {id="use-planning-mode"}

より大きなタスクや分散された作業において、ほとんどのエージェントは**プランニングモード**（planning mode）をサポートしています。これによりタスクを分解し、本格的なコード生成を開始する前に検証可能な明確なステップごとの指示を生成できます。

プランニングモードで行われた作業の結果を確認し改善する時間をかけることで、通常、以下を実装する際に大幅に優れた成果が得られます：
* ユーザー向け機能の新規実装
* アーキテクチャの変更
* ライブラリの統合
* 大規模なリファクタリング

#### AI が生成した変更の検証 {id="validate-ai-generated-changes"}

AI 一般の非決定性に加えて、Kotlin Multiplatform には包括的に網羅するのが難しい多面的なコンテキストが存在します。
例えば、変更が適切に実装されてあるプラットフォームでは動作していても、別のプラットフォームを壊してしまうことはよくあります。

これに対処するために、明確な受け入れ基準を定義することをお勧めします：

* 変更を適用した後は、ターゲット固有のテストが利用可能であれば必ず実行する。
* タスクが完了したとみなす前に、設定されているすべての KMP ターゲットが正常にビルドできることを確認する。
* プラットフォーム固有の API が共通コードに漏れ出していないか実装をレビューする：
  これが漏れると、エージェント（および人間）が後の段階でそれらの API を使用してしまう原因になります。

#### Kotlin AI スキルの活用 {id="use-kotlin-ai-skills"}

Kotlin チームは、Kotlin 固有の問題を解決するための AI スキルを構築および保守しています。
[スキルリポジトリ](https://github.com/Kotlin/kotlin-agent-skills)を確認し、エージェント用のスキルをインストールしてください。

#### Swift Package Manager を使用してネイティブ iOS ライブラリを統合する {id="use-swift-package-manager-to-integrate-native-ios-libraries"}

対応するマルチプラットフォームライブラリがまだ存在しない iOS 機能については、ネイティブ iOS ライブラリを統合する必要がある場合があります。
そのような依存関係を設定するには、SwiftPM パッケージと[対応する DSL](multiplatform-spm-import.md) を使用することをお勧めします。

Kotlin チームは [CocoaPods から SwiftPM への移行を目的とした AI スキル](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)を保守しており、これは SwiftPM 統合をゼロからセットアップする際にも役立ちます。

#### エージェントオーケストレーションのセットアップ {id="set-up-agent-orchestration"}

JetBrains Air はエージェントオーケストレーションを提供しており、プロジェクトの異なる部分で作業する複数のエージェントを調整して作業を高速化するのに役立ちます。

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">Air を試す</a>

### UI のイテレーション {id="iterate-on-ui"}

#### Figma を使用して UI デザインと Compose コードを生成する {id="use-figma-to-generate-ui-designs-and-compose-code"}

[Figma MCP サーバー](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)は、デザインを Compose コードへ変換するのに役立ちます。

UI デザインをゼロから生成する場合は、[Google Stitch](https://stitch.withgoogle.com/) または [Figma Make](https://www.figma.com/make/) の利用を検討してください。

#### Compose UI タスクのエージェントとして Gemini CLI を使用する {id="use-gemini-cli-as-the-agent-for-compose-ui-tasks"}

[Flash ファミリー](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable)のモデルを含む Google のモデルを使用して Compose コードを生成した場合、一貫して良好な結果が得られています。
生成速度、トークン消費量、UI の品質のバランスが優れています。

#### UI のイテレーションに Compose Hot Reload を使用する {id="use-compose-hot-reload-to-iterate-on-ui"}

[Compose Hot Reload](compose-hot-reload.md) を使用すると、あなた、あるいはエージェントが Compose コードに加えた変更をほぼリアルタイムで反映した UI 更新が可能になります。

エージェントが UI を扱うのを支援するために、エージェント設定に [Compose Hot Reload MCP サーバー](compose-hot-reload.md#mcp-server-for-ai-agents)を追加できます。
これにより、エージェントは直接リロードをトリガーしたり、スクリーンショットを撮影したり、UI と対話することさえ可能になります。

## 学習リソースカタログ {id="learning-resources-catalog"}

ここで紹介したすべてのリソースは、より詳細なガイドやサードパーティのコンテンツとともに、[学習リソース](kmp-learning-resources.md)ページにまとめられています。