# Kotlin MultiplatformとFlutter：クロスプラットフォーム開発ソリューション

<web-summary>この記事では、Kotlin MultiplatformとFlutterについて解説し、それぞれの機能を理解した上で、あなたのクロスプラットフォームプロジェクトに最適なものを選択できるよう支援します。</web-summary> 

急速に進化するテクノロジーの世界において、開発者は高品質なアプリケーションを構築するために、効率的なフレームワークやツールを常に探し求めています。しかし、利用可能な選択肢の中から選ぶ際、「最高」とされる選択肢を見つけることに固執しすぎないことが重要です。そのアプローチが、必ずしも最も適切な選択につながるとは限らないからです。

各プロジェクトは独自であり、特定の要件を持っています。この記事は、選択肢を整理し、Kotlin MultiplatformやFlutterといったテクノロジーがあなたのプロジェクトにどのように適合するかをより深く理解し、情報に基づいた意思決定ができるよう支援することを目的としています。

## クロスプラットフォーム開発：モダンなアプリケーション構築への統合的アプローチ

クロスプラットフォーム開発は、単一のコードベースで複数のプラットフォームで動作するアプリケーションを構築する方法を提供し、システムごとに同じ機能を書き直す必要をなくします。AndroidとiOSの両方をターゲットとする[モバイル開発](cross-platform-mobile-development.topic)に関連付けられることが多いですが、このアプローチはモバイルをはるかに超え、ウェブ、デスクトップ、さらにはサーバーサイドの環境までカバーしています。

その核心となる考え方は、必要に応じてプラットフォーム固有の機能を実装できるようにしつつ、コードの再利用を最大化することにあります。これにより、開発プロセスを合理化し、メンテナンスの手間を削減できます。チームは開発サイクルを加速させ、コストを削減し、プラットフォーム間での一貫性を確保できるため、今日のますます多様化するアプリケーション環境において、クロスプラットフォーム開発は賢明な選択肢となっています。

## Kotlin MultiplatformとFlutter：プラットフォーム間の開発を効率化する

FlutterとKotlin Multiplatformは、異なるプラットフォーム間でのアプリケーション開発を簡素化する、人気のある2つのクロスプラットフォームテクノロジーです。

### Flutter

[Flutter](https://flutter.dev/)は、単一のコードベースからネイティブにコンパイルされたマルチプラットフォームアプリケーションを構築するためのオープンソースフレームワークです。Android、iOS、ウェブ、デスクトップ（Windows、macOS、Linux）、および組み込みシステムにおいて、すべて単一の共有アプリコードベースから豊かなアプリ体験を作成できます。FlutterアプリはDartプログラミング言語を使用して記述されます。FlutterはGoogleによってサポートおよび使用されています。

2014年に「Sky」という名称で初めて導入され、[Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/)は2018年12月のFlutter Live中に正式に発表されました。

Flutterの開発者コミュニティは大規模かつ非常に活発で、継続的な改善とサポートを提供しています。Flutterでは、FlutterおよびDartのエコシステム内の開発者によって提供された共有パッケージを使用できます。

### Kotlin Multiplatform

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) はJetBrainsによって構築されたオープンソーステクノロジーです。開発者はAndroid、iOS、ウェブ、デスクトップ（Windows、macOS、Linux）、およびサーバーサイド向けのアプリケーションを作成でき、ネイティブプログラミングの利点を維持しながら、これらのプラットフォーム間でKotlinコードを効率的に再利用できます。

Kotlin Multiplatformでは、さまざまなオプションがあります。アプリのエントリポイント以外のすべてのコードを共有することも、一部のロジック（ネットワークやデータベースモジュールなど）のみを共有することも、あるいはUIをネイティブに保ちながらビジネスロジックのみを共有することも可能です。

![Kotlin Multiplatformはコードの最大100%を再利用するためのテクノロジーです](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatformは、2017年にKotlin 1.2の一部として初めて導入されました。2023年11月にKotlin Multiplatformは安定版（Stable）になりました。Google I/O 2024において、GoogleはAndroidとiOS間でビジネスロジックを共有するための[Kotlin Multiplatformへのサポート](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)を発表しました。

Kotlin Multiplatformの一般的な方向性について詳しく知りたい場合は、ブログ記事「[What’s Next for Kotlin Multiplatform and Compose Multiplatform](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)」をご覧ください。

[![Discover Kotlin Multiplatform](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform

JetBrainsによるモダンな宣言型フレームワークである[Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)を使用すると、複数のプラットフォーム間で共有UIコードを記述できます。これはKotlin MultiplatformとGoogleのJetpack Composeをベースに構築されています。

Compose Multiplatformは現在、[iOS](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)、Android、デスクトップで安定版となっており、ウェブではBeta版です。

[![Explore Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

専用の記事「[Compose Multiplatform and Jetpack Compose](compose-multiplatform-and-jetpack-compose.md)」では、両者の関係と主な違いの概要を説明し、重要な相違点をハイライトしています。

### Kotlin MultiplatformとFlutter：概要

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
<td><b>柔軟性とコード再利用</b></td>
        <td>ビジネスロジックやUIを含め、コードベースの任意の部分（1%から100%まで）を共有できます。</td>
        <td>アプリケーションのすべてのピクセルを制御し、すべてのプラットフォームで100%のコード共有を行いながら、カスタマイズされたアダプティブなデザインを作成できます。</td>
</tr>

    
<tr>
<td><b>パッケージ、依存関係、およびエコシステム</b></td>
        <td>パッケージは<a href="https://central.sonatype.com/">Maven Central</a>やその他のリポジトリから入手可能です。これには、
            <p>KMPライブラリの検索を簡素化するために設計された<a href="https://klibs.io">klibs.io</a>などが含まれます。</p>
            <p>この<a href="https://github.com/terrakok/kmp-awesome">リスト</a>には、最も人気のあるKMPライブラリとツールの一部が含まれています。</p> </td>
        <td>パッケージは<a href="https://pub.dev/">Pub.dev</a>から入手可能です。</td>
</tr>

    
<tr>
<td><b>ビルドツール</b></td>
        <td>Gradle（Appleデバイスをターゲットとするアプリケーションの場合はXcodeも併用）。</td>
        <td>Flutterコマンドラインツール（内部でGradleとXcodeを使用）。</td>
</tr>

    
<tr>
<td><b>コード共有</b></td>
        <td>Android、iOS、ウェブ、デスクトップ、およびサーバーサイド。</td>
        <td>Android、iOS、ウェブ、デスクトップ、および組み込みデバイス。</td>
</tr>

    
<tr>
<td><b>コンパイル</b></td>
        <td>デスクトップとAndroid向けにはJVMバイトコードに、ウェブ向けにはJavaScriptまたはWasmに、ネイティブプラットフォーム向けにはプラットフォーム固有のバイナリにコンパイルされます。</td>
        <td>デバッグビルドでは、仮想マシン上でDartコードを実行します。
        <p>リリースビルドでは、ネイティブプラットフォーム向けにプラットフォーム固有のバイナリを、ウェブ向けにはJavaScript/Wasmを出力します。</p>
        </td>
</tr>

    
<tr>
<td><b>ネイティブAPIとの通信</b></td>
        <td><Links href="/kmp/multiplatform-expect-actual" summary="undefined">expect/actual宣言</Links>を使用して、Kotlinコードから直接ネイティブAPIにアクセス可能です。</td>
        <td><a href="https://docs.flutter.dev/platform-integration/platform-channels">プラットフォームチャンネル</a>を使用して、ホストプラットフォームとの通信が可能です。</td>
</tr>

    
<tr>
<td><b>UIレンダリング</b></td>
        <td>GoogleのJetpack Composeをベースにした<a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a>を使用してプラットフォーム間でUIを共有できます。これはOpenGL、ANGLE（OpenGL ES 2または3の呼び出しをネイティブAPIに変換）、Vulkan、およびMetalと互換性のあるSkiaエンジンを使用します。</td>
        <td>Flutterのウィジェットは、プラットフォームやデバイスに応じてMetal、Vulkan、またはOpenGLを使用してGPUと直接通信する、カスタムの<a href="https://docs.flutter.dev/perf/impeller">Impellerエンジン</a>を使用して画面にレンダリングされます。</td>
</tr>

    
<tr>
<td><b>UI開発のイテレーション</b></td>
        <td>共通（common）コードからでもUIプレビューが可能です。
        <p><Links href="/kmp/compose-hot-reload" summary="undefined">Compose Hot Reload</Links>を使用すると、アプリを再起動したり状態を失ったりすることなく、UIの変更を即座に確認できます。</p></td>
        <td>VS CodeおよびAndroid Studio向けのIDEプラグインが利用可能です。</td>
</tr>

    
<tr>
<td><b>このテクノロジーを採用している企業</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、<a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>、<a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a>などが挙げられます。詳細は<a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMPケーススタディ</a>をご覧ください。</td>
        <td><a href="https://flutter.dev/showcase/xiaomi">Xiaomi</a>、<a href="https://flutter.dev/showcase/wolt">Wolt</a>、<a href="https://flutter.dev/showcase/universal-studios">Universal Studios</a>、<a href="https://flutter.dev/showcase/alibaba-group">Alibaba Group</a>、<a href="https://flutter.dev/showcase/bytedance">ByteDance</a>、<a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>、<a href="https://flutter.dev/showcase/ebay">eBay Motors</a>、<a href="https://flutter.dev/showcase/google-pay">Google Pay</a>、<a href="https://flutter.dev/showcase/so-vegan">So Vegan</a>などが<a href="https://flutter.dev/showcase">Flutter Showcase</a>に掲載されています。</td>
</tr>

</table>

[![Kotlin Multiplatformをクロスプラットフォーム開発に活用しているグローバル企業の実際のユースケースをご覧ください。](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

また、プロジェクトに適した技術スタックを選択するためのガイダンスを提供している、Googleのブログ記事「[Making Development Across Platforms Easier for Developers](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)」も併せてご覧ください。

Kotlin MultiplatformとFlutterのさらなる比較をお探しの場合は、Philipp Lackner氏による[KMP vs. Flutterのビデオ](https://www.youtube.com/watch?v=dzog64ENKG0)も視聴することをお勧めします。このビデオでは、コード共有、UIレンダリング、パフォーマンス、および両テクノロジーの将来性に関して、興味深い考察が共有されています。

特定のビジネスニーズ、目的、およびタスクを慎重に評価することで、要件を最もよく満たすクロスプラットフォームソリューションを特定することができます。