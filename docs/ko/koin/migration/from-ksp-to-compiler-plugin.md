---
title: KSP에서 컴파일러 플러그인으로 마이그레이션하기
---

# KSP에서 컴파일러 플러그인으로 마이그레이션하기

이 가이드는 Koin Annotations 프로젝트를 KSP 프로세서(`koin-ksp-compiler`)에서 Koin 컴파일러 플러그인(Koin Compiler Plugin)으로 마이그레이션하는 방법을 다룹니다. 어노테이션이 추가된 클래스는 그대로 유지되며, Gradle 설정, Koin을 시작하는 방식, 그리고 일부 import 문만 변경됩니다. 컴파일러 플러그인이 무엇이고 어떻게 동작하는지에 대해서는 [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin)을 참고하세요.

## 변경 사항 {id="what-changes"}

| 구분 | KSP 프로세서 | 컴파일러 플러그인 |
|------|--------------|-------------------|
| 처리 방식 | KSP, 컴파일 전 별도 단계 | Kotlin K2 컴파일러 내부에서 처리 |
| 생성된 파일 | `build/generated/ksp`에서 확인 가능 | 없음, 컴파일러 내부에서 코드 생성 |
| KMP 설정 | 타깃(target)별로 하나의 KSP 설정 필요 | 모든 타깃에 단일 플러그인 적용 |
| `koin-annotations` 버전 | 별도 버전 (`koin-ksp`) | `koin-core`와 동일한 버전 |
| Koin 시작 | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| 컴파일 타임 검증 | `KOIN_CONFIG_CHECK` 옵션 | 기본 활성화, 전체 그래프 및 호출 위치 검증 |
| 상태 | 지원 중단(Deprecated) | 활발히 개발 중(Active development) |

## 요구사항 {id="requirements"}

- Kotlin 2.3.20 이상 (K2 컴파일러).
- Gradle 8 이상.
- Koin 4.2 이상.

## 1단계: Kotlin 업데이트 {id="step-1-update-kotlin"}

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20"
}
```

## 2단계: 버전 카탈로그(Version Catalog) 업데이트 {id="step-2-update-the-version-catalog"}

이전 (KSP):

```toml
[versions]
koin = "4.0.0"
koin-ksp = "2.0.0"
ksp = "2.0.0-1.0.22"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin-ksp" }
koin-ksp-compiler = { module = "io.insert-koin:koin-ksp-compiler", version.ref = "koin-ksp" }

[plugins]
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

이후 (컴파일러 플러그인):

```toml
[versions]
koin = "4.2.0"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

이제 `koin-annotations`는 메인 Koin 프로젝트의 일부가 되었으며 `koin-core`와 동일한 버전을 사용합니다. 최신 플러그인 버전은 [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)에서 확인하세요.

## 3단계: 빌드 설정 업데이트 {id="step-3-update-the-build-configuration"}

이전 (KSP):

```kotlin
plugins {
    alias(libs.plugins.ksp)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
    ksp(libs.koin.ksp.compiler)
}

ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

이후 (컴파일러 플러그인):

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}

// 선택 사항 (optional)
koinCompiler {
    userLogs = true // 감지된 컴포넌트 로그 출력
}
```

컴파일 타임 검증이 기본적으로 활성화되어 있으므로 `ksp { }` 블록을 제거합니다. 모든 플러그인 옵션은 [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options)에서 확인할 수 있습니다.

### Kotlin Multiplatform {id="kotlin-multiplatform"}

KSP를 사용할 때는 각 타깃마다 프로세서 설정이 필요했습니다:

```kotlin
dependencies {
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

컴파일러 플러그인을 사용하면 공용(shared) 모듈에 플러그인을 한 번만 적용하고 모든 `ksp...` 항목을 제거하면 됩니다:

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

## 4단계: Koin 시작 방식 변경 {id="step-4-update-how-koin-starts"}

KSP는 각 `@Module` 클래스마다 `.module` 확장 프로퍼티를 생성했습니다. 컴파일러 플러그인에는 이러한 확장이 없으므로, `@KoinApplication` 클래스를 선언하고 타입 기반 API(typed API)를 통해 시작합니다.

이전 (KSP):

```kotlin
import org.koin.ksp.generated.*

@Module
@ComponentScan("com.myapp")
class AppModule

fun main() {
    startKoin {
        modules(AppModule().module)
    }
}
```

이후 (컴파일러 플러그인):

```kotlin
import org.koin.plugin.module.dsl.startKoin

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

Android에서는 람다 내에 평소 사용하던 옵션을 전달합니다:

```kotlin
@KoinApplication(modules = [AppModule::class])
class MyApp

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp> {
            androidContext(this@MyApplication)
        }
    }
}
```

기존의 `startKoin { }` 내부나 테스트 룰(test rule) 안에서 사용할 수 있는 다른 타입 기반 API로는 `koinApplication<T>()`, `koinConfiguration<T>()`, `withConfiguration<T>()`가 있습니다. 단일 모듈 클래스만 로드하려면 일반 `startKoin { }` 내부에서 `module<AppModule>()`을 사용하세요. 자세한 내용은 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참고하세요.

## 5단계: import 문 업데이트 {id="step-5-update-imports"}

`@KoinViewModel`이 코어 어노테이션 패키지로 이동했습니다:

```kotlin
// 이전 (KSP)
import org.koin.android.annotation.KoinViewModel

// 이후 (컴파일러 플러그인)
import org.koin.core.annotation.KoinViewModel
```

모든 `import org.koin.ksp.generated.*`를 제거합니다.

## 6단계: 클린 및 재빌드 {id="step-6-clean-and-rebuild"}

KSP에서 생성된 파일들을 삭제한 후 다시 빌드합니다:

```bash
rm -rf build/generated/ksp
./gradlew clean build
```

첫 번째 빌드 시 전체 컴파일 타임 검증이 실행됩니다. KSP에서는 보고되지 않았던 누락된 정의(definition)가 있다면 이제 빌드가 실패하게 됩니다. 에러 메시지 및 `@Provided`에 관한 내용은 [컴파일 타임 안정성](/docs/reference/koin-compiler/compile-safety)을 참고하세요.

## 유지되는 사항 {id="what-stays-the-same"}

어노테이션이 지정된 클래스는 변경되지 않습니다:

```kotlin
@Singleton
class UserRepository(private val database: Database)

@Factory
class GetUserUseCase(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val useCase: GetUserUseCase) : ViewModel()
```

모든 어노테이션 목록은 [어노테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory)에서 확인할 수 있습니다.

## 마이그레이션 후 사용할 수 있는 기능 {id="what-you-can-use-after-migrating"}

다음 기능들을 사용하려면 컴파일러 플러그인이 필요합니다:

- 최상위 함수(Top-level functions): `@Singleton fun database(): Database`는 클래스와 마찬가지로 `@ComponentScan`에 의해 탐색됩니다([정의(Definitions)](/docs/reference/koin-core/definitions#classes-you-dont-own) 참고).
- 모듈 자동 감지(Module discovery): 특정 Gradle 모듈에서 `@Configuration` 태그가 지정된 모듈은 목록에 일일이 나열하지 않아도 `@KoinApplication`에 의해 자동으로 로드됩니다.
- 구성 라벨(Configuration labels): `@Configuration("test")`와 `@KoinApplication(configurations = ["test"])`를 사용하면 해당 라벨이 지정된 모듈만 로드할 수 있습니다([모듈(Modules)](/docs/reference/koin-core/modules) 참고).
- 컴파일러 플러그인 DSL: DSL 모듈도 함께 사용 중인 경우, 컴파일러 플러그인 DSL로 전환할 수 있습니다:

| 생성자(Constructor) / 클래식 DSL | 컴파일러 플러그인 DSL |
|---------------------------|---------------------|
| `singleOf(::MyService)` | `single<MyService>()` |
| `factoryOf(::MyRepository)` | `factory<MyRepository>()` |
| `viewModelOf(::MyViewModel)` | `viewModel<MyViewModel>()` |
| `scopedOf(::MyScoped)` | `scoped<MyScoped>()` |
| `workerOf(::MyWorker)` | `worker<MyWorker>()` |
| `single { build(get()) }` | `single { create(::build) }` |

컴파일러 플러그인 DSL은 `org.koin.plugin.module.dsl`에 위치합니다. 생성자 DSL(Constructor DSL)은 `org.koin.core.module.dsl`에, 클래식 DSL(Classic DSL)은 `org.koin.dsl`에 그대로 유지됩니다. 두 방식 모두 계속 지원되며 플러그인을 통한 검증도 이루어지므로, 반드시 마이그레이션할 필요는 없습니다.

## 문제 해결 {id="troubleshooting"}

### KSP 제거 후 빌드가 실패하는 경우 {id="the-build-fails-after-removing-ksp"}

이전에 생성된 오래된 코드가 클래스패스에 여전히 남아있을 수 있습니다. `./gradlew clean`을 실행하고 `build/generated/ksp`를 삭제한 뒤, IDE 캐시를 무효화(Invalidate caches)하고 다시 빌드하세요.

### 어노테이션이 달린 클래스가 감지되지 않는 경우 {id="annotated-classes-are-not-detected"}

플러그인 로그를 활성화하여 어떤 클래스가 감지되었는지 확인하세요:

```kotlin
koinCompiler {
    userLogs = true
}
```

`@ComponentScan`에 지정된 패키지가 대상 클래스들의 패키지와 일치하는지 확인하세요.

### 런타임에 의존성이 누락되는 경우 {id="a-dependency-is-missing-at-runtime"}

- 해당 모듈이 `@KoinApplication(modules = [...])`에 나열되어 있거나 `@Configuration` 태그가 지정되어 있는지 확인하세요.
- `@ComponentScan` 패키지 설정을 확인하세요.
- Koin 외부에서 생성된 타입의 경우 `@Provided`로 표시하세요([컴파일 타임 안정성](/docs/reference/koin-compiler/compile-safety) 참고).

## 체크리스트 {id="checklist"}

- [ ] Kotlin을 2.3.20 이상으로 업데이트
- [ ] Koin을 4.2.0 이상으로 업데이트
- [ ] KSP 플러그인 제거
- [ ] `koin-ksp-compiler` 의존성 및 `ksp { }` 블록 제거
- [ ] `koin-annotations`에 메인 Koin 버전 사용 (`io.insert-koin:koin-annotations:$koin_version`)
- [ ] Koin 컴파일러 플러그인 적용 (`io.insert-koin.compiler.plugin`)
- [ ] `@KoinViewModel` import 문을 `org.koin.core.annotation`으로 변경
- [ ] `@KoinApplication` 클래스를 생성하고 `modules(X().module)`을 `startKoin<MyApp>()`으로 대체
- [ ] `import org.koin.ksp.generated.*` 제거
- [ ] (선택 사항) DSL 모듈을 `org.koin.plugin.module.dsl.*` 및 `single<X>()`로 전환
- [ ] 클린 및 재빌드 (`rm -rf build/generated/ksp && ./gradlew clean build`)

## 관련 문서 {id="related"}

- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): 플러그인 설치 및 버전 선택.
- [컴파일 타임 안정성](/docs/reference/koin-compiler/compile-safety): 플러그인의 검증 항목 및 에러 코드.
- [Koin 시작하기](/docs/reference/koin-core/starting-koin): `startKoin<T>()` 및 기타 타입 기반 API.
- [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options): 모든 Gradle 옵션 안내.
- [KSP 프로세서 설정](/docs/setup/annotations-ksp): 참고용 지원 중단 KSP 설정 가이드.