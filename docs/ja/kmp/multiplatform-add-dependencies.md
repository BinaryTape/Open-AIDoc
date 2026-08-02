[//]: # (title: マルチプラットフォームライブラリへの依存関係の追加)

すべてのプログラムが正常に動作するには、一連のライブラリが必要です。Kotlin Multiplatformプロジェクトは、すべてのターゲットプラットフォームで動作するマルチプラットフォームライブラリ、プラットフォーム固有のライブラリ、および他のマルチプラットフォームプロジェクトに依存できます。

依存関係を追加するには、共有コードを含むプロジェクトのディレクトリにある `build.gradle(.kts)` ファイルを更新します。[`dependencies {}`](multiplatform-dsl-reference.md#dependencies) ブロックで、必要な[タイプ](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)（例えば `implementation`）の依存関係を設定します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0") // すべてのソースセットで共有されるライブラリ
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

## Kotlinライブラリへの依存関係

### 標準ライブラリ

各ソースセットへの標準ライブラリ（`stdlib`）の依存関係は自動的に追加されます。標準ライブラリのバージョンは、`kotlin-multiplatform` プラグインのバージョンと同じです。

プラットフォーム固有のソースセットには、対応するプラットフォーム固有のバリアントのライブラリが使用され、それ以外のソースセットには共通の標準ライブラリが追加されます。Kotlin Gradleプラグインは、Gradleビルドスクリプトの `compilerOptions.jvmTarget` [コンパイラオプション](https://kotlinlang.org/docs/gradle-compiler-options.html)に応じて、適切なJVM標準ライブラリを選択します。

[デフォルトの動作を変更する方法](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)についてはこちらをご覧ください。

### テストライブラリ

マルチプラットフォームテストでは、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) APIを利用できます。マルチプラットフォームプロジェクトを作成する際、`commonTest` で単一の依存関係を使用することで、すべてのソースセットにテストの依存関係を追加できます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // すべてのプラットフォーム依存関係を自動的に取り込みます
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // すべてのプラットフォーム依存関係を自動的に取り込みます
            }
        }
    }
}
```

</TabItem>
</Tabs>

### kotlinxライブラリ

マルチプラットフォームライブラリを使用し、[共有コードに依存](#library-shared-for-all-source-sets)する必要がある場合は、共有ソースセットで一度だけ依存関係を設定してください。`kotlinx-coroutines-core` のようなライブラリのベースアーティファクト名を使用します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</TabItem>
</Tabs>

[プラットフォーム固有の依存関係](#library-used-in-specific-source-sets)として kotlinx ライブラリが必要な場合でも、対応するプラットフォームソースセットでライブラリのベースアーティファクト名を使用できます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</TabItem>
</Tabs>

## Kotlin Multiplatformライブラリへの依存関係

[SQLDelight](https://github.com/cashapp/sqldelight)など、Kotlin Multiplatform技術を採用しているライブラリへの依存関係を追加できます。これらのライブラリの作者は通常、プロジェクトに依存関係を追加するためのガイドを提供しています。

> [klibs.io](https://klibs.io/)で利用可能なKotlin Multiplatformライブラリを探してみてください。
>
{style="tip"}

### すべてのソースセットで共有されるライブラリ

すべてのソースセットからライブラリを使用したい場合は、共通（common）ソースセットにのみ追加できます。Kotlin Multiplatform Gradleプラグインは、他のソースセットに対応するパーツを自動的に追加します。

> 共通ソースセットにプラットフォーム固有のライブラリの依存関係を設定することはできません。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("io.ktor:ktor-client-core:%ktorVersion%")
        }
        androidMain.dependencies {
            // ktor-clientのプラットフォーム用パーツへの依存関係が自動的に追加されます
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'io.ktor:ktor-client-core:%ktorVersion%'
            }
        }
        androidMain {
            dependencies {
                // ktor-clientのプラットフォーム用パーツへの依存関係が自動的に追加されます
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 共通ライブラリをトップレベルの `dependencies {}` ブロックで構成することもできます。[トップレベルでの依存関係の構成](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)を参照してください。
> 
{style="tip"}

### 特定のソースセットで使用されるライブラリ

特定のソースセットでのみマルチプラットフォームライブラリを使用したい場合は、それらのソースセットにのみライブラリを追加できます。指定されたライブラリの宣言は、それらのソースセットでのみ利用可能になります。

> このような場合は、プラットフォーム固有の名前ではなく、共通のライブラリ名を使用してください。以下の例のSQLDelightのように、`native-driver-iosx64` ではなく `native-driver` を使用します。正確な名前はライブラリのドキュメントで確認してください。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutinesはすべてのソースセットで利用可能になります
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        androidMain.dependencies {

        }
        iosMain.dependencies {
            // SQLDelightはiOSソースセットでのみ利用可能になり、Androidやcommonでは利用できません
            implementation("com.squareup.sqldelight:native-driver:%sqlDelightVersion%")
        }
        wasmJsMain.dependencies {
            
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                // kotlinx.coroutinesはすべてのソースセットで利用可能になります
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        androidMain {
            dependencies {}
        }
        iosMain {
            dependencies {
                // SQLDelightはiOSソースセットでのみ利用可能になり、Androidやcommonでは利用できません
                implementation 'com.squareup.sqldelight:native-driver:%sqlDelightVersion%'
            }
        }
        wasmJsMain {
            dependencies {}
        }
    }
}
```

</TabItem>
</Tabs>

## 他のマルチプラットフォームプロジェクトへの依存関係

あるマルチプラットフォームプロジェクトを別のプロジェクトの依存関係として接続できます。これを行うには、プロジェクトの依存関係をそれを必要とするソースセットに追加するだけです。すべてのソースセットで依存関係を使用したい場合は、共通ソースセットに追加します。この場合、他のソースセットにはそれぞれのバージョンが自動的に適用されます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(project(":some-other-multiplatform-module"))
        }
        androidMain.dependencies {
            // :some-other-multiplatform-module のプラットフォーム用パーツが自動的に追加されます
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation project(':some-other-multiplatform-module')
            }
        }
        androidMain {
            dependencies {
                // :some-other-multiplatform-module のプラットフォーム用パーツが自動的に追加されます
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 次のステップ

マルチプラットフォームプロジェクトでの依存関係の追加に関する他のリソースを確認し、以下についてさらに詳しく学びましょう：

* [Androidの依存関係の追加](multiplatform-android-dependencies.md)
* [iOSの依存関係の追加](multiplatform-ios-dependencies.md)
* [iOS、Android、デスクトップ、およびWebをターゲットとするCompose Multiplatformプロジェクトでの依存関係の追加](compose-multiplatform-modify-project.md#add-a-new-dependency)