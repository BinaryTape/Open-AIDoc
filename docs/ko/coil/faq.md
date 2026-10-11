# FAQ

FAQ에 없는 질문이 있으신가요? [StackOverflow](https://stackoverflow.com/questions/tagged/coil)에서 #coil 태그를 확인하거나 [GitHub discussions](https://github.com/coil-kt/coil/discussions)에서 검색해 보세요.

## Coil을 Java 프로젝트나 Kotlin/Java 혼합 프로젝트에서 사용할 수 있나요? {id="can-coil-be-used-with-java-projects-or-mixed-kotlin-java-projects"}

네! [여기](java_compatibility.md)를 참고하세요.

## 이미지를 미리 로드(preload)하려면 어떻게 해야 하나요? {id="how-do-i-preload-an-image"}

타겟(target)을 지정하지 않고 이미지 요청을 실행합니다:

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

이렇게 하면 이미지를 미리 로드하여 디스크 및 메모리 캐시에 저장합니다.

디스크 캐시에만 미리 로드하려는 경우 다음과 같이 디코딩 및 메모리 캐시 저장을 건너뛸 수 있습니다:

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // 메모리 캐시 쓰기를 비활성화합니다.
    .memoryCachePolicy(CachePolicy.DISABLED)
    // 디코딩 단계를 건너뛰어 이미지를 메모리로 디코딩하는 데 드는 시간/메모리 낭비를 방지합니다.
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## 로깅을 활성화하려면 어떻게 해야 하나요? {id="how-do-i-enable-logging"}

[`ImageLoader`를 생성할 때](getting_started.md#configuring-the-singleton-imageloader) `logger(DebugLogger())`를 설정하세요.

!!! Note
    `DebugLogger`는 디버그 빌드에서만 사용해야 합니다.

## Java 8 또는 Java 11을 타겟팅하려면 어떻게 해야 하나요? {id="how-do-i-target-java-8-or-java-11"}

Coil은 [Java 8 바이트코드](https://developer.android.com/studio/write/java8-support)를 필요로 합니다. 이는 Android Gradle 플러그인 `4.2.0` 이상 및 Kotlin Gradle 플러그인 `1.5.0` 이상에서 기본적으로 활성화되어 있습니다. 이러한 플러그인의 이전 버전을 사용하는 경우 Gradle 빌드 스크립트에 다음을 추가하세요:

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

Coil `3.2.0`부터는 `coil-compose` 및 `coil-compose-core`에 Java 11 바이트코드가 필요합니다:

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

## Compose Multiplatform에서 Skiko 버전 경고가 발생하는 이유는 무엇인가요? {id="why-do-i-get-a-skiko-version-warning-with-compose-multiplatform"}

Compose Multiplatform의 Skiko 의존성보다 Coil의 Skiko 의존성이 이전 버전인 경우 다음과 같은 경고가 출력됩니다:

```text
w: Skiko dependencies' versions are incompatible.
```

Skiko는 마일스톤 버전 간에 파괴적 변경(breaking changes)을 도입할 수 있는 Skia를 래핑하므로, 마일스톤 버전 간의 바이너리 호환성을 보장하지 않습니다. 따라서 이 경고를 안전하게 무시할 수 있다고 간주해서는 안 됩니다. Coil 릴리스는 Compose Multiplatform **안정(stable)** 릴리스와 해당 Skiko 버전을 추적하므로, 이 경고가 발생하면 먼저 Coil을 최신 버전으로 업데이트하세요.

**참고**: Coil은 **alpha** 및 **beta** Compose Multiplatform 릴리스에서 사용하는 Skiko 버전을 맞추기 위한 목적으로만 새 버전을 릴리스하지는 않습니다. 그러나 Coil이 최신 Skiko 버전에 의존해야 하는 바이너리 호환성 문제가 있는 경우, 업데이트된 의존성이 포함된 **alpha** 릴리스를 게시합니다.

Coil을 최신 버전으로 업데이트한 후에도 경고가 계속 나타나면 다음과 같이 경고를 억제할 수 있습니다:

**Compose Multiplatform >= 1.13.0**

Compose Multiplatform 플러그인을 적용하는 각 모듈의 `build.gradle.kts` 파일에 다음을 추가합니다:

```kotlin
compose {
    dependencyCompatibility {
        exclude("io.coil-kt.coil3")
    }
}
```

이렇게 하면 Coil에 대해서만 호환성 검사가 비활성화됩니다.

**이전 Compose Multiplatform 버전:**

`gradle.properties` 파일에 다음을 추가합니다:

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

이렇게 하면 Coil을 포함한 모든 라이브러리에 대해 모든 Compose Multiplatform 라이브러리 호환성 검사가 비활성화됩니다.

## 개발 스냅샷은 어떻게 가져오나요? {id="how-do-i-get-development-snapshots"}

저장소 목록에 스냅샷 저장소를 추가합니다:

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

그런 다음 [최신 스냅샷 버전](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)으로 동일한 아티팩트에 대한 의존성을 추가합니다.

!!! Note
    스냅샷은 CI를 통과한 `main`의 각 새 커밋마다 배포됩니다. 스냅샷에는 파괴적 변경이 포함될 수 있으며 불안정할 수 있습니다. 사용에 따른 위험은 본인이 감수해야 합니다.

## Coil과 함께 Proguard를 사용하려면 어떻게 해야 하나요? {id="how-to-i-use-proguard-with-coil"}

Coil과 함께 Proguard를 사용하려면 [설정에 이 Proguard 규칙들을 추가](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro)하세요.

Ktor, OkHttp 및 Coroutines에 대한 커스텀 규칙도 추가해야 할 수 있습니다.

!!! Note
    Android의 기본 코드 축소기(code shrinker)인 **R8을 사용하는 경우 Coil에 대한 커스텀 규칙을 추가할 필요가 없습니다**. 규칙이 자동으로 추가됩니다.