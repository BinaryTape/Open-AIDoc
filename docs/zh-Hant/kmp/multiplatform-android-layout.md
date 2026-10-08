[//]: # (title: Android 原始碼集配置)

新的 Android 原始碼集配置於 Kotlin 1.8.0 中推出，並在 1.9.0 中成為預設配置。請參考此指南以了解已棄用配置與新配置之間的主要差異，以及如何遷移您的專案。

> 您不需要實作所有建議，只需套用適用於您特定專案的建議即可。
>
{style="tip"}

## 檢查相容性 {id="check-the-compatibility"}

新的配置需要 Android Gradle 外掛程式 7.0 或更高版本，且受 Android Studio 2022.3 及更高版本支援。請檢查您的 Android Gradle 外掛程式版本，並在必要時進行升級。

## 重新命名 Kotlin 原始碼集 {id="rename-kotlin-source-sets"}

如果適用，請按照以下模式重新命名專案中的原始碼集：

| 舊版原始碼集配置 | 新版原始碼集配置 |
|----------------------------------------|-------------------------------------|
| `targetName` + `AndroidSourceSet.name` | `targetName` + `AndroidVariantType` |

`{AndroidSourceSet.name}` 對應到 `{KotlinSourceSet.name}` 的方式如下：

|             | 舊版原始碼集配置 | 新版原始碼集配置 |
|-------------|----------------------------|--------------------------------|
| main        | androidMain                | androidMain                    |
| test        | androidTest                | android<b>Unit</b>Test         |
| androidTest | android<b>Android</b>Test  | android<b>Instrumented</b>Test |

## 移動原始碼檔案 {id="move-source-files"}

如果適用，請按照以下模式將您的原始碼檔案移動到新目錄：

| 舊版原始碼集配置 | 新版原始碼集配置 |
|-------------------------------------------------------|-------------------------------------|
| 該配置具有額外的 `/kotlin` SourceDirectories | `src/{KotlinSourceSet.name}/kotlin` |

`{AndroidSourceSet.name}` 對應到 `{包含的 SourceDirectories}` 的方式如下：

|             | 舊版原始碼集配置 | 新版原始碼集配置 |
|-------------|---------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| main        | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java  | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java                                      |
| test        | src/androidTest/kotlin<br/>src/test/kotlin<br/>src/test/java  | src/android<b>Unit</b>Test/kotlin<br/>src/test/kotlin<br/>src/test/java                           |
| androidTest | src/android<b>Android</b>Test/kotlin<br/>src/androidTest/java | src/android<b>Instrumented</b>Test/kotlin<br/>src/androidTest/java, <b>src/androidTest/kotlin</b> |

## 移動 AndroidManifest.xml 檔案 {id="move-the-androidmanifest-xml-file"}

如果您的專案中有 `AndroidManifest.xml` 檔案，請按照以下模式將其移動到新目錄：

| 舊版原始碼集配置 | 新版原始碼集配置 |
|--------------------------------------------------------|-------------------------------------------------------|
| src/{<b>Android</b>SourceSet.name}/AndroidManifest.xml | src/{<b>Kotlin</b>SourceSet.name}/AndroidManifest.xml |

`{AndroidSourceSet.name}` 對應到 `{AndroidManifest.xml 位置}` 的方式如下：

|       | 舊版原始碼集配置 | 新版原始碼集配置 |
|-------|-------------------------------|---------------------------------------------|
| main  | src/main/AndroidManifest.xml  | src/<b>android</b>Main/AndroidManifest.xml  |
| debug | src/debug/AndroidManifest.xml | src/<b>android</b>Debug/AndroidManifest.xml |

## 檢查 Android 與通用測試之間的關係 {id="check-the-relationship-between-android-and-common-tests"}

新的 Android 原始碼集配置改變了 Android 檢測式測試（在新配置中重新命名為 `androidInstrumentedTest`）與通用測試之間的關係。

以前，`androidAndroidTest` 與 `commonTest` 之間的 `dependsOn` 關係是預設建立的。這意味著：

* `commonTest` 中的程式碼在 `androidAndroidTest` 中可用。
* `commonTest` 中的 `expect` 宣告必須在 `androidAndroidTest` 中有對應的 `actual` 實作。
* 在 `commonTest` 中宣告的測試也會作為 Android 檢測式測試執行。

在新的 Android 原始碼集配置中，預設不會加入 `dependsOn` 關係。如果您偏好之前的行為，請在您的 `build.gradle.kts` 檔案中手動宣告以下關係：

```kotlin
kotlin {
// ...
    sourceSets {
        val commonTest by getting
        val androidInstrumentedTest by getting {
            dependsOn(commonTest)
        }
    }
}
```

## 調整 Android flavors 的實作 {id="adjust-the-implementation-of-android-flavors"}

以前，Kotlin Gradle 外掛程式會提前建立與包含 `debug` 和 `release` 組建類型或自訂 flavors（如 `demo` 和 `full`）的 Android 原始碼集相對應的原始碼集。這使得可以使用如 `val androidDebug by getting { ... }` 之類的運算式來存取原始碼集。

新的 Android 原始碼集配置利用 Android 的 [`onVariants`](https://developer.android.com/reference/tools/gradle-api/8.0/com/android/build/api/variant/AndroidComponentsExtension#onVariants(com.android.build.api.variant.VariantSelector,kotlin.Function1)) 來建立原始碼集。這使得此類運算式失效，並導致如 `org.gradle.api.UnknownDomainObjectException: KotlinSourceSet with name 'androidDebug' not found` 之類的錯誤。

要解決此問題，請在您的 `build.gradle.kts` 檔案中使用新的 `invokeWhenCreated()` API：

```kotlin
kotlin {
// ...
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    sourceSets.invokeWhenCreated("androidFreeDebug") {
// ...
    }
}
```
