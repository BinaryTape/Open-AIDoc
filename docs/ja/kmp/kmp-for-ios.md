<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="kmp-for-ios" title="iOS向けKotlin Multiplatform：統合、パフォーマンス、ワークフローに関する誤解">
<show-structure for="chapter,procedure" depth="1"/>
<web-summary>Kotlin MultiplatformはiOSで機能するのでしょうか？Swiftとの統合方法、パフォーマンスへの影響、そして実際のiOS開発ワークフローにどのように適合するかについて解説します。</web-summary>
<p>長年iOSアプリを開発してきた方なら、次のような疑問を抱いているかもしれません。「Kotlin Multiplatform（KMP）を使うとパフォーマンスが低下するのではないか？」「Swiftのパワーやエレガンスを諦めることになるのか？」「開発体験が二級品の回避策（workaround）のようになってしまうのではないか？」
    これらは、熟練したiOSエンジニアがKMPを検討する際によく抱く疑問です。</p>
<p>この記事では、実際の活用事例に基づき、iOS開発者がKotlin Multiplatformに対して抱く最も一般的な懸念事項を詳しく解説します。これにより、Kotlin Multiplatformを用いたiOS開発が実際にはどのようなものなのか、実用的な洞察を得ることができます。</p>
<chapter title="iOS開発者にとってのKotlin Multiplatformの意味" id="what-kotlin-multiplatform-means-for-ios-developers">
    <p>Kotlin Multiplatformは、単一のモジュールから大部分のビジネスロジック、さらには必要に応じて <a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a> を使用したUIに至るまで、意味のある範囲でコードを共有できるテクノロジーです。</p>
    <p>これはネイティブ開発を置き換えようとするものではありません。むしろ、何をネイティブのままにするかという完全な制御を維持しながら、プラットフォーム間でコードを共有できるようにするものです。</p>
    <p>高いレベルにおいて、KMPはチームに以下のことを可能にします：</p>
    <list>
        <li>ビジネスロジックをシームレスに共有する。</li>
        <li>KotlinコードをSwiftから呼び出し可能にする。</li>
        <li>Kotlinコード内でiOS APIの全機能を活用する。</li>
        <li>Compose Multiplatformを使用して、SwiftUIに埋め込み可能な画面を作成したり、UI全体をKotlinで構築したりする。</li>
        <li>KotlinコードからMapKitやAVFoundationなどのプラットフォーム固有のフレームワークを直接使用する。</li>
    </list>
    <p><a as="button" href="https://kotlinlang.org/multiplatform/" mode="rock" icon="arrow-right" icon-position="right">Kotlin Multiplatformを詳しく見る</a></p>
    <chapter title="KMPは単なる新たなクロスプラットフォーム抽象化レイヤーですか？" id="is-kmp-merely-another-cross-platform-abstraction-layer">
        <p>そうではありません。KMPはSwiftUIやUIKitを置き換えるものではなく、ネイティブ開発を補完するものです。</p>
        <p>実際には、以下のことが可能です：</p>
        <list>
            <li>ネイティブのSwiftコードを活用して、SwiftUIやUIKitでUIを作成する。</li>
            <li>ラッパーや間接的な処理を通さず、iOS APIに直接アクセスする。</li>
            <li>デフォルトですべてを共有するのではなく、価値がある場所にのみ共有コードを統合する。</li>
        </list>
    </chapter>
    <chapter id="is-kmp-useful-for-ios-developers" title="KMPはiOS開発者にとって本当に有用ですか？">
        <p>KMPはKotlinエコシステムの一部ですが、Androidだけに限定されたものではありません。iOSチームが独自の条件で使用できる、プラットフォーム間で機能を共有するための汎用的なアプローチです。</p>
        <p>ロジックの重複、プラットフォーム間での挙動の不一致、メンテナンスコストの増大に直面しているチームにとって特に有用です。共有レイヤーを使用することで、ネイティブの制御を完全に維持したまま重複を排除できます。</p>
        <p>核心となる原則はシンプルです：</p>
        <list>
            <li>ビジネスロジック、データ、ネットワーキングなど、共有することに意味があるものを共有する。</li>
            <li>プラットフォーム固有の機能など、ネイティブである必要があるものはネイティブに保つ。また、UIを共有にするかネイティブにするかはプロジェクトごとに選択する。</li>
            <li>必要に応じて、そのバランスを時間の経過とともに調整する。</li>
        </list>
    </chapter>
    <p>Kotlin MultiplatformはAndroid中心のソリューションではありません。ネイティブな体験を損なうことなく、開発チームの整合性を高めるのに役立つ多才なテクノロジーです。</p>
    <p>KMPには、パフォーマンス、複雑さ、ネイティブ制御の喪失などに関する誤解がつきまといがちですが、それらは実際の仕組みを正確に反映していません。経験に基づいた回答で、それらを紐解いていきましょう。</p>
</chapter>
<chapter title="誤解：クロスプラットフォームフレームワークはiOSのパフォーマンスと体験を損なう" id="myth-cross-platform-frameworks-compromise-ios-performance-and-experience">
    <p>よくある懸念は、Kotlin MultiplatformがiOSアプリのパフォーマンスや体験に悪影響を及ぼすというものです。この推測は、React Nativeのようにブリッジや独自のランタイムを使用するフレームワークでの過去の経験に基づいていることが多いです。</p>
    <p>KMPの動作は異なります。Swiftと同じツールチェーンファミリーであるLLVMを使用して、iOS用の共有コードを生成します。JavaScriptブリッジも、統合されたランタイムレイヤーも、コードとiOSの間の抽象化も存在しません。つまり、アプリは完全にネイティブなバイナリとして機能し続け、通常のiOS開発と変わらないパフォーマンス特性を維持します。</p>
</chapter>
<chapter title="誤解：Kotlin Multiplatformはニッチ、あるいはリスクのあるテクノロジーである" id="myth-kotlin-multiplatform-is-a-niche-or-risky-technology">
    <p>Kotlin Multiplatformに対して、まだ初期の実験的な段階という印象を持っているかもしれません。しかし、Kotlin Multiplatformは2023年11月に正式にStable（安定版）となり、サポートされているすべてのプラットフォームで本番環境への導入が可能です。KMPは、<a href="https://youtu.be/5lkZj4v4-ks?si=OHg0v60urRqxuZZi">Google</a>、<a href="https://2025.kotlinconf.com/talks/812400/">Duolingo</a>、<a href="https://medium.com/booking-com-development/kotlin-multiplatform-in-production-two-real-world-use-cases-from-booking-com-46ffe13a773d">Booking.com</a>、<a href="https://youtu.be/VVf6txPZk3Y?si=6PVoeS8Pa0-QHUsT">Sony</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://www.youtube.com/watch?v=HSIhkB5bGJs">McDonald's</a> といった有名企業の、実際の大規模なiOSアプリケーションで <a href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios">既に使用されています</a>。</p>
    <p>エコシステムも成熟し続けています。iOS向けのCompose Multiplatformは2025年にStableとなり、共有ビジネスロジックに加えて、本番品質の共有UIを構築することが可能になりました。Kotlin Multiplatform Survey 2025によると、KMPは現在、本番環境で実行可能なものと見なされており、プラグインユーザーの約70%が満足または非常に満足しており、約80%がCompose Multiplatformを使用しています。</p>
    <p><a as="button" href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios" mode="rock" icon="arrow-right" icon-position="right">実際のKMP活用事例を探索する</a></p>
    <p>KMPはKotlinの開発元であるJetBrainsによってサポートされています。これはサイドプロジェクトではなく、強力なツール、定期的なアップデート、成長を続けるエコシステムのサポートとともに進化し続ける戦略的な投資です。</p>
    <chapter title="それで、KMPを導入しても安全ですか？" id="is-it-safe-to-adopt-kmp">
        <p>KMPは、フィンテック、Eコマース、モビリティ、さらにはヘルスケア、メディア・エンターテインメント、旅行、物流など、幅広い業界の本番環境で鍛え上げられてきました。活発にメンテナンスとアップグレードが行われています。その上、段階的な導入が可能であるため、リスクを最小限に抑えることができます。</p>
        <p>最も重要な点は以下の通りです：</p>
        <list>
            <li>ベンダーロックインはなく、使用規模を拡大または縮小させることが可能です。</li>
            <li>共有コードの使用を止めたとしても、iOSアプリは完全にネイティブなままです。</li>
        </list>
        <p>Kotlin Multiplatformは、チームがアーキテクチャ全体を危険にさらすことなく、現実のクロスプラットフォームの課題に取り組むために現在使用している、成熟した本番対応のソリューションです。</p>
    </chapter>
</chapter>
<chapter title="誤解：Kotlin MultiplatformはAndroid開発者のためだけのものである" id="myth-kotlin-multiplatform-is-only-for-android-developers">
    <p>Kotlin Multiplatformはしばしば「Android優先」であり、iOS開発者は単にそれに従うだけであると誤解されがちです。</p>
    <p>Kotlinは汎用言語であり、KMPにおける共有コードはコードベースの単なる一側面に過ぎず、特定のプラットフォームが所有するものではありません。iOS開発者もそれを読み、貢献し、APIを形成し、クロスプラットフォームのデザインに影響を与えることができます。</p>
    <p>実際には、チームによって採用するモデルは異なります。多くのiOS開発者は、引き続き主にSwiftで（特にUIに重点を置いた機能の）開発を行い、共有ビジネスロジックは共同で、あるいはクロスプラットフォームコードに専念するエンジニアによって開発されます。</p>
    <p>これによりコラボレーションが向上します。チームはロジックの所有権を共有し、不整合を減らし、重複した労力をかける代わりに一度の修正で問題を解決できるようになります。</p>
    <chapter title="iOS開発者としての役割が疎かになりませんか？" id="will-you-be-sidelined-as-an-ios-developer">
        <p>KMPはiOSエンジニアの地位を下げるものではありません。ネイティブな体験の所有権を維持しながら、共有レイヤーへとその役割を広げ、対等な影響力を持つことを可能にします。選択すればiOSのUIをネイティブのままに保つことができますし、Swiftは引き続き不可欠であり、iOS開発者はプラットフォームに関する決定権を保持し続けます。</p>
    </chapter>
</chapter>
<chapter title="誤解：iOSのワークフローがより複雑になる" id="myth-my-ios-workflow-will-become-more-complicated">
    <p>KMPに関する主な懸念事項の一つは、確立されたiOSワークフローを乱す可能性があるということです。Objective-C → Swift → SwiftUI という変遷や進行中のツールチェーンの変化を経験してきた方にとって、「さらなる要素」を追加するという考えは疲弊を感じさせるかもしれません。この懸念は妥当です。だからこそ、Kotlin Multiplatformは一度にすべてを導入するのではなく、段階的に導入できるように設計されています。</p>
    <p>一夜にして全く新しいツールチェーンを受け入れる必要はありません。多くのiOS開発者にとって、KMPは単に共有モジュールを利用することから始めることができます。つまり、その有用性を評価する間、日常のワークフローは比較的影響を受けないままにできるということです。</p>
    <p>深く関わっていくにしても、学習曲線は緩やかであり、「全か無か」ではありません：</p>
    <list>
        <li>まずは共有されたKotlin APIを使用することから始める。</li>
        <li>共有コードを読み、トラブルシューティングができる程度のKotlinを理解する。</li>
        <li>意味がある場合に、共有ロジックへ貢献する。</li>
    </list>
    <chapter title="KMPの導入によってスピードは落ちますか？" id="will-adopting-kmp-slow-you-down">
        <p>設定を理解するための初期オーバーヘッドは多少あります。しかし、共有ロジックを使用し、並行した実装を避けることで時間は節約され、ツールの導入も予想以上に軽量です：</p>
        <list>
            <li>主要な環境としてXcodeを置き換える必要はありません。</li>
            <li>未知のUIフレームワークへの移行を強制されることもありません。</li>
            <li>ビルドシーケンスの複雑さは、通常、メインのiOSワークフローの外側で管理されます。</li>
        </list>
        <p>これまでと同じ方法でiOSアプリを作成し続けることができます。KMPはそこに共有レイヤーを追加するだけであり、全面的なリセットを要求することなく、さらなる自由を提供します。</p>
    </chapter>
</chapter>
<chapter title="誤解：Kotlin Multiplatformは非イディオマティックなSwift APIを生成する" id="myth-kotlin-multiplatform-produces-non-idiomatic-swift-apis">
    <p>Kotlin MultiplatformにおけるSwiftの相互運用性は、依然として大きな関心事です。現時点では、KotlinコードはObjective-Cブリッジを介してiOSに公開されるため、特に命名規則、Null許容性、ジェネリクス、非同期パターンにおいて、Swift APIが不自然（非イディオマティック）に感じられることがあります。</p>
    <p>確かに、適切に管理しなければSwiftらしくないと感じることもあります。しかし、iOSを考慮して共有コードを開発すれば、優れたSwift APIを作成することは可能です。以下にいくつかのベストプラクティスを挙げます：</p>
    <list>
        <li>APIをシンプルかつ意図的に保つ。</li>
        <li>適切に変換されないKotlinのパターンを避ける。</li>
        <li>必要に応じて薄いSwiftのラッパーを追加する。</li>
        <li>Xcodeで直接APIを検証する。</li>
    </list>
    <p>また、講演動画「<a href="https://youtu.be/P_5ZEtK05kc?si=qgnAPV5_MwAEn0RJ">Kotlin Multiplatform Alchemy: Making Gold out of Your Swift Interop</a>」も参考にしてください。</p>
    <p>Kotlinの新しいツール（特に <a href="https://kotlinlang.org/docs/native-swift-export.html">Swift Export</a>）は、Kotlin APIがより直接的かつイディオマティックにSwiftと統合され、摩擦をさらに軽減する未来へと向かっています。</p>
    <p>Swift ExportはObjective-Cレイヤーを排除することを目指しており、<a href="https://github.com/kotlin-hands-on/kotlin-swift-interopedia">Interopedia</a> は実用的なドキュメントとして、KotlinコードがどのようにSwiftに公開され、どのようなパターンを期待すべきかを開発者が理解するのを助けます。<a href="https://github.com/rickclephas/KMP-NativeCoroutines">KMP-NativeCoroutines</a> や <a href="https://github.com/touchlab/SKIE">SKIE</a> といったライブラリは、現在の相互運用モデルの荒削りな部分を滑らかにし、コルーチンのSwift async/awaitへのマッピングを改善し、生成されたAPIをよりSwiftフレンドリーにすることで、さらに一歩進んだ解決策を提供しています。</p>
</chapter>
<chapter title="誤解：UIを共有することはネイティブiOSの体験を失うことを意味する" id="myth-sharing-ui-means-losing-native-ios-experience">
    <p>よくある誤解として、Kotlin Multiplatformを使用するには完全にネイティブなiOS UIを諦める必要があるというものがあります。そんなことはありません。</p>
    <p>KMPはUIの共有を全く必要としません。基盤となる機能のみを共有し、残りをネイティブに保つことができます：</p>
    <list>
        <li>UIはネイティブのSwiftコードを活用して、SwiftUIやUIKitで記述できます。</li>
        <li>アニメーションやインタラクションは完全にネイティブなままにできます。</li>
        <li>プラットフォームAPIにはラッパーなしで直接アクセスできます。</li>
    </list>
</chapter>
    <chapter title="では、アプリはもうiOSアプリらしくなくなってしまうのでしょうか？" id="so-will-your-app-no-longer-feel-like-an-ios-app">
    <p>いいえ。ネイティブUIを捨てる必要はないからです。</p>
    </chapter>
    <chapter title="共有UIを使用しなければなりませんか？" id="do-you-have-to-use-a-shared-ui">
    <p>この戦略は完全にオプションであり、各チームによって決定されます。核となる前提はシンプルです。Kotlin Multiplatformはインターフェースの設計方法を制限しません。SwiftUIやUIKitで完全にネイティブなUIを維持することも、Compose Multiplatformで共有UIを導入することも、あるいはニーズに応じて両方のアプローチを組み合わせることもできます。</p>
    <p>ダッシュボードやコアな製品フローなど、最も頻繁に使用される画面は、最大限のパフォーマンスとプラットフォーム固有の洗練さを引き出せる完全にネイティブなUIで実装するのが適している場合が多いです。一方で、重要度の低いエリアにはCompose Multiplatformが強力にフィットします。設定ページや、認証のような頻度の低いフローなどは、共有Compose UIの理想的な候補です。そこでは、深いネイティブ最適化の必要性よりも、開発スピードとコードの再利用性が勝るからです。</p>
    <p>重要なのは、Compose Multiplatformと従来のiOS UIの間には相互運用性があるということです。つまり、共有コンポーネントをネイティブビューの隣に埋め込んだり、時間をかけて段階的に採用したりすることができます。これにより、チームは最初から単一のアプローチにコミットすることなく、UI戦略を進化させることができます。</p>
    </chapter>
<p><a as="button" href="https://kotlinlang.org/compose-multiplatform/" mode="rock" icon="arrow-right" icon-position="right">Compose Multiplatformを探索する</a>
    </p>
<chapter title="誤解：Kotlin Multiplatformを採用することは、Swiftを使わなくなることを意味する" id="myth-adopting-kotlin-multiplatform-means-no-more-swift">
    <p>よくある不安は、Kotlin Multiplatformを導入するとSwiftが廃れてしまうのではないかというものです。しかし、KMPはSwiftを置き換えるためにあるのではありません。Swiftは引き続きiOS開発において不可欠です。</p>
    <p>iOSアプリをiOSらしく感じさせるすべての要素については、引き続きSwiftでコードを書きます：</p>
    <list>
        <li>SwiftUIやUIKitを使用したUI。</li>
        <li>ナビゲーション、アニメーション、ユーザーインタラクション。</li>
        <li>プラットフォーム固有の機能と統合。</li>
        <li>アプリのライフタイムとシステムAPI。</li>
    </list>
    <p>KMPはその隣に共有レイヤーを追加するだけです。つまり、iOS開発者は引き続きネイティブな体験を所有し、共有ビジネスロジックはプラットフォームを越えた共同作業となることが多く、一部のiOSエンジニアはKotlinコードに貢献し、他のエンジニアは主にSwiftに専念するという形になります。</p>
    <chapter title="それで、Swiftを書くのをやめることになりますか？" id="will-you-stop-writing-swift">
    <p>いいえ、依然として時間の大部分をSwiftに費やすことになるでしょう。そして、クロスプラットフォーム・ロジックに対する新しい洞察を得て、共有アーキテクチャの決定に影響を与えるようになることで、あなたの役割は拡大します。</p>
</chapter>
</chapter>
<chapter title="既存プロジェクトへのKotlin Multiplatform iOS統合" id="kotlin-multiplatform-ios-integration-in-an-existing-project">
    <p>既存のアプリにKotlin Multiplatform iOS統合を導入する最良の方法は、小さく始めることです。アプリを作り直したり、すべてを再構築したり、初日から完全なクロスプラットフォーム・アプローチにコミットしたりする必要はありません。</p>
    <p>現実には、共有モジュールは通常、以下のようにiOS側に提供されます：</p>
    <list>
        <li>共通コードから作成されたFramework。</li>
        <li>ビルドターゲット間でデプロイするためのXCFramework。</li>
        <li>チームのワークフローに応じて、Swift Package Managerを使用した統合、あるいはカスタムセットアップ。</li>
    </list>
    <p>重要な点は、統合が本質的に侵襲的ではないということです。アプリのアーキテクチャ、UIレイヤー、または既存のSwiftコードを置き換えるわけではありません。iOSコードが意味のある場所ならどこでも使用できる共有モジュールを作成するだけです。</p>
    <p>そのため、実用的な開始地点は通常、以下のような小さく低リスクな領域になります：</p>
    <list>
        <li>データモデル</li>
        <li>バリデーションロジック</li>
        <li>ネットワーキング</li>
        <li>単一機能のモジュール</li>
    </list>
    <p>これにより、オリジナルのiOS体験を損なうことなく、KMPがコードベースにどのように適合するかをチームで確認できます。ほとんどのチームは段階的な導入を選択します。特定の問題を解決するために共通コードを導入し、メリットが実感できた場合にのみ拡大します。これにより、所有権の維持が容易になります。</p>
    <chapter title="どうすればKMPを安全に始められますか？" id="how-do-you-start-safely-with-kmp">
        <p>孤立した問題を一つ選び、スコープを限定し、KMPをリセットではなくプロジェクトへの「追加」として捉えてください。</p>
    </chapter>
</chapter>
<p>
    <a as="button" href="get-started.topic" mode="rock" icon="arrow-right" icon-position="right">Kotlin Multiplatformを始める</a>
    </p>
<chapter title="Kotlin Multiplatformが適している場合（と、そうでない場合）" id="when-kotlin-multiplatform-makes-sense-and-when-it-doesnt">
    <p>Kotlin Multiplatformが適しているのは、iOSとAndroidのロジックに重複があり、その重複が弊害になり始めている場合です。プラットフォーム間でビジネスルール、ネットワーキング、データ処理、またはドメインロジックを共有しながら、ネイティブなiOS体験を維持したいチームにとって特に価値があります。</p>
    <p>KMPは通常、以下のような場合に<b>適しています</b>：</p>
    <list>
        <li>iOSアプリとAndroidアプリが同じ基盤となる製品ロジックを使用している。</li>
        <li>チームが同じバグを二度解決している。</li>
        <li>プラットフォーム間の挙動が同期しなくなってきている。</li>
    </list>
    <p>以下のような場合には<b>不向き</b>かもしれません：</p>
    <list>
        <li>アプリケーションが極めてプラットフォーム固有である。</li>
        <li>複雑さの大部分がUIレイヤーにある。</li>
        <li>追加のセットアップや調整を正当化できるほどのロジックが存在しない。</li>
    </list>
</chapter>
<chapter title="結論" id="conclusion">
    <p>KMPを使用することで、メンテナンスが必要な共有レイヤーを追加しつつ、重複を削減できます。チーム間の調整が必要になり、一部の相互運用性やツールの複雑さを受け入れることになりますが、一貫性を達成し、ネイティブUIを維持することができます。</p>
    <p>Kotlin Multiplatformが最も効果を発揮するのは、共有コードが明確な価値（それが小さく特化したロジックであれ、より大きなドメインレイヤーであれ）を提供し、プラットフォーム側で処理すべき領域を侵害しない場合です。</p>
</chapter>
<chapter title="よくある質問" id="frequently-asked-questions">
    <deflist >
        <def title="AndroidとiOSの間で、現実的にどの程度のコードを共有できますか？">
            決まった割合はありません。ほとんどのチームはビジネスロジック、ネットワーキング、データレイヤーを共有します。正確な量はアプリやプラットフォーム間の重複度合いによって異なります。場合によっては、チームはCompose Multiplatformを使用してUIの一部を共有することを選択することもあります。その際も、iOSでネイティブなルック＆フィールを実現したり、SwiftUIやUIKitとシームレスに組み合わせたりすることが可能です。
        </def>
        <def title="Kotlin MultiplatformはiOSアプリのパフォーマンスに影響しますか？">
            本質的な影響はありません。共有コードはネイティブにコンパイルされるため、パフォーマンスは典型的なiOSコードと同等です。問題が発生するとすれば、それはコードの書き方に起因するものであり、KMPそのものによるものではありません。
        </def>
    </deflist>
    <p><b>AndroidとiOSの間で、現実的にどの程度のコードを共有できますか？</b></p>
    <p>決まった割合はありません。ほとんどのチームはビジネスロジック、ネットワーキング、データレイヤーを共有します。正確な量はアプリやプラットフォーム間の重複度合いによって異なります。Kotlin MultiplatformとCompose Multiplatformを使用すると、ネイティブAPIと統合しながら、UIを含むアプリコードの最大100%を共有することができます。</p>
    <p><b>Kotlin MultiplatformはiOSアプリのパフォーマンスに影響しますか？</b></p>
    <p>本質的な影響はありません。共有コードはネイティブにコンパイルされるため、パフォーマンスは典型的なiOSコードと同等です。</p>
    <p><b>Kotlin MultiplatformはSwiftとどのように連携しますか？</b></p>
    <p>共有されたKotlinコードは、Swiftが使用できるネイティブフレームワークに変換されます。現在のモデルでは、相互運用性はObjective-Cブリッジに依存しており、多少の摩擦が生じることがあります。今後はさらに進化し、JetBrainsのSwift ExportによってObjective-Cレイヤーを完全に取り除き、Swiftとのより直接的でイディオマティックな統合が可能になる予定です。</p>
    <p><b>iOS開発者がKMPを使用するためにKotlinを学ぶ必要はありますか？</b></p>
    <p>必ずしも必要ではありません。まずは共有されたKotlinコードを利用することから始め、デバッグや貢献が必要になった際、徐々にKotlinを学んでいくことができます。</p>
    <p><b>Kotlin MultiplatformでUIを共有する必要がありますか？</b></p>
    <p>いいえ、UIの共有はオプションです。多くのチームはiOSのUIを完全にネイティブに保ち、基盤となる機能のみを共有しています。しかし、結果として得られるものがiOS上でネイティブに感じられるため、UIコードを共有することを選択する企業も増えています。</p>
</chapter>
</topic>