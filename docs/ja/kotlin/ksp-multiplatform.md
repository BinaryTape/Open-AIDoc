[//]: # (title: Kotlin Multiplatform での KSP)

<web-summary>Kotlin Multiplatform プロジェクトで KSP を使用する方法を学びます。</web-summary>

このガイドでは、Kotlin Multiplatform プロジェクトで Kotlin Symbol Processing (KSP) を使用する方法について説明します。
クイックスタートについては、[マルチプラットフォームプロジェクトのサンプル](https://github.com/google/ksp/tree/main/examples/multiplatform)を参照してください。
このサンプルでは複数のターゲットで KSP を使用しており、プロセッサーによってプロジェクトで使用される `Foo` クラスが生成されます。

## マルチプラットフォームプロジェクトへの KSP の追加 {id="add-ksp-to-a-multiplatform-project"}

クライアントモジュール（プロセッサーを使用するモジュール）に KSP を追加するには、次の手順を実行します。

1. モジュールの `build.gradle(.kts)` ファイルを開きます。
2. `plugins {}` ブロックに KSP プラグインを追加します。

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        kotlin("multiplatform") version "%kotlinVersion%"
        id("com.google.devtools.ksp") version "%kspVersion%"
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
        id 'com.google.devtools.ksp' version '%kspVersion%'
    }
    ```

    </tab>
    </tabs>

3. シンボル処理を必要とするターゲットごとに、プロセッサーの依存関係を追加します。

    ```kotlin
    dependencies {
        add("ksp<Target>", <processor>)
    }
    ```

    * `<Target>` は、マルチプラットフォームプロジェクトで使用されているターゲット名の先頭を大文字にしたものです。たとえば、`iosArm64` ターゲットの場合は `kspIosArm64` コンフィグレーションを使用します。

      > ターゲットの完全なリストについては、[Multiplatform Gradle DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)および [Kotlin/Native でサポートされているターゲットとホスト](native-target-support.md)を参照してください。
      >
      {style="tip"}

    * `<processor>` はプロセッサーの依存関係です。以下を指定できます。

      * シンボルプロセッサーのロジックを含むプロジェクト内のモジュール:

        ```kotlin
        add("kspJvm", project(":local-processor"))
        ```

      * Room などの外部プロセッサー:

        ```kotlin
        add("kspJvm", "androidx.room3:room3-compiler:3.0.3")
        ```

<anchor name="avoid-the-ksp-configuration-on-ksp-1-0-1"/>

> KSP 2.3.12 以降、すべてを包括する `ksp(...)` コンフィグレーションはマルチプラットフォームプロジェクトでビルドエラーを引き起こします。それ以前のバージョンでは非推奨として報告されます。不要な場所でプロセッサーが実行されるのを防ぐため、各ターゲットを明示的に設定してください。
>
{style="warning"}

### 単一のターゲットで複数のプロセッサーを使用する {id="use-multiple-processors-in-a-single-target"}

1 つのターゲットに複数のプロセッサーを追加できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspAndroid", project(":test-processor"))
    add("kspAndroid", "androidx.room3:room3-compiler:3.0.3")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspAndroid', project(':test-processor'))
    add('kspAndroid', 'androidx.room3:room3-compiler:3.0.3')
}
```

</tab>
</tabs>

### 複数のターゲットで同じプロセッサーを使用する {id="use-the-same-processor-in-multiple-targets"}

同じプロセッサーを複数のターゲットに追加できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspIosX64", project(":test-processor"))
    add("kspIosArm64", project(":test-processor"))
    add("kspIosSimulatorArm64", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspIosX64', project(':test-processor'))
    add('kspIosArm64', project(':test-processor'))
    add('kspIosSimulatorArm64', project(':test-processor'))
}
```

</tab>
</tabs>

多数の iOS ターゲットがある場合は、ループを使用して重複を避けることができます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
        add(
            "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
            project(":test-processor")
        )
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    kotlin.targets.findAll { it.name.startsWith('ios') }.each { target ->
        add("ksp${target.name.capitalize()}", project(':test-processor'))
    }
}
```

</tab>
</tabs>

### テストコンパイル用の KSP の設定 {id="configure-ksp-for-test-compilations"}

テストコンパイル時に KSP を実行するには、対応するテストコンフィグレーションにプロセッサーを追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspJvmTest", project(":test-processor"))
    add("kspJsTest", project(":test-processor"))
    add("kspIosX64Test", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspJvmTest', project(':test-processor'))
    add('kspJsTest', project(':test-processor'))
    add('kspIosX64Test', project(':test-processor'))
}
```

</tab>
</tabs>

Android のホストテストおよびデバイステストの場合、KSP は対応するソースセット名からコンフィグレーション名を導出します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspAndroidHostTest", project(":test-processor"))
    add("kspAndroidDeviceTest", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspAndroidHostTest', project(':test-processor'))
    add('kspAndroidDeviceTest', project(':test-processor'))
}
```

</tab>
</tabs>

## KSP コンフィグレーション名の確認 {id="find-ksp-configuration-names"}

KSP は Kotlin Multiplatform のソースセットからコンフィグレーション名を導出します。モジュールの KSP コンフィグレーションの完全なリストを確認するには、次を実行します。

```bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

ターゲットのソースセットに対応するコンフィグレーション名を探してください。

## コンパイルと処理 {id="compilation-and-processing"}

マルチプラットフォームプロジェクトでは、Kotlin は各ターゲットに対して `main` や `test` などの個別の[コンパイル](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)を作成します。1 つ以上のプロセッサーが設定された Kotlin コンパイルタスクごとに、KSP は対応するシンボル処理タスクを作成します。

[サンプルプロジェクト](https://github.com/google/ksp/tree/main/examples/multiplatform)では 6 つのターゲットが定義されています。各ターゲットには `main` と `test` のコンパイルがあり、その結果、以下のコンパイルタスクとシンボル処理タスクが生成されます。

* **JVM**: `jvmMain` および `jvmTest`
* **JS**: `jsMain` および `jsTest`
* **LinuxX64**: `linuxX64Main` および `linuxX64Test`
* **AndroidNativeX64**: `androidNativeX64Main` および `androidNativeX64Test`
* **AndroidNativeArm64**: `androidNativeArm64Main` および `androidNativeArm64Test`
* **MingwX64**: `mingwX64Main` および `mingwX64Test`

サンプルの `workload/build.gradle.kts` ファイルでは、以下のコンフィグレーションに対して KSP の依存関係が宣言されています。

* `kspJvm` および `kspJvmTest`
* `kspJs` および `kspJsTest`
* `kspAndroidNativeX64` および `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` および `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP は、KSP の依存関係が宣言されているコンフィグレーションごとにシンボル処理タスクを作成します。この例では、プロジェクトには少なくとも 12 個の Kotlin コンパイルタスクと 10 個のシンボル処理タスクが存在します。残りのコンパイルには KSP が設定されていないため、対応する KSP タスクはありません。

## 関連項目 {id="see-also"}

* KSP リポジトリ内の[マルチプラットフォームプロジェクトのサンプル](https://github.com/google/ksp/tree/main/examples/multiplatform)
* [コマンドラインから KSP を実行する](ksp-command-line.md#main-class)場合の各プラットフォームのエントリーポイント一覧