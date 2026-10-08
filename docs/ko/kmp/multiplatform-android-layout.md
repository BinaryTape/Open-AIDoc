[//]: # (title: Android 소스 세트 레이아웃)

새로운 Android 소스 세트(source set) 레이아웃은 Kotlin 1.8.0에서 도입되었으며 1.9.0에서 기본값이 되었습니다. 이 가이드를 통해 지원 중단된 레이아웃과 새로운 레이아웃 간의 주요 차이점을 이해하고, 프로젝트를 마이그레이션하는 방법을 알아보세요.

> 모든 제안을 구현할 필요는 없으며, 특정 프로젝트에 적용 가능한 항목만 구현하면 됩니다.
>
{style="tip"}

## 호환성 확인 {id="check-the-compatibility"}

새로운 레이아웃은 Android Gradle 플러그인 7.0 이상이 필요하며, Android Studio 2022.3 이상에서 지원됩니다. 사용 중인 Android Gradle 플러그인 버전을 확인하고 필요한 경우 업그레이드하세요.

## Kotlin 소스 세트 이름 변경 {id="rename-kotlin-source-sets"}

해당하는 경우, 다음 패턴에 따라 프로젝트의 소스 세트 이름을 변경하세요.

| 이전 소스 세트 레이아웃 | 새로운 소스 세트 레이아웃 |
|----------------------------------------|-------------------------------------|
| `targetName` + `AndroidSourceSet.name` | `targetName` + `AndroidVariantType` |

`{AndroidSourceSet.name}`은 다음과 같이 `{KotlinSourceSet.name}`에 매핑됩니다.

|             | 이전 소스 세트 레이아웃 | 새로운 소스 세트 레이아웃 |
|-------------|----------------------------|--------------------------------|
| main        | androidMain                | androidMain                    |
| test        | androidTest                | android<b>Unit</b>Test         |
| androidTest | android<b>Android</b>Test  | android<b>Instrumented</b>Test |

## 소스 파일 이동 {id="move-source-files"}

해당하는 경우, 다음 패턴에 따라 소스 파일을 새로운 디렉터리로 이동하세요.

| 이전 소스 세트 레이아웃 | 새로운 소스 세트 레이아웃 |
|-------------------------------------------------------|-------------------------------------|
| 기존 레이아웃에는 추가적인 `/kotlin` 소스 디렉터리가 있었습니다. | `src/{KotlinSourceSet.name}/kotlin` |

`{AndroidSourceSet.name}`은 다음과 같이 `{SourceDirectories included}`에 매핑됩니다.

|             | 이전 소스 세트 레이아웃 | 새로운 소스 세트 레이아웃 |
|-------------|---------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| main        | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java  | src/androidMain/kotlin<br/>src/main/kotlin<br/>src/main/java                                      |
| test        | src/androidTest/kotlin<br/>src/test/kotlin<br/>src/test/java  | src/android<b>Unit</b>Test/kotlin<br/>src/test/kotlin<br/>src/test/java                           |
| androidTest | src/android<b>Android</b>Test/kotlin<br/>src/androidTest/java | src/android<b>Instrumented</b>Test/kotlin<br/>src/androidTest/java, <b>src/androidTest/kotlin</b> |

## AndroidManifest.xml 파일 이동 {id="move-the-androidmanifest-xml-file"}

프로젝트에 `AndroidManifest.xml` 파일이 있는 경우, 다음 패턴에 따라 새로운 디렉터리로 이동하세요.

| 이전 소스 세트 레이아웃 | 새로운 소스 세트 레이아웃 |
|--------------------------------------------------------|-------------------------------------------------------|
| src/{<b>Android</b>SourceSet.name}/AndroidManifest.xml | src/{<b>Kotlin</b>SourceSet.name}/AndroidManifest.xml |

`{AndroidSourceSet.name}`은 다음과 같이 `{AndroidManifest.xml location}`에 매핑됩니다.

|       | 이전 소스 세트 레이아웃 | 새로운 소스 세트 레이아웃 |
|-------|-------------------------------|---------------------------------------------|
| main  | src/main/AndroidManifest.xml  | src/<b>android</b>Main/AndroidManifest.xml  |
| debug | src/debug/AndroidManifest.xml | src/<b>android</b>Debug/AndroidManifest.xml |

## Android 테스트와 공통(common) 테스트 간의 관계 확인 {id="check-the-relationship-between-android-and-common-tests"}

새로운 Android 소스 세트 레이아웃은 Android 인스트루먼티드 테스트(Android-instrumented tests, 새로운 레이아웃에서는 `androidInstrumentedTest`로 이름 변경됨)와 공통 테스트(common tests) 간의 관계를 변경합니다.

이전에는 `androidAndroidTest`와 `commonTest` 사이의 `dependsOn` 관계가 기본이었습니다. 이는 다음을 의미했습니다.

* `commonTest`의 코드를 `androidAndroidTest`에서 사용할 수 있었습니다.
* `commonTest`의 `expect` 선언에 대해 `androidAndroidTest`에서 상응하는 `actual` 구현이 있어야 했습니다.
* `commonTest`에 선언된 테스트가 Android 인스트루먼티드 테스트로도 실행되었습니다.

새로운 Android 소스 세트 레이아웃에서는 `dependsOn` 관계가 기본적으로 추가되지 않습니다. 이전 동작을 선호하는 경우, `build.gradle.kts` 파일에 다음과 같이 관계를 수동으로 선언하세요.

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

## Android 플레이버(flavors) 구현 조정 {id="adjust-the-implementation-of-android-flavors"}

이전에는 Kotlin Gradle 플러그인이 `debug` 및 `release` 빌드 유형이나 `demo`, `full`과 같은 커스텀 플레이버를 포함하는 Android 소스 세트에 대응하는 소스 세트들을 즉시 생성했습니다.
덕분에 `val androidDebug by getting { ... }`와 같은 표현식을 사용하여 소스 세트에 접근할 수 있었습니다.

새로운 Android 소스 세트 레이아웃은 소스 세트를 생성하기 위해 Android의 [`onVariants`](https://developer.android.com/reference/tools/gradle-api/8.0/com/android/build/api/variant/AndroidComponentsExtension#onVariants(com.android.build.api.variant.VariantSelector,kotlin.Function1))를 사용합니다. 이로 인해 위와 같은 표현식은 더 이상 유효하지 않으며, `org.gradle.api.UnknownDomainObjectException: KotlinSourceSet with name 'androidDebug' not found`와 같은 오류가 발생하게 됩니다.

이 문제를 해결하려면 `build.gradle.kts` 파일에서 새로운 `invokeWhenCreated()` API를 사용하세요.

```kotlin
kotlin {
// ...
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    sourceSets.invokeWhenCreated("androidFreeDebug") {
// ...
    }
}
```
