[//]: # (title: iOS 의존성 추가하기)

Apple SDK 의존성(Foundation 또는 Core Bluetooth 등)은 Kotlin Multiplatform 프로젝트에서 사전 빌드된(prebuilt) 라이브러리 세트로 제공됩니다. 추가 설정이 필요하지 않습니다.

또한 iOS 소스 세트에서 iOS 생태계의 다른 라이브러리 및 프레임워크를 재사용할 수 있습니다. Kotlin은 Objective-C 의존성 및 API가 `@objc` 어트리뷰트와 함께 Objective-C로 내보내진 Swift 의존성과의 상호운용성을 지원합니다. 순수 Swift 의존성은 아직 지원되지 않습니다.

Kotlin Multiplatform 프로젝트에서 iOS 의존성을 처리하려면, [cinterop 도구](#with-cinterop)를 사용해 관리하거나 [CocoaPods 의존성 관리자](#with-cocoapods)를 사용할 수 있습니다(순수 Swift Pod은 지원되지 않음).

### cinterop 사용하기 {id="with-cinterop"}

cinterop 도구를 사용하여 Objective-C 또는 Swift 선언에 대한 Kotlin 바인딩을 생성할 수 있습니다. 이를 통해 Kotlin 코드에서 해당 선언들을 호출할 수 있게 됩니다.

단계는 [라이브러리](#add-a-library)와 [프레임워크](#add-a-framework)에 따라 조금씩 다르지만, 일반적인 워크플로는 다음과 같습니다:

1. 의존성을 다운로드합니다.
2. 바이너리를 얻기 위해 빌드합니다.
3. cinterop에 이 의존성을 설명하는 특별한 `.def` [정의 파일(definition file)](https://kotlinlang.org/docs/native-definition-file.html)을 생성합니다.
4. 빌드 중에 바인딩이 생성되도록 빌드 스크립트를 조정합니다.

#### 라이브러리 추가하기 {id="add-a-library"}

1. 라이브러리 소스 코드를 다운로드하고 프로젝트에서 참조할 수 있는 위치에 둡니다.
2. 라이브러리를 빌드하고(일반적으로 라이브러리 작성자가 빌드 방법 가이드를 제공합니다) 바이너리 경로를 확인합니다.
3. 프로젝트에서 `.def` 파일(예: `DateTools.def`)을 생성합니다.
4. 이 파일의 첫 번째 줄에 `language = Objective-C`를 추가합니다. 순수 C 의존성을 사용하려는 경우 language 속성을 생략합니다.
5. 다음 두 가지 필수 속성에 값을 제공합니다:

    * `headers`: cinterop이 처리할 헤더를 기술합니다.
    * `package`: 이러한 선언들이 배치될 패키지 이름을 설정합니다.

   예:

    ```none
    headers = DateTools.h
    package = DateTools
    ```

6. 빌드 스크립트에 이 라이브러리와의 상호운용성에 대한 정보를 추가합니다:

    * `.def` 파일의 경로를 전달합니다. `.def` 파일 이름이 cinterop 이름과 같고 `src/nativeInterop/cinterop/` 디렉토리에 있는 경우 이 경로는 생략할 수 있습니다.
    * `includeDirs` 옵션을 사용하여 cinterop이 헤더 파일을 찾을 위치를 알려줍니다.
    * 라이브러리 바이너리에 대한 링크를 설정합니다.

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        iosArm64() {
            compilations.getByName("main") {
                val DateTools by cinterops.creating {
                    // .def 파일 경로
                    definitionFile.set(project.file("src/nativeInterop/cinterop/DateTools.def"))

                    // 헤더 검색을 위한 디렉토리 (-I<path> 컴파일러 옵션과 유사)
                    includeDirs("include/this/directory", "path/to/another/directory")
                }
                val anotherInterop by cinterops.creating { /* ... */ }
            }

            binaries.all {
                // 라이브러리에 링크하기 위해 필요한 링커 옵션.
                linkerOpts("-L/path/to/library/binaries", "-lbinaryname")
            }
        }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        iosArm64 {
            compilations.main {
                cinterops {
                    DateTools {
                        // .def 파일 경로
                        definitionFile = project.file("src/nativeInterop/cinterop/DateTools.def")

                        // 헤더 검색을 위한 디렉토리 (-I<path> 컴파일러 옵션과 유사)
                        includeDirs("include/this/directory", "path/to/another/directory")
                    }
                    anotherInterop { /* ... */ }
                }
            }

            binaries.all {
                // 라이브러리에 링크하기 위해 필요한 링커 옵션.
                linkerOpts "-L/path/to/library/binaries", "-lbinaryname"
            }
        }
    }
    ```

    </TabItem>
    </Tabs>

7. 프로젝트를 빌드합니다.

이제 Kotlin 코드에서 이 의존성을 사용할 수 있습니다. 이를 위해 `.def` 파일의 `package` 속성에서 설정한 패키지를 import 하세요. 위 예시의 경우 다음과 같습니다:

```kotlin
import DateTools.*
```

> [cinterop 도구와 libcurl 라이브러리를 사용하는 샘플 프로젝트](https://github.com/Kotlin/kotlin-hands-on-intro-kotlin-native)를 확인해 보세요.
>
{style="tip"}

#### 프레임워크 추가하기 {id="add-a-framework"}

1. 프레임워크 소스 코드를 다운로드하고 프로젝트에서 참조할 수 있는 위치에 둡니다.
2. 프레임워크를 빌드하고(일반적으로 프레임워크 작성자가 빌드 방법 가이드를 제공합니다) 바이너리 경로를 확인합니다.
3. 프로젝트에서 `.def` 파일(예: `MyFramework.def`)을 생성합니다.
4. 이 파일의 첫 번째 줄에 `language = Objective-C`를 추가합니다. 순수 C 의존성을 사용하려는 경우 language 속성을 생략합니다.
5. 다음 두 가지 필수 속성에 값을 제공합니다:

    * `modules` – cinterop이 처리해야 할 프레임워크의 이름입니다.
    * `package` – 이러한 선언들이 배치될 패키지 이름을 설정합니다.

    예:
    
    ```none
    modules = MyFramework
    package = MyFramework
    ```

6. 빌드 스크립트에 프레임워크와의 상호운용성에 대한 정보를 추가합니다:

    * .def 파일의 경로를 전달합니다. .def 파일 이름이 cinterop 이름과 같고 `src/nativeInterop/cinterop/` 디렉토리에 있는 경우 이 경로는 생략할 수 있습니다.
    * `-framework` 옵션을 사용하여 컴파일러와 링커에 프레임워크 이름을 전달합니다. `-F` 옵션을 사용하여 컴파일러와 링커에 프레임워크 소스 및 바이너리 경로를 전달합니다.

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        iosArm64() {
            compilations.getByName("main") {
                val DateTools by cinterops.creating {
                    // .def 파일 경로
                    definitionFile.set(project.file("src/nativeInterop/cinterop/DateTools.def"))

                    compilerOpts("-framework", "MyFramework", "-F/path/to/framework/")
                }
                val anotherInterop by cinterops.creating { /* ... */ }
            }

            binaries.all {
                // 링커에게 프레임워크가 위치한 곳을 알려줍니다.
                linkerOpts("-framework", "MyFramework", "-F/path/to/framework/")
            }
       }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        iosArm64 {
            compilations.main {
                cinterops {
                    DateTools {
                        // .def 파일 경로
                        definitionFile = project.file("src/nativeInterop/cinterop/MyFramework.def")

                        compilerOpts("-framework", "MyFramework", "-F/path/to/framework/")
                    }
                    anotherInterop { /* ... */ }
                }
            }

            binaries.all {
                // 링커에게 프레임워크가 위치한 곳을 알려줍니다.
                linkerOpts("-framework", "MyFramework", "-F/path/to/framework/")
            }
        }
    }
    ```

    </TabItem>
    </Tabs>

7. 프로젝트를 빌드합니다.

이제 Kotlin 코드에서 이 의존성을 사용할 수 있습니다. 이를 위해 `.def` 파일의 package 속성에서 설정한 패키지를 import 하세요. 위 예시의 경우 다음과 같습니다:

```kotlin
import MyFramework.*
```

[Swift/Objective-C 상호운용성](https://kotlinlang.org/docs/native-objc-interop.html) 및 [Gradle에서 cinterop 구성하기](multiplatform-dsl-reference.md#cinterops)에 대해 더 자세히 알아보세요.

### CocoaPods 사용하기 {id="with-cocoapods"}

1. [초기 CocoaPods 통합 설정](multiplatform-cocoapods-overview.md#set-up-an-environment-to-work-with-cocoapods)을 수행합니다.
2. 사용하려는 CocoaPods 저장소의 Pod 라이브러리에 대한 의존성을 추가하려면 프로젝트의 `build.gradle(.kts)`에 `pod()` 함수 호출을 포함합니다.

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        cocoapods {
            version = "2.0"
            //..
            pod("SDWebImage") {
                version = "5.20.0"
            }
        }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        cocoapods {
            version = '2.0'
            //..
            pod('SDWebImage') {
                version = '5.20.0'
            }
        }
    }
    ```

    </TabItem>
    </Tabs>

   다음과 같은 방식으로 Pod 라이브러리에 대한 의존성을 추가할 수 있습니다:

   * [CocoaPods 저장소로부터 추가](multiplatform-cocoapods-libraries.md#from-the-cocoapods-repository)
   * [로컬에 저장된 라이브러리 추가](multiplatform-cocoapods-libraries.md#on-a-locally-stored-library)
   * [커스텀 Git 저장소로부터 추가](multiplatform-cocoapods-libraries.md#from-a-custom-git-repository)
   * [커스텀 Podspec 저장소로부터 추가](multiplatform-cocoapods-libraries.md#from-a-custom-podspec-repository)
   * [커스텀 cinterop 옵션과 함께 추가](multiplatform-cocoapods-libraries.md#with-custom-cinterop-options)

3. 프로젝트를 다시 가져오기 위해 IntelliJ IDEA에서 **Build** | **Reload All Gradle Projects**를 실행합니다(또는 Android Studio에서 **File** | **Sync Project with Gradle Files** 실행).

Kotlin 코드에서 의존성을 사용하려면 `cocoapods.<library-name>` 패키지를 import 하세요. 위 예시의 경우 다음과 같습니다:

```kotlin
import cocoapods.SDWebImage.*
```

> * [Kotlin 프로젝트에서 설정된 다양한 Pod 의존성](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)이 포함된 샘플 프로젝트를 확인해 보세요.
> * [여러 타겟을 가진 Xcode 프로젝트가 Kotlin 라이브러리에 의존하는](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample) 샘플 프로젝트를 확인해 보세요.
> 
{style="tip"}

## 다음 단계는? {id="what-s-next"}

멀티플랫폼 프로젝트에서 의존성을 추가하는 다른 리소스를 확인하고 다음에 대해 더 자세히 알아보세요:

* [플랫폼 라이브러리 연결하기](https://kotlinlang.org/docs/native-platform-libs.html)
* [멀티플랫폼 라이브러리 또는 다른 멀티플랫폼 프로젝트에 대한 의존성 추가하기](multiplatform-add-dependencies.md)
* [Android 의존성 추가하기](multiplatform-android-dependencies.md)