[//]: # (title: FAQ)

<web-summary>KotlinはJetBrainsによって開発された、簡潔なマルチプラットフォームプログラミング言語です。</web-summary>

### Kotlinとは何ですか？ {id="what-is-kotlin"}

Kotlinは、JVM、Android、JavaScript、Wasm、およびNativeをターゲットとする、オープンソースの静的型付けプログラミング言語です。
[JetBrains](https://www.jetbrains.com)によって開発されています。プロジェクトは2010年に開始され、かなり早い段階からオープンソース化されました。
最初の公式リリースであるバージョン1.0は2016年2月でした。

### Kotlinの現在のバージョンは何ですか？ {id="what-is-the-current-version-of-kotlin"}

現在のリリースバージョンは %kotlinVersion% で、%kotlinReleaseDate% に公開されました。  
詳細は[GitHub](https://github.com/jetbrains/kotlin)で確認できます。

### Kotlinは無料ですか？ {id="is-kotlin-free"}

はい。Kotlinは無料であり、これまでも、そしてこれからも無料です。Apache 2.0ライセンスの下で開発されており、ソースコードは[GitHub](https://github.com/jetbrains/kotlin)で公開されています。

### Kotlinはオブジェクト指向言語ですか、それとも関数型言語ですか？ {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlinにはオブジェクト指向と関数型の両方の構成要素があります。オブジェクト指向（OO）スタイルと関数型（FP）スタイルの両方で使用することも、両方の要素を組み合わせることもできます。
高階関数、関数型、ラムダなどの機能が第一級オブジェクトとしてサポートされているため、関数型プログラミングを行ったり、探究したりする場合にKotlinは最適な選択肢となります。

### Javaプログラミング言語と比較して、Kotlinにはどのような利点がありますか？ {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlinはより簡潔です。大まかな見積もりでは、コードの行数を約40%削減できると言われています。
また、より型安全です。たとえば、非 null 型（non-nullable types）のサポートにより、アプリケーションで NPE（NullPointerException）が発生しにくくなります。
他にも、スマートキャスト、高階関数、拡張関数、レシーバ付きラムダなどの機能により、表現力豊かなコードを書くことができ、DSLの作成も容易になります。
 
### KotlinはJavaプログラミング言語と互換性がありますか？ {id="is-kotlin-compatible-with-the-java-programming-language"}

はい。KotlinはJavaプログラミング言語と100%の相互運用性があり、既存のコードベースがKotlinと適切に連携できるようにすることに重点が置かれています。[JavaからKotlinのコードを呼び出したり](java-to-kotlin-interop.md)、[KotlinからJavaのコードを呼び出したり](java-interop.md)することが簡単にできます。これにより、導入がはるかに容易になり、リスクも低減されます。また、既存のコードの移行を簡素化するために、[IDEには自動のJavaからKotlinへのコンバーター](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)も組み込まれています。

### Kotlinは何に使用できますか？ {id="what-can-i-use-kotlin-for"}

Kotlinは、バックエンド、クライアントサイドWeb、Android、マルチプラットフォームライブラリなど、あらゆる種類の開発に使用できます。
現在開発中のKotlin/Nativeにより、組み込みシステム、macOS、iOSなどの他のプラットフォームもサポートされます。
モバイルやサーバーサイドのアプリケーション、JavaScriptやJavaFXを使用したクライアントサイド、データサイエンスなど、多くの分野でKotlinが使用されています。

### Android開発にKotlinを使用できますか？ {id="can-i-use-kotlin-for-android-development"}

はい。KotlinはAndroidで第一級言語（first-class language）としてサポートされています。BasecampやPinterestなど、すでに何百ものアプリケーションがAndroidでKotlinを使用しています。詳細については、[Android開発に関するリソース](android-overview.md)を確認してください。

### バックエンド開発にKotlinを使用できますか？ {id="can-i-use-kotlin-for-backend-development"}

はい。KotlinはJVMと100%の互換性があるため、Spring Boot、vert.x、JSFなどの既存のフレームワークをそのまま使用できます。さらに、[Ktor](https://github.com/kotlin/ktor)のようにKotlinで書かれた特定のフレームワークもあります。詳細については、[バックエンド開発の概要](server-overview.md)を確認してください。

### Web開発にKotlinを使用できますか？ {id="can-i-use-kotlin-for-web-development"}

はい。バックエンドのWeb開発において、Kotlinは[Ktor](https://ktor.io/)や[Spring](https://spring.io/)などのフレームワークとうまく連携し、サーバーサイドアプリケーションを効率的に構築できます。さらに、クライアントサイドのWeb開発にはKotlin/Wasmを使用できます。
[Kotlin/Wasmの始め方](wasm-get-started.md)をご覧ください。

### デスクトップ開発にKotlinを使用できますか？ {id="can-i-use-kotlin-for-desktop-development"}

はい。JavaFX、Swingなどの任意のJava UIフレームワークを使用できます。
さらに、[TornadoFX](https://github.com/edvin/tornadofx)のようなKotlin固有のフレームワークもあります。

### ネイティブ開発にKotlinを使用できますか？ {id="can-i-use-kotlin-for-native-development"}

はい。Kotlin/NativeがKotlinの一部として利用可能です。KotlinをVMなしで実行できるネイティブコードにコンパイルします。
主要なデスクトップやモバイルプラットフォーム、さらには一部のIoTデバイスでも試すことができます。
詳細については、[Kotlin/Nativeのドキュメント](native-overview.md)を確認してください。

### どのIDEがKotlinをサポートしていますか？ {id="what-ides-support-kotlin"}

Kotlinは、JetBrainsが開発した公式のKotlinプラグインにより、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/)および[Android Studio](https://developer.android.com/kotlin/get-started)で標準でフルサポートされています。
また、Kotlin Language Server（[アルファ](components-stability.md#stability-levels-explained)段階）を搭載した公式の[Kotlin by JetBrains extension for Visual Studio Code](kotlin-lsp.md#kotlin-in-visual-studio-code)をインストールすることもできます。

その他のIDEやコードエディターには、コミュニティがサポートするKotlinプラグインのみが存在します。

また、ブラウザ上でKotlinコードを記述、実行、共有できる[Kotlin Playground](https://play.kotlinlang.org)を試すこともできます。
さらに、アプリケーションのコンパイルと実行を直接サポートする[コマンドラインコンパイラ](command-line.md)も利用可能です。
  
### どのビルドツールがKotlinをサポートしていますか？ {id="what-build-tools-support-kotlin"}

JVM側では、主なビルドツールとして[Gradle](gradle.md)と[Maven](maven.md)があります。
また、クライアントサイドJavaScriptをターゲットとするビルドツールもいくつか利用可能です。

### Kotlinは何にコンパイルされますか？ {id="what-does-kotlin-compile-down-to"}

JVMをターゲットにする場合、KotlinはJava互換のバイトコードを生成します。

JavaScriptをターゲットにする場合、Kotlinは設定されたターゲットに応じてES5、ES2015、またはES2020コードを生成できます。このコードは、AMDやCommonJSなどのモジュールシステムと互換性があります。

ネイティブをターゲットにする場合、Kotlinは（LLVMを介して）プラットフォーム固有のコードを生成します。

### KotlinはどのバージョンのJVMをターゲットにしていますか？ {id="which-versions-of-jvm-does-kotlin-target"}

Kotlinでは実行用のJVMバージョンを選択できます。デフォルトでは、Kotlin/JVMコンパイラはJava 8互換のバイトコードを生成します。
新しいバージョンのJavaで利用可能な最適化を活用したい場合は、ターゲットのJavaバージョンを9から26まで明示的に指定できます。ただし、その場合、生成されたバイトコードは古いバージョンでは動作しない可能性があることに注意してください。
[Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8)以降、コンパイラはJava 8より前のバージョンと互換性のあるバイトコードの生成をサポートしていません。

### Kotlinは難しいですか？ {id="is-kotlin-hard"}

Kotlinは、Java、C#、JavaScript、Scala、Groovyなどの既存の言語からインスピレーションを得ています。数日あればKotlinの読み書きができるようになり、誰でもすぐに使い始められるように、学習しやすさを重視して設計されています。
慣習的（イディオマティック）なKotlinを習得し、より高度な機能を使用するには少し時間がかかるかもしれませんが、全体としては複雑な言語ではありません。  
詳細については、[学習資料](learning-materials-overview.md)を確認してください。
 
### どのような企業がKotlinを使用していますか？ {id="what-companies-are-using-kotlin"}
 
Kotlinを使用している企業は多すぎて書ききれませんが、ブログ投稿、GitHubリポジトリ、講演などを通じてKotlinの使用を公言している著名な企業には、
[Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、[Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI)、
および[Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/)などがあります。
 
### 誰がKotlinを開発していますか？ {id="who-develops-kotlin"}

Kotlinは、[JetBrains（現在のチーム規模は100名以上）](https://www.jetbrains.com/)のエンジニアチームによって開発されています。
リード言語デザイナーはMichail Zarečenskijです。コアチームに加えて、GitHubには250名以上の外部コントリビューターがいます。

### Kotlinについてもっと詳しく知るにはどこに行けばよいですか？ {id="where-can-i-learn-more-about-kotlin"}

最初にチェックすべき場所は[公式ウェブサイト](https://kotlinlang.org)です。
Kotlinを始めるには、[公式IDE](kotlin-ide.md)をインストールするか、[オンラインで試す](https://play.kotlinlang.org)ことができます。

### Kotlinに関する本はありますか？ {id="are-there-any-books-on-kotlin"}

Kotlinに関する本は多数出版されています。その中には、私たちがレビューし、入門としてお勧めできるものもあります。それらは[Books](books.md)ページにリストされています。その他の書籍については、[kotlin.link](https://kotlin.link/)にあるコミュニティがメンテナンスしているリストを参照してください。

### Kotlinのオンラインコースはありますか？ {id="are-any-online-courses-available-for-kotlin"}

JetBrains Academyの[Kotlin Coreトラック](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)では、実際に動作するアプリケーションを作成しながらKotlinの基本をすべて学ぶことができます。

他にも受講可能なコースがいくつかあります：
* [Pluralsight Course: Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started)（講師：Kevin Jones）
* [O'Reilly Course: Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/)（講師：Hadi Hariri）

また、私たちの[YouTubeチャンネル](https://www.youtube.com/c/Kotlin)にある他のチュートリアルやコンテンツもチェックしてみてください。

### Kotlinにはコミュニティがありますか？ {id="does-kotlin-have-a-community"}

はい！Kotlinには非常に活気のあるコミュニティがあります。Kotlin開発者は、[Kotlinフォーラム](https://discuss.kotlinlang.org)、
[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin)、そしてより活発な[Kotlin Slack](https://slack.kotlinlang.org)
（2020年4月時点で3万人近いメンバーが参加）に集まっています。

### Kotlinのイベントはありますか？ {id="are-there-kotlin-events"}
 
はい！現在、Kotlinだけに焦点を当てた多くのユーザーグループやミートアップが存在します。[ウェブサイトにリスト](https://kotlinlang.org/user-groups/user-group-list.html)があります。
さらに、世界中でコミュニティ主催の[Kotlin Nights](https://kotlinlang.org/community/events.html)イベントが開催されています。

### Kotlinのカンファレンスはありますか？ {id="is-there-a-kotlin-conference"}

はい！[KotlinConf](https://kotlinconf.com/)は、JetBrainsが主催する年次カンファレンスで、世界中から開発者、愛好家、専門家が集まり、Kotlinに関する知識や経験を共有します。

技術的なセッションやワークショップに加えて、KotlinConfではネットワーキングの機会、コミュニティとの交流、ソーシャルイベントも提供されており、参加者は仲間のKotlinユーザーとつながり、アイデアを交換できます。
これは、Kotlinエコシステム内でのコラボレーションとコミュニティ形成を促進するためのプラットフォームとして機能しています。

また、Kotlinは世界中のさまざまなカンファレンスでも取り上げられています。[今後予定されている講演のリスト](https://kotlinlang.org/community/talks.html?time=upcoming)はウェブサイトで確認できます。

### Kotlinはソーシャルメディアを利用していますか？ {id="is-kotlin-on-social-media"}

はい。 
[Kotlin YouTubeチャンネル](https://www.youtube.com/c/Kotlin)を購読し、[Twitter](https://twitter.com/kotlin)または[Bluesky](https://bsky.app/profile/kotlinlang.org)でKotlinをフォローしてください。

### 他にオンラインのKotlinリソースはありますか？ {id="any-other-online-kotlin-resources"}

ウェブサイトには、コミュニティメンバーによる[Kotlin Digests](https://kotlin.link)、[ニュースレター](http://kotlinweekly.net)、[ポッドキャスト](https://talkingkotlin.com)など、多くの[オンラインリソース](https://kotlinlang.org/community/)が用意されています。

### HDのKotlinロゴはどこで入手できますか？ {id="where-can-i-get-an-hd-kotlin-logo"}

ロゴは[こちら](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)からダウンロードできます。
ロゴを使用する際は、アーカイブ内の `guidelines.pdf` に記載されている簡単なルールと、[Kotlin brand usage guidelines](https://kotlinfoundation.org/guidelines/)に従ってください。

詳細については、[Kotlinブランドアセット](kotlin-brand-assets.md)に関するページを確認してください。