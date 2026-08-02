[//]: # (title: 멀티플랫폼 라이브러리 의존성 추가하기)

모든 프로그램은 성공적으로 작동하기 위해 일련의 라이브러리가 필요합니다. 코틀린 멀티플랫폼(Kotlin Multiplatform) 프로젝트는 모든 타겟 플랫폼에서 작동하는 멀티플랫폼 라이브러리, 플랫폼 전용 라이브러리, 그리고 다른 멀티플랫폼 프로젝트에 의존할 수 있습니다.

의존성을 추가하려면, 공유 코드가 포함된 프로젝트 디렉터리의 `build.gradle(.kts)` 파일을 업데이트하세요. [`dependencies {}`](multiplatform-dsl-reference.md#dependencies) 블록에서 필요한 [유형](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)(예: `implementation`)의 의존성을 설정합니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0") // 모든 소스 세트에서 공유되는 라이브러리
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 코틀린 라이브러리 의존성

### 표준 라이브러리

각 소스 세트(source set)에 대한 표준 라이브러리(`stdlib`) 의존성은 자동으로 추가됩니다. 표준 라이브러리의 버전은 `kotlin-multiplatform` 플러그인의 버전과 동일합니다.

플랫폼 전용 소스 세트의 경우 해당 플랫폼에 맞는 라이브러리 변체(variant)가 사용되며, 나머지에는 공통 표준 라이브러리가 추가됩니다. 코틀린 Gradle 플러그인은 Gradle 빌드 스크립트의 `compilerOptions.jvmTarget` [컴파일러 옵션](https://kotlinlang.org/docs/gradle-compiler-options.html)에 따라 적절한 JVM 표준 라이브러리를 선택합니다.

[기본 동작을 변경하는 방법](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)을 알아보세요.

### 테스트 라이브러리

멀티플랫폼 테스트를 위해 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API를 사용할 수 있습니다. 멀티플랫폼 프로젝트를 생성할 때, `commonTest`에서 단일 의존성을 사용하여 모든 소스 세트에 테스트 의존성을 추가할 수 있습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 모든 플랫폼 의존성을 자동으로 가져옵니다
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 모든 플랫폼 의존성을 자동으로 가져옵니다
            }
        }
    }
}
```

</TabItem>
</Tabs>

### kotlinx 라이브러리

멀티플랫폼 라이브러리를 사용하고 [공유 코드에 의존](#library-shared-for-all-source-sets)해야 하는 경우, 공유 소스 세트에서 의존성을 한 번만 설정하세요. `kotlinx-coroutines-core`와 같은 라이브러리 기본 아티팩트(artifact) 이름을 사용하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</TabItem>
</Tabs>

[플랫폼 전용 의존성](#library-used-in-specific-source-sets)을 위해 kotlinx 라이브러리가 필요한 경우에도, 해당 플랫폼 소스 세트에서 라이브러리의 기본 아티팩트 이름을 사용할 수 있습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 코틀린 멀티플랫폼 라이브러리 의존성

[SQLDelight](https://github.com/cashapp/sqldelight)와 같이 코틀린 멀티플랫폼 기술을 채택한 라이브러리에 의존성을 추가할 수 있습니다. 이러한 라이브러리의 작성자는 보통 프로젝트에 의존성을 추가하기 위한 가이드를 제공합니다.

> [klibs.io](https://klibs.io/)에서 사용 가능한 코틀린 멀티플랫폼 라이브러리를 찾아보세요.
>
{style="tip"}

### 모든 소스 세트에서 공유되는 라이브러리

모든 소스 세트에서 라이브러리를 사용하려는 경우, 공통 소스 세트에만 추가하면 됩니다. 코틀린 멀티플랫폼 Gradle 플러그인이 다른 소스 세트에도 해당하는 부분을 자동으로 추가합니다.

> 공통 소스 세트에서는 플랫폼 전용 라이브러리에 대한 의존성을 설정할 수 없습니다.
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("io.ktor:ktor-client-core:%ktorVersion%")
        }
        androidMain.dependencies {
            // ktor-client의 플랫폼 부분에 대한 의존성이 자동으로 추가됩니다
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'io.ktor:ktor-client-core:%ktorVersion%'
            }
        }
        androidMain {
            dependencies {
                // ktor-client의 플랫폼 부분에 대한 의존성이 자동으로 추가됩니다
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 최상위 `dependencies {}` 블록에서도 공통 라이브러리를 구성할 수 있습니다. [최상위 레벨에서 의존성 구성하기](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)를 참조하세요.
> 
{style="tip"}

### 특정 소스 세트에서 사용되는 라이브러리

특정 소스 세트에서만 멀티플랫폼 라이브러리를 사용하려는 경우, 해당 소스 세트에만 전용으로 추가할 수 있습니다. 그러면 지정된 라이브러리 선언은 해당 소스 세트에서만 사용할 수 있게 됩니다.

> 이런 경우에는 플랫폼 전용 이름이 아닌 공통 라이브러리 이름을 사용하세요. 아래 예제의 SQLDelight와 같이 `native-driver-iosx64`가 아닌 `native-driver`를 사용하세요. 정확한 이름은 라이브러리의 문서에서 확인하세요.
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines는 모든 소스 세트에서 사용할 수 있습니다
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        androidMain.dependencies {

        }
        iosMain.dependencies {
            // SQLDelight는 iOS 소스 세트에서만 사용할 수 있으며, Android나 common에서는 사용할 수 없습니다
            implementation("com.squareup.sqldelight:native-driver:%sqlDelightVersion%")
        }
        wasmJsMain.dependencies {
            
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                // kotlinx.coroutines는 모든 소스 세트에서 사용할 수 있습니다
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        androidMain {
            dependencies {}
        }
        iosMain {
            dependencies {
                // SQLDelight는 iOS 소스 세트에서만 사용할 수 있으며, Android나 common에서는 사용할 수 없습니다
                implementation 'com.squareup.sqldelight:native-driver:%sqlDelightVersion%'
            }
        }
        wasmJsMain {
            dependencies {}
        }
    }
}
```

</TabItem>
</Tabs>

## 다른 멀티플랫폼 프로젝트에 대한 의존성

하나의 멀티플랫폼 프로젝트를 다른 프로젝트의 의존성으로 연결할 수 있습니다. 이를 위해 의존성이 필요한 소스 세트에 프로젝트 의존성을 추가하기만 하면 됩니다. 모든 소스 세트에서 의존성을 사용하려면 공통 소스 세트에 추가하세요. 이 경우 다른 소스 세트들은 자동으로 해당 버전을 가져오게 됩니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(project(":some-other-multiplatform-module"))
        }
        androidMain.dependencies {
            // :some-other-multiplatform-module의 플랫폼 부분이 자동으로 추가됩니다
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation project(':some-other-multiplatform-module')
            }
        }
        androidMain {
            dependencies {
                // :some-other-multiplatform-module의 플랫폼 부분이 자동으로 추가됩니다
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 다음 단계

멀티플랫폼 프로젝트에서 의존성을 추가하는 방법에 대한 다른 리소스를 확인하고 다음 내용에 대해 자세히 알아보세요.

* [안드로이드(Android) 의존성 추가하기](multiplatform-android-dependencies.md)
* [iOS 의존성 추가하기](multiplatform-ios-dependencies.md)
* [iOS, Android, 데스크톱 및 웹을 타겟으로 하는 Compose Multiplatform 프로젝트에서 의존성 추가하기](compose-multiplatform-modify-project.md#add-a-new-dependency)