[//]: # (title: 支援 Gradle 外掛程式變體)

Gradle 7.0 為 Gradle 外掛程式作者引入了一項新功能
— [具有變體的外掛程式](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)。
這項功能使得在保持與舊版 Gradle 相容性的同時，能更輕鬆地加入對最新 Gradle 功能的支援。
進一步了解 [Gradle 中的變體選擇](https://docs.gradle.org/current/userguide/variant_model.html)。

透過 Gradle 外掛程式變體，Kotlin 團隊可以針對不同的 Gradle 版本發佈不同的 Kotlin Gradle 外掛程式 (KGP) 變體。
目標是在 `main` 變體中支援基礎的 Kotlin 編譯，這對應於支援的最舊 Gradle 版本。
每個變體都將包含對應版本之 Gradle 功能的實作。最新的變體將支援最新的 Gradle 功能集。
透過這種方式，可以在功能受限的情況下擴充對舊版 Gradle 版本的支援。

目前 Kotlin Gradle 外掛程式有以下變體：

| 變體名稱 | 對應的 Gradle 版本 |
|----------------|-------------------------------|
| `main`         | 7.6.0–7.6.3                   |
| `gradle80`     | 8.0–8.0.2                     |
| `gradle81`     | 8.1.1                         |
| `gradle82`     | 8.2.1–8.4                     |
| `gradle85`     | 8.5                           |
| `gradle86`     | 8.6-8.7                       |
| `gradle88`     | 8.8-8.10                      |
| `gradle811`    | 8.11-8.12                     |
| `gradle813`    | 8.13-8.14                     |
| `gradle96`     | 9.6-9.7                       |

在未來的 Kotlin 版本中，將會加入更多變體。

要檢查您的組建使用哪個變體，請啟用
[`--info` 記錄等級](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) 並在輸出中尋找以 `Using Kotlin Gradle plugin` 開頭的字串，例如 `Using Kotlin Gradle plugin main variant`。

## 疑難排解 {id="troubleshooting"}

> 以下是 Gradle 變體選擇中一些已知問題的解決方法：
> * [ResolutionStrategy 在 pluginManagement 中對於具有多變體的外掛程式不起作用](https://github.com/gradle/gradle/issues/20545)
> * [當外掛程式作為 `buildSrc` 通用相依性加入時，外掛程式變體會被忽略](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

### Gradle 無法在自訂配置中選擇 KGP 變體 {id="gradle-can-t-select-a-kgp-variant-in-a-custom-configuration"}

這是在使用自訂 Gradle 配置時，Gradle 無法選擇 KGP 變體的預期情況。
如果您使用自訂 Gradle 配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
configurations.register("customConfiguration") {
    // ...
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
configurations.register("customConfiguration") {
    // ...
}
```

</tab>
</tabs>

並且想要加入對 Kotlin Gradle 外掛程式的相依性，例如：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    customConfiguration("org.jetbrains.kotlin:kotlin-gradle-plugin:%kotlinVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    customConfiguration 'org.jetbrains.kotlin:kotlin-gradle-plugin:%kotlinVersion%'
}
```

</tab>
</tabs>

您需要在您的 `customConfiguration` 中加入以下屬性：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
configurations {
    customConfiguration {
        attributes {
            attribute(
                Usage.USAGE_ATTRIBUTE,
                project.objects.named(Usage.class, Usage.JAVA_RUNTIME)
            )
            attribute(
                Category.CATEGORY_ATTRIBUTE,
                project.objects.named(Category.class, Category.LIBRARY)
            )
            // 如果您想要依賴特定的 KGP 變體：
            attribute(
                GradlePluginApiVersion.GRADLE_PLUGIN_API_VERSION_ATTRIBUTE,
                project.objects.named("7.0")
            )
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
configurations {
    customConfiguration {
        attributes {
            attribute(
                Usage.USAGE_ATTRIBUTE,
                project.objects.named(Usage, Usage.JAVA_RUNTIME)
            )
            attribute(
                Category.CATEGORY_ATTRIBUTE,
                project.objects.named(Category, Category.LIBRARY)
            )
            // 如果您想要依賴特定的 KGP 變體：
            attribute(
                GradlePluginApiVersion.GRADLE_PLUGIN_API_VERSION_ATTRIBUTE,
                project.objects.named('7.0')
            )
        }
    }
}
```

</tab>
</tabs>

否則，您將收到類似以下的錯誤：

```none
 > Could not resolve all files for configuration ':customConfiguration'.
      > Could not resolve org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.0.
        Required by:
            project :
         > Cannot choose between the following variants of org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.0:
             - gradle70RuntimeElements
             - runtimeElements
           All of them match the consumer attributes:
             - Variant 'gradle70RuntimeElements' capability org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.0:
                 - Unmatched attributes:
```

## 下一步？ {id="what-s-next"}

進一步了解 [Gradle 基礎知識與細節](https://docs.gradle.org/current/userguide/userguide.html)。