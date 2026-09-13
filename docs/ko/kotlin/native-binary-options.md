[//]: # (title: Kotlin/Native 바이너리 옵션)

이 페이지에서는 Kotlin/Native [최종 바이너리](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)를 구성하는 데 사용할 수 있는 유용한 Kotlin/Native 바이너리 옵션 목록과 프로젝트에서 바이너리 옵션을 설정하는 방법을 설명합니다.

## 활성화 방법 {id="how-to-enable"}

`gradle.properties` 파일, 빌드 파일에서 바이너리 옵션을 활성화하거나 컴파일러 인수로 전달할 수 있습니다.

### Gradle 속성에서 설정 {id="in-gradle-properties"}

프로젝트의 `gradle.properties` 파일에서 `kotlin.native.binary` 속성을 사용하여 바이너리 옵션을 설정할 수 있습니다. 예를 들면 다음과 같습니다:

```none
kotlin.native.binary.latin1Strings=true
```

### 빌드 파일에서 설정 {id="in-your-build-file"}

`build.gradle.kts` 파일에서 프로젝트의 바이너리 옵션을 설정할 수 있습니다:

* `binaryOption` 속성을 사용하여 특정 바이너리에 대해 설정합니다. 예를 들면 다음과 같습니다:

  ```kotlin
  kotlin {
      iosArm64 {
          binaries {
              framework {
                  binaryOption("smallBinary", "true")
              }
          }
      }
  }
  ```

* `freeCompilerArgs` 속성에서 `-Xbinary=$option=$value` 컴파일러 옵션으로 설정합니다. 예를 들면 다음과 같습니다:

  ```kotlin
  kotlin {
      iosArm64 {
          compilations.configureEach {
              compilerOptions.configure {
                  freeCompilerArgs.add("-Xbinary=smallBinary=true")
              }
          }
      }
  }
  ```

### 커맨드 라인 컴파일러에서 설정 {id="in-the-command-line-compiler"}

[Kotlin/Native 컴파일러](native-get-started.md#using-the-command-line-compiler)를 실행할 때 커맨드 라인에서 직접 `-Xbinary=$option=$value`를 사용하여 바이너리 옵션을 전달할 수 있습니다.
예를 들면 다음과 같습니다:

```bash
kotlinc-native main.kt -Xbinary=enableSafepointSignposts=true
```

## 바이너리 옵션 {id="binary-options"}

> 아래 표는 기존의 모든 옵션을 나열한 것이 아니며, 가장 주목할 만한 옵션들만 포함하고 있습니다.
>
{style="note"}

<table sticky-header="true">
    <tr>
        <td width="100">Option</td>
        <td width="50">Values</td>
        <td width="150">Description</td>
        <td width="80">Status</td>
    </tr>
    <tr>
        <td><a href="native-improving-compilation-time.md#enable-caches-for-release-binaries"><code>enableReleaseBinaryCache</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (기본값)</li>
            </list>
        </td>
        <td>컴파일러가 릴리스 모드에서 캐시를 사용하도록 활성화하여, 일부 컴파일러 최적화를 희생하는 대신 빌드 속도를 높입니다.</td>
        <td>2.4.20부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-objc-interop.md#explicit-parameter-names-in-objective-c-block-types"><code>objcExportBlockExplicitParameterNames</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false (기본값)</code></li>
            </list>
        </td>
        <td>내보낸 Objective-C 헤더의 함수 타입에 명시적인 파라미터 이름을 추가합니다.</td>
        <td>2.2.20부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><a href="whatsnew2220.md#smaller-binary-size-for-release-binaries"><code>smallBinary</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (기본값)</li>
            </list>
        </td>
        <td>릴리스 바이너리의 크기를 줄입니다.</td>
        <td>2.2.20부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><a href="whatsnew2220.md#support-for-stack-canaries-in-binaries"><code>stackProtector</code></a></td>
        <td>
            <list>
                <li><code>yes</code></li>
                <li><code>strong</code></li>
                <li><code>all</code></li>
                <li><code>no</code> (기본값)</li>
            </list>
        </td>
        <td>스택 카나리(stack canary)를 활성화합니다: 취약한 함수에는 <code>yes</code>, 모든 함수에는 <code>all</code>을 사용하며, 더 강력한 휴리스틱을 사용하려면 <code>strong</code>을 사용합니다.</td>
        <td>2.2.20부터 사용 가능</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#disable-allocator-paging"><code>pagedAllocator</code></a></td>
        <td>
            <list>
                <li><code>true</code> (기본값)</li>
                <li><code>false</code></li>
            </list>
        </td>
        <td>할당 페이징(버퍼링)을 제어합니다. <code>false</code>인 경우 메모리 할당자는 객체별로 메모리를 예약합니다.</td>
        <td>2.2.0부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#enable-support-for-latin-1-strings"><code>latin1Strings</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (기본값)</li>
            </list>
        </td>
        <td>애플리케이션 바이너리 크기를 줄이고 메모리 소비를 조정하기 위해 Latin-1 인코딩 문자열에 대한 지원을 제어합니다.</td>
        <td>2.2.0부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#track-memory-consumption-on-apple-platforms"><code>mmapTag</code></a></td>
        <td><code>UInt</code></td>
        <td>Apple 플랫폼에서 메모리 소비 추적에 필요한 메모리 태깅을 제어합니다. <code>240</code>-<code>255</code> 값을 사용할 수 있으며(기본값 <code>246</code>), <code>0</code>은 태깅을 비활성화합니다.</td>
        <td>2.2.0부터 사용 가능</td>
    </tr>
    <tr>
        <td><code>disableMmap</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (기본값)</li>
            </list>
        </td>
        <td>기본 할당자를 제어합니다. <code>true</code>인 경우 <code>mmap</code> 대신 <code>malloc</code> 메모리 할당자를 사용합니다.</td>
        <td>2.2.0부터 사용 가능</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#garbage-collector"><code>gc</code></a></td>
        <td>
            <list>
                <li><code>cms</code> (기본값)</li>
                <li><code>pmcs</code></li>
                <li><code>stwms</code></li>
                <li><a href="native-memory-manager.md#disable-garbage-collection"><code>noop</code></a></li>
            </list>
        </td>
        <td>가비지 컬렉션 동작을 제어합니다:
            <list>
                <li><code>cms</code>: concurrent mark and sweep 사용</li>
                <li><code>pmcs</code>: parallel mark concurrent sweep 사용</li>
                <li><code>stwms</code>: simple stop-the-world mark and sweep 사용</li>
                <li><code>noop</code>: 가비지 컬렉션 비활성화</li>
            </list>
        </td>
        <td><code>cms</code>는 2.4.0부터 기본값</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#garbage-collector"><code>gcMarkSingleThreaded</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (기본값)</li>
            </list>
        </td>
        <td>가비지 컬렉션의 마크(mark) 단계 병렬화를 비활성화합니다. 힙이 큰 경우 GC 일시 중단 시간이 늘어날 수 있습니다.</td>
        <td>1.7.20부터 사용 가능</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#monitor-gc-performance"><code>enableSafepointSignposts</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (기본값)</li>
            </list>
        </td>
        <td>Xcode Instruments에서 디버깅하기 위해 프로젝트의 GC 관련 일시 중단 추적을 활성화합니다.</td>
        <td>2.0.20부터 사용 가능</td>
    </tr>
    <tr>
        <td><code>preCodegenInlineThreshold</code></td>
        <td><code>UInt</code></td>
        <td>
            <p>실제 코드 생성 단계 이전에 수행되는 Kotlin IR 컴파일러의 인라인 최적화 패스를 구성합니다(기본적으로 비활성화됨).</p> 
            <p>권장되는 토큰(컴파일러가 파싱하는 코드 단위) 수는 40입니다.</p>
        </td>
        <td>2.1.20부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-arc-integration.md#deinitializers"><code>objcDisposeOnMain</code></a></td>
        <td>
            <list>
                <li><code>true</code> (기본값)</li>
                <li><code>false</code></li>
            </list>
        </td>
        <td>Swift/Objective-C 객체의 역초기화(deinitialization)를 제어합니다. <code>false</code>인 경우 역초기화는 메인 스레드가 아닌 특별한 GC 스레드에서 발생합니다.</td>
        <td>1.9.0부터 사용 가능</td>
    </tr>
    <tr>
        <td><a href="native-arc-integration.md#support-for-background-state-and-app-extensions"><code>appStateTracking</code></a></td>
        <td>
            <list>
                <li><code>enabled</code></li>
                <li><code>disabled</code> (기본값)</li>
            </list>
        </td>
        <td>
            <p>애플리케이션이 백그라운드에서 실행될 때 타이머 기반의 가비지 컬렉터 호출을 제어합니다.</p>
            <p><code>enabled</code>인 경우 메모리 소비가 너무 높아질 때만 GC가 호출됩니다.</p>
       </td>
        <td>1.7.20부터 실험적(Experimental)</td>
    </tr>
    <tr>
        <td><code>bundleId</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td><code>Info.plist</code> 파일의 번들 ID(<code>CFBundleIdentifier</code>)를 설정합니다.</td>
        <td>1.7.20부터 사용 가능</td>
    </tr>
    <tr>
        <td><code>bundleShortVersionString</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td><code>Info.plist</code> 파일의 단축 번들 버전(<code>CFBundleShortVersionString</code>)을 설정합니다.</td>
        <td>1.7.20부터 사용 가능</td>
    </tr>
    <tr>
        <td><code>bundleVersion</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td><code>Info.plist</code> 파일의 번들 버전(<code>CFBundleVersion</code>)을 설정합니다.</td>
        <td>1.7.20부터 사용 가능</td>
    </tr>
    <tr>
        <td><code>sourceInfoType</code></td>
        <td>
            <list>
                <li><code>libbacktrace</code></li>
                <li><code>coresymbolication</code> (Apple 타겟)</li>
                <li><code>noop</code> (기본값)</li>
            </list>
        </td>
        <td>
            <p>예외 스택 트레이스에 파일 위치와 라인 번호를 추가합니다.</p>
            <p><code>coresymbolication</code>은 Apple 타겟에서만 사용할 수 있으며, 디버그 모드의 macOS 및 Apple 시뮬레이터에서 기본적으로 활성화됩니다.</p>
        </td>
        <td>1.6.20부터 실험적(Experimental)</td>
    </tr>
    <!-- <tr>
        <td><code>objcExportReportNameCollisions</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (default)</li>
            </list>
        </td>
        <td>When <code>enabled</code>, reports warnings in case name collisions occur during Objective-C export.</td>
        <td></td>
    </tr>
    <tr>
        <td><code>objcExportErrorOnNameCollisions</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (default)</li>
            </list>
        </td>
        <td>When <code>true</code>, issues errors in case name collisions occur during Objective-C export.</td>
        <td></td>
    </tr>
    <tr>
        <td><code>debugCompilationDir</code></td>
        <td><code>String</code></td>
        <td>Specifies the directory path to use for debug information in the compiled binary.</td>
        <td></td>
    </tr>
    <tr>
        <td><code>fixedBlockPageSize</code></td>
        <td><code>UInt</code></td>
        <td>Controls the page size for fixed memory blocks in the memory allocator. Affects memory allocation performance and fragmentation.</td>
        <td></td>
    </tr>
    <tr>
        <td><code>gcMutatorsCooperate</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (default)</li>
            </list>
        </td>
        <td>Controls cooperation between mutator threads and the garbage collector.</td>
        <td></td>
    </tr>
    <tr>
        <td><code>auxGCThreads</code></td>
        <td><code>UInt</code></td>
        <td>Specifies the number of auxiliary threads to use for garbage collection.</td>
        <td></td>
    </tr>
    <tr>
        <td><code>sanitizer</code></td>
        <td>
            <list>
                <li><code>address</code></li>
                <li><code>thread</code></li>
            </list>
        </td>
        <td>Enables runtime sanitizers for detecting various issues like memory errors, data races, and undefined behavior.</td>
        <td>Experimental</td>
    </tr> -->
</table>

> 안정성 수준에 대한 자세한 내용은 [문서](components-stability.md#stability-levels-explained)를 참조하세요.
> 
{style="tip"}

## 다음 단계 {id="what-s-next"}

[최종 네이티브 바이너리 빌드](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html) 방법을 알아보세요.