---
title: SDK 및 라이브러리를 위한 Koin
---

# SDK 및 라이브러리를 위한 Koin

Koin Embedded를 사용하면 SDK 및 라이브러리 개발자가 Koin을 다른 패키지 이름으로 재배치(relocate)하여 패키징할 수 있습니다. 이를 통해 라이브러리가 내부적으로 사용하는 Koin이 애플리케이션 내 다른 곳에서 사용하는 Koin과 충돌하지 않도록 방지합니다. 이 페이지는 라이브러리 작성자를 위한 문서입니다. 일반적인 앱 개발에는 표준 Koin을 사용하세요.

재배치된 Koin을 얻는 방법에는 두 가지가 있습니다. 사전 빌드된 아티팩트나 재배치 스크립트를 사용하는 셀프 서비스 방식, 또는 [Enterprise Support](/docs/support/#enterprise-support-by-kotzilla)의 일환으로 Kotzilla가 전용 버전을 직접 빌드, 서명, 호스팅 및 유지 관리해 주는 [Koin Embedded LTS](#koin-embedded-lts) 방식입니다.

## 충돌 문제 {id="the-conflict-problem"}

내부적으로 Koin을 사용하는 라이브러리는 의존성 그래프의 일부로 `org.koin.*`을 배포합니다. 이로 인해 두 가지 충돌 위험이 발생하며, 두 번째 위험은 간과되는 경우가 많습니다.

### 사례 1: 호스트 애플리케이션과의 충돌 {id="case-1-conflict-with-the-host-application"}

SDK를 사용하는 애플리케이션 역시 자체적인 릴리스 주기에 맞춰 Koin을 사용합니다.

```kotlin
// SDK가 Koin 3.5.6을 사용하는 경우
implementation("io.insert-koin:koin-core:3.5.6")

// SDK를 사용하는 앱이 Koin 4.2.2를 사용하는 경우
implementation("io.insert-koin:koin-core:4.2.2")
// 충돌 발생: Gradle은 둘 중 하나의 버전만 확인(resolve)합니다.
```

이로 인해 발생하는 문제:

- **모두에게 단일 버전 적용**: Gradle이 전체 앱에 대해 단 하나의 `org.koin` 버전만을 선택하므로, 둘 중 한쪽은 테스트해보지 않은 버전을 기반으로 실행됩니다.
- **런타임 오류**: 버전 간 API 변경 사항으로 인해 런타임에 오류가 발생할 수 있습니다.
- **강제 업그레이드**: SDK로 인해 앱 사용자가 원치 않는 Koin 업그레이드를 강제당하거나, 반대로 업그레이드가 차단될 수 있습니다.

### 사례 2: 다른 SDK와의 충돌 {id="case-2-conflict-with-other-sdks"}

앱에서 여러분의 SDK만 단독으로 사용되는 경우는 드뭅니다. 다른 공급업체의 SDK도 Koin을 내장하고 있다면 서로 충돌이 발생하며, 상대방의 릴리스 주기를 서로 제어할 수 없습니다.

```kotlin
// 앱이 두 개의 SDK를 통합하고 있으며, 둘 다 내부적으로 Koin을 사용하는 경우
implementation("com.vendor-a:analytics-sdk:2.1.0")  // Koin 3.5.6 내장
implementation("com.vendor-b:payments-sdk:5.0.0")   // Koin 4.2.2 내장
// 동일한 충돌이 발생하지만, 의존성 체인의 누구도 이를 해결할 수 없음
```

이것이 바로 공유된 재배치 네임스페이스만으로는 충분하지 않은 이유입니다. `org.koin.*`을 벗어나 모든 임베더가 공유하는 네임스페이스로 옮기더라도 충돌의 위치만 바뀔 뿐입니다. 동일한 대상 네임스페이스로 재배치된 두 SDK는 이전과 똑같이 충돌합니다. 따라서 오직 자신만을 위한 고유한 네임스페이스가 필요합니다.

## 패키지 재배치 (Package relocation) {id="package-relocation"}

재배치는 Koin의 패키지를 다른 네임스페이스로 다시 작성하고 별도의 아티팩트로 재빌드합니다.

```kotlin
// 재배치 전
import org.koin.core.module.dsl.singleOf
import org.koin.core.context.startKoin

// 재배치 후
import acme.koin.core.module.dsl.singleOf
import acme.koin.core.context.startKoin
```

두 네임스페이스는 완전히 서로 다른 클래스 집합이므로, 의존성 해결(resolution) 충돌 없이 공존할 수 있습니다.

```kotlin
// SDK가 자체적으로 재배치된 Koin을 번들로 제공
implementation("io.insert-koin:acme-koin-core:3.5.6")

// SDK를 사용하는 앱은 표준 Koin 사용
implementation("io.insert-koin:koin-core:4.2.2")
// 충돌 없음: 완전히 분리된 두 개의 패키지
```

:::warning
일반적인 앱 개발에는 임베디드 Koin을 사용하지 마세요. 이는 의존성 충돌을 방지해야 하는 라이브러리 작성자(결제, 분석 또는 인증 SDK, 공유 내부 라이브러리, 서드파티 연동 등)를 위한 기능입니다.
:::

## 사전 빌드된 임베디드 버전 {id="prebuilt-embedded-version"}

Kotzilla는 공유 네임스페이스인 `embedded.koin.*`으로 재배치된 사전 빌드 아티팩트인 `embedded-koin-core` 및 `embedded-koin-android`를 유지 관리합니다. 접근 권한은 요청 시 제공됩니다. [Koin 팀](mailto:koin@kotzilla.io)에 문의하세요.

:::warning
이 아티팩트들은 베타 상태이며 공유 네임스페이스를 사용합니다. 따라서 평가 목적으로만 적합하며, 외부에 배포되는 SDK용으로는 권장하지 않습니다. 모든 소비자가 동일한 `embedded.koin.*` 네임스페이스로 재배치하므로, 한 애플리케이션 내에서 이를 기반으로 빌드된 두 개의 SDK가 사용되면 `org.koin.*`에서와 똑같이 충돌이 발생합니다([사례 2](#case-2-conflict-with-other-sdks) 참조). 재배치를 시험해보거나 처음부터 끝까지 직접 제어할 수 있는 내부 빌드에만 사용하세요. 서드파티에 제공할 SDK를 배포하려면 [재배치 스크립트](#custom-relocation)를 사용하여 직접 재배치하거나 [Koin Embedded LTS](#koin-embedded-lts)를 사용하세요.
:::

## 커스텀 재배치 {id="custom-relocation"}

자신만의 전용 네임스페이스를 사용하려면, 재배치 스크립트를 사용하여 Koin을 직접 다시 빌드하세요.

:::warning
이 스크립트는 유지 관리 보증 없이 있는 그대로(as-is) 제공되는 베타 프로젝트입니다. 빌드, 검증, 배포 및 향후 보안 패치를 포함한 모든 Koin 릴리스에 대한 재빌드 등 이후의 모든 작업은 전적으로 사용자의 책임입니다.
:::

### 재배치 스크립트 사용하기 {id="using-the-relocation-scripts"}

[koin-relocate](https://github.com/InsertKoinIO/koin-relocate) 프로젝트는 커스텀 패키지 이름으로 Koin을 재빌드할 수 있는 스크립트를 제공합니다. 재배치는 패키지와 모듈 이름 모두에 적용되는 접두사(prefix)를 기반으로 동작합니다.

```
RELOCATION_PREFIX=acme   ->   org.koin.*  ->  acme.koin.*
                              koin-core   ->  acme-koin-core
```

단계:

1. 재배치 스크립트 저장소를 클론합니다.

   ```bash
   git clone https://github.com/InsertKoinIO/koin-relocate.git
   cd koin-relocate
   ```

2. 빌드를 구성하기 위해 `relocate.properties` 파일을 수정합니다.

   ```properties
   RELOCATION_PREFIX=acme
   TARGET_KOIN_VERSION=3.5.6
   KOIN_MODULES=core/koin-core;android/koin-android
   BUILD_DIR=./build
   ```

   - `RELOCATION_PREFIX`: 패키지 및 모듈 이름에 적용할 접두사입니다.
   - `TARGET_KOIN_VERSION`: 빌드 기준이 될 Koin 버전 태그입니다.
   - `KOIN_MODULES`: 재배치할 Koin 모듈 목록입니다.
   - `BUILD_DIR`: 빌드된 아티팩트가 복사될 위치입니다.

3. 재배치를 실행합니다. 소스에서 Koin을 클론하고 다시 빌드하므로 JDK 17 환경이 필요합니다.

   ```bash
   ./relocate.sh
   ```

4. `BUILD_DIR`에서 `aar` 및 `jar` 아티팩트를 수집합니다. 재배치된 모든 모듈은 로컬 Maven 저장소에도 설치되므로 테스트 중에 바로 사용할 수 있습니다.

5. SDK 빌드를 위해 이를 자체 Maven 저장소에 배포합니다.

자세한 지침은 [koin-relocate 저장소](https://github.com/InsertKoinIO/koin-relocate)를 참조하세요.

### 자체 호스팅 시 고려해야 할 사항 {id="what-self-hosting-involves"}

스크립트를 통해 첫 번째 빌드는 쉽게 얻을 수 있습니다. 하지만 배포되는 SDK의 의존성으로 재배치된 Koin을 운영하는 것은 장기적인 책임이 따르는 일입니다. 시작하기 전에 다음 사항들을 미리 확인하세요.

- **Koin의 빌드 구조**: 재배치는 소스에서 Koin을 다시 빌드합니다. Koin의 멀티 모듈 Gradle 설정, 버전 카탈로그 및 툴체인 요구 사항을 그대로 이어받게 되며, CI 환경에서 재현 가능한 JDK 17 환경을 유지해야 합니다.
- **단순한 패키지 선언 수정 그 이상**: Kotlin 소스에서 `org.koin`을 변경하는 것은 간단한 부분에 불과합니다. 리소스와 `META-INF/services` 항목과 같은 선언형 서비스 파일에도 정규화된 이름(FQN)이 포함되어 있습니다. 재작성 과정에서 누락된 부분은 컴파일 타임이 아닌 런타임에 오류를 발생시킵니다.
- **Android 및 멀티플랫폼 아티팩트**: `koin-android`는 고유한 매니페스트와 컨슈머 룰(consumer rules)을 포함하는 `aar` 아티팩트를 생성합니다. Kotlin Multiplatform의 경우 각 타깃이 고유한 메타데이터와 함께 자체 아티팩트를 배포하므로, 재배치된 좌표가 모든 타깃에 걸쳐 일관성을 유지해야 합니다.
- **배포 및 서명**: 스크립트는 접두사가 붙은 모듈 이름과 함께 `io.insert-koin` 그룹 아래에 아티팩트를 생성하고 로컬 Maven 저장소에 설치합니다. 자체적으로 제어하는 저장소에 배포하는 것만으로 내부 사용에는 충분합니다. 하지만 공개적으로 배포하는 경우, 재배치된 Koin이 이제 여러분의 공급망(supply chain) 일부가 되므로 사용자가 기대하는 POM 메타데이터, 그룹 소유권 및 서명 작업을 직접 책임져야 합니다.
- **동등성 검증**: 재배치된 빌드는 원본과 정확히 동일하게 동작해야 합니다. Koin 자체 테스트 스위트는 `org.koin`을 대상으로 실행되므로, SDK에서 사용하는 Koin 기능에 대해 의존성 확인(resolution), 스코핑 및 수명 주기 동작이 재작성 후에도 그대로 유지되는지 자체적으로 검증해야 합니다.
- **모든 Koin 패치마다 반복**: 보안 패치를 포함하여 원하는 모든 업스트림 릴리스가 나올 때마다 재배치를 다시 실행하고, 빌드하고, 검증하고, 서명하고, 배포해야 합니다. 한 번 수행한 재배치는 생성된 시점부터 낡아가는 스냅샷에 불과합니다.

이러한 점들이 자체 호스팅을 하지 말아야 할 이유는 아닙니다. 다만 세 번째 보안 권고를 마주하고 나서야 유지보수 비용을 깨닫는 대신, 사전에 신중하게 판단하기 위한 근거가 됩니다.

### Koin Annotations 및 컴파일러 플러그인 {id="koin-annotations-and-the-compiler-plugin"}

:::warning
Koin Annotations 및 Koin 컴파일러 플러그인(Compiler Plugin)은 재배치된 빌드에서 지원되지 않습니다.
:::

둘 다 `org.koin`을 직접 참조하는 코드를 생성합니다. 이 코드는 재배치가 이미 완료된 후 컴파일 타임에 프로젝트 내에서 생성되므로, 재배치된 빌드에서 더 이상 제공하지 않는 표준 Koin 패키지를 타깃으로 삼게 됩니다. 스크립트는 생성된 코드까지 재배치하지 않습니다.

재배치된 빌드에서는 Constructor DSL이나 Classic DSL(`module { }`, `single`, `factory`, `singleOf`, `factoryOf`)을 사용하여 모듈을 선언하세요.

## 셀프 서비스 방식의 한계 {id="limits-of-the-self-service-paths"}

베타 상태 및 공유 네임스페이스 주의 사항 외에도, 셀프 서비스 방식에는 다음과 같은 한계가 있습니다.

- **어노테이션 미지원**: Koin Annotations 및 컴파일러 플러그인을 사용할 수 없습니다.
- **제한된 모듈**: 모든 Koin 모듈이 완벽하게 재배치되는 것은 아닙니다.
- **빌드 복잡성**: 재배치는 빌드, 검증 및 배포 파이프라인을 직접 소유하고 관리해야 함을 의미합니다.
- **유지 관리 부담**: 보안 패치를 포함한 모든 Koin 업데이트를 직접 다시 재배치하고 배포해야 합니다.

마지막 한계는 지속적으로 발생하는 문제이며, Koin Embedded LTS가 바로 이 부담을 덜어줍니다.

## Koin Embedded LTS {id="koin-embedded-lts"}

Koin Embedded LTS는 최소 18개월 동안 유지 관리되는 충돌 없는 자체 Koin LTS 버전을 제공합니다. 이는 [Enterprise Support by Kotzilla](/docs/support/#enterprise-support-by-kotzilla)의 일부입니다. 스크립트를 사용하는 대신, Kotzilla가 귀사 전용으로 재배치된 Koin을 직접 빌드, 서명, 호스팅 및 유지 관리합니다.

### 전용 버전 제공 {id="your-own-version"}

오직 귀사만을 위한 전용 네임스페이스가 제공됩니다. Kotzilla는 유지 관리 중인 Koin LTS 라인에서 빌드를 생성하고, 이를 귀사의 네임스페이스로 재배치하고, 서명한 뒤 귀사 전용 비공개 저장소에 호스팅합니다. 사용자는 단 하나의 Maven 저장소만 추가하면 자체 재배치 모듈을 의존성으로 사용할 수 있습니다.

재배치 스크립트를 실행하거나, 빌드 파이프라인을 유지 관리하거나, 아티팩트를 직접 배포할 필요가 없습니다.

### 충돌 방지 {id="conflict-free"}

네임스페이스가 오직 귀사만을 위한 것이므로, 임베디드 Koin은 호스트 애플리케이션 및 함께 배포되는 다른 모든 SDK에서 완전히 격리되어 보이지 않습니다. 상대방이 어떤 Koin 버전을 실행하든, Koin을 내장하고 있든 상관없습니다. 셀프 서비스 방식 중 어느 것도 이를 제공하지 못합니다. 사전 빌드된 아티팩트는 모든 사용자가 단일 네임스페이스를 공유하며, 직접 재배치한 네임스페이스는 직접 패치를 유지하는 동안에만 격리 상태가 유지됩니다.

### 18개월 유지 관리 보증 {id="18-months-of-maintenance"}

빌드는 지정 시점부터 최소 18개월간 유지 관리가 보장되는 LTS 라인([Kotlin 1.x용 Koin 3.5.6 또는 Kotlin 2.x용 Koin 4.2.x](/docs/support/#available-lts-lines))을 기반으로 합니다. 구독이 활성화되어 있는 동안 배포 중인 버전에 대한 지원이 지속됩니다.

해당 라인의 모든 패치는 보안 백포트를 포함하여 귀사의 네임스페이스로 다시 빌드되고 배포됩니다. 재배치를 다시 수행할 필요 없이 자체 아티팩트의 새 버전만 가져다 사용하면 됩니다.

### 지원 범위 {id="scope"}

Koin Embedded LTS는 `koin-core` 및 `koin-android`를 지원합니다.

온보딩 과정에는 LTS 패치 수준으로의 마이그레이션이 포함됩니다. 현재 해당 라인의 이전 버전을 사용 중인 경우, 이러한 마이그레이션은 별도로 먼저 진행할 필요 없이 온보딩 설정 과정의 일부로 처리됩니다.

:::note
Embedded LTS는 LTS 라인에서만 빌드됩니다. 임의의 Koin 버전을 재배치하는 것은 일회성 작업에 불과합니다. 해당 아티팩트는 유지 관리되는 라인 외부에 존재하므로 재빌드할 업스트림 수정 사항이 제공되지 않습니다. 이는 아무도 패치하지 않는 아티팩트가 되며, 널리 배포되는 SDK에 컴파일된 패치되지 않은 DI 프레임워크는 이 서비스가 방지하고자 하는 바로 그 문제입니다. LTS 라인에는 구독 기간 내내 재배치할 수 있는 다음 패치가 항상 준비되어 있습니다.
:::

kotzilla.io에서 [Koin Embedded LTS](https://kotzilla.io/koin-lts)에 대해 자세히 알아보세요.

## SDK 개발 모범 사례 {id="sdk-development-practices"}

SDK 내부에서 Koin을 실행할 때의 권장 사항:

- **Koin을 내부에 유지**: Koin은 SDK의 구현 세부 사항이어야 합니다.
- **Koin 타입을 외부에 노출하지 않기**: `KoinComponent`, `Module` 및 기타 Koin 타입을 SDK의 공개 API에 노출하지 마세요.
- **격리된 인스턴스 사용**: 전역 `startKoin` 대신 `koinApplication`을 사용하여 SDK 전용의 별도 Koin 인스턴스를 시작하세요. [Context Isolation](/docs/reference/koin-core/context-isolation)을 참조하세요.
- **버전 고정**: 버전 범위 대신 정확한 재배치 버전에 의존하세요.
- **의존성 문서화**: SDK 문서에 내부적으로 Koin을 사용하고 있음을 명시하세요.

내부 세부 사항으로서의 Koin 활용 예시:

```kotlin
class PaymentSDK private constructor(context: Context) {

    companion object {
        private var instance: PaymentSDK? = null

        fun initialize(context: Context): PaymentSDK {
            return instance ?: PaymentSDK(context).also { instance = it }
        }
    }

    private val koinApp = koinApplication {
        androidContext(context)
        modules(paymentModule)
    }

    private val paymentService: PaymentService = koinApp.koin.get()

    fun processPayment(amount: Double): PaymentResult {
        return paymentService.process(amount)
    }
}
```

공개 API에 Koin을 노출하지 마세요:

```kotlin
// 지양: KoinComponent와 get()이 공개 API로 유출됩니다.
class PaymentSDK : KoinComponent {
    fun getPaymentService(): PaymentService = get()
}
```

SDK 문서에 내부 의존성을 명시하세요:

```markdown
## Dependencies

This SDK uses Koin internally (embedded version) for dependency injection.
The embedded version is isolated and will not conflict with Koin usage
in your application.

Internal dependency: `io.insert-koin:acme-koin-core:3.5.6`
Package namespace: `acme.koin.*`
```

## SDK를 재배치된 Koin으로 마이그레이션하기 {id="moving-an-sdk-to-a-relocated-koin"}

1. **의존성 교체**: `io.insert-koin:koin-core`를 재배치된 좌표(예: `io.insert-koin:acme-koin-core`)로 변경합니다.
2. **import 문 업데이트**: `import org.koin`을 `import acme.koin`으로 대체합니다.
3. **어노테이션을 DSL로 교체**: SDK가 Koin Annotations 또는 컴파일러 플러그인을 사용하는 경우, 해당 선언을 Constructor DSL 또는 Classic DSL로 다시 작성합니다. [Koin Annotations 및 컴파일러 플러그인](#koin-annotations-and-the-compiler-plugin)을 참조하세요.
4. **현실적인 배포 환경에서 테스트**: 표준 Koin을 사용하는 앱 환경, 그리고 SDK가 실제 사용될 환경과 유사하게 Koin을 내장한 다른 SDK와 함께 동작하는 환경에서 테스트하세요.

원래대로 되돌리는 작업도 역순으로 동일합니다. 표준 `koin-*` 좌표와 `org.koin` import를 복원하면 됩니다.

## 문제 해결 (Troubleshooting) {id="troubleshooting"}

### 재배치된 아티팩트를 찾을 수 없는 경우 {id="the-relocated-artifact-can-t-be-resolved"}

```
Could not find io.insert-koin:acme-koin-core:3.5.6
```

재배치된 아티팩트가 정상적으로 배포되었는지, 그리고 해당 아티팩트를 배포한 저장소가 이를 사용하는 프로젝트 빌드에 선언되어 있는지 확인하세요.

```kotlin
repositories {
    maven("https://maven.acme.com/releases")  // 배포한 저장소 위치
}
```

### 런타임 ClassNotFoundException {id="classnotfoundexception-at-runtime"}

모든 위치에서 재배치된 패키지 이름을 사용하고 있는지 확인하세요.

```kotlin
// 잘못된 예
import org.koin.core.context.startKoin

// 올바른 예
import acme.koin.core.context.startKoin
```

누락된 클래스가 리소스나 `META-INF/services` 항목에서만 참조되는 경우라면, 재배치 과정에서 소스 코드 이외의 참조가 누락된 것입니다. 해당 파일에도 재배치된 이름이 적용되어 있는지 확인하세요.

### 버전 충돌이 계속 발생하는 경우 {id="version-conflicts-remain"}

동일한 모듈 내에서 표준 Koin과 재배치된 Koin을 혼용하지 마세요.

```kotlin
// 혼용 금지
implementation("io.insert-koin:koin-core:3.5.6")       // 표준
implementation("io.insert-koin:acme-koin-core:3.5.6")  // 재배치

// 자체 재배치 빌드만 사용
implementation("io.insert-koin:acme-koin-core:3.5.6")
```

### Koin을 내장한 다른 SDK와의 충돌 {id="conflict-with-another-sdk-that-embeds-koin"}

두 SDK가 모두 동일한 네임스페이스로 재배치되었기 때문이며, 대부분 둘 다 사전 빌드된 `embedded.koin.*` 아티팩트를 사용하고 있을 때 발생합니다. 둘 중 하나는 자체 고유 네임스페이스가 필요합니다. 직접 재배치하거나 [Koin Embedded LTS](#koin-embedded-lts)를 사용하세요.

## 피드백 {id="feedback"}

셀프 서비스 방식(사전 빌드 아티팩트 및 재배치 스크립트) 관련:

- **이슈 보고**: [koin-relocate GitHub issues](https://github.com/InsertKoinIO/koin-relocate/issues)
- **질문**: [Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)
- **이메일**: [koin@kotzilla.io](mailto:koin@kotzilla.io)

## 관련 문서 {id="related"}

- [버전, 로드맵 및 지원](/docs/support/): LTS 라인 및 Kotzilla의 Enterprise Support.
- [컨텍스트 격리 (Context Isolation)](/docs/reference/koin-core/context-isolation): 라이브러리 내부에서 독립적인 Koin 인스턴스 실행하기.
- [Koin 시작하기](/docs/reference/koin-core/starting-koin): `startKoin` 및 `koinApplication`.
- [koin-relocate](https://github.com/InsertKoinIO/koin-relocate): 재배치 스크립트 및 관련 문서.
- [Koin Embedded LTS](https://kotzilla.io/koin-lts): 유지 관리가 제공되는 충돌 없는 전용 Koin.