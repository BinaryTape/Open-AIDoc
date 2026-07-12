# FAQ

FAQ에 없는 질문이 있으신가요? [StackOverflow](https://stackoverflow.com/questions/tagged/coil)에서 #coil 태그를 확인하거나 [Github discussions](https://github.com/coil-kt/coil/discussions)를 검색해 보세요.

## Coil을 Java 프로젝트나 Kotlin/Java 혼용 프로젝트에서 사용할 수 있나요?

네! [여기](java_compatibility.md)를 읽어보세요.

## 이미지를 프리로드(preload)하려면 어떻게 해야 하나요?

대상(target) 없이 이미지 요청을 실행하세요:

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

이렇게 하면 이미지를 프리로드하여 디스크 및 메모리 캐시에 저장합니다.

디스크 캐시에만 프리로드하고 싶다면, 다음과 같이 디코딩 및 메모리 캐시 저장을 건너뛸 수 있습니다:

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // 메모리 캐시 쓰기를 비활성화합니다.
    .memoryCachePolicy(CachePolicy.DISABLED)
    // 디코딩 단계를 건너뛰어 이미지를 메모리로 디코딩하는 데 시간/메모리를 낭비하지 않도록 합니다.
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## 로깅(logging)을 활성화하려면 어떻게 해야 하나요?

[`ImageLoader`를 구성할 때](getting_started.md#configuring-the-singleton-imageloader) `logger(DebugLogger())`를 설정하세요.

!!! Note
    `DebugLogger`는 디버그 빌드에서만 사용해야 합니다.

## Java 8 또는 Java 11을 타겟팅하려면 어떻게 해야 하나요?

Coil은 [Java 8 바이트코드(bytecode)](https://developer.android.com/studio/write/java8-support)를 요구합니다. 이는 Android Gradle Plugin `4.2.0` 이상 및 Kotlin Gradle Plugin `1.5.0` 이상에서 기본적으로 활성화되어 있습니다. 해당 플러그인의 이전 버전을 사용하는 경우 Gradle 빌드 스크립트에 다음을 추가하세요:

```kotlin
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}
```

Coil `3.2.0`부터 `coil-compose` 및 `coil-compose-core`에는 Java 11 바이트코드가 필요합니다:

```kotlin
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
}
```

## Compose Multiplatform에서 왜 Skiko 버전 경고가 발생하나요?

Compose Multiplatform은 Coil의 Skiko 의존성이 Compose Multiplatform의 의존성보다 이전 버전일 경우 다음과 같은 경고를 출력합니다.

```text
w: Skiko dependencies' versions are incompatible.
```

이 경고는 일반적으로 무시해도 안전합니다. Skiko 버전은 보통 바이너리 호환성을 유지하기 때문입니다. Coil 릴리스는 Compose Multiplatform **안정(stable)** 릴리스와 해당 Skiko 버전을 추적하므로, 이 경고가 발생하면 먼저 Coil을 최신 버전으로 업데이트하세요.

**참고**: 원칙적으로 Coil은 Compose Multiplatform의 **알파(alpha)** 및 **베타(beta)** 버전에서 사용하는 Skiko 버전이 최신 Coil 릴리스가 의존하는 버전과 호환되지 않는 경우가 아니면, 단순히 Skiko 버전을 맞추기 위해 새 버전을 릴리스하지 않습니다.

경고가 계속 나타나면 다음 Gradle 속성을 설정하여 무시할 수 있습니다:

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

하지만 이 Gradle 속성은 Coil뿐만 아니라 모든 라이브러리에 대한 모든 Compose Multiplatform 라이브러리 호환성 검사를 비활성화합니다. Coil과 해당 Skiko 의존성에 대해서만 경고를 비활성화하려면 루트 `build.gradle.kts` 파일에 다음 코드 스니펫을 추가하세요:

```kotlin
dependencies {
    components {
        all {
            if (id.group == "io.coil-kt.coil3") {
                allVariants {
                    withDependencies {
                        val hadSkikoDependency = removeAll {
                            it.group == "org.jetbrains.skiko" && it.name == "skiko"
                        }
                        if (hadSkikoDependency) {
                            // `0.150.0`을 사용 중인 Compose Multiplatform 버전의 Skiko 버전으로 교체하세요.
                            add("org.jetbrains.skiko:skiko:0.150.0")
                        }
                    }
                }
            }
        }
    }
}
```

## 개발용 스냅샷(snapshot)을 어떻게 받나요?

저장소 목록에 스냅샷 저장소를 추가하세요:

Gradle (`.gradle`):

```groovy
allprojects {
    repositories {
        maven { url 'https://central.sonatype.com/repository/maven-snapshots/' }
    }
}
```

Gradle Kotlin DSL (`.gradle.kts`):

```kotlin
allprojects {
    repositories {
        maven("https://central.sonatype.com/repository/maven-snapshots/")
    }
}
```

그런 다음 [최신 스냅샷 버전](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)으로 동일한 아티팩트를 의존성에 추가하세요.

!!! Note
    스냅샷은 CI를 통과한 `main` 브랜치의 새로운 커밋마다 배포됩니다. 파괴적인 변경(breaking changes)이 포함될 수 있으며 불안정할 수 있습니다. 사용 시 주의하시기 바랍니다.

## Coil에서 Proguard를 어떻게 사용하나요?

Coil에서 Proguard를 사용하려면, [이 Proguard 규칙들을 구성에 추가하세요](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro).

Ktor, OkHttp, Coroutines에 대한 커스텀 규칙도 추가해야 할 수도 있습니다.

!!! Note
    Android의 기본 코드 슈링커(code shrinker)인 **R8을 사용하는 경우 Coil에 대한 커스텀 규칙을 추가할 필요가 없습니다.** 규칙이 자동으로 추가됩니다.