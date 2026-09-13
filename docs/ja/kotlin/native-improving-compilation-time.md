[//]: # (title: コンパイル時間を改善するためのヒント)

<show-structure depth="1"/>

Kotlin/Nativeコンパイラは、パフォーマンスを向上させるためのアップデートを継続的に受け取っています。最新のKotlin/Nativeコンパイラを使用し、ビルド環境を適切に設定することで、Kotlin/Nativeターゲットを持つプロジェクトのコンパイル時間を大幅に短縮できます。

Kotlin/Nativeのコンパイルプロセスを高速化するためのヒントを以下に示します。

## 一般的な推奨事項 {id="general-recommendations"}

### 最新バージョンのKotlinを使用する {id="use-the-latest-version-of-kotlin"}

これにより、常に最新のパフォーマンス改善を享受できます。最新のKotlinバージョンは %kotlinVersion% です。

### 巨大なクラスの作成を避ける {id="avoid-creating-huge-classes"}

実行時のコンパイルやロードに時間がかかる巨大なクラスの作成は避けてください。

### ダウンロードおよびキャッシュされたコンポーネントをビルド間で保持する {id="preserve-downloaded-and-cached-components-between-builds"}

プロジェクトをコンパイルする際、Kotlin/Nativeは必要なコンポーネントをダウンロードし、作業結果の一部を `$USER_HOME/.konan` ディレクトリにキャッシュします。コンパイラは次回のコンパイルでこのディレクトリを使用し、完了までの時間を短縮します。

コンテナ（Dockerなど）や継続的インテグレーション（CI）システムでビルドする場合、コンパイラはビルドごとに `~/.konan` ディレクトリを一から作成しなければならないことがあります。このステップを避けるために、ビルド間で `~/.konan` が保持されるように環境を構成してください。例えば、`konan.data.dir` Gradleプロパティを使用して、その場所を再定義します。

あるいは、`cinterop` および `konanc` ツールを介して、`-Xkonan-data-dir` コンパイラオプションを使用してディレクトリのカスタムパスを構成することもできます。

## Gradleの設定 {id="gradle-configuration"}

Gradleでの最初のコンパイルは、依存関係のダウンロード、キャッシュの構築、追加のステップの実行が必要になるため、通常、その後のコンパイルよりも時間がかかります。実際のコンパイル時間を正確に把握するには、プロジェクトを少なくとも2回ビルドする必要があります。

コンパイルパフォーマンスを向上させるためのGradle構成の推奨事項を以下に示します。

### Gradleのヒープサイズを増やす {id="increase-gradle-heap-size"}

[Gradleのヒープサイズ](https://docs.gradle.org/current/userguide/performance.html#adjust_the_daemons_heap_size)を増やすには、`gradle.properties` ファイルに `org.gradle.jvmargs=-Xmx3g` を追加してください。

[並列ビルド（parallel builds）](https://docs.gradle.org/current/userguide/performance.html#parallel_execution)を使用する場合は、`org.gradle.workers.max` プロパティまたは `--max-workers` コマンドラインオプションを使用して、適切なワーカー数を選択する必要があるかもしれません。デフォルト値はCPUプロセッサの数です。

### 必要なバイナリのみをビルドする {id="build-only-necessary-binaries"}

本当に必要でない限り、`build` や `assemble` などのプロジェクト全体をビルドするGradleタスクを実行しないでください。これらのタスクは同じコードを複数回ビルドするため、コンパイル時間が増加します。IntelliJ IDEAからのテスト実行やXcodeからのアプリ起動などの典型的なケースでは、Kotlinツールは不要なタスクの実行を回避します。

非典型的なケースやビルド構成がある場合は、自分でタスクを選択する必要があるかもしれません。

* `linkDebug*`: 開発中にコードを実行する場合、通常はバイナリが1つあれば十分なので、対応する `linkDebug*` タスクを実行するだけで十分です。
* `embedAndSignAppleFrameworkForXcode`: iOSシミュレータとデバイスではプロセッサアーキテクチャが異なるため、Kotlin/Nativeバイナリをユニバーサル（fat）フレームワークとして配布するのが一般的なアプローチです。

  しかし、ローカル開発中は、使用しているプラットフォーム専用の `.framework` ファイルのみをビルドする方が高速です。プラットフォーム固有のフレームワークをビルドするには、[embedAndSignAppleFrameworkForXcode](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html#connect-the-framework-to-your-project) タスクを使用してください。

### 必要なターゲットのみに対してビルドする {id="build-only-for-necessary-targets"}

上記の推奨事項と同様に、すべてのネイティブプラットフォーム用のバイナリを一度にビルドしないでください。例えば、[XCFramework](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks) をコンパイル（`*XCFramework` タスクを使用）すると、すべてのターゲットに対して同じコードがビルドされるため、単一のターゲットに対してビルドするよりも比例して時間がかかります。

セットアップにXCFrameworkが必要な場合は、ターゲットの数を減らすことができます。例えば、IntelベースのMac上のiOSシミュレータでプロジェクトを実行しないのであれば、`iosX64` は必要ありません。

> 異なるターゲットのバイナリは、`linkDebug*$Target` および `linkRelease*$Target` Gradleタスクでビルドされます。
> 実行されたタスクは、ビルドログ、または `--scan` オプションを付けてGradleビルドを実行することで [Gradleビルドスキャン](https://docs.gradle.org/current/userguide/build_scans.html) で確認できます。
>
{style="tip"}

### 不要なリリースバイナリをビルドしない {id="don-t-build-unnecessary-release-binaries"}

Kotlin/Nativeは、[デバッグとリリースの2つのビルドモード](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#declare-binaries)をサポートしています。リリースは高度に最適化されており、これには多くの時間がかかります。リリースバイナリのコンパイルは、デバッグバイナリよりも桁違いに時間がかかります。

実際のリリースを除けば、通常の開発サイクルにおいてこれらすべての最適化は不要かもしれません。開発プロセス中に名前に `Release` が含まれるタスクを使用している場合は、それを `Debug` に置き換えることを検討してください。同様に、`assembleXCFramework` を実行する代わりに、例えば `assembleSharedDebugXCFramework` を実行できます。

> リリースバイナリは `linkRelease*` Gradleタスクでビルドされます。これらはビルドログ、または `--scan` オプションを付けてGradleビルドを実行することで [Gradleビルドスキャン](https://docs.gradle.org/current/userguide/build_scans.html) で確認できます。
>
{style="tip"}

### リリースバイナリのキャッシュを有効にする {id="enable-caches-for-release-binaries"}
<primary-label ref="experimental-opt-in"/>

デフォルトでは、Kotlin/Nativeはリリースバイナリをリンク時最適化（link-time optimization: LTO）モードでコンパイルします。すべてのモジュールが一緒にコンパイルおよび最適化されます。これによりリリースバイナリの実行時パフォーマンスは高速になりますが、コンパイル時間が大幅に増加します。

コンパイラの最適化よりもコンパイルの高速化を優先したい場合は、リリースモードでのキャッシュを有効にできます。キャッシュを有効にするには、以下の両方のオプションを `gradle.properties` ファイルに追加してください。

```properties
# コンパイラがリリースモードでキャッシュを使用できるようにする
kotlin.native.binary.enableReleaseBinaryCache=true
# Kotlin Gradleプラグインが `-Xauto-cache-from` および関連オプションを指定してコンパイラを呼び出すようにする
kotlin.internal.native.enableReleaseBinaryCache=true
```

> この機能は現在活発に開発中であるため、実行時のパフォーマンスにはまだ改善の余地があります。今後のKotlinリリースでパフォーマンスの向上が計画されています。
> 
{style="warning"}

### リリースバイナリのサイズを削減する {id="reduce-the-size-of-release-binaries"}
<primary-label ref="experimental-opt-in"/>

リリースバイナリのサイズを削減し、ビルド時間を改善するには、[バイナリオプションを有効にする](native-binary-options.md#how-to-enable) `smallBinary` を試してください。

これにより、LLVMコンパイルフェーズにおいて、コンパイラのデフォルトの最適化引数として `-Oz` が実質的に設定されます。このオプションはまだ[試験的（Experimental）](components-stability.md#stability-levels-explained)であり、場合によっては実行時のパフォーマンスに影響を与える可能性があります。

### 推移的エクスポートを使用しない {id="don-t-use-transitive-export"}

[`transitiveExport = true`](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries) を使用すると、多くの場合でデッドコード削除（dead code elimination）が無効になるため、コンパイラは大量の未使用コードを処理しなければならなくなります。これによりコンパイル時間が増加します。代わりに、必要なプロジェクトや依存関係をエクスポートするには、`export` メソッドを明示的に使用してください。

### モジュールのエクスポートを控えめにする {id="don-t-export-modules-too-much"}

不要な[モジュールのエクスポート](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries)は避けてください。エクスポートされた各モジュールは、コンパイル時間とバイナリサイズに悪影響を及ぼします。

### Gradleビルドキャッシュを使用する {id="use-gradle-build-caching"}

Gradleの[ビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html)機能を有効にします。

* **ローカルビルドキャッシュ**: ローカルキャッシングを行うには、`gradle.properties` ファイルに `org.gradle.caching=true` を追加するか、コマンドラインで `--build-cache` オプションを付けてビルドを実行します。
* **リモートビルドキャッシュ**: 継続的インテグレーション環境向けに[リモートビルドキャッシュを構成する](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_configure_remote)方法を確認してください。

### Gradle構成キャッシュを使用する {id="use-gradle-configuration-cache"}

Gradleの[構成キャッシュ（configuration cache）](https://docs.gradle.org/current/userguide/configuration_cache.html)は、構成フェーズの結果をキャッシュすることでビルドパフォーマンスを向上させます。また、単一プロジェクト内での独立したタスクの並列実行を可能にし、暗黙的に `org.gradle.parallel` プロパティを有効にして、異なるプロジェクト間のタスクを[並列実行](https://docs.gradle.org/current/userguide/performance.html#sec:enable_parallel_execution)できるようにします。

Gradle構成キャッシュを使用するには、`gradle.properties` ファイルに `org.gradle.configuration-cache=true` プロパティを追加してください。

> 構成キャッシュを有効にすると、`link*` タスクの並列実行も可能になりますが、特にCPUコア数が多いマシンでは負荷が非常に高くなる可能性があります。この問題は [KT-70915](https://youtrack.jetbrains.com/issue/KT-70915) で修正される予定です。
>
{style="note"}

### 以前に無効にした機能を有効にする {id="enable-previously-disabled-features"}

以前にビルドの問題を回避するために、一部のKotlin/Native機能を無効にしていた可能性があります。例えば：

* `kotlin.native.disableCompilerDaemon=true` は [Gradleデーモン](https://docs.gradle.org/current/userguide/gradle_daemon.html) を無効にします。
* `disableNativeCache` は [コンパイルキャッシュ](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#binaries) を無効にします。

もともとこれらの回避策を必要としていた問題は、すでに修正されている可能性があります。`gradle.properties` ファイルまたはGradleビルドファイルにこれらの行が含まれている場合は、それらを削除してビルドが正常に完了するか確認してください。

### klibアーティファクトのインクリメンタルコンパイルを試す {id="try-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>

インクリメンタルコンパイルを使用すると、プロジェクトモジュールによって生成された `klib` アーティファクトの一部のみが変更された場合、`klib` のその部分だけがバイナリに再コンパイルされます。

この機能は[ベータ版（Beta）](components-stability.md#stability-levels-explained)です。有効にするには、`gradle.properties` ファイルに以下のオプションを追加してください：

```properties
kotlin.incremental.native=true
```

問題が発生した場合は、[YouTrackで課題を作成](https://kotl.in/issue)してください。

## Windowsの設定 {id="windows-configuration"}

Windows セキュリティが Kotlin/Native コンパイラを低速化させることがあります。デフォルトで `%\USERPROFILE%` にある `.konan` ディレクトリを Windows セキュリティの除外リストに追加することで、これを回避できます。[Windows セキュリティに除外設定を追加する](https://support.microsoft.com/en-us/windows/add-an-exclusion-to-windows-security-811816c0-4dfd-af4a-47e4-c301afe13b26)方法を確認してください。

## LLVMの設定 {id="llvm-configuration"}
<primary-label ref="advanced"/>

上記のヒントでコンパイル時間が改善されない場合は、[LLVMバックエンドのカスタマイズ](native-llvm-passes.md)を検討してください。