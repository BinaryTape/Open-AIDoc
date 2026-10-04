[//]: # (title: ソースセット階層)

Kotlin Multiplatformプロジェクトは、階層的なソースセット構造をサポートしています。
これにより、[サポートされているターゲット](multiplatform-dsl-reference.md#targets)のすべてではなく一部の間で共通コードを共有するために、中間ソースセット（intermediate source set）の階層を構成できます。中間ソースセットを使用すると、以下のことが可能になります：

* 一部のターゲットに対して特定のAPIを提供する。例えば、ライブラリはKotlin/JVMターゲット用ではなく、Kotlin/Nativeターゲット用の中間ソースセットにNative固有のAPIを追加できます。
* 一部のターゲット向けの特定のAPIを利用する。例えば、中間ソースセットを構成する一部のターゲットに対してKotlin Multiplatformライブラリが提供する豊富なAPIを活用できます。
* プロジェクト内でプラットフォーム依存のライブラリを使用する。例えば、中間iOSソースセットからiOS固有の依存関係にアクセスできます。

Kotlinツールチェーンは、各ソースセットがそのソースセットのコンパイル対象となるすべてのターゲットで利用可能なAPIにのみアクセスできるように保証します。これにより、Windows固有のAPIを使用してmacOS向けにコンパイルした結果、リンクエラーや実行時の未定義動作が発生するといったケースを防ぎます。

ソースセット階層を設定する推奨される方法は、[デフォルト階層テンプレート](#default-hierarchy-template)を使用することです。
このテンプレートは、最も一般的なユースケースをカバーしています。より高度なプロジェクトの場合は、[手動で設定](#manual-configuration)することもできます。これはより低レベルなアプローチであり、柔軟性は高くなりますが、より多くの労力と知識が必要になります。

## デフォルト階層テンプレート {id="default-hierarchy-template"}

Kotlin Gradleプラグインには、組み込みのデフォルト[階層テンプレート](#see-the-full-hierarchy-template)が用意されています。
これには、一般的なユースケース向けにあらかじめ定義された中間ソースセットが含まれています。
プラグインは、プロジェクトで指定されたターゲットに基づいてこれらのソースセットを自動的に設定します。

共有コードを含むプロジェクトのモジュールにある、以下の `build.gradle(.kts)` ファイルを考えてみましょう：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
</Tabs>

コード内でターゲット `android`、`iosArm64`、`iosSimulatorArm64` を宣言すると、Kotlin Gradleプラグインはテンプレートから適切な共有ソースセットを見つけて作成します。生成される階層は次のようになります：

![デフォルト階層テンプレートの使用例](default-hierarchy-example.svg)

色付きのソースセットは実際に作成されてプロジェクト内に存在するものですが、デフォルトテンプレートの灰色のソースセットは無視されます。例えば、プロジェクトにwatchOSターゲットが存在しないため、Kotlin Gradleプラグインは `watchos` ソースセットを作成していません。

`watchosArm64` などのwatchOSターゲットを追加すると、`watchos` ソースセットが作成され、`apple`、`native`、`common` ソースセットのコードも `watchosArm64` 向けにコンパイルされます。

Kotlin Gradleプラグインは、デフォルト階層テンプレートのすべてのソースセットに対して型安全なアクセサと静的アクセサの両方を提供するため、[手動設定](#manual-configuration)とは異なり、`by getting` や `by creating` 構文を使わずにこれらを参照できます。

対応するターゲットを先に宣言せずに、共有モジュールの `build.gradle(.kts)` ファイルでソースセットにアクセスしようとすると、警告が表示されます：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        // 警告: ターゲットを宣言せずにソースセットにアクセスしています
        linuxX64Main { }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        // 警告: ターゲットを宣言せずにソースセットにアクセスしています
        linuxX64Main { }
    }
}
```

</TabItem>
</Tabs>

> この例では、`apple` および `native` ソースセットは `iosArm64` および `iosSimulatorArm64` ターゲットに対してのみコンパイルされます。
> その名前に反して、これらは完全なiOS APIへのアクセス権を持っています。
> `native` のようなソースセットでは、すべてのネイティブターゲットで利用可能なAPIにのみアクセスできると期待されるかもしれないため、これは直感に反する可能性があります。この動作は将来変更される可能性があります。
>
{style="note"}

### 追加の設定 {id="additional-configuration"}

デフォルト階層テンプレートに調整を加える必要がある場合があります。以前に `dependsOn` の呼び出しを使って[手動で](#manual-configuration)中間ソースセットを導入していた場合、デフォルト階層テンプレートの使用がキャンセルされ、次のような警告が表示されます：

```none
The Default Kotlin Hierarchy Template was not applied to '<project-name>':
Explicit .dependsOn() edges were configured for the following source sets:
[<... names of the source sets with manually configured dependsOn-edges...>]

Consider removing dependsOn-calls or disabling the default template by adding
    'kotlin.mpp.applyDefaultHierarchyTemplate=false'
to your gradle.properties

Learn more about hierarchy templates: https://kotl.in/hierarchy-template
```

この問題を解決するには、以下のいずれかの方法でプロジェクトを設定します：

* [手動設定をデフォルト階層テンプレートに置き換える](#replacing-a-manual-configuration)
* [デフォルト階層テンプレート内に追加のソースセットを作成する](#creating-additional-source-sets)
* [デフォルト階層テンプレートによって作成されたソースセットを変更する](#modifying-source-sets)

#### 手動設定の置き換え {id="replacing-a-manual-configuration"}

**ケース**: すべての中間ソースセットが現在デフォルト階層テンプレートでカバーされている場合。

**解決策**: 共有モジュールの `build.gradle(.kts)` ファイルで、手動の `dependsOn()` 呼び出しと `by creating` 構文を持つソースセットをすべて削除します。すべてのデフォルトソースセットのリストを確認するには、[階層テンプレートの全体図](#see-the-full-hierarchy-template)を参照してください。

#### 追加のソースセットの作成 {id="creating-additional-source-sets"}

**ケース**: macOSターゲットとJVMターゲットの間など、デフォルト階層テンプレートがまだ提供していないソースセットを追加したい場合。

**解決策**:

1. 共有モジュールの `build.gradle(.kts)` ファイルで、`applyDefaultHierarchyTemplate()` を明示的に呼び出してテンプレートを再適用します。
2. `dependsOn()` を使用して追加のソースセットを[手動で](#manual-configuration)設定します：

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // デフォルトの階層を再度適用します。これにより、例えば iosMain ソースセットが作成されます:
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 追加の jvmAndMacos ソースセットを作成します:
            val jvmAndMacos by creating {
                dependsOn(commonMain.get())
            }
    
            macosArm64Main.get().dependsOn(jvmAndMacos)
            jvmMain.get().dependsOn(jvmAndMacos)
        }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // デフォルトの階層を再度適用します。これにより、例えば iosMain ソースセットが作成されます:
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 追加の jvmAndMacos ソースセットを作成します:
            jvmAndMacos {
                dependsOn(commonMain.get())
            }
            macosArm64Main {
                dependsOn(jvmAndMacos.get())
            }
            jvmMain {
                dependsOn(jvmAndMacos.get())
            }
        } 
    }
    ```

    </TabItem>
    </Tabs>

#### ソースセットの変更 {id="modifying-source-sets"}

**ケース**: テンプレートによって生成されるものとまったく同じ名前のソースセットがすでに存在するものの、プロジェクト内で異なるターゲットのセット間で共有されている場合。例えば、`nativeMain` ソースセットがデスクトップ固有のターゲット（`linuxX64`、`mingwX64`、`macosArm64`）の間でのみ共有されている場合です。

**解決策**: 現在、テンプレートのソースセット間におけるデフォルトの `dependsOn` 関係を変更する方法はありません。また、例えば `nativeMain` などのソースセットの実装と意味がすべてのプロジェクトで同一であることも重要です。

ただし、以下のいずれかの対応を行うことは可能です：

* 目的に応じて、デフォルト階層テンプレート内または手動で作成された別のソースセットを探す。
* `gradle.properties` ファイルに `kotlin.mpp.applyDefaultHierarchyTemplate=false` を追加してテンプレートを完全に無効化し、すべてのソースセットを手動で設定する。

> 現在、独自の階層テンプレートを作成するためのAPIの開発を進めています。これは、階層設定がデフォルトテンプレートと大きく異なるプロジェクトで役立ちます。
>
> このAPIはまだ準備が整っていませんが、試してみたい場合は、例として `applyHierarchyTemplate {}` ブロックと `KotlinHierarchyTemplate.default` の宣言を確認してください。このAPIはまだ開発中であることに留意してください。テストが十分に行われていない可能性があり、今後のリリースで変更される場合があります。
>
{style="tip"}

#### 階層テンプレートの全体図を見る {initial-collapse-state="collapsed" collapsible="true" id="see-the-full-hierarchy-template"}

プロジェクトがコンパイルするターゲットを宣言すると、プラグインはテンプレートから指定されたターゲットに基づいて共有ソースセットを選択し、プロジェクト内に作成します。

![デフォルト階層テンプレート](full-template-hierarchy.svg)

> この例では `Main` サフィックスを省略し、プロジェクトのプロダクションコード部分のみを示しています（例えば、`commonMain` の代わりに `common` を使用）。ただし、`*Test` ソースについてもすべて同様です。
>
{style="tip"}

## 手動設定 {id="manual-configuration"}

ソースセット構造に中間ソースセットを手動で導入することができます。これは複数のターゲット向けの共有コードを保持します。

例えば、ネイティブのLinux、Windows、macOSターゲット（`linuxX64`、`mingwX64`、`macosArm64`）間でコードを共有したい場合は、次のようにします：

1. 共有モジュールの `build.gradle(.kts)` ファイルに、これらのターゲットの共有ロジックを保持する中間ソースセット `myDesktopMain` を追加します。
2. `dependsOn` 関係を使用して、ソースセット階層を設定します。`commonMain` を `myDesktopMain` に接続し、次に `myDesktopMain` を各ターゲットソースセットに接続します：

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">
    
    ```kotlin
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            val myDesktopMain by creating {
                dependsOn(commonMain.get())
            }
    
            linuxX64Main.get().dependsOn(myDesktopMain)
            mingwX64Main.get().dependsOn(myDesktopMain)
            macosArm64Main.get().dependsOn(myDesktopMain)
        }
    }
    ```
    
    </TabItem>
    <TabItem title="Groovy" group-key="groovy">
    
    ```groovy
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            myDesktopMain {
                dependsOn(commonMain.get())
            }
            linuxX64Main {
                dependsOn(myDesktopMain)
            }
            mingwX64Main {
                dependsOn(myDesktopMain)
            }
            macosArm64Main {
                dependsOn(myDesktopMain)
            }
        }
    }
    ```
    
    </TabItem>
    </Tabs>

結果として得られる階層構造は次のようになります：

![手動で設定された階層構造](manual-hierarchical-structure.svg)

以下のターゲットの組み合わせに対して共有ソースセットを持つことができます：

* JVM または Android + Web + Native
* JVM または Android + Native
* Web + Native
* JVM または Android + Web
* Native

Kotlinは現在、以下の組み合わせでのソースセットの共有をサポートしていません：

* 複数のJVMターゲット
* JVM + Androidターゲット
* 複数のJSターゲット

共有Nativeソースセットからプラットフォーム固有のAPIにアクセスする必要がある場合、IntelliJ IDEAが共有Nativeコードで使用できる共通の宣言を検出するのに役立ちます。その他のケースでは、Kotlinの[expect/actual宣言（expected and actual declarations）](multiplatform-expect-actual.md)の仕組みを使用してください。