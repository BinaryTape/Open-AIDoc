[//]: # (title: 다중 라운드 처리)

<web-summary>KSP가 프로세서를 다중 라운드로 실행하는 방식과 프로세서가 심볼 처리를 이후 라운드로 미루는 방법을 알아봅니다.</web-summary>

KSP는 프로세서를 라운드(round) 단위로 실행합니다. 각 라운드에서 프로세서는 이전 라운드에서 생성된 소스 파일을 사용할 수 있습니다.

심볼을 다음 라운드로 미루려면(defer), `SymbolProcessor.process()`에서 해당 심볼들을 `List<KSAnnotated>` 형태로 반환하세요. KSP는 다음 라운드에서 이 심볼들을 프로세서에 다시 전달합니다.

유효하지 않은 심볼을 미루려면 예를 들어 다음과 같이 `KSAnnotated.validate()`를 사용하여 필터링합니다:

```kotlin
override fun process(resolver: Resolver): List<KSAnnotated> {
    val symbols = resolver.getSymbolsWithAnnotation("com.example.annotation.Builder")
    val result = symbols.filter { !it.validate() }.toList()
    symbols
        .filter { it is KSClassDeclaration && it.validate() }
        .forEach { it.accept(BuilderVisitor(), Unit) }
    return result
}
```

> KSP 저장소에서 [다중 라운드 처리(multi-round processing)](https://github.com/google/ksp/blob/main/examples/playground/processors/src/main/kotlin/BuilderProcessor.kt)
> 전체 예제를 확인하세요.
>
{style="note"}

다중 라운드 처리는 한 라운드 전체에서 새로운 파일이 생성되지 않을 때 종료됩니다. 미뤄진 심볼이 처리되지 않은 채 남아 있으면, KSP는 미처리된 심볼이 남아 있는 각 프로세서에 대해 오류를 기록합니다.

## 심볼을 다음 라운드로 미루기 {id="defer-symbols-to-the-next-round"}

프로세서는 다른 프로세서로부터 추가 정보가 필요한 경우 심볼을 이후 라운드로 미룰 수 있습니다. 프로세서는 필요한 정보를 얻을 때까지 여러 라운드에 걸쳐 심볼 처리를 계속 미룰 수 있습니다. 필요한 정보를 사용할 수 있게 되면 프로세서는 해당 심볼을 처리할 수 있습니다.

다음과 같은 경우에만 심볼 처리를 미루세요:

* 심볼을 처리하기 전에 추가 정보가 필요한 경우.
* 심볼이 소스 코드에서 비롯된 경우.

    > 클래스패스(classpath)의 심볼은 미루지 마세요. KSP가 자동으로 필터링합니다.
    >
    {style="note"}

예를 들어, 애너테이션이 달린 클래스의 빌더(builder)를 생성하는 프로세서는 모든 생성자 매개변수 타입이 구체적인 타입으로 확인(resolve)되어야 할 수 있습니다. 첫 번째 라운드에서는 매개변수 타입 중 하나를 확인하지 못할 수 있습니다. 이후 라운드에서는 그 사이에 생성된 파일들 덕분에 확인할 수 있게 될 수 있습니다. 그러면 프로세서는 해당 클래스를 처리할 수 있습니다.

## 심볼 유효성 검증 {id="validate-symbols"}

유효성 검증(Validation)은 심볼을 이후 라운드로 미룰지 여부를 결정하는 데 도움이 됩니다. 프로세서는 심볼을 올바르게 처리하는 데 필요한 정보를 정의해야 합니다.

> 유효성 검증에는 종종 타입 확인(type resolution)이 필요하며, 이는 비용이 많이 들 수 있습니다. 심볼을 처리하는 데 필요한 정보만 확인하세요.
>
{style="tip"}

기본 유효성 검증 동작이 모든 사용 사례에 적합하지는 않을 수 있습니다. 유효성 검증을 커스터마이즈하려면 `KSValidateVisitor`를 사용하고 유효성을 검증할 심볼을 선택하는 `predicate` 람다를 제공하세요.

커스텀 유효성 검증을 구현할 때는 `KSType.isError`를 사용하여 타입이 유효한지 확인하세요. `isError`가 `true`이면 KSP가 해당 타입을 확인(resolve)할 수 없었음을 의미합니다. 이 정보를 활용하여 처리를 이후 라운드로 미룰지 결정하세요.

## 파일 및 심볼 접근 {id="accessing-files-and-symbols"}

새로 생성된 파일과 기존 파일 모두 `Resolver`를 통해 접근할 수 있습니다.

KSP는 파일에 접근하기 위한 두 가지 API를 제공합니다:

* `Resolver.getAllFiles()`는 기존 파일과 새로 생성된 파일 모두의 목록을 반환합니다.
* `Resolver.getNewFiles()`는 이전 라운드에서 생성된 파일만 반환합니다.

관련 심볼을 가져오는 기본 진입점(entry point)으로 `Resolver.getSymbolsWithAnnotation()`을 사용하세요.

각 라운드에서 `Resolver.getSymbolsWithAnnotation()`은 새로 생성된 파일의 심볼과 이전 라운드에서 미뤄진 심볼만 반환합니다. 이를 통해 불필요한 재처리를 방지할 수 있습니다.

## 프로세서 인스턴스화 {id="processor-instantiation"}

KSP는 프로세서 인스턴스를 한 번만 생성합니다. 프로세서 인스턴스에 정보를 저장하고 여러 라운드에 걸쳐 재사용할 수 있습니다.

하지만 모든 KSP 심볼을 여러 라운드에 걸쳐 재사용할 수 있는 것은 아닙니다. 프로세서가 새 파일을 생성하면 심볼 확인 결과가 변경될 수 있으며, 이는 이전에 확인된 심볼의 유효성에 영향을 줄 수 있습니다.

> 현재 라운드에서 프로세서에 전달된 `Resolver` 인스턴스만 사용하세요. `Resolver`를 저장하여 라운드 간에 재사용하지 마세요.
>
{style="note"}

## 오류 및 예외 처리 {id="error-and-exception-handling"}

### 오류 {id="errors"}

프로세서는 `KSPLogger.error()`를 호출하여 오류를 보고합니다.

프로세서가 오류를 보고하면 KSP는 `SymbolProcessor.finish()` 대신 `SymbolProcessor.onError()`를 호출합니다. 현재 라운드가 완료된 후 처리가 중단됩니다.

해당 라운드 동안 다른 프로세서들은 정상적으로 처리를 계속합니다. KSP는 모든 프로세서가 현재 라운드를 마친 후에만 오류를 처리합니다.

### 예외 {id="exceptions"}

KSP는 KSP에서 발생한 예외와 프로세서에서 발생한 예외를 구분합니다. 두 유형 모두 처리를 즉시 종료하며 `KSPLogger`를 통해 오류로 기록됩니다.

KSP에서 발생한 예외는 조사를 위해 KSP 개발자에게 보고하세요. [KSP 이슈 트래커](https://github.com/google/ksp/issues)에 이슈를 생성하면 됩니다.

오류나 예외가 발생한 라운드의 끝에서, KSP는 모든 프로세서의 `SymbolProcessor.onError()`를 호출합니다. `SymbolProcessor`는 아무 작업도 하지 않는(no-op) `onError()`의 기본 구현을 제공합니다. 커스텀 오류 처리 로직을 구현하려면 이 메서드를 오버라이드하세요.

## 관련 항목 {id="see-also"}

* 소스 코드가 변경될 때 KSP가 [재처리할 파일을 결정하는 방법](ksp-incremental.md)을 알아보세요.
* KSP가 Kotlin 코드를 모델링하는 방법과 [타입을 확인(resolve)하는 시점](ksp-kotlin-model.md#when-to-resolve-types)을 알아보세요.