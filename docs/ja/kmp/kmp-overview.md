[//]: # (title: Kotlin Multiplatformとは)
[//]: # (description: Kotlin Multiplatformは、ネイティブ開発の利点を維持しながら、Android、iOS、デスクトップ、ウェブ、サーバー間でコードを共有できるようにするJetBrainsのオープンソーステクノロジーです。)

Kotlin Multiplatform（KMP）は、ネイティブ開発の利点を維持しながら、Android、iOS、デスクトップ、ウェブ、サーバー間でコードを共有できるようにするJetBrainsのオープンソーステクノロジーです。

Compose Multiplatformを使用すれば、UIコードも複数のプラットフォーム間で共有でき、コードの再利用性を最大限に高めることができます。

## 企業がKMPを選択する理由 {id="why-companies-choose-kmp"}

### コスト効率と迅速なリリース {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatformは、技術的および組織的なプロセスの両方を効率化するのに役立ちます。

* ロジックやUIコードをプラットフォーム間で共有することで、重複作業やメンテナンスコストを削減できます。これにより、複数のプラットフォームで機能を同時にリリースすることも可能になります。
* 共有コードによってロジックが一元化されるため、チーム間のコラボレーションが容易になり、チームメンバー間でのナレッジの共有がスムーズになり、各プラットフォーム専門チーム間での重複した作業を削減できます。

市場投入までの期間短縮に加え、KMPの導入後にユーザーの**55%**がコラボレーションの向上を報告し、チームの**65%**がパフォーマンスと品質の向上を報告しています（KMP Survey Q2 2024より）。

KMPは、スタートアップからグローバル企業に至るまで、あらゆる規模の組織の本番環境で使用されています。Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、Baidu、Kuaishou、Bilibiliといった企業が、その柔軟性、ネイティブパフォーマンス、ネイティブなユーザー体験の提供能力、コスト効率、そして段階的な導入のしやすさを評価してKMPを採用しています。[KMPを採用した企業についての詳細](https://kotlinlang.org/case-studies/?type=multiplatform)。

### コード共有の柔軟性 {id="flexibility-of-code-sharing"}

状況に合わせて柔軟にコードを共有できます。ネットワークやストレージなどの独立したモジュールだけを共有し、時間をかけて徐々に共有コードを拡張していくことが可能です。また、UIはネイティブのまま維持してビジネスロジックのみをすべて共有することも、Compose Multiplatformを使用して段階的にUIを移行することもできます。

![段階的なKMP導入の図解: ロジックの一部を共有しUIは共有しない、UIなしですべてのロジックを共有する、ロジックとUIを両方共有する](kmp-graphic.png){width="700"}

### iOSにおけるネイティブな使用感 {id="native-feel-on-ios"}

SwiftUIやUIKitを使用してUIを完全に構築することも、Compose MultiplatformでAndroidとiOSで統一された体験を作成することも、必要に応じてネイティブUIコードと共有UIコードを組み合わせることもできます。

どのアプローチを選択しても、各プラットフォームでネイティブに感じられるアプリを作成できます。

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### ネイティブパフォーマンス {id="native-performance"}

Kotlin Multiplatformは[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)を活用してネイティブバイナリを生成し、iOSなどの仮想マシンが望ましくない、または利用できない環境でプラットフォームAPIに直接アクセスします。

これにより、プラットフォームに依存しないコードを記述しながら、ほぼネイティブと同等のパフォーマンスを実現できます。

![iPhone 13およびiPhone 16におけるiOS上のCompose MultiplatformとSwiftUIの同等のパフォーマンスを示すグラフ](cmp-ios-performance.png){width="700"}

### シームレスな開発ツール {id="seamless-tooling"}

IntelliJ IDEAとAndroid Studioは、[Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)によるKMP向けのスマートなIDEサポートを提供しており、共通UIプレビュー、[Compose Multiplatform向けのホットリロード](compose-hot-reload.md)、言語間のナビゲーション、リファクタリング、KotlinコードとSwiftコードを横断したデバッグなどが利用できます。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AIを活用した開発 {id="ai-powered-development"}

JetBrainsのAIコーディングエージェントである[Junie](https://jetbrains.com/junie)にKMPのタスクを任せることで、チームの開発スピードを向上させましょう。

## Kotlin Multiplatformのユースケースを見る {id="discover-kotlin-multiplatform-use-cases"}

企業や開発者がKotlinコードの共有によってどのようにメリットを享受しているかをご覧ください。

* [ケーススタディページ](https://kotlinlang.org/case-studies/?type=multiplatform)で、企業が自社のコードベースにどのようにKMPを導入して成功を収めたかを確認できます。
* [厳選されたサンプルリスト](multiplatform-samples.md)やGitHubの[kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample)トピックで、幅広いサンプルアプリをチェックしてください。

## 基本を学ぶ {id="learn-the-basics"}

KMPの動作をすばやく体験するには、[クイックスタート](quickstart.md)をお試しください。環境をセットアップし、さまざまなプラットフォームでサンプルアプリケーションを実行できます。

ユースケースの選択
: * プラットフォーム間でUIとビジネスロジックの両方のコードを共有するアプリを作成するには、[ロジックとUIの共有チュートリアル](compose-multiplatform-new-project.md)に従ってください。
  * Androidアプリをマルチプラットフォームアプリに変換する方法を確認するには、[移行チュートリアル](multiplatform-integrate-in-existing-app.md)を参照してください。
  * UIの実装を共有せずに一部のコードのみを共有する方法を確認するには、[ロジック共有のチュートリアル](multiplatform-upgrade-app.md)に従ってください。

技術的な詳細を深く知る
: * まずは[基本的なプロジェクト構造](multiplatform-discover-project.md)から始めましょう。
  * 利用可能な[コード共有メカニズム](multiplatform-share-on-platforms.md)について学びます。
  * KMPプロジェクトで[依存関係がどのように機能するか](multiplatform-add-dependencies.md)を確認します。
  * さまざまな[iOS連携方法](multiplatform-ios-integration-overview.md)を検討します。
  * KMPがさまざまなターゲット向けに[コードをコンパイル](multiplatform-configure-compilations.md)し、[バイナリをビルド](multiplatform-build-native-binaries.md)する方法を学びます。
  * [マルチプラットフォームアプリの公開](multiplatform-publish-apps.md)や[マルチプラットフォームライブラリの公開](multiplatform-publish-lib-setup.md)について読みます。

## Kotlin Multiplatformライブラリエコシステムの探索 {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

ネットワーク、ストレージ、依存性注入（DI）、テスト、UI、シリアライゼーションなど、数千ものマルチプラットフォームライブラリが利用可能です。

JetBrainsが運営する検索プラットフォーム[klibs.io](https://klibs.io)で探してみてください。

## Kotlin Multiplatformの大規模導入 {id="adopt-kotlin-multiplatform-at-scale"}

チームでクロスプラットフォームフレームワークを採用することは、大きな挑戦になり得ます。そのメリットや潜在的な問題の解決策について学ぶには、クロスプラットフォーム開発の概要をご覧ください。

* [クロスプラットフォームモバイル開発とは？](cross-platform-mobile-development.topic): クロスプラットフォームアプリケーションのさまざまなアプローチと実装の概要を提供します。
* [チームにマルチプラットフォームモバイル開発を導入する方法](multiplatform-introduce-your-team.md): チームにクロスプラットフォーム開発を導入するための戦略を提案します。
* [Kotlin Multiplatformを採用してプロジェクトを加速させる10の理由](multiplatform-reasons-to-try.md): クロスプラットフォームソリューションとしてKotlin Multiplatformを採用すべき理由を挙げています。