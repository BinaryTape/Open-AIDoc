[//]: # (title: Kotlin Multiplatformとは)
[//]: # (description: Kotlin Multiplatformは、JetBrainsによるオープンソーステクノロジーで、Android、iOS、デスクトップ、ウェブ、サーバー間でのコード共有を可能にします。)

Kotlin Multiplatform (KMP) は、JetBrainsが提供するオープンソースのテクノロジーです。ネイティブ開発の利点を維持しながら、Android、iOS、デスクトップ、ウェブ、サーバー間でコードを共有することを可能にします。

Compose Multiplatformを使用すると、UIコードも複数のプラットフォーム間で共有でき、コードの再利用性を最大限に高めることができます。

## なぜ企業はKMPを選ぶのか

### コスト効率と迅速なデリバリー

Kotlin Multiplatformは、技術面と組織面の両方のプロセスを合理化するのに役立ちます。

* ロジックやUIコードをプラットフォーム間で共有することで、重複を減らし、メンテナンスコストを削減できます。これにより、複数のプラットフォームで機能を同時にリリースすることも可能になります。
* 統一されたロジックが共有コード内でアクセス可能になるため、チームのコラボレーションが容易になります。チームメンバー間のナレッジ共有がスムーズになり、各プラットフォーム専用チーム間での作業の重複を減らすことができます。

市場投入までの時間の短縮に加え、KMPの採用後にユーザーの **55%** がコラボレーションの向上を報告し、チームの **65%** がパフォーマンスと品質の向上を報告しています（KMPアンケート 2024年第2四半期）。

KMPは、スタートアップからグローバル企業まで、あらゆる規模の組織のプロダクション環境で使用されています。Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、Baidu、Kuaishou、Bilibiliなどの企業が、その柔軟性、ネイティブのパフォーマンス、ネイティブなユーザーエクスペリエンスを提供する能力、コスト効率、および段階的な導入のサポートを理由にKMPを採用しています。[KMPを採用している企業の詳細はこちら](https://kotlinlang.org/case-studies/?type=multiplatform)をご覧ください。

### コード共有の柔軟性

自分のスタイルに合わせてコードを共有できます。ネットワークやストレージなどの独立したモジュールを共有し、時間の経過とともに共有コードを段階的に拡張していくことが可能です。
また、UIはネイティブに保ちつつビジネスロジックをすべて共有したり、Compose Multiplatformを使用してUIを段階的に移行したりすることもできます。

![段階的なKMP導入の図：ロジックの一部を共有しUIは共有しない、UIを除いたすべてのロジックを共有する、ロジックとUIを共有する](kmp-graphic.png){width="700"}

### iOSでのネイティブな操作感

SwiftUIやUIKitを使用してUIを完全に構築することも、Compose Multiplatformを使用してAndroidとiOSで統一されたエクスペリエンスを作成することも、必要に応じてネイティブUIコードと共有UIコードを組み合わせることもできます。

どのアプローチを採用しても、各プラットフォームでネイティブに感じられるアプリを作成できます。

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### ネイティブのパフォーマンス

Kotlin Multiplatformは [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) を活用してネイティブバイナリを生成し、iOSのように仮想マシンが望ましくない、あるいは不可能な場所でプラットフォームAPIに直接アクセスします。

これにより、プラットフォームに依存しないコードを記述しながら、ネイティブに近いパフォーマンスを実現できます。

![iPhone 13およびiPhone 16のiOSにおけるCompose MultiplatformとSwiftUIの同等のパフォーマンスを示すグラフ](cmp-ios-performance.png){width="700"}

### シームレスなツール環境

IntelliJ IDEA and Android Studioは、[Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)によって、共通UIプレビュー、[Compose Multiplatformのホットリロード](compose-hot-reload.md)、言語をまたいだナビゲーション、リファクタリング、そしてKotlinとSwiftコード間のデバッグといった、スマートなIDEサポートをKMPに提供します。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AIを活用した開発

JetBrainsのAIコーディングエージェントである[Junie](https://jetbrains.com/junie)にKMPのタスクを任せることで、チームの開発スピードを向上させましょう。

## Kotlin Multiplatformのユースケースを見る

多くの企業や開発者が、Kotlinコードの共有によってどのようなメリットをすでに享受しているかを確認してください。

* [ケーススタディのページ](https://kotlinlang.org/case-studies/?type=multiplatform)で、企業がどのようにKMPを既存のコードベースに正常に導入したかを確認できます。
* [厳選されたサンプルリスト](multiplatform-samples.md)や、GitHubの [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) トピックで、幅広いサンプルアプリをチェックしてください。

## 基本を学ぶ

KMPの動作をすぐに確認するには、[クイックスタート](quickstart.md)を試してみてください。環境をセットアップし、さまざまなプラットフォームでサンプルアプリケーションを実行します。

ユースケースを選択する
: * プラットフォーム間でUIとビジネスロジックの両方のコードを共有するアプリを作成するには、[ロジックとUIの共有チュートリアル](compose-multiplatform-create-first-app.md)に従ってください。
  * Androidアプリをマルチプラットフォームアプリに変換する方法については、[移行チュートリアル](multiplatform-integrate-in-existing-app.md)を確認してください。
  * UIの実装を共有せずに一部のコードを共有する方法については、[ロジック共有チュートリアル](multiplatform-create-first-app.md)に従ってください。

技術的な詳細を掘り下げる
: * まずは[基本的なプロジェクト構造](multiplatform-discover-project.md)から始めましょう。
  * 利用可能な[コード共有の仕組み](multiplatform-share-on-platforms.md)について学びます。
  * KMPプロジェクトで[依存関係がどのように機能するか](multiplatform-add-dependencies.md)を確認してください。
  * さまざまな [iOSとの統合方法](multiplatform-ios-integration-overview.md)を検討してください。
  * KMPがどのように[コードをコンパイル](multiplatform-configure-compilations.md)し、さまざまなターゲット向けに[バイナリをビルド](multiplatform-build-native-binaries.md)するかについて学びます。
  * [マルチプラットフォームアプリの公開](multiplatform-publish-apps.md)または[マルチプラットフォームライブラリの公開](multiplatform-publish-lib-setup.md)について読んでください。

## Kotlin Multiplatformライブラリのエコシステムを探索する

ネットワーク、ストレージ、依存関係注入（DI）、テスト、UI、シリアライズなど、数千ものマルチプラットフォーム向けライブラリが利用可能です。

JetBrainsが運営する検索プラットフォーム [klibs.io](https://klibs.io) で、これらのライブラリを検索できます。

## Kotlin Multiplatformを大規模に導入する

チームにクロスプラットフォームフレームワークを導入することは、挑戦となる場合があります。クロスプラットフォーム開発のメリットや潜在的な問題の解決策については、以下のハイレベルな概要をご覧ください。

* [クロスプラットフォームモバイル開発とは？](cross-platform-mobile-development.topic): クロスプラットフォームアプリケーションのさまざまなアプローチと実装の概要を提供します。
* [チームにマルチプラットフォームモバイル開発を導入する方法](multiplatform-introduce-your-team.md): チームにクロスプラットフォーム開発を導入するための戦略を提案します。
* [Kotlin Multiplatformを採用してプロジェクトを強化すべき10の理由](multiplatform-reasons-to-try.md): クロスプラットフォームソリューションとしてKotlin Multiplatformを採用する理由を列挙しています。