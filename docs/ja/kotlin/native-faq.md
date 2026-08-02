[//]: # (title: Kotlin/Native FAQ)

## プログラムを実行するにはどうすればよいですか？

引数に興味がない場合は、トップレベル関数 `fun main(args: Array<String>)` または単に `fun main()` を定義してください。その際、関数がパッケージに属していない（パッケージ外にある）ことを確認してください。
また、コンパイルスイッチ `-entry` を使用して、`Array<String>` を受け取るか引数を持たず、`Unit` を返す任意の関数をエントリポイントとして指定することもできます。

## Kotlin/Native のメモリ管理モデルはどのようなものですか？

Kotlin/Native は、Java や Swift が提供するものと同様の自動メモリ管理方式を使用しています。

[Kotlin/Native メモリマネージャーの詳細を確認する](native-memory-manager.md)

## 共有ライブラリを作成するにはどうすればよいですか？

コンパイルオプション `-produce dynamic` を使用するか、Gradle ビルドファイルで `binaries.sharedLib()` を使用してください。

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.sharedLib()
    }
}
```

これにより、プラットフォーム固有の共有オブジェクト（Linux では `.so`、macOS では `.dylib`、Windows ターゲットでは `.dll`）と C 言語ヘッダーが生成され、Kotlin/Native プログラムで利用可能なすべての公開 API を C/C++ コードから利用できるようになります。

[Kotlin/Native を動的ライブラリとして使用するチュートリアルを完了する](native-dynamic-libraries.md)

## 静的ライブラリまたはオブジェクトファイルを作成するにはどうすればよいですか？

コンパイルオプション `-produce static` を使用するか、Gradle ビルドファイルで `binaries.staticLib()` を使用してください。

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.staticLib()
    }
}
```

これにより、プラットフォーム固有の静的オブジェクト（`.a` ライブラリ形式）と C 言語ヘッダーが生成され、Kotlin/Native プログラムで利用可能なすべての公開 API を C/C++ コードから利用できるようになります。

## コーポレートプロキシ環境下で Kotlin/Native を実行するにはどうすればよいですか？

Kotlin/Native はプラットフォーム固有のツールチェーンをダウンロードする必要があるため、コンパイラまたは `gradlew` の引数として `-Dhttp.proxyHost=xxx -Dhttp.proxyPort=xxx` を指定するか、環境変数 `JAVA_OPTS` を介して設定する必要があります。

## Kotlin フレームワークにカスタムの Objective-C プレフィックス/名前を指定するにはどうすればよいですか？

コンパイルオプション `-module-name` または対応する Gradle DSL ステートメントを使用してください。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += listOf("-module-name", "TheName")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += ["-module-name", "TheName"]
        }
    }
}
```

</tab>
</tabs>

## iOS フレームワークの名前を変更するにはどうすればよいですか？

iOS フレームワークのデフォルト名は `<プロジェクト名>.framework` です。
カスタム名を設定するには、`baseName` オプションを使用します。これにより、モジュール名も設定されます。

```kotlin
kotlin {
    iosArm64("myapp") {
       binaries {
          framework {
              baseName = "TheName"
          }
       }
    }
}
```

## Kotlin フレームワークで bitcode を有効にするにはどうすればよいですか？

bitcode の埋め込みは Xcode 14 で非推奨となり、Xcode 15 ですべての Apple ターゲットにおいて削除されました。Kotlin/Native コンパイラは Kotlin 2.0.20 以降、bitcode の埋め込みをサポートしていません。

古いバージョンの Xcode を使用しており、かつ Kotlin 2.0.20 以降にアップグレードしたい場合は、Xcode プロジェクトで bitcode の埋め込みを無効にしてください。

## iOS でより良いクラッシュレポートを取得するにはどうすればよいですか？

ハンドルされていない Kotlin の例外が iOS コードに達すると、例外がスローされた実際のコード行ではなく、Kotlin/Native 内部の問題を示す曖昧なレポートがクラッシュレポートツールに表示されることがあります。これは、クラッシュが記録されるまでに元の Kotlin スタックトレースが失われるために発生します。

この問題は、[NSExceptionKt](https://github.com/rickclephas/NSExceptionKt) のようなサードパーティ製のソリューションで回避できます。これは、キャッチされなかった Kotlin の例外を `NSException` インスタンスに変換し、クラッシュレポートツールが正しいスタックトレースをキャプチャできるようにするものです。主要なクラッシュレポートツール向けに専用の統合機能を提供しています：

* [Bugsnag](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtBugsnag/README.md)
* [Firebase Crashlytics](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtCrashlytics/README.md)

## 異なるコルーチンから安全にオブジェクトを参照するにはどうすればよいですか？

Kotlin/Native で複数のコルーチン間でオブジェクトを安全にアクセスまたは更新するには、`@Volatile` や `AtomicReference` などの並行性セーフな構成要素の使用を検討してください。

`var` プロパティに [`@Volatile`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-volatile/) アノテーションを付与します。これにより、プロパティのバッキングフィールドへのすべての読み書きがアトミックになります。さらに、書き込みは他のスレッドから即座に参照可能になります。別のスレッドがこのプロパティにアクセスすると、更新された値だけでなく、その更新までに行われた変更も認識されます。

あるいは、アトミックな読み取りと更新をサポートする [AtomicReference](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/) を使用します。Kotlin/Native では、これは volatile 変数をラップし、アトミックな操作を実行します。また、Kotlin は特定のデータ型に特化したアトミック操作のための型セットも提供しています。`AtomicInt`、`AtomicLong`、`AtomicBoolean`、`AtomicArray` に加え、`AtomicIntArray` や `AtomicLongArray` を使用できます。

共有された可変状態へのアクセスに関する詳細については、[コルーチンのドキュメント](shared-mutable-state-and-concurrency.md)を参照してください。

## 未リリースのバージョンの Kotlin/Native でプロジェクトをコンパイルするにはどうすればよいですか？

まず、[プレビュー版](eap.md)を試すことを検討してください。

さらに新しい開発バージョンが必要な場合は、ソースコードから Kotlin/Native をビルドできます。[Kotlin リポジトリ](https://github.com/JetBrains/kotlin)をクローンし、[こちらの手順](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/README.md#building-from-source)に従ってください。