[//]: # (title: インクリメンタル処理)

KSPはインクリメンタル処理をサポートしています。KSPは、1つ以上の依存関係が変更された場合にのみファイルを再処理します。これにより、不要な再処理を回避し、コンパイル時間を短縮します。

インクリメンタル処理はデフォルトで有効になっています。トラブルシューティングの際や、フルリビルドを強制する必要がある場合には無効にすることができます。無効にするには、`gradle.properties` ファイルに以下の行を追加してください。

```
ksp.incremental=false
```

## ダーティなファイル

ファイルは、開発者によって直接変更されたか、他のダーティなファイルでの変更によって間接的に影響を受けた場合、*ダーティ*（再処理が必要な状態）であると見なされます。

どのソースがダーティであるかを判断するために、KSPは生成された出力とそれに対応する入力ソースを関連付けるプロセッサに依存しています。KSPはこれらの関連付けを使用して、変更が発生したときに再処理が必要なソースを特定します。

KSPは、最小限のルートソース（root sources）のセットのみを必要とします。プロセッサは、コード構造をナビゲートするための開始点としてこれらのソースを使用します。

ルートソースとは、以下のいずれかのメソッドから直接シンボルが取得されるソースファイルのことです。

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

プロセッサは、ルートソースからの情報を解決（resolve）することで、他のソースファイルから追加のシンボルを取得できます。KSPはこれらの依存関係を自動的に追跡します。

出力を生成するとき、プロセッサはその出力に寄与するルートソースを宣言する必要があります。KSPは、それらのルートソースと追跡された依存関係を使用して、いつ出力を再生成する必要があるかを判断します。

> 出力ファイルの作成と入力・出力の関連付けには、`CodeGenerator` インターフェースを使用してください。詳細については、[ソースコード内の `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt) を参照してください。
>
{style="tip"}

### アグリゲート型とアイソレート型の出力

KSPは、生成された出力を「アグリゲート（集約）型」と「アイソレート（分離）型」の2つのタイプに分類します。

> Gradleのアノテーション処理とは異なり、KSPではプロセッサ全体ではなく、個々の出力に対して分類を適用することに注意してください。
>
{style="note"}

<deflist collapsible="true">
<def title="アグリゲート型 (Aggregating)">

アグリゲート型の出力は、他のファイルに影響を与えない削除を除き、あらゆるソースファイルの変更によって影響を受ける可能性があります。

いかなる入力の変更も、すべてのアグリゲート型出力の再構築をトリガーし、対応する登録済み、新規、または修正されたすべてのソースファイルの再処理を引き起こします。

例えば、特定の注釈（アノテーション）を持つすべてのシンボルを収集する出力は、アグリゲート型です。

</def>
<def title="アイソレート型 (Isolating)">

アイソレート型の出力は、指定されたソースのみに依存します。

他のソースへの変更は、出力に影響しません。1つの出力に対して複数のソースファイルを関連付けることができます。

例えば、実装するインターフェース専用に生成されたクラスは、アイソレート型です。

</def>
</deflist>

### ダーティ状態の伝播

KSPは、以下の方法でダーティ状態を伝播させます：

1. **解釈の追跡（resolution tracing）による伝播**: 型解決（resolution）は、あるファイルから別のファイルへとナビゲートする唯一の方法です。プロセッサが（明示的または暗黙的に）型参照を解決すると、KSPは、その参照を含むファイルと、その解決に影響を与えるシンボルを定義しているファイルとの間の依存関係を考慮します。その結果、解決されたシンボルに変更があると、参照しているファイルがダーティとしてマークされる場合があります。

2. **入出力の対応関係による伝播**: ソースファイルが変更または影響を受けた場合、そのファイルと生成された出力を共有する他のすべてのソースファイルも影響を受けているとマークされます。これにより、共有された出力に基づいて、関連するファイルが同値類（equivalence classes）にグループ化されます。

> ルール (1) と (2) は、互いに繰り返しトリガーし合う可能性があります。例えば、ルール (1) がルール (2) をトリガーし、それが再びルール (1) をトリガーするといった具合です。
>
{style="tip"}

## 実装方法

依存関係は、入力ファイルと出力ファイルの多対多の関係によって決定されます。

KSPは、以下のルールに基づいて再処理が必要なファイルを判断します：

* 入力ファイルが変更された場合、それは常に再処理されます。

   **理由：** 入力が変更されると、新しい情報が導入される可能性があるためです。プロセッサはその入力を使用して再度実行する必要があります。

* 入力ファイルが変更され、それが特定の出力に関連付けられている場合、同じ出力に関連付けられている他のすべての入力ファイルも再処理されます。これは、新しいダーティなファイルがなくなるまで繰り返し行われます。

   **理由：** 出力は一連の入力のセットから構成されます。プロセッサは出力を再生成するために、すべての入力を必要とする場合があります。

* 変更されていない入力ファイルがいかなるアグリゲート型出力にも関連付けられていない場合、再処理されません。

   **理由：** そのファイルは変更されておらず、アグリゲート型出力にも関連付けられていないため、いかなる出力にも影響を与えることができないからです。上記のルールのいずれかが適用されない限り、再処理されません。

例として、以下のような構造のプロジェクトを考えます：

```none
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
   ├── outputA
   └── outputB
```

あるプロセッサが以下の動作をするとします：

1. `sourceA` を読み取る。

2. `outputA` を生成する。

3. `sourceB` を読み取る。

4. `outputB` を生成する。

`sourceA` が変更されたとき：

* `outputB` がアグリゲート型の場合、KSPは `sourceA` と `sourceB` の両方を再処理します。

* `outputB` がアイソレート型の場合、KSPは `sourceA` のみを再処理します。

`sourceC` が追加されたとき：

* `outputB` がアグリゲート型の場合、KSPは `sourceC` と `sourceB` の両方を再処理します。

* `outputB` がアイソレート型の場合、KSPは `sourceC` のみを再処理します。

`sourceA` または `sourceB` のいずれかが削除された場合、KSPが再処理する必要があるファイルはありません。

## プロセッサの例

以下のプロジェクトにはクラス `A` と `B` が含まれており、`A` は `B` を継承しています。

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor : SymbolProcessor {
   override fun process(resolver: Resolver) {
       val declA = resolver.getSymbolsWithAnnotation("Interesting").first() as KSClassDeclaration
       val declB = declA.superTypes.first().resolve().declaration
       // B.kt は KSP によって依存関係として推論できるため、指定は不要
       val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
       // outputForA.kt
       val outputName = "outputFor${declA.simpleName.asString()}"
       // outputForA は A.kt と B.kt に依存する
       val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
       output.write("// $declA : $declB
".toByteArray())
       output.close()
   }
   // ...
}
```

`outputForA` を生成するために、プロセッサは以下のことを行います：

1. `Resolver.getSymbolsWithAnnotation` を呼び出して `A` を取得します。

2. `A` に対して `KSClassDeclaration.superTypes` を呼び出して `B` を取得します。

KSPは「解釈の追跡（resolution tracing）」を通じてこの関係を追跡し、`B` を `A` の依存関係として自動的に記録します。したがって、`B.kt` を `outputForA` の依存関係として明示的に宣言する必要はありません。

## バグの報告

インクリメンタル処理が有効な場合にのみ発生するエラーに遭遇した場合は、[GitHubリポジトリ](https://github.com/google/ksp/issues)で案件（Issue）を作成し、関連するログファイルを添付してください。

1. `gradle.properties` に以下の行を追加して、インクリメンタル処理のログを有効にします。

   ```
   ksp.incremental.log=true
   ```

2. 正常に完了するクリーンビルドを実行します。

3. 生成されたログファイルを別の場所にコピーして保存します：

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 問題を発生させるソースファイルを修正し、再度ビルドを実行します。

5. 成功したビルドと、問題を再現したビルドの両方のログファイルを、GitHubのIssueに添付してください。