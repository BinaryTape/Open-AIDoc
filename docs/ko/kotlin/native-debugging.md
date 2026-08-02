[//]: # (title: Kotlin/Native 디버깅)

Kotlin/Native 컴파일러는 디버그 정보가 포함된 바이너리를 생성할 수 있으며, [크래시 리포트 심볼화(symbolicating crash reports)](#debug-ios-applications)를 위한 디버그 심볼 파일을 만들 수도 있습니다.

디버그 정보는 [DWARF 2](https://dwarfstd.org/download.html) 사양과 호환되므로, LLDB 및 GDB와 같은 최신 디버거 도구를 사용하여 다음 작업을 수행할 수 있습니다:

* [중단점(breakpoint) 설정](#set-breakpoints)
* [스테핑(stepping) 사용](#use-stepping)
* [변수 및 타입 정보 조사](#inspect-variables)

> DWARF 2 사양을 지원한다는 것은 디버거 도구가 Kotlin을 C89로 인식함을 의미합니다. 이는 DWARF 5 사양 이전까지는 사양 내에 Kotlin 언어 유형에 대한 식별자가 없기 때문입니다.
>
{style="note"}

## 디버그 정보가 포함된 바이너리 생성

IntelliJ IDEA, Android Studio 또는 Xcode에서 디버깅할 때, 디버그 정보가 포함된 바이너리는 자동으로 생성됩니다(빌드가 다르게 구성되지 않은 경우).

다음 방법을 통해 수동으로 디버깅을 활성화하고 디버그 정보가 포함된 바이너리를 생성할 수 있습니다:

* **Gradle 태스크 사용**. 디버그 바이너리를 얻으려면 `linkDebug*` Gradle 태스크를 사용하세요. 예:

  ```bash
  ./gradlew linkDebugFrameworkNative
  ```

  태스크는 바이너리 타입(예: `linkDebugSharedNative`) 또는 타겟(예: `linkDebugExecutableMacosArm64`)에 따라 달라집니다.

* **명령줄 컴파일러 사용**. 명령줄에서 Kotlin/Native 바이너리를 컴파일할 때 `-g` 옵션을 추가하세요:

  ```bash
  kotlinc-native hello.kt -g -o terminator
  ```

그 후 디버거 도구를 실행합니다. 예:

```bash
lldb terminator.kexe
```

디버거 출력 결과:

```bash
$ cat - > hello.kt
fun main(args: Array<String>) {
  println("Hello world")
  println("I need your clothes, your boots and your motorcycle")
}
$ dist/bin/konanc -g hello.kt -o terminator
KtFile: hello.kt
$ lldb terminator.kexe
(lldb) target create "terminator.kexe"
Current executable set to 'terminator.kexe' (x86_64).
(lldb) b kfun:main(kotlin.Array<kotlin.String>)
Breakpoint 1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
(lldb) r
Process 28473 launched: '/Users/minamoto/ws/.git-trees/debugger-fixes/terminator.kexe' (x86_64)
Process 28473 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00000001000012e4 terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) at hello.kt:2
   1    fun main(args: Array<String>) {
-> 2      println("Hello world")
   3      println("I need your clothes, your boots and your motorcycle")
   4    }
(lldb) n
Hello world
Process 28473 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = step over
    frame #0: 0x00000001000012f0 terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) at hello.kt:3
   1    fun main(args: Array<String>) {
   2      println("Hello world")
-> 3      println("I need your clothes, your boots and your motorcycle")
   4    }
(lldb)
```

## 중단점 설정

최신 디버거는 중단점(breakpoint)을 설정하는 여러 가지 방법을 제공합니다. 도구별 상세 방법은 다음과 같습니다:

### LLDB

* 이름으로 설정:

  ```bash
  (lldb) b -n kfun:main(kotlin.Array<kotlin.String>)
  Breakpoint 4: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
  ```

  `-n`은 선택 사항이며 기본적으로 적용됩니다.

* 위치(파일명, 라인 번호)로 설정:

  ```bash
  (lldb) b -f hello.kt -l 1
  Breakpoint 1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
  ```

* 주소로 설정:

  ```bash
  (lldb) b -a 0x00000001000012e4
  Breakpoint 2: address = 0x00000001000012e4
  ```

* 정규표현식(regex)으로 설정. 람다(이름에 `#` 기호가 포함됨)와 같이 생성된 아티팩트를 디버깅할 때 유용할 수 있습니다:

  ```bash
  (lldb) b -r main\(
  3: regex = 'main\(', locations = 1
    3.1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = terminator.kexe[0x00000001000012e4], unresolved, hit count = 0
  ```

### GDB

* 정규표현식으로 설정:

  ```bash
  (gdb) rbreak main(
  Breakpoint 1 at 0x1000109b4
  struct ktype:kotlin.Unit &kfun:main(kotlin.Array<kotlin.String>);
  ```

* `:`가 위치 기반 중단점의 구분자로 사용되기 때문에 이름으로 설정하는 것은 **불가능**합니다:

  ```bash
  (gdb) b kfun:main(kotlin.Array<kotlin.String>)
  No source file named kfun.
  Make breakpoint pending on future shared library load? (y or [n]) y
  Breakpoint 1 (kfun:main(kotlin.Array<kotlin.String>)) pending
  ```

* 위치로 설정:

  ```bash
  (gdb) b hello.kt:1
  Breakpoint 2 at 0x100001704: file /Users/minamoto/ws/.git-trees/hello.kt, line 1.
  ```

* 주소로 설정:

  ```bash
  (gdb) b *0x100001704
  Note: breakpoint 2 also set at pc 0x100001704.
  Breakpoint 3 at 0x100001704: file /Users/minamoto/ws/.git-trees/hello.kt, line 2.
  ```

## 스테핑 사용

함수를 단계별로 실행하는 스테핑(stepping)은 C/C++ 프로그램과 거의 동일하게 작동합니다.

## 변수 조사

`var` 변수에 대한 변수 조사(variable inspection)는 프리미티브(primitive) 및 비프리미티브 타입 모두에서 기본적으로 작동합니다:

```bash
$ cat -n main.kt
     1  fun main(args: Array<String>) {
     2      var x = 1
     3      var y = 2
     4      var p = Point(x, y)
     5      println("p = $p")
     6  }
     7 
     8  data class Point(val x: Int, val y: Int)

$ lldb ./program.kexe -o 'b main.kt:5' -o
(lldb) target create "./program.kexe"
Current executable set to './program.kexe' (x86_64).
(lldb) b main.kt:5
Breakpoint 1: where = program.kexe`kfun:main(kotlin.Array<kotlin.String>) + 289 at main.kt:5
(lldb) r
Process 4985 stopped
* thread #1, name = 'program.kexe', stop reason = breakpoint 1.1
    frame #0: program.kexe`kfun:main(kotlin.Array<kotlin.String>) at main.kt:5
   2        var x = 1
   3        var y = 2
   4        var p = Point(x, y)
-> 5        println("p = $p")
   6    }
   7   
   8    data class Point(val x: Int, val y: Int)

Process 4985 launched: './program.kexe' (x86_64)
(lldb) fr var
(int) x = 1
(int) y = 2
(ObjHeader *) p = Point(x=1, y=2)

(lldb) v p->x
(int32_t) p->x = 1
```

## iOS 애플리케이션 디버깅

iOS 애플리케이션을 디버깅할 때 가끔 크래시 리포트를 상세히 분석해야 할 때가 있습니다. 크래시 리포트에는 일반적으로 메모리 주소를 읽을 수 있는 소스 코드 위치로 변환하는 과정인 심볼화(symbolication)가 필요합니다.

Kotlin 코드의 주소를 심볼화하려면(예: Kotlin 코드에 해당하는 스택 트레이스 요소의 경우), 특수한 디버그 심볼(`.dSYM`) 파일이 필요합니다. 이 파일은 크래시 리포트의 메모리 주소를 함수나 라인 번호와 같은 실제 소스 코드 위치와 매핑합니다.

Kotlin/Native 컴파일러는 기본적으로 Apple 플랫폼용 릴리스(최적화된) 바이너리에 대해 `.dSYM` 파일을 생성합니다. Xcode에서 빌드할 때, IDE는 표준 위치에서 `.dSYM` 파일을 찾아 자동으로 심볼화에 사용합니다. Xcode는 IntelliJ IDEA 템플릿으로 생성된 프로젝트에서 `.dSYM` 파일을 자동으로 감지합니다.

다른 플랫폼에서는 `-Xadd-light-debug` 컴파일러 옵션을 사용하여 생성된 바이너리에 디버그 정보를 추가할 수 있습니다(이 경우 바이너리 크기가 증가합니다):

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget> {
        binaries.all {
            freeCompilerArgs += "-Xadd-light-debug=enable"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    targets.withType(org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget) {
        binaries.all {
            freeCompilerArgs += "-Xadd-light-debug=enable"
        }
    }
}
```

</tab>
</tabs>

크래시 리포트에 대한 자세한 정보는 [Apple 문서](https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs)를 참조하세요.

## 알려진 문제

* Python 바인딩의 성능 문제.
* 디버거 도구에서의 식별자 평가(expression evaluation)는 지원되지 않으며, 현재 이를 구현할 계획은 없습니다.

## 다음 단계

[iOS 코드에서 처리되지 않은 Kotlin 예외에 대한 크래시 리포트를 개선하는 방법 알아보기](native-faq.md#how-do-i-get-better-crash-reports-for-ios)