<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="cross-platform-frameworks" title="最も人気のあるクロスプラットフォームアプリ開発フレームワーク7選">
<p>長年にわたり、クロスプラットフォームアプリ開発はモバイルアプリケーションを構築する最も一般的な方法の1つになっています。
    クロスプラットフォーム（またはマルチプラットフォーム）アプローチを採用することで、開発者は異なるモバイルプラットフォーム上で同様に動作するアプリを作成できます。</p>
<p>このGoogleトレンドのチャートが示すように、2010年から現在に至るまで、関心は着実に高まっています。</p>
<img src="google-trends-cross-platform-new.png"
     alt="Google Trends chart illustrating the interest in cross-platform app development" width="700"/>
<p>急速に進化する<a href="cross-platform-mobile-development.topic">クロスプラットフォームモバイル開発</a>テクノロジーの人気が高まるにつれ、多くの新しいツールが市場に登場しています。
    多くの選択肢がある中で、ニーズに最適なものを選ぶのは難しいかもしれません。
    適切なツールを見つける手助けとして、優れたクロスプラットフォームアプリ開発フレームワークのリストと、それらを際立たせている機能を紹介します。
    また、この記事の最後には、ビジネス向けのマルチプラットフォーム開発フレームワークを選択する際に注意すべきいくつかの重要なポイントも紹介します。</p>
<chapter title="クロスプラットフォームアプリ開発フレームワークとは？"
         id="what-is-a-cross-platform-app-development-framework">
    <p>モバイルエンジニアは、クロスプラットフォームモバイル開発フレームワークを使用して、AndroidやiOSなどの複数のプラットフォーム向けに、単一のコードベースでネイティブのような外観のアプリケーションを構築します。共有可能なコードは、このアプローチがネイティブアプリ開発に対して持つ主要な利点の1つです。
        単一のコードベースを持つことは、モバイルエンジニアがオペレーティングシステムごとにコードを書く手間を省き、開発プロセスを加速できることを意味します。</p>
</chapter>
<chapter title="人気のクロスプラットフォームアプリ開発フレームワーク"
         id="popular-cross-platform-app-development-frameworks">
    <p>このリストがすべてではありません。今日、市場には他にも多くの選択肢が存在します。重要なのは、すべての人にとって理想的な「万能なツール」は存在しないということを認識することです。
        フレームワークの選択は、特定のプロジェクトや目標、および記事の最後で説明するその他の詳細事項に大きく依存します。</p>
    <p>それでも、決定の出発点となるように、クロスプラットフォームモバイル開発のための優れたフレームワークをいくつか選び出しました。</p>
    <chapter title="Kotlin Multiplatform" id="kotlin-multiplatform">
        <p><a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform (KMP)</a> は、JetBrainsによって構築されたオープンソーステクノロジーであり、ネイティブプログラミングの利点を維持しながら、プラットフォーム間でコードを共有することを可能にします。これにより、開発者は必要なだけコードを再利用し、必要に応じてネイティブコードを記述し、共有されたKotlinコードを任意のプロジェクトにシームレスに統合できます。モダンな宣言型クロスプラットフォームUIフレームワークである <a
                    href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> とKotlinを併用することで、UIを含むアプリコードを最大100%共有できます。</p>
        <p>
            <control>プログラミング言語:</control>
            Kotlin
        </p>
        <p>
            <control>モバイルアプリの例:</control>
            Duolingo、McDonald's、Netflix、Forbes、9GAG、Cash App、Philips。<a
                href="https://kotlinlang.org/case-studies/?type=multiplatform">Kotlin Multiplatformのケーススタディの詳細を読む</a>。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>開発者は、Android、iOS、Web、デスクトップ、サーバーサイドでコードを再利用でき、必要に応じてネイティブコードを保持できます。</p></li>
            <li><p>Kotlin Multiplatformは、あらゆるプロジェクトにシームレスに統合できます。開発者は、ネイティブ開発とクロスプラットフォーム開発の両方を最大限に活用しながら、プラットフォーム固有のAPIを利用できます。</p></li>
            <li><p> <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> のおかげで、開発者は完全なコード共有の柔軟性を備え、ロジックとUIの両方を共有できます。
            </p></li>
            <li><p>Androidで既にKotlinを使用している場合、コードベースに新しい言語を導入する必要はありません。既存のKotlinコードと専門知識を再利用できるため、他のテクノロジーと比較してKotlin Multiplatformへの移行はリスクが低くなります。</p></li>
        </list>
        <p>このクロスプラットフォームモバイル開発フレームワークはリストの中で最も新しいものの1つですが、成熟したコミュニティを持っています。2023年11月、JetBrainsはこれをStable（安定版）へと昇格させました。Google I/O 2024では、Googleが<a
                    href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">AndroidとiOSの間でビジネスロジックを共有するためのKotlin Multiplatformの公式サポート</a>を発表しました。定期的に更新される<a href="get-started.topic">ドキュメント</a>やコミュニティのサポートにより、いつでも疑問への回答を見つけることができます。さらに、多くの<a
                    href="https://kotlinlang.org/case-studies/?type=multiplatform">グローバル企業やスタートアップが既にKotlin Multiplatformを使用して</a>、ネイティブに近いユーザーエクスペリエンスを備えたマルチプラットフォームアプリを開発しています。</p>
        <p><a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html"><img
                src="kmp-journey-start.svg" alt="Kick off your Kotlin Multiplatform journey" width="700"/></a></p>
    </chapter>
    <chapter title="Flutter" id="flutter">
        <p>2017年にGoogleによってリリースされたFlutterは、単一のコードベースからモバイル、Web、デスクトップアプリを構築するための人気のあるフレームワークです。
            Flutterでアプリケーションを構築するには、DartというGoogleのプログラミング言語を使用する必要があります。</p>
        <p>
            <control>プログラミング言語:</control>
            Dart
        </p>
        <p>
            <control>モバイルアプリの例:</control>
            eBay Motors、Alibaba、Google Pay、ByteDanceのアプリ。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>Flutterのホットリロード（hot reload）機能により、コードを修正するとすぐにアプリケーションの変化を確認でき、再コンパイルの手間が省けます。</p></li>
            <li><p>Flutterは、開発者がデジタルエクスペリエンスを構築するのを支援するデザインシステムであるGoogleのMaterial Designをサポートしています。
                アプリを構築する際に、複数のビジュアルおよび動作ウィジェットを使用できます。</p></li>
            <li><p>FlutterはWebブラウザのテクノロジーに依存しません。代わりに、ウィジェットを描画するための独自のレンダリングエンジンを持っています。</p></li>
        </list>
        <p>Flutterは世界中に比較的活発なユーザーコミュニティを持ち、多くの開発者に広く使用されています。
            <a href="https://insights.stackoverflow.com/trends?tags=flutter%2Creact-native">Stack Overflow Trends</a>によると、対応するタグの使用増加に基づき、Flutterの使用率は時間の経過とともに上昇傾向にあります。</p>
        <note>
            <p><a href="kotlin-multiplatform-flutter.md">Kotlin MultiplatformとFlutterを詳しく比較</a>して、それぞれの強みを理解し、クロスプラットフォーム開発に最適なものを選んでください。</p>
        </note>
    </chapter>
    <chapter title="React Native" id="react-native">
        <p>オープンソースのUIソフトウェアフレームワークであるReact Nativeは、Meta Platforms（旧Facebook）によって2015年に開発されました。FacebookのJavaScriptライブラリであるReactに基づいており、開発者はネイティブにレンダリングされるクロスプラットフォームモバイルアプリを構築できます。</p>
        <p>
            <control>プログラミング言語:</control>
            JavaScript
        </p>
        <p>
            <control>モバイルアプリの例:</control>
            React Nativeは、MicrosoftのOffice、Skype、Xbox Game Pass、MetaのFacebook、デスクトップ版Messenger、Oculusなどで使用されています。詳細は <a href="https://reactnative.dev/showcase">React Native showcase</a> で確認してください。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>ファストリフレッシュ (Fast Refresh) 機能により、開発者はReactコンポーネントへの変更を即座に確認できます。</p></li>
            <li><p>React Nativeの利点の1つは、UIに重点を置いていることです。ReactプリミティブはネイティブプラットフォームのUIコンポーネントにレンダリングされるため、カスタマイズされたレスポンシブなユーザーインターフェースを構築できます。</p></li>
            <li><p>バージョン0.62以降では、React NativeとモバイルアプリデバッガーのFlipperとの統合がデフォルトで有効になっています。FlipperはAndroid、iOS、React Nativeアプリのデバッグに使用され、ログビューアー、インタラクティブなレイアウトインスペクター、ネットワークインスペクターなどのツールを提供します。</p></li>
        </list>
        <p>最も人気のあるクロスプラットフォームアプリ開発フレームワークの1つとして、React Nativeには技術知識を共有する大規模で強力な開発者コミュニティがあります。このコミュニティのおかげで、フレームワークを使用してモバイルアプリを構築する際に必要なサポートを受けることができます。</p>
    </chapter>
    <chapter title="Ionic" id="ionic">
        <p>Ionicは、2013年にリリースされたオープンソースのモバイルUIツールキットです。HTML、CSS、JavaScriptなどのWebテクノロジーを使用し、Angular、React、Vueフレームワークとの統合により、単一のコードベースからクロスプラットフォームモバイルアプリケーションを構築するのを支援します。</p>
        <p>
            <control>プログラミング言語:</control>
            JavaScript
        </p>
        <p>
            <control>モバイルアプリの例:</control>
            T-Mobile、BBC (Children's &amp; Education apps)、EA Games。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>Ionicは、モバイルOS向けに特別に設計されたSaaS UIフレームワークに基づいており、アプリケーション構築のための複数のUIコンポーネントを提供します。</p></li>
            <li><p>Ionicフレームワークは、CordovaおよびCapacitorプラグインを使用して、カメラ、フラッシュライト、GPS、オーディオレコーダーなどのデバイスの内蔵機能へのアクセスを提供します。</p></li>
            <li><p>Ionicは独自のコマンドラインインターフェースであるIonic CLIを持っており、Ionicアプリケーションを構築するためのメインツールとして機能します。</p></li>
        </list>
        <p>Ionic Framework Forumでは常に活動が行われており、コミュニティメンバーが知識を交換し、開発の課題を克服するために助け合っています。</p>
    </chapter>
    <chapter title=".NET MAUI" id="net-maui">
        <p>.NET Multi-platform App UI (.NET MAUI) は、2022年5月にリリースされたMicrosoft所有のクロスプラットフォームフレームワークです。開発者はC#とXAMLを使用して、ネイティブのモバイルおよびデスクトップアプリを作成できます。.NET MAUIは、Xamarinがサポートするプラットフォームにネイティブコントロールを提供するXamarinの機能の1つであるXamarin.Formsが進化したものです。</p>
        <p>
            <control>プログラミング言語:</control>
            C#, XAML
        </p>
        <p>
            <control>モバイルアプリの例:</control>
            NBC Sports Next, Escola Agil, Irth Solutions。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>.NET MAUIは、GPS、加速度計、バッテリーやネットワークの状態などのネイティブデバイス機能にアクセスするためのクロスプラットフォームAPIを提供します。</p></li>
            <li><p>マルチターゲティングを使用してAndroid、iOS、macOS、Windowsをターゲットにできる単一のプロジェクトシステムがあります。</p></li>
            <li><p>.NETホットリロード（hot reload）のサポートにより、開発者はアプリの実行中にマネージドソースコードを修正できます。</p></li>
        </list>
        <p>.NET MAUIはまだ比較的新しいフレームワークですが、既に開発者の間で注目を集めており、Stack OverflowやMicrosoft Q&amp;Aに活発なコミュニティがあります。</p>
    </chapter>
    <chapter title="Uno Platform" id="uno-platform">
        <p>Uno Platformは、単一の共有コードベースからモダンなクロスプラットフォーム.NETアプリを構築するための、柔軟なオープンソーステクノロジースタックです。エンタープライズグレードのデザインツールやコンテキストに応じたAIツールを備えたUno Platformは、C#やXAMLを使用して、ネイティブモバイル、デスクトップ、組み込み、およびWebAssemblyアプリケーションを構築する開発者の生産性を向上させます。Uno Platformは、WinUI/UWPプログラミングモデルをWindows以外の複数のプラットフォームにもたらしたことで最もよく知られており、.NET開発者が幅広いターゲットにわたってスキルとコードを再利用することを可能にします。</p>
        <p>
            <control>プログラミング言語:</control>
            C#, XAML
        </p>
        <p>
            <control>アプリの例:</control>
            トヨタやKahuaから移行されたアプリ、TradeZero、SkiaSharpベースのエンタープライズアプリケーション。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>Uno Platformを使用すると、開発者はAndroid、iOS、WebAssembly (WASM)、macOS、Linux、Windowsを含むプラットフォーム間で単一のUIとビジネスロジックレイヤーを共有しながら、ネイティブプラットフォームの機能にアクセスできます。単一のコードベースとプロジェクト構造をサポートし、WinUI互換のAPIを使用して複数のプラットフォームで同じアプリケーションを実行するためにマルチターゲティングが使用されます。</p></li>
            <li><p>Uno Platform Studioと組み合わせることで、.NET開発者は生産性を大幅に向上させることができます。これには、最速のC#/XAML開発ループを実現するホットリロード (Hot Reload) 付きのHot Designビジュアルデザイナー、コンテキストに応じたAIインテリジェンスのための信頼性の高いAIエージェント/MCPツール、およびテクノロジースタックの柔軟性が含まれ、あらゆるOS、IDE、AIエージェントからクロスプラットフォームアプリを構築できます。</p></li>
        </list>
        <p>Uno Platformには強力なオープンソースコミュニティがあり、エンタープライズ向けや基幹業務向け（LOB）アプリケーション、特に既に.NETエコシステムに投資しているチームに広く採用されています。</p>
    </chapter>
    <chapter title="NativeScript" id="nativescript">
        <p>このオープンソースのモバイルアプリケーション開発フレームワークは、2014年に最初にリリースされました。NativeScriptを使用すると、JavaScript、またはTypeScriptのようにJavaScriptにトランスパイルされる言語、およびAngularやVue.jsなどのフレームワークを使用して、AndroidおよびiOSモバイルアプリを構築できます。</p>
        <p>
            <control>プログラミング言語:</control>
            JavaScript, TypeScript
        </p>
        <p>
            <control>モバイルアプリの例:</control>
            Daily Nanny, Strudel, Breethe。
        </p>
        <p>
            <control>主な特徴:</control>
        </p>
        <list>
            <li><p>NativeScriptを使用すると、開発者はネイティブのAndroidおよびiOS APIに簡単にアクセスできます。</p></li>
            <li><p>フレームワークはプラットフォームネイティブのUIをレンダリングします。NativeScriptで構築されたアプリは、WebView（Androidアプリケーションがアプリ内でWebコンテンツを表示できるようにするAndroid OSのシステムコンポーネント）に依存せず、ネイティブデバイス上で直接動作します。</p></li>
            <li><p>NativeScriptは、サードパーティのソリューションを必要とせず、さまざまなプラグインや構築済みのアプリテンプレートを提供しています。</p></li>
        </list>
        <p>NativeScriptはJavaScriptやAngularなどのよく知られたWebテクノロジーに基づいているため、多くの開発者がこのフレームワークを選択しています。とはいえ、通常は小規模な企業やスタートアップで使用されています。</p>
    </chapter>
</chapter>
<chapter title="プロジェクトに適したクロスプラットフォームアプリ開発フレームワークをどう選ぶか？"
         id="how-do-you-choose-the-right-cross-platform-app-development-framework-for-your-project">
    <p>上記以外にも他のクロスプラットフォームフレームワークがあり、新しいツールも市場に登場し続けるでしょう。幅広い選択肢がある中で、次のプロジェクトに最適なものをどのように見つければよいでしょうか。最初のステップは、プロジェクトの要件と目標を理解し、将来のアプリがどのような外観になるかについて明確なイメージを持つことです。次に、ビジネスに最適なものに決定できるよう、以下の重要な要素を考慮に入れる必要があります。</p>
    <chapter title="1. チームの専門知識" id="1-the-expertise-of-your-team">
        <p>クロスプラットフォームモバイル開発フレームワークによって、ベースとなるプログラミング言語が異なります。フレームワークを採用する前に、どのようなスキルが必要かを確認し、モバイルエンジニアのチームがそれを扱うための十分な知識と経験を持っていることを確認してください。</p>
        <p>例えば、チームに熟練したJavaScript開発者が揃っており、新しいテクノロジーを導入するためのリソースが不足している場合は、React Nativeなどのこの言語を使用するフレームワークを選択する価値があるかもしれません。</p>
    </chapter>
    <chapter title="2. ベンダーの信頼性とサポート" id="2-vendor-reliability-and-support">
        <p>フレームワークのメンテナーが長期にわたってサポートを継続するかどうかを確認することが重要です。検討しているフレームワークを開発・サポートしている企業について詳しく調べ、それらを使用して構築されたモバイルアプリを確認してください。</p>
    </chapter>
    <chapter title="3. UIのカスタマイズ" id="3-ui-customization">
        <p>将来のアプリにとってユーザーインターフェースがいかに重要かに応じて、特定のフレームワークを使用してUIをどれほど簡単にカスタマイズできるかを知る必要があるかもしれません。例えば、Kotlin Multiplatformは、JetBrainsによるモダンな宣言型クロスプラットフォームUIフレームワークである <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> により、完全なコード共有の柔軟性を提供します。これにより、開発者はAndroid、iOS、Web、デスクトップ（JVM経由）でUIを共有でき、KotlinとJetpack Composeに基づいています。</p>
        <p><a href="https://www.jetbrains.com/compose-multiplatform/"><img src="explore-compose.svg"
                                                                           alt="Explore Compose Multiplatform"
                                                                           width="700"/></a></p>
    </chapter>
    <chapter title="4. フレームワークの成熟度" id="4-framework-maturity">
        <p>検討中のフレームワークのパブリックAPIやツールがどの程度の頻度で変更されるかを確認してください。例えば、ネイティブオペレーティングシステムのコンポーネントに対する一部の変更が、内部のクロスプラットフォームの動作を壊すことがあります。モバイルアプリ開発フレームワークを扱う際に直面する可能性のある課題を事前に把握しておくのが賢明です。また、GitHubを閲覧して、フレームワークにどれくらいのバグがあるか、それらのバグがどのように処理されているかを確認することもできます。</p>
    </chapter>
    <chapter title="5. フレームワークの機能" id="5-framework-capabilities">
        <p>各フレームワークには独自の機能と制限があります。フレームワークがどのような機能やツールを提供しているかを知ることは、最適なソリューションを特定するために不可欠です。コードアナライザーやユニットテストフレームワークはありますか？アプリの構築、デバッグ、テストをどれほど迅速かつ簡単に行えるでしょうか？</p>
    </chapter>
    <chapter title="6. セキュリティ" id="6-security">
        <p>支払いシステムを含む銀行や eコマースアプリなど、ビジネスにとって重要なモバイルアプリを構築する場合、セキュリティとプライバシーは特に重要です。<a
                    href="https://owasp.org/www-project-mobile-top-10/">OWASP Mobile Top 10</a> によると、モバイルアプリケーションにおける最も重大なセキュリティリスクには、安全でないデータストレージや認証・認可が含まれます。</p>
        <p>選択したマルチプラットフォームモバイル開発フレームワークが必要なレベルのセキュリティを提供していることを確認する必要があります。1つの方法は、公開されているものがあれば、フレームワークのイシュートラッカーでセキュリティ関連のチケットを閲覧することです。</p>
    </chapter>
    <chapter title="7. 学習教材" id="7-educational-materials">
        <p>フレームワークに関する利用可能な学習リソースの量と質も、それを使用する際のエクスペリエンスがどれほどスムーズになるかを理解するのに役立ちます。包括的な公式 <a href="get-started.topic">ドキュメント</a>、オンラインおよびオフラインのカンファレンス、教育コースなどは、必要な時に製品に関する重要な情報を十分に見つけられるという良い兆候です。</p>
        <p>例えば、<a href="kmp-learning-resources.md">Kotlin Multiplatformの学習教材の包括的なリスト</a>をまとめました。</p>
    </chapter>
</chapter>
<chapter title="重要なポイント" id="key-takeaways">
    <p>これらの要因を考慮せずに、特定のニーズに最も合致するクロスプラットフォームモバイル開発のためのフレームワークを選択することは困難です。将来のアプリケーション要件を詳しく調べ、さまざまなフレームワークの機能と比較検討してください。そうすることで、高品質なアプリをリリースするための適切なクロスプラットフォームソリューションを見つけることができるでしょう。</p>
</chapter>
<chapter title="よくある質問" id="frequently-asked-questions">
    <p>
        <control>Q: クロスプラットフォームアプリ開発フレームワークとは何ですか？</control>
    </p>
    <p>A: クロスプラットフォームアプリ開発フレームワークとは、共有コードを使用して複数のプラットフォーム向けのアプリを構築するためのツールとライブラリのセットです。Android、iOS、デスクトップ、Webなどのプラットフォームをサポートしながら、必要に応じてプラットフォーム固有のコードを記述することも可能です。</p>
    <p>
        <control>Q: なぜ複数のクロスプラットフォームアプリ開発フレームワークが存在するのですか？</control>
    </p>
    <p>A: プロジェクトごとに要件が異なるため、複数のクロスプラットフォームアプリ開発フレームワークが存在します。これらのフレームワークは、ツール、サポートされるプラットフォーム、エコシステムの成熟度などの面で異なります。</p>
    <p>
        <control>Q: クロスプラットフォームアプリ開発フレームワークが人気になる理由は何ですか？</control>
    </p>
    <p>A: 強力なツール、明確なドキュメント、信頼性の高いプラットフォームサポート、および活発なコミュニティを提供する場合、そのフレームワークは人気になります。また、広く使用され、定期的にメンテナンスされていることも、人気を維持する要因となります。</p>
    <p>
        <control>Q: クロスプラットフォームアプリ開発フレームワークはモバイルアプリ専用ですか？</control>
    </p>
    <p>A: いいえ。多くのフレームワークは主にモバイルアプリに使用されますが、アーキテクチャやサポートされているターゲットに応じて、Webやデスクトップなどの追加プラットフォームをサポートできるものもあります。</p>
    <p>
        <control>Q: クロスプラットフォームアプリ開発フレームワークはネイティブプラットフォームの機能をサポートしていますか？</control>
    </p>
    <p>A: はい。ほとんどのフレームワークは、プラットフォームAPI、プラグイン、またはブリッジメカニズムを通じてネイティブプラットフォームの機能へのアクセスを提供します。これにより、共通のコードを共有しながら、プラットフォーム固有の機能をサポートすることができます。</p>
    <p>
        <control>Q: 開発者はどのようにして異なるクロスプラットフォームアプリ開発フレームワークを評価すべきですか？</control>
    </p>
    <p>A: 開発者は、プラットフォームのサポート、ツールの品質、エコシステムの成熟度、パフォーマンスのニーズ、および長期的な保守性に基づいてフレームワークを評価する必要があります。また、各フレームワークがネイティブAPIとどの程度うまく統合され、チームのスキルやワークフローに適合するかを考慮することも有用です。</p>
</chapter>
</topic>