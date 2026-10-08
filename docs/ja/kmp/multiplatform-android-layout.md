[//]: # (title: Androidソースセットのレイアウト)

新しいAndroidソースセットのレイアウトはKotlin 1.8.0で導入され、1.9.0でデフォルトになりました。このガイドに従って、非推奨のレイアウトと新しいレイアウトの主な違い、およびプロジェクトを移行する方法を理解してください。

> すべての提案を実装する必要はありません。特定のプロジェクトに適用可能なものだけを実装してください。
>
{style="tip"}

## 互換性の確認 {id="check-the-compatibility"}

新しいレイアウトにはAndroid Gradleプラグイン 7.0以降が必要であり、Android Studio 2022.3以降でサポートされています。Android Gradleプラグインのバージョンを確認し、必要に応じてアップグレードしてください。

## Kotlinソースセットの名前変更 {id="rename-kotlin-source-sets"}

該当する場合は、以下のパターンに従ってプロジェクト内のソースセットの名前を変更してください。

| 以前のソースセットレイアウト | 新しいソースセットレイアウト |
|----------------------------------------|-------------------------------------|
| `targetName` + `AndroidSourceSet.name` | `targetName` + `AndroidVariantType` |

`{AndroidSourceSet.name}` は、次のように `{KotlinSourceSet.name}` にマッピングされます。

|             | 以前のソースセットレイアウト | 新しいソースセットレイアウト |
|-------------|----------------------------|--------------------------------|
| main        | androidMain                | androidMain                    |
| test        | androidTest                | android<b>Unit</b>Test         |
| androidTest | android<b>Android</b>Test  | android<b>Instrumented</b>Test |

## ソースファイルの移動 {id="move-source-files"}

該当する場合は、以下のパターンに従ってソースファイルを新しいディレクトリに移動してください。

| 以前のソースセットレイアウト | 新しいソースセットレイアウト |
|-------------------------------------------------------|-------------------------------------|
| レイアウトには追加の `/kotlin` ソースディレクトリ（SourceDirectories）がありました | `src/{KotlinSourceSet.name}/kotlin` |

`{AndroidSourceSet.name}` は、次のように `{SourceDirectories included}` にマッピングされます。

|             | 以前のソースセットレイアウト | 新しいソースセットレイアウト |
|-------------|---------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| main        | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java  | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java                                      |
| test        | src/androidTest/kotlin<br/>src/test/kotlin<br/>src/test/java  | src/android<b>Unit</b>Test/kotlin<br/>src/test/kotlin<br/>src/test/java                           |
| androidTest | src/android<b>Android</b>Test/kotlin<br/>src/androidTest/java | src/android<b>Instrumented</b>Test/kotlin<br/>src/androidTest/java, <b>src/androidTest/kotlin</b> |

## AndroidManifest.xmlファイルの移動 {id="move-the-androidmanifest-xml-file"}

プロジェクトに `AndroidManifest.xml` ファイルがある場合は、以下のパターンに従って新しいディレクトリに移動してください。

| 以前のソースセットレイアウト | 新しいソースセットレイアウト |
|--------------------------------------------------------|-------------------------------------------------------|
| src/{<b>Android</b>SourceSet.name}/AndroidManifest.xml | src/{<b>Kotlin</b>SourceSet.name}/AndroidManifest.xml |

`{AndroidSourceSet.name}` は、次のように `{AndroidManifest.xml location}` にマッピングされます。

|       | 以前のソースセットレイアウト | 新しいソースセットレイアウト |
|-------|-------------------------------|---------------------------------------------|
| main  | src/main/AndroidManifest.xml  | src/<b>android</b>Main/AndroidManifest.xml  |
| debug | src/debug/AndroidManifest.xml | src/<b>android</b>Debug/AndroidManifest.xml |

## Androidテストと共通テスト（common tests）の関係の確認 {id="check-the-relationship-between-android-and-common-tests"}

新しいAndroidソースセットのレイアウトでは、Androidインストゥルメンテーションテスト（Android-instrumented tests、新しいレイアウトでは `androidInstrumentedTest` に改名）と共通テストの関係が変わります。

以前は、`androidAndroidTest` と `commonTest` の間の `dependsOn` 関係がデフォルトでした。これは以下のことを意味していました。

* `commonTest` 内のコードが `androidAndroidTest` で利用可能であった。
* `commonTest` 内の `expect` 宣言に対して、`androidAndroidTest` で対応する `actual` 実装を持つ必要があった。
* `commonTest` で宣言されたテストが、Androidインストゥルメンテーションテストとしても実行されていた。

新しいAndroidソースセットのレイアウトでは、`dependsOn` 関係はデフォルトでは追加されません。以前の動作を優先する場合は、`build.gradle.kts` ファイルで以下の関係を手動で宣言してください。

```kotlin
kotlin {
// ...
    sourceSets {
        val commonTest by getting
        val androidInstrumentedTest by getting {
            dependsOn(commonTest)
        }
    }
}
```

## Androidフレーバーの実装の調整 {id="adjust-the-implementation-of-android-flavors"}

以前は、Kotlin Gradleプラグインは、`debug` や `release` ビルドタイプ、または `demo` や `full` などのカスタムフレーバー（flavor）を含むAndroidソースセットに対応するソースセットを先行して（eagerly）作成していました。
これにより、`val androidDebug by getting { ... }` のような式を使用してソースセットにアクセスできました。

新しいAndroidソースセットのレイアウトでは、Androidの [`onVariants`](https://developer.android.com/reference/tools/gradle-api/8.0/com/android/build/api/variant/AndroidComponentsExtension#onVariants(com.android.build.api.variant.VariantSelector,kotlin.Function1)) を使用してソースセットを作成します。
そのため、上記のような式は無効になり、`org.gradle.api.UnknownDomainObjectException: KotlinSourceSet with name 'androidDebug' not found` のようなエラーが発生します。

これを回避するには、`build.gradle.kts` ファイルで新しい `invokeWhenCreated()` APIを使用してください。

```kotlin
kotlin {
// ...
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    sourceSets.invokeWhenCreated("androidFreeDebug") {
// ...
    }
}
```
