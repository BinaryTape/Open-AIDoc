# コントリビュート

このプロジェクトにおける私たちの目標は、信頼に足る、シンプルで高速、かつ安全なコンポーネントを構築することです。一般的なユースケースに簡単に対応できるよう、意図的にプロジェクトの範囲（スコープ）を限定していますが、特殊なユースケースにも対応できるよう拡張性も持たせています。

## 生成ツールの禁止 {id="no-generative-tools"}

当プロジェクトでは、ソースコードやドキュメントにおいてLLM（大規模言語モデル）や生成ツールを使用しません。コミット、Issue、プルリクエストにおける人間同士のコミュニケーションにおいても同様です。私たちは「書くことは考えること」であると信じており、自分たちの仕事が思慮深いものであることを望んでいます。

すべてのコントリビューターにも同様の対応を求めます。全員が努力を払っているとき、ものづくりはより楽しくなるものです。

プロジェクトの文化を守るため、LLMによって生成された貢献（コントリビューション）は直ちに却下します。繰り返しの違反者は出入りを禁止します。

このポリシーに関するいくつかの限定的な例外：

* 非英語話者が、その旨を明示した上で機械翻訳ツールを使用すること。
* ローカルのオートコンプリート。（トークン単位で課金されるツールの使用は避けてください。）

コーディングは楽しいものです。

## コードの貢献 {id="code-contributions"}

このプロジェクトにコードを貢献したい場合は、GitHubを通じてリポジトリをフォークし、プルリクエストを送信することで行うことができます。

コードを提出する際は、コードの可読性をできる限り維持するため、既存の規約やスタイルに従うよう最善を尽くしてください。

## SQLDelight {id="sqldelight"}

コントリビュートを始めたい場合は、SQLDelightのどの部分に貢献したいかに応じて、以下の特定のガイドを参照してください。もし不明な点があれば、取り組んでいるIssueにどこで詰まっているかをコメントしてください。私たちがそこで回答します。あるいは、やりたいことのためのIssueを作成して議論を始めてください。

### IDEプラグイン {id="ide-plugin"}

バグを修正したりIDEを拡張したりしたい場合、コードの変更はおそらく `sqldelight-idea-plugin` モジュールで行うことになります。
`./gradlew runIde` タスクを使用して変更をテストでき、`./gradlew runIde --debug-jvm` を使用してライブデバッグが可能です。

IDEでバグが発生しているが、サンプルプロジェクトで再現できない場合は、IDEをライブデバッグできます。これを行うには、IntelliJの2つ目のインストールが必要です。[Toolbox](https://www.jetbrains.com/toolbox-app/) を使用して、IDEリストの一番下までスクロールし、異なるバージョンのIntelliJを選択することでこれを行うことができます。

デバッガを使用したいIDEで、SQLDelightのリポジトリをチェックアウトし、新しい `Remote` 実行構成（Run Configuration）を作成します。すると、「Command line arguments for remote JVM」に `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005` のような値が自動的に入力されます。その値をコピーし、デバッグしたい方のIDEを開きます。`Help -> Edit Custom VM Options` を選択し、開いたファイルの末尾にコピーした行を貼り付けます。デバッグしたいIDEを再起動し、起動したら、構成を作成した方のIDEを開き、作成したリモート構成を使用してデバッガをアタッチします。

IDEプラグインの構築や機能の詳細については、[JetBrainsの公式ドキュメント](https://jetbrains.org/intellij/sdk/docs/reference_guide/custom_language_support.html) を参照するか、[Jetbrains Platform Slack](https://blog.jetbrains.com/platform/2019/10/introducing-jetbrains-platform-slack-for-plugin-developers/) に参加してください。

### ドライバー {id="drivers"}

独自のドライバーを作成することに興味がある場合は、`runtime` アーティファクトを使用してSQLDelightのリポジトリ外で行うことができます。ドライバーをテストするには、`driver-test` に依存し、`DriverTest` と `TransactionTest` を拡張して、SQLDelightが期待する通りに動作することを確認できます。

#### 非同期ドライバー {id="asynchronous-drivers"}

非同期呼び出しを行うドライバーは、`runtime-async` アーティファクトを使用して実装できます。

### Gradle {id="gradle"}

Gradleの問題に遭遇した場合は、まず `sqldelight-gradle-plugin/src/test` に、他のフォルダと同様の、問題を再現するテストフィクスチャ（test fixture）を作成することから始めてください。修正方法がわからない場合は、この失敗するテストを含めたPRを自由にオープンしてください！テストケースは非常に感謝されます。
インテグレーションテストは、SQLite/MySQL/PostgreSQLなどを実行し、それぞれのランタイム環境とSQLDelightを使用してSQLクエリを実行するGradleプロジェクト全体のセットアップ方法を示しています。SQLDelightのランタイムの問題に遭遇した場合は、これらの既存のインテグレーションテストにテストを追加することを検討してください。

### コンパイラ {id="compiler"}

SQLDelightのコンパイラには多くのレイヤーがあります。SQLのパースではなく、純粋にコード生成（codegen）に興味がある場合は、`sqldelight-compiler` モジュールで貢献を行うことになります。パーサーに興味がある場合は、[sql-psi](https://github.com/alecstrong/sql-psi) に貢献する必要があります。SQLDelightはKotlinコードの生成に [kotlinpoet](https://github.com/square/kotlinpoet) を使用しています。インポートが正しく機能するように、Kotlin型を参照する際はそのAPIを使用するようにしてください。コード生成を何らかの形で変更した場合は、プルリクエストを送信する前に `./gradlew build` を実行してください。これにより `sqldelight-compiler:integration-tests` のインテグレーションテストが更新されます。インテグレーションテスト（ランタイム環境でSQLクエリを実行することを意味します）を書きたい場合は、`sqldelight-compiler:integration-tests` にテストを追加してください。

---

## SQL PSI {id="sql-psi"}

次のセクションでは、パーサーおよびPSIレイヤーへの貢献方法について説明しますが、その前に、[sql-psi](https://github.com/AlecStrong/sql-psi) における様々な可動パーツを理解するために、[複数のダイアレクト（multiple dialects）](https://www.alecstrong.com/posts/multiple-dialects/) に関するブログ記事を読んでおく必要があります。SQLDelightと同様に、問題に遭遇したが修正方法がわからない場合や支援が必要な場合は、GitHubのIssueにコメントするか、新しいIssueを作成して議論を始めてください。

SQL-PSIにおける変更については、対応する `core/src/test/fixtures_*` フォルダにテストフィクスチャを追加することになります。`fixtures` フォルダ（サフィックスなし）は、すべてのダイアレクトに対して実行されます。変更がsql-psiにマージされた後、SQLDelight側でも変更が必要な場合は、SQLDelightの `sql-psi-dev` ブランチをチェックアウトし、そこをターゲットにPRを作成してください。このブランチはsql-psiのスナップショットリリースを使用しているため、sql-psiの変更がマージされてから約10分後にはSQLDelightの変更をビルドできるようになります。

### 文法 (Grammar) {id="grammar"}

文法を追加する場合、まずそれが既存の文法に追加する新しいルールなのか、あるいは ANSI SQL（[sql.bnf](https://github.com/AlecStrong/sql-psi/blob/master/core/src/main/kotlin/com/alecstrong/sql/psi/core/sql.bnf) にあります）のルールをオーバーライドしたいルールなのかを決定してください。
どちらの場合も、新しい文法でそのルールを定義することになりますが、ANSI SQLのルールをオーバーライドする場合は、それをオーバーライドリストに追加し、ルールにオーバーライドアトリビュートを設定してください：

```bnf
overrides ::= my_rule

my_rule ::= SOME_TOKEN {
  override = true
}
```

ルールの定義は、ANSI-SQLからのルールの正確なコピー＆ペーストから始める必要があります。ANSI-SQLのルールを参照するには、それを `{}` で囲む必要があるため、オーバーライドルール内のすべての外部ルールを `{}` で囲んでください：

```bnf
my_rule ::= internal_rule {external_rule} {
  override = true
}
internal_rule ::= SOME_TOKEN
```

注意点として、ANSI-SQLの `expr` ルールを参照する場合は、特殊でオーバーライドできないため、`<<expr '-1'>>` のように記述する必要があります。

ANSI SQLから使用したいトークンも、手動でインポートする必要があります：

```bnf
{
  parserImports = [
    "static com.alecstrong.sql.psi.core.psi.SqlTypes.DELETE"
    "static com.alecstrong.sql.psi.core.psi.SqlTypes.FROM"
  ]
}
overrides ::= delete

delete ::= DELETE FROM {table_name} {
  override = true
}
```

ダイアレクトが独自のトークンを追加することはできませんが、テキストを `""` で囲むことで正確なテキストを要求することは可能です：

```bnf
my_rule ::= "SOME_TOKEN"
```

オーバーライドルールは、元のルールの型に準拠したコードを生成し続ける必要があるため、元のルールの既存의 型を必ず `implement` および `extend` してください：

```bnf
my_rule ::= internal_rule {external_rule} {
  extends = "com.alecstrong.sql.psi.core.psi.impl.SqlMyRuleImpl"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

文法におけるルールのオーバーライドの例については、PostgreSQLに `RETURNING` 構文を追加した [このPR](https://github.com/AlecStrong/sql-psi/pull/163/files) を確認してください。

### ルールの振る舞い (Rule Behavior) {id="rule-behavior"}

PSIレイヤーの振る舞いを変更したい場合（例えば、コンパイルを失敗させたい状況でエラーをスローするなど）がよくあります。これを行うには、ルールで `extends` の代わりに `mixin` を使用します。これは、新しいロジックを含む自作のクラスです：

```bnf
my_rule ::= interal_rule {external_rule} {
  mixin = "com.alecstrong.sql.psi.MyRuleMixin"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

そして、そのクラスが元のANSI SQLの型とSQL-PSIのベースクラスである `SqlCompositeElementImpl` を実装していることを確認してください：

```
class MyRule(
  node: ASTNode
) : SqlCompositeElementImpl(node),
    SqlMyRule {
  fun annotate(annotationHolder: SqlAnnotationHolder) {
    if (internal_rule.text == "bad_text") {
      annotationHolder.createErrorAnnotation("Invalid text value", internal_rule)
    }
  }
}
```

例えば、[DropIndexMixin](https://github.com/AlecStrong/sql-psi/blob/f1137ff82dd0aa77f741a09d88855fbf9b751c00/core/src/main/kotlin/com/alecstrong/sql/psi/core/psi/mixins/DropIndexMixin.kt) は、削除しようとしているインデックスがスキーマ内に存在するかどうかを検証します。

---

このドキュメントでカバーされていないコントリビュートに関する質問がある場合は、SqlDelightでIssueをオープンするか、ドキュメント改善のためのPRを自由にオープンしてください！