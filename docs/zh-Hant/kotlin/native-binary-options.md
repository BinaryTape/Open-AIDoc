[//]: # (title: Kotlin/Native 二進制選項)

本頁面列出了實用的 Kotlin/Native 二進制選項，您可以用來配置 Kotlin/Native [最終二進制檔案](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)，以及在專案中設定二進制選項的方法。

## 如何啟用 {id="how-to-enable"}

您可以在 `gradle.properties` 檔案、您的組建檔案中啟用二進制選項，或者將它們作為編譯器引數傳遞。

### 在 Gradle 屬性中 {id="in-gradle-properties"}

您可以使用 `kotlin.native.binary` 屬性在專案的 `gradle.properties` 檔案中設定二進制選項。例如：

```none
kotlin.native.binary.latin1Strings=true
```

### 在您的組建檔案中 {id="in-your-build-file"}

您可以在 `build.gradle.kts` 檔案中為專案設定二進制選項：

* 使用 `binaryOption` 屬性針對特定二進制檔案。例如：

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

* 作為 `freeCompilerArgs` 屬性中的 `-Xbinary=$option=$value` 編譯器選項。例如：

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

### 在命令列編譯器中 {id="in-the-command-line-compiler"}

執行 [Kotlin/Native 編譯器](native-get-started.md#using-the-command-line-compiler)時，您可以直接在命令列中以 `-Xbinary=$option=$value` 形式傳遞二進制選項。
例如：

```bash
kotlinc-native main.kt -Xbinary=enableSafepointSignposts=true
```

## 二進制選項 {id="binary-options"}

> 本表格並非所有現行選項的詳盡清單，僅包含最值得注意的選項。
>
{style="note"}

<table sticky-header="true">
    <tr>
        <td width="100">選項</td>
        <td width="50">值</td>
        <td width="150">說明</td>
        <td width="80">狀態</td>
    </tr>
    <tr>
        <td><a href="native-improving-compilation-time.md#enable-caches-for-release-binaries"><code>enableReleaseBinaryCache</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>啟用編譯器在發佈模式下使用快取，以犧牲某些編譯器最佳化為代價來加快組建速度。</td>
        <td>自 2.4.20 起為實驗性</td>
    </tr>
    <tr>
        <td><a href="native-objc-interop.md#explicit-parameter-names-in-objective-c-block-types"><code>objcExportBlockExplicitParameterNames</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false (預設)</code></li>
            </list>
        </td>
        <td>為匯出的 Objective-C 標頭函式型別加入明確的參數名稱。</td>
        <td>自 2.2.20 起為實驗性</td>
    </tr>
    <tr>
        <td><a href="whatsnew2220.md#smaller-binary-size-for-release-binaries"><code>smallBinary</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>減小發佈二進制檔案的體積。</td>
        <td>自 2.2.20 起為實驗性</td>
    </tr>
    <tr>
        <td><a href="whatsnew2220.md#support-for-stack-canaries-in-binaries"><code>stackProtector</code></a></td>
        <td>
            <list>
                <li><code>yes</code></li>
                <li><code>strong</code></li>
                <li><code>all</code></li>
                <li><code>no</code> (預設)</li>
            </list>
        </td>
        <td>啟用 stack canaries：對易受攻擊的函式使用 <code>yes</code>，對所有函式使用 <code>all</code>，並使用 <code>strong</code> 以採用更強的啟發式。</td>
        <td>自 2.2.20 起提供</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#disable-allocator-paging"><code>pagedAllocator</code></a></td>
        <td>
            <list>
                <li><code>true</code> (預設)</li>
                <li><code>false</code></li>
            </list>
        </td>
        <td>控制分配的分頁（緩衝）。為 <code>false</code> 時，記憶體分配器會按物件基礎預留記憶體。</td>
        <td>自 2.2.0 起為實驗性</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#enable-support-for-latin-1-strings"><code>latin1Strings</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>控制對 Latin-1 編碼字串的支援，以減少應用程式二進制檔案大小並調整記憶體消耗。</td>
        <td>自 2.2.0 起為實驗性</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#track-memory-consumption-on-apple-platforms"><code>mmapTag</code></a></td>
        <td><code>UInt</code></td>
        <td>控制記憶體標記，這在 Apple 平台上追蹤記憶體消耗時是必要的。可用值為 <code>240</code>-<code>255</code>（預設為 <code>246</code>）；<code>0</code> 則停用標記。</td>
        <td>自 2.2.0 起提供</td>
    </tr>
    <tr>
        <td><code>disableMmap</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>控制預設分配器。為 <code>true</code> 時，使用 <code>malloc</code> 記憶體分配器而非 <code>mmap</code>。</td>
        <td>自 2.2.0 起提供</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#garbage-collector"><code>gc</code></a></td>
        <td>
            <list>
                <li><code>cms</code> (預設)</li>
                <li><code>pmcs</code></li>
                <li><code>stwms</code></li>
                <li><a href="native-memory-manager.md#disable-garbage-collection"><code>noop</code></a></li>
            </list>
        </td>
        <td>控制垃圾收集行為：
            <list>
                <li><code>cms</code> 使用並行標記與清除 (concurrent mark and sweep)</li>
                <li><code>pmcs</code> 使用平行標記並行清除 (parallel mark concurrent sweep)</li>
                <li><code>stwms</code> 使用簡單的停止所有執行緒 (stop-the-world) 標記與清除</li>
                <li><code>noop</code> 停用垃圾收集</li>
            </list>
        </td>
        <td><code>cms</code> 自 2.4.0 起為預設</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#garbage-collector"><code>gcMarkSingleThreaded</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>停用垃圾收集標記階段的平行化。在大堆積上可能會增加 GC 暫停時間。</td>
        <td>自 1.7.20 起提供</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#monitor-gc-performance"><code>enableSafepointSignposts</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>啟用追蹤專案中與 GC 相關的暫停，以便在 Xcode Instruments 中進行偵錯。</td>
        <td>自 2.0.20 起提供</td>
    </tr>
    <tr>
        <td><code>preCodegenInlineThreshold</code></td>
        <td><code>UInt</code></td>
        <td>
            <p>在 Kotlin IR 編譯器中配置內嵌最佳化傳遞，這發生在實際程式碼產生階段之前（預設停用）。</p> 
            <p>建議的語彙單元（由編譯器剖析的程式碼單元）數量為 40。</p>
        </td>
        <td>自 2.1.20 起為實驗性</td>
    </tr>
    <tr>
        <td><a href="native-arc-integration.md#deinitializers"><code>objcDisposeOnMain</code></a></td>
        <td>
            <list>
                <li><code>true</code> (預設)</li>
                <li><code>false</code></li>
            </list>
        </td>
        <td>控制 Swift/Objective-C 物件的解構。為 <code>false</code> 時，解構會在特殊的 GC 執行緒而非主執行緒上發生。</td>
        <td>自 1.9.0 起提供</td>
    </tr>
    <tr>
        <td><a href="native-arc-integration.md#support-for-background-state-and-app-extensions"><code>appStateTracking</code></a></td>
        <td>
            <list>
                <li><code>enabled</code></li>
                <li><code>disabled</code> (預設)</li>
            </list>
        </td>
        <td>
            <p>控制當應用程式在背景執行時，垃圾收集器基於計時器的呼叫。</p>
            <p>當為 <code>enabled</code> 時，僅在記憶體消耗過高時才會呼叫 GC。</p>
       </td>
        <td>自 1.7.20 起為實驗性</td>
    </tr>
    <tr>
        <td><code>bundleId</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td>在 <code>Info.plst</code> 檔案中設定套件 ID (<code>CFBundleIdentifier</code>)。</td>
        <td>自 1.7.20 起提供</td>
    </tr>
    <tr>
        <td><code>bundleShortVersionString</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td>在 <code>Info.plst</code> 檔案中設定短套件版本號 (<code>CFBundleShortVersionString</code>)。</td>
        <td>自 1.7.20 起提供</td>
    </tr>
    <tr>
        <td><code>bundleVersion</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td>在 <code>Info.plst</code> 檔案中設定套件版本號 (<code>CFBundleVersion</code>)。</td>
        <td>自 1.7.20 起提供</td>
    </tr>
    <tr>
        <td><code>sourceInfoType</code></td>
        <td>
            <list>
                <li><code>libbacktrace</code></li>
                <li><code>coresymbolication</code> (Apple 目標)</li>
                <li><code>noop</code> (預設)</li>
            </list>
        </td>
        <td>
            <p>在例外堆疊追蹤中加入檔案位置與行號。</p>
            <p><code>coresymbolication</code> 僅可用於 Apple 目標，且在偵錯模式下預設為 macOS 與 Apple 模擬器啟用。</p>
        </td>
        <td>自 1.6.20 起為實驗性</td>
    </tr>
    <!-- <tr>
        <td><code>objcExportReportNameCollisions</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>當為 <code>enabled</code> 時，若在 Objective-C 匯出過程中發生名稱衝突，則回報警告。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>objcExportErrorOnNameCollisions</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>當為 <code>true</code> 時，若在 Objective-C 匯出過程中發生名稱衝突，則發出錯誤。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>debugCompilationDir</code></td>
        <td><code>String</code></td>
        <td>指定編譯後的二進制檔案中用於偵錯資訊的目錄路徑。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>fixedBlockPageSize</code></td>
        <td><code>UInt</code></td>
        <td>控制記憶體分配器中固定記憶體區塊的分頁大小。影響記憶體分配效能與碎片化。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>gcMutatorsCooperate</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (預設)</li>
            </list>
        </td>
        <td>控制變異執行緒 (mutator threads) 與垃圾收集器之間的協作。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>auxGCThreads</code></td>
        <td><code>UInt</code></td>
        <td>指定垃圾收集時使用的輔助執行緒數量。</td>
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
        <td>啟用執行時 Sanitizer，用於偵測各種問題，如記憶體錯誤、資料競爭及未定義行為。</td>
        <td>實驗性</td>
    </tr> -->
</table>

> 欲了解更多關於穩定性級別的資訊，請參閱[文件](components-stability.md#stability-levels-explained)。
> 
{style="tip"}

## 下一步 {id="what-s-next"}

了解如何[組建最終原生二進制檔案](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。