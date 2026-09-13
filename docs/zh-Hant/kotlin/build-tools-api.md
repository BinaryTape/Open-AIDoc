[//]: # (title: 建置工具 API)

<primary-label ref="beta"/>

<tldr>BTA 支援 Kotlin/JVM、Kotlin/JS 與 Kotlin/Wasm。<p/> 目前尚不支援 Kotlin/Native。</tldr>

Kotlin 擁有建置工具 API (BTA)，可簡化建置系統與 Kotlin 編譯器的整合方式。

為建置系統加入完整的 Kotlin 支援（例如增量編譯、Kotlin 編譯器外掛程式、背景程式 (daemon) 以及 Kotlin Multiplatform）需要耗費大量精力。BTA 旨在透過提供建置系統與 Kotlin 編譯器生態系統之間的統一 API 來降低這種複雜性。

BTA 定義了一個單一的入口點，建置系統可以據此進行實作。這消除了與編譯器內部細節深度整合的需求。

穩定度等級因目標而異：BTA 針對 Kotlin/JVM 為 Beta 版，針對 Kotlin/JS 與 Kotlin/Wasm 則為 Alpha 版。詳情請參閱 [](components-stability.md#build-tools-api-bta)。使用 BTA 需要透過 `@OptIn(ExperimentalBuildToolsApi::class)` 進行選擇加入 (opt-in)。

> 如果您對此提案感興趣或想分享回饋，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md)。
> 請在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76255) 中追蹤其實作狀態。
> 
{style="note"}

## 與 Gradle 整合 {id="integration-with-gradle"}

Kotlin Gradle 外掛程式 (KGP) 預設將 BTA 用於 Kotlin/JVM 編譯。

> 我們非常感謝您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56574) 中分享您使用 KGP 的回饋。
> 
{style="note"}

### 為 Kotlin/JS、Kotlin/Wasm 與 Kotlin 元資料啟用 BTA {id="enable-the-bta-for-kotlin-js-kotlin-wasm-and-kotlin-metadata"}

<primary-label ref="alpha"/>

自 Kotlin 2.4.20 起，KGP 也可以透過 BTA 執行 Kotlin/JS、Kotlin/Wasm 以及 Kotlin 元資料的編譯。這使 KGP 與編譯器的互動更加一致，且在某些情況下編譯會變得更快、更穩定。

在 Kotlin 2.4.20 中，這些目標是以選擇加入 (opt-in) 的方式提供。若要進行試用，請將對應的屬性加入您的 `gradle.properties` 檔案中：

```none
kotlin.js.runViaBuildToolsApi = true
kotlin.wasm.runViaBuildToolsApi = true
kotlin.metadata.runViaBuildToolsApi = true
```

### 設定不同的編譯器版本 {id="configure-different-compiler-versions"}

透過 BTA，您現在可以使用與 KGP 不同版本的 Kotlin 編譯器。這在以下情況非常有用：

* 您想嘗試新的 Kotlin 特性，但尚未更新建置指令碼。
* 您需要最新的外掛程式修正，但目前想保留在舊版本的編譯器。

以下是如何在您的 `build.gradle.kts` 檔案中進行設定的範例：

```kotlin
import org.jetbrains.kotlin.buildtools.api.ExperimentalBuildToolsApi
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

plugins {
    kotlin("jvm") version "2.4.20"
}

group = "org.jetbrains.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(8)
    @OptIn(ExperimentalBuildToolsApi::class, ExperimentalKotlinGradlePluginApi::class)
    compilerVersion.set("2.3.21") // <-- 使用與 2.4.20 不同的版本
}
```

#### 相容的 Kotlin 編譯器與 KGP 版本 {id="compatible-kotlin-compiler-and-kgp-versions"}

BTA 支援：

* 前三個主要的 Kotlin 編譯器版本。
* 往後的一個主要版本。

例如，在 KGP 2.2.0 中，支援的 Kotlin 編譯器版本為：

* 1.9.25
* 2.0.x
* 2.1.x
* 2.2.x
* 2.3.x

#### 限制 {id="limitations"}

同時使用不同版本的編譯器與編譯器外掛程式可能會導致 Kotlin 編譯器異常。Kotlin 團隊計劃在未來的 Kotlin 版本中解決此問題。

### 使用「in-process」策略啟用增量編譯 {id="enable-incremental-compilation-with-in-process-strategy"}

KGP 支援三種 [編譯器執行策略](compiler-execution-strategy.md)。
通常情況下，「in-process」策略（在 Gradle 背景程式中執行編譯器）不支援增量編譯。

透過 BTA，「in-process」策略現在已支援增量編譯。若要啟用，請在您的 `gradle.properties` 檔案中加入以下屬性：

```kotlin
kotlin.compiler.execution.strategy=in-process
```

## 與 Maven 整合 {id="integration-with-maven"}

BTA 使 [`kotlin-maven-plugin`](maven.md) 能夠支援 [Kotlin 背景程式 (daemon)](kotlin-daemon.md)，這是預設的 [編譯器執行策略](maven-kotlin-compiler.md#choose-execution-strategy)。`kotlin-maven-plugin` 預設使用 BTA，因此無需進行任何設定。

BTA 使得未來能夠提供更多特性，例如 [增量編譯穩定化](https://youtrack.jetbrains.com/issue/KT-77086)。