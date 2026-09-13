[//]: # (title: Kotlin/Native でサポートされているターゲットとホスト)

このドキュメントでは、Kotlin/Native コンパイラでサポートされているターゲットとホストについて説明します。

> サポートされているターゲットとホストのリスト、ティアの数、およびそれらの機能は、状況に応じて調整される可能性があります。
>
{style="tip"}

## ターゲットティア {id="target-tiers"}

Kotlin/Native コンパイラは多くの異なるターゲットをサポートしていますが、それらに対するサポートレベルは異なります。
これらのレベルを明確にするため、コンパイラによるサポートの度合いに応じて、ターゲットをいくつかのティア（Tier）に分割しています。

ティアの表には以下の列があります：

* **Gradle ターゲット名**は、ターゲットを有効にするために Kotlin マルチプラットフォーム Gradle プラグインで使用される[ターゲット名](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)です。
* **ターゲットトリプル**は、[コンパイラが一般的に使用する](https://clang.llvm.org/docs/CrossCompilation.html#target-triple) `<architecture>-<vendor>-<system>-<abi>` 構造に従ったターゲット名です。
* **テストの実行**は、そのターゲットにおいて、Gradle や IDE でそのままで（out of the box）テストを実行できるかどうかを示します（ターゲット自体のために実行される CI テストと混同しないでください）。
  
  これは、特定のターゲットに対するネイティブホスト上でのみ利用可能です。例えば、`macosArm64` と `iosArm64` のテストは、macOS ARM64 ホスト上でのみ実行できます。

### ティア 1 {id="tier-1"}

* そのターゲットは CI 上で定期的にテストされ、コンパイルと実行が可能であることが確認されています。
* [コンパイラリリース間でのソースおよびバイナリ互換性](https://youtrack.jetbrains.com/issue/KT-42293)を提供します。

| Gradle ターゲット名 | ターゲットトリプル | テストの実行 | 説明 |
|-------------------------|-------------------------------|---------------|---------------------------------------------------------------|
| Apple macOS ホストのみ: |                               |               |                                                               |
| `macosArm64`            | `aarch64-apple-macos`         | ✅             | Apple シリコンプラットフォーム上の Apple macOS 12.0 以降 |
| `iosSimulatorArm64`     | `aarch64-apple-ios-simulator` | ✅             | Apple シリコンプラットフォーム上の Apple iOS シミュレータ 15.0 以降 |
| `iosArm64`              | `aarch64-apple-ios`           |               | ARM64 プラットフォーム上の Apple iOS および iPadOS 15.0 以降 |

### ティア 2 {id="tier-2"}

* そのターゲットは CI 上で定期的にテストされ、コンパイル可能であることが確認されていますが、実行可能であることは自動テストされていない場合があります。
* [コンパイラリリース間でのソースおよびバイナリ互換性](https://youtrack.jetbrains.com/issue/KT-42293)を提供できるよう最善を尽くしています。

| Gradle ターゲット名 | ターゲットトリプル | テストの実行 | 説明 |
|-------------------------|-----------------------------------|---------------|------------------------------------------------------------------|
| `linuxX64`              | `x86_64-unknown-linux-gnu`        | ✅             | x86_64 プラットフォーム上の Linux |
| `linuxArm64`            | `aarch64-unknown-linux-gnu`       |               | ARM64 プラットフォーム上の Linux |
| Apple macOS ホストのみ: |                                   |               |                                                                  |
| `watchosSimulatorArm64` | `aarch64-apple-watchos-simulator` | ✅             | Apple シリコンプラットフォーム上の Apple watchOS シミュレータ 8.0 以降 |
| `watchosArm64`          | `arm64_32-apple-watchos`          |               | ILP32 を備えた ARM64 プラットフォーム上の Apple watchOS 8.0 以降 |
| `tvosSimulatorArm64`    | `aarch64-apple-tvos-simulator`    | ✅             | Apple シリコンプラットフォーム上の Apple tvOS シミュレータ 15.0 以降 |
| `tvosArm64`             | `aarch64-apple-tvos`              |               | ARM64 プラットフォーム上の Apple tvOS 15.0 以降 |

### ティア 3 {id="tier-3"}

* そのターゲットが CI でテストされることは保証されていません。
* 異なるコンパイラリリース間でのソースおよびバイナリ互換性は保証されませんが、これらのターゲットに対するそのような変更は非常に稀です。

> ティア 3 のターゲットは活発に開発されておらず、破壊的な問題が含まれている可能性があります。
> 注意して使用してください。
> 
{style="warning"}

| Gradle ターゲット名 | ターゲットトリプル | テストの実行 | 説明 |
|-------------------------|----------------------------------|---------------|------------------------------------------------------------------------------------------|
| `androidNativeArm32`    | `arm-unknown-linux-androideabi`  |               | ARM32 プラットフォーム上の [Android NDK](https://developer.android.com/ndk) |
| `androidNativeArm64`    | `aarch64-unknown-linux-android`  |               | ARM64 プラットフォーム上の [Android NDK](https://developer.android.com/ndk) |
| `androidNativeX86`      | `i686-unknown-linux-android`     |               | x86 プラットフォーム上の [Android NDK](https://developer.android.com/ndk) |
| `androidNativeX64`      | `x86_64-unknown-linux-android`   |               | x86_64 プラットフォーム上の [Android NDK](https://developer.android.com/ndk) |
| `mingwX64`              | `x86_64-pc-windows-gnu`          | ✅             | [MinGW](https://www.mingw-w64.org) 互換レイヤーを使用した 64 ビット Windows 10 以降 |
| Apple macOS ホストのみ: |                                  |               |                                                                                          |
| `watchosDeviceArm64`    | `aarch64-apple-watchos`          |               | ARM64 プラットフォーム上の Apple watchOS 8.0 以降 |
| `iosX64`                | `x86_64-apple-ios-simulator`     |               | x86-64 プラットフォーム上の Apple iOS シミュレータ 15.0 以降 |

### 非推奨のターゲット {id="deprecated-targets"}

以下のターゲットは非推奨であり、削除が予定されています：

| ターゲット | 非推奨化の開始 | 説明 |
|-----------------|-------------------|----------------------------------------------------|
| `watchosArm32`  | Kotlin 2.4.20     | ARM32 プラットフォーム上の Apple watchOS デバイス |
| `macosX64`      | Kotlin 2.3.20     | x86_64 プラットフォーム上の Apple macOS |
| `watchosX64`    | Kotlin 2.3.20     | x86_64 プラットフォーム上の Apple watchOS 64 ビットシミュレータ | 
| `tvosX64`       | Kotlin 2.3.20     | x86_64 プラットフォーム上の Apple tvOS シミュレータ | 
| `linuxArm32Hfp` | Kotlin 1.8.20     | ARM32 プラットフォーム上の Linux |

### より低いバージョンの Apple ターゲットのサポート {id="supporting-lower-apple-target-versions"}

現在、デフォルトでサポートされている Apple ターゲットの最小バージョンは以下の通りです：

* iOS および tvOS は 15.0。
* macOS は 12.0。
* watchOS は 8.0。

プロジェクトでデフォルトよりも低いバージョンをサポートする必要がある場合は、ビルドファイルで `freeCompilerArgs` オプションを使用してください：

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### ライブラリ作者の方へ {id="for-library-authors"}

ライブラリの作者が、Kotlin/Native コンパイラが行う以上のターゲットをテストしたり、より厳格な保証を提供したりすることは推奨されません。ネイティブターゲットのサポートを検討する際は、以下のアプローチを利用できます：

* すべてのティア 1、2、および 3 のターゲットをサポートする。
* そのままの状態でテスト実行をサポートしているティア 1 および 2 のターゲットを定期的にテストする。

Kotlin チームは、[kotlinx.coroutines](coroutines-guide.md) や [kotlinx.serialization](serialization.md) などの公式 Kotlin ライブラリでこのアプローチを採用しています。

## ホスト {id="hosts"}

Kotlin/Native コンパイラは、以下のホストをサポートしています：

| ホスト OS | 最終バイナリのビルド | `.klib` アーティファクトの生成 |
|----------------------------------------------------|------------------------------------------------|------------------------------------------------------------------------|
| Apple シリコン（ARM64）上の macOS | サポートされているすべてのターゲット | サポートされているすべてのターゲット |
| Intel チップ（x86_64）上の macOS | サポートされているすべてのターゲット | サポートされているすべてのターゲット |
| x86_64 アーキテクチャの Linux | Apple ターゲットを除く、サポートされているすべてのターゲット | サポートされているすべてのターゲット（Apple ターゲットは cinterop 依存関係がない場合のみ） |
| x86_64 アーキテクチャの Windows（MinGW ツールチェーン） | Apple ターゲットを除く、サポートされているすべてのターゲット | サポートされているすべてのターゲット（Apple ターゲットは cinterop 依存関係がない場合のみ） |

### 最終バイナリのビルド {id="building-final-binaries"}

最終バイナリを生成するには、*サポートされているホスト*上でのみ[サポートされているターゲット](#target-tiers)に対してコンパイルできます。例えば、FreeBSD や ARM64 アーキテクチャで動作している Linux マシン上ではこれを行えません。

Linux および Windows 上で Apple ターゲット向けの最終バイナリをビルドすることも不可能です。

### `.klib` アーティファクトの生成 {id="producing-klib-artifacts"}

一般的に、Kotlin/Native は、サポートされているすべてのターゲットに対して、任意の*サポートされているホスト*が `.klib` アーティファクトを生成することを許可しています。

ただし、Apple ターゲット向けのアーティファクト生成には、Linux および Windows 上で依然としていくつかの制限があります。プロジェクトで [cinterop 依存関係](native-c-interop.md)（[CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) を含む）を使用している場合は、macOS ホストを使用する必要があります。

例えば、cinterop 依存関係がない場合に限り、x86_64 アーキテクチャで動作している Windows マシン上で `macosArm64` ターゲット向けの `.klib` を生成できます。

## 次のステップ {id="what-s-next"}

* [最終ネイティブバイナリのビルド](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)
* [Apple ターゲット向けのコンパイル](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html#compilation-for-apple-targets)