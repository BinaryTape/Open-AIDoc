---
title: SDKおよびライブラリ向けKoin
---

# SDKおよびライブラリ向けKoin

Koin Embeddedを使用すると、SDKやライブラリの開発者は、Koinを別のパッケージ名に変更（リロケーション）したバージョンとしてパッケージ化できます。これにより、ライブラリが内部で使用するKoinが、アプリケーション内の他のコンポーネントで使用されているKoinと衝突することがなくなります。このページはライブラリ作成者向けの内容です。通常のアプリ開発では、標準のKoinを使用してください。

リロケートされたKoinを取得するには2つの方法があります。事前ビルド済みアーティファクトやリロケーションスクリプトを利用したセルフサービスで行う方法と、[Enterprise Support](/docs/support/#enterprise-support-by-kotzilla)の一環としてKotzillaが専用バージョンをビルド、署名、ホスト、メンテナンスする[Koin Embedded LTS](#koin-embedded-lts)を利用する方法です。

## 競合の問題 {id="the-conflict-problem"}

内部でKoinを使用するライブラリは、自身の依存関係グラフの一部として`org.koin.*`を公開します。これにより2つの衝突リスクが生じますが、2つ目のリスクは見落とされがちです。

### ケース1: ホストアプリケーションとの競合 {id="case-1-conflict-with-the-host-application"}

SDKを利用するアプリケーションも独自のリリーススケジュールでKoinを使用している場合：

```kotlin
// SDKがKoin 3.5.6を使用
implementation("io.insert-koin:koin-core:3.5.6")

// 利用側のアプリがKoin 4.2.2を使用
implementation("io.insert-koin:koin-core:4.2.2")
// 競合: Gradleは両者に対して単一のバージョンを解決する
```

これによって引き起こされる問題：

- **全員に単一バージョンが適用される**: Gradleはアプリ全体に対して単一の`org.koin`バージョンを選択するため、どちらか一方がテストしたことのないバージョンで動作することになります。
- **ランタイムエラー**: バージョン間のAPI変更により、実行時にクラッシュが発生します。
- **強制的なアップグレード**: SDKが利用側アプリに対してKoinのアップグレードを強制したり、逆にアップグレードを妨げたりします。

### ケース2: 他のSDKとの競合 {id="case-2-conflict-with-other-sdks"}

アプリ内に組み込まれるSDKが1つだけであることは稀です。別のベンダーのSDKもKoinを組み込んでいる場合、互いに衝突することになり、どちらもお互いのリリースサイクルをコントロールできません：

```kotlin
// アプリが2つのSDKを統合しており、両方が内部でKoinを使用している
implementation("com.vendor-a:analytics-sdk:2.1.0")  // Koin 3.5.6を組み込み
implementation("com.vendor-b:payments-sdk:5.0.0")   // Koin 4.2.2を組み込み
// 同様の競合が発生し、依存関係チェーン内の誰もこれを修正できない
```

共有のリロケーション名前空間だけでは不十分なのはこのためです。`org.koin.*`から、すべての組み込み者が共有する別の名前空間に移行しても、衝突の場所が変わるだけにすぎません。同じ移行先名前空間にリロケートされた2つのSDKは、以前とまったく同じように競合します。必要なのは、自分専用の名前空間です。

## パッケージのリロケーション {id="package-relocation"}

リロケーション（Relocation）とは、Koinのパッケージを別の名前空間に書き換え、独立したアーティファクトとして再ビルドすることです：

```kotlin
// リロケーション前
import org.koin.core.module.dsl.singleOf
import org.koin.core.context.startKoin

// リロケーション後
import acme.koin.core.module.dsl.singleOf
import acme.koin.core.context.startKoin
```

2つの名前空間は完全に別個のクラスセットとなるため、依存関係解決の競合を起こすことなく共存できます：

```kotlin
// SDKは独自にリロケートされたKoinをバンドル
implementation("io.insert-koin:acme-koin-core:3.5.6")

// 利用側アプリは標準のKoinを使用
implementation("io.insert-koin:koin-core:4.2.2")
// 競合なし: 2つの独立したパッケージ
```

:::warning
通常のアプリ開発でEmbedded Koinを使用しないでください。これは、依存関係の競合を回避する必要があるライブラリ作成者（決済、アナリティクス、認証SDK、共有内部ライブラリ、サードパーティ連携など）向けに用意されています。
:::

## 事前ビルド済みEmbeddedバージョン {id="prebuilt-embedded-version"}

Kotzillaは、共有の`embedded.koin.*`名前空間にリロケートされた事前ビルド済みアーティファクト`embedded-koin-core`および`embedded-koin-android`を保守しています。アクセスは申請制です。[Koinチーム](mailto:koin@kotzilla.io)までお問い合わせください。

:::warning
これらのアーティファクトはベータ版であり、共有名前空間を使用しています。これらは評価用であり、一般公開するSDK向けではありません。すべての利用者が同一の`embedded.koin.*`名前空間にリロケートされるため、これらをベースに構築された2つのSDKが1つのアプリケーション内に存在すると、`org.koin.*`の場合とまったく同じように競合します（[ケース2](#case-2-conflict-with-other-sdks)を参照）。リロケーションの試行や、エンドツーエンドで管理可能な内部ビルドのために使用してください。サードパーティに配布するSDKをリリースする場合は、[リロケーションスクリプト](#custom-relocation)を使用して独自にリロケートするか、[Koin Embedded LTS](#koin-embedded-lts)をご利用ください。
:::

## カスタムリロケーション {id="custom-relocation"}

自分専用の名前空間を使用するには、リロケーションスクリプトを使用してKoinを独自に再ビルドします。

:::warning
スクリプトはベータ版の取り組みであり、現状有姿（as-is）で提供され、メンテナンスの保証はありません。ビルド、検証、公開、およびセキュリティ修正を含む今後のすべてのKoinリリース時の再ビルドなど、ダウンストリームのすべての作業はお客様自身の責任となります。
:::

### リロケーションスクリプトの使用 {id="using-the-relocation-scripts"}

[koin-relocate](https://github.com/InsertKoinIO/koin-relocate)プロジェクトには、カスタムパッケージ名でKoinを再ビルドするためのスクリプトが用意されています。リロケーションはプレフィックス（接頭辞）によって制御され、パッケージ名とモジュール名の両方に適用されます：

```
RELOCATION_PREFIX=acme   ->   org.koin.*  は  acme.koin.* に変更
                              koin-core   は  acme-koin-core に変更
```

手順：

1. リロケーションスクリプトのリポジトリをクローンします：

   ```bash
   git clone https://github.com/InsertKoinIO/koin-relocate.git
   cd koin-relocate
   ```

2. `relocate.properties`を編集してビルドを設定します：

   ```properties
   RELOCATION_PREFIX=acme
   TARGET_KOIN_VERSION=3.5.6
   KOIN_MODULES=core/koin-core;android/koin-android
   BUILD_DIR=./build
   ```

   - `RELOCATION_PREFIX`: パッケージ名およびモジュール名に適用されるプレフィックス。
   - `TARGET_KOIN_VERSION`: ビルド元となるKoinのバージョンタグ。
   - `KOIN_MODULES`: リロケート対象のKoinモジュール。
   - `BUILD_DIR`: ビルドされたアーティファクトがコピーされるディレクトリ。

3. リロケーションを実行します。ソースからKoinをクローンして再ビルドするため、JDK 17環境が必要です：

   ```bash
   ./relocate.sh
   ```

4. `BUILD_DIR`から`aar`および`jar`アーティファクトを回収します。リロケートされたすべてのモジュールはローカルのMavenリポジトリにもインストールされるため、テスト時にすぐに利用できます。

5. SDKのビルド用に、これらを独自のMavenリポジトリに公開します。

詳細な手順については、[koin-relocateリポジトリ](https://github.com/InsertKoinIO/koin-relocate)を参照してください。

### セルフホスティングに伴う考慮事項 {id="what-self-hosting-involves"}

スクリプトを使えば最初のビルドは行えます。しかし、配布するSDKの依存関係としてリロケートされたKoinを運用し続けるには、長期的なコミットメントが必要です。導入を決める前に以下の点を把握しておいてください：

- **Koinのビルド構造**: リロケーションではソースからKoinを再ビルドします。KoinのマルチモジュールGradle構成、バージョンカタログ、ツールチェーン要件を引き継ぐことになり、CI上で再現可能なJDK 17環境が必要になります。
- **パッケージ文の書き換え以上の作業**: Kotlinソース内の`org.koin`を書き換えるのは簡単な部分にすぎません。リソースや`META-INF/services`のエントリなどの宣言的サービスファイルにも完全修飾名（FQN）が含まれています。書き換え漏れがあると、コンパイル時ではなく実行時にエラーが発生します。
- **Androidおよびマルチプラットフォームのアーティファクト**: `koin-android`は独自のマニフェストとコンシューマールールを持つ`aar`アーティファクトを生成します。Kotlin Multiplatformでは、各ターゲットが独自のメタデータを持つ専用アーティファクトを公開するため、それらすべてでリロケートされた座標の一貫性を保つ必要があります。
- **公開と署名**: スクリプトはプレフィックス付きのモジュール名で`io.insert-koin`グループ配下にアーティファクトを生成し、ローカルMavenリポジトリにインストールします。内部利用であれば自社管理のリポジトリに公開するだけで十分です。しかし、一般向けに配布する場合は、リロケートされたKoinがサプライチェーンの一部となるため、利用者が期待するPOMメタデータ、グループの所有権管理、署名への対応が必要になります。
- **等価性の検証**: リロケートされたビルドはオリジナルとまったく同じように動作しなければなりません。Koin自身のテストスイートは`org.koin`に対して実行されるため、SDKで使用しているKoinの機能について、依存関係の解決、スコープ、ライフサイクルの振る舞いが書き換え後も維持されていることを独自に保証する必要があります。
- **Koinのパッチごとの繰り返し**: セキュリティ修正を含め、必要なアップストリームリリースごとに、リロケーションの実行、再ビルド、検証、署名、公開をやり直す必要があります。一度行ったリロケーションはスナップショットにすぎず、作成した瞬間から陳腐化していきます。

これらはセルフホストを断念すべき理由ではありません。3回目のセキュリティアドバイザリが出てからコストの大きさに気づくのではなく、事前に十分納得した上で判断すべき理由です。

### Koin Annotationsとコンパイラプラグイン {id="koin-annotations-and-the-compiler-plugin"}

:::warning
Koin AnnotationsおよびKoin Compiler Pluginは、リロケートされたビルドではサポートされていません。
:::

どちらも`org.koin`を直接参照するコードを生成します。このコードは、リロケーションが完了した後のコンパイル時にプロジェクト内で生成されるため、リロケートされたビルドでは提供されなくなった標準のKoinパッケージを参照してしまいます。スクリプトは生成されたコードのリロケーションは行いません。

リロケートされたビルドでは、Constructor DSLまたはClassic DSL（`module { }`、`single`、`factory`、`singleOf`、`factoryOf`）を使用してモジュールを宣言してください。

## セルフサービス方式の制限事項 {id="limits-of-the-self-service-paths"}

ベータ版であることや共有名前空間の注意点に加えて、セルフサービス方式には次のような制限があります：

- **アノテーションの不可**: Koin Annotationsおよびコンパイラプラグインは使用できません。
- **対象モジュールの限定**: すべてのKoinモジュールが問題なくリロケートできるわけではありません。
- **ビルドの複雑さ**: リロケーションを行うことは、ビルド、検証、公開のパイプラインを自ら所有・管理することを意味します。
- **メンテナンス負担**: セキュリティ修正を含め、Koinの更新ごとに再度のリロケーションと公開を行う必要があります。

最後のメンテナンス負担は恒常的に発生するものであり、Koin Embedded LTSが肩代わりするのはまさにこの部分です。

## Koin Embedded LTS {id="koin-embedded-lts"}

Koin Embedded LTSは、競合のない、最低18か月間メンテナンスされる独自のKoin LTSバージョンを提供します。これは[KotzillaによるEnterprise Support](/docs/support/#enterprise-support-by-kotzilla)の一部です。スクリプトを使用する代わりに、Kotzillaが専用のリロケート済みKoinのビルド、署名、ホスト、およびメンテナンスを行います。

### 専用のバージョン {id="your-own-version"}

自分専用の名前空間が提供され、他の誰とも共有されません。KotzillaがメンテナンスされているKoin LTSブランチからビルドを作成し、独自の名前空間にリロケートして署名し、組織専用のプライベートリポジトリでホストします。開発者はMavenリポジトリを1つ追加するだけで、リロケートされた専用モジュールに依存させることができます。

リロケーションスクリプトの実行、ビルドパイプラインの保守、アーティファクトの公開作業を行う必要はありません。

### 競合フリー {id="conflict-free"}

名前空間が自分専用であるため、組み込まれたKoinは、ホストアプリケーションや並行して配布される他のすべてのSDKから完全に隠蔽されます。それらがどのバージョンのKoinを実行していても、Koinを組み込んでいるかどうかも関係ありません。どちらのセルフサービス方式でもこの保証は得られません。事前ビルド済みアーティファクトは全ユーザー間で名前空間を共有しており、自前でリロケートした名前空間もパッチを適用し続けなければ分離を維持できないためです。

### 18か月のメンテナンス {id="18-months-of-maintenance"}

ビルドは、LTSに指定されてから最低18か月間メンテナンスされるLTSライン（[Kotlin 1.x向けKoin 3.5.6またはKotlin 2.x向けKoin 4.2.x](/docs/support/#available-lts-lines)）をベースとします。サブスクリプションが有効である限り、配布しているバージョンに対するサポートが継続されます。

そのLTSラインのすべてのパッチ（セキュリティのバックポートを含む）が再ビルドされ、独自の名前空間に公開されます。開発者は自社用アーティファクトの新バージョンを利用するだけでよく、リロケーションをやり直す必要はありません。

### 対象範囲 {id="scope"}

Koin Embedded LTSは、`koin-core`および`koin-android`をカバーしています。

導入支援（オンボーディング）には、LTSパッチレベルへの移行作業が含まれます。現在そのラインの古いバージョンを使用している場合でも、事前作業として移行を行う必要はなく、セットアップの一環として対応されます。

:::note
Embedded LTSはLTSラインのみからビルドされます。任意のKoinバージョンをリロケートするのは単発の対応にすぎません。そのアーティファクトはメンテナンス対象ラインの外にあるため、再ビルドの元となるアップストリームの修正フローが存在しません。結果として誰もパッチを適用しないアーティファクトになってしまいますが、広く配布されるSDKにパッチの当たっていないDIフレームワークが組み込まれることこそ、このサービスが防ごうとしている問題です。LTSラインであれば、サブスクリプションの有効期間中、リロケート対象となる次のパッチが常に提供されます。
:::

詳細はkotzilla.ioの[Koin Embedded LTS](https://kotzilla.io/koin-lts)をご覧ください。

## SDK開発のベストプラクティス {id="sdk-development-practices"}

SDK内部でKoinを実行する場合：

- **Koinを内部に留める**: SDKの実装詳細として扱います。
- **Koinの型を公開しない**: `KoinComponent`、`Module`、その他のKoinの型をSDKの公開APIに含めないでください。
- **分離されたインスタンスを使用する**: グローバルの`startKoin`は絶対に使用せず、`koinApplication`を使用してSDK用の独立したKoinインスタンスを起動します。[Context Isolation](/docs/reference/koin-core/context-isolation)を参照してください。
- **バージョンを固定する**: バージョン範囲（レンジ）は指定せず、リロケートされた厳密なバージョンに依存させます。
- **依存関係を明記する**: SDKのドキュメントに、内部でKoinを使用していることを記載します。

内部詳細としてのKoinの実装例：

```kotlin
class PaymentSDK private constructor(context: Context) {

    companion object {
        private var instance: PaymentSDK? = null

        fun initialize(context: Context): PaymentSDK {
            return instance ?: PaymentSDK(context).also { instance = it }
        }
    }

    private val koinApp = koinApplication {
        androidContext(context)
        modules(paymentModule)
    }

    private val paymentService: PaymentService = koinApp.koin.get()

    fun processPayment(amount: Double): PaymentResult {
        return paymentService.process(amount)
    }
}
```

公開APIでKoinを露出させない：

```kotlin
// 非推奨: KoinComponentとget()が公開APIに漏洩している
class PaymentSDK : KoinComponent {
    fun getPaymentService(): PaymentService = get()
}
```

SDKのドキュメントで内部依存関係を明記する：

```markdown
## Dependencies

This SDK uses Koin internally (embedded version) for dependency injection.
The embedded version is isolated and will not conflict with Koin usage
in your application.

Internal dependency: `io.insert-koin:acme-koin-core:3.5.6`
Package namespace: `acme.koin.*`
```

## SDKをリロケートされたKoinに移行する {id="moving-an-sdk-to-a-relocated-koin"}

1. **依存関係を置き換える**: `io.insert-koin:koin-core`を、`io.insert-koin:acme-koin-core`などのリロケート後の座標に変更します。
2. **インポートを更新する**: `import org.koin`を`import acme.koin`に置き換えます。
3. **アノテーションをDSLに置き換える**: SDKでKoin Annotationsやコンパイラプラグインを使用している場合は、それらの宣言をConstructor DSLまたはClassic DSLで書き直します。[Koin Annotationsとコンパイラプラグイン](#koin-annotations-and-the-compiler-plugin)を参照してください。
4. **本番に近い環境でテストする**: 標準のKoinも使用しているアプリ内や、SDKがそのような状況に遭遇する可能性がある場合はKoinを組み込んでいる別のSDKと並べてテストします。

元に戻す場合は逆の手順を行います。標準の`koin-*`の座標と`org.koin`のインポートを復元します。

## トラブルシューティング {id="troubleshooting"}

### リロケートされたアーティファクトを解決できない {id="the-relocated-artifact-can-t-be-resolved"}

```
Could not find io.insert-koin:acme-koin-core:3.5.6
```

リロケートされたアーティファクトが公開されていること、および公開先のリポジトリが利用側のビルド設定で宣言されていることを確認してください：

```kotlin
repositories {
    maven("https://maven.acme.com/releases")  // 公開先のリポジトリ
}
```

### 実行時のClassNotFoundException {id="classnotfoundexception-at-runtime"}

すべての場所でリロケートされたパッケージ名が使用されているか確認してください：

```kotlin
// 誤り
import org.koin.core.context.startKoin

// 正しい
import acme.koin.core.context.startKoin
```

不足しているクラスがリソースまたは`META-INF/services`エントリからのみ参照されている場合、リロケーション時にソース以外の参照が見落とされた可能性があります。それらのファイルにもリロケート後の名前が反映されているか確認してください。

### バージョン競合が残る {id="version-conflicts-remain"}

同じモジュール内で標準のKoinとリロケートされたKoinを混在させないでください：

```kotlin
// 混在させない
implementation("io.insert-koin:koin-core:3.5.6")       // 標準
implementation("io.insert-koin:acme-koin-core:3.5.6")  // リロケート済み

// リロケートされたビルドのみを使用する
implementation("io.insert-koin:acme-koin-core:3.5.6")
```

### Koinを組み込んでいる別のSDKとの競合 {id="conflict-with-another-sdk-that-embeds-koin"}

両方のSDKが同じ名前空間にリロケートされている可能性があります（最も可能性が高いのは、両方が事前ビルド済みの`embedded.koin.*`アーティファクトを使用しているケースです）。どちらか一方が独自の名前空間を用意する必要があります。独自にリロケートを行うか、[Koin Embedded LTS](#koin-embedded-lts)を使用してください。

## フィードバック {id="feedback"}

セルフサービス方式（事前ビルド済みアーティファクトおよびリロケーションスクリプト）に関するお問い合わせ：

- **Issue**: [koin-relocate GitHub issues](https://github.com/InsertKoinIO/koin-relocate/issues)
- **質問**: [Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)
- **メール**: [koin@kotzilla.io](mailto:koin@kotzilla.io)

## 関連情報 {id="related"}

- [Versions, Roadmap & Support](/docs/support/): LTSラインおよびKotzillaによるEnterprise Support。
- [Context Isolation](/docs/reference/koin-core/context-isolation): ライブラリ内部でプライベートなKoinインスタンスを実行する方法。
- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin`と`koinApplication`。
- [koin-relocate](https://github.com/InsertKoinIO/koin-relocate): リロケーションスクリプトとそのドキュメント。
- [Koin Embedded LTS](https://kotzilla.io/koin-lts): 保守管理された競合フリーな専用Koin。