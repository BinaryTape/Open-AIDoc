[//]: # (title: カスタムコンパイラープラグイン)

> KotlinコンパイラープラグインAPIは不安定（unstable）であり、すべてのリリースで破壊的変更が導入されます。
> 
{style="warning"}

コンパイラープラグインは、コンパイラー自体を変更することなく、コンパイル処理にフックしてコードのコンパイル中にコードを解析または変更します。例えば、コードにアノテーションを付加したり、他のフレームワークやAPIとの互換性を持たせるために新しいコードを生成したりできます。

独自のカスタムコンパイラープラグインを作成する前に、ユースケースに適したものが既に存在しないか、[利用可能なコンパイラープラグインの一覧](compiler-plugins-overview.md)を確認してください。

また、目的を達成するために [Kotlin Symbol Processing（KSP）API](https://kotlinlang.org/docs/ksp-overview.html) や [Android lint](https://developer.android.com/studio/write/lint) などの外部リンターを使用できないかも確認できます。

それでも必要なものが見つからない場合に限り、カスタムコンパイラープラグインを作成できます。ただし、KotlinコンパイラープラグインAPIは**不安定（unstable）**であることに注意してください。新しいコンパイラーのリリースごとに破壊的変更が導入されるため、プラグインの保守には継続的に多大な労力を費やす必要があります。

### Kotlinコンパイラーとコンパイラープラグイン {id="the-kotlin-compiler-and-compiler-plugins"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements-->
<list columns="2">
    <li>
        <p></p>
        <br/>
        <img src="compiler-stages.svg" width="400" alt="Kotlin compiler stages"/>
    </li>
    <li>
        <p>Kotlinコンパイラーの処理の流れ：</p>
        <ol>
            <li>ソースコードをパースし、構造化された構文木（syntax tree）に変換します。</li>
            <li>コードの意味を特定し、名前の解決、型のチェック、可視性ルールの適用を行うことで、コードを解析および解決（resolve）します。</li>
            <li>ソースコードとマシンコードの架け橋となるデータ構造である、中間表現（IR: Intermediate Representation）を生成します。</li>
            <li>IRを段階的により単純な形式へと変換（lowering）します。</li>
            <li>変換されたIRを、JVMバイトコード、JavaScript、ネイティブマシンコードなどのターゲット固有の出力に変換します。</li>
        </ol>
    </li>
</list>

プラグインは、フロントエンドAPIを通じてコンパイラーの初期ステージに影響を与え、コンパイラーがコードを解決する方法を変更できます。
例えば、プラグインによってアノテーションを追加したり、本文（body）を持たない新しいメソッドを導入したり、可視性修飾子を変更したりできます。これらの変更はIDE上にも反映されます。

また、プラグインはバックエンドAPIを通じて後半のステージにも影響を与え、宣言の挙動を変更できます。これらの変更は、コンパイル完了後に生成されるバイナリに現れます。

実際には、コンパイラープラグインは解析と解決からコード生成に至るまでのステージに影響を与え、フロントエンドとバックエンドの両方をカバーします。例えば、フロントエンド部分で宣言を生成し、バックエンド部分でそれらの宣言に本文を追加します。

![プラグインを含むKotlinコンパイラーステージ](compiler-stages-with-plugins.svg){width=650}

[Kotlin serializationプラグイン](https://github.com/Kotlin/kotlinx.serialization)が良い例です。このプラグインのフロントエンド部分は、コンパニオンオブジェクトやシリアライザー関数を追加するほか、名前の競合を防ぐためのチェックを行います。バックエンド部分は、`KSerializer` オブジェクトを介して目的のシリアライズ動作を実装します。

### Kotlinコンパイラープラグインテンプレート {id="kotlin-compiler-plugin-template"}

カスタムコンパイラープラグインの作成を開始するには、[Kotlinコンパイラープラグインテンプレート](https://github.com/Kotlin/compiler-plugin-template)を使用できます。
その後、フロントエンドおよびバックエンドのプラグインAPIから拡張ポイント（extension points）を登録します。

> 現在、カスタムコンパイラープラグインの開発は [Gradle](gradle.md) でのみ可能です。
> 
{style="note"}

### フロントエンドプラグインAPI {id="frontend-plugin-api"}

フロントエンド中間表現（FIR: frontend intermediate representation）としても知られるフロントエンドプラグインAPIには、解決処理をカスタマイズするための以下の特殊な拡張ポイントが用意されています。

| 拡張機能名 | 説明 |
|---|---|
| [`FirAdditionalCheckersExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/checkers/src/org/jetbrains/kotlin/fir/analysis/extensions/FirAdditionalCheckersExtension.kt) | カスタムのコンパイラーチェッカーを追加します。 |
| [`FirDeclarationGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/providers/src/org/jetbrains/kotlin/fir/extensions/FirDeclarationGenerationExtension.kt) | 新しい宣言を生成します。 |
| [`FirExtensionSessionComponent`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirExtensionSessionComponent.kt) | プラグインの他の部分で使用されるカスタムコンポーネントを `FirSession` に登録します。 |
| [`FirFunctionTypeKindExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirFunctionTypeKindExtension.kt) | 関数型の新しいファミリを定義します。 |
| [`FirMetadataSerializerPlugin`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/fir-serialization/src/org/jetbrains/kotlin/fir/serialization/FirMetadataSerializerPlugin.kt) | 宣言のメタデータへの情報の読み書きを行います。 |
| [`FirStatusTransformerExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirStatusTransformerExtension.kt) | 可視性やモダリティ（modality）など、宣言のステータス属性を変更します。 |
| [`FirSupertypeGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirSupertypeGenerationExtension.kt) | 既存のクラスに新しいスーパータイプを追加します。 |
| [`FirTypeAttributeExtension`]( https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirTypeAttributeExtension.kt) | 型アノテーションに基づいて、特定の型に特別な属性を追加します。 |

#### IDEの統合 {id="ide-integration"}

解決処理の変更はコードのハイライトやコード補完などのIDEの挙動に影響を与えるため、プラグインがIDEと互換性を持っていることが重要です。IntelliJ IDEAおよびAndroid Studioの各バージョンには、Kotlinコンパイラーの開発バージョンが含まれています。このバージョンはIDE専用であり、リリース版のKotlinコンパイラーとバイナリ互換性がありません。
そのため、IDEをアップデートする際には、動作を維持するためにコンパイラープラグインもアップデートする必要があります。この理由から、コミュニティプラグインはデフォルトではロードされません。

カスタムコンパイラープラグインが異なるIDEバージョンで動作することを確認するには、各IDEバージョンに対してテストを実施し、見つかった問題を修正してください。

Kotlinコンパイラープラグイン用のdevkitが利用可能になれば、複数のIDEバージョンのサポートがより容易になる可能性があります。この機能に関心がある場合は、[課題トラッカー](https://youtrack.jetbrains.com/issue/KT-82617)でフィードバックを共有してください。

### バックエンドプラグインAPI {id="backend-plugin-api"}

> バックエンドプラグインの開発は、IDEやデバッガーのパフォーマンスを低下させず正しく行うことが難しいため、変更は慎重かつ控えめに行ってください。
> 
{style="warning"}

IRとしても知られるバックエンドプラグインAPIには、単一の拡張ポイント [`IrGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/ir/backend.common/src/org/jetbrains/kotlin/backend/common/extensions/IrGenerationExtension.kt) があります。
この拡張ポイントを使用し、`generate()` 関数をオーバーライドして、フロントエンドによって既に生成された宣言に本文を追加したり、既存の宣言の本文を変更したりします。

この拡張ポイントを介して行われた変更は、コンパイラーによって**チェックされません**。このステージにおいて、コンパイラーが期待する前提を自分の変更が壊さないよう保証する必要があります。例えば、誤って無効な型、不正な関数参照、または正しいスコープ外の参照を導入してしまう可能性があります。

#### バックエンドプラグインのコードを調べる {id="explore-backend-plugin-code"}

Kotlin serializationプラグインのコードを調べることで、バックエンドプラグインのコンパイラーコードが実際にはどのように記述されているかを確認できます。
例えば、[`SerializableCompanionIrGenerator.kt`](https://github.com/JetBrains/kotlin/blob/master/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt) は、主要なシリアライザーメンバーの欠落している本文を補完します。その一例が [`generateChildSerializersGetter()`](https://github.com/JetBrains/kotlin/blob/9cfa558902abc13d245c825717026af63ef82dd2/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt#L242) 関数であり、これは `KSerializer` 式のリストを収集して配列として返します。

#### バックエンドプラグインのコードの問題を確認する {id="check-your-backend-plugin-code-for-problems"}

バックエンドプラグインコードの問題は、次の3つの方法で確認できます。

1. **IRの検証**

    IRツリーをビルドし、`Xverify-ir` コンパイラーオプションを有効にします。このオプションはコンパイル速度に影響を与えるため、テスト時のみ使用してください。

2. **IR出力のダンプと差分の比較**

    コンパイラーオプション `-Xphases-to-dump-before=ExternalPackageParentPatcherLowering` を使用して、IRローワリングのコンパイルステージ後にダンプファイルを作成します。JVMバックエンドの場合は、`-Xdump-directory=<your-file-directory>` コンパイラーオプションでダンプ先ディレクトリを設定します。手動で期待されるコードを記述して別のダンプファイルを生成し、2つを比較して違いがあるかどうかを確認します。

3. **コンパイラーコードのデバッグ**

    `convertToIr.kt` ファイル内の `convertToIrAndActualize()` 関数にブレークポイントを追加し、コンパイラーをデバッグモードで実行することで、コンパイル中のより詳細な情報を取得します。

### プラグインのテスト {id="test-your-plugin"}

プラグインを実装したら、徹底的にテストしてください。[Kotlinコンパイラープラグインテンプレート](https://github.com/Kotlin/compiler-plugin-template) は、[Kotlinコンパイラーテストフレームワーク](https://github.com/JetBrains/kotlin/blob/master/compiler/test-infrastructure/ReadMe.md) を使用するようにあらかじめセットアップされています。
以下のディレクトリにテストを追加できます。

* `compiler-plugin/testData`
* コード生成テスト用の `compiler-plugin/testData/box`
* 診断（diagnostics）テスト用の `compiler-plugin/testData/diagnostics`

テストが実行されると、フレームワークは以下を行います：

1. テストソースファイルをパースします（例: [`anotherBoxTest.kt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.kt)）。
2. ファイルごとにFIRとIRをビルドします。
3. これらをテキストのダンプファイルとして書き込みます（例: [`anotherBoxTest.fir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.txt) および [`anotherBoxTest.fir.ir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.ir.txt)）。
4. 以前に作成されたファイルが存在する場合は、それらと比較します。

これらのファイルを使用して、生成された差分に意図しない変更が含まれていないか確認できます。問題がなければ、新しいダンプファイルが最新の「_ゴールデン（golden）_」ファイル（将来の変更を比較するための承認された信頼できるソース）になります。

### サポートを受ける {id="get-help"}

カスタムコンパイラープラグインの開発で問題が発生した場合は、[Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) の [#compiler](https://slack-chats.kotlinlang.org/c/compiler) チャンネルでお問い合わせください。解決を保証することはできませんが、可能な限りサポートいたします。