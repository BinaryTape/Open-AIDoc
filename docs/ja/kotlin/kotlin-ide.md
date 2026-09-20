[//]: # (title: Kotlin 開発用 IDE)

<web-summary>JetBrains は、IntelliJ IDEA、Android Studio、および Visual Studio Code に対して公式の Kotlin IDE サポートを提供しています。</web-summary>

JetBrains は、以下の IDE およびコードエディタに対して公式の Kotlin サポートを提供しています：[IntelliJ IDEA](#intellij-idea) および [Android Studio](#android-studio)。
また、[Visual Studio Code](#visual-studio-code) 向けの公式な Kotlin by JetBrains 拡張機能をインストールすることもできます。
これは現在 [Alpha](components-stability.md#stability-levels-explained) 段階です。

その他の IDE やコードエディタには、Kotlin コミュニティがサポートするプラグインのみが存在します。

## IntelliJ IDEA {id="intellij-idea"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) は、開発者の生産性を最大化するために設計された、Kotlin や Java などの JVM 言語向けの IDE です。
インテリジェントなコード補完、静的コード解析、およびリファクタリングを提供することで、日常的で反復的なタスクを自動化します。
これにより、ソフトウェア開発の創造的な側面に集中できるようになり、生産性が向上するだけでなく、楽しい開発体験を実現します。

Kotlin プラグインは、IntelliJ IDEA の各リリースに同梱されています。
各 IDEA のリリースでは、IDE での Kotlin 開発者のエクスペリエンスを向上させる新機能やアップグレードが導入されます。
Kotlin に関する最新のアップデートと改善点については、[IntelliJ IDEA の新機能](https://www.jetbrains.com/idea/whatsnew/)を参照してください。

IntelliJ IDEA の詳細については、[公式ドキュメント](https://www.jetbrains.com/help/idea/discover-intellij-idea.html)をご覧ください。

## Android Studio {id="android-studio"}

[Android Studio](https://developer.android.com/studio) は、[IntelliJ IDEA](https://www.jetbrains.com/idea/) をベースにした Android アプリ開発の公式 IDE です。
IntelliJ の強力なコードエディタと開発ツールに加え、Android Studio は Android アプリを構築する際の生産性を高めるさらなる機能を提供します。

Kotlin プラグインは、Android Studio の各リリースに同梱されています。

Android Studio の詳細については、[公式ドキュメント](https://developer.android.com/studio/intro)をご覧ください。

## Visual Studio Code {id="visual-studio-code"}
<primary-label ref="alpha"/>

[Visual Studio Code](https://code.visualstudio.com/) は、[公式の Kotlin by JetBrains 拡張機能](https://marketplace.visualstudio.com/items?itemName=JetBrains.kotlin-server)を含む、幅広い拡張機能を備えたコードエディタです。

Kotlin 拡張機能は、Kotlin Language Server を通じて、コード補完、ナビゲーション、デバッグ、その他の Kotlin 開発機能を提供します。

詳細については、[Kotlin Language Server と Visual Studio Code](kotlin-lsp.md#kotlin-in-visual-studio-code) を参照してください。

## その他の IDE サポート {id="other-ide-support"}

JetBrains は、他の IDE 向けの公式な Kotlin プラグインを提供していません。
他のコードエディタで [Kotlin Language Server](kotlin-lsp.md) を使用できます。

IDE 関連の機能（コード整形、デバッグツール、リファクタリングなど）がないテキストエディタで Kotlin を使用するには、Kotlin の [GitHub リリース](%kotlinLatestUrl%)から最新の Kotlin コマンドラインコンパイラ (`kotlin-compiler-%kotlinVersion%.zip`) をダウンロードし、[手動でインストール](command-line.md#manual-install)できます。
また、[Homebrew](command-line.md#homebrew)、[SDKMAN!](command-line.md#sdkman)、[Snap パッケージ](command-line.md#snap-package)などのパッケージマネージャーを使用することも可能です。

## Kotlin 言語バージョンとの互換性 {id="compatibility-with-the-kotlin-language-versions"}

IntelliJ IDEA と Android Studio では、Kotlin プラグインが各リリースに同梱されています。
新しい Kotlin バージョンがリリースされると、これらのツールは自動的に Kotlin を最新バージョンに更新することを提案します。
サポートされている最新の言語バージョンについては、[Kotlin リリース](releases.md#ide-support)を確認してください。

## IDE における AI サポート {id="ai-support-in-ides"}

IntelliJ IDEA と Android Studio は、組み込みの AI 機能や AI コーディングエージェントとの連携を通じて、AI を活用した Kotlin 開発をサポートしています。
ワークフローに応じて、IDE 内で直接 AI を利用したり、外部エージェントに接続したり、AI ツールと Kotlin 固有のガイダンスを組み合わせたりすることができます。

利用可能な AI ツールの概要およびそれらの使い分けについては、[](ai-for-development.md) を参照してください。

## 次のステップ {id="what-s-next"}

* [IntelliJ IDEA でコンソールアプリケーションを作成する](jvm-get-started.md)
* [Android Studio を使用して初めてのクロスプラットフォームモバイルアプリを作成する](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)