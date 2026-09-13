[//]: # (title: Kotlin/Nativeのバイナリオプション)

このページでは、Kotlin/Nativeの[最終バイナリ (final binaries)](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)の設定に使用できる便利なKotlin/Nativeバイナリオプションと、プロジェクトでバイナリオプションを設定する方法について説明します。

## 有効化する方法 {id="how-to-enable"}

バイナリオプションは、`gradle.properties` ファイル、ビルドファイルで設定するか、コンパイラ引数として渡すことで有効にできます。

### Gradleプロパティでの設定 {id="in-gradle-properties"}

プロジェクトの `gradle.properties` ファイルで `kotlin.native.binary` プロパティを使用して、バイナリオプションを設定できます。例：

```none
kotlin.native.binary.latin1Strings=true
```

### ビルドファイルでの設定 {id="in-your-build-file"}

`build.gradle.kts` ファイルでプロジェクトのバイナリオプションを設定できます：

* `binaryOption` 属性を使用して、特定のバイナリに対して設定します。例：

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

* `freeCompilerArgs` 属性に `-Xbinary=$option=$value` コンパイラオプションとして設定します。例：

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

### コマンドラインコンパイラでの設定 {id="in-the-command-line-compiler"}

[Kotlin/Nativeコンパイラ](native-get-started.md#using-the-command-line-compiler)を実行する際に、コマンドラインで直接 `-Xbinary=$option=$value` としてバイナリオプションを渡すことができます。
例：

```bash
kotlinc-native main.kt -Xbinary=enableSafepointSignposts=true
```

## バイナリオプション {id="binary-options"}

> この表は既存のすべてのオプションを網羅しているわけではなく、主要なもののみを掲載しています。
>
{style="note"}

<table sticky-header="true">
    <tr>
        <td width="100">オプション</td>
        <td width="50">値</td>
        <td width="150">説明</td>
        <td width="80">ステータス</td>
    </tr>
    <tr>
        <td><a href="native-improving-compilation-time.md#enable-caches-for-release-binaries"><code>enableReleaseBinaryCache</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>リリースモードでコンパイラがキャッシュを使用できるようにし、一部のコンパイラ最適化と引き換えにビルドを高速化します。</td>
        <td>2.4.20より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-objc-interop.md#explicit-parameter-names-in-objective-c-block-types"><code>objcExportBlockExplicitParameterNames</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false (デフォルト)</code></li>
            </list>
        </td>
        <td>エクスポートされたObjective-Cヘッダーの関数型に、明示的なパラメータ名を追加します。</td>
        <td>2.2.20より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><a href="whatsnew2220.md#smaller-binary-size-for-release-binaries"><code>smallBinary</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>リリースバイナリのバイナリサイズを削減します。</td>
        <td>2.2.20より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><a href="whatsnew2220.md#support-for-stack-canaries-in-binaries"><code>stackProtector</code></a></td>
        <td>
            <list>
                <li><code>yes</code></li>
                <li><code>strong</code></li>
                <li><code>all</code></li>
                <li><code>no</code> (デフォルト)</li>
            </list>
        </td>
        <td>スタックカナリア (stack canaries) を有効にします：脆弱な関数には <code>yes</code>、すべての関数には <code>all</code> を使用し、より強力なヒューリスティックを使用するには <code>strong</code> を使用します。</td>
        <td>2.2.20より利用可能</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#disable-allocator-paging"><code>pagedAllocator</code></a></td>
        <td>
            <list>
                <li><code>true</code> (デフォルト)</li>
                <li><code>false</code></li>
            </list>
        </td>
        <td>アロケーションのページング（バッファリング）を制御します。<code>false</code> の場合、メモリアロケータはオブジェクトごとにメモリを確保します。</td>
        <td>2.2.0より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#enable-support-for-latin-1-strings"><code>latin1Strings</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>アプリケーションのバイナリサイズを削減し、メモリ消費を調整するために、Latin-1エンコードされた文字列のサポートを制御します。</td>
        <td>2.2.0より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#track-memory-consumption-on-apple-platforms"><code>mmapTag</code></a></td>
        <td><code>UInt</code></td>
        <td>メモリタグ付けを制御します。Appleプラットフォームでのメモリ消費量の追跡に必要です。<code>240</code>〜<code>255</code> の値が使用可能です（デフォルトは <code>246</code>）。<code>0</code> はタグ付けを無効にします。</td>
        <td>2.2.0より利用可能</td>
    </tr>
    <tr>
        <td><code>disableMmap</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>デフォルトのアロケータを制御します。<code>true</code> の場合、<code>mmap</code> の代わりに <code>malloc</code> メモリアロケータを使用します。</td>
        <td>2.2.0より利用可能</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#garbage-collector"><code>gc</code></a></td>
        <td>
            <list>
                <li><code>cms</code> (デフォルト)</li>
                <li><code>pmcs</code></li>
                <li><code>stwms</code></li>
                <li><a href="native-memory-manager.md#disable-garbage-collection"><code>noop</code></a></li>
            </list>
        </td>
        <td>ガベージコレクションの動作を制御します：
            <list>
                <li><code>cms</code> はコンカレントマーク・アンド・スイープ (concurrent mark and sweep) を使用します</li>
                <li><code>pmcs</code> は並列マーク・コンカレントスイープ (parallel mark concurrent sweep) を使用します</li>
                <li><code>stwms</code> は単純なストップ・ザ・ワールド・マーク・アンド・スイープ (stop-the-world mark and sweep) を使用します</li>
                <li><code>noop</code> はガベージコレクションを無効にします</li>
            </list>
        </td>
        <td>2.4.0より <code>cms</code> がデフォルト</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#garbage-collector"><code>gcMarkSingleThreaded</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>ガベージコレクションにおけるマークフェーズの並列化を無効にします。大きなヒープではGCの停止時間が増加する可能性があります。</td>
        <td>1.7.20より利用可能</td>
    </tr>
    <tr>
        <td><a href="native-memory-manager.md#monitor-gc-performance"><code>enableSafepointSignposts</code></a></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>Xcode Instrumentsでのデバッグ用に、プロジェクト内のGC関連の停止の追跡を有効にします。</td>
        <td>2.0.20より利用可能</td>
    </tr>
    <tr>
        <td><code>preCodegenInlineThreshold</code></td>
        <td><code>UInt</code></td>
        <td>
            <p>実際のコード生成フェーズの前に行われる、Kotlin IRコンパイラでのインライニング最適化パスを設定します（デフォルトでは無効）。</p> 
            <p>推奨されるトークン数（コンパイラによって解析されるコード単位）は40です。</p>
        </td>
        <td>2.1.20より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><a href="native-arc-integration.md#deinitializers"><code>objcDisposeOnMain</code></a></td>
        <td>
            <list>
                <li><code>true</code> (デフォルト)</li>
                <li><code>false</code></li>
            </list>
        </td>
        <td>Swift/Objective-Cオブジェクトのデニシャライズ（deinitialization）を制御します。<code>false</code> の場合、デニシャライズはメインスレッドではなく特別なGCスレッドで行われます。</td>
        <td>1.9.0より利用可能</td>
    </tr>
    <tr>
        <td><a href="native-arc-integration.md#support-for-background-state-and-app-extensions"><code>appStateTracking</code></a></td>
        <td>
            <list>
                <li><code>enabled</code></li>
                <li><code>disabled</code> (デフォルト)</li>
            </list>
        </td>
        <td>
            <p>アプリケーションがバックグラウンドで実行されているときの、タイマーベースのガベージコレクタの呼び出しを制御します。</p>
            <p><code>enabled</code> の場合、メモリ消費が高くなったときにのみGCが呼び出されます。</p>
       </td>
        <td>1.7.20より実験的 (Experimental)</td>
    </tr>
    <tr>
        <td><code>bundleId</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td><code>Info.plst</code> ファイル内のバンドルID（<code>CFBundleIdentifier</code>）を設定します。</td>
        <td>1.7.20より利用可能</td>
    </tr>
    <tr>
        <td><code>bundleShortVersionString</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td><code>Info.plst</code> ファイル内の短いバンドルバージョン（<code>CFBundleShortVersionString</code>）を設定します。</td>
        <td>1.7.20より利用可能</td>
    </tr>
    <tr>
        <td><code>bundleVersion</code></td>
        <td>
            <list>
                <li><code>String</code></li>
            </list>
        </td>
        <td><code>Info.plst</code> ファイル内のバンドルバージョン（<code>CFBundleVersion</code>）を設定します。</td>
        <td>1.7.20より利用可能</td>
    </tr>
    <tr>
        <td><code>sourceInfoType</code></td>
        <td>
            <list>
                <li><code>libbacktrace</code></li>
                <li><code>coresymbolication</code> (Appleターゲット)</li>
                <li><code>noop</code> (デフォルト)</li>
            </list>
        </td>
        <td>
            <p>例外のスタックトレースにファイルの場所と行番号を追加します。</p>
            <p><code>coresymbolication</code> はAppleターゲットでのみ利用可能で、macOSおよびAppleシミュレータのデバッグモードではデフォルトで有効になっています。</p>
        </td>
        <td>1.6.20より実験的 (Experimental)</td>
    </tr>
    <!-- <tr>
        <td><code>objcExportReportNameCollisions</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td><code>enabled</code> の場合、Objective-Cのエクスポート中に名前の衝突が発生した際に警告を報告します。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>objcExportErrorOnNameCollisions</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td><code>true</code> の場合、Objective-Cのエクスポート中に名前の衝突が発生した際にエラーを出力します。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>debugCompilationDir</code></td>
        <td><code>String</code></td>
        <td>コンパイルされたバイナリ内のデバッグ情報に使用するディレクトリパスを指定します。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>fixedBlockPageSize</code></td>
        <td><code>UInt</code></td>
        <td>メモリアロケータ内の固定メモリブロックのページサイズを制御します。メモリ確保のパフォーマンスとフラグメンテーションに影響します。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>gcMutatorsCooperate</code></td>
        <td>
            <list>
                <li><code>true</code></li>
                <li><code>false</code> (デフォルト)</li>
            </list>
        </td>
        <td>ミューテータスレッド（mutator threads）とガベージコレクタ間の協調を制御します。</td>
        <td></td>
    </tr>
    <tr>
        <td><code>auxGCThreads</code></td>
        <td><code>UInt</code></td>
        <td>ガベージコレクションに使用する補助スレッドの数を指定します。</td>
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
        <td>メモリ・エラー、データ・レース、未定義動作などのさまざまな問題を検出するためのランタイム・サニタイザを有効にします。</td>
        <td>実験的 (Experimental)</td>
    </tr> -->
</table>

> 安定性レベルの詳細については、[ドキュメント](components-stability.md#stability-levels-explained)を参照してください。
> 
{style="tip"}

## 次のステップ {id="what-s-next"}

[最終的なネイティブバイナリを構築する](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)方法を確認してください。