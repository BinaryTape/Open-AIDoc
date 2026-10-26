# Kotlin Multiplatform と Flutter: クロスプラットフォーム開発ソリューション

<web-summary>この記事では、Kotlin Multiplatform と Flutter を取り上げ、それぞれの機能への理解を深め、クロスプラットフォームプロジェクトに最適な選択肢を見つける手助けをします。</web-summary> 

急速に進化するテクノロジーの世界において、開発者は高品質なアプリケーションを構築するために、効率的なフレームワークやツールを常に探し求めています。しかし、利用可能な選択肢の中から選ぶ際、いわゆる「最良の選択肢」を見つけることに過度にとらわれないことが重要です。そのアプローチが必ずしも最適な選択につながるとは限らないからです。

プロジェクトにはそれぞれ独自の要件があります。この記事では、選択肢を整理し、Kotlin Multiplatform や Flutter といったテクノロジーのどちらがプロジェクトに最適であるかをより深く理解し、十分な情報に基づいて決定を下せるよう支援することを目的としています。

## クロスプラットフォーム開発: モダンなアプリケーション構築への統一的アプローチ {id="cross-platform-development-a-unified-approach-to-modern-application-building"}

クロスプラットフォーム開発は、単一のコードベースで複数のプラットフォーム上で動作するアプリケーションを構築する方法を提供し、システムごとに同じ機能を書き直す必要性をなくします。Android と iOS の両方をターゲットとする[モバイル開発](cross-platform-mobile-development.topic)と結びつけられることが多いですが、このアプローチはモバイルにとどまらず、Web、デスクトップ、さらにはサーバーサイド環境にも広がっています。

その中核となるコンセプトは、必要に応じてプラットフォーム固有の機能を実装できる柔軟性を確保しながらコードの再利用性を最大化し、開発プロセスを効率化してメンテナンスの手間を軽減することです。開発チームは開発サイクルの短縮、コストの削減、プラットフォーム間の一貫性の確保が可能となり、クロスプラットフォーム開発は今日のますます多様化するアプリケーション環境において賢明な選択肢となっています。

## Kotlin Multiplatform と Flutter: プラットフォーム間での開発を効率化 {id="kotlin-multiplatform-and-flutter-streamlining-development-across-platforms"}

Flutter と Kotlin Multiplatform は、異なるプラットフォーム間でのアプリケーション開発を簡素化する、人気のある 2 つのクロスプラットフォームテクノロジーです。

### Flutter {id="flutter"}

[Flutter](https://flutter.dev/) は、単一のコードベースからネイティブコンパイルされたマルチプラットフォームアプリケーションを構築するためのオープンソースフレームワークです。Android、iOS、Web、デスクトップ（Windows、macOS、Linux）、組み込みシステムにわたって、リッチなアプリケーション体験をすべて単一の共有アプリコードベースから作成できます。Flutter アプリは Dart プログラミング言語を使用して作成されます。Flutter は Google によってサポートおよび使用されています。

Sky という名称で 2014 年に初めて発表され、2018 年 12 月の Flutter Live において [Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/) が正式に発表されました。

Flutter の開発者コミュニティは大規模で非常に活発であり、継続的な改善とサポートが提供されています。Flutter では、Flutter および Dart エコシステム内の開発者から提供された共有パッケージを利用できます。

### Kotlin Multiplatform {id="kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)（KMP）は JetBrains によって構築されたオープンソーステクノロジーであり、開発者は Android、iOS、Web、デスクトップ（Windows、macOS、Linux）、サーバーサイド向けのアプリケーションを作成できます。ネイティブプログラミングの利点を維持しながら、これらのプラットフォーム間で Kotlin コードを効率的に再利用できます。

Kotlin Multiplatform では、多様なアプローチが可能です。アプリのエントリポイントを除くすべてのコードを共有することも、単一のロジック（ネットワークモジュールやデータベースモジュールなど）のみを共有することも、UI をネイティブに保ちながらビジネスロジックを共有することもできます。

![Kotlin Multiplatform はコードを最大 100% 再利用するためのテクノロジーです](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform は 2017 年に Kotlin 1.2 の一部として初めて導入されました。2023 年 11 月には Kotlin Multiplatform が安定版（Stable）となりました。Google I/O 2024 では、Google が Android と iOS の間でビジネスロジックを共有するための [Kotlin Multiplatform へのサポート](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)を発表しました。

Kotlin Multiplatform の大まかな方向性について詳しく知りたい場合は、ブログ記事「[What’s Next for Kotlin Multiplatform and Compose Multiplatform](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)」をご覧ください。

[![Kotlin Multiplatform を探索する](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform {id="compose-multiplatform"}

JetBrains が開発した最新の宣言型フレームワークである [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) を使用すると、複数のプラットフォーム間で共有 UI コードを作成できます。これは Kotlin Multiplatform と Google の Jetpack Compose をベースに構築されています。

Compose Multiplatform は現在、[iOS](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)、Android、デスクトップで安定版となっており、Web ではベータ版です。

[![Compose Multiplatform を探索する](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

専用の記事「[Compose Multiplatform と Jetpack Compose](compose-multiplatform-and-jetpack-compose.md)」では、両者の関係と主な相違点について概説しています。

### Kotlin Multiplatform と Flutter: 概要 {id="kotlin-multiplatform-and-flutter-an-overview"}

<table style="both">
    
<tr>
<td></td>
        <td><b>Kotlin Multiplatform</b></td>
        <td><b>Flutter</b></td>
</tr>

    
<tr>
<td><b>開発元</b></td>
        <td>JetBrains</td>
        <td>Google</td>
</tr>

    
<tr>
<td><b>言語</b></td>
        <td>Kotlin</td>
        <td>Dart</td>
</tr>

    
<tr>
<td><b>柔軟性とコードの再利用性</b></td>
        <td>ビジネスロジックや UI を含め、コードベースの任意のパートを 1% から 100% まで自由に共有できます。</td>
        <td>アプリケーションのすべてのピクセルをコントロールし、すべてのプラットフォーム間で 100% のコード共有を行いながら、カスタマイズされたレスポンシブなデザインを作成できます。</td>
</tr>

    
<tr>
<td><b>パッケージ、依存関係、エコシステム</b></td>
        <td>パッケージは <a href="https://central.sonatype.com/">Maven Central</a> やその他のリポジトリから利用できます。
            <p>KMP ライブラリの検索を容易にする <a href="https://klibs.io">klibs.io</a> などもあります。</p>
            <p>こちらの<a href="https://github.com/terrakok/kmp-awesome">リスト</a>には、最も人気のある KMP ライブラリやツールの一部がまとめられています。</p> </td>
        <td>パッケージは <a href="https://pub.dev/">Pub.dev</a> から利用できます。</td>
</tr>

    
<tr>
<td><b>ビルドツール</b></td>
        <td>Gradle（Apple デバイスをターゲットとするアプリケーションの場合は Xcode も併用）。</td>
        <td>Flutter コマンドラインツール（内部で Gradle および Xcode を使用）。</td>
</tr>

    
<tr>
<td><b>コード共有範囲</b></td>
        <td>Android、iOS、Web、デスクトップ、サーバーサイド。</td>
        <td>Android、iOS、Web、デスクトップ、組み込みデバイス。</td>
</tr>

    
<tr>
<td><b>コンパイル</b></td>
        <td>デスクトップおよび Android 向けには JVM バイトコード、Web 向けには JavaScript または Wasm、ネイティブプラットフォーム向けにはプラットフォーム固有のバイナリにコンパイルされます。</td>
        <td>デバッグビルドでは仮想マシン上で Dart コードを実行します。
        <p>リリースビルドでは、ネイティブプラットフォーム向けにプラットフォーム固有のバイナリを、Web 向けに JavaScript/Wasm を出力します。</p>
        </td>
</tr>

    
<tr>
<td><b>ネイティブ API との連携</b></td>
        <td><Links href="multiplatform-expect-actual.md" summary="">expect/actual 宣言</Links>を使用することで、Kotlin コードからネイティブ API に直接アクセスできます。</td>
        <td><a href="https://docs.flutter.dev/platform-integration/platform-channels">プラットフォームチャンネル（platform channels）</a>を使用してホストプラットフォームと通信できます。</td>
</tr>

    
<tr>
<td><b>UI レンダリング</b></td>
        <td>Google の Jetpack Compose をベースにした <a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> を使用して、プラットフォーム間で UI を共有できます。レンダリングには OpenGL、ANGLE（OpenGL ES 2/3 の呼び出しをネイティブ API に変換）、Vulkan、Metal と互換性のある Skia エンジンを使用します。</td>
        <td>Flutter ウィジェットは、カスタムの <a href="https://docs.flutter.dev/perf/impeller">Impeller エンジン</a>を使用して画面にレンダリングされます。プラットフォームやデバイスに応じて Metal、Vulkan、または OpenGL を使用して GPU と直接通信します。</td>
</tr>

    
<tr>
<td><b>UI 開発のイテレーション</b></td>
        <td>共通コードからでも UI プレビューを利用できます。
        <p><Links href="compose-hot-reload.md" summary="">Compose Hot Reload</Links> を使用すると、アプリを再起動したり状態を失ったりすることなく、UI の変更を即座に確認できます。</p></td>
        <td>VS Code や Android Studio 向けの IDE プラグインを利用できます。</td>
</tr>

    
<tr>
<td><b>採用企業</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、<a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>、<a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a> などの事例が <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP ケーススタディ</a>に掲載されています。</td>
        <td><a href="https://flutter.dev/showcase/xiaomi">Xiaomi</a>、<a href="https://flutter.dev/showcase/wolt">Wolt</a>、<a href="https://flutter.dev/showcase/universal-studios">Universal Studios</a>、<a href="https://flutter.dev/showcase/alibaba-group">Alibaba Group</a>、<a href="https://flutter.dev/showcase/bytedance">ByteDance</a>、<a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>、<a href="https://flutter.dev/showcase/ebay">eBay Motors</a>、<a href="https://flutter.dev/showcase/google-pay">Google Pay</a>、<a href="https://flutter.dev/showcase/so-vegan">So Vegan</a> などの事例が <a href="https://flutter.dev/showcase">Flutter Showcase</a> に掲載されています。</td>
</tr>

</table>

[![Kotlin Multiplatform をクロスプラットフォーム開発に活用しているグローバル企業の実際のユースケースを見る。](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

プロジェクトに適した技術スタックを選択するためのガイダンスを提供している Google のブログ記事「[Making Development Across Platforms Easier for Developers](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)」も参考にしてください。

Kotlin Multiplatform と Flutter のさらなる比較については、Philipp Lackner による [KMP vs. Flutter の動画](https://www.youtube.com/watch?v=dzog64ENKG0)もご覧いただけます。この動画では、コード共有、UI レンダリング、パフォーマンス、そして両テクノロジーの将来性という観点から、興味深い考察が紹介されています。

具体的なビジネスニーズ、目標、およびタスクを慎重に評価することで、自身の要件に最も適したクロスプラットフォームソリューションを見極めることができます。