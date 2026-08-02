[//]: # (title: Kotlin/Native のデバッグ)

Kotlin/Native コンパイラは、デバッグ情報を含むバイナリを生成したり、[クラッシュレポートのシンボル化](#debug-ios-applications)のためのデバッグシンボルファイルを作成したりできます。

デバッグ情報は [DWARF 2](https://dwarfstd.org/download.html) 仕様に準拠しているため、LLDB や GDB などの最新のデバッガツールを使用して以下を行うことができます。

* [ブレークポイントの設定](#set-breakpoints)
* [ステップ実行の使用](#use-stepping)
* [変数と型情報の検査](#inspect-variables)

> DWARF 2 仕様をサポートしているということは、デバッガツールが Kotlin を C89 として認識することを意味します。これは、DWARF 5 仕様以前には、仕様内に Kotlin 言語タイプを識別する識別子が存在しなかったためです。
>
{style="note"}

## デバッグ情報を含むバイナリの生成

IntelliJ IDEA、Android Studio、または Xcode でデバッグする場合、デバッグ情報を含むバイナリは自動的に生成されます（ビルドが別の設定になっていない限り）。

デバッグを手動で有効にし、デバッグ情報を含むバイナリを生成するには、以下の方法があります。

* **Gradle タスクを使用する**。デバッグバイナリを取得するには、`linkDebug*` Gradle タスクを使用します。例：

  ```bash
  ./gradlew linkDebugFrameworkNative
  ```

  タスクは、バイナリタイプ（例：`linkDebugSharedNative`）やターゲット（例：`linkDebugExecutableMacosArm64`）によって異なります。

* **コマンドラインコンパイラを使用する**。コマンドラインで、`-g` オプションを付けて Kotlin/Native バイナリをコンパイルします。

  ```bash
  kotlinc-native hello.kt -g -o terminator
  ```

次に、デバッガツールを起動します。例：

```bash
lldb terminator.kexe
```

デバッガの出力例：

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

## ブレークポイントの設定

最新のデバッガは、ブレークポイントを設定するためのいくつかの方法を提供しています。ツールごとの詳細は以下の通りです。

### LLDB

* 名前による指定：

  ```bash
  (lldb) b -n kfun:main(kotlin.Array<kotlin.String>)
  Breakpoint 4: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
  ```

  `-n` はオプションであり、デフォルトで適用されます。

* 場所（ファイル名、行番号）による指定：

  ```bash
  (lldb) b -f hello.kt -l 1
  Breakpoint 1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
  ```

* アドレスによる指定：

  ```bash
  (lldb) b -a 0x00000001000012e4
  Breakpoint 2: address = 0x00000001000012e4
  ```

* 正規表現による指定。ラムダ（名前に `#` 記号が含まれる）のような生成されたアーティファクトをデバッグする際に便利です。

  ```bash
  (lldb) b -r main\(
  3: regex = 'main\(', locations = 1
    3.1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = terminator.kexe[0x00000001000012e4], unresolved, hit count = 0
  ```

### GDB

* 正規表現による指定：

  ```bash
  (gdb) rbreak main(
  Breakpoint 1 at 0x1000109b4
  struct ktype:kotlin.Unit &kfun:main(kotlin.Array<kotlin.String>);
  ```

* 名前による指定は _不可_ です。なぜなら、`:` が場所によるブレークポイント指定のセパレータとして使用されるためです。

  ```bash
  (gdb) b kfun:main(kotlin.Array<kotlin.String>)
  No source file named kfun.
  Make breakpoint pending on future shared library load? (y or [n]) y
  Breakpoint 1 (kfun:main(kotlin.Array<kotlin.String>)) pending
  ```

* 場所による指定：

  ```bash
  (gdb) b hello.kt:1
  Breakpoint 2 at 0x100001704: file /Users/minamoto/ws/.git-trees/hello.kt, line 1.
  ```

* アドレスによる指定：

  ```bash
  (gdb) b *0x100001704
  Note: breakpoint 2 also set at pc 0x100001704.
  Breakpoint 3 at 0x100001704: file /Users/minamoto/ws/.git-trees/hello.kt, line 2.
  ```

## ステップ実行の使用

関数をステップ実行する操作は、C/C++ プログラムの場合とほぼ同じです。

## 変数の検査

`var` 変数の検査は、プリミティブ型と非プリミティブ型の両方で、特別な設定なしで動作します。

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

## iOS アプリケーションのデバッグ

iOS アプリケーションのデバッグでは、クラッシュレポートを詳細に分析することが必要な場合があります。クラッシュレポートには通常、メモリアドレスを読み取り可能なソースコードの場所に変換するプロセスである「シンボル化（symbolication）」が必要です。

Kotlin コード内のアドレス（例：Kotlin コードに対応するスタックトレース要素）をシンボル化するには、特殊なデバッグシンボル（`.dSYM`）ファイルが必要です。このファイルは、クラッシュレポート内のメモリアドレスを、関数や行番号などの実際のソースコードの場所にマッピングします。

Kotlin/Native コンパイラは、デフォルトで Apple プラットフォーム向けのリリース（最適化済み）バイナリに対して `.dSYM` ファイルを生成します。Xcode でビルドする場合、IDE は標準的な場所にある `.dSYM` ファイルを探し、それらを自動的にシンボル化に使用します。Xcode は、IntelliJ IDEA のテンプレートから作成されたプロジェクト内の `.dSYM` ファイルを自動的に検出します。

他のプラットフォームでは、`-Xadd-light-debug` コンパイラオプションを使用して、生成されるバイナリにデバッグ情報を追加できます（バイナリサイズは増加します）。

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

クラッシュレポートの詳細については、[Apple のドキュメント](https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs)を参照してください。

## 既知の問題

* Python バインディングのパフォーマンス。
* デバッガツールでの式評価（Expression evaluation）はサポートされておらず、現在のところ実装の予定はありません。

## 次のステップ

[iOS コードにおける未処理の Kotlin 例外のクラッシュレポートを改善する方法を学ぶ](native-faq.md#how-do-i-get-better-crash-reports-for-ios)