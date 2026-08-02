[//]: # (title: Kotlin Multiplatform での KSP)
[//]: # (description: Kotlin マルチプラットフォームプロジェクトへの KSP の追加)

ここでは、Kotlin Multiplatform プロジェクトで Kotlin Symbol Processing (KSP) を使用する方法について説明します。クイックスタートについては、[ソースリポジトリ](https://github.com/google/ksp/tree/main/examples/multiplatform)にある KSP を使用した複数のターゲットを持つマルチプラットフォームプロジェクトのサンプルを参照してください。この例のプロセッサーは、プロジェクトで使用される `Foo` クラスを生成します。

## マルチプラットフォームプロジェクトへの KSP の追加

クライアントモジュール（プロセッサーを使用するモジュール）の `build.gradle.kts` ファイルで、シンボル処理が必要な各ターゲットに対して適切な KSP プロセッサーの依存関係を追加します。

```
dependencies {
  add("ksp<Target>", <processor>)
}
```

* `<Target>` は、マルチプラットフォームプロジェクトで使用されているターゲットのいずれかです。

  > ターゲットの完全なリストについては、[Multiplatform Gradle DSL reference](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) および [Kotlin/Native supported targets](https://kotlinlang.org/docs/native-target-support.html) を参照してください。
  >
  {style="tip"}

* `<processor>` は Gradle プロジェクトのパスです。以下のいずれかを指定できます：

  * シンボルプロセッサーのロジックを含むプロジェクト内の特定のディレクトリ：

      ```
      add("kspJvm", project(":local-processor"))
      ```

  * Room などの外部プロセッサー：

      ```
      add("kspJvm", "androidx.room:room-compiler:2.6.1")
      ```

> KSP 2 以降、すべてを対象とする `ksp(...)` 設定は非推奨になりました。不要な場所でプロセッサーが実行されるのを避けるため、各ターゲットを明示的に設定してください。
>
{style="warning"}

### 単一のターゲットで複数のプロセッサーを使用する

1 つのターゲットに複数のプロセッサーを追加できます：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspAndroid", project(":test-processor"))
add("kspAndroid", "androidx.room:room-compiler:2.6.1")
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspAndroid', project(':test-processor'))
add('kspAndroid', 'androidx.room:room-compiler:2.6.1')
```

</tab>
</tabs> 

### 複数のターゲットで同じプロセッサーを使用する

同じプロセッサーを複数のターゲットに追加できます：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspIosX64", project(":test-processor"))
add("kspIosArm64", project(":test-processor"))
add("kspIosSimulatorArm64", project(":test-processor"))
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspIosX64', project(':test-processor'))
add('kspIosArm64', project(':test-processor'))
add('kspIosSimulatorArm64', project(':test-processor'))
```

</tab>
</tabs> 

iOS ターゲットが多い場合は、ループを使用して重複を避けることができます：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
    add(
        "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
        project(":test-processor")
    )
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
    add(
        "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
        project(":test-processor")
    )
}
```

</tab>
</tabs>

### テストコンパイル用の KSP 設定

テストコンパイル中に KSP を実行するには、対応するテスト設定にプロセッサーを追加します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspJvmTest", project(":test-processor"))
add("kspJsTest", project(":test-processor"))
add("kspIosX64Test", project(":test-processor"))
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspJvmTest', project(':test-processor'))
add('kspJsTest', project(':test-processor'))
add('kspIosX64Test', project(':test-processor'))
```

</tab>
</tabs> 

Android のホストテスト（host tests）およびデバイス用テスト（device tests）では、KSP は対応するソースセット名から設定名を導き出します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspAndroidHostTest", project(":test-processor"))
add("kspAndroidDeviceTest", project(":test-processor"))
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspAndroidHostTest', project(':test-processor'))
add('kspAndroidDeviceTest', project(':test-processor'))
```

</tab>
</tabs>

## KSP 設定名の確認

KSP は Kotlin Multiplatform のソースセットから設定名を導き出します。モジュールの KSP 設定の完全なリストを表示するには、以下を実行してください：

```Bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

ターゲットのソースセットに対応する設定名を探してください。

## コンパイルと処理

マルチプラットフォームプロジェクトでは、Kotlin は `main` や `test` など、ターゲットおよびソースセットごとに個別の [コンパイル (compilation)](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations) を作成します。1 つ以上の KSP プロセッサーが設定されている各 Kotlin コンパイルタスクに対して、KSP は対応するシンボル処理（symbol processing）タスクを作成します。

[サンプルプロジェクト](https://github.com/google/ksp/tree/main/examples/multiplatform) では 6 つのターゲットが定義されています。各ターゲットには `main` と `test` のコンパイルがあり、結果として以下のコンパイルおよびシンボル処理タスクが作成されます：

* **JVM**: `jvmMain` および `jvmTest`

* **JS**: `jsMain` および `jsTest`

* **LinuxX64**: `linuxX64Main` および `linuxX64Test`

* **AndroidNativeX64**: `androidNativeX64Main` および `androidNativeX64Test`

* **AndroidNativeArm64**: `androidNativeArm64Main` および `androidNativeArm64Test`

* **MingwX64**: `mingwX64Main` および `mingwX64Test`

サンプルの `workload/build.gradle.kts` ファイルでは、以下の設定に対して KSP の依存関係が宣言されています：

* `kspJvm` および `kspJvmTest`
* `kspJs` および `kspJsTest`
* `kspAndroidNativeX64` および `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` および `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP は、KSP の依存関係が宣言されている各設定に対してシンボル処理タスクを作成します。この例では、プロジェクトは少なくとも 12 の Kotlin コンパイルタスクと 10 のシンボル処理タスクを作成します。残りのコンパイルには、KSP が設定されていないため、対応する KSP タスクはありません。