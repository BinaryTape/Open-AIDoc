[//]: # (title: インクリメンタル処理)

<web-summary>KSPにおけるインクリメンタル処理の仕組みと、それがどのようにビルド時間を短縮するかを学びます。</web-summary>

KSPはインクリメンタル処理をサポートしています。依存関係の1つ以上が変更された場合にのみファイルを再処理します。これにより、不要な再処理を回避してコンパイル時間を短縮します。

インクリメンタル処理はデフォルトで有効になっています。トラブルシューティング時や、強制的にフルリビルドを行いたい場合に無効化できます。インクリメンタル処理を無効にするには、`gradle.properties` ファイルに次の行を追加します。

```properties
ksp.incremental=false
```

## ダーティファイル {id="dirty-files"}

_ダーティ（dirty）_ なファイルとは、KSPが再処理する必要があるファイルのことです。開発者が直接ファイルを変更した場合や、他のダーティファイルにおける変更が間接的に影響を与えた場合に、そのファイルはダーティになります。

どのソースがダーティであるかを判断するために、KSPはプロセッサに依存します。プロセッサは生成された出力と対応する入力ソースを関連付けます。KSPはこれらの関連付けを使用して、変更が発生したときに再処理する必要があるソースを特定します。

KSPは、プロセッサが最小限の _ルートソース（root sources）_ のセットのみを宣言することを要求します。プロセッサはコード構造を探索するためのエントリポイントとしてこれらを使用します。

ルートソースとは、以下のいずれかのメソッドからシンボルが直接取得されるソースファイルのことです。

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

プロセッサは、ルートソースからの情報を解決（resolve）することで、他のソースファイルから追加のシンボルを取得できます。KSPはこれらの依存関係を自動的に追跡します。

出力を生成する際、プロセッサはその出力に寄与するルートソースを宣言する必要があります。KSPはそれらのルートソースと追跡された依存関係を使用して、出力の再生成が必要なタイミングを判断します。

> 出力ファイルを作成し、入力を出力に関連付けるには、`CodeGenerator` インターフェースを使用してください。詳細については、[KSPソースコード内の CodeGenerator.kt](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt) を参照してください。
>
{style="tip"}

### 集約（Aggregating）出力と分離（Isolating）出力 {id="aggregating-and-isolating-outputs"}

KSPは生成された出力を集約型（aggregating）と分離型（isolating）の2種類に分類します。

> Gradleのアノテーション処理とは異なり、KSPはこの分類をプロセッサ全体ではなく個々の出力に適用します。
>
{style="note"}

<deflist collapsible="true">
<def title="Aggregating">

Aggregating（集約）出力は、任意のソースファイルの変更による影響を受ける可能性があります。
たとえば、特定のアノテーションを持つすべてのシンボルを収集する出力などです。

ファイルの削除を含むあらゆる入力の変更により、すべての集約出力の再ビルドと、対応するすべての登録済み、新規、または変更されたソースファイルの再処理がトリガーされます。

</def>
<def title="Isolating">

Isolating（分離）出力は、指定されたソースにのみ依存します。たとえば、特定のインターフェースを実装するために生成されたクラスは isolating です。

明示的に指定されたもの以外のソースに対する変更は、出力に影響しません。複数のソースファイルを1つの出力に関連付けることができます。

</def>
</deflist>

### ダーティ状態の伝播 {id="dirtiness-propagation"}

ファイルがダーティになると、KSPは以下の方法でダーティ状態を伝播させます。

* **解決の追跡（Resolution tracing）**: プロセッサが型の参照を解決するとき、KSPは参照を含むファイルと、その結果に影響を与える可能性のあるすべてのファイルとの間の依存関係を記録します。それらのファイルのいずれかが変更されると、参照を持つファイルがダーティになります。これは明示的および暗黙的な型の解決の両方に適用されます。

  プロセッサは型を解決することによってのみファイル間を移動できるため、KSPが追跡する必要があるファイル間の依存関係はこれらだけです。

* **共有出力（Shared outputs）**: ダーティファイルが生成された出力に寄与している場合、同じ出力に寄与している他のすべてのファイルもダーティになります。これにより、関連するファイルが共有出力に基づいて同値類にグループ化されます。

KSPは、新しいダーティファイルが現れなくなるまで、両方のルールを繰り返し適用します。たとえば、解決の追跡によってダーティになったファイルが、共有出力を介して他のファイルをダーティにする可能性があります。それらのファイルはさらに、解決の追跡を介してより多くのファイルをダーティにする可能性があります。

## 実装の仕組み {id="implementation"}

依存関係は、入力ファイルと出力ファイルの多対多のリレーションシップによって決定されます。

KSPは、どのファイルを再処理するかを決定するために次のルールを使用します。

* 入力ファイルが変更された場合、その変更によってプロセッサに新しい情報がもたらされる可能性があるため、常に再処理されます。
* 変更された入力ファイルが出力に関連付けられている場合、KSPは同じ出力に関連付けられている他のすべての入力ファイルも再処理します。これは、プロセッサが出力を再生成するためにすべての入力を必要とする可能性があるためです。KSPは、新しいダーティファイルが現れなくなるまでこれを繰り返します。
* 前述のルールのいずれも適用されない限り、集約出力に関連付けられていない変更されていない入力ファイルをKSPが再処理することはありません。そのようなファイルはどの出力にも影響を与えないためです。

たとえば、`sourceA` と `sourceB` が互いに独立しており、`outputA` が isolating である、次のような構造のプロジェクトを考えてみます。

```text
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
    ├── outputA
    └── outputB
```

プロセッサは:

* `sourceA` を読み取り、`outputA` を生成します。
* `sourceB` を読み取り、`outputB` を生成します。

`sourceA` が変更された場合:
* `outputB` が aggregating の場合、KSPは `sourceA` と `sourceB` の両方を再処理します。
* `outputB` が isolating の場合、KSPは `sourceA` のみを再処理します。

`sourceC` が追加された場合:
* `outputB` が aggregating の場合、KSPは `sourceC` と `sourceB` を再処理します。
* `outputB` が isolating の場合、KSPは `sourceC` のみを再処理します。

`sourceA` が削除された場合:
* `outputB` が aggregating の場合、KSPは `sourceB` を再処理します。
* `outputB` が isolating の場合、KSPはいずれのファイルも再処理する必要がありません。

`sourceB` が削除された場合、`sourceB` は `outputB` の唯一のソースであったため、KSPはどちらの場合でもファイルを再処理する必要はありません。

## プロセッサの例 {id="example-processor"}

次のプロジェクトには、`A` が `B` を継承しているクラス `A` と `B` が含まれています。

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor(private val codeGenerator: CodeGenerator) : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        val declA = resolver.getSymbolsWithAnnotation("Interesting")
            .firstOrNull() as? KSClassDeclaration
            // 新しいアノテーション付きシンボルが見つからない以降のラウンドでは早期リターンする
            ?: return emptyList()
        val declB = declA.superTypes.first().resolve().declaration
        // B.kt は KSP によって依存関係として推論できるため不要
        val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
        // outputForA.kt
        val outputName = "outputFor${declA.simpleName.asString()}"
        // outputForA は A.kt と B.kt に依存
        val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
        output.write("// $declA : $declB\n".toByteArray())
        output.close()
        return emptyList()
    }
    // ...
}
```

`outputForA` を生成するために、プロセッサは以下を行います。

1. `Resolver.getSymbolsWithAnnotation()` を呼び出して `A` を取得します。
2. `A` の `superTypes` からスーパタイプの参照を解決して `B` を取得します。

KSPは解決の追跡を通じてこの関係を追跡し、`B` を `A` の依存関係として自動的に記録します。したがって、`B.kt` を `outputForA` の依存関係として明示的に宣言する必要はありません。

## バグの報告 {id="reporting-bugs"}

インクリメンタル処理が有効な場合にのみ発生するエラーに遭遇した場合は、[KSPのGitHubリポジトリ](https://github.com/google/ksp/issues) でIssueを作成し、関連するログファイルを添付してください。

ログファイルを収集してIssueに添付するには、次の手順を行います。

1. `gradle.properties` ファイルに次の行を追加して、インクリメンタル処理のログをキャプチャします。

   ```properties
   ksp.incremental.log=true
   ```

2. 正常に完了するクリーンビルドを実行します。
3. 生成されたログファイルを別の場所にコピーして保存します。

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 問題を再現させるソースファイルを変更し、再度ビルドを実行します。
5. 成功したビルドと問題を再現したビルドの両方のログファイルをGitHubのIssueに添付します。

### シンボル依存関係グラフの可視化 {id="visualizing-the-symbol-dependency-graph"}

インクリメンタル処理のデバッグを支援するために、KSPは指定されたシンボルから始まるシンボル依存関係グラフを可視化するGraphviz DOTファイルを生成できます。

インクリメンタルログを有効にし、グラフを可視化するための起点として使用するシンボルの[完全修飾名](packages.md#package-headers)を指定します。

```properties
ksp.incremental.log=true
ksp.incremental.log.graph.origin=<fully-qualified-name>
```

コマンドラインからKSPを使用している場合は、次のオプションを追加します。

```bash
-incremental-log=true -incremental-log-graph-origin=<fully-qualified-name>
```

KSPは、他のインクリメンタル処理ログと同じ `logs` ディレクトリ内の `kspLookupGraphOrigin.dot` ファイルにグラフを出力します。

## 関連項目 {id="see-also"}

* プロセッサが[その出力の依存関係を宣言する方法](ksp-quickstart.md#create-and-register-a-processor)を学ぶ。
* KSPが[複数のラウンドでプロセッサを実行する方法](ksp-multi-round.md)を学ぶ。
* [KSPがKotlinコードをモデル化する方法](ksp-kotlin-model.md)と、いつ型を解決すべきかを学ぶ。
* Gradle用のKSPプラグインなしで[コマンドラインからKSPを実行する方法](ksp-command-line.md)を学ぶ。