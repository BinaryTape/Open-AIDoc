[//]: # (title: Kotlin Multiplatformを採用してプロジェクトを強化すべき10の理由)

<web-summary>プロジェクトで Kotlin Multiplatform を使用すべき 10 の理由を紹介します。企業の事例を確認し、マルチプラットフォーム開発でこのテクノロジーの活用を始めましょう。</web-summary>

今日の多様なテクノロジー環境において、開発者は開発時間を最適化し、ユーザーの生産性を高めながら、さまざまなプラットフォームでシームレスに動作するアプリケーションを構築するという課題に直面しています。Kotlin Multiplatform (KMP) は、ネイティブプログラミングの利点を維持しながら、複数のプラットフォーム向けのアプリを作成し、コードの再利用を促進するソリューションを提供します。

この記事では、開発者が既存または新規のプロジェクトで Kotlin Multiplatform の使用を検討すべき 10 の理由と、なぜ KMP が大きな注目を集め続けているのかを探ります。

**採用は着実に増加しています：** 直近 2 回の [Developer Ecosystem 調査](https://devecosystem-2025.jetbrains.com/) によると、Kotlin Multiplatform の利用率はわずか 1 年で 2 倍以上に増加し、2024 年の 7% から 2025 年には 18% に上昇しました。この急速な成長は、このテクノロジーの勢いが増していることと、開発者が寄せている信頼を浮き彫りにしています。

![直近2回のDeveloper Ecosystem調査の回答者の間で、KMPの利用率は2024年の7%から2025年には18%に増加しました](kmp-growth-deveco.svg){width=700}

## プロジェクトで Kotlin Multiplatform を試すべき理由

開発をより効率的にしたいと考えている場合でも、新しいテクノロジーを探索したいと考えている場合でも、この記事は役に立つでしょう。
開発の効率化、マルチプラットフォームのサポート、強力なツールエコシステムなど、Kotlin Multiplatform の実用的な利点のいくつかについて説明します。また、実際の企業のケーススタディも紹介します。

1. [Kotlin Multiplatform はコードの重複を避けるのに役立つ](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform は広範なプラットフォームをサポートしている](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin は簡素化されたコード共有メカニズムを提供する](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform は柔軟なマルチプラットフォーム開発を可能にする](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [Kotlin Multiplatform ソリューションにより UI コードを共有できる](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [既存および新規のプロジェクトで Kotlin Multiplatform を使用できる](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [Kotlin Multiplatform を使用すると、段階的にコード共有を開始できる](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform はすでにグローバル企業で使用されている](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform は強力なツールサポートを提供する](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform は大規模で協力的なコミュニティを誇っている](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform はコードの重複を避けるのに役立つ

中国最大の検索エンジンである Baidu は、若年層をターゲットにしたアプリケーション *Wonder App* をリリースしました。従来のアプリ開発で彼らが直面した問題の一部を以下に挙げます。

* アプリ体験の不一致：Android アプリと iOS アプリで動作が異なっていた。
* ビジネスロジックの検証コストが高い：同じビジネスロジックを使用する iOS と Android の開発者の作業を個別にチェックする必要があり、高いコストにつながっていた。
* アップグレードとメンテナンスのコストが高い：ビジネスロジックを複製することは複雑で時間がかかり、アプリのアップグレードとメンテナンスのコストを増大させていた。

Baidu チームは Kotlin Multiplatform の実験を決定し、まずはデータレイヤー（データモデル、RESTful API リクエスト、JSON データパース、キャッシュロジック）の統合から始めました。

その後、彼らは Model-View-Intent (MVI) ユーザーインターフェースパターンを採用することを決定しました。これにより、Kotlin Multiplatform でインターフェースロジックを統合できます。彼らはまた、低レベルのデータ、処理ロジック、および UI 処理ロジックも共有しました。

この実験は非常に成功し、次のような結果をもたらしました。

* Android アプリと iOS アプリ間で一貫した体験。
* メンテナンスおよびテストコストの削減。
* チーム内の生産性が大幅に向上。

[![Kotlin Multiplatform の実際のユースケースを探索する](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform は広範なプラットフォームをサポートしている

Kotlin Multiplatform の主な利点の 1 つは、さまざまなプラットフォームにわたる広範なサポートであり、開発者にとって多用途な選択肢となっています。
これらのプラットフォームには、Android、iOS、デスクトップ、Web (JavaScript および WebAssembly)、サーバー (Java Virtual Machine) が含まれます。

クイズを通じて学習と練習を支援する人気の教育プラットフォームである *Quizlet* は、Kotlin Multiplatform の利点を強調するもう 1 つのケーススタディです。
このプラットフォームには月間約 5,000 万人のアクティブユーザーがおり、そのうち 1,000 万人が Android ユーザーです。このアプリは、Apple の App Store の教育カテゴリでトップ 10 にランクインしています。

Quizlet チームは JavaScript、React Native、C++、Rust、Go などのテクノロジーを試しましたが、パフォーマンス、安定性、プラットフォームごとの実装の違いなど、さまざまな課題に直面しました。最終的に、彼らは Android、iOS、Web に Kotlin Multiplatform を選択しました。KMP の使用が Quizlet チームにどのようにもたらした利点は以下の通りです。

* オブジェクトのマーシャリング（marshaling）時のより型安全な API。
* iOS での採点アルゴリズムが JavaScript と比較して 25% 高速化。
* Android アプリのサイズが 18 MB から 10 MB に削減。
* 開発者体験の向上。
* Android、iOS、バックエンド、Web 開発者を含むチームメンバーの、共有コードの記述に対する関心の高まり。

[![Kotlin Multiplatform を始める](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin は簡素化されたコード共有メカニズムを提供する

プログラミング言語の世界において、Kotlin はその実用的なアプローチで際立っています。つまり、以下の機能を優先しています。

* **簡潔さよりも読みやすさ**。簡潔なコードは魅力的ですが、Kotlin は明快さが最も重要であることを理解しています。目標は単にコードを短くすることではなく、不要なボイラープレートを排除することであり、これにより読みやすさとメンテナンス性が向上します。

* **単なる表現力よりもコードの再利用**。多くの問題を解決することだけが重要なのではなく、パターンを特定し、再利用可能なライブラリを作成することが重要です。既存のソリューションを活用し、共通性を抽出することで、Kotlin は開発者がコードの効率を最大化できるようにします。

* **独創性よりも相互運用性**。車輪の再発明をするのではなく、Kotlin は Java のような確立された言語との互換性を受け入れています。この相互運用性により、広大な Java エコシステムとのシームレスな統合が可能になるだけでなく、実証済みのプラクティスや以前の経験から学んだ教訓の採用も容易になります。

* **健全性 (Soundness) よりも安全性とツール**。Kotlin は開発者がエラーを早期にキャッチできるようにし、プログラムが無効な状態に陥らないようにします。コンパイル中や IDE でのコード記述中に問題を検出することで、Kotlin はソフトウェアの信頼性を高め、ランタイムエラーのリスクを最小限に抑えます。

重要なポイントは、Kotlin が読みやすさ、再利用、相互運用性、安全性を重視していることが、この言語を開発者にとって魅力的な選択肢にし、生産性を向上させているということです。

### 4. Kotlin Multiplatform は柔軟なマルチプラットフォーム開発を可能にする

Kotlin Multiplatform を使用すると、開発者はネイティブ開発かクロスプラットフォーム開発かを選択する必要がなくなります。何を共有し、何をネイティブで書くかを自分で選ぶことができます。

Kotlin Multiplatform が登場する前、開発者はすべてをネイティブで書かなければなりませんでした。

![Kotlin Multiplatform 以前：すべてのコードをネイティブで記述](kmp-before-new.svg){width=700}

Kotlin Multiplatform では、プロジェクトに適したコード共有のレベルを選択できます。

1) [ロジックと UI の両方を共有する](compose-multiplatform-create-first-app.md)：最大限の再利用と迅速なデリバリーのために、Kotlin Multiplatform と [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) を組み合わせることで、ビジネスロジックやプレゼンテーションロジックだけでなく、ユーザーインターフェースコードも共有できます。これにより、Android, iOS, デスクトップ, Web にわたって統一されたコードベースを維持しながら、必要に応じてプラットフォーム固有の API と統合することが可能になります。このアプローチは開発を効率化し、プラットフォーム間で一貫した動作を保証するのに役立ちます。

2) [ネイティブ UI を維持しながらロジックを共有する](multiplatform-create-first-app.md)：プラットフォーム固有の視覚的な動作や UX の忠実度が優先される場合は、データとビジネスロジックのみを共有することを選択できます。この構造では、各プラットフォームはネイティブの UI レイヤーを保持しながら、共通の一貫したロジック実装の恩恵を受けることができます。このアプローチは、既存の UI ワークフローを変更せずに重複を減らしたいチームに適しています。

3) [ロジックの小さな一部を共有する](multiplatform-ktor-sqldelight.md)：Kotlin Multiplatform は、バリデーション、ドメイン計算、認証フローなどの特定のロジックのサブセットを共有することから段階的に導入することもできます。このオプションは、大規模なアーキテクチャの変更を行わずに、プラットフォーム間の一貫性と安定性を向上させたい場合に適しています。

![Kotlin Multiplatform と Compose Multiplatform を使用：開発者はビジネスロジック、プレゼンテーションロジック、さらには UI ロジックも共有できます](kmp-after-new.svg){width=700}

今では、プラットフォーム固有のコードを除いて、ほとんど何でも共有できます。

### 5. Kotlin Multiplatform ソリューションにより UI コードを共有できる

JetBrains は、Kotlin と Jetpack Compose に基づいて、Android (Jetpack Compose 経由)、iOS、デスクトップ、Web (Beta) を含む複数のプラットフォームでユーザーインターフェースを共有するための宣言型フレームワークである [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) を提供しています。

Eコマース企業に特化したラストマイル物流プラットフォームである *Instabee* は、テクノロジーがまだアルファ版の状態であったときに、Android および iOS アプリケーションで Compose Multiplatform を使い始め、UI ロジックを共有しました。

[ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer) という Compose Multiplatform の公式サンプルがあります。これは Android、iOS、デスクトップ、Web で動作し、マップやカメラなどのネイティブコンポーネントとの統合も備えています。また、コミュニティによるサンプルとして、スマートウォッチ用オペレーティングシステムである Wear OS でも動作する [New York Times App](https://github.com/xxfast/NYTimes-KMP) のクローンもあります。その他の例については、この [Kotlin Multiplatform および Compose Multiplatform サンプル](multiplatform-samples.md) のリストを確認してください。

[![Compose Multiplatform を探索する](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. 既存および新規のプロジェクトで Kotlin Multiplatform を使用できる

次の 2 つのシナリオを見てみましょう。

* **既存のプロジェクトで KMP を使用する**

  ここでも、Baidu の Wonder App の例があります。チームにはすでに Android と iOS のアプリがあり、ロジックを統合しただけでした。彼らは徐々により多くのライブラリとロジックを統合し始め、プラットフォーム間で共有される統一されたコードベースを実現しました。

* **新規プロジェクトで KMP を使用する**

  オンラインプラットフォームおよびソーシャルメディアウェブサイトである *9GAG* は、Flutter や React Native など、さまざまなテクノロジーを試しましたが、最終的に Kotlin Multiplatform を選択しました。これにより、両方のプラットフォームでアプリの動作を一致させることができました。彼らはまず Android アプリを作成することから始めました。その後、iOS で依存関係として Kotlin Multiplatform プロジェクトを利用しました。

### 7. Kotlin Multiplatform を使用すると、段階的にコード共有を開始できる

定数のような単純な要素から始めて、メールバリデーションのような共通のユーティリティを徐々に移行するなど、インクリメンタルに開始できます。また、トランザクションプロセスやユーザー認証などのビジネスロジックを記述または移行することもできます。

> Google チームと共に Jetcaster を例として、各コミットが動作する状態を表すリポジトリを含む、実用的な移行ガイドを作成しました。
> [Android から Kotlin Multiplatform に段階的に移行する方法を確認する](migrate-from-android.md)。
{style="note"}

### 8. Kotlin Multiplatform はすでにグローバル企業で使用されている

KMP は、Forbes、Philips、Cash App、Meetup、Autodesk を含む、世界中の多くの大企業ですでに使用されています。彼らのストーリーはすべて [ケーススタディページ](https://kotlinlang.org/case-studies/?type=multiplatform) で読むことができます。

2023 年 11 月、JetBrains は Kotlin Multiplatform が Stable（安定版）になったことを発表し、より多くの企業やチームの関心を集めました。Google I/O 2024 では、Google が Android と iOS の間でビジネスロジックを共有するための [Kotlin Multiplatform の使用を公式にサポート](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html) することを発表しました。

### 9. Kotlin Multiplatform は強力なツールサポートを提供する

Kotlin Multiplatform プロジェクトを作業する際、強力なツールをすぐに利用できます。

* **IntelliJ IDEA**。IntelliJ IDEA 2025.2.2 以降では、iOS アプリの基本的な起動およびデバッグ機能、プリフライト環境チェック、およびその他の役立つ KMP 機能を提供する [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..) をインストールできます。
* **Android Studio**。Android Studio も Kotlin Multiplatform 開発のための安定したソリューションです。Android Studio Otter 2025.2.1 以降では、同じ Kotlin Multiplatform IDE プラグインをインストールして、基本的な iOS の起動およびデバッグのサポート、プリフライト環境チェック、および追加のマルチプラットフォームツールを入手できます。
* **Compose Hot Reload**：[Compose Hot Reload](compose-hot-reload.md) を使用すると、Compose Multiplatform プロジェクトの作業中に UI の変更を迅速に反復して試すことができます。現在は、デスクトップターゲットを含み、Java 21 以前と互換性のあるプロジェクトで利用可能です。

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**。Apple の IDE は、Kotlin Multiplatform アプリの iOS 部分を作成するために使用できます。Xcode は iOS アプリ開発の標準であり、コーディング、デバッグ、設定のための豊富なツールを提供しています。ただし、Xcode は Mac 専用です。

### 10. Kotlin Multiplatform は大規模で協力的なコミュニティを誇っている

Kotlin と Kotlin Multiplatform には、非常に協力的なコミュニティがあります。疑問に対する答えを見つけることができる場所をいくつか紹介します。

* [Kotlinlang Slack ワークスペース](https://slack-chats.kotlinlang.org/)。このワークスペースには約 60,000 人のメンバーがおり、[#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform)、[#compose](https://slack-chats.kotlinlang.org/c/compose)、[#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios) など、マルチプラットフォーム開発に特化した関連チャネルがいくつかあります。
* [Kotlin X](https://twitter.com/kotlin)。ここでは、専門家による迅速な洞察や最新ニュース、無数のマルチプラットフォームのヒントを見つけることができます。
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw)。私たちの YouTube チャンネルでは、視覚的に学びたい人のために、実用的なチュートリアル、専門家とのライブ配信、その他の優れた教育コンテンツを提供しています。
* [Kodee's Kotlin Roundup](https://lp.jetbrains.com/subscribe-to-kotlin-news/)。ダイナミックな Kotlin および Kotlin Multiplatform エコシステムの最新アップデートを常に把握したい場合は、定期的なニュースレターを購読してください！

Kotlin Multiplatform のエコシステムは繁栄しています。世界中の多数の Kotlin 開発者によって熱心に育まれています。コミュニティがこの拡大する状況をナビゲートしやすくするために、[klibs.io](http://klibs.io) は Kotlin Multiplatform ライブラリの厳選されたディレクトリを提供しており、一般的なユースケースに対する信頼できるソリューションを見つけやすくしています。

以下は、年間に作成された Kotlin Multiplatform ライブラリの数を示すグラフです。

![年間に作成された Kotlin Multiplatform ライブラリの数](kmp-libs-over-years.png){width=700}

ご覧のとおり、2021 年に明らかな上昇があり、それ以降ライブラリの数は増え続けています。

## なぜ他のクロスプラットフォームテクノロジーではなく Kotlin Multiplatform を選ぶのか？

[異なるクロスプラットフォームソリューション](cross-platform-frameworks.topic) を選択する際は、そのメリットとデメリットの両方を検討することが不可欠です。また、[React Native](kotlin-multiplatform-react-native.topic) や [Flutter](kotlin-multiplatform-flutter.md) などの他のテクノロジーと Kotlin Multiplatform を並べて比較することもできます。

Kotlin Multiplatform があなたにとって正しい選択である主な理由の概要は以下の通りです。

* **優れたツール、使いやすさ**。Kotlin Multiplatform は Kotlin を活用しており、開発者にとって優れたツールと使いやすさを提供します。
* **ネイティブプログラミング**。ネイティブで書くことが容易です。[expected および actual 宣言](multiplatform-expect-actual.md) のおかげで、マルチプラットフォームアプリからプラットフォーム固有の API にアクセスできます。
* **優れたクロスプラットフォームパフォーマンス**。Kotlin で書かれた共有コードは、ターゲットごとに異なる出力形式にコンパイルされます。Android 用の Java バイトコードと iOS 用のネイティブバイナリにコンパイルされるため、すべてのプラットフォームで良好なパフォーマンスが保証されます。
* **AI によるコード生成**。JetBrains のコーディングエージェントである [Junie](https://www.jetbrains.com/junie/) によるコード生成により、マルチプラットフォーム開発を加速できます。Junie は共有コードとプラットフォーム固有のコードにわたって、より効率的なワークフローをサポートします。

すでに Kotlin Multiplatform を試すことに決めているなら、始めるのに役立つヒントをいくつか紹介します。

* **小さく始める**。小さな共有コンポーネントや定数から始めて、チームが Kotlin Multiplatform のワークフローと利点に慣れるようにします。
* **計画を立てる**。期待される成果、実装および分析方法を仮定した、明確な実験計画を策定します。共有コードへの貢献の役割を定義し、変更を効果的に配布するためのワークフローを確立します。
* **評価とふりかえりを実施する**。チームでふりかえりミーティングを行い、実験の成功を評価し、課題や改善点を特定します。うまくいった場合は、範囲を広げてさらに多くのコードを共有するとよいでしょう。そうでない場合は、なぜこの実験がうまくいかなかったのか、その理由を理解する必要があります。

[![Kotlin Multiplatform の動作を確認しましょう！今すぐ始めましょう](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

チームが Kotlin Multiplatform を使い始めるのを支援したい方のために、実用的なヒントをまとめた [詳細なガイド](multiplatform-introduce-your-team.md) を用意しました。

ご覧のとおり、Kotlin Multiplatform はすでに多くの大企業で、ネイティブプログラミングの利点を維持しながら、ネイティブのような UI を持ち、コードを効果的に再利用する高性能なクロスプラットフォームアプリケーションを構築するために、成功裏に使用されています。