[//]: # (title: FAQ)

## Kotlin Multiplatform {id="kotlin-multiplatform"}

### Kotlin Multiplatform とは？ {id="what-is-kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)（KMP）は、柔軟なクロスプラットフォーム開発を実現する JetBrains 製のオープンソース技術です。ネイティブプログラミングの利点を活かしながら、さまざまなプラットフォーム向けのアプリケーションを作成し、プラットフォーム間でコードを効率的に再利用できます。Kotlin Multiplatform を使用することで、Android、iOS、デスクトップ、Web、サーバーサイドなどのプラットフォーム向けにアプリを開発できます。

### Kotlin Multiplatform を使って UI コードを共有できますか？ {id="can-i-share-ui-code-using-kotlin-multiplatform"}

はい、Kotlin と [Jetpack Compose](https://developer.android.com/jetpack/compose) をベースにした JetBrains の宣言型 UI フレームワークである [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) を使用することで UI を共有できます。このフレームワークにより、iOS、Android、デスクトップ、Web などのプラットフォーム向けに共有 UI コンポーネントを作成でき、異なるデバイスやプラットフォーム間で一貫したユーザーインターフェースを維持するのに役立ちます。

詳細については、[Compose Multiplatform](#compose-multiplatform) のセクションを参照してください。

### Kotlin Multiplatform はどのプラットフォームをサポートしていますか？ {id="what-platforms-does-kotlin-multiplatform-support"}

Kotlin Multiplatform は Android、iOS、デスクトップ、Web、サーバーサイドなどのプラットフォームをサポートしています。詳細については、[サポートされているプラットフォーム](supported-platforms.md)を参照してください。

### クロスプラットフォームアプリの開発にはどの IDE を使用すべきですか？ {id="in-which-ide-should-i-work-on-my-cross-platform-app"}

Kotlin Multiplatform プロジェクトでの作業には、IntelliJ IDEA または Android Studio の使用を推奨します。

Kotlin Multiplatform プロジェクトで iOS をターゲットにする場合は、iOS 固有のコードを記述して iOS アプリケーションを実行するために、マシンに [Xcode](https://developer.apple.com/xcode/) がインストールされている必要があります。

### 新しい Kotlin Multiplatform プロジェクトを作成するにはどうすればよいですか？ {id="how-do-i-create-a-new-kotlin-multiplatform-project"}

[Kotlin Multiplatform アプリの作成](get-started.topic) チュートリアルでは、Kotlin Multiplatform プロジェクトを作成するための手順をステップバイステップで説明しています。ロジックのみを共有するか、ロジックと UI の両方を共有するかを選択できます。

### 既存の Android アプリケーションがあります。Kotlin Multiplatform に移行するにはどうすればよいですか？ {id="i-have-an-existing-android-application-how-can-i-migrate-it-to-kotlin-multiplatform"}

[Android アプリケーションを iOS で動作させる](multiplatform-integrate-in-existing-app.md) ステップバイステップチュートリアルでは、Android アプリケーションをネイティブ UI のまま iOS で動作させる方法を説明しています。

[Jetpack Compose アプリの Kotlin Multiplatform への移行](migrate-from-android.md) は、UI の Compose Multiplatform への移行を含め、複雑な Android アプリケーションをマルチプラットフォームに変換する包括的な手順を示す高度なチュートリアルです。

### 実際に試すことができる完全なサンプルはどこで入手できますか？ {id="where-can-i-get-complete-examples-to-play-with"}

[実践的なサンプルのリスト](multiplatform-samples.md) を参照してください。

### 実際の Kotlin Multiplatform アプリケーションの事例はどこで確認できますか？本番環境で KMP を採用している企業はありますか？ {id="where-can-i-find-a-list-of-real-life-kotlin-multiplatform-applications-what-companies-use-kmp-in-production"}

すでに本番環境で Kotlin Multiplatform を採用している他社の事例については、[導入事例（Case Studies）のリスト](https://kotlinlang.org/case-studies/?type=multiplatform) をご覧ください。

### Kotlin Multiplatform はどのオペレーティングシステムで動作しますか？ {id="which-operating-systems-can-work-with-kotlin-multiplatform"}

共有コードや、iOS を除くプラットフォーム固有のコードを扱う場合は、IDE がサポートしている任意のオペレーティングシステムで作業できます。

iOS 固有のコードを記述し、シミュレーターまたは実機で iOS アプリケーションを実行したい場合は、macOS を搭載した Mac を使用してください。これは、Apple の要件により、iOS シミュレーターは macOS 上でのみ実行可能であり、Microsoft Windows や Linux などの他のオペレーティングシステムでは実行できないためです。

詳細は、[推奨される IDE](recommended-ides.md) を参照してください。

### Kotlin Multiplatform プロジェクトで並行処理コードを記述するにはどうすればよいですか？ {id="how-can-i-write-concurrent-code-in-kotlin-multiplatform-projects"}

Kotlin Multiplatform プロジェクトでも、コルーチン（coroutines）と Flow を使用して非同期コードを記述できます。このコードをどのように呼び出すかは、どこから呼び出すかによって異なります。Kotlin コードからサスペンド関数や Flow を呼び出す方法は、特に Android 向けに広く文書化されています。[Swift コードからそれらを呼び出す](https://kotlinlang.org/docs/native-arc-integration.html#completion-handlers) にはもう少し作業が必要です。詳細については [KT-47610](https://youtrack.jetbrains.com/issue/KT-47610) を参照してください。

Swift からサスペンド関数や Flow を呼び出す現在の最善のアプローチは、[KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) のようなプラグインやライブラリを Swift の `async`/`await` や Combine、RxSwift などのライブラリと組み合わせて使用することです。

現時点では、KMP-NativeCoroutines のほうが実績のあるソリューションであり、並行処理への `async`/`await`、Combine、RxSwift のアプローチをサポートしています。SKIE はセットアップが簡単で、記述が冗長になりにくい特徴があります。たとえば、Kotlin の `Flow` を Swift の `AsyncSequence` に直接マッピングします。どちらのライブラリもコルーチンの適切なキャンセルをサポートしています。

これらの使用方法については、[Native UI: REST API リクエストの共有ロジック](multiplatform-upgrade-app.md) チュートリアルを参照してください。

### Kotlin/Native とは何ですか？また Kotlin Multiplatform とどのように関係していますか？ {id="what-is-kotlin-native-and-how-does-it-relate-to-kotlin-multiplatform"}

[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) は、仮想マシンなしで実行できるネイティブバイナリに Kotlin コードをコンパイルする技術です。これには、Kotlin コンパイラ用の [LLVM ベース](https://llvm.org/) のバックエンドと、Kotlin 標準ライブラリのネイティブ実装が含まれています。

Kotlin/Native は主に、組み込みデバイスや iOS など、仮想マシンが望ましくない、または利用できないプラットフォーム向けのコンパイルを可能にするように設計されています。追加のランタイムや仮想マシンを必要としない自己完結型のプログラムを作成する必要がある場合に特に適しています。

たとえば、モバイルアプリケーションでは、Kotlin で書かれた共有コードは Android 向けには Kotlin/JVM によって JVM バイトコードにコンパイルされ、iOS 向けには Kotlin/Native によってネイティブバイナリにコンパイルされます。これにより、両方のプラットフォームで Kotlin Multiplatform とのシームレスな統合が可能になります。

![Kotlin/Native と Kotlin/JVM バイナリ](kotlin-native-and-jvm-binaries.png){width=350}

### ネイティブプラットフォーム（iOS、macOS、Linux）向けの Kotlin Multiplatform モジュールのコンパイルを高速化するにはどうすればよいですか？ {id="how-can-i-speed-up-my-kotlin-multiplatform-module-compilation-for-native-platforms-ios-macos-linux"}

[Kotlin/Native のコンパイル時間を改善するためのヒント](https://kotlinlang.org/docs/native-improving-compilation-time.html) を参照してください。

## Compose Multiplatform {id="compose-multiplatform"}

### Compose Multiplatform とは？ {id="what-is-compose-multiplatform"}

[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) は、JetBrains が開発した最新の宣言型・リアクティブ UI フレームワークで、少量の Kotlin コードでユーザーインターフェースを簡単に構築できる手段を提供します。また、UI を一度作成すれば、サポートされている任意のプラットフォーム（iOS、Android、デスクトップ（Windows、macOS、Linux）、Web）で実行できます。

### Android 向けの Jetpack Compose とはどのように関係していますか？ {id="how-does-it-relate-to-jetpack-compose-for-android"}

Compose Multiplatform は、Google が開発した Android UI フレームワークである [Jetpack Compose](https://developer.android.com/jetpack/compose) と API の大部分を共有しています。実際、Compose Multiplatform を使用して Android をターゲットにする場合、アプリは単純に Jetpack Compose 上で動作します。
Compose Multiplatform がターゲットとする他のプラットフォームは、内部的な実装の詳細が Android の Jetpack Compose と異なる場合がありますが、提供される API は同じです。

詳細については、[フレームワーク間の相互関係の概要](compose-multiplatform-and-jetpack-compose.md) を参照してください。

### どのプラットフォーム間で UI を共有できますか？ {id="between-which-platforms-can-i-share-my-ui"}

Android、iOS、デスクトップ（Linux、macOS、Windows）、Web（Wasm ベース）といった主要なプラットフォームの任意の組み合わせの間で UI を共有できるようにすることを目指しています。現時点で Compose Multiplatform は Android、iOS、デスクトップ向けに Stable（安定版）となっています。詳細については、[サポートされているプラットフォーム](supported-platforms.md) を参照してください。

### Compose Multiplatform は本番環境で使用できますか？ {id="can-i-use-compose-multiplatform-in-production"}

Compose Multiplatform の Android、iOS、デスクトップのターゲットは Stable です。本番環境で使用できます。

WebAssembly ベースの Web 向け Compose Multiplatform は Beta であり、ほぼ完成している状態です。使用することは可能ですが、移行に伴う問題がまだ発生する可能性があります。iOS、Android、デスクトップ向けの Compose Multiplatform と同じ UI を備えています。

### 新しい Compose Multiplatform プロジェクトを作成するにはどうすればよいですか？ {id="how-do-i-create-a-new-compose-multiplatform-project"}

[ロジックと UI を共有する Compose Multiplatform アプリの作成](compose-multiplatform-new-project.md) チュートリアルでは、Android、iOS、デスクトップ向けの Compose Multiplatform を含む Kotlin Multiplatform プロジェクトを作成するための手順をステップバイステップで説明しています。また、Kotlin Developer Advocate の Sebastian Aigner による YouTube の [ビデオチュートリアル](https://www.youtube.com/watch?v=5_W5YKPShZ4) も視聴できます。

### Compose Multiplatform でアプリを構築するにはどの IDE を使用すべきですか？ {id="what-ide-should-i-use-for-building-apps-with-compose-multiplatform"}

[KMP IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform/) をインストールした IntelliJ IDEA または Android Studio の使用を推奨します。

詳細については、[推奨される IDE とコードエディター](recommended-ides.md) を参照してください。

### デモアプリケーションを試すことはできますか？どこで見つけられますか？ {id="can-i-play-with-a-demo-application-where-can-i-find-it"}

[サンプル](multiplatform-samples.md) で実際に試すことができます。

### Compose Multiplatform にはウィジェットが付属していますか？ {id="does-compose-multiplatform-come-with-widgets"}

はい、Compose Multiplatform は [Material 3](https://m3.material.io/) ウィジェットを完全にサポートしています。

### Material ウィジェットの外観はどの程度カスタマイズできますか？ {id="to-what-extent-can-i-customize-the-appearance-of-material-widgets"}

Material のテーマ機能を使用して、色、フォント、パディングをカスタマイズできます。独自のデザインを作成したい場合は、カスタムウィジェットやレイアウトを作成できます。

### 既存の Kotlin Multiplatform アプリで UI を共有できますか？ {id="can-i-share-the-ui-in-my-existing-kotlin-multiplatform-app"}

アプリケーションの UI にネイティブ API を使用している場合（最も一般的なケース）、Compose Multiplatform はそのための相互運用性を提供しているため、一部を段階的に Compose Multiplatform に書き直すことができます。ネイティブ UI を、Compose で作成された共通 UI をラップする特別な相互運用ビューに置き換えることができます。

### Jetpack Compose を使用している既存の Android アプリケーションがあります。他のプラットフォームへ移行するにはどうすればよいですか？ {id="i-have-an-existing-android-application-that-uses-jetpack-compose-what-should-i-do-to-migrate-it-to-other-platforms"}

アプリの移行は、UI の移行とロジックの移行の 2 つの部分で構成されます。移行の難易度は、アプリケーションの複雑さと、使用している Android 固有のライブラリの数によって異なります。

複雑なアプリの移行例については、[Jetpack Compose アプリの Kotlin Multiplatform への移行](migrate-from-android.md) ガイドを参照してください。

画面の大部分は変更なしで Compose Multiplatform に移行できます。すべての Jetpack Compose ウィジェットがサポートされています。ただし、一部の API は Android ターゲットでのみ動作します（Android 固有であるか、他のプラットフォームにまだ移植されていない可能性があります）。たとえば、リソース処理は Android 固有であるため、[Compose Multiplatform リソースライブラリ](compose-multiplatform-resources.md) に移行するか、コミュニティのソリューションを使用する必要があります。Android でのみ利用可能なコンポーネントの詳細については、現在の [Android 専用 API リスト](compose-android-only-components.md) を参照してください。

[ビジネスロジックを Kotlin Multiplatform に移行する](multiplatform-integrate-in-existing-app.md) 必要があります。コードを共有モジュールに移動しようとすると、Android の依存関係を使用している部分がコンパイルできなくなるため、書き直す必要があります。

* Android 専用の依存関係を使用しているコードを書き直して、代わりにマルチプラットフォームライブラリを使用するようにできます。一部のライブラリはすでに Kotlin Multiplatform をサポートしている場合があるため、その場合は変更は不要です。[klibs.io](https://klibs.io/) カタログ、または [KMP-awesome](https://github.com/terrakok/kmp-awesome) ライブラリリストを確認してください。
* あるいは、共通コードをプラットフォーム固有のロジックから分離し、プラットフォームに応じて異なる方法で実装される [共通インターフェースを提供](multiplatform-connect-to-apis.md) することもできます。Android では既存の機能を使用した実装が可能であり、iOS などの他のプラットフォームでは共通インターフェース用の新しい実装を提供する必要があります。

### 既存の iOS アプリに Compose 画面を統合できますか？ {id="can-i-integrate-compose-screens-into-an-existing-ios-app"}

はい。Compose Multiplatform はさまざまな統合シナリオをサポートしています。iOS UI フレームワークとの統合の詳細については、[SwiftUI との統合](compose-swiftui-integration.md) および [UIKit との統合](compose-uikit-integration.md) を参照してください。

### UIKit や SwiftUI のコンポーネントを Compose 画面に統合できますか？ {id="can-i-integrate-uikit-or-swiftui-components-into-a-compose-screen"}

はい、統合できます。[SwiftUI との統合](compose-swiftui-integration.md) および [UIKit との統合](compose-uikit-integration.md) を参照してください。

<!-- Need to revise
### What happens when my mobile OS updates and introduces new platform capabilities? {id="what-happens-when-my-mobile-os-updates-and-introduces-new-platform-capabilities"}

You can use them in platform-specific parts of your codebase once Kotlin supports them. We do our best to support them
in the upcoming Kotlin version. All new Android capabilities provide Kotlin or Java APIs, and wrappers over iOS APIs are
generated automatically.
-->

### モバイル OS がアップデートされ、システムコンポーネントの視覚スタイルや動作が変更された場合はどうなりますか？ {id="what-happens-when-my-mobile-os-updates-and-changes-the-visual-style-of-the-system-components-or-their-behavior"}

すべてのコンポーネントはキャンバス上に描画されるため、OS のアップデート後も UI はそのまま維持されます。ネイティブの iOS コンポーネントを画面に埋め込んでいる場合は、アップデートがその外観に影響を与える可能性があります。

## 今後の計画 {id="future-plans"}

### Kotlin Multiplatform の今後の進化についてどのような計画がありますか？ {id="what-are-the-plans-for-the-kotlin-multiplatform-evolution"}

JetBrains では、マルチプラットフォーム開発に最高の体験を提供し、マルチプラットフォームユーザーの現在の課題を解消するために多くの投資を行っています。Kotlin Multiplatform のコア技術、Apple エコシステムとの統合、ツール、および Compose Multiplatform UI フレームワークの改善を計画しています。[Kotlin ロードマップの Multiplatform セクション](https://kotlinlang.org/docs/roadmap.html#kotlin-roadmap-by-subsystem) をご覧ください。

### Compose Multiplatform はいつ Stable になりますか？ {id="when-will-compose-multiplatform-become-stable"}

Compose Multiplatform は Android、iOS、デスクトップ向けには Stable ですが、Wasm に基づく Web サポートは Beta です。Web プラットフォームの安定版リリースに向けて取り組んでおり、正確な日程は後日発表されます。

安定性ステータスの詳細については、[サポートされているプラットフォーム](supported-platforms.md) を参照してください。

### Kotlin および Compose Multiplatform における Web ターゲットの今後のサポートはどうなりますか？ {id="what-about-future-support-for-web-targets-in-kotlin-and-compose-multiplatform"}

現在は大きな可能性を秘めた WebAssembly（Wasm）にリソースを集中させています。新しい [Kotlin/Wasm バックエンド](https://kotlinlang.org/docs/wasm-overview.html) や、Wasm を利用した [Web 向け Compose Multiplatform](https://kotl.in/wasm-compose-example) をお試しいただけます。

JS ターゲットに関しては、Kotlin/JS バックエンドはすでに Stable ステータスに達しています。Compose Multiplatform においては、リソースの制約により、より有望であると考えている Wasm へ JS Canvas から焦点を移行しました。

また、以前は「Compose Multiplatform for web」として知られていた Compose HTML も提供しています。これは Kotlin/JS で DOM を操作するために設計された追加のライブラリであり、プラットフォーム間での UI の共有を目的としたものではありません。

### マルチプラットフォーム開発のツールを改善する計画はありますか？ {id="are-there-any-plans-to-improve-tooling-for-multiplatform-development"}

はい、マルチプラットフォームツールの現在の課題を強く認識しており、いくつかの領域で積極的に機能強化に取り組んでいます。

### Swift との相互運用性を提供する予定はありますか？ {id="are-you-going-to-provide-swift-interoperability"}

はい。現在、Kotlin コードの Swift へのエクスポートに焦点を当て、Swift との直接的な相互運用性を提供するためのさまざまなアプローチを調査しています。