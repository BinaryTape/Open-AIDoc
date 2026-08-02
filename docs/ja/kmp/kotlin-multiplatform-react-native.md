```xml
<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="kotlin-multiplatform-react-native"
   title="Kotlin Multiplatform 対 React Native: クロスプラットフォーム比較">
<web-summary>Kotlin Multiplatform と Compose Multiplatform を React Native とコード共有、エコシステム、UI レンダリングの観点から比較し、どのツールスタックがチームに最適かを探ります。
</web-summary>
<tip>
    <p>この比較記事では、Kotlin Multiplatform がプラットフォーム API への完全なアクセスを提供し、Android と iOS の両方で真にネイティブな体験を提供することに優れている点を強調しています。
        KMP は、特に Compose Multiplatform を使用して UI コードを共有する場合、パフォーマンス、メンテナンス性、およびネイティブなルックアンドフィールを重視するチームにとって非常に魅力的です。
        一方で、React Native は JavaScript の専門知識を持つチーム、特に迅速なプロトタイピングに適している場合があります。</p>
</tip>
<p>クロスプラットフォーム開発は、チームがアプリケーションを構築する方法を大きく変え、共有コードベースから複数のプラットフォーム向けのアプリを提供することを可能にしました。このアプローチは開発を合理化し、デバイス間でより一貫したユーザー体験を保証するのに役立ちます。</p>
<p>以前は、Android と iOS 向けに開発を行うことは、多くの場合異なるチームによって 2 つの別々のコードベースを維持することを意味しており、作業の重複やプラットフォーム間の顕著な違いを招いていました。クロスプラットフォームソリューションは、市場投入までの時間を短縮し、全体的な効率を向上させました。</p>
<p>利用可能なツールの中で、Kotlin Multiplatform、React Native、および Flutter は、最も広く採用されている 3 つの選択肢として際立っています。この記事では、製品やチームに最適なものを選ぶ手助けとなるよう、両者を詳しく見ていきます。</p>
<chapter title="Kotlin Multiplatform と Compose Multiplatform" id="kotlin-multiplatform-and-compose-multiplatform">
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/">Kotlin Multiplatform (KMP)</a> は、JetBrains によって開発されたオープンソース技術であり、Android、iOS、デスクトップ（Windows、macOS、Linux）、ウェブ、およびバックエンド間でのコード共有を可能にします。これにより、デベロッパーはネイティブの機能とパフォーマンスを維持しながら、複数の環境で Kotlin を再利用できます。</p>
    <p>採用は着実に進んでいます。直近 2 回の <a href="https://www.jetbrains.com/lp/devecosystem-2024/">Developer Ecosystem アンケート</a>の回答者の間では、Kotlin Multiplatform の利用率はわずか 1 年で 2 倍以上に増加し、2024 年の 7% から 2025 年には 18% に上昇しました。これはその勢いが高まっている明確な兆候です。</p>
    <img src="kmp-growth-deveco.svg"
         alt="直近 2 回の Developer Ecosystem アンケートの回答者の間で、KMP の利用率は 2024 年の 7% から 2025 年には 18% に増加しました"
         width="700"/>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="discover-kmp.svg"
                                                                      alt="Kotlin Multiplatform を発見する"
                                                                      style="block"
                                                                      width="500"/></a></p>
    <p>KMP では、共有戦略を選択できます。アプリのエントリポイントを除くすべてのコードを共有することから、ロジックの一部（ネットワークやデータベースモジュールなど）のみを共有すること、あるいは UI をネイティブに保ちながらビジネスロジックを共有することまで可能です。</p>
    <p>プラットフォーム間で UI コードを共有するには、Kotlin Multiplatform と Google の Jetpack Compose をベースに構築された JetBrains の最新の宣言的フレームワークである <a
            href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/">Compose Multiplatform</a> を使用できます。これは <a href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/?_gl=1*dcswc7*_gcl_au*MTE5NzY3MzgyLjE3NDk3MDk0NjI.*FPAU*MTE5NzY3MzgyLjE3NDk3MDk0NjI.*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NTA2NzU0MzQkbzM2JGcxJHQxNzUwNjc1NjEwJGo2MCRsMCRoMA..">iOS</a>、Android、デスクトップ向けに安定版（Stable）となっており、ウェブサポートは現在ベータ版です。</p>
    <p><a href="https://www.jetbrains.com/compose-multiplatform/"><img src="explore-compose.svg"
                                                                       alt="Compose Multiplatform を探索する"
                                                                       style="block"
                                                                       width="500"/></a></p>
    <p>もともと Kotlin 1.2（2017 年）で導入された Kotlin Multiplatform は、2023 年 11 月に<a
            href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/">安定版ステータス</a>に達しました。Google I/O 2024 において、Google は Android と iOS 間でビジネスロジックを共有するための <a
                href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">Kotlin Multiplatform の使用を公式にサポート</a>することを発表しました。
    </p>
</chapter>
<chapter title="React Native" id="react-native">
    <p>React Native は、ウェブおよびネイティブユーザーインターフェース向けのライブラリである <a
            href="https://reactjs.org/">React</a> と、アプリプラットフォームのネイティブ機能を使用して Android および iOS アプリケーションを構築するためのオープンソースフレームワークです。React Native を使用すると、デベロッパーは JavaScript を使用してプラットフォームの API にアクセスし、React コンポーネント（再利用可能でネスト可能なコードのバンドル）を使用して UI の外観と動作を記述できます。</p>
    <p>React Native は、2015 年 1 月の React.js Conf で初めて発表されました。同年、Meta は F8 2015 で React Native をリリースし、それ以来メンテナンスを続けています。</p>
    <p>Meta が React Native 製品を監督していますが、<a
            href="https://github.com/facebook/react-native/blob/HEAD/ECOSYSTEM.md">React Native エコシステム</a>は、パートナー、コアコントリビューター、および活発なコミュニティで構成されています。今日、このフレームワークは世界中の個人や企業からの貢献によって支えられています。</p>
</chapter>
<chapter title="Kotlin Multiplatform 対 React Native: 直接比較"
         id="kotlin-multiplatform-vs-react-native-side-by-side-comparison">
    <table style="both">
        <tr>
            <td></td>
            <td><b>Kotlin Multiplatform</b></td>
            <td><b>React Native</b></td>
        </tr>
        <tr>
            <td><b>開発元</b></td>
            <td>JetBrains</td>
            <td>Meta</td>
        </tr>
        <tr>
            <td><b>言語</b></td>
            <td>Kotlin</td>
            <td>JavaScript, TypeScript</td>
        </tr>
        <tr>
            <td><b>柔軟性とコードの再利用</b></td>
            <td>ビジネスロジックや UI を含め、コードベースの任意の部分を 1% から 100% まで共有できます。段階的に導入することも、最初から使用してプラットフォーム間でネイティブな感覚のアプリを構築することも可能です。
            </td>
            <td>個別の機能からアプリ全体まで、プラットフォーム間でビジネスロジックと UI コンポーネントを再利用できます。既存のネイティブアプリケーションに React Native を追加して、新しい画面やユーザーフローを構築できます。
            </td>
        </tr>
        <tr>
            <td><b>パッケージ、依存関係、およびエコシステム</b></td>
            <td>パッケージは <a href="https://central.sonatype.com/">Maven Central</a> やその他のリポジトリから入手できます。これには以下が含まれます。
                <p>KMP ライブラリの検索を簡素化するように設計された <a href="https://klibs.io">klibs.io</a>。</p>
                <p>この<a href="https://github.com/terrakok/kmp-awesome">リスト</a>には、最も人気のある KMP ライブラリとツールの一部が含まれています。</p></td>
            <td><a href="https://reactnative.dev/docs/libraries">React Native ライブラリ</a>は、通常、<a href="https://docs.npmjs.com/cli/npm">npm CLI</a> や <a href="https://classic.yarnpkg.com/en/">Yarn Classic</a> などの Node.js パッケージマネージャーを使用して <a href="https://www.npmjs.com/">npm レジストリ</a>からインストールされます。
            </td>
        </tr>
        <tr>
            <td><b>ビルドツール</b></td>
            <td>Gradle (Apple デバイスをターゲットとするアプリケーションの場合は加えて Xcode)。</td>
            <td>React Native コマンドラインツールと <a href="https://metrobundler.dev/">Metro バンドラー</a>。これらは内部で Android 用に Gradle を、iOS 用に Xcode ビルドシステムを呼び出します。
            </td>
        </tr>
        <tr>
            <td><b>ターゲット環境</b></td>
            <td>Android, iOS, ウェブ, デスクトップ, サーバーサイド。</td>
            <td>Android, iOS, ウェブ, デスクトップ。
                <p>ウェブとデスクトップのサポートは、<a
                        href="https://github.com/necolas/react-native-web">React Native Web</a>、<a
                        href="https://github.com/microsoft/react-native-windows">React Native Windows</a>、<a
                        href="https://github.com/microsoft/react-native-macos">React Native macOS</a> などのコミュニティおよびパートナー主導のプロジェクトを通じて提供されます。</p></td>
        </tr>
        <tr>
            <td><b>コンパイル</b></td>
            <td>デスクトップと Android 用には JVM バイトコードに、ウェブ用には JavaScript または Wasm に、ネイティブプラットフォーム用にはプラットフォーム固有のバイナリにコンパイルされます。
            </td>
            <td>React Native は Metro を使用して JavaScript コードとアセットをビルドします。
                <p>React Native には <a
                        href="https://reactnative.dev/docs/hermes">Hermes</a> のバンドル版が付属しており、ビルド中に JavaScript を Hermes バイトコードにコンパイルします。React Native は、<a
                            href="https://reactnative.dev/docs/javascript-environment">JavaScript エンジン</a>として JavaScriptCore を使用することもサポートしています。</p>
                <p>ネイティブコードは Android では Gradle によって、iOS では Xcode によってコンパイルされます。</p></td>
        </tr>
        <tr>
            <td><b>ネイティブ API との通信</b></td>
            <td>Kotlin の Swift/Objective-C および JavaScript 両方との相互運用性により、Kotlin コードからネイティブ API に直接アクセスできます。
            </td>
            <td>React Native は、ネイティブコードを JavaScript アプリケーションコードに接続するための一連 API（ネイティブモジュールとネイティブコンポーネント）を公開しています。New Architecture では、同様の結果を得るために <a
                        href="https://github.com/reactwg/react-native-new-architecture/blob/main/docs/turbo-modules.md">Turbo Native Module</a> と <a
                        href="https://github.com/reactwg/react-native-new-architecture/blob/main/docs/fabric-native-components.md">Fabric Native Components</a> を使用します。
            </td>
        </tr>
        <tr>
            <td><b>UI レンダリング</b></td>
            <td><a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> を使用してプラットフォーム間で UI を共有できます。これは Google の Jetpack Compose をベースにしており、OpenGL、ANGLE（OpenGL ES 2 または 3 の呼び出しをネイティブ API に変換）、Vulkan、および Metal と互換性のある Skia エンジンを使用しています。
            </td>
            <td>React Native には、<code>View</code>、<code>Text</code>、<code>Image</code> などのプラットフォームに依存しないコアなネイティブコンポーネントが含まれており、これらは iOS の <code>UIView</code> や Android の <code>android.view</code> など、プラットフォームのネイティブ UI 構成要素に直接マッピングされます。
            </td>
        </tr>
        <tr>
            <td><b>UI 開発のイテレーション</b></td>
            <td>共通コード（common code）からでも UI プレビューを利用できます。
                <p><a href="compose-hot-reload.md">Compose Hot Reload</a> を使用すると、アプリを再起動したり状態を失ったりすることなく、UI の変更を即座に確認できます。</p></td>
            <td><a href="https://reactnative.dev/docs/fast-refresh">Fast Refresh</a> は、React コンポーネントの変更に対してほぼ即座にフィードバックを得ることができる React Native の機能です。
            </td>
        </tr>
        <tr>
            <td><b>この技術を使用している企業</b></td>
            <td>
                <a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、
                <a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a
                    href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald's</a>、
                <a href="https://youtu.be/5lkZj4v4-ks?si=DoW00DU7CYkaMmKc">Google Workspace</a>、<a
                    href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a
                    href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、
                <a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>、<a
                    href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a
                    href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a>、
                その他多くの企業が <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP ケーススタディ</a>に掲載されています。</td>
            <td>Facebook、<a href="https://engineering.fb.com/2024/10/02/android/react-at-meta-connect-2024/">Instagram</a>、
                <a href="https://devblogs.microsoft.com/react-native/">Microsoft Office</a>、<a
                        href="https://devblogs.microsoft.com/react-native/">Microsoft Outlook</a>、Amazon Shopping、
                <a href="https://medium.com/mercari-engineering/why-we-decided-to-rewrite-our-ios-android-apps-from-scratch-in-react-native-9f1737558299">メルカリ</a>、
                Tableau、<a href="https://github.com/wordpress-mobile/gutenberg-mobile">WordPress</a>、<a
                        href="https://nearform.com/work/puma-scaling-across-the-globe/">Puma</a>、PlayStation App、
                その他多くの事例が <a href="https://reactnative.dev/showcase">React Native Showcase</a> に掲載されています。
            </td>
        </tr>
    </table>
    <p><a href="kotlin-multiplatform-flutter.md">Kotlin Multiplatform と Flutter の比較</a>もご覧いただけます。</p>
</chapter>
<chapter title="プロジェクトに最適なクロスプラットフォーム技術の選択"
         id="choosing-the-right-cross-platform-technology-for-your-project">
    <p>クロスプラットフォームフレームワークを決定することは、万能な解決策を見つけることではなく、プロジェクトの目標、技術的要件、およびチームの専門知識に最適なものを選択することです。複雑な UI を備えた機能豊富な製品を構築しているのか、既存のスキルで迅速に立ち上げることを目指しているのかに関わらず、適切な選択は特定の優先順位によって決まります。UI のカスタマイズをどの程度制御する必要があるか、長期的な安定性がどれほど重要か、およびどのプラットフォームをサポートする予定かを考慮してください。</p>
    <p>JavaScript の経験が豊富なチームにとって、特に迅速なプロトタイピングにおいては、React Native が実用的な選択肢となるでしょう。一方、Kotlin Multiplatform は異なるレベルの統合を提供します。完全にネイティブな Android アプリを生成し、iOS ではネイティブバイナリにコンパイルされ、ネイティブ API へのシームレスなアクセスが可能です。UI は完全にネイティブにすることも、高性能なグラフィックスエンジンを使用して美しくレンダリングする Compose Multiplatform 経由で共有することもできます。これにより、コード共有の恩恵を受けつつ、ネイティブなルックアンドフィール、メンテナンス性、およびパフォーマンスを優先するチームにとって、KMP は特に魅力的なものとなっています。</p>
    <p>次のプロジェクトに最適な<a href="cross-platform-frameworks.topic">クロスプラットフォーム開発フレームワーク</a>を選択する方法についての詳細な記事で、さらなるガイダンスを見つけることができます。</p>
</chapter>
<chapter title="よくある質問" id="frequently-asked-questions">
    <p>
        <control>Q: Kotlin Multiplatform は本番環境で使用できますか？</control>
    </p>
    <p>A: Kotlin Multiplatform は、本番環境での使用準備が整った安定した技術です。
        これは、最も保守的な使用シナリオであっても、Android、iOS、デスクトップ（JVM）、サーバーサイド（JVM）、およびウェブ間でコードを共有するために Kotlin Multiplatform を使用できることを意味します。</p>
    <p>プラットフォーム間で共有 UI を構築するためのフレームワークである Compose Multiplatform（Kotlin Multiplatform と Google の Jetpack Compose を利用）は、iOS、Android、およびデスクトップで安定版となっています。ウェブサポートは現在ベータ版です。</p>
    <p>Kotlin Multiplatform の一般的な方向性について詳しく知りたい場合は、ブログ記事「<a href="https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/">Kotlin Multiplatform と Compose Multiplatform の今後</a>」をご覧ください。</p>
    <p>
        <control>Q: Kotlin Multiplatform は React Native よりも優れていますか？</control>
    </p>
    <p>A: Kotlin Multiplatform と React Native はそれぞれ独自の強みを持っており、選択はプロジェクトの特定の目標、技術的要件、およびチームの専門知識に依存します。上記の比較では、コード共有、ビルドツール、コンパイル、エコシステムなどの分野における主な違いを概説し、ユースケースに最適なオプションを決定する手助けをしています。</p>
    <p>
        <control>Q: Google は Kotlin Multiplatform をサポートしていますか？</control>
    </p>
    <p>A: Google I/O 2024 において、Google は Android と iOS 間でビジネスロジックを共有するために Android 上で <a
            href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">Kotlin Multiplatform を使用することを公式にサポート</a>すると発表しました。</p>
    <p>
        <control>Q: Kotlin Multiplatform を学ぶ価値はありますか？</control>
    </p>
    <p>A: ネイティブのパフォーマンスと柔軟性を維持しながら、Android、iOS、デスクトップ、ウェブ間でコードを共有することに興味があるなら、Kotlin Multiplatform は学ぶ価値があります。これは JetBrains によって支援されており、Android 上で Android と iOS 間のビジネスロジックを共有するために Google によって公式にサポートされています。さらに、Compose Multiplatform を備えた KMP は、マルチプラットフォームアプリを構築する企業の本番環境でますます採用されています。
    </p>
</chapter>
</topic>