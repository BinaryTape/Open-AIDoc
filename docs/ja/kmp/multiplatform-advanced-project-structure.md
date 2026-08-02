[//]: # (title: マルチプラットフォームプロジェクト構造の高度な概念)

この記事では、Kotlin Multiplatformプロジェクト構造の高度な概念と、それらがGradleの実装にどのようにマッピングされるかについて説明します。この情報は、Gradleビルドの低レベルな抽象化（構成、タスク、パブリケーションなど）を扱う必要がある場合や、Kotlin Multiplatformビルド用のGradleプラグインを作成している場合に役立ちます。

このページは、以下のような場合に役立ちます：

* Kotlinがソースセットを自動作成しないターゲットのセット間でコードを共有する必要がある場合。
* Kotlin Multiplatformビルド用のGradleプラグインを作成したい、または構成、タスク、パブリケーションなどのGradleビルドの低レベルな抽象化を扱う必要がある場合。

マルチプラットフォームプロジェクトにおける依存関係管理を理解する上で重要なことの1つは、Gradleスタイルのプロジェクトまたはライブラリの依存関係と、Kotlin固有のソースセット間の `dependsOn` 関係の違いです。

* `dependsOn` は、共通（common）ソースセットとプラットフォーム固有のソースセット間の関係であり、[ソースセット階層](#dependson-and-source-set-hierarchies) を有効にし、一般にマルチプラットフォームプロジェクトでのコード共有を可能にします。デフォルトのソースセットの場合、階層は自動的に管理されますが、特定の状況下で変更が必要になる場合があります。
* ライブラリおよびプロジェクトの依存関係は、一般的には通常通り動作しますが、マルチプラットフォームプロジェクトでそれらを適切に管理するには、[Gradleの依存関係がどのように解決され](#dependencies-on-other-libraries-or-projects)、コンパイルに使用されるきめ細かな **ソースセット → ソースセット** の依存関係になるかを理解する必要があります。

> 高度な概念に進む前に、[マルチプラットフォームプロジェクト構造の基本](multiplatform-discover-project.md)を学習することをお勧めします。
>
{style="tip"}

## dependsOn とソースセット階層

通常は *依存関係（dependencies）* を扱うことになり、*`dependsOn`* 関係を直接扱うことはありません。しかし、Kotlin Multiplatformプロジェクトが内部でどのように機能するかを理解するためには、`dependsOn` を調べることが不可欠です。

`dependsOn` は、2つのKotlinソースセット間のKotlin固有のリレーションです。これは、共通ソースセットとプラットフォーム固有のソースセット間の接続である可能性があり、例えば `jvmMain` ソースセットが `commonMain` に依存したり、`iosArm64Main` が `iosMain` に依存したりする場合などです。

Kotlinソースセット `A` と `B` を用いた一般的な例を考えてみましょう。式 `A.dependsOn(B)` は、Kotlinに対して以下を指示します：

1. `A` は、内部（internal）宣言を含め、`B` からのAPIを参照できる。
2. `A` は、`B` からの期待される宣言（expected declarations）に対して、実際の実装（actual implementations）を提供できる。これは必要十分条件であり、`A` が直接的または間接的に `A.dependsOn(B)` である場合に限り、`A` は `B` に対して `actual` を提供できる。
3. `B` は、自身のターゲットに加えて、`A` がコンパイルされるすべてのターゲットに対してコンパイルされる必要がある。
4. `A` は、`B` のすべての通常の依存関係を継承する。

`dependsOn` 関係は、ソースセット階層として知られるツリー状の構造を作成します。以下は、`android`、`iosArm64`（iPhoneデバイス）、および `iosSimulatorArm64`（Apple Silicon Mac用のiPhoneシミュレーター）を使用したモバイル開発向けの典型的なプロジェクトの例です：

![DependsOn tree structure](dependson-tree-diagram.svg){width=700}

矢印は `dependsOn` 関係を表しています。
これらの関係は、プラットフォームバイナリのコンパイル中に保持されます。これにより、Kotlinは `iosMain` が `commonMain` からのAPIを見ることができ、`iosArm64Main` からのAPIは見ることができないことを理解します：

![DependsOn relations during compilation](dependson-relations-diagram.svg){width=700}

`dependsOn` 関係は `KotlinSourceSet.dependsOn(KotlinSourceSet)` 呼び出しで構成されます。例：

```kotlin
kotlin {
    // ターゲットの宣言
    sourceSets {
        // dependsOn 関係を構成する例
        iosArm64Main.dependsOn(commonMain)
    }
}
```

* この例は、ビルドスクリプトで `dependsOn` 関係を定義する方法を示しています。ただし、Kotlin Gradleプラグインはデフォルトでソースセットを作成し、これらの関係をセットアップするため、手動で行う必要はありません。
* `dependsOn` 関係は、ビルドスクリプトの `dependencies {}` ブロックとは別に宣言されます。これは、`dependsOn` が通常の依存関係ではなく、異なるターゲット間でコードを共有するために必要な、Kotlinソースセット間の特定の関係であるためです。

パブリッシュされたライブラリや別のGradleプロジェクトに対する通常の依存関係を宣言するために `dependsOn` を使用することはできません。例えば、`commonMain` が `kotlinx-coroutines-core` ライブラリの `commonMain` に依存するように設定したり、`commonTest.dependsOn(commonMain)` を呼び出したりすることはできません。

### カスタムソースセットの宣言

場合によっては、プロジェクトにカスタムの中間ソースセットが必要になることがあります。
JVM、JS、Linuxにコンパイルするプロジェクトがあり、JVMとJSの間だけで一部のソースを共有したい場合を考えてみましょう。この場合、[マルチプラットフォームプロジェクト構造の基本](multiplatform-discover-project.md)で説明されているように、このターゲットのペアに特定のソースセットを見つける必要があります。

Kotlinはこのようなソースセットを自動的には作成しません。つまり、`by creating` 構造を使用して手動で作成する必要があります。

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        // "jvmAndJs" という名前のソースセットを作成する
        val jvmAndJsMain by creating {
            // …
        }
    }
}
```

しかし、Kotlinはこのソースセットをどのように処理またはコンパイルするかをまだ知りません。図を描くと、このソースセットは孤立しており、ターゲットラベルを持ちません。

![Missing dependsOn relation](missing-dependson-diagram.svg){width=700}

これを修正するには、いくつかの `dependsOn` 関係を追加して、`jvmAndJsMain` を階層に含めます。

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        val jvmAndJsMain by creating {
            // commonMain への dependsOn を忘れずに追加する
            dependsOn(commonMain.get())
        }

        jvmMain {
            dependsOn(jvmAndJsMain)
        }

        jsMain {
            dependsOn(jvmAndJsMain)
        }
    }
}
```

ここで、`jvmMain.dependsOn(jvmAndJsMain)` は JVMターゲットを `jvmAndJsMain` に追加し、`jsMain.dependsOn(jvmAndJsMain)` は JSターゲットを `jvmAndJsMain` に追加します。

最終的なプロジェクト構造は次のようになります。

![Final project structure](final-structure-diagram.svg){width=700}

> `dependsOn` 関係を手動で構成すると、デフォルトの階層テンプレートの自動適用が無効になります。このようなケースの詳細と対処方法については、[追加の構成](multiplatform-hierarchy.md#additional-configuration)を参照してください。
>
{style="note"}

## 他のライブラリやプロジェクトへの依存関係

マルチプラットフォームプロジェクトでは、パブリッシュされたライブラリまたは別のGradleプロジェクトに対して通常の依存関係をセットアップできます。

Kotlin Multiplatformは通常、一般的なGradleの方法で依存関係を宣言します。Gradleと同様に、以下を行います：

* ビルドスクリプトで `dependencies {}` ブロックを使用する。
* 依存関係に対して適切なスコープ（例：`implementation` や `api`）を選択する。
* リポジトリにパブリッシュされている場合は `"com.google.guava:guava:32.1.2-jre"` のように座標を指定し、同じビルド内のGradleプロジェクトである場合は `project(":utils:concurrency")` のようにパスを指定して、依存関係を参照する。

マルチプラットフォームプロジェクトの依存関係構成には、いくつかの特別な機能があります。各Kotlinソースセットには、独自の `dependencies {}` ブロックがあります。これにより、プラットフォーム固有のソースセットでプラットフォーム固有の依存関係を宣言できます：

```kotlin
kotlin {
    // ターゲットの宣言
    sourceSets {
        jvmMain.dependencies {
            // これは jvmMain の依存関係なので、JVM固有の依存関係を追加しても問題ありません
            implementation("com.google.guava:guava:32.1.2-jre")
        }
    }
}
```

共通の依存関係はより複雑です。マルチプラットフォームライブラリ（例：`kotlinx.coroutines`）への依存関係を宣言するマルチプラットフォームプロジェクトを考えてみましょう。

```kotlin
kotlin {
    android()     // Android
    iosArm64()          // iPhoneデバイス 
    iosSimulatorArm64() // Apple Silicon Mac上のiPhoneシミュレーター

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
```

依存関係の解決には3つの重要な概念があります：

1. マルチプラットフォームの依存関係は、`dependsOn` 構造に沿って下方に伝播されます。`commonMain` に依存関係を追加すると、`commonMain` で直接的または間接的に `dependsOn` 関係を宣言しているすべてのソースセットに自動的に追加されます。

   この場合、依存関係は実際にすべての `*Main` ソースセット（`iosMain`、`jvmMain`、`iosSimulatorArm64Main`、および `iosArm64Main`）に自動的に追加されました。これらのソースセットはすべて `commonMain` ソースセットから `kotlin-coroutines-core` 依存関係を継承するため、それらすべてに手動でコピー＆ペーストする必要はありません。

   ![Propagation of multiplatform dependencies](dependency-propagation-diagram.svg){width=700}

   > 伝播メカニズムにより、特定のソースセットを選択することで、宣言された依存関係を受け取るスコープを選択できます。例えば、AndroidではなくiOSで `kotlinx.coroutines` を使用したい場合は、この依存関係を `iosMain` だけに追加できます。
   >
   {style="tip"}

2. 上記の `commonMain` から `org.jetbrians.kotlinx:kotlinx-coroutines-core:1.7.3` への依存関係のような、*ソースセット → マルチプラットフォームライブラリ* の依存関係は、依存関係解決の中間状態を表します。解決の最終状態は、常に *ソースセット → ソースセット* の依存関係によって表されます。

   > 最終的な *ソースセット → ソースセット* の依存関係は `dependsOn` 関係ではありません。
   >
   {style="note"}

   きめ細かな *ソースセット → ソースセット* の依存関係を推論するために、Kotlinは各マルチプラットフォームライブラリと共にパブリッシュされているソースセット構造を読み取ります。このステップの後、各ライブラリは内部的に全体としてではなく、そのソースセットのコレクションとして表現されます。`kotlinx-coroutines-core` の次の例を参照してください：

   ![Serialization of the source set structure](structure-serialization-diagram.svg){width=700}

3. Kotlinは各依存関係リレーションを取得し、依存関係からのソースセットのコレクションに解決します。そのコレクション内の各依存関係ソースセットは、*互換性のあるターゲット* を持っている必要があります。依存関係ソースセットは、コンシューマーソースセットと *少なくとも同じターゲット* に対してコンパイルされる場合、互換性のあるターゲットを持ちます。

   サンプルプロジェクトの `commonMain` が `android`、`iosArm64`、および `iosSimulatorArm64` に対してコンパイルされる例を考えてみましょう。

    * まず、`kotlinx-coroutines-core.commonMain` への依存関係を解決します。これは、`kotlinx-coroutines-core` が可能なすべてのKotlinターゲットに対してコンパイルされるために発生します。したがって、その `commonMain` は、必要な `android`、`iosArm64`、および `iosSimulatorArm64` を含む、可能なすべてのターゲットに対してコンパイルされます。
    * 次に、`commonMain` は `kotlinx-coroutines-core.concurrentMain` に依存します。`kotlinx-coroutines-core` の `concurrentMain` は JS を除くすべてのターゲットに対してコンパイルされるため、コンシューマープロジェクトの `commonMain` のターゲットと一致します。

   しかし、coroutinesの `iosArm64Main` などのソースセットは、コンシューマーの `commonMain` と互換性がありません。`iosArm64Main` は `commonMain` のターゲットの1つである `iosArm64` に対してコンパイルされますが、`android` や `iosSimulatorArm64` に対してはコンパイルされません。

   依存関係解決の結果は、`kotlinx-coroutines-core` 内のどのコードが表示されるかに直接影響します：

   ![Error on JVM-specific API in common code](dependency-resolution-error.png){width=700}

### ソースセット間での共通の依存関係バージョンの調整

Kotlin Multiplatformプロジェクトでは、共通ソースセットは klib を生成するため、および構成された各[コンパイル](multiplatform-configure-compilations.md)の一部として数回コンパイルされます。一貫したバイナリを生成するには、共通コードは毎回同じバージョンのマルチプラットフォーム依存関係に対してコンパイルされる必要があります。Kotlin Gradleプラグインはこれらの依存関係を調整（アライン）し、有効な依存関係バージョンが各ソースセットで同じになるようにします。

上記の例で、`androidMain` ソースセットに `androidx.navigation:navigation-compose:2.7.7` 依存関係を追加したいとします。プロジェクトでは `commonMain` ソースセットに対して `kotlinx-coroutines-core:1.7.3` 依存関係を明示的に宣言していますが、バージョン 2.7.7 の Compose Navigation ライブラリは Kotlin coroutines 1.8.0 以降を必要とします。

`commonMain` と `androidMain` は一緒にコンパイルされるため、Kotlin Gradleプラグインは2つのバージョンの coroutines ライブラリから選択し、`kotlinx-coroutines-core:1.8.0` を `commonMain` ソースセットに適用します。しかし、共通コードをすべての構成済みターゲットで一貫してコンパイルできるようにするために、iOSソースセットも同じ依存関係バージョンに制限する必要があります。そのため、Gradleは `kotlinx.coroutines-*:1.8.0` 依存関係を `iosMain` ソースセットにも伝播させます。

![Alignment of dependencies among *Main source sets](multiplatform-source-set-dependency-alignment.svg){width=700}

依存関係は、`*Main` ソースセットと [`*Test` ソースセット](multiplatform-discover-project.md#integration-with-tests) の間で個別に調整されます。`*Test` ソースセットのGradle構成には `*Main` ソースセットのすべての依存関係が含まれますが、その逆はありません。そのため、メインコードに影響を与えることなく、新しいライブラリバージョンでプロジェクトをテストできます。

例えば、`*Main` ソースセットに Kotlin coroutines 1.7.3 の依存関係があり、プロジェクト内のすべてのソースセットに伝播されているとします。
しかし、`iosTest` ソースセットでは、新しいライブラリのリリースをテストするために、バージョンを 1.8.0 にアップグレードすることにしました。同じアルゴリズムに従って、この依存関係は `*Test` ソースセットのツリー全体に伝播されるため、すべての `*Test` ソースセットは `kotlinx.coroutines-*:1.8.0` 依存関係を使用してコンパイルされます。

![Test source sets resolving dependencies separately from the main source sets](test-main-source-set-dependency-alignment.svg)

## コンパイル (Compilations)

単一プラットフォームのプロジェクトとは異なり、Kotlin Multiplatformプロジェクトではすべてのアーティファクトをビルドするために複数のコンパイラ起動が必要です。各コンパイラの起動は、*Kotlinコンパイル (Kotlin compilation)* です。

例えば、前述のKotlinコンパイル中に、iPhoneデバイス用のバイナリがどのように生成されるかを以下に示します：

![Kotlin compilation for iOS](ios-compilation-diagram.svg){width=700}

Kotlinコンパイルはターゲットの下にグループ化されます。デフォルトでは、Kotlinはターゲットごとに2つのコンパイルを作成します。プロダクションソース用の `main` コンパイルと、テストソース用の `test` コンパイルです。

ビルドスクリプト内のコンパイルには、同様の方法でアクセスします。まず Kotlin ターゲットを選択し、その中の `compilations` コンテナにアクセスし、最後にその名前で必要なコンパイルを選択します：

```kotlin
kotlin {
    // JVM ターゲットを宣言して構成する
    jvm {
        val mainCompilation: KotlinJvmCompilation = compilations.getByName("main")
    }
}