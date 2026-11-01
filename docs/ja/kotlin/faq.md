[//]: # (title: よくある質問 (FAQ))

<web-summary>Kotlin は JetBrains によって開発された、簡潔なマルチプラットフォームプログラミング言語です。</web-summary>

### Kotlin とは何ですか？ {id="what-is-kotlin"}

Kotlin は、JVM、Android、JavaScript、Wasm、および Native をターゲットとするオープンソースの静的型付けプログラミング言語です。
[JetBrains](https://www.jetbrains.com) によって開発されています。プロジェクトは 2010 年に開始され、ごく初期の段階からオープンソースとして公開されていました。
最初の公式リリースである 1.0 は 2016 年 2 月にリリースされました。

### Kotlin の現在のバージョンは何ですか？ {id="what-is-the-current-version-of-kotlin"}

現在リリースされているバージョンは %kotlinVersion% で、%kotlinReleaseDate% に公開されました。  
詳細は [GitHub](https://github.com/jetbrains/kotlin) で確認できます。

### Kotlin は無料ですか？ {id="is-kotlin-free"}

はい。Kotlin は無料であり、これまでも無料でしたし、今後も無料であり続けます。Apache 2.0 ライセンスの下で開発されており、ソースコードは [GitHub](https://github.com/jetbrains/kotlin) で入手できます。

### Kotlin はオブジェクト指向言語ですか、それとも関数型言語ですか？ {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin はオブジェクト指向と関数型の両方の構成要素を備えています。オブジェクト指向スタイルと関数型スタイルの両方で使用することも、両方の要素を混在させて使用することもできます。
高階関数、関数型、ラムダなどのファーストクラスのサポートを備えているため、関数型プログラミングを実践または探求したい場合にも Kotlin は優れた選択肢となります。

### Java プログラミング言語と比較して、Kotlin にはどのような利点がありますか？ {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin はより簡潔です。大まかな試算では、コード行数がおよそ 40% 削減されるとされています。
また、型安全性も向上しています。たとえば、非 null 許容型（non-nullable types）のサポートにより、アプリケーションで NPE（NullPointerException）が発生しにくくなります。
スマートキャスト、高階関数、拡張関数、レシーバー付きラムダなどの他の機能により、表現力豊かなコードを作成できるだけでなく、DSL の作成も容易になります。
 
### Kotlin は Java プログラミング言語と互換性がありますか？ {id="is-kotlin-compatible-with-the-java-programming-language"}

はい。Kotlin は Java プログラミング言語と 100% の相互運用性があり、既存のコードベースが Kotlin と適切に連携できるようにすることに大きな重点が置かれています。[Java から Kotlin コードを呼び出す](java-to-kotlin-interop.md)ことも、[Kotlin から Java コードを呼び出す](java-interop.md)ことも簡単にできます。これにより、導入がはるかに容易になり、リスクも低くなります。また、既存コードの移行を簡素化する [IDE に組み込まれた自動 Java から Kotlin へのコンバーター](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)もあります。

### Kotlin は何に使用できますか？ {id="what-can-i-use-kotlin-for"}

Kotlin は、バックエンド、クライアントサイド Web、Android、マルチプラットフォームライブラリなど、あらゆる種類の開発に使用できます。
現在 Kotlin/Native の開発も進んでおり、組み込みシステム、macOS、iOS などの他のプラットフォームもサポートされています。
モバイルおよびサーバーサイドアプリケーション、JavaScript や JavaFX を使用したクライアントサイド、データサイエンスなど、多様な用途で Kotlin が活用されています。

### Android 開発に Kotlin を使用できますか？ {id="can-i-use-kotlin-for-android-development"}

はい。Kotlin は Android において第一級言語（first-class language）としてサポートされています。Basecamp、Pinterest など、すでに何百ものアプリケーションが Android 向けに Kotlin を使用しています。詳細については、[Android 開発に関するリソース](android-overview.md)をご覧ください。

### バックエンド開発に Kotlin を使用できますか？ {id="can-i-use-kotlin-for-backend-development"}

はい。Kotlin は JVM と 100% 互換性があるため、Spring Boot、vert.x、JSF などの既存のフレームワークを使用できます。さらに、[Ktor](https://github.com/kotlin/ktor) のように Kotlin で書かれた専用フレームワークもあります。詳細については、[バックエンド開発の概要](server-overview.md)をご覧ください。

### Web 開発に Kotlin を使用できますか？ {id="can-i-use-kotlin-for-web-development"}

はい。バックエンド Web 開発では、Kotlin は [Ktor](https://ktor.io/) や [Spring](https://spring.io/) などのフレームワークとうまく連携し、サーバーサイドアプリケーションを効率的に構築できます。さらに、クライアントサイド Web 開発には Kotlin/Wasm を使用できます。[Kotlin/Wasm の始め方](wasm-get-started.md)をご覧ください。

### デスクトップ開発に Kotlin を使用できますか？ {id="can-i-use-kotlin-for-desktop-development"}

はい。JavaFX、Swing、その他の Java UI フレームワークを使用できます。さらに、[TornadoFX](https://github.com/edvin/tornadofx) などの Kotlin 専用フレームワークもあります。

### ネイティブ開発に Kotlin を使用できますか？ {id="can-i-use-kotlin-for-native-development"}

はい。Kotlin の一部として Kotlin/Native が利用可能です。Kotlin を VM なしで実行できるネイティブコードにコンパイルします。主要なデスクトップおよびモバイルプラットフォームのほか、一部の IoT デバイスでも試すことができます。詳細については、[Kotlin/Native のドキュメント](native-overview.md)をご覧ください。

### Kotlin をサポートしている IDE はどれですか？ {id="what-ides-support-kotlin"}

Kotlin は、JetBrains が開発した公式 Kotlin プラグインにより、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/kotlin/get-started) で標準で完全サポートされています。
また、Kotlin Language Server を搭載した公式の [Visual Studio Code 向け Kotlin by JetBrains 拡張機能](kotlin-lsp.md#kotlin-in-visual-studio-code)（[アルファ版](components-stability.md#stability-levels-explained)）をインストールすることもできます。

その他の IDE やコードエディタには、Kotlin コミュニティがサポートするプラグインのみが存在します。

ブラウザ上で Kotlin コードを記述、実行、共有できる [Kotlin Playground](https://play.kotlinlang.org) もお試しいただけます。
さらに、アプリケーションのコンパイルと実行を直接サポートする[コマンドラインコンパイラ](command-line.md)も利用可能です。
  
### Kotlin をサポートしているビルドツールは何ですか？ {id="what-build-tools-support-kotlin"}

JVM 側では、主なビルドツールとして [Gradle](gradle.md) と [Maven](maven.md) があります。
また、クライアントサイド JavaScript をターゲットとするビルドツールもいくつか利用可能です。

### Kotlin は何にコンパイルされますか？ {id="what-does-kotlin-compile-down-to"}

JVM をターゲットとする場合、Kotlin は Java 互換のバイトコードを生成します。

JavaScript をターゲットとする場合、設定されたターゲットに応じて ES5、ES2015、または ES2020 コードを生成できます。生成されるコードは、AMD や CommonJS を含むモジュールシステムと互換性があります。

ネイティブをターゲットとする場合、Kotlin は（LLVM を介して）プラットフォーム固有のコードを生成します。

### Kotlin はどのバージョンの JVM をターゲットとしていますか？ {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin では、実行対象の JVM バージョンを選択できます。デフォルトでは、Kotlin/JVM コンパイラは Java 8 互換のバイトコードを生成します。
より新しいバージョンの Java で利用可能な最適化を活用したい場合は、ターゲットの Java バージョンを 9 から 26 の間で明示的に指定できます。ただし、その場合、生成されたバイトコードは古いバージョンでは動作しない可能性があることに注意してください。
[Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8) 以降、コンパイラは Java 8 未満のバージョンと互換性のあるバイトコードの生成をサポートしていません。

### Kotlin は難しいですか？ {id="is-kotlin-hard"}

Kotlin は、Java、C#、JavaScript、Scala、Groovy などの既存の言語から着想を得ています。誰もが気軽に参加し、数日のうちに Kotlin の読み書きができるよう、学習しやすさに配慮して設計されています。
Kotlin らしい書き方（idiomatic Kotlin）を習得し、より高度な機能を使用するには少し時間がかかるかもしれませんが、全体として複雑な言語ではありません。  
詳細については、[学習資料](learning-materials-overview.md)をご覧ください。
 
### どのような企業が Kotlin を使用していますか？ {id="what-companies-are-using-kotlin"}
 
Kotlin を使用している企業は多すぎてすべてを挙げることはできませんが、ブログ記事、GitHub リポジトリ、講演などを通じて Kotlin の使用を公表している代表的な企業としては、[Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、[Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI)、[Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/) などがあります。
 
### Kotlin は誰が開発していますか？ {id="who-develops-kotlin"}

Kotlin は、[JetBrains（現在のチーム規模は 100 人以上）](https://www.jetbrains.com/)のエンジニアチームによって開発されています。
リード言語デザイナーは Michail Zarečenskij です。コアチームに加えて、GitHub 上には 250 人以上の外部コントリビューターも参加しています。

### Kotlin についてさらに詳しく学ぶにはどうすればよいですか？ {id="where-can-i-learn-more-about-kotlin"}

まずは[公式 Web サイト](https://kotlinlang.org)から始めるのが最適です。
Kotlin を始めるには、[公式 IDE](kotlin-ide.md) のいずれかをインストールするか、[オンラインで試す](https://play.kotlinlang.org)ことができます。

### Kotlin に関する書籍はありますか？ {id="are-there-any-books-on-kotlin"}

Kotlin に関する書籍は多数出版されています。そのうち、私たちがレビューし、入門としておすすめできる書籍を[書籍](books.md)ページに掲載しています。その他の書籍については、コミュニティが管理する [kotlin.link](https://kotlin.link/) のリストをご覧ください。

### Kotlin のオンラインコースはありますか？ {id="are-any-online-courses-available-for-kotlin"}

JetBrains Academy の [Kotlin Core トラック](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)では、実際に動作するアプリケーションを作成しながら Kotlin の要点をすべて学ぶことができます。

受講可能なその他のコース：
* Kevin Jones による [Pluralsight コース: Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started)
* Hadi Hariri による [O'Reilly コース: Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/)

また、[公式 YouTube チャンネル](https://www.youtube.com/c/Kotlin)でその他のチュートリアルやコンテンツもご覧いただけます。

### Kotlin にはコミュニティがありますか？ {id="does-kotlin-have-a-community"}

はい！Kotlin には非常に活気のあるコミュニティがあります。Kotlin 開発者は、[Kotlin フォーラム](https://discuss.kotlinlang.org)や [StackOverflow](https://stackoverflow.com/questions/tagged/kotlin) に集まっており、特に [Kotlin Slack](https://slack.kotlinlang.org)（2020 年 4 月時点で 30,000 人近くのメンバーが参加）ではより活発に交流が行われています。

### Kotlin のイベントはありますか？ {id="are-there-kotlin-events"}
 
はい！現在では Kotlin に特化したユーザーグループやミートアップが数多く存在します。[Web サイトのリスト](https://kotlinlang.org/user-groups/user-group-list.html)で確認できます。
さらに、世界各地でコミュニティ主催の [Kotlin Nights](kotlin-night-guidelines.md) イベントが開催されています。

### Kotlin のカンファレンスはありますか？ {id="is-there-a-kotlin-conference"}

はい！[KotlinConf](https://kotlinconf.com/) は JetBrains が主催する年次カンファレンスであり、世界中から開発者、愛好家、専門家が集まり、Kotlin に関する知識や経験を共有します。

技術セッションやワークショップに加えて、KotlinConf ではネットワーキングの機会、コミュニティとの交流、参加者同士（Kotliner）がつながってアイデアを交換できるソーシャルイベントも提供されます。
Kotlin エコシステム内でのコラボレーションとコミュニティ形成を促進するプラットフォームとして機能しています。

Kotlin は世界中のさまざまなカンファレンスでも取り上げられています。[Web サイトで今後の講演リスト](https://kotlinlang.org/community/talks.html?time=upcoming)を確認できます。

### Kotlin のソーシャルメディアはありますか？ {id="is-kotlin-on-social-media"}

はい。
[Kotlin YouTube チャンネル](https://www.youtube.com/c/Kotlin)の登録や、[Twitter](https://twitter.com/kotlin) または [Bluesky](https://bsky.app/profile/kotlinlang.org) での Kotlin のフォローをお願いします。

### 他に Kotlin のオンラインリソースはありますか？ {id="any-other-online-kotlin-resources"}

Web サイトには、コミュニティメンバーによる [Kotlin Digests](https://kotlin.link)、[ニュースレター](http://kotlinweekly.net)、[ポッドキャスト](https://talkingkotlin.com)など、多数の[オンラインリソース](https://kotlinlang.org/community/)が用意されています。

### 高解像度の Kotlin ロゴはどこで入手できますか？ {id="where-can-i-get-an-hd-kotlin-logo"}

ロゴは[こちら](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)からダウンロードできます。
ロゴを使用する際は、アーカイブ内の `guidelines.pdf` に記載されているシンプルなルール、および [Kotlin ブランド使用ガイドライン](https://kotlinfoundation.org/guidelines/)に従ってください。

詳細については、[Kotlin ブランドアセット](kotlin-brand-assets.md)のページをご覧ください。