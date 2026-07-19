[//]: # (title: Kotlin 컴포넌트의 안정성)

Kotlin 언어와 툴셋은 JVM, JS, Native 대상을 위한 컴파일러, 표준 라이브러리(Standard Library), 다양한 부속 도구 등 여러 컴포넌트로 나뉩니다.
이 중 다수의 컴포넌트는 **Stable(안정)** 상태로 공식 출시되었으며, 이는 [편안한 업데이트(Comfortable Updates) 및 현대적인 언어 유지(Keeping the Language Modern) 원칙](kotlin-evolution-principles.md)에 따라 하위 호환성(backward-compatible)을 유지하며 발전해 왔음을 의미합니다.

*Feedback Loop(피드백 루프)* 원칙에 따라, 커뮤니티가 미리 사용해 볼 수 있도록 많은 기능을 조기에 출시하므로 아직 **Stable** 상태로 출시되지 않은 컴포넌트도 다수 존재합니다.
일부는 아주 초기 단계에 있고, 일부는 더 성숙한 상태입니다.
각 컴포넌트의 발전 속도와 사용자가 도입 시 감수해야 하는 위험 수준에 따라 **Experimental(실험)**, **Alpha**, **Beta**로 표시합니다.

## 안정성 수준 설명

각 안정성 수준과 그 의미에 대한 빠른 가이드는 다음과 같습니다.

**Experimental**은 "토이 프로젝트(toy projects)에서만 사용하세요"라는 의미입니다.
* 아이디어와 그 실현 가능성을 테스트하는 단계입니다. 일부 사용자들이 이를 시도하고 피드백을 공유해주기를 바랍니다. 범위가 최소화되어 있으며, 기능은 언제든지 변경되거나 사라질 수 있습니다. 안정성이나 호환성을 보장하지 않습니다.

**Alpha**은 "이 기능이 제품화될 수 있을지 테스트하는 중입니다"라는 의미입니다.
* 이 기능을 제품화할 계획이며, 최종 형태를 갖추기 위해 사용자 가치와 시장 적합성을 검증하고 있습니다. 기능 세트가 아직 불완전하며, 파괴적 변경(breaking changes)이 예상됩니다. 가설이 유효하지 않다면 기능을 대폭 변경하거나 중단할 수 있습니다.

**Beta**은 "사용 가능하며, 마이그레이션 문제를 최소화하기 위해 최선을 다하겠습니다"라는 의미입니다.
* 거의 완성된 단계이며, 현재 사용자 피드백이 특히 중요합니다.
* 다만 아직 100% 완료된 것은 아니므로, 사용자 피드백 등에 기반한 변경 사항이 발생할 수 있습니다.
* 원활한 업데이트를 위해 미리 지원 중단(deprecation) 경고를 확인하세요.

우리는 *Experimental*, *Alpha*, *Beta*를 통칭하여 **pre-stable(안정화 전)** 단계라고 부릅니다.

<a name="stable"/>

**Stable**은 "가장 보수적인 시나리오에서도 사용하세요"라는 의미입니다.
* 완성이 완료된 상태입니다. 엄격한 [하위 호환성 규칙](https://kotlinfoundation.org/language-committee-guidelines/)에 따라 발전할 것입니다.

안정성 수준은 컴포넌트가 얼마나 빨리 Stable로 출시될지를 나타내지 않는다는 점에 유의하세요. 마찬가지로 출시 전에 컴포넌트가 얼마나 많이 변경될지도 나타내지 않습니다. 이는 오직 컴포넌트가 얼마나 빠르게 변화하고 있으며, 사용자가 업데이트 시 겪을 수 있는 이슈에 대한 위험이 어느 정도인지만을 나타냅니다.

## Kotlin 컴포넌트용 GitHub 배지

[Kotlin GitHub 조직](https://github.com/Kotlin)에는 다양한 Kotlin 관련 프로젝트가 호스팅되어 있습니다.
일부는 전담하여 개발하는 프로젝트이며, 다른 일부는 사이드 프로젝트입니다.

각 Kotlin 프로젝트에는 안정성과 지원 상태를 설명하는 두 가지 GitHub 배지가 있습니다.

* **Stability(안정성)** 상태. 각 프로젝트가 얼마나 빠르게 발전하고 있으며 사용자가 도입 시 어느 정도의 위험을 감수해야 하는지를 보여줍니다.
  안정성 상태는 [Kotlin 언어 기능 및 컴포넌트의 안정성 수준](#안정성-수준-설명)과 완전히 일치합니다.
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} 은 **Experimental**을 의미합니다.
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} 은 **Alpha**을 의미합니다.
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} 은 **Beta**을 의미합니다.
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} 은 **Stable**을 의미합니다.

* **Support(지원)** 상태. 프로젝트를 유지 관리하고 사용자의 문제 해결을 돕겠다는 우리의 약속을 보여줍니다.
  지원 수준은 모든 JetBrains 제품에 대해 통합되어 있습니다.  
  [자세한 내용은 JetBrains Open Source 문서를 참조하세요](https://github.com/JetBrains#jetbrains-on-github).

## 하위 컴포넌트의 안정성

안정적인(stable) 컴포넌트가 실험적인(experimental) 하위 컴포넌트를 가질 수 있습니다. 예시:
* 안정적인 컴파일러가 실험적인 기능을 가질 수 있습니다.
* 안정적인 API에 실험적인 클래스나 함수가 포함될 수 있습니다.
* 안정적인 명령줄 도구(CLI tool)에 실험적인 옵션이 있을 수 있습니다.

우리는 어떤 하위 컴포넌트가 **Stable** 상태가 아닌지 정확하게 문서화하고 있습니다.
또한 사용자가 안정적으로 출시되지 않은 기능을 실수로 사용하는 것을 방지하기 위해, 가능한 경우 경고를 표시하고 명시적으로 사용 동의(opt-in)를 하도록 최선을 다하고 있습니다.

## Kotlin 컴포넌트의 현재 안정성

> 기본적으로 모든 새로운 컴포넌트는 Experimental 상태를 가집니다.
>
{style="note"}

### Kotlin 컴파일러

| **컴포넌트**                                                       | **상태** | **상태 적용 버전** | **비고** |
|---------------------------------------------------------------------|------------|--------------------------|--------------|
| Kotlin/JVM                                                          | Stable     | 1.0.0                    |              |
| Kotlin/Native                                                       | Stable     | 1.9.0                    |              |
| Kotlin/JS                                                           | Stable     | 1.3.0                    |              |
| Kotlin/Wasm                                                         | Beta       | 2.2.20                   |              |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable     |                          |              |

### 핵심 컴파일러 플러그인

| **컴포넌트**                                    | **상태**   | **상태 적용 버전** | **비고** |
|--------------------------------------------------|--------------|--------------------------|--------------|
| [All-open](all-open-plugin.md)                   | Stable       | 1.3.0                    |              |
| [No-arg](no-arg-plugin.md)                       | Stable       | 1.3.0                    |              |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable       | 1.3.0                    |              |
| [kapt](kapt.md)                                  | Stable       | 1.3.0                    |              |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20                   |              |
| [Power-assert](power-assert.md)                  | Experimental | 2.0.0                    |              |

### Kotlin 라이브러리

| **컴포넌트**                 | **상태** | **상태 적용 버전** | **비고** |
|-------------------------------|------------|--------------------------|--------------|
| kotlin-stdlib (JVM)           | Stable     | 1.0.0                    |              |
| kotlinx-coroutines            | Stable     | 1.3.0                    |              |
| kotlinx-serialization         | Stable     | 1.0.0                    |              |
| kotlin-metadata-jvm           | Stable     | 2.0.0                    |              |
| kotlin-reflect (JVM)          | Beta       | 1.0.0                    |              |
| kotlinx-datetime              | Alpha      | 0.2.0                    |              |
| kotlinx-io                    | Alpha      | 0.2.0                    |              |
| kotlinx-collections-immutable | Alpha      | 0.3.5                    |              |

### Kotlin 멀티플랫폼 (Kotlin Multiplatform)

| **컴포넌트**                                  | **상태** | **상태 적용 버전** | **비고**                                                                                                                         |
|------------------------------------------------|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform                           | Stable     | 1.9.20                   |                                                                                                                                      |
| Android Studio용 Kotlin Multiplatform 플러그인 | Beta       | 0.8.0                    | [언어와 별도로 버전이 관리됨](https://kotlinlang.org/docs/multiplatform/multiplatform-plugin-releases.html) |

### Kotlin/Native

| **컴포넌트**                                | **상태** | **상태 적용 버전** | **비고**                                                                                                                  |
|----------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native 런타임                        | Stable     | 1.9.20                   |                                                                                                                               |
| C 및 Objective-C와의 Kotlin/Native 상호운용성 | Beta       | 1.3.0                    | [C 및 Objective-C 라이브러리 임포트의 안정성](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| klib 바이너리                                | Stable     | 1.9.20                   | cinterop klib은 포함하지 않음, 아래 참조                                                                                       |
| cinterop klib 바이너리                       | Beta       | 1.3.0                    | [C 및 Objective-C 라이브러리 임포트의 안정성](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| CocoaPods 통합                        | Stable     | 1.9.20                   |                                                                                                                               |

다양한 타겟에 대한 지원 수준에 관한 자세한 내용은 [](native-target-support.md)를 참조하세요.

### 빌드 도구 (Build tools)

| **컴포넌트**                                       | **상태** | **상태 적용 버전** | **비고**                                                                                                          |
|-----------------------------------------------------|------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle 플러그인](gradle-configure-project.md) | Stable     | 1.1.1                    | [Kotlin 멀티플랫폼 Gradle 플러그인](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)은 Kotlin 1.9.20부터 Stable 상태입니다. |
| [Kotlin Maven 플러그인](maven-configure-project.md)   | Stable     | 1.0.0                    |                                                                                                                       |

### 언어 도구

| **컴포넌트**                         | **상태**   | **상태 적용 버전** | **비고**                                   |
|---------------------------------------|--------------|--------------------------|------------------------------------------------|
| 스크립팅 구문 및 시맨틱        | Alpha        | 1.2.0                    |                                                |
| 스크립팅 임베딩 및 확장 API | Beta         | 1.5.0                    |                                                |
| 스크립팅 IDE 지원                 | Beta         |                          | IntelliJ IDEA 2023.1 이상 버전부터 사용 가능 |
| CLI 스크립팅                         | Alpha        | 1.2.0                    |                                                |

## 언어 기능 및 디자인 제안

언어 기능 및 새로운 디자인 제안에 대해서는 [](kotlin-language-features-and-proposals.md)를 참조하세요.