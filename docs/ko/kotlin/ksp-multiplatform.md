[//]: # (title: Kotlin Multiplatform에서의 KSP)

<web-summary>Kotlin Multiplatform 프로젝트에서 KSP를 사용하는 방법을 알아봅니다.</web-summary>

이 가이드에서는 Kotlin Multiplatform 프로젝트에서 KSP(Kotlin Symbol Processing)를 사용하는 방법을 설명합니다.
빠른 시작을 원하신다면 [멀티플랫폼 예제 프로젝트](https://github.com/google/ksp/tree/main/examples/multiplatform)를 참고하세요.
이 예제에서는 여러 타깃에 KSP를 적용하며, 프로세서가 프로젝트에서 사용할 `Foo` 클래스를 생성합니다.

## 멀티플랫폼 프로젝트에 KSP 추가하기 {id="add-ksp-to-a-multiplatform-project"}

클라이언트 모듈(프로세서를 사용하는 모듈)에 KSP를 추가하려면 다음 단계를 따르세요.

1. 모듈의 `build.gradle(.kts)` 파일을 엽니다.
2. `plugins {}` 블록에 KSP 플러그인을 추가합니다.

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

3. 심볼 프로세싱이 필요한 각 타깃에 프로세서 의존성을 추가합니다.

    ```kotlin
    dependencies {
        add("ksp<Target>", <processor>)
    }
    ```

    * `<Target>`은 멀티플랫폼 프로젝트에서 사용되는 타깃 이름으로, 첫 글자를 대문자로 작성해야 합니다. 예를 들어 `iosArm64` 타깃의 경우 `kspIosArm64` 구성을 사용합니다.

      > 전체 타깃 목록은 [Multiplatform Gradle DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) 및 [Kotlin/Native 지원 타깃 및 호스트](native-target-support.md)를 참고하세요.
      >
      {style="tip"}

    * `<processor>`는 프로세서 의존성입니다. 다음 중 하나일 수 있습니다.

      * 심볼 프로세서 로직이 포함된 프로젝트 내 모듈:

        ```kotlin
        add("kspJvm", project(":local-processor"))
        ```

      * Room과 같은 외부 프로세서:

        ```kotlin
        add("kspJvm", "androidx.room3:room3-compiler:3.0.3")
        ```

<anchor name="avoid-the-ksp-configuration-on-ksp-1-0-1"/>

> KSP 2.3.12부터는 멀티플랫폼 프로젝트에서 포괄적인(catch-all) `ksp(...)` 구성을 사용하면 빌드 에러가 발생합니다. 이전 버전에서는 deprecated로 표시되었습니다. 필요하지 않은 곳에서 프로세서가 실행되는 것을 방지하기 위해 각 타깃을 명시적으로 구성하세요.
>
{style="warning"}

### 단일 타깃에서 여러 프로세서 사용하기 {id="use-multiple-processors-in-a-single-target"}

하나의 타깃에 둘 이상의 프로세서를 추가할 수 있습니다.

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

### 여러 타깃에서 동일한 프로세서 사용하기 {id="use-the-same-processor-in-multiple-targets"}

동일한 프로세서를 여러 타깃에 추가할 수 있습니다.

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

iOS 타깃이 많은 경우 루프를 사용하여 중복을 줄일 수 있습니다.

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

### 테스트 컴파일을 위한 KSP 구성 {id="configure-ksp-for-test-compilations"}

테스트 컴파일 중에 KSP를 실행하려면 해당 테스트 구성에 프로세서를 추가합니다.

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

Android 호스트 및 기기 테스트의 경우, KSP는 해당 소스 세트(source set) 이름으로부터 구성 이름을 도출합니다.

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

## KSP 구성 이름 확인하기 {id="find-ksp-configuration-names"}

KSP는 Kotlin Multiplatform 소스 세트로부터 구성 이름을 파생합니다. 모듈의 전체 KSP 구성 목록을 확인하려면 다음 명령어를 실행하세요.

```bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

타깃 소스 세트에 해당하는 구성 이름을 확인하세요.

## 컴파일 및 프로세싱 {id="compilation-and-processing"}

멀티플랫폼 프로젝트에서 Kotlin은 `main` 및 `test`와 같이 각 타깃별로 개별적인 [컴파일(compilation)](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)을 생성합니다. 하나 이상의 프로세서가 구성된 각 Kotlin 컴파일 태스크에 대해, KSP는 이에 대응하는 심볼 프로세싱 태스크를 생성합니다.

[예제 프로젝트](https://github.com/google/ksp/tree/main/examples/multiplatform)에서는 6개의 타깃을 정의합니다. 각 타깃에는 `main` 및 `test` 컴파일이 존재하므로, 다음과 같은 컴파일 및 심볼 프로세싱 태스크가 생성됩니다.

* **JVM**: `jvmMain` 및 `jvmTest`
* **JS**: `jsMain` 및 `jsTest`
* **LinuxX64**: `linuxX64Main` 및 `linuxX64Test`
* **AndroidNativeX64**: `androidNativeX64Main` 및 `androidNativeX64Test`
* **AndroidNativeArm64**: `androidNativeArm64Main` 및 `androidNativeArm64Test`
* **MingwX64**: `mingwX64Main` 및 `mingwX64Test`

예제의 `workload/build.gradle.kts` 파일에서는 다음 구성에 대해 KSP 의존성이 선언되어 있습니다.

* `kspJvm` 및 `kspJvmTest`
* `kspJs` 및 `kspJsTest`
* `kspAndroidNativeX64` 및 `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` 및 `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP는 KSP 의존성이 선언된 각 구성에 대해 심볼 프로세싱 태스크를 생성합니다. 이 예제에서 프로젝트에는 최소 12개의 Kotlin 컴파일 태스크와 10개의 심볼 프로세싱 태스크가 포함됩니다. 나머지 컴파일에는 KSP가 구성되지 않았으므로 대응하는 KSP 태스크가 생성되지 않습니다.

## 관련 항목 {id="see-also"}

* KSP 리포지토리의 [멀티플랫폼 예제 프로젝트](https://github.com/google/ksp/tree/main/examples/multiplatform)
* [명령줄에서 KSP 실행](ksp-command-line.md#main-class) 시 각 플랫폼별 진입점(entry point) 목록