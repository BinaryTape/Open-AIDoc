[//]: # (title: Kotlin Multiplatformを採用してプロジェクトを強力に推進すべき10の理由)

<web-summary>プロジェクトでKotlin Multiplatformを採用すべき10の理由をご紹介します。各企業での実際の導入事例を確認し、マルチプラットフォーム開発でこのテクノロジーの活用を始めましょう。</web-summary>

今日の多様なテクノロジー環境において、開発者は開発時間を最適化しユーザーの生産性を向上させながら、さまざまなプラットフォームでシームレスに動作するアプリケーションを構築するという課題に直面しています。Kotlin Multiplatform（KMP）は、ネイティブプログラミングの利点を維持しつつ、複数のプラットフォーム間でコードの再利用を促進し、マルチプラットフォーム向けアプリを作成できるソリューションを提供します。

この記事では、開発者が既存のプロジェクトや新規プロジェクトでKotlin Multiplatformの採用を検討すべき10の理由と、KMPが急速に支持を集め続けている理由を探ります。

**採用は着実に拡大しています：** 過去2回の[Developer Ecosystemアンケート](https://devecosystem-2025.jetbrains.com/)によると、Kotlin Multiplatformの利用率はわずか1年で2倍以上に増加し、2024年の7%から2025年には18%に達しました。この急速な成長は、本テクノロジーの勢いの高まりと、開発者からの信頼の厚さを示しています。

![直近2回のDeveloper Ecosystemアンケートの回答者の間で、KMPの利用率は2024年の7%から2025年には18%へと増加しました](kmp-growth-deveco.svg){width=700}

## プロジェクトでKotlin Multiplatformを試すべき理由 {id="why-you-should-try-kotlin-multiplatform-in-your-projects"}

開発の効率化を目指している方にも、新しいテクノロジーの導入を模索している方にも、この記事は役立つはずです。開発の効率化、複数プラットフォームのサポート、強力なツールエコシステムの提供など、Kotlin Multiplatformの実用的なメリットについて解説します。実際の企業のケーススタディも紹介します。

1. [Kotlin Multiplatformはコードの重複を防ぐのに役立つ](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatformは幅広いプラットフォームをサポートしている](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlinはシンプルなコード共有メカニズムを提供する](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatformは柔軟なマルチプラットフォーム開発を可能にする](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [Kotlin MultiplatformならUIコードも共有できる](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [Kotlin Multiplatformは既存プロジェクトと新規プロジェクトのどちらでも使用できる](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [Kotlin Multiplatformなら段階的にコード共有を開始できる](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatformはすでにグローバル企業で採用されている](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatformは強力なツールサポートを提供する](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatformには大規模で協力的なコミュニティがある](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatformはコードの重複を防ぐのに役立つ {id="1-kotlin-multiplatform-helps-you-avoid-code-duplication"}

中国最大の検索エンジンであるBaiduは、若年層をターゲットにしたアプリケーション「_Wonder App_」をリリースしました。同社が従来のアプリ開発で直面していた課題には、以下のようなものがありました。

* アプリ体験の不整合：AndroidアプリとiOSアプリで動作が異なっていた。
* ビジネスロジック検証の高コスト：同じビジネスロジックを使用するiOS開発者とAndroid開発者の作業をそれぞれ個別に検証する必要があり、高コストにつながっていた。
* アップグレードとメンテナンスの高コスト：ビジネスロジックの重複により実装が複雑化し時間がかかり、アプリのアップグレードやメンテナンスのコストが増加していた。

BaiduのチームはKotlin Multiplatformを試験導入することを決め、まずはデータモデル、RESTful APIリクエスト、JSONデータパース、キャッシュロジックといったデータ層の統合から始めました。

その後、Kotlin Multiplatformでインターフェースロジックを統合できるModel-View-Intent（MVI）UIパターンを採用することを決定しました。また、低レベルのデータ、処理ロジック、UI処理ロジックも共有しました。

この試みは大きな成功を収め、以下の成果をもたらしました。

* AndroidアプリとiOSアプリ全体で一貫したエクスペリエンスの実現。
* メンテナンスおよびテストコストの削減。
* チーム内の生産性の大幅な向上。

[![Kotlin Multiplatformの実世界でのユースケースを見る](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatformは幅広いプラットフォームをサポートしている {id="2-kotlin-multiplatform-supports-an-extensive-list-of-platforms"}

Kotlin Multiplatformの大きな利点の一つは、さまざまなプラットフォームに幅広く対応している点であり、開発者にとって汎用性の高い選択肢となっています。サポート対象には、Android、iOS、デスクトップ、Web（JavaScriptおよびWebAssembly）、サーバー（Java仮想マシン）が含まれます。

クイズ形式で学習や練習をサポートする人気の教育プラットフォーム「_Quizlet_」も、Kotlin Multiplatformの利点を示すケーススタディの一つです。同プラットフォームは月間約5,000万人のアクティブユーザーを抱え、そのうち1,000万人がAndroidユーザーです。Apple App Storeの教育カテゴリでもトップ10にランクインしています。

Quizletチームは、JavaScript、React Native、C++、Rust、Goなどのテクノロジーを試しましたが、パフォーマンス、安定性、プラットフォーム間での実装差異など、さまざまな課題に直面しました。最終的に、彼らはAndroid、iOS、Web向けにKotlin Multiplatformを選択しました。KMPの採用により、Quizletチームには以下のようなメリットがもたらされました。

* オブジェクトのマーシャリング時におけるAPIの型安全性の向上。
* iOSでの採点アルゴリズムがJavaScriptと比較して25%高速化。
* Androidアプリのサイズを18 MBから10 MBに削減。
* 開発者エクスペリエンス（DX）の向上。
* Android、iOS、バックエンド、Web開発者を含むチームメンバーが、共有コードの記述により関心を持つようになった。

[![Kotlin Multiplatformを始める](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlinはシンプルなコード共有メカニズムを提供する {id="3-kotlin-provides-simplified-code-sharing-mechanisms"}

プログラミング言語の世界において、Kotlinはそのプラグマティック（実践的）なアプローチで際立っており、以下の特徴を重視しています。

* **簡潔さよりも可読性**：コードが簡潔であることは魅力的ですが、Kotlinでは明確さが最優先であると考えられています。単にコードを短くするだけでなく、不要なボイラープレートを排除することで、可読性と保守性を高めることを目指しています。

* **単なる表現力よりもコードの再利用**：単に多くの問題を解決することだけでなく、パターンを特定し、再利用可能なライブラリを作成することが重要です。既存のソリューションを活用し、共通点を抽出することで、Kotlinは開発者がコードの効率を最大限に高められるようにします。

* **独自性よりも相互運用性**：車輪の再発明をするのではなく、KotlinはJavaのような確立された言語との互換性を重視しています。この相互運用性により、広大なJavaエコシステムとシームレスに統合できるだけでなく、これまでの経験から得られた実績あるプラクティスや知見の導入も容易になります。

* **理論的な厳密さよりも安全性とツール**：Kotlinにより、開発者はエラーを早期に検出し、プログラムが無効な状態に陥らないようにすることができます。コンパイル時やIDEでのコーディング中に問題を検出することで、ソフトウェアの信頼性を高め、ランタイムエラーのリスクを最小限に抑えます。

重要なポイントは、可読性、再利用性、相互運用性、および安全性を重視するKotlinの姿勢が、この言語を開発者にとって魅力的な選択肢にし、生産性を向上させているという点です。

### 4. Kotlin Multiplatformは柔軟なマルチプラットフォーム開発を可能にする {id="4-kotlin-multiplatform-allows-for-flexible-multiplatform-development"}

Kotlin Multiplatformを使用すれば、開発者はネイティブ開発かクロスプラットフォーム開発かの二者択一を迫られることはもうありません。何を共有し、何をネイティブで記述するかを自由に選択できます。

Kotlin Multiplatformが登場する前は、開発者はすべてをネイティブで記述する必要がありました。

![Kotlin Multiplatform以前：すべてのコードをネイティブで記述](kmp-before-new.svg){width=700}

Kotlin Multiplatformでは、プロジェクトに最適なコード共有のレベルを選択できます。

1) [ロジックとUIの両方を共有する](compose-multiplatform-new-project.md)：最大限の再利用と迅速なリリースを実現するために、Kotlin Multiplatformと[Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)を組み合わせることで、ビジネスロジックやプレゼンテーションロジックだけでなく、ユーザーインターフェースコードも共有できます。これにより、必要に応じてプラットフォーム固有のAPIと連携しながら、Android、iOS、デスクトップ、Web全体で統一されたコードベースを維持できます。このアプローチは、開発を合理化し、プラットフォーム間で一貫した動作を確保するのに役立ちます。

2) [ネイティブUIを維持しながらロジックを共有する](multiplatform-upgrade-app.md)：プラットフォーム固有の視覚的動作やUXの忠実度を最優先する場合は、データとビジネスロジックのみを共有することを選択できます。この構造により、各プラットフォームはネイティブUI層を維持しながら、共通の整合性あるロジック実装の恩恵を受けることができます。このアプローチは、既存のUIワークフローを変更せずに重複を削減したいチームに適しています。

3) [ロジックの一部のみを共有する](multiplatform-ktor-sqldelight.md)：バリデーション、ドメイン計算、認証フローなど、特定のロジックのサブセットのみを共有することで、Kotlin Multiplatformを段階的に導入することもできます。この選択肢は、大規模なアーキテクチャ変更を行うことなく、プラットフォーム間の一貫性と安定性を向上させたい場合に有効です。

![Kotlin MultiplatformとCompose Multiplatformの活用：開発者はビジネスロジック、プレゼンテーションロジック、あるいはUIロジックまでも共有可能](kmp-after-new.svg){width=700}

現在では、プラットフォーム固有のコードを除き、ほぼあらゆるものを共有できます。

### 5. Kotlin MultiplatformならUIコードも共有できる {id="5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code"}

JetBrainsは、KotlinとJetpack Composeをベースにした、Android（Jetpack Compose経由）、iOS、デスクトップ、Web（Beta）を含む複数プラットフォーム間でユーザーインターフェースを共有するための宣言型フレームワークである[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)を提供しています。

eコマース事業に特化したラストマイル物流プラットフォームである_Instabee_は、テクノロジーがまだアルファ段階にあった頃からAndroidおよびiOSアプリケーションでCompose Multiplatformを導入し、UIロジックを共有し始めました。

Compose Multiplatformの公式サンプルとして[ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)が公開されており、Android、iOS、デスクトップ、Webで動作し、マップやカメラなどのネイティブコンポーネントとの統合も備えています。また、スマートウォッチ向けOSであるWear OSでも動作するコミュニティ製サンプル[New York Times Appクローン](https://github.com/xxfast/NYTimes-KMP)もあります。さらに他の事例を見たい場合は、[Kotlin MultiplatformおよびCompose Multiplatformのサンプル一覧](multiplatform-samples.md)をご確認ください。

[![Compose Multiplatformを探索する](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. Kotlin Multiplatformは既存プロジェクトと新規プロジェクトのどちらでも使用できる {id="6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects"}

以下の2つのシナリオを見てみましょう。

* **既存プロジェクトでKMPを使用する場合**

  ここでもBaiduのWonder Appの例が挙げられます。チームにはすでにAndroidアプリとiOSアプリが存在しており、ロジックを統一する作業を行いました。より多くのライブラリとロジックを段階的に統一し始め、最終的にプラットフォーム間で共有される統合されたコードベースを実現しました。

* **新規プロジェクトでKMPを使用する場合**

  オンラインプラットフォームおよびソーシャルメディアWebサイトの_9GAG_は、FlutterやReact Nativeなどさまざまな技術を試行錯誤した結果、最終的にKotlin Multiplatformを採用しました。これにより、両プラットフォーム間でアプリの動作を一致させることができました。彼らはまずAndroidアプリの作成から始め、その後、iOS側でKotlin Multiplatformプロジェクトを依存関係として取り込みました。

### 7. Kotlin Multiplatformなら段階的にコード共有を開始できる {id="7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually"}

定数のようなシンプルな要素から段階的に開始し、メールアドレスのバリデーションのような共通ユーティリティを徐々に移行していくことができます。また、トランザクション処理やユーザー認証などのビジネスロジックを記述または移行することも可能です。

> Googleチームと協力し、Jetcasterを例として、すべてのコミットが動作可能な状態を表すリポジトリを含む実践的な移行ガイドを作成しました。[AndroidからKotlin Multiplatformへ段階的に移行する方法を見る](migrate-from-android.md)。
{style="note"}

### 8. Kotlin Multiplatformはすでにグローバル企業で採用されている {id="8-kotlin-multiplatform-is-already-used-by-global-companies"}

KMPは、Forbes、Philips、Cash App、Meetup、Autodeskをはじめとする、世界中の多くの大企業ですでに採用されています。彼らの導入事例はすべて[ケーススタディのページ](https://kotlinlang.org/case-studies/?type=multiplatform)でお読みいただけます。

2023年11月、JetBrainsはKotlin Multiplatformが安定版（Stable）になったことを発表し、本テクノロジーに対する企業やチームの関心がさらに高まりました。Google I/O 2024では、GoogleがAndroidとiOS間でビジネスロジックを共有するための[Kotlin Multiplatformの公式サポート](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)を発表しました。

### 9. Kotlin Multiplatformは強力なツールサポートを提供する {id="9-kotlin-multiplatform-provides-powerful-tooling-support"}

Kotlin Multiplatformプロジェクトで作業する際、強力なツールをすぐに活用できます。

* **IntelliJ IDEA**：IntelliJ IDEA 2025.2.2以降では、[Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)をインストールできます。このプラグインは、iOSアプリの基本的な起動・デバッグ機能、環境の事前チェック、その他便利なKMP機能を提供します。
* **Android Studio**：Android Studioも、Kotlin Multiplatform開発のための安定したソリューションです。Android Studio Otter 2025.2.1以降では、同じKotlin Multiplatform IDEプラグインをインストールして、基本的なiOS起動・デバッグサポート、環境事前チェック、追加のマルチプラットフォーム向けツールを利用できます。
* **Compose Hot Reload**：[Compose Hot Reload](compose-hot-reload.md)を使用すると、Compose Multiplatformプロジェクトの作業中にUIの変更をすばやく反復・試行できます。現在は、デスクトップターゲットを含み、Java 21以前と互換性のあるプロジェクトで利用可能です。

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**：AppleのIDEを使用して、Kotlin MultiplatformアプリのiOS部分を作成できます。XcodeはiOSアプリ開発の標準であり、コーディング、デバッグ、設定のための豊富なツール群を提供します。ただし、XcodeはMac専用です。

### 10. Kotlin Multiplatformには大規模で協力的なコミュニティがある {id="10-kotlin-multiplatform-boasts-a-large-and-supportive-community"}

KotlinとKotlin Multiplatformには、非常に協力的なコミュニティがあります。疑問が生じた際に答えを見つけられる場所をいくつかご紹介します。

* [Kotlinlang Slackワークスペース](https://slack-chats.kotlinlang.org/)：このワークスペースには約60,000人のメンバーがおり、[#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform)、[#compose](https://slack-chats.kotlinlang.org/c/compose)、[#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios)など、クロスプラットフォーム開発専用のチャンネルが用意されています。
* [Kotlin X](https://twitter.com/kotlin)：こちらでは、専門家の知見や最新ニュース、マルチプラットフォームに関する数々のヒントをいち早くキャッチできます。
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw)：公式YouTubeチャンネルでは、実践的なチュートリアル、エキスパートによるライブ配信、その他動画で学びたい人向けの優れた教育コンテンツを提供しています。
* [Kodee's Kotlin Roundup](https://lp.jetbrains.com/subscribe-to-kotlin-news/)：ダイナミックなKotlinおよびKotlin Multiplatformエコシステムの最新情報を常に把握したい場合は、定期ニュースレターにご登録ください。

Kotlin Multiplatformのエコシステムは活気に満ちています。世界中の数多くのKotlin開発者によって熱心に育てられています。拡大するこの環境をコミュニティが見渡しやすいように、[klibs.io](http://klibs.io)ではKotlin Multiplatformライブラリの厳選ディレクトリを提供しており、一般的なユースケースに適した信頼できるソリューションを容易に見つけることができます。

以下は、年ごとに作成されたKotlin Multiplatformライブラリの数を示すグラフです。

![年ごとに作成されたKotlin Multiplatformライブラリの数](kmp-libs-over-years.png){width=700}

ご覧のとおり、2021年に明らかな急増が見られ、それ以降ライブラリの数は増え続けています。

## 他のクロスプラットフォーム技術ではなくKotlin Multiplatformを選ぶ理由 {id="why-choose-kotlin-multiplatform-over-other-cross-platform-technologies"}

[さまざまなクロスプラットフォームソリューション](cross-platform-frameworks.topic)を比較検討する際は、それぞれのメリットとデメリットを比較検討することが不可欠です。[React Native](kotlin-multiplatform-react-native.topic)や[Flutter](kotlin-multiplatform-flutter.md)など、Kotlin Multiplatformと他のテクノロジーとの詳細な比較も確認できます。

Kotlin Multiplatformが最適な選択肢となり得る主な理由は以下のとおりです。

* **優れたツールと使いやすさ**：Kotlin MultiplatformはKotlinを活用しており、開発者に優れたツール群と使いやすさを提供します。
* **ネイティブプログラミング**：ネイティブな記述が容易です。[expected宣言とactual宣言](multiplatform-expect-actual.md)により、マルチプラットフォームアプリからプラットフォーム固有のAPIにアクセスできます。
* **優れたクロスプラットフォームパフォーマンス**：Kotlinで書かれた共有コードは、ターゲットごとに異なる出力形式（Android向けにはJavaバイトコード、iOS向けにはネイティブバイナリ）にコンパイルされるため、すべてのプラットフォームで良好なパフォーマンスが保証されます。
* **AIを活用したコード生成**：共有コードとプラットフォーム固有のコードの両方でより効率的なワークフローをサポートするJetBrainsのコーディングエージェント[Junie](https://www.jetbrains.com/junie/)を活用したコード生成により、マルチプラットフォーム開発をスピードアップできます。

すでにKotlin Multiplatformの導入を決めている場合は、スムーズに始めるためのヒントをいくつかご紹介します。

* **小さく始める**：まずは小さな共有コンポーネントや定数から始めて、チームがKotlin Multiplatformのワークフローとメリットに慣れるようにします。
* **計画を立てる**：期待される成果や、実装・分析の手法を仮定した明確な実験計画を策定します。共有コードへコントリビュートする役割を定義し、変更を効果的に反映させるワークフローを確立します。
* **評価と振り返りを実施する**：チームでふりかえり（レトロスペクティブ）ミーティングを実施し、実験の成否を評価し、課題や改善点を特定します。うまくいった場合はスコープを拡大してさらに多くのコードを共有できます。うまくいかなかった場合は、その実験が機能しなかった理由を把握する必要があります。

[![Kotlin Multiplatformの実際の動作を見る！今すぐ始めましょう](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

チームへのKotlin Multiplatformの導入を主導したい方向けに、実践的なヒントをまとめた[詳細なガイド](multiplatform-introduce-your-team.md)をご用意しています。

これまで見てきたように、Kotlin Multiplatformは、ネイティブプログラミングの利点を維持しつつ、コードを効率的に再利用しながら、ネイティブのようなUIを備えた高パフォーマンスなクロスプラットフォームアプリケーションを構築するために、世界中の多くの大規模企業ですでに成功裏に採用されています。