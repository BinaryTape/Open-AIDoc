[//]: # (title: 소스 세트 계층 구조)

Kotlin Multiplatform 프로젝트는 계층적 소스 세트(source set) 구조를 지원합니다.
이는 [지원되는 타깃](multiplatform-dsl-reference.md#targets) 전체가 아닌 일부 타깃 간에 공통 코드를 공유할 수 있도록 중간 소스 세트 계층을 구성할 수 있음을 의미합니다. 중간 소스 세트를 사용하면 다음과 같은 이점이 있습니다.

* 특정 타깃을 위한 API 제공: 예를 들어 라이브러리는 Kotlin/JVM 타깃을 제외하고 Kotlin/Native 타깃을 위한 중간 소스 세트에 네이티브 전용 API를 추가할 수 있습니다.
* 특정 타깃을 위한 API 활용: 예를 들어 중간 소스 세트를 구성하는 특정 타깃들을 위해 Kotlin Multiplatform 라이브러리가 제공하는 풍부한 API를 활용할 수 있습니다.
* 프로젝트에서 플랫폼 종속 라이브러리 사용: 예를 들어 중간 iOS 소스 세트에서 iOS 전용 디펜던시에 접근할 수 있습니다.

Kotlin 툴체인은 각 소스 세트가 해당 소스 세트가 컴파일되는 모든 타깃에서 사용할 수 있는 API에만 접근할 수 있도록 보장합니다. 이를 통해 Windows 전용 API를 사용한 후 macOS로 컴파일하여 런타임에 링키지 오류나 정의되지 않은 동작(undefined behavior)이 발생하는 것과 같은 상황을 방지합니다.

소스 세트 계층 구조를 설정하는 권장 방법은 [기본 계층 템플릿(default hierarchy template)](#default-hierarchy-template)을 사용하는 것입니다.
이 템플릿은 가장 일반적인 사용 사례들을 다룹니다. 더 고급 프로젝트의 경우 [수동으로 구성](#manual-configuration)할 수도 있습니다.
이는 더 로우레벨(low-level) 방식이며, 유연성이 높지만 더 많은 노력과 지식이 필요합니다.

## 기본 계층 템플릿 {id="default-hierarchy-template"}

Kotlin Gradle 플러그인에는 내장된 기본 [계층 템플릿](#see-the-full-hierarchy-template)이 있습니다.
여기에는 몇 가지 일반적인 사용 사례에 맞게 미리 정의된 중간 소스 세트가 포함되어 있습니다.
플러그인은 프로젝트에 지정된 타깃을 기반으로 이러한 소스 세트를 자동으로 설정합니다.

공유 코드가 포함된 프로젝트 모듈의 다음 `build.gradle(.kts)` 파일을 살펴보겠습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
</Tabs>

코드에서 `android`, `iosArm64`, `iosSimulatorArm64` 타깃을 선언하면, Kotlin Gradle 플러그인은 템플릿에서 적합한 공유 소스 세트를 찾아 자동으로 생성해 줍니다. 결과 계층 구조는 다음과 같습니다.

![기본 계층 템플릿 사용 예시](default-hierarchy-example.svg)

색상이 칠해진 소스 세트는 실제로 생성되어 프로젝트에 존재하는 것이며, 기본 템플릿에서 회색으로 표시된 소스 세트는 무시됩니다. 예를 들어 프로젝트에 watchOS 타깃이 없기 때문에 Kotlin Gradle 플러그인은 `watchos` 소스 세트를 생성하지 않았습니다.

만약 `watchosArm64`와 같은 watchOS 타깃을 추가하면 `watchos` 소스 세트가 생성되며, `apple`, `native`, `common` 소스 세트의 코드도 `watchosArm64`로 컴파일됩니다.

Kotlin Gradle 플러그인은 기본 계층 템플릿의 모든 소스 세트에 대해 타입 안전(type-safe) 및 정적 접근자(static accessor)를 모두 제공하므로, [수동 구성](#manual-configuration)과 달리 `by getting`이나 `by creating` 구문 없이도 해당 소스 세트를 참조할 수 있습니다.

해당 타깃을 먼저 선언하지 않고 공유 모듈의 `build.gradle(.kts)` 파일에서 소스 세트에 접근하려고 하면 경고가 표시됩니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        // 경고: 타깃을 선언하지 않고 소스 세트에 접근함
        linuxX64Main { }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        // 경고: 타깃을 선언하지 않고 소스 세트에 접근함
        linuxX64Main { }
    }
}
```

</TabItem>
</Tabs>

> 이 예시에서 `apple`과 `native` 소스 세트는 `iosArm64` 및 `iosSimulatorArm64` 타깃으로만 컴파일됩니다.
> 이름과 달리 이 소스 세트들은 전체 iOS API에 접근할 수 있습니다.
> 이는 모든 네이티브 타깃에서 사용 가능한 API만 이 소스 세트에서 접근할 수 있을 것이라 기대할 수 있는 `native`와 같은 소스 세트의 경우 직관적이지 않을 수 있습니다. 이 동작은 향후 변경될 수 있습니다.
>
{style="note"}

### 추가 구성 {id="additional-configuration"}

기본 계층 템플릿을 조정해야 할 수도 있습니다. 이전에 `dependsOn` 호출을 사용하여 중간 소스 세트를 [수동으로](#manual-configuration) 도입한 경우 기본 계층 템플릿 사용이 취소되고 다음과 같은 경고가 발생합니다.

```none
The Default Kotlin Hierarchy Template was not applied to '<project-name>':
Explicit .dependsOn() edges were configured for the following source sets:
[<... names of the source sets with manually configured dependsOn-edges...>]

Consider removing dependsOn-calls or disabling the default template by adding
    'kotlin.mpp.applyDefaultHierarchyTemplate=false'
to your gradle.properties

Learn more about hierarchy templates: https://kotl.in/hierarchy-template
```

이 문제를 해결하려면 다음 중 하나를 수행하여 프로젝트를 구성하세요.

* [수동 구성을 기본 계층 템플릿으로 대체](#replacing-a-manual-configuration)
* [기본 계층 템플릿에 추가 소스 세트 생성](#creating-additional-source-sets)
* [기본 계층 템플릿에 의해 생성된 소스 세트 수정](#modifying-source-sets)

#### 수동 구성 대체 {id="replacing-a-manual-configuration"}

**상황**. 모든 중간 소스 세트가 현재 기본 계층 템플릿에서 지원되는 경우.

**해결 방법**. 공유 모듈의 `build.gradle(.kts)` 파일에서 모든 수동 `dependsOn()` 호출과 `by creating` 구문으로 된 소스 세트를 제거합니다. 모든 기본 소스 세트 목록을 확인하려면 [전체 계층 템플릿](#see-the-full-hierarchy-template)을 참조하세요.

#### 추가 소스 세트 생성 {id="creating-additional-source-sets"}

**상황**. macOS 타깃과 JVM 타깃 사이의 소스 세트처럼 기본 계층 템플릿이 아직 제공하지 않는 소스 세트를 추가하려는 경우.

**해결 방법**:

1. 공유 모듈의 `build.gradle(.kts)` 파일에서 `applyDefaultHierarchyTemplate()`을 명시적으로 호출하여 템플릿을 다시 적용합니다.
2. `dependsOn()`을 사용하여 [수동으로](#manual-configuration) 추가 소스 세트를 구성합니다.

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // 기본 계층을 다시 적용합니다. 예를 들어 iosMain 소스 세트가 생성됩니다.
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 추가 jvmAndMacos 소스 세트 생성:
            val jvmAndMacos by creating {
                dependsOn(commonMain.get())
            }
    
            macosArm64Main.get().dependsOn(jvmAndMacos)
            jvmMain.get().dependsOn(jvmAndMacos)
        }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // 기본 계층을 다시 적용합니다. 예를 들어 iosMain 소스 세트가 생성됩니다.
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 추가 jvmAndMacos 소스 세트 생성:
            jvmAndMacos {
                dependsOn(commonMain.get())
            }
            macosArm64Main {
                dependsOn(jvmAndMacos.get())
            }
            jvmMain {
                dependsOn(jvmAndMacos.get())
            }
        } 
    }
    ```

    </TabItem>
    </Tabs>

#### 소스 세트 수정 {id="modifying-source-sets"}

**상황**. 템플릿에서 생성된 것과 정확히 동일한 이름을 가진 소스 세트가 이미 있지만, 프로젝트의 서로 다른 타깃 세트 간에 공유되는 경우. 예를 들어 `nativeMain` 소스 세트가 데스크톱 전용 타깃인 `linuxX64`, `mingwX64`, `macosArm64` 사이에서만 공유되는 경우입니다.

**해결 방법**. 현재로서는 템플릿의 소스 세트 간 기본 `dependsOn` 관계를 수정할 수 있는 방법이 없습니다. 또한 모든 프로젝트에서 `nativeMain`과 같은 소스 세트의 구현과 의미가 동일하게 유지되는 것이 중요합니다.

하지만 다음과 같은 대안을 사용할 수 있습니다.

* 기본 계층 템플릿에서 목적에 맞는 다른 소스 세트를 찾거나 직접 수동으로 생성합니다.
* `gradle.properties` 파일에 `kotlin.mpp.applyDefaultHierarchyTemplate=false`를 추가하여 템플릿 사용을 완전히 비활성화하고 모든 소스 세트를 수동으로 구성합니다.

> 현재 사용자 정의 계층 템플릿을 생성할 수 있는 API를 개발 중입니다. 이는 계층 구성이 기본 템플릿과 크게 다른 프로젝트에 유용할 것입니다.
>
> 이 API는 아직 완성되지 않았지만 사용해보고 싶다면 `applyHierarchyTemplate {}` 블록과 `KotlinHierarchyTemplate.default` 선언을 예시로 참고하세요.
> 이 API는 아직 개발 중이므로 테스트되지 않았을 수 있으며 향후 릴리스에서 변경될 수 있습니다.
>
{style="tip"}

#### 전체 계층 템플릿 보기 {initial-collapse-state="collapsed" collapsible="true" id="see-the-full-hierarchy-template"}

프로젝트가 컴파일될 타깃을 선언하면 플러그인은 템플릿에서 지정된 타깃을 기반으로 공유 소스 세트를 선택하여 프로젝트에 생성합니다.

![기본 계층 템플릿](full-template-hierarchy.svg)

> 이 예시는 `Main` 접미사를 생략하고 프로젝트의 프로덕션 부분만 보여줍니다(예: `commonMain` 대신 `common` 사용). 하지만 `*Test` 소스에도 모두 동일하게 적용됩니다.
>
{style="tip"}

## 수동 구성 {id="manual-configuration"}

소스 세트 구조에 중간 소스 세트를 수동으로 도입할 수 있습니다.
이 소스 세트는 여러 타깃을 위한 공유 코드를 보유하게 됩니다.

예를 들어 네이티브 Linux, Windows 및 macOS 타깃(`linuxX64`, `mingwX64`, `macosArm64`) 간에 코드를 공유하려는 경우 수행할 작업은 다음과 같습니다.

1. 공유 모듈의 `build.gradle(.kts)` 파일에서 이러한 타깃의 공유 로직을 보유할 중간 소스 세트 `myDesktopMain`을 추가합니다.
2. `dependsOn` 관계를 사용하여 소스 세트 계층을 설정합니다. `commonMain`을 `myDesktopMain`과 연결한 다음, `myDesktopMain`을 각 타깃 소스 세트와 연결합니다.

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">
    
    ```kotlin
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            val myDesktopMain by creating {
                dependsOn(commonMain.get())
            }
    
            linuxX64Main.get().dependsOn(myDesktopMain)
            mingwX64Main.get().dependsOn(myDesktopMain)
            macosArm64Main.get().dependsOn(myDesktopMain)
        }
    }
    ```
    
    </TabItem>
    <TabItem title="Groovy" group-key="groovy">
    
    ```groovy
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            myDesktopMain {
                dependsOn(commonMain.get())
            }
            linuxX64Main {
                dependsOn(myDesktopMain)
            }
            mingwX64Main {
                dependsOn(myDesktopMain)
            }
            macosArm64Main {
                dependsOn(myDesktopMain)
            }
        }
    }
    ```
    
    </TabItem>
    </Tabs>

결과 계층 구조는 다음과 같습니다.

![수동으로 구성된 계층 구조](manual-hierarchical-structure.svg)

다음 타깃 조합에 대해 공유 소스 세트를 구성할 수 있습니다.

* JVM 또는 Android + Web + Native
* JVM 또는 Android + Native
* Web + Native
* JVM 또는 Android + Web
* Native

Kotlin은 현재 다음 조합에 대한 소스 세트 공유를 지원하지 않습니다.

* 여러 JVM 타깃
* JVM + Android 타깃
* 여러 JS 타깃

공유 네이티브 소스 세트에서 플랫폼별 API에 접근해야 하는 경우, IntelliJ IDEA는 공유 네이티브 코드에서 사용할 수 있는 공통 선언을 감지하도록 도와줍니다.
다른 경우에는 Kotlin의 [기대 및 실제 선언(expected and actual declarations)](multiplatform-expect-actual.md) 메커니즘을 사용하세요.