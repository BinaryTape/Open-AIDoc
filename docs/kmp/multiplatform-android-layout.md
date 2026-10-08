[//]: # (title: Android 源集布局)

新的 Android 源集布局在 Kotlin 1.8.0 中引入，并在 1.9.0 中成为默认布局。请参考本指南以了解弃用的布局与新布局之间的主要区别，以及如何迁移您的项目。

> 您无需执行所有建议，只需执行适用于您特定项目的建议即可。
>
{style="tip"}

## 检查兼容性 {id="check-the-compatibility"}

新布局要求使用 Android Gradle 插件 7.0 或更高版本，并且受 Android Studio 2022.3 及更高版本支持。请检查您的 Android Gradle 插件版本，并在必要时进行升级。

## 重命名 Kotlin 源集 {id="rename-kotlin-source-sets"}

如果适用，请按照以下模式重命名项目中的源集：

| 旧版源集布局 | 新版源集布局 |
|----------------------------------------|-------------------------------------|
| `targetName` + `AndroidSourceSet.name` | `targetName` + `AndroidVariantType` |

`{AndroidSourceSet.name}` 与 `{KotlinSourceSet.name}` 的映射关系如下：

|             | 旧版源集布局 | 新版源集布局 |
|-------------|----------------------------|--------------------------------|
| main        | androidMain                | androidMain                    |
| test        | androidTest                | android<b>Unit</b>Test         |
| androidTest | android<b>Android</b>Test  | android<b>Instrumented</b>Test |

## 移动源文件 {id="move-source-files"}

如果适用，请按照以下模式将源文件移动到新目录：

| 旧版源集布局 | 新版源集布局 |
|-------------------------------------------------------|-------------------------------------|
| 该布局具有额外的 `/kotlin` SourceDirectories | `src/{KotlinSourceSet.name}/kotlin` |

`{AndroidSourceSet.name}` 与 `{包含的 SourceDirectories}` 的映射关系如下：

|             | 旧版源集布局                                    | 新版源集布局                                                                             |
|-------------|---------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| main        | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java  | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java                                      |
| test        | src/androidTest/kotlin<br/>src/test/kotlin<br/>src/test/java  | src/android<b>Unit</b>Test/kotlin<br/>src/test/kotlin<br/>src/test/java                           |
| androidTest | src/android<b>Android</b>Test/kotlin<br/>src/androidTest/java | src/android<b>Instrumented</b>Test/kotlin<br/>src/androidTest/java, <b>src/androidTest/kotlin</b> |

## 移动 AndroidManifest.xml 文件 {id="move-the-androidmanifest-xml-file"}

如果您的项目中包含 `AndroidManifest.xml` 文件，请按照以下模式将其移动到新目录：

| 旧版源集布局 | 新版源集布局 |
|--------------------------------------------------------|-------------------------------------------------------|
| src/{<b>Android</b>SourceSet.name}/AndroidManifest.xml | src/{<b>Kotlin</b>SourceSet.name}/AndroidManifest.xml |

`{AndroidSourceSet.name}` 与 `{AndroidManifest.xml 位置}` 的映射关系如下：

|       | 旧版源集布局 | 新版源集布局 |
|-------|-------------------------------|---------------------------------------------|
| main  | src/main/AndroidManifest.xml  | src/<b>android</b>Main/AndroidManifest.xml  |
| debug | src/debug/AndroidManifest.xml | src/<b>android</b>Debug/AndroidManifest.xml |

## 检查 Android 与公共测试之间的关系 {id="check-the-relationship-between-android-and-common-tests"}

新的 Android 源集布局改变了 Android 仪器化测试（在新布局中重命名为 `androidInstrumentedTest`）与公共测试（common tests）之间的关系。

此前，`androidAndroidTest` 与 `commonTest` 之间的 `dependsOn` 关系是默认存在的。这意味着：

* `commonTest` 中的代码在 `androidAndroidTest` 中可用。
* `commonTest` 中的 `expect` 声明必须在 `androidAndroidTest` 中有对应的 `actual` 实现。
* 在 `commonTest` 中声明的测试也会作为 Android 仪器化测试运行。

在新的 Android 源集布局中，默认不再添加 `dependsOn` 关系。如果您希望保留之前的行为，请在 `build.gradle.kts` 文件中手动声明以下关系：

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

## 调整 Android flavor 的实现 {id="adjust-the-implementation-of-android-flavors"}

此前，Kotlin Gradle 插件会预先创建与 Android 源集相对应的源集，这些源集包含 `debug` 和 `release` 构建类型或自定义变体（如 `demo` 和 `full`）。这使得可以通过 `val androidDebug by getting { ... }` 之类的表达式访问这些源集。

新的 Android 源集布局利用 Android 的 [`onVariants`](https://developer.android.com/reference/tools/gradle-api/8.0/com/android/build/api/variant/AndroidComponentsExtension#onVariants(com.android.build.api.variant.VariantSelector,kotlin.Function1)) 来创建源集。这导致此类表达式失效，并引发类似 `org.gradle.api.UnknownDomainObjectException: KotlinSourceSet with name 'androidDebug' not found` 的错误。

要解决此问题，请在 `build.gradle.kts` 文件中使用新的 `invokeWhenCreated()` API：

```kotlin
kotlin {
// ...
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    sourceSets.invokeWhenCreated("androidFreeDebug") {
// ...
    }
}
```
