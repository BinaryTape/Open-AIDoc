[//]: # (title: Kotlin Gradle 插件中的二进制兼容性验证)

<primary-label ref="experimental-general"/>

二进制兼容性验证可帮助库作者确保用户在升级到新版本时不会破坏其代码。这不仅对于提供流畅的升级体验至关重要，而且对于建立用户的长期信任并鼓励持续采用该库也具有重要意义。

> 二进制兼容性意味着两个版本的库编译后的字节码可以互换运行，而无需重新编译。
> 
{style="tip"}

Kotlin Gradle 插件包含对二进制兼容性验证的支持。该插件从当前代码生成应用二进制接口 (ABI) 转储，并将其与之前的转储进行比较以突出显示差异。您可以审阅这些更改以发现任何潜在的二进制不兼容修改，并采取措施解决它们。

## 如何启用 {id="how-to-enable"}

要启用二进制兼容性验证，请在 `build.gradle.kts` 文件中添加 `abiValidation {}` 块。如果您没有自定义配置，也可以直接使用 `abiValidation()` 函数：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation()
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation()
}
```

</tab>
</tabs>

KGP 会创建必要的 Gradle 任务。如果您的项目中有多个模块需要检查二进制兼容性，请分别为每个模块进行配置。

## 检查二进制兼容性问题 {id="check-for-binary-compatibility-issues"}

在对代码进行更改后，要检查潜在的二进制不兼容问题，请在 IntelliJ IDEA 中运行 `checkKotlinAbi` Gradle 任务，或在项目目录中使用以下命令：

```bash
./gradlew checkKotlinAbi
```

该任务会比较 ABI 转储并将检测到的任何差异作为错误打印出来。请仔细检查输出，以确定是否需要更改代码以保持二进制兼容性。

默认情况下，[当项目中启用了二进制兼容性验证](#how-to-enable) 并且您运行 `check` 任务时，Gradle 也会运行 `checkKotlinAbi` 任务。 

## 更新参考 ABI 转储 {id="update-reference-abi-dump"}

要更新 Gradle 用于检查最新更改的参考 ABI 转储，请在 IntelliJ IDEA 中运行 `updateKotlinAbi` 任务，或在项目目录中使用以下命令：

```bash
./gradlew updateKotlinAbi
```

请仅在确信您的更改与之前版本保持了二进制兼容性时才更新参考转储。

## 配置筛选器 {id="configure-filters"}

您可以定义筛选器来控制 ABI 转储中包含哪些类、属性和函数。使用 `filters {}` 块分别通过 `excluded {}` 和 `included {}` 块添加排除和包含规则。

只有当声明不匹配任何排除规则时，Gradle 才会将其包含在 ABI 转储中。当定义了包含规则时，该声明必须匹配其中之一，或者至少有一个成员匹配。

规则可以基于：

* 类、属性或函数的完全限定名称 (`byNames`)。
* 具有 BINARY 或 RUNTIME [保留策略 (retention)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.annotation/-retention/) 的注解名称 (`annotatedWith`)。

> 您可以在名称规则中使用通配符 `**`、`*` 和 `?`：
> * `**` 匹配零个或多个字符，包括句点。
> * `*` 匹配零个或多个字符，不包括句点。使用此通配符可指定单个类名。
> * `?` 精确匹配一个字符。
> 
{style = "tip"}

例如：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        filters {
            excluded {
                byNames.add("**.InternalUtils")
                annotatedWith.add("com.example.annotations.InternalApi")
            }

            included {
                byNames.add("com.example.api.**")
                annotatedWith.add("com.example.annotations.PublicApi")
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation {
        filters {
            excluded {
                byNames.add("**.InternalUtils")
                annotatedWith.add("com.example.annotations.InternalApi")
            }

            included {
                byNames.add("com.example.api.**")
                annotatedWith.add("com.example.annotations.PublicApi")
            }
        }
    }
}
```

</tab>
</tabs>

此示例：

* 排除：
  * `InternalUtils` 类。
  * 带有 `@InternalApi` 注解的声明。
* 包含：
  * `com.example.api` 软件包中的所有内容。
  * 带有 `@PublicApi` 注解的声明。

要了解有关筛选的更多信息，请参阅 [Kotlin Gradle 插件 API 参考](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl.abi/-abi-filters-spec/)。

## 防止针对不受支持的目标进行推断更改 {id="prevent-inferred-changes-for-unsupported-targets"}

在多平台项目中，如果您的宿主系统无法编译所有目标，Kotlin Gradle 插件会尝试从可用目标中推断 ABI 更改。这有助于避免在以后切换到支持更多目标的宿主时出现错误的失败。

要禁用此行为，请在 `build.gradle.kts` 文件中添加以下内容：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        keepLocallyUnsupportedTargets.set(false)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation {
        keepLocallyUnsupportedTargets = false
    }
}
```

</tab>
</tabs>

如果某个目标不受支持且推断功能已禁用，则 `checkKotlinAbi` 任务会失败，因为它无法生成完整的 ABI 转储。如果您宁愿任务失败也不愿冒错过二进制不兼容更改的风险，那么这种行为可能会很有用。

## 包含来自 `maven-publish` 插件的发布物 {id="include-publications-from-the-maven-publish-plugin"}

默认情况下，二进制兼容性验证使用 Kotlin 编译输出生成 ABI 转储。因此，生成的 ABI 转储可能无法反映最终发布的构件。例如，当您使用 [`maven-publish` 插件](https://docs.gradle.org/current/userguide/publishing_maven.html)时，重定位等后续处理步骤可能会在编译后修改构件。

为了确保 ABI 转储准确反映由 `maven-publish` 插件发布的构件，请在 `build.gradle.kts` 文件中添加以下内容：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        binariesSource.set(MAVEN_PUBLICATIONS)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation {
        binariesSource = MAVEN_PUBLICATIONS
    }
}
```

</tab>
</tabs>

> 由于 Kotlin/Android 项目以及包含 Android 目标的多平台项目不发布 JAR 文件，因此此功能不适用于这些项目。
> 
{style="warning"}