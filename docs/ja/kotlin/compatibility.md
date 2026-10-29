<!--- TOC -->

* [互換性](#compatibility)
* [パブリックAPIの種類](#public-api-types)
  * [実験的API (Experimental API)](#experimental-api)
  * [FlowプレビューAPI (Flow preview API)](#flow-preview-api)
  * [Obsolete API (廃止予定のAPI)](#obsolete-api)
  * [内部API (Internal API)](#internal-api)
  * [安定API (Stable API)](#stable-api)
  * [非推奨化サイクル (Deprecation cycle)](#deprecation-cycle)
* [アノテーション付きAPIの使用](#using-annotated-api)
  * [プログラムによる指定](#programmatically)
  * [Gradle](#gradle)
  * [Maven](#maven)

<!--- END -->

## 互換性 {id="compatibility"}
このドキュメントでは、バージョン 1.0.0 以降の `kotlinx.coroutines` ライブラリの互換性ポリシーと、互換性固有のアノテーションのセマンティクスについて説明します。

## パブリックAPIの種類 {id="public-api-types"}
`kotlinx.coroutines` のパブリックAPIには、安定（stable）、実験的（experimental）、廃止予定（obsolete）、内部（internal）、非推奨（deprecated）の5つの種類があります。
安定APIを除くすべてのパブリックAPIには、対応するアノテーションが付けられています。

### 実験的API (Experimental API) {id="experimental-api"}
実験的APIは [@ExperimentalCoroutinesApi][ExperimentalCoroutinesApi] アノテーションでマークされています。
APIの設計に未解決の懸念事項があり、最終的にAPIのセマンティクスの変更や非推奨化につながる可能性がある場合、そのAPIは実験的としてマークされます。

デフォルトでは、ほとんどの新しいAPIは実験的としてマークされ、新たな問題が発生しなければ、その後のメジャーリリースのいずれかで安定版になります。
問題が発生した場合は、ABIを変更せずにセマンティクスを修正するか、あるいは非推奨化サイクルに入ります。

実験的APIの使用が危険な場合：
* `kotlinx.coroutines` に依存するライブラリを作成しており、そのライブラリの安定したAPIの中で実験的なコルーチンAPIを使用したい場合。ライブラリの最終ユーザーが `kotlinx.coroutines` のバージョンを更新した際に、実験的APIのセマンティクスがわずかに異なっていると、予期しない結果を招く可能性があります。
* アプリケーションのコアインフラストラクチャを実験的APIを中心に構築したい場合。

### FlowプレビューAPI (Flow preview API) {id="flow-preview-api"}
すべての [Flow] 関連のAPIは [@FlowPreview][FlowPreview] アノテーションでマークされています。
このアノテーションは、Flow APIがプレビュー状態であることを示しています。
プレビュー機能については、バイナリ、ソース、およびセマンティクスの互換性を含め、リリース間での互換性は保証されません。

プレビューAPIの使用が危険な場合：
* ライブラリやフレームワークを作成しており、安定したリリースや安定したAPIの中で [Flow] APIを使用したい場合。
* アプリケーションのコアインフラストラクチャで [Flow] を使用したい場合。
* [Flow] を「使い捨て」のソリューションとして使用したいが、`kotlinx.coroutines` のアップデートに伴う追加のメンテナンスコストを許容できない場合。

### Obsolete API (廃止予定のAPI) {id="obsolete-api"}
Obsolete APIは [@ObsoleteCoroutinesApi][ObsoleteCoroutinesApi] アノテーションでマークされています。
Obsolete APIは実験的APIに似ていますが、すでに重大な設計上の欠陥があることが判明しており、潜在的な代替手段が存在する（ただし、代替手段はまだ実装されていない）ものを指します。

このAPIのセマンティクスが変更されることはありませんが、代替手段の準備ができ次第、非推奨化サイクルに入ります。

### 内部API (Internal API) {id="internal-api"}
内部APIは [@InternalCoroutinesApi][InternalCoroutinesApi] でマークされているか、`kotlinx.coroutines.internal` パッケージの一部となっています。
このAPIには安定性の保証はなく、将来のリリースで変更または削除される可能性があります。
どうしても内部APIを使用せざるを得ない場合は、[イシュートラッカー](https://github.com/Kotlin/kotlinx.coroutines/issues/new)に報告してください。

### 安定API (Stable API) {id="stable-api"}
安定APIは、そのABIとドキュメント化されたセマンティクスが維持されることが保証されています。万が一、修正不可能な設計上の欠陥が発見された場合、そのAPIは非推奨化サイクルに入りますが、可能な限りバイナリ互換性は維持されます。

### 非推奨化サイクル (Deprecation cycle) {id="deprecation-cycle"}
APIが非推奨（deprecated）になると、複数のステージを経て廃止されます。各ステージの間には少なくとも1つのメジャーリリースが挟まれます。
* 機能がコンパイル警告とともに非推奨になります。ほとんどの場合、IntelliJ IDEAの機能を利用して非推奨箇所の移行を自動化できるよう、適切な代替手段（および対応する `replaceWith` 宣言）が提供されます。
* 非推奨レベルが `error` または `hidden` に引き上げられます。ABIにはまだ存在していますが、非推奨のAPIに対して新しいコードをコンパイルすることはできなくなります。
* APIが完全に削除されます。削除しないよう最善の努力を払い、現時点でAPIを削除する計画はありませんが、セキュリティホールなどの予期せぬ問題に備えて、この選択肢は残されています。

## アノテーション付きAPIの使用 {id="using-annotated-api"}
すべてのAPIアノテーションは [kotlin.Experimental](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-experimental/) です。
これは、実験的または廃止予定のAPIを使用していることに対してコンパイル警告を出すためです。
警告は、特定の呼び出し箇所に対してプログラムで無効にするか、モジュール全体に対してグローバルに無効にすることができます。

### プログラムによる指定 {id="programmatically"}
特定の呼び出し箇所で警告を無効にするには、[OptIn](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/) アノテーションを使用します：
```kotlin
@OptIn(ExperimentalCoroutinesApi::class) // 実験的なコルーチンAPIに関する警告を無効にします
fun experimentalApiUsage() {
    someKotlinxCoroutinesExperimentalMethod()
}
``` 

### Gradle {id="gradle"}
Gradleプロジェクトでは、`build.gradle` ファイルでコンパイラフラグを渡すことで警告を無効にできます：

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.AbstractKotlinCompile).all {
    kotlinOptions.freeCompilerArgs += ["-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi"]
}

```

### Maven {id="maven"}
Mavenプロジェクトでは、`pom.xml` ファイルでコンパイラフラグを渡すことで警告を無効にできます：
```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    ... 既存の設定 ...
    <configuration>
        <args>
            <arg>-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi</arg>
        </args>
    </configuration>
</plugin>
```

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines.flow -->

[Flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/index.html

<!--- INDEX kotlinx.coroutines -->

[ExperimentalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-experimental-coroutines-api/index.html
[FlowPreview]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-flow-preview/index.html
[ObsoleteCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-obsolete-coroutines-api/index.html
[InternalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-internal-coroutines-api/index.html

<!--- END -->