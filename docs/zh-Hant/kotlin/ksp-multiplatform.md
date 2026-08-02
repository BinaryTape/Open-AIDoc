[//]: # (title: KSP 搭配 Kotlin Multiplatform)
[//]: # (description: 將 KSP 新增至 Kotlin 多平台專案)

在這裡，你將學習如何在 Kotlin 多平台專案中使用 Kotlin 符號處理 (KSP)。若要快速入門，請參閱 [存儲庫](https://github.com/google/ksp/tree/main/examples/multiplatform) 中一個包含多個目標並使用 KSP 的多平台專案範例。該範例中的處理器會產生一個由專案使用的 `Foo` 類別。

## 將 KSP 新增至多平台專案

在用戶端模組（使用處理器的模組）的 `build.gradle.kts` 檔案中，為每個需要符號處理的目標新增適當的 KSP 處理器相依性：

```
dependencies {
  add("ksp<Target>", <processor>)
}
```

* `<Target>` 是你的多平台專案中使用的目標之一。

  > 如需完整的目標清單，請參閱 [Multiplatform Gradle DSL 參考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)
  > 以及 [Kotlin/Native 支援的目標](https://kotlinlang.org/docs/native-target-support.html)。
  >
  {style="tip"}

* `<processor>` 是 Gradle 專案路徑。它可以是：

  * 專案中包含符號處理器邏輯的特定目錄：

      ```
      add("kspJvm", project(":local-processor"))
      ```

  * 外部處理器，例如 Room：

      ```
      add("kspJvm", "androidx.room:room-compiler:2.6.1")
      ```

> 從 KSP 2 開始，通用的 `ksp(...)` 組態已被棄用。請明確配置每個目標，以避免在不需要的地方執行處理器。
>
{style="warning"}

### 在單一目標中使用多個處理器

你可以為一個目標新增多個處理器：

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

### 在多個目標中使用相同的處理器

你可以將相同的處理器新增至多個目標：

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

如果你有很多個 iOS 目標，可以透過迴圈來避免重複：

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

### 為測試編譯配置 KSP

若要在測試編譯期間執行 KSP，請將處理器新增至對應的測試組態：

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

對於 Android 主機和裝置測試，KSP 會從對應的原始碼集名稱衍生組態名稱：

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

## 尋找 KSP 組態名稱

KSP 從 Kotlin 多平台原始碼集衍生組態名稱。若要查看模組的完整 KSP 組態清單，請執行：

```Bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

尋找與你的目標原始碼集相對應的組態名稱。

## 編譯與處理

在多平台專案中，Kotlin 會為每個目標和原始碼集（例如 `main` 和 `test`）建立獨立的 [編譯](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)。對於每個配置了一個或多個 KSP 處理器的 Kotlin 編譯任務，KSP 會建立一個對應的符號處理任務。

[範例專案](https://github.com/google/ksp/tree/main/examples/multiplatform) 定義了六個目標。每個目標都有 `main` 和 `test` 編譯，產生以下編譯和符號處理任務：

* **JVM**: `jvmMain` 與 `jvmTest`

* **JS**: `jsMain` 與 `jsTest`

* **LinuxX64**: `linuxX64Main` 與 `linuxX64Test`

* **AndroidNativeX64**: `androidNativeX64Main` 與 `androidNativeX64Test`

* **AndroidNativeArm64**: `androidNativeArm64Main` 與 `androidNativeArm64Test`

* **MingwX64**: `mingwX64Main` 與 `mingwX64Test`

在範例的 `workload/build.gradle.kts` 檔案中，為以下組態宣告了 KSP 相依性：

* `kspJvm` 與 `kspJvmTest`
* `kspJs` 與 `kspJsTest`
* `kspAndroidNativeX64` 與 `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` 與 `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP 會為每個宣告了 KSP 相依性的組態建立一個符號處理任務。在此範例中，專案至少建立了 12 個 Kotlin 編譯任務和 10 個符號處理任務。其餘編譯沒有對應的 KSP 任務，因為未針對它們配置 KSP。