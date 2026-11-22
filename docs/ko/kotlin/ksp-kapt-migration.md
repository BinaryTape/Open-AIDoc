[//]: # (title: kapt에서 KSP로 마이그레이션)

<web-summary>Kotlin 프로젝트의 어노테이션 프로세서를 kapt에서 KSP로 마이그레이션하는 방법을 알아봅니다.</web-summary>

이 가이드에서는 어노테이션 프로세서(annotation processor)를 [Kotlin Annotation Processing Tool (kapt)](kapt.md)에서 [Kotlin Symbol Processing (KSP)](ksp-overview.md)로 마이그레이션하는 방법을 설명합니다. 이를 통해 프로젝트에서 Kotlin 기능을 최대한 활용하고 빌드 성능을 향상할 수 있습니다.

kapt를 사용하면 Kotlin에서 Java 어노테이션 프로세서를 사용할 수 있습니다. kapt는 Kotlin 소스 코드를 Java "스텁(stub)"으로 변환한 다음, 해당 스텁에 대해 어노테이션 프로세서를 실행합니다. 하지만 이 프로세스는 비용이 많이 들고 빌드 시간을 크게 늘리며, 변환 과정에서 Kotlin 고유의 일부 기능이 손실됩니다.

반면 KSP는 Kotlin에 맞게 특별히 설계된 kapt의 대안입니다. KSP는 Kotlin 소스를 직접 분석하고 null 가능성(nullability)과 같은 Kotlin 고유의 정보를 노출하여 빌드 시간을 단축합니다.

## 시작하기 전에 {id="before-you-start"}

프로젝트에서 사용하는 프로세서가 KSP를 지원하는지 확인하세요. [지원되는 라이브러리](ksp-overview.md#supported-libraries) 목록을 확인하거나 해당 라이브러리의 문서를 참조하세요.

> KSP와 kapt는 함께 실행될 수 있으므로, 한 번에 라이브러리나 모듈 하나씩 단계적으로 프로젝트를 마이그레이션할 수 있습니다.
>
{style="note"}

## 프로젝트에 KSP 플러그인 추가하기 {id="add-the-ksp-plugin-to-your-project"}

프로젝트 수준의 `build.gradle(.kts)` 파일에 있는 `plugins {}` 블록에 KSP 플러그인을 추가합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    id("com.google.devtools.ksp") version "%kspVersion%" apply false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    id 'com.google.devtools.ksp' version '%kspVersion%' apply false
}
```

</tab>
</tabs>

> KSP의 최신 버전을 확인하려면 GitHub [Releases](https://github.com/google/ksp/releases)를 확인하세요.
>
{style="tip"}

## 모듈에서 kapt를 KSP로 교체하기 {id="replace-kapt-with-ksp-in-your-modules"}

마이그레이션하려는 프로세서를 사용하는 모듈을 찾습니다. 해당 모듈의 `build.gradle(.kts)` 파일에서 다음을 수행합니다.

1. `plugins {}` 블록에 KSP 플러그인을 추가합니다.

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        id("com.google.devtools.ksp")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'com.google.devtools.ksp'
    }
    ```

    </tab>
    </tabs>

2. `dependencies {}` 블록에서 `kapt`를 `ksp`로 교체합니다.

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    dependencies {
        implementation("com.google.dagger:dagger:2.48")

        // kapt("com.google.dagger:dagger-compiler:2.48")를 대체
        ksp("com.google.dagger:dagger-compiler:2.48")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    dependencies {
        implementation 'com.google.dagger:dagger:2.48'

        // kapt 'com.google.dagger:dagger-compiler:2.48'를 대체
        ksp 'com.google.dagger:dagger-compiler:2.48'
    }
    ```

    </tab>
    </tabs>

대부분의 라이브러리는 이 교체만으로 충분합니다. 추가 변경 사항이 필요한지 확인하려면 각 라이브러리의 문서를 확인하세요.

## kapt 플러그인 제거하기 {id="remove-the-kapt-plugin"}

모든 프로세서를 KSP로 마이그레이션한 후에는 모든 `build.gradle(.kts)` 파일에서 kapt 플러그인을 안전하게 제거할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    // kapt 플러그인 선언 제거:
    id("org.jetbrains.kotlin.kapt")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    // kapt 플러그인 선언 제거:
    id 'org.jetbrains.kotlin.kapt'
}
```

</tab>
</tabs>

`kapt {}` 블록 등 남아 있는 kapt 관련 설정이 있다면 모두 삭제하세요.

## 함께 보기 {id="see-also"}

* KSP API로 [직접 프로세서를 만드는 방법](ksp-quickstart.md#create-your-own-processor)을 알아보세요.
* [Java 어노테이션 처리를 KSP로 변환하기 위한 레퍼런스](ksp-reference.md)에서 Java 어노테이션 프로세싱 API에 해당하는 KSP 요소를 찾아보세요.
* [Kotlin Symbol Processing API](ksp-overview.md) 개요에서 컴파일 중에 KSP가 어떻게 작동하는지 알아보세요.
* KSP 저장소의 [예제 프로젝트](https://github.com/google/ksp/tree/main/examples)를 살펴보세요.