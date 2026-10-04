[//]: # (title: マルチプラットフォームプロジェクト構造の高度な概念)

この記事では、Kotlin Multiplatformプロジェクト構造の高度な概念と、それらがGradleの実装にどのようにマッピングされるかを説明します。この情報は、Gradleビルドの低レベルの抽象化（configuration、task、publicationなど）を操作する必要がある場合や、Kotlin Multiplatformビルド用のGradleプラグインを作成している場合に役立ちます。

このページは、以下のような場合に役立ちます。

* Kotlinがソースセット（source set）を自動作成しないターゲット群の間でコードを共有する必要がある場合。
* Kotlin Multiplatformビルド用のGradleプラグインを作成したい場合、またはconfiguration、task、publicationなどのGradleビルドの低レベルの抽象化を操作する必要がある場合。

> 高度な概念を掘り下げる前に、[マルチプラットフォームプロジェクト構造の基本](multiplatform-discover-project.md)を学習することをお勧めします。
>
{style="tip"}

マルチプラットフォームプロジェクトの依存関係管理に関して理解すべき最も重要な点の1つは、Gradleスタイルのプロジェクトまたはライブラリの依存関係と、Kotlin固有のソースセット間の `dependsOn` 関係との違いです。

* `dependsOn` は、一般的なマルチプラットフォームプロジェクトにおける[ソースセット階層](#dependson-and-source-set-hierarchies)とコード共有を可能にする、共通ソースセットとプラットフォーム固有ソースセットの間の関係です。デフォルトのソースセットの場合、階層は自動的に管理されますが、特定の状況では変更が必要になる場合があります。
* ライブラリとプロジェクトの依存関係は通常通りに機能しますが、マルチプラットフォームプロジェクトでこれらを適切に管理するには、コンパイルに使用される粒度の細かい **ソースセット → ソースセット** の依存関係へと[Gradleの依存関係がどのように解決されるか](#dependencies-on-other-libraries-or-projects)を理解する必要があります。

## dependsOn とソースセット階層 {id="dependson-and-source-set-hierarchies"}

通常、作業の対象となるのは「依存関係（dependencies）」であり、*`dependsOn`* 関係そのものではありません。しかし、`dependsOn` を検証することは、Kotlin Multiplatformプロジェクトが内部でどのように機能しているかを理解する上で非常に重要です。

`dependsOn` は、2つのKotlinソースセット間のKotlin固有の関係です。これは、たとえば `jvmMain` ソースセットが `commonMain` に依存したり、`iosArm64Main` が `iosMain` に依存したりするように、共通ソースセットとプラットフォーム固有ソースセットの間の接続になり得ます。

Kotlinソースセット `A` と `B` の一般的な例を考えてみましょう。`A.dependsOn(B)` という式は、Kotlinに次のことを指示します。

1. `A` は、内部（internal）宣言を含め、`B` のAPIを参照できる。
2. `A` は、`B` の期待される宣言（expected declarations、`expect`）に対して実際のนี่実装（actual implementations、`actual`）を提供できる。これは必要十分条件であり、`A` が直接的または間接的に `A.dependsOn(B)` である場合にのみ、`A` は `B` の `actual` を提供できます。
3. `B` は、自身のターゲットに加えて、`A` がコンパイルされるすべてのターゲットに対してもコンパイルされる必要がある。
4. `A` は、`B` のすべての通常の依存関係を継承する。

`dependsOn` 関係は、ソースセット階層として知られるツリー状の構造を作成します。以下は、`android`、`iosArm64`（iPhone実機）、および `iosSimulatorArm64`（Apple Silicon Mac用iPhoneシミュレーター）を使用したモバイル開発向けの一般的なプロジェクトの例です。

![DependsOnのツリー構造](dependson-tree-diagram.svg){width=700}

矢印は `dependsOn` 関係を表しています。
これらの関係は、プラットフォームバイナリのコンパイル中も保持されます。これにより、Kotlinは `iosMain` が `commonMain` のAPIを参照できる一方で、`iosArm64Main` のAPIは参照できないということを理解します。

![コンパイル中のDependsOn関係](dependson-relations-diagram.svg){width=700}

`dependsOn` 関係は、`KotlinSourceSet.dependsOn(KotlinSourceSet)` 呼び出しで構成されます。次に例を示します。

```kotlin
kotlin {
    // ターゲットの宣言
    sourceSets {
        // dependsOn関係の構成例
        iosArm64Main.dependsOn(commonMain)
    }
}
```

* この例は、ビルドスクリプトで `dependsOn` 関係を定義する方法を示しています。ただし、Kotlin Gradleプラグインはデフォルトでソースセットを作成し、これらの関係をセットアップするため、手動で行う必要はありません。
* `dependsOn` 関係は、ビルドスクリプト内の `dependencies {}` ブロックとは別に宣言されます。これは、`dependsOn` が通常の依存関係ではなく、異なるターゲット間でコードを共有するために必要なKotlinソースセット間の特定の関係であるためです。

公開されたライブラリや別のGradleプロジェクトに対する通常の依存関係を宣言するために `dependsOn` を使用することはできません。
たとえば、`commonMain` が `kotlinx-coroutines-core` ライブラリの `commonMain` に依存するように設定したり、`commonTest.dependsOn(commonMain)` を呼び出したりすることはできません。

### カスタムソースセットの宣言 {id="declaring-custom-source-sets"}

場合によっては、プロジェクトにカスタムの中間ソースセットを用意する必要が生じることがあります。
JVM、JS、Linuxにコンパイルするプロジェクトがあり、JVMとJSの間でのみ一部のソースを共有したい場合を考えてみましょう。
この場合、[マルチプラットフォームプロジェクト構造の基本](multiplatform-discover-project.md)で説明されているように、このターゲットのペアに対応する特定のソースセットを見つける必要があります。

Kotlinはこのようなソースセットを自動的には作成しません。つまり、`by creating` 構文を使用して手動で作成する必要があります。

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        // "jvmAndJs" という名前のソースセットを作成
        val jvmAndJsMain by creating {
            // …
        }
    }
}
```

しかし、Kotlinはこのソースセットをどのように処理またはコンパイルすればよいかをまだ認識していません。図を描くと、このソースセットは孤立しており、ターゲットラベルが何も付いていない状態になります。

![不足しているdependsOn関係](missing-dependson-diagram.svg){width=700}

これを修正するには、いくつかの `dependsOn` 関係を追加して、`jvmAndJsMain` を階層に含めます。

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        val jvmAndJsMain by creating {
            // commonMainへのdependsOnの追加を忘れないようにしてください
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

ここで、`jvmMain.dependsOn(jvmAndJsMain)` は `jvmAndJsMain` にJVMターゲットを追加し、`jsMain.dependsOn(jvmAndJsMain)` は `jvmAndJsMain` にJSターゲットを追加します。

最終的なプロジェクト構造は次のようになります。

![最終的なプロジェクト構造](final-structure-diagram.svg){width=700}

> `dependsOn` 関係を手動で構成すると、デフォルトの階層テンプレートの自動適用が無効になります。
> このようなケースとその対処方法の詳細については、[追加の構成](multiplatform-hierarchy.md#additional-configuration)を参照してください。
>
{style="note"}

## 他のライブラリやプロジェクトへの依存関係 {id="dependencies-on-other-libraries-or-projects"}

マルチプラットフォームプロジェクトでは、公開されたライブラリまたは別のGradleプロジェクトのいずれかに対して通常の依存関係を設定できます。

Kotlin Multiplatformは通常、一般的なGradleの方法で依存関係を宣言します。Gradleと同様に、以下のように行います。

* ビルドスクリプトで `dependencies {}` ブロックを使用する。
* 依存関係に対して適切なスコープ（`implementation` や `api` など）を選択する。
* 依存関係がリポジトリで公開されている場合は `"com.google.guava:guava:32.1.2-jre"` のようにその座標を指定し、同じビルド内のGradleプロジェクトである場合は `project(":utils:concurrency")` のようにそのパスを指定して参照する。

マルチプラットフォームプロジェクトでの依存関係の構成には、いくつかの特別な機能があります。各Kotlinソースセットには独自の `dependencies {}` ブロックがあります。これにより、プラットフォーム固有のソースセットでプラットフォーム固有の依存関係を宣言できます。

```kotlin
kotlin {
    // ターゲットの宣言
    sourceSets {
        jvmMain.dependencies {
            // これはjvmMainの依存関係であるため、JVM固有の依存関係を追加しても問題ありません
            implementation("com.google.guava:guava:32.1.2-jre")
        }
    }
}
```

共通の依存関係はもう少し複雑です。`kotlinx.coroutines` などのマルチプラットフォームライブラリに対する依存関係を宣言するマルチプラットフォームプロジェクトを考えてみましょう。

```kotlin
kotlin {
    android()     // Android
    iosArm64()          // iPhone実機
    iosSimulatorArm64() // Apple Silicon Mac上のiPhoneシミュレーター

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
```

依存関係の解決には3つの重要な概念があります。

1. マルチプラットフォームの依存関係は、`dependsOn` 構造に沿って下位に伝播されます。`commonMain` に依存関係を追加すると、`commonMain` に対して直接的または間接的に `dependsOn` 関係を宣言しているすべてのソースセットに、その依存関係が自動的に追加されます。

   この場合、依存関係はすべての `*Main` ソースセット（`iosMain`、`jvmMain`、`iosSimulatorArm64Main`、`iosArm64Main`）に実際に自動的に追加されました。これらすべてのソースセットは、`commonMain` ソースセットから `kotlin-coroutines-core` の依存関係を継承するため、それらすべてに手動でコピー＆ペーストする必要はありません。

   ![マルチプラットフォーム依存関係の伝播](dependency-propagation-diagram.svg){width=700}

   > 伝播メカニズムを使用すると、特定のソースセットを選択することで、宣言された依存関係を受け取るスコープを選択できます。
   > たとえば、iOSでは `kotlinx.coroutines` を使用したいが、Androidでは使用したくない場合は、この依存関係を `iosMain` だけに追加できます。
   >
   {style="tip"}

2. 上記の `commonMain` から `org.jetbrians.kotlinx:kotlinx-coroutines-core:1.7.3` へのような「*ソースセット → マルチプラットフォームライブラリ*」の依存関係は、依存関係解決の中間状態を表します。解決の最終状態は、常に「*ソースセット → ソースセット*」の依存関係によって表されます。

   > 最終的な「*ソースセット → ソースセット*」の依存関係は、`dependsOn` 関係ではありません。
   >
   {style="note"}

   粒度の細かい「*ソースセット → ソースセット*」の依存関係を推論するために、Kotlinは各マルチプラットフォームライブラリと一緒に公開されているソースセット構造を読み取ります。このステップの後、各ライブラリは内部で全体としてではなく、そのソースセットのコレクションとして表されます。`kotlinx-coroutines-core` の次の例を参照してください。

   ![ソースセット構造のシリアル化](structure-serialization-diagram.svg){width=700}

3. Kotlinは各依存関係を取得し、依存関係からのソースセットのコレクションへと解決します。そのコレクション内の各依存先ソースセットは、*互換性のあるターゲット* を持っている必要があります。依存先ソースセットが、コンシューマー（依存元）のソースセットと *少なくとも同じターゲット* にコンパイルされる場合、その依存先ソースセットは互換性のあるターゲットを持っています。

   サンプルのプロジェクトにおける `commonMain` が `android`、`iosArm64`、および `iosSimulatorArm64` にコンパイルされる例を考えてみましょう。

    * まず、`kotlinx-coroutines-core.commonMain` への依存関係が解決されます。これは、`kotlinx-coroutines-core` が考えられるすべてのKotlinターゲットに対してコンパイルされるために発生します。したがって、その `commonMain` は、必要な `android`、`iosArm64`、および `iosSimulatorArm64` を含む、考えられるすべてのターゲットに対してコンパイルされます。
    * 次に、`commonMain` は `kotlinx-coroutines-core.concurrentMain` に依存します。`kotlinx-coroutines-core` の `concurrentMain` はJSを除くすべてのターゲットにコンパイルされるため、コンシューマープロジェクトの `commonMain` のターゲットと一致します。

   ただし、coroutinesの `iosArm64Main` などのソースセットは、コンシューマーの `commonMain` と互換性がありません。`iosArm64Main` は `commonMain` のターゲットの1つである `iosArm64` にはコンパイルされますが、`android` や `iosSimulatorArm64` にはコンパイルされないためです。

   依存関係の解決結果は、`kotlinx-coroutines-core` 内のどのコードが可視になるかに直接影響します。

   ![共通コードでのJVM固有APIに関するエラー](dependency-resolution-error.png){width=700}

### ソースセット間での共通の依存関係のバージョン整合 {id="aligning-versions-of-common-dependencies-across-source-sets"}

Kotlin Multiplatformプロジェクトでは、klibを生成するため、および構成された各[コンパイル](multiplatform-configure-compilations.md)の一部として、共通ソースセットが複数回コンパイルされます。一貫したバイナリを生成するには、共通コードを毎回同じバージョンのマルチプラットフォーム依存関係に対してコンパイルする必要があります。Kotlin Gradleプラグインはこれらの依存関係を整合させるのに役立ち、各ソースセットに対して実効的な依存関係のバージョンが同じになるようにします。

上記の例で、`androidx.navigation:navigation-compose:2.7.7` の依存関係を `androidMain` ソースセットに追加したいとします。プロジェクトは `commonMain` ソースセットに対して `kotlinx-coroutines-core:1.7.3` の依存関係を明示的に宣言していますが、バージョン2.7.7のCompose NavigationライブラリにはKotlin coroutines 1.8.0以降が必要です。

`commonMain` と `androidMain` は一緒にコンパイルされるため、Kotlin Gradleプラグインは2つのバージョンのコルーチンライブラリのどちらかを選択し、`commonMain` ソースセットに `kotlinx-coroutines-core:1.8.0` を適用します。ただし、構成されたすべてのターゲットにわたって共通コードを一貫してコンパイルできるようにするには、iOSソースセットも同じ依存関係バージョンに制約される必要があります。そのため、Gradleは `kotlinx.coroutines-*:1.8.0` の依存関係を `iosMain` ソースセットにも伝播します。

![*Main ソースセット間での依存関係の整合](multiplatform-source-set-dependency-alignment.svg){width=700}

依存関係は、`*Main` ソースセットと [`*Test` ソースセット](multiplatform-discover-project.md#integration-with-tests)の間で別々に整合されます。`*Test` ソースセットのGradle構成には、`*Main` ソースセットのすべての依存関係が含まれますが、その逆はありません。そのため、メインのコードに影響を与えることなく、新しいライブラリバージョンでプロジェクトをテストできます。

たとえば、`*Main` ソースセットにKotlin coroutines 1.7.3の依存関係があり、それがプロジェクト内のすべてのソースセットに伝播されているとします。
しかし、`iosTest` ソースセットでは、新しいライブラリのリリースをテストするためにバージョンを1.8.0にアップグレードすることにしました。
同じアルゴリズムに従って、この依存関係は `*Test` ソースセットのツリー全体に伝播されるため、すべての `*Test` ソースセットは `kotlinx.coroutines-*:1.8.0` の依存関係でコンパイルされます。

![メインソースセットとは別に依存関係を解決するテストソースセット](test-main-source-set-dependency-alignment.svg)

## コンパイル（Compilations） {id="compilations"}

単一プラットフォームのプロジェクトとは異なり、Kotlin Multiplatformプロジェクトでは、すべてのアーティファクトをビルドするためにコンパイラを複数回起動する必要があります。コンパイラの各起動は、*Kotlinコンパイル* です。

たとえば、前述のKotlinコンパイル中にiPhone実機用のバイナリが生成される方法は次のとおりです。

![iOS用のKotlinコンパイル](ios-compilation-diagram.svg){width=700}

Kotlinのコンパイルは、ターゲットの下にグループ化されます。デフォルトでは、Kotlinはターゲットごとに2つのコンパイルを作成します。製品（プロダクション）ソース用の `main` コンパイルと、テストソース用の `test` コンパイルです。

ビルドスクリプト内のコンパイルには、同様の方法でアクセスします。最初にKotlinターゲットを選択し、次に内部の `compilations` コンテナにアクセスし、最後にその名前によって必要なコンパイルを選択します。

```kotlin
kotlin {
    // JVMターゲットの宣言と構成
    jvm {
        val mainCompilation: KotlinJvmCompilation = compilations.getByName("main")
    }
}
```