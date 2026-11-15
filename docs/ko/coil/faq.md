# FAQ

FAQ에 없는 질문이 있으신가요? [StackOverflow](https://stackoverflow.com/questions/tagged/coil)에서 #coil 태그를 확인하거나 [GitHub Discussions](https://github.com/coil-kt/coil/discussions)에서 검색해 보세요.

## Coil을 Java 프로젝트나 Kotlin/Java 혼합 프로젝트에서 사용할 수 있나요? {id="can-coil-be-used-with-java-projects-or-mixed-kotlin-java-projects"}

네! [여기에서 자세한 내용을 확인하세요](java_compatibility.md).

## 이미지를 미리 로드(preload)하려면 어떻게 해야 하나요? {id="how-do-i-preload-an-image"}

타깃(target)을 지정하지 않고 이미지 요청을 실행하면 됩니다:

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
    // 이미지를 메모리로 디코딩하는 시간/메모리 낭비를 방지하기 위해 디코드 단계를 건너뜁니다.
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## 로깅을 활성화하려면 어떻게 해야 하나요? {id="how-do-i-enable-logging"}

[`ImageLoader`를 생성할 때](getting_started.md#configuring-the-singleton-imageloader) `logger(DebugLogger())`를 설정하세요.

!!! Note
    `DebugLogger`는 디버그 빌드에서만 사용해야 합니다.

## Java 8 또는 Java 11을 타깃으로 설정하려면 어떻게 해야 하나요? {id="how-do-i-target-java-8-or-java-11"}

Coil은 [Java 8 바이트코드](https://developer.android.com/studio/write/java8-support)가 필요합니다. 이는 Android Gradle Plugin `4.2.0` 이상 및 Kotlin Gradle Plugin `1.5.0` 이상에서 기본적으로 활성화되어 있습니다. 이전 버전의 플러그인을 사용하는 경우 Gradle 빌드 스크립트에 다음을 추가하세요:

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
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_11
    }
}
```

## Compose Multiplatform에서 Skiko 버전 경고가 발생하는 이유는 무엇인가요? {id="why-do-i-get-a-skiko-version-warning-with-compose-multiplatform"}

Coil의 Skiko 의존성 버전이 Compose Multiplatform의 버전보다 이전인 경우 Compose Multiplatform에서 다음과 같은 경고가 출력됩니다:

```text
w: Skiko dependencies' versions are incompatible.
```

Skiko는 마일스톤 버전 간에 바이너리 호환성을 보장하지 않습니다. Skiko가 래핑하는 Skia의 마일스톤 버전에서 브레이킹 체인지(호환성을 깨뜨리는 변경 사항)가 발생할 수 있기 때문입니다. 따라서 이 경고를 무시해도 안전하다고 간주해서는 안 됩니다. Coil 릴리스는 Compose Multiplatform **안정화(stable)** 릴리스 및 해당 Skiko 버전을 추적하므로, 이 경고가 발생하면 먼저 Coil을 최신 버전으로 업데이트하세요.

**참고**: Coil은 **alpha** 및 **beta** Compose Multiplatform 릴리스에서 사용되는 Skiko 버전만을 맞추기 위해 새 버전을 릴리스하지는 않습니다. 그러나 Coil이 최신 Skiko 버전에 의존해야 하는 바이너리 호환성 문제가 발생하는 경우, Coil은 업데이트된 의존성을 포함한 **alpha** 릴리스를 게시합니다.

Coil을 최신 버전으로 업데이트한 후에도 경고가 계속 표시되는 경우 다음과 같이 경고를 억제(suppress)할 수 있습니다:

**Compose Multiplatform >= 1.13.0**

Compose Multiplatform 플러그인을 적용하는 각 모듈의 `build.gradle.kts` 파일에 다음을 추가하세요:

```kotlin
compose {
    dependencyCompatibility {
        exclude("io.coil-kt.coil3")
    }
}
```

이렇게 하면 Coil에 대해서만 호환성 검사가 비활성화됩니다.

**이전 Compose Multiplatform 버전:**

`gradle.properties` 파일에 다음을 추가하세요:

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

이렇게 하면 Coil을 포함한 모든 라이브러리에 대해 Compose Multiplatform 라이브러리 호환성 검사가 비활성화됩니다.

## 개발 스냅샷(Snapshot)은 어떻게 사용하나요? {id="how-do-i-get-development-snapshots"}

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

그런 다음 [최신 스냅샷 버전](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)을 사용하여 동일한 아티팩트에 의존성을 설정하세요.

!!! Note
    스냅샷은 CI를 통과하는 `main` 브랜치의 각 새 커밋마다 배포됩니다. 브레이킹 체인지가 포함될 수 있으며 불안정할 수 있습니다. 사용에 따른 위험은 본인 부담입니다.

## Coil에서 Proguard를 사용하려면 어떻게 해야 하나요? {id="how-to-i-use-proguard-with-coil"}

Coil에서 Proguard를 사용하려면 [설정에 이 Proguard 규칙들을 추가하세요](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro).

Ktor, OkHttp 및 Coroutines에 대한 커스텀 규칙도 추가해야 할 수 있습니다.

!!! Note
    Android의 기본 코드 축소기(code shrinker)인 **R8을 사용하는 경우 Coil에 대한 커스텀 규칙을 추가할 필요가 없습니다**. 규칙이 자동으로 추가됩니다.