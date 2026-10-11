[//]: # (title: Kotlin Multiplatformとは)
[//]: # (description: Kotlin Multiplatformは、ネイティブ開発の利点を維持しながら、Android、iOS、デスクトップ、Web、サーバー間でコードを共有できるようにするJetBrainsのオープンソース技術です。)

Kotlin Multiplatform（KMP）は、ネイティブ開発の利点を維持しながら、Android、iOS、デスクトップ、Web、サーバー間でコードを共有できるようにするJetBrainsのオープンソース技術です。

Compose Multiplatformを使用すると、複数のプラットフォーム間でUIコードも共有でき、コードの再利用性を最大限に高めることができます。

## 企業がKMPを選択する理由 {id="why-companies-choose-kmp"}

### コスト効率と迅速なリリース {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatformは、技術的プロセスと組織的プロセスの両方を合理化するのに役立ちます。

* プラットフォーム間でロジックやUIコードを共有することで、重複作業やメンテナンスコストを削減できます。これにより、複数のプラットフォームで機能を同時にリリースすることも可能になります。
* 統一されたロジックに共有コードからアクセスできるため、チーム間のコラボレーションが容易になり、チームメンバー間でのナレッジの共有や、各プラットフォーム専門チーム間の重複した労力を削減できます。

市場投入までの時間（time to market）の短縮に加え、KMPの導入後にコラボレーションが向上したと回答したユーザーは**55%**、パフォーマンスと品質が向上したと回答したチームは**65%**にのぼります（2024年第2四半期KMPサーベイより）。

KMPは、スタートアップからグローバル企業に至るまで、あらゆる規模の組織のプロダクション環境で使用されています。Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、Baidu、Kuaishou、Bilibiliなどの企業が、柔軟性、ネイティブパフォーマンス、ネイティブなユーザーエクスペリエンスを提供する能力、コスト効率、そして段階的な導入のサポートを理由にKMPを採用しています。[KMPを採用している企業の詳細はこちら](https://kotlinlang.org/case-studies/?type=multiplatform)。

### コード共有の柔軟性 {id="flexibility-of-code-sharing"}

都合に合わせてコードを共有できます。ネットワークやストレージなどの独立したモジュールのみを共有し、時間をかけて徐々に共有コードを拡張していくことが可能です。
また、UIはネイティブのまま維持してすべてのビジネスロジックを共有することも、Compose Multiplatformを使用してUIを段階的に移行することもできます。

![段階的なKMP導入のイラスト：ロジックの一部のみを共有しUIは共有しない、UIなしですべてのロジックを共有する、ロジックとUIの両方を共有する](kmp-graphic.png){width="700"}

### iOSでのネイティブな使用感 {id="native-feel-on-ios"}

SwiftUIまたはUIKitのみを使用してUIを構築することも、Compose Multiplatformを使用してAndroidとiOSで統一されたエクスペリエンスを作成することも、必要に応じてネイティブUIコードと共有UIコードを組み合わせることもできます。

どのアプローチを選択しても、各プラットフォームでネイティブに感じられるアプリを作成できます。

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### ネイティブパフォーマンス {id="native-performance"}

Kotlin Multiplatformは、[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)を活用してネイティブバイナリを生成し、iOSのように仮想マシンが望ましくない、あるいは使用不可能な環境でもプラットフォームAPIに直接アクセスします。

これにより、プラットフォームに依存しないコードを記述しながら、ネイティブに近いパフォーマンスを実現できます。

![iPhone 13およびiPhone 16でのiOSにおけるCompose MultiplatformとSwiftUIの同等なパフォーマンスを示すグラフ](cmp-ios-performance.png){width="700"}

### シームレスなツーリング {id="seamless-tooling"}

IntelliJ IDEAとAndroid Studioは、[Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)によってKMPのスマートなIDEサポートを提供します。これには共通UIプレビュー、[Compose Hot Reload](compose-hot-reload.md)、その他の開発効率を高める機能が含まれています。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AIを活用した開発 {id="ai-powered-development"}

JetBrainsのAIコーディングエージェントである[Junie](https://jetbrains.com/junie)にKMPのタスクを任せることで、チームの開発スピードを向上させることができます。

## Kotlin Multiplatformのユースケースを見る {id="discover-kotlin-multiplatform-use-cases"}

企業や開発者がKotlinの共有コードの利点をどのように享受しているかをご確認ください。

* 企業がどのようにして自社のコードベースにKMPを導入成功させたかについては、[ケーススタディページ](https://kotlinlang.org/case-studies/?type=multiplatform)をご覧ください。
* 厳選された[サンプルリスト](multiplatform-samples.md)やGitHubの[kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample)トピックで、幅広いサンプルアプリをご確認ください。

## 基本を学ぶ {id="learn-the-basics"}

KMPの動作を素早く確認するには、[クイックスタート](quickstart.md)をお試しください。環境をセットアップし、さまざまなプラットフォームでサンプルアプリケーションを実行できます。

ユースケースを選択する
: * プラットフォーム間でUIとビジネスロジックの両方のコードを共有するアプリを作成するには、[共有ロジックとUIのチュートリアル](compose-multiplatform-new-project.md)に従ってください。
  * Androidアプリをマルチプラットフォームアプリに変換する方法を確認するには、[移行チュートリアル](multiplatform-integrate-in-existing-app.md)をご覧ください。
  * UIの実装を共有せずに一部のコードを共有する方法を確認するには、[ロジック共有のチュートリアル](multiplatform-upgrade-app.md)に従ってください。

技術的な詳細を調べる
: * まずは[基本的なプロジェクト構造](multiplatform-discover-project.md)から始めましょう。
  * 利用可能な[コード共有メカニズム](multiplatform-share-on-platforms.md)について学びます。
  * KMPプロジェクトで[依存関係がどのように機能するか](multiplatform-add-dependencies.md)を確認します。
  * さまざまな[iOS連携方法](multiplatform-ios-integration-overview.md)を検討します。
  * KMPがさまざまなターゲットに対してどのように[コードをコンパイル](multiplatform-configure-compilations.md)し、[バイナリをビルド](multiplatform-build-native-binaries.md)するかを学びます。
  * [マルチプラットフォームアプリの公開](multiplatform-publish-apps.md)や[マルチプラットフォームライブラリの公開](multiplatform-publish-lib-setup.md)について読みます。

## Kotlin Multiplatformライブラリエコシステムを探索する {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

ネットワーク、ストレージ、依存性注入（DI）、テスト、UI、シリアライズなどに対応した、何千ものマルチプラットフォームライブラリが利用可能です。

JetBrainsが運営する検索プラットフォーム[klibs.io](https://klibs.io)で、ライブラリを参照できます。

## Kotlin Multiplatformの大規模導入 {id="adopt-kotlin-multiplatform-at-scale"}

チームへのクロスプラットフォームフレームワークの導入は、時に課題となることがあります。メリットや潜在的な問題の解決策を学ぶには、クロスプラットフォーム開発の全体概要をご覧ください。

* [クロスプラットフォームモバイル開発とは？](cross-platform-mobile-development.topic): クロスプラットフォームアプリケーションのさまざまなアプローチと実装の概要を提供します。
* [マルチプラットフォームモバイル開発をチームに導入する方法](multiplatform-introduce-your-team.md): チームにクロスプラットフォーム開発を導入するための戦略を提供します。
* [Kotlin Multiplatformを採用してプロジェクトを加速させる10の理由](multiplatform-reasons-to-try.md): クロスプラットフォームソリューションとしてKotlin Multiplatformを採用すべき理由をリストアップしています。