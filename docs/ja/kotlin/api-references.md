[//]: # (title: APIリファレンス)

<web-summary>標準ライブラリ、コルーチン、シリアライゼーションなどを含む、公式のKotlinライブラリおよびツールのAPIドキュメントをご覧ください。</web-summary>

Kotlin APIリファレンスページへようこそ。ここでは、公式のKotlinライブラリおよびツールのAPIドキュメントへのリンクを確認できます。

> Kotlin Multiplatformライブラリをお探しの場合は、[**klibs.io**](https://klibs.io)でそれらをご覧ください。
>
{style="tip"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2">
    <panel>
        <title>標準ライブラリ (stdlib)</title>
        <p>Kotlin標準ライブラリは、コレクション、テキストおよび文字列処理、レンジ、シーケンスなどの不可欠なAPIを含む、Kotlinプログラミングのコア機能を提供します。プラットフォーム固有のAPIを拡張し、それらを操作するためのKotlinファーストなAPIを提供します。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/core/kotlin-stdlib/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>テストライブラリ (kotlin.test)</title>
        <p>共通のテストアノテーションとユーティリティ関数を提供するマルチプラットフォームテストライブラリです。各プラットフォームで人気のあるテストフレームワークとの統合をサポートし、Kotlinエコシステム全体で統一されたテスト体験を提供します。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/core/kotlin-test/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>コルーチン (kotlinx.coroutines)</title>
        <p>Kotlinコルーチンを使用した非同期プログラミングのための強力なライブラリです。構造化された並行性、非同期ストリーム、ミューテックスやセマフォなどの同期プリミティブ、テストなどをサポートするツールを提供します。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.coroutines">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.coroutines/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>シリアライゼーション (kotlinx.serialization)</title>
        <p>マルチプラットフォームのシリアライゼーションライブラリです。KotlinオブジェクトをJSON、CBOR、Protocol Buffersなどのさまざまな形式に変換するための、型安全でコンパイル時に動作するメカニズムを提供します。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.serialization">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.serialization/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>Kotlin I/Oライブラリ (kotlinx-io)</title>
        <p>低レベルのI/O操作のためのマルチプラットフォームライブラリです。バイナリストリームやバッファへの読み書きのための抽象化を定義しており、すべてのKotlinプラットフォームにおいて効率的でポータブルになるよう設計されています。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-io">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-io/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>日付と時刻 (kotlinx-datetime)</title>
        <p>カレンダーベースの計算のためのマルチプラットフォームライブラリです。日付値の表現を提供し、タイムゾーン固有の操作をサポートします。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-datetime">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-datetime/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>不変コレクション (kotlinx.collections.immutable)</title>
        <p>不変（immutable）および永続（persistent）コレクションのインターフェースと実装を提供するマルチプラットフォームライブラリです。バージョン間で構造を共有する効率的なコピーオンライト（copy-on-write）操作を提供するため、コレクションを更新しても全体がコピーされることはありません。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.collections.immutable">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.collections.immutable/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>Kotlin Gradleプラグイン (kotlin-gradle-plugin)</title>
        <p>Kotlinコードのコンパイル、テスト、パッケージ化のためのKotlin Gradleプラグインです。これらのプラグインはJVMおよびマルチプラットフォームのビルドを簡素化し、依存関係を管理し、IDEやCIシステムと統合します。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlin-gradle-plugin/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>Ktor</title>
        <p>Kotlinを使用して、接続されたシステムで非同期クライアントおよびサーバーを構築するためのフレームワークです。Ktorはスケーラビリティと柔軟性を考慮して設計されており、非ブロッキングI/Oと構造化された並行性のためにコルーチンと深く統合されています。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/ktorio/ktor">GitHubで表示</a><br/><br/>
        <a href="https://api.ktor.io/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>JVMメタデータ (kotlin-metadata-jvm)</title>
        <p>JVMクラスファイルに保存されているKotlinメタデータを読み書きするためのライブラリです。主にアノテーションプロセッサ、静的解析ツール、コンパイラプラグインなどのツールで使用されます。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/kotlinx-metadata">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-metadata-jvm/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
    <panel>
        <title>Compose Multiplatform Material3</title>
        <p>Material Design 3コンポーネントを使用してユーザーインターフェースを構築するためのマルチプラットフォームライブラリです。APIリファレンスには、コンポーザブルをプレビューできるMaterial 3コンポーネントのギャラリーが含まれています。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/compose-multiplatform-core/tree/jb-main/compose/material3">GitHubで表示</a><br/><br/>
        <a href="https://kotlinlang.org/api/compose-multiplatform/material3/" as="button" icon="arrow-right" icon-position="right">APIを参照</a>
    </panel>
</panels>