[//]: # (title: C言語の関数ポインタのマッピング – チュートリアル)

> Cライブラリのインポートは[ベータ版](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)です。cinteropツールによってCライブラリから生成されるすべてのKotlin宣言には、`@ExperimentalForeignApi`アノテーションが必要です。
>
> Kotlin/Nativeに同梱されているネイティブプラットフォームライブラリ（Foundation、UIKit、POSIXなど）では、一部のAPIのみオプトインが必要です。
>
{style="note"}

KotlinからどのC関数ポインタが参照できるかを確認し、Kotlin/Nativeおよび[マルチプラットフォーム](gradle-configure-project.md#targeting-multiple-platforms) Gradleビルドにおける高度なC相互運用のユースケースを調べてみましょう。

このチュートリアルでは、以下の内容を学びます。

* [Kotlin関数をC関数ポインタとして渡す方法を学ぶ](#pass-kotlin-function-as-a-c-function-pointer)
* [KotlinからC関数ポインタを使用する](#use-the-c-function-pointer-from-kotlin)

## C言語の関数ポインタ型のマッピング {id="mapping-function-pointer-types-from-c"}

KotlinとCの間のマッピングを理解するために、関数ポインタをパラメータとして受け取る関数と、関数ポインタを返す関数の2つを宣言してみましょう。

[シリーズの第1部](mapping-primitive-data-types-from-c.md)で、必要なファイルを含むCライブラリをすでに作成しました。このステップでは、`interop.def`ファイルの`---`セパレータ以降の宣言を更新します。

```c 

---

int myFun(int i) {
  return i+1;
}

typedef int  (*MyFun)(int);

void accept_fun(MyFun f) {
  f(42);
}

MyFun supply_fun() {
  return myFun;
}
``` 

`interop.def`ファイルは、アプリケーションをコンパイル、実行、またはIDEで開くために必要なすべてを提供します。

## Cライブラリ用に生成されたKotlin APIの確認 {id="inspect-generated-kotlin-apis-for-a-c-library"}

C関数ポインタがKotlin/Nativeにどのようにマッピングされるかを確認し、プロジェクトを更新してみましょう。

1. `src/nativeMain/kotlin`にある、[前のチュートリアル](mapping-struct-union-types-from-c.md)の`hello.kt`ファイルを以下の内容で更新します。

   ```kotlin
   import interop.*
   import kotlinx.cinterop.ExperimentalForeignApi
   
   @OptIn(ExperimentalForeignApi::class)
   fun main() {
       println("Hello Kotlin/Native!")
      
       accept_fun(/* fix me*/)
       val useMe = supply_fun()
   }
   ```

2. IntelliJ IDEAの[宣言へ移動 (Go to declaration)](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_Declaration.html)コマンド（<shortcut>Cmd + B</shortcut>/<shortcut>Ctrl + B</shortcut>）を使用して、C関数用に生成された以下のAPIに移動します。

   ```kotlin
   fun myFun(i: kotlin.Int): kotlin.Int
   fun accept_fun(f: kotlinx.cinterop.CPointer<kotlinx.cinterop.CFunction<(kotlin.Int) -> kotlin.Int>>? /* from: interop.MyFun? */)
   fun supply_fun(): kotlinx.cinterop.CPointer<kotlinx.cinterop.CFunction<(kotlin.Int) -> kotlin.Int>>? /* from: interop.MyFun? */
   ```

見てわかるように、C関数ポインタはKotlinでは`CPointer<CFunction<...>>`を使用して表現されます。`accept_fun()`関数はパラメータとしてオプショナルな関数ポインタを受け取り、`supply_fun()`は関数ポインタを返します。

`CFunction<(Int) -> Int>`は関数シグネチャを表し、`CPointer<CFunction<...>>?`はnull許容（nullable）の関数ポインタを表します。すべての`CPointer<CFunction<...>>`型には[`.invoke()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlinx.cinterop/invoke.html)演算子拡張関数が用意されており、関数ポインタを通常のKotlin関数であるかのように呼び出すことができます。

## Kotlin関数をC関数ポインタとして渡す {id="pass-kotlin-function-as-a-c-function-pointer"}

それでは、KotlinコードからC関数を使用してみましょう。`accept_fun()`関数を呼び出し、C関数ポインタをKotlinラムダに渡します。

```kotlin
import interop.*
import kotlinx.cinterop.staticCFunction
import kotlinx.cinterop.ExperimentalForeignApi

@OptIn(ExperimentalForeignApi::class)
fun myFun() {
    accept_fun(staticCFunction<Int, Int> { it + 1 })
}
```

この呼び出しでは、Kotlin/Nativeのヘルパー関数`staticCFunction {}`を使用して、Kotlinラムダ関数をC関数ポインタにラップしています。これにはアンバウンド（非バインド）でキャプチャを行わないラムダ関数のみを使用できます。たとえば、関数内のローカル変数をキャプチャすることはできず、グローバルに参照可能な宣言のみをキャプチャできます。

関数が例外をスローしないように注意してください。`staticCFunction {}`から例外をスローすると、非決定論的な副作用が発生します。

## KotlinからC関数ポインタを使用する {id="use-the-c-function-pointer-from-kotlin"}

次のステップは、`supply_fun()`呼び出しから返されたC関数ポインタを実行することです。

```kotlin
import interop.*
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.invoke

@OptIn(ExperimentalForeignApi::class)
fun myFun2() {
    val functionFromC = supply_fun() ?: error("No function is returned")

    functionFromC(42)
}
```

Kotlinは関数ポインタの戻り値の型をnull許容の`CPointer<CFunction<>`オブジェクトに変換します。そのため、最初に明示的に`null`をチェックする必要があり、上記コードでは[Elvis演算子](null-safety.md)が使用されています。
cinteropツールを使用すると、C関数ポインタを通常のKotlin関数の呼び出し（`functionFromC(42)`）のように呼び出すことができます。

## Kotlinコードの更新 {id="update-kotlin-code"}

すべての定義を確認できたので、プロジェクトでそれらを使用してみましょう。
`hello.kt`ファイルのコードは以下のようになります。

```kotlin
import interop.*
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.invoke
import kotlinx.cinterop.staticCFunction

@OptIn(ExperimentalForeignApi::class)
fun main() {
    println("Hello Kotlin/Native!")

    val cFunctionPointer = staticCFunction<Int, Int> { it + 1 }
    accept_fun(cFunctionPointer)

    val funFromC = supply_fun() ?: error("No function is returned")
    funFromC(42)
}
```

すべてが期待どおりに動作することを確認するには、[IDEで](native-get-started.md#build-and-run-the-application)`runDebugExecutable<YourTargetName>` Gradleタスクを実行するか、ターミナルでコンソールコマンドを使用します（この例の場合）：

```bash
./gradlew runDebugExecutableMacosArm64
```

## 次のステップ {id="next-step"}

シリーズの次のパートでは、KotlinとCの間で文字列がどのようにマッピングされるかを学びます。

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="mapping-struct-union-types-from-c.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="mapping-strings-from-c.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>

### 関連項目 {id="see-also"}

より高度なシナリオをカバーしている[C言語との相互運用性](native-c-interop.md)のドキュメントで詳細をご確認ください。