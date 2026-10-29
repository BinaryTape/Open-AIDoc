[//]: # (title: コンパイルの設定)

Kotlinマルチプラットフォームプロジェクトは、アーティファクトを生成するためにコンパイルを使用します。各ターゲットは、プロダクション用やテスト用など、1つ以上のコンパイルを持つことができます。

各ターゲットにおいて、デフォルトのコンパイルには以下が含まれます：

* JVM、JS、Nativeターゲット用の `main` および `test` コンパイル。
* Androidターゲット用の、[Androidビルドバリアント](https://developer.android.com/build/build-variants)ごとの[コンパイル](#android用のコンパイル)。

![コンパイル](compilations.svg)

プロダクションコードやユニットテスト以外のもの（例：統合テストやパフォーマンス性能テスト）をコンパイルする必要がある場合は、[カスタムコンパイルを作成](#create-a-custom-compilation)できます。

アーティファクトの生成方法は、以下のレベルで設定できます：

* プロジェクト内の[全てのコンパイル](#configure-all-compilations)を一括で設定。
* 1つのターゲットに複数のコンパイルが含まれる場合があるため、[特定のターゲットの全コンパイル](#configure-compilations-for-one-target)を設定。
* [特定のコンパイル](#configure-one-compilation)を個別に設定。

全ターゲットまたは特定のターゲットで利用可能な[コンパイルパラメータのリスト](multiplatform-dsl-reference.md#compilation-parameters)および[コンパイラオプション](https://kotlinlang.org/docs/gradle-compiler-options.html)を参照してください。

## 全てのコンパイルを設定する {id="configure-all-compilations"}

この例では、全てのターゲットで共通のコンパイラオプションを設定します：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

## 1つのターゲットのコンパイルを設定する {id="configure-compilations-for-one-target"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_1_8)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilerOptions {
            jvmTarget = JvmTarget.JVM_1_8
        }
    }
}
```

</TabItem>
</Tabs>

## 特定のコンパイルを1つ設定する {id="configure-one-compilation"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    jvmTarget.set(JvmTarget.JVM_1_8)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main {
            compileTaskProvider.configure {
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_1_8
                }
            }
        }
    }
}
```

</TabItem>
</Tabs>

## カスタムコンパイルを作成する {id="create-a-custom-compilation"}

プロダクションコードやユニットテスト以外（例：統合テストやパフォーマンス性能テスト）をコンパイルする必要がある場合は、カスタムコンパイルを作成します。

カスタムコンパイルの場合、すべての依存関係を手動で設定する必要があります。カスタムコンパイルのデフォルトソースセットは、`commonMain` および `commonTest` ソースセットに依存しません。

例えば、`jvm` ターゲットの統合テスト用にカスタムコンパイルを作成するには、`integrationTest` コンパイルと `main` コンパイルの間に [`associateWith`](https://kotlinlang.org/docs/gradle-configure-project.html#associate-compiler-tasks) 関係を設定します：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations {
            val main by getting
            val integrationTest by creating {
                // main とそのクラスパスを依存関係としてインポートし、internal 可視性を確立します
                associateWith(main)
                defaultSourceSet {
                    dependencies {
                        implementation(kotlin("test-junit"))
                        /* ... */
                    }
                }
            }

            // このコンパイルによって生成されたテストを実行するためのテストタスクを作成します：
            testRuns.create("integration") {
                // テストタスクを設定します
                setExecutionSourceFrom(integrationTest)
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.create('integrationTest') {
            def main = compilations.main
            // main とそのクラスパスを依存関係としてインポートし、internal 可視性を確立します
            associateWith(main)
            defaultSourceSet {
                dependencies {
                    implementation kotlin('test-junit')
                    /* ... */
                }
            }
        }

        // このコンパイルによって生成されたテストを実行するためのテストタスクを作成します
        testRuns.create('integration') {
            // テストタスクを設定します
            setExecutionSourceFrom(compilations.integrationTest)
        }
    }
}
```

</TabItem>
</Tabs>

コンパイルを関連付ける（associating）ことで、メインコンパイルの出力を依存関係として追加し、コンパイル間での `internal` 可視性を確立します。

カスタムコンパイルは、他のケースでも必要になります。例えば、最終的なアーティファクトで異なるJVMバージョンのコンパイルを組み合わせたい場合や、既にGradleでソースセットを設定していてマルチプラットフォームプロジェクトに移行したい場合などです。

> [`android`](#compilation-for-android) 用のカスタムコンパイルを作成するには、[Android Gradle プラグイン](https://developer.android.com/build/build-variants)を通じてビルドバリアントを設定してください。
> 
{style="tip"}

## JVM用のコンパイル {id="compilation-for-jvm"}

マルチプラットフォームプロジェクトで `jvm` ターゲットを宣言すると、Kotlin Multiplatform Gradleプラグインは自動的にJavaソースセットを作成し、JVMターゲットのコンパイルに含めます。

共通ソースセット（common source sets）にはJavaリソースを含めることができないため、それらはマルチプラットフォームプロジェクトの対応する子ディレクトリに配置する必要があります。例：

![Javaソースファイル](java-source-paths.png){width=200}

現在、Kotlin Multiplatform Gradleプラグインは、Javaプラグインによって設定される一部のタスクを置き換えます：

* JARタスク：標準の `jar` の代わりに、アーティファクト名に基づいたターゲット固有のタスクを使用します。例えば、`jvm()` ターゲット宣言の場合は `jvmJar`、`jvm("desktop")` の場合は `desktopJar` となります。
* テストタスク：標準の `test` の代わりに、アーティファクト名に基づいたターゲット固有のタスクを使用します。例えば、`jvmTest` となります。
* リソース処理：`*ProcessResources` タスクの代わりに、リソースは対応するコンパイルタスクによって処理されます。

これらのタスクは、ターゲットが宣言されると自動的に作成されます。ただし、必要に応じてJARタスクを手動で定義し、設定することも可能です：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 共有モジュールの `build.gradle.kts` ファイル
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}

kotlin {
    // JVMターゲットを指定
    jvm {
        // JAR生成用のタスクを追加
        tasks.named<Jar>(artifactsTaskName).configure {
            // タスクを設定
        }
    }

    sourceSets {
        jvmMain {
            dependencies {
                // JVM固有の依存関係を追加
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 共有モジュールの `build.gradle` file
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}

kotlin {
    // JVMターゲットを指定
    jvm {
        // JAR生成用のタスクを追加
        tasks.named<Jar>(artifactsTaskName).configure {
            // タスクを設定
        }
    }

    sourceSets {
        jvmMain {
            dependencies {
                // JVM固有の依存関係を追加
            }
        }
    }
}
```

</TabItem>
</Tabs>

このターゲットはKotlin Multiplatform Gradleプラグインによってパブリッシュ（公開）されるため、Javaプラグイン固有の手順は必要ありません。

## ネイティブ言語との相互運用を設定する {id="configure-interop-with-native-languages"}

Kotlinは[ネイティブ言語との相互運用性（Interop）](https://kotlinlang.org/docs/native-overview.html)を提供しており、特定のコンパイルに対してこれを設定するためのDSLを備えています。

| ネイティブ言語 | サポートされているプラットフォーム | 備考 |
|-----------------------|---------------------------------------------|---------------------------------------------------------------------------|
| C | すべてのプラットフォーム | |
| Objective-C | Appleプラットフォーム (macOS, iOS, watchOS, tvOS) | |
| Swift (Objective-C経由) | Appleプラットフォーム (macOS, iOS, watchOS, tvOS) | Kotlinは `@objc` 属性が付与されたSwift宣言のみを使用できます。 |

1つのコンパイルで複数のネイティブライブラリとやり取りできます。[定義ファイル（definition file）](https://kotlinlang.org/docs/native-definition-file.html)のプロパティ、またはビルドファイルの [`cinterops` ブロック](multiplatform-dsl-reference.md#cinterops)を使用して相互運用を設定します：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    linuxX64 { // 必要なターゲットに置き換えてください。
        compilations.getByName("main") {
            val myInterop by cinterops.creating {
                // ネイティブAPIを記述するDefファイル。
                // デフォルトのパスは src/nativeInterop/cinterop/<interop-name>.def です。
                definitionFile.set(project.file("def-file.def"))
                
                // 生成されるKotlin APIを配置するパッケージ。
                packageName("org.sample")
                
                // cinterop ツールによってコンパイラに渡されるオプション。
                compilerOpts("-Ipath/to/headers")
              
                // ヘッダーを検索するディレクトリ。
                includeDirs.apply {
                    // ヘッダー検索用のディレクトリ（コンパイラオプション -I<path> と同等）。
                    allHeaders("path1", "path2")
                    
                    // Defファイルの 'headerFilter' オプションにリストされているヘッダーを検索する追加ディレクトリ。
                    // コマンドラインオプション -headerFilterAdditionalSearchPrefix と同等。
                    headerFilterOnly("path1", "path2")
                }
                // includeDirs.allHeaders のショートカット。
                includeDirs("include/directory", "another/directory")
            }
            
            val anotherInterop by cinterops.creating { /* ... */ }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    linuxX64 { // 必要なターゲットに置き換えてください。
        compilations.main {
            cinterops {
                myInterop {
                    // ネイティブAPIを記述するDefファイル。
                    // デフォルトのパスは src/nativeInterop/cinterop/<interop-name>.def です。
                    definitionFile = project.file("def-file.def")
                    
                    // 生成されるKotlin APIを配置するパッケージ。
                    packageName 'org.sample'
                    
                    // cinterop ツールによってコンパイラに渡されるオプション。
                    compilerOpts '-Ipath/to/headers'
                    
                    // ヘッダー検索用のディレクトリ（コンパイラオプション -I<path> と同等）。
                    includeDirs.allHeaders("path1", "path2")
                    
                    // Defファイルの 'headerFilter' オプションにリストされているヘッダーを検索する追加ディレクトリ。
                    // コマンドラインオプション -headerFilterAdditionalSearchPrefix と同等。
                    includeDirs.headerFilterOnly("path1", "path2")
                    
                    // includeDirs.allHeaders のショートカット。
                    includeDirs("include/directory", "another/directory")
                }
                
                anotherInterop { /* ... */ }
            }
        }
    }
}
```

</TabItem>
</Tabs>

## Android用のコンパイル {id="compilation-for-android"}
 
Androidターゲット用にデフォルトで作成されるコンパイルは、[Androidビルドバリアント](https://developer.android.com/build/build-variants)に関連付けられています。各ビルドバリアントに対して、同じ名前でKotlinコンパイルが作成されます。

そして、各バリアントでコンパイルされる各[Androidソースセット](https://developer.android.com/build/build-variants#sourcesets)に対して、そのソースセット名の前にターゲット名を付加した名前でKotlinソースセットが作成されます。例えば、Androidソースセット `debug` に対してはKotlinソースセット `androidDebug`（ターゲット名が `android` の場合）が作成されます。
これらのKotlinソースセットは、対応するバリアントのコンパイルに追加されます。

デフォルトのソースセット `commonMain` は、各プロダクション（アプリケーションまたはライブラリ）バリアントのコンパイルに追加されます。`commonTest` ソースセットも同様に、ユニットテストおよびインストルメンテッドテスト（instrumented test）バリアントのコンパイルに追加されます。

[`kapt`](https://kotlinlang.org/docs/kapt.html) によるアノテーション処理もサポートされていますが、現在の制限により、`kapt` 依存関係を設定する前に Android ターゲットを作成する必要があります。また、これらは Kotlin ソースセットの依存関係内ではなく、トップレベルの `dependencies {}` ブロックで行う必要があります。

```kotlin
kotlin {
    android { /* ... */ }
}

dependencies {
    kapt("com.my.annotation:processor:1.0.0")
}
```

## ソースセット階層のコンパイル {id="compilation-of-the-source-set-hierarchy"}

Kotlinは `dependsOn` 関係を使用して[ソースセット階層](multiplatform-share-on-platforms.md#share-code-on-similar-platforms)を構築できます。

![ソースセット階層](jvm-js-main.svg)

ソースセット `jvmMain` がソースセット `commonMain` に依存している場合：

* `jvmMain` が特定のターゲット向けにコンパイルされる際、`commonMain` もそのコンパイルに参加し、JVMクラスファイルなどの同じターゲットバイナリ形式にコンパイルされます。
* `jvmMain` のソースは、`internal` 宣言を含む `commonMain` の宣言を「見る」ことができ、また `implementation` 依存関係として指定されたものを含め、`commonMain` の[依存関係](multiplatform-add-dependencies.md)も見ることができます。
* `jvmMain` は、`commonMain` の[期待される宣言（expected declarations）](multiplatform-expect-actual.md)に対して、プラットフォーム固有の実装を含むことができます。
* `commonMain` のリソースは常に処理され、`jvmMain` のリソースと一緒にコピーされます。
* `jvmMain` と `commonMain` の[言語設定](multiplatform-dsl-reference.md#language-settings)は一貫している必要があります。

言語設定の一貫性は以下の方法でチェックされます：
* `jvmMain` は、`commonMain` のものと同じかそれより新しい `languageVersion` を設定する必要があります。
* `jvmMain` は、`commonMain` が有効にしているすべての不安定な言語機能を有効にする必要があります（バグ修正機能についてはこの要件はありません）。
* `jvmMain` は、`commonMain` が使用しているすべての実験的アノテーションを使用する必要があります。
* `apiVersion`、バグ修正言語機能、および `progressiveMode` は任意に設定できます。

## GradleのIsolated Projects機能を設定する {id="configure-isolated-projects-feature-in-gradle"}

> この機能は[試験的（Experimental）](supported-platforms.md#general-kotlin-stability-levels)であり、現在はGradleにおいてプレアルファ（pre-alpha）の状態です。Gradle バージョン 8.10 以降でのみ使用し、評価目的のみに留めてください。この機能はいつでも削除または変更される可能性があります。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform) でのフィードバックをお待ちしております。使用にはオプトインが必要です（詳細は以下を参照）。
> 
{style="warning"}

Gradleは [Isolated Projects](https://docs.gradle.org/current/userguide/isolated_projects.html)（プロジェクトの分離）機能を提供しており、個々のプロジェクトを互いに「分離」することでビルドパフォーマンスを向上させます。この機能は、プロジェクト間のビルドスクリプトとプラグインを分離し、安全に並列実行できるようにします。

この機能を有効にするには、Gradleの指示に従って[システムプロパティを設定](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it)してください。

Isolated Projects機能の詳細については、[Gradleのドキュメント](https://docs.gradle.org/current/userguide/isolated_projects.html)を参照してください。