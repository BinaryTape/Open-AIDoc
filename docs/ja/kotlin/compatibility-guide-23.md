[//]: # (title: Kotlin 2.3.x 互換性ガイド)

『[言語をモダンに保つ](kotlin-evolution-principles.md)』および『[快適なアップデート](kotlin-evolution-principles.md)』は、Kotlin 言語設計における基本原則のひとつです。前者は言語の進化を妨げる構成要素は削除されるべきであることを示し、後者はその削除を事前に十分に周知し、コードの移行を可能な限りスムーズに行えるようにすべきであることを示しています。

ほとんどの言語変更については、アップデートの変更ログやコンパイラの警告などの他のチャネルを通じてすでに発表されていますが、このドキュメントではそれらをすべてまとめ、Kotlin 2.2 から Kotlin 2.3 への移行のための完全なリファレンスを提供します。このドキュメントには、ツール関連の変更に関する情報も含まれています。

## 基本用語 {id="basic-terms"}

このドキュメントでは、いくつかの種類の互換性を紹介します：

- **ソース (source)**: ソース互換性のない変更は、以前は正常に（エラーや警告なしで）コンパイルできていたコードがコンパイルできなくなる変更です。
- **バイナリ (binary)**: 2 つのバイナリアーティファクトを相互に入れ替えても、ロードエラーやリンケージエラーが発生しない場合、それらはバイナリ互換であると言われます。
- **振る舞い (behavioral)**: 変更を適用する前後で同じプログラムが異なる動作を示す場合、その変更は振る舞いの互換性がないと言われます。

これらの定義は純粋な Kotlin に対してのみ与えられていることに注意してください。他の言語（Java など）の観点から見た Kotlin コードの互換性は、このドキュメントの範囲外です。

## 言語 (Language) {id="language"}

### `-language-version` における 1.8 および 1.9 のサポートを終了 {id="drop-support-in-language-version-for-1-8-and-1-9"}

> **Issue**: [KT-76343](https://youtrack.jetbrains.com/issue/KT-76343), [KT-76344](https://youtrack.jetbrains.com/issue/KT-76344).
>
> **コンポーネント**: コンパイラ
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3 以降、コンパイラは [`-language-version=1.8`](compiler-reference.md#language-version-version) をサポートしなくなります。また、JVM 以外のプラットフォームにおける `-language-version=1.9` のサポートも削除されます。
>
> **非推奨化サイクル**:
>
> - 2.2.0: `-language-version` でバージョン 1.8 および 1.9 を使用した場合に警告を報告
> - 2.3.0: すべてのプラットフォームのバージョン 1.8、および JVM 以外のプラットフォームのバージョン 1.9 において、`-language-version` の警告をエラーに格上げ

### typealias を使用した推論型に対する上限境界制約違反エラーを報告 {id="report-upper-bound-constraint-violation-errors-for-inferred-types-with-typealiases"}

> **Issue**: [KTLC-287](https://youtrack.jetbrains.com/issue/KTLC-287)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 以前は、推論された型に対する上限境界制約（upper-bound violation constraint）の違反について、コンパイラはエラーを報告していませんでした。Kotlin 2.3.0 ではこれが修正され、すべての型パラメータにわたって一貫してエラーが報告されるようになります。
>
> **非推奨化サイクル**:
>
> - 2.2.20: 暗黙の型引数による境界違反に対して非推奨警告を報告
> - 2.3.0: 暗黙の型引数に対する `UPPER_BOUND_VIOLATED` の警告をエラーに格上げ

### `inline` および `crossinline` ラムダへの `@JvmSerializableLambda` アノテーションを禁止 {id="prohibit-jvmserializablelambda-annotation-on-inline-and-crossinline-lambdas"}

> **Issue**: [KTLC-9](https://youtrack.jetbrains.com/issue/KTLC-9)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `@JvmSerializableLambda` アノテーションを `inline` または `crossinline` ラムダに適用できなくなりました。これらのラムダはシリアライズ可能ではないため、`@JvmSerializableLambda` を適用しても効果がありませんでした。
>
> **非推奨化サイクル**:
>
> - 2.1.20: `@JvmSerializableLambda` が `inline` または `crossinline` ラムダに適用された場合に警告を報告
> - 2.3.0: 警告をエラーに格上げ。この変更は progressive モードで有効化可能

### ジェネリックシグネチャが一致しない場合の Java クラスへの Kotlin インターフェース委譲を禁止 {id="prohibit-delegating-a-kotlin-interface-to-a-java-class-when-the-generic-signatures-don-t-match"}

> **Issue**: [KTLC-267](https://youtrack.jetbrains.com/issue/KTLC-267)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、非ジェネリックなオーバーライドを伴うジェネリックインターフェースメソッドを実装する Java クラスへの委譲（delegation）が禁止されます。以前はこれを許可していたため、実行時に型の不一致や `ClassCastException` が報告されていました。この変更により、エラーが実行時からコンパイル時に移ります。
>
> **非推奨化サイクル**:
>
> - 2.1.20: 警告を報告
> - 2.3.0: 警告をエラーに格上げ

### 明示的な戻り値の型がない式形式の関数（expression-bodied functions）での `return` の使用を非推奨化 {id="deprecate-use-of-return-in-expression-bodied-functions-without-explicit-return-type"}

> **Issue**: [KTLC-288](https://youtrack.jetbrains.com/issue/KTLC-288)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 関数の戻り値の型が明示的に宣言されていない場合、式本体（expression body）内での `return` の使用が非推奨になります。
>
> **非推奨化サイクル**:
>
> - 2.3.0: 警告を報告
> - 2.4.0: 警告をエラーに格上げ

### typealias を介して導入された nullable なスーパータイプからの継承を禁止 {id="prohibit-inheritance-from-nullable-supertypes-introduced-via-typealias"}

> **Issue**: [KTLC-279](https://youtrack.jetbrains.com/issue/KTLC-279)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: nullable な typealias から継承しようとした際にエラーを報告するようになります。これは、直接的な nullable なスーパータイプをすでに処理している方法と一致します。
>
> **非推奨化サイクル**:
>
> - 2.2.0: 警告を報告
> - 2.3.0: 警告をエラーに格上げ

### トップレベルラムダとコール引数のジェネリックシグネチャ生成を統一 {id="unify-generic-signature-generation-for-top-level-lambdas-and-call-arguments"}

> **Issue**: [KTLC-277](https://youtrack.jetbrains.com/issue/KTLC-277)
>
> **コンポーネント**: リフレクション
>
> **互換性のない変更の種類**: 振る舞い
>
> **短い要約**: Kotlin 2.3.0 では、トップレベルラムダに対しても、コール引数として渡されるラムダと同じ型チェックロジックを使用するようになり、両方のケースで一貫したジェネリックシグネチャの生成を保証します。
>
> **非推奨化サイクル**:
>
> - 2.3.0: 新しい振る舞いを導入。progressive モードでは適用不可

### reified 型パラメータが共通部分型（intersection types）として推論されることを禁止 {id="prohibit-reified-type-parameters-from-being-inferred-as-intersection-types"}

> **Issue**: [KTLC-13](https://youtrack.jetbrains.com/issue/KTLC-13)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、reified 型パラメータが共通部分型（intersection type）に推論される状況が禁止されます。これは実行時に誤った動作を引き起こす可能性があるためです。
>
> **非推奨化サイクル**:
>
> - 2.1.0: reified 型パラメータが共通部分型として推論された場合に警告を報告
> - 2.3.0: 警告をエラーに格上げ

### 型パラメータの境界を通じた公開性の低い型の公開を禁止 {id="prohibit-exposing-less-visible-types-through-type-parameter-bounds"}

> **Issue**: [KTLC-275](https://youtrack.jetbrains.com/issue/KTLC-275)
>
> **コンポーネント**: コア言語
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、関数または宣言自体よりも制限の強い可視性（visibility）を持つ型を公開する型パラメータ境界の使用が禁止されます。これにより、関数のルールがすでにクラスに適用されているルールと一致します。
>
> **非推奨化サイクル**:
>
> - 2.1.0: 問題のある型パラメータ境界に対して警告を報告
> - 2.3.0: 警告をエラーに格上げ

## 標準ライブラリ (Standard library) {id="standard-library"}

### Char から数値への変換を非推奨化し、明示的な digit および code API を導入 {id="deprecate-char-to-number-conversions-and-introduce-explicit-digit-and-code-apis"}

> **Issue**: [KTLC-321](https://youtrack.jetbrains.com/issue/KTLC-321)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、数値型に対する `Char.toX()` および `X.toChar()` 変換が非推奨となり、文字のコード（code）や数字の値（digit value）にアクセスするための新しい明示的な API が導入されます。
>
> **非推奨化サイクル**:
>
> - 1.4.30: 新しい関数を Experimental（実験的）として導入
> - 1.5.0: 新しい関数を Stable（安定版）に昇格。古い関数に対して警告を報告し、代替案を提案
> - 2.3.0: 警告をエラーに格上げ

### `Number.toChar()` 関数を非推奨化 {id="deprecate-number-tochar-function"}

> **Issue**: [KT-56822](https://youtrack.jetbrains.com/issue/KT-56822)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `Number.toChar()` 関数が非推奨になりました。代わりに `toInt().toChar()` または `Char` コンストラクタを使用してください。
>
> **非推奨化サイクル**:
>
> - 1.9.0: `Number.toChar()` 関数を使用した際に警告を報告
> - 2.3.0: 警告をエラーに格上げ

### `String.subSequence(start, end)` 関数を非推奨化 {id="deprecate-string-subsequence-start-end-function"}

> **Issue**: [KTLC-282](https://youtrack.jetbrains.com/issue/KTLC-282)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `String.subSequence(start, end)` 関数が非推奨になりました。代わりに [`String.subSequence(startIndex, endIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/sub-sequence.html) 関数を使用してください。
>
> **非推奨化サイクル**:
>
> - 1.0: `String.subSequence(start, end)` を使用した際に警告を報告
> - 2.3.0: 警告をエラーに格上げ

### `kotlin.io.createTempDirectory()` および `kotlin.io.createTempFile()` 関数を非推奨化 {id="deprecate-kotlin-io-createtempdirectory-and-kotlin-io-createtempfile-functions"}

> **Issue**: [KTLC-281](https://youtrack.jetbrains.com/issue/KTLC-281)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `kotlin.io.createTempDirectory()` および `kotlin.io.createTempFile()` 関数が非推奨になりました。 
> 代わりに [`kotlin.io.path.createTempDirectory()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-directory.html) および [`kotlin.io.path.createTempFile()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-file.html) 関数を使用してください。
>
> **非推奨化サイクル**:
>
> - 1.4.20: `kotlin.io.createTempDirectory()` および `kotlin.io.createTempFile()` 関数を使用した際に警告を報告
> - 2.3.0: 警告をエラーに格上げ

### `InputStream.readBytes(Int)` 関数を非表示化 {id="hide-inputstream-readbytes-int-function"}

> **Issue**: [KTLC-280](https://youtrack.jetbrains.com/issue/KTLC-280)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 長期間非推奨であった `InputStream.readBytes(estimatedSize: Int = DEFAULT_BUFFER_SIZE): ByteArray` 関数が非表示（hidden）になりました。
>
> **非推奨化サイクル**:
>
> - 1.3.0: 警告を報告
> - 1.5.0: 警告をエラーに格上げ
> - 2.3.0: 関数を非表示化

### Kotlin/Native のスタックトレース出力を他のプラットフォームと統一 {id="unify-kotlin-native-stack-trace-printing-with-other-platforms"}

> **Issue**: [KT-81431](https://youtrack.jetbrains.com/issue/KT-81431)
>
> **コンポーネント**: Kotlin/Native
>
> **互換性のない変更の種類**: 振る舞い
>
> **短い要約**: 例外のスタックトレースをフォーマットする際、同じ例外の原因（cause）がすでに印刷されている場合、追加の原因は印刷されなくなります。
>
> **非推奨化サイクル**:
>
> - 2.3.20: Kotlin/Native の例外スタックトレースのフォーマットを他の Kotlin プラットフォームと統一

### `Iterable<T>.intersect()` および `Iterable<T>.subtract()` の動作を修正 {id="correct-iterable-t-intersect-and-iterable-t-subtract-behavior"}

> **Issue**: [KTLC-268](https://youtrack.jetbrains.com/issue/KTLC-268)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: 振る舞い
>
> **短い要約**: [`Iterable<T>.intersect()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/intersect.html) および [`Iterable<T>.subtract()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/subtract.html) 関数は、各レシーバー要素を結果セットに追加する前にメンバーシップ（所属）を確認するようになります。結果セットは `Any::equals` を使用して要素を比較し、引数のコレクションが参照等価性（例: `IdentityHashMap.keys`）を使用している場合でも正しい結果を保証します。
>
> **非推奨化サイクル**:
>
> - 2.3.0: 新しい振る舞いを有効化

## ツール (Tools) {id="tools"}

### `kotlin-dsl` と `kotlin("jvm")` プラグインを併用した際の未サポート KGP バージョン警告 {id="unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins"}

> **Issue**: [KT-79851](https://youtrack.jetbrains.com/issue/KT-79851)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: 振る舞い
>
> **短い要約**: Kotlin 2.3 では、Gradle プロジェクトで `kotlin-dsl` **と** `kotlin("jvm")` プラグインの両方を使用している場合、サポートされていない Kotlin Gradle プラグイン (KGP) バージョンに関する Gradle 警告が表示されることがあります。
>
> **移行ステップ**:
> 
> 一般に、同じ Gradle プロジェクト内で `kotlin-dsl` と `kotlin("jvm")` プラグインの両方を使用することはお勧めしません。このセットアップはサポートされていません。
> 
> コンベンションプラグイン、プリコンパイル済みスクリプトプラグイン、またはその他の公開されないビルドロジックについては、3 つのオプションがあります：
> 
> 1. `kotlin("jvm")` プラグインを明示的に適用しない。代わりに、`kotlin-dsl` プラグインが互換性のある KGP バージョンを自動的に提供するようにします。
> 2. `kotlin("jvm")` プラグインを明示的に適用したい場合は、[`embeddedKotlinVersion`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.kotlin.dsl/embedded-kotlin-version.html) 定数を使用して組み込みの Kotlin バージョンを指定します。
>
>     組み込みの Kotlin および言語バージョンをアップグレードするには、Gradle バージョンをアップデートしてください。互換性のある Gradle バージョンは、Gradle の [Compatibility Notes for Kotlin](https://docs.gradle.org/current/userguide/compatibility.html#kotlin) で確認できます。
> 
> 3. `kotlin-dsl` プラグインを使用しない。これは、特定の Gradle バージョンに依存しないバイナリプラグインにより適している場合があります。
>
> 最後の手段として、言語バージョン 2.1 以上を使用するようにプロジェクトを構成できます。これにより `kotlin-dsl` プラグインの競合する動作が上書きされます。ただし、これを行うことは強くお勧めしません。
> 
> 移行中に困難が生じた場合は、[Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) の #gradle チャネルでサポートを求めてください。
> 
> **非推奨化サイクル**:
>
> - 2.3.0: `kotlin-dsl` プラグインがコンパイラの互換性のない言語または API バージョンで使用されていることを検出する診断（diagnostic）を導入

### AGP バージョン 9.0.0 以降における `kotlin-android` プラグインの非推奨化 {id="deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later"}

> **Issue**: [KT-81199](https://youtrack.jetbrains.com/issue/KT-81199)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、Android Gradle プラグイン (AGP) バージョン 9.0.0 以降を使用している場合、`org.jetbrains.kotlin.android` プラグインが非推奨になります。
> AGP 9.0.0 以降、[AGP は Kotlin の組み込みサポートを提供](https://kotl.in/gradle/agp-built-in-kotlin)するため、`kotlin-android` プラグインは不要になります。
>
> **非推奨化サイクル**:
>
> - 2.3.0: AGP バージョン 9.0.0 以降を使用し、`android.builtInKotlin` と `android.newDsl=false` の両方の Gradle プロパティが `false` に設定されている場合に、`kotlin-android` プラグインの使用に対して警告を報告

### `testApi` コンフィギュレーションを非推奨化 {id="deprecate-testapi-configuration"}

> **Issue**: [KT-63285](https://youtrack.jetbrains.com/issue/KT-63285)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では `testApi` コンフィギュレーションが非推奨になります。このコンフィギュレーションはテストの依存関係とソースを他のモジュールに公開していましたが、Gradle はこの動作をサポートしていません。
> 
> **移行オプション**:
> `testApi()` のすべてのインスタンスを `testImplementation()` に置き換え、他のバリアントについても同様に行います。例えば、
> `kotlin.sourceSets.commonTest.dependencies.api()` を `kotlin.sourceSets.commonTest.dependencies.implementation()` に置き換えます。
> 
> Kotlin/JVM プロジェクトの場合は、代わりに Gradle の [テストフィクスチャ (test fixtures)](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) の使用を検討してください。
> マルチプラットフォームプロジェクトでのテストフィクスチャのサポートを希望される場合は、[YouTrack](https://youtrack.jetbrains.com/issue/KT-63142) でユースケースを共有してください。
> 
> **非推奨化サイクル**:
>
> - 2.3.0: 警告を報告

### `createTestExecutionSpec()` 関数を非推奨化 {id="deprecate-createtestexecutionspec-function"}

> **Issue**: [KT-75449](https://youtrack.jetbrains.com/issue/KT-75449)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、`KotlinJsTestFramework` インターフェースの `createTestExecutionSpec()` 関数が使用されなくなったため、非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.2.20: 警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: 関数を削除

### `closureTo()`、`createResultSet()`、`KotlinToolingVersionOrNull()` 関数を削除 {id="remove-closureto-createresultset-and-kotlintoolingversionornull-functions"}

> **Issue**: [KT-64273](https://youtrack.jetbrains.com/issue/KT-64273)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、使用されなくなった `closure` DSL の `closureTo()`、`createResultSet()` 関数を削除します。また、`KotlinToolingVersionOrNull()` 関数も削除されます。代わりに `KotlinToolingVersion()` 関数を使用してください。
>
> **非推奨化サイクル**:
> 
> - 1.7.20: エラーを報告
> - 2.3.0: 関数を削除

### `ExtrasProperty` API を非推奨化 {id="deprecate-the-extrasproperty-api"}

> **Issue**: [KT-74915](https://youtrack.jetbrains.com/issue/KT-74915)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.0.0 から非推奨となっていた `ExtrasProperty` API が、Kotlin 2.3.0 で内部化（internal 化）されました。代替として Gradle の [`ExtraPropertiesExtension`](https://docs.gradle.org/current/dsl/org.gradle.api.plugins.ExtraPropertiesExtension.html) API を使用してください。
> 
> **非推奨化サイクル**:
>
> - 2.0.0: 警告を報告
> - 2.1.0: 警告をエラーに格上げ
> - 2.3.0: API を内部化

### `KotlinCompilation` における `HasKotlinDependencies` を非推奨化 {id="deprecate-haskotlindependencies-in-kotlincompilation"}

> **Issue**: [KT-67290](https://youtrack.jetbrains.com/issue/KT-67290)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、[`KotlinCompilation`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compilation/) 内の `HasKotlinDependencies` インターフェースを非推奨にします。依存関係関連の API は、代わりに [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) インターフェースを通じて提供されます。
>
> **非推奨化サイクル**:
>
> - 2.3.0: 警告を報告

### npm および Yarn パッケージマネージャの内部関数とプロパティを非推奨化 {id="deprecate-npm-and-yarn-package-manager-internal-functions-and-properties"}

> **Issue**: [KT-81009](https://youtrack.jetbrains.com/issue/KT-81009)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: npm および Yarn パッケージマネージャに関連する以下の関数とプロパティが非推奨になりました：
> 
> * `CompositeDependency.dependencyName`、`CompositeDependency.dependencyVersion`、`CompositeDependency.includedBuildDir`。
> * `KotlinNpmInstallTask.Companion.NAME`。
> * `LockCopyTask.Companion.STORE_PACKAGE_LOCK_NAME`、`LockCopyTask.Companion.RESTORE_PACKAGE_LOCK_NAME`、`LockCopyTask.Companion.UPGRADE_PACKAGE_LOCK`。
> * `Npm.npmExec()`。
> * `NpmProject.require()`、`NpmProject.useTool()`。
> * `PublicPackageJsonTask.jsIrCompilation`。
> * `YarnBasics.yarnExec()`。
> * `YarnPlugin.Companion.STORE_YARN_LOCK_NAME`、`YarnPlugin.Companion.RESTORE_YARN_LOCK_NAME`、`YarnPlugin.Companion.UPGRADE_YARN_LOCK`。
> * `YarnSetupTask.Companion.NAME`。
>
> **非推奨化サイクル**:
>
> - 2.2.0 および 2.2.20: これらの関数またはプロパティを使用している場合に警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: 関数とプロパティを削除

### PhantomJS のサポートを非推奨化 {id="deprecate-support-for-phantomjs"}

> **Issue**: [KT-76019](https://youtrack.jetbrains.com/issue/KT-76019)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: PhantomJS がメンテナンスされなくなったため、Kotlin 2.3.0 では `NpmVersions` API の `karmaPhantomjsLauncher` プロパティを非推奨にします。
> 
> **非推奨化サイクル**:
>
> - 2.3.0: 警告を報告

### テスト実行または JavaScript ランタイムをセットアップするクラスのサブクラス化を禁止 {id="prohibit-subclassing-of-classes-that-set-up-test-runs-or-javascript-runtime"}

> **Issue**: [KT-75869](https://youtrack.jetbrains.com/issue/KT-75869), [KT-81007](https://youtrack.jetbrains.com/issue/KT-81007)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、以下のクラスのサブクラス化を禁止します：
> * `KotlinTest`
> * `KotlinNativeTest`
> * `KotlinJsTest`
> * `KotlinJsIrTarget`
> * `KotlinNodeJsIr`
> * `KotlinD8Ir`
> * `KotlinKarma`
> * `KotlinMocha`
> * `KotlinWebpack`
> * `TypeScriptValidationTask`
> * `YarnRootExtension`
> 
> これらのクラスは、サブクラス化されることを意図していません。サブクラス化が必要なすべてのユースケースは、Kotlin Gradle プラグイン DSL が提供する構成ブロックによってカバーされるはずです。
> もし既存の API がテスト実行や JavaScript ランタイムのセットアップにおいてニーズを満たさない場合は、[YouTrack](https://youtrack.jetbrains.com/issue/KT-75869) でフィードバックを共有してください。
>
> **非推奨化サイクル**:
>
> - 2.2.0: これらのクラスからサブクラスを作成するコードに対して警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: API を削除

### `ExperimentalWasmDsl` アノテーションクラスを非推奨化 {id="deprecate-experimentalwasmdsl-annotation-class"}

> **Issue**: [KT-81005](https://youtrack.jetbrains.com/issue/KT-81005)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 機能が `kotlin-plugin-annotations` モジュールに移動したため、`ExperimentalWasmDsl` アノテーションクラスは非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.0.20: 警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: アノテーションクラスを削除

### `ExperimentalDceDsl` アノテーションクラスを非推奨化 {id="deprecate-experimentaldcedsl-annotation-class"}

> **Issue**: [KT-81008](https://youtrack.jetbrains.com/issue/KT-81008)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `ExperimentalDceDsl` アノテーションクラスはもう使用されていないため、非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.2.0: 警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: アノテーションクラスを削除

### JavaScript ユーティリティを非推奨化 {id="deprecate-javascript-utilities"}

> **Issue**: [KT-81010](https://youtrack.jetbrains.com/issue/KT-81010)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 以下の関数とプロパティは内部でのみ使用されるため、非推奨になりました：
> * `JsIrBinary.generateTs`
> * `KotlinJsIrLink.mode`
> * `NodeJsSetupTask.Companion.NAME`
> * `Appendable.appendConfigsFromDir()`
> * `ByteArray.toHex()`
> * `FileHasher.calculateDirHash()`
> * `String.jsQuoted()`
>
> **非推奨化サイクル**:
>
> - 2.2.0: `KotlinJsIrLink.mode` プロパティが使用された場合に警告を報告
> - 2.2.0: `NodeJsSetupTask.Companion.NAME` プロパティおよび関数が使用された場合に警告を報告
> - 2.2.20: `JsIrBinary.generateTs` プロパティが使用された場合に警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: API を削除

### 移行された D8 および Binaryen プロパティを非推奨化 {id="deprecate-migrated-d8-and-binaryen-properties"}

> **Issue**: [KT-81006](https://youtrack.jetbrains.com/issue/KT-81006)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 以下のプロパティは、`org.jetbrains.kotlin.gradle.targets.js` パッケージから `org.jetbrains.kotlin.gradle.targets.wasm` パッケージに移行されたため、非推奨になりました：
> 
> * `binaryen.BinaryenEnvSpec`
> * `binaryen.BinaryenExtension`
> * `binaryen.BinaryenPlugin`
> * `binaryen.BinaryenRootPlugin`
> * `BinaryenSetupTask.Companion.NAME`
> * `d8.D8EnvSpec`
> * `d8.D8Plugin`
> * `D8SetupTask.Companion.NAME`
>
> **非推奨化サイクル**:
>
> - 2.2.0: 警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: プロパティを削除

### `NodeJsExec` DSL の `create()` 関数を非推奨化 {id="deprecate-create-function-in-nodejsexec-dsl"}

> **Issue**: [KT-81004](https://youtrack.jetbrains.com/issue/KT-81004)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `NodeJsExec` DSL のコンパニオンオブジェクト内にある `create()` 関数が非推奨になりました。代わりに `register()` 関数を使用してください。
>
> **非推奨化サイクル**:
>
> - 2.1.20: 警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: 関数を削除

### `kotlinOptions` DSL のプロパティを非推奨化 {id="deprecate-properties-in-kotlinoptions-dsl"}

> **Issue**: [KT-76720](https://youtrack.jetbrains.com/issue/KT-76720)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `kotlinOptions` DSL および関連する `KotlinCompile<KotlinOptions>` タスクインターフェースを通じたコンパイラオプションの構成は、Kotlin 2.2.0 以降、新しい `compilerOptions` DSL を優先して非推奨になっています。Kotlin 2.3.0 では、`kotlinOptions` インターフェースのすべてのプロパティに対する非推奨化サイクルを継続します。
> 移行するには、`compilerOptions` DSL を使用してコンパイラオプションを構成してください。移行のガイダンスについては、[`kotlinOptions {}` から `compilerOptions {}` への移行](gradle-compiler-options.md#migrate-from-kotlinoptions-to-compileroptions)を参照してください。
>
> **非推奨化サイクル**:
>
> - 2.0.0: `kotlinOptions` DSL に対して警告を報告
> - 2.2.0: 警告をエラーに格上げし、`kotlinOptions` のすべてのプロパティを非推奨化
> - 2.3.0: `kotlinOptions` のすべてのプロパティに対する警告をエラーに格上げ

### `kotlinArtifacts` API を非推奨化 {id="deprecate-kotlinartifacts-api"}

> **Issue**: [KT-77066](https://youtrack.jetbrains.com/issue/KT-77066)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 実験的な `kotlinArtifacts` API は非推奨になりました。Kotlin Gradle プラグインで利用可能な現在の DSL を使用して、[最終的なネイティブバイナリをビルド](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)してください。
> もし移行に不十分な点がある場合は、[この YouTrack issue](https://youtrack.jetbrains.com/issue/KT-74953) にコメントを残してください。
>
> **非推奨化サイクル**:
>
> - 2.2.0: `kotlinArtifacts` API が使用された場合に警告を報告
> - 2.3.0: この警告をエラーに格上げ
> - 2.4.0: API を削除

### `kotlin.mpp.resourcesResolutionStrategy` Gradle プロパティを削除 {id="remove-kotlin-mpp-resourcesresolutionstrategy-gradle-property"}

> **Issue**: [KT-74955](https://youtrack.jetbrains.com/issue/KT-74955)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 以前、`kotlin.mpp.resourcesResolutionStrategy` Gradle プロパティは使用されていなかったため非推奨となっていました。Kotlin 2.3.0 では、この Gradle プロパティは完全に削除されます。
>
> **非推奨化サイクル**:
>
> - 2.2.0: 構成時の診断（diagnostic）を報告
> - 2.3.0: Gradle プロパティを削除

### マルチプラットフォーム IDE インポートの古いモードを非推奨化 {id="deprecated-old-mode-of-multiplatform-ide-import"}

> **Issue**: [KT-61127](https://youtrack.jetbrains.com/issue/KT-61127)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 より前は、マルチプラットフォーム IDE インポートの複数のモードをサポートしていました。現在は古いモードが非推奨となり、1 つのモードのみが利用可能になります。以前は、古いモードは `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle プロパティを使用して有効化されていました。このプロパティを使用すると、非推奨警告が表示されるようになります。
>
> **非推奨化サイクル**:
>
> - 2.3.0: `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle プロパティが使用された場合に警告を報告

### 精密なコンパイルバックアップを無効にするプロパティを削除 {id="remove-properties-to-disable-precise-compilation-backup"}

> **Issue**: [KT-81038](https://youtrack.jetbrains.com/issue/KT-81038)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 1.9.0 では、精密なコンパイルバックアップ（precise compilation backup）と呼ばれるインクリメンタルコンパイル用の実験的な最適化が導入されました。テストの成功後、この最適化は Kotlin 2.0.0 でデフォルトで有効になりました。Kotlin 2.3.0 では、この最適化をオプトアウトするための `kotlin.compiler.preciseCompilationResultsBackup` および `kotlin.compiler.keepIncrementalCompilationCachesInMemory` Gradle プロパティを削除します。
>
> **非推奨化サイクル**:
>
> - 2.1.20: 警告を報告
> - 2.3.0: プロパティを削除

### `CInteropProcess` における `destinationDir` を非推奨化 {id="deprecate-destinationdir-in-cinteropprocess"}

> **Issue**: [KT-74910](https://youtrack.jetbrains.com/issue/KT-74910)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `CInteropProcess` タスクの `destinationDir` プロパティが非推奨になりました。
> 代わりに `CInteropProcess.destinationDirectory.set()` 関数を使用してください。
>
> **非推奨化サイクル**:
>
> - 2.1.0: `destinationDir` プロパティが使用された場合に警告を報告
> - 2.2.0: この警告をエラーに格上げ
> - 2.3.0: `destinationDir` プロパティを非表示化

### `CInteropProcess` における `konanVersion` を非推奨化 {id="deprecate-konanversion-in-cinteropprocess"}

> **Issue**: [KT-74911](https://youtrack.jetbrains.com/issue/KT-74911)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `CInteropProcess` タスクの `konanVersion` プロパティが非推奨になりました。
> 代わりに `CInteropProcess.kotlinNativeVersion` を使用してください。
>
> **非推奨化サイクル**:
>
> - 2.1.0: `konanVersion` プロパティが使用された場合に警告を報告
> - 2.2.0: この警告をエラーに格上げ
> - 2.3.0: `konanVersion` プロパティを非表示化

### `KotlinCompile.classpathSnapshotProperties` プロパティを削除 {id="remove-kotlincompile-classpathsnapshotproperties-properties"}

> **Issue**: [KT-76177](https://youtrack.jetbrains.com/issue/KT-76177)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `kotlin.incremental.useClasspathSnapshot` Gradle プロパティは Kotlin 2.2.0 で削除されました。
> Kotlin 2.3.0 では、以下のプロパティも削除されます：
> * `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot`
> * `KotlinCompile.classpathSnapshotProperties.classpath`
>
> **非推奨化サイクル**:
>
> - 2.0.20: `kotlin.incremental.useClasspathSnapshot` プロパティを警告付きで非推奨化
> - 2.2.0: `kotlin.incremental.useClasspathSnapshot` プロパティを削除
> - 2.3.0: `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot` および `KotlinCompile.classpathSnapshotProperties.classpath` プロパティを削除

### `getPluginArtifactForNative()` 関数を非推奨化 {id="deprecate-getpluginartifactfornative-function"}

> **Issue**: [KT-78870](https://youtrack.jetbrains.com/issue/KT-78870)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.2.20 で、[`getPluginArtifactForNative()` 関数が非推奨になりました](whatsnew2220.md#reduced-size-of-kotlin-native-distribution)。 
> 代わりに [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 関数を使用してください。
>
> **非推奨化サイクル**:
>
> - 2.2.20: 警告を報告
> - 2.3.0: 警告をエラーに格上げ
> - 2.4.0: 関数を削除

### すべての生成されたソースを登録するアプローチの変更 {id="change-the-approach-to-registering-all-generated-sources"}

> **Issue**: [KT-45161](https://youtrack.jetbrains.com/issue/KT-45161)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.0 では、[`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) インターフェースに、Gradle プロジェクトで [生成されたソースを登録](gradle-configure-project.md#register-generated-sources) できる新しい [Experimental（実験的）](components-stability.md#stability-levels-explained) API が導入されました。以前は、[`kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) プロパティを使用してすべての生成されたソースにアクセスできました。Kotlin 2.3.0 以降、プラグインやビルドロジックがすべての生成されたソースにアクセスする必要がある場合は、代わりに [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) プロパティを使用してください。
>
> **移行のアドバイス**:
> * 生成されたソースを登録するには、[`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) プロパティを使用します。
> * 生成されていないソースを含むすべてのソースにアクセスするには、[`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) プロパティを使用します。

### `kotlin.publishJvmEnvironmentAttribute` プロパティを非推奨化 {id="deprecate-kotlin-publishjvmenvironmentattribute-property"}

> **Issue**: [KT-83678](https://youtrack.jetbrains.com/issue/KT-83678)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: Kotlin 2.3.20 では、`kotlin.publishJvmEnvironmentAttribute` プロパティが非推奨になります。
> このプロパティは、マルチプラットフォームライブラリに対する `org.gradle.jvm.environment` 属性の公開を無効にすることを可能にしていました。
> Kotlin 2.0.20 以降、標準的な依存関係解決を保証するために `org.gradle.jvm.environment` はデフォルトで公開されます。
>
> **非推奨化サイクル**:
>
> - 2.3.20: 警告を報告
> - 2.4.0: プロパティを削除

### `CleanableStore` インターフェースおよび `CleanDataTask` クラスを非推奨化 {id="deprecate-cleanablestore-interface-and-cleandatatask-class"}

> **Issue**: [KT-78104](https://youtrack.jetbrains.com/issue/KT-78104)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `CleanableStore` インターフェースおよび `CleanDataTask` クラスは使用されなくなったため、非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.3.20: 警告を報告
> - 2.4.20: 警告をエラーに格上げ

### `kotlin.kmp.isolated-projects.support` Gradle プロパティを非推奨化 {id="deprecate-kotlin-kmp-isolated-projects-support-gradle-property"}

> **Issue**: [KT-79257](https://youtrack.jetbrains.com/issue/KT-79257)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: マルチプラットフォームプロジェクトはデフォルトで isolated projects と互換性があり、他のオプションがないため、`kotlin.kmp.isolated-projects.support` Gradle プロパティは非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.3.20: 警告を報告

### `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle プロパティを非推奨化 {id="deprecate-kotlin-mpp-enablekotlintoolingmetadataartifact-gradle-property"}

> **Issue**: [KT-79924](https://youtrack.jetbrains.com/issue/KT-79924)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `kotlin-tooling-metadata.json` アーティファクトはマルチプラットフォームプロジェクトにおいて常に生成されるようになったため、`kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle プロパティは非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.3.20: 警告を報告
> - 2.4.0: サポートを削除

### `LanguageSettings.enableLanguageFeature` DSL を非推奨化 {id="deprecate-languagesettings-enablelanguagefeature-dsl"}

> **Issue**: [KT-82323](https://youtrack.jetbrains.com/issue/KT-82323), [KT-82847](https://youtrack.jetbrains.com/issue/KT-82847)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: `LanguageSettings.enableLanguageFeature` DSL は、Kotlin コンパイラのテストのみを目的とした内部コンパイラ構成を公開していたため、非推奨になりました。
>
> **非推奨化サイクル**:
>
> - 2.3.20: `LanguageSettings.enableLanguageFeature` を使用している場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 「プロセス外 (out of process)」コンパイラ実行戦略を非推奨化 {id="deprecate-out-of-process-compiler-execution-strategy"}

> **Issue**: [KT-83125](https://youtrack.jetbrains.com/issue/KT-83125)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **短い要約**: 「プロセス外 (out of process)」[コンパイラ実行戦略](compiler-execution-strategy.md)は [Build tools API](build-tools-api.md) でサポートされておらず、利用可能な中で最も遅い戦略です。Kotlin 2.3.20 では、この戦略を「daemon」および「プロセス内 (in process)」コンパイラ実行戦略を優先して非推奨にします。
>
> **非推奨化サイクル**:
>
> - 2.3.20: 警告を報告
> - 2.4.0: 「プロセス外 (out of process)」コンパイラ実行戦略を削除

## ビルドツールの削除 (Build tool removal) {id="build-tool-removal"}

### Ant のサポートを削除 {id="remove-support-for-ant"}

> **Issue**: [KT-75875](https://youtrack.jetbrains.com/issue/KT-75875)
>
> **コンポーネント**: Ant
>
> **短い要約**: Kotlin 2.3.0 では、ビルドツールとしての Ant のサポートを削除します。代わりに [Gradle](gradle.md) または [Maven](maven.md) を使用してください。
>
> **非推奨化サイクル**:
>
> - 2.2.0: 警告を報告
> - 2.3.0: サポートを削除