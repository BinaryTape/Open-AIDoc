[//]: # (title: Gradle 플러그인 변형(variants) 지원)

Gradle 7.0에서는 Gradle 플러그인 작성자를 위한 새로운 기능인 [변형을 가진 플러그인(plugins with variants)](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)이 도입되었습니다. 이 기능을 사용하면 이전 Gradle 버전과의 호환성을 유지하면서 최신 Gradle 기능을 더 쉽게 지원할 수 있습니다. [Gradle의 변형 선택(variant selection)](https://docs.gradle.org/current/userguide/variant_model.html)에 대해 더 자세히 알아보세요.

Gradle 플러그인 변형을 통해 Kotlin 팀은 서로 다른 Gradle 버전에 대해 서로 다른 Kotlin Gradle 플러그인(KGP) 변형을 제공할 수 있습니다. 목표는 지원되는 가장 오래된 Gradle 버전에 해당하는 `main` 변형에서 기본 Kotlin 컴파일을 지원하는 것입니다. 각 변형은 해당 릴리스의 Gradle 기능에 대한 구현을 포함하게 됩니다. 최신 변형은 최신 Gradle 기능 세트를 지원할 것입니다. 이러한 접근 방식을 통해 제한된 기능으로 이전 Gradle 버전에 대한 지원을 확장할 수 있습니다.

현재 Kotlin Gradle 플러그인에는 다음과 같은 변형이 있습니다.

| 변형(Variant) 이름 | 해당 Gradle 버전 |
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

향후 Kotlin 릴리스에서 더 많은 변형이 추가될 예정입니다.

빌드에서 어떤 변형을 사용하는지 확인하려면 [`--info` 로그 레벨](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)을 활성화하고 출력에서 `Using Kotlin Gradle plugin`으로 시작하는 문자열(예: `Using Kotlin Gradle plugin main variant`)을 찾으세요.

## 문제 해결(Troubleshooting) {id="troubleshooting"}

> 다음은 Gradle의 변형 선택과 관련하여 알려진 문제들에 대한 해결 방법입니다.
> * [pluginManagement의 ResolutionStrategy가 다중 변형 플러그인에서 작동하지 않음](https://github.com/gradle/gradle/issues/20545)
> * [플러그인이 `buildSrc` 공통 종속성으로 추가될 때 플러그인 변형이 무시됨](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

### Gradle이 커스텀 구성에서 KGP 변형을 선택할 수 없는 경우 {id="gradle-can-t-select-a-kgp-variant-in-a-custom-configuration"}

Gradle이 커스텀 구성(custom configuration)에서 KGP 변형을 선택하지 못하는 것은 예상된 상황입니다. 커스텀 Gradle 구성을 사용하는 경우:

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

그리고 Kotlin Gradle 플러그인에 대한 종속성을 추가하려는 경우(예시):

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

`customConfiguration`에 다음과 같은 속성(attributes)을 추가해야 합니다.

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
            // 특정 KGP 변형에 의존하려는 경우:
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
            // 특정 KGP 변형에 의존하려는 경우:
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

그렇지 않으면 다음과 유사한 오류가 발생합니다.

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

## 다음 단계는 무엇인가요? {id="what-s-next"}

[Gradle 기본 사항 및 세부 정보](https://docs.gradle.org/current/userguide/userguide.html)에 대해 자세히 알아보세요.