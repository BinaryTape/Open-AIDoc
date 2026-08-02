[//]: # (title: Kotlin 멀티플랫폼에서의 KSP)
[//]: # (description: Kotlin 멀티플랫폼 프로젝트에 KSP 추가하기)

여기서는 Kotlin 멀티플랫폼 프로젝트에서 KSP(Kotlin Symbol Processing)를 사용하는 방법을 알아봅니다. 빠른 시작을 위해 [소스 저장소](https://github.com/google/ksp/tree/main/examples/multiplatform)에서 KSP를 사용하는 여러 타겟이 포함된 멀티플랫폼 프로젝트 예시를 확인하세요. 이 예시의 프로세서는 프로젝트에서 사용되는 `Foo` 클래스를 생성합니다.

## 멀티플랫폼 프로젝트에 KSP 추가하기

클라이언트 모듈(프로세서를 사용하는 모듈)의 `build.gradle.kts` 파일에서, 심볼 처리가 필요한 각 타겟에 대해 적절한 KSP 프로세서 종속성(dependency)을 추가하세요.

```
dependencies {
  add("ksp<Target>", <processor>)
}
```

* `<Target>`은 멀티플랫폼 프로젝트에서 사용되는 타겟 중 하나입니다. 

  > 타겟의 전체 목록은 [멀티플랫폼 Gradle DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) 및 [Kotlin/Native 지원 타겟](https://kotlinlang.org/docs/native-target-support.html)을 참고하세요.
  >
  {style="tip"}

* `<processor>`는 Gradle 프로젝트 경로입니다. 다음과 같을 수 있습니다:

  * 심볼 프로세서 로직이 포함된 프로젝트의 특정 디렉토리:

      ```
      add("kspJvm", project(":local-processor"))
      ```

  * Room과 같은 외부 프로세서:

      ```
      add("kspJvm", "androidx.room:room-compiler:2.6.1")
      ```

> KSP 2부터 모든 타겟을 포괄하는 `ksp(...)` 구성은 사용이 중단(deprecated)되었습니다. 필요하지 않은 곳에서 프로세서가 실행되는 것을 방지하려면 각 타겟을 명시적으로 구성하세요.
>
{style="warning"}

### 한 타겟에서 여러 프로세서 사용하기

하나의 타겟에 둘 이상의 프로세서를 추가할 수 있습니다:

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

### 여러 타겟에서 동일한 프로세서 사용하기

동일한 프로세서를 여러 타겟에 추가할 수 있습니다:

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

iOS 타겟이 많은 경우, 루프를 사용하여 반복을 피할 수 있습니다:

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

### 테스트 컴파일을 위한 KSP 구성

테스트 컴파일 중에 KSP를 실행하려면 대응하는 테스트 구성(test configurations)에 프로세서를 추가하세요:

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

Android 호스트 및 디바이스 테스트의 경우, KSP는 대응하는 소스 세트 이름에서 구성 이름을 파생합니다:

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

## KSP 구성 이름 찾기

KSP는 Kotlin 멀티플랫폼 소스 세트에서 구성 이름을 파생합니다. 모듈의 전체 KSP 구성 목록을 보려면 다음을 실행하세요:

```Bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

타겟 소스 세트에 대응하는 구성 이름을 찾으세요.

## 컴파일 및 처리

멀티플랫폼 프로젝트에서 Kotlin은 `main` 및 `test`와 같은 각 타겟 및 소스 세트에 대해 별도의 [컴파일](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)을 생성합니다. 하나 이상의 KSP 프로세서가 구성된 각 Kotlin 컴파일 태스크에 대해, KSP는 그에 대응하는 심볼 처리 태스크를 생성합니다.

[예시 프로젝트](https://github.com/google/ksp/tree/main/examples/multiplatform)에는 6개의 타겟이 정의되어 있습니다. 각 타겟에는 `main` 및 `test` 컴파일이 있으며, 그 결과 다음과 같은 컴파일 및 심볼 처리 태스크가 생성됩니다:

* **JVM**: `jvmMain` 및 `jvmTest`

* **JS**: `jsMain` 및 `jsTest`

* **LinuxX64**: `linuxX64Main` 및 `linuxX64Test`

* **AndroidNativeX64**: `androidNativeX64Main` 및 `androidNativeX64Test`

* **AndroidNativeArm64**: `androidNativeArm64Main` 및 `androidNativeArm64Test`

* **MingwX64**: `mingwX64Main` 및 `mingwX64Test`

예시의 `workload/build.gradle.kts` 파일에서는 다음 구성들에 대해 KSP 종속성이 선언되어 있습니다:

* `kspJvm` 및 `kspJvmTest`
* `kspJs` 및 `kspJsTest`
* `kspAndroidNativeX64` 및 `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` 및 `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP는 KSP 종속성이 선언된 각 구성에 대해 심볼 처리 태스크를 생성합니다. 이 예시에서 프로젝트는 최소 12개의 Kotlin 컴파일 태스크와 10개의 심볼 처리 태스크를 생성합니다. 나머지 컴파일은 KSP가 구성되지 않았으므로 대응하는 KSP 태스크가 없습니다.