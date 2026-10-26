[//]: # (title: マウスイベントリスナー)

デスクトッププロジェクトでは、クリック、移動、スクロール、入力領域への出入り（Enter/Exit）など、さまざまなマウスイベントをリッスンできます。

> このガイドのサンプルは、実行可能なデスクトップアプリです。試すには:
> 1. [Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)または[オンラインウィザード](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)を使用して、Compose Multiplatformプロジェクトを作成します。
> 2. デスクトップのエントリーポイントファイルを開きます（例: `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`）。
> 3. その内容を提供されたサンプルで置き換えます。
>
{style="note" id="desktop-snippets-intro"}

## クリックリスナー {id="click-listeners"}

クリックリスナーはAndroid向けCompose Multiplatformとデスクトップ向けCompose Multiplatformの両方で利用できるため、コードは両方のプラットフォームで動作します。
たとえば、`onClick`、`onDoubleClick`、`onLongClick`モディファイアを使用してシンプルなクリックリスナーを設定する方法は次のとおりです:

```kotlin
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication(title = "Mouse clicks") {
    var count by remember { mutableIntStateOf(0) }
    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxWidth()) {
        var text by remember { mutableStateOf("Click magenta box!") }
        Column {
            @OptIn(ExperimentalFoundationApi::class)
            Box(modifier = Modifier
                .background(Color.Magenta)
                .fillMaxWidth(0.7f)
                .fillMaxHeight(0.7f)
                .combinedClickable(
                    onClick = {
                        text = "Click! ${count++}"
                    },
                    onDoubleClick = {
                        text = "Double click! ${count++}"
                    },
                    onLongClick = {
                        text = "Long click! ${count++}"
                    }
                )
            )
            Text(text = text, fontSize = 40.sp)
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(modifier = Modifier.combinedClickable(onClick = { text ="}

<img src="compose-mouse-click-listeners.animated.gif" alt="Mouse click listeners" width="600" preview-src="compose-mouse-click-listeners.png"/>

`combinedClickable`モディファイアは、プライマリボタン（マウスの左ボタン）とタッチイベントのみをサポートしています。ボタンを異なる方法で処理する必要がある場合は、[`Modifier.onClick`](#onclick-handlers)セクションを参照してください。

## 移動リスナー {id="move-listeners"}

> `onPointerEvent`モディファイアは[試験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)です。オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。
> [安定（Stable）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)なAPIについては、[`Modifier.pointerInput`](#listening-for-raw-events-in-common-code-via-pointerinput)を参照してください。
>
{style="warning"}

マウスポインタの位置に応じてウィンドウの背景色を変更するポインタ移動リスナーを作成するには、次のコードを追加します:

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalComposeUiApi::class)
fun main() = singleWindowApplication(title = "Mouse move listeners") {
    var color by remember { mutableStateOf(Color(0, 0, 0)) }
    Box(modifier = Modifier
        .wrapContentSize(Alignment.Center)
        .fillMaxSize()
        .background(color = color)
        .onPointerEvent(PointerEventType.Move) {
            val position = it.changes.first().position
            color = Color(position.x.toInt() % 256, position.y.toInt() % 256, 0)
        }
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(modifier = Modifier.onPointerEvent(PointerEventType.Move) { color ="}

<img src="compose-mouse-move-listeners.animated.gif" alt="Mouse move listeners" width="600" preview-src="compose-mouse-move-listeners.png"/>

## Enterリスナー {id="enter-listeners"}

> `onPointerEvent`モディファイアは[試験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)です。オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。
> [安定（Stable）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)なAPIについては、[`Modifier.pointerInput`](#listening-for-raw-events-in-common-code-via-pointerinput)を参照してください。
>
{style="warning"}

デスクトップ向けCompose Multiplatformは、ポインタが入力領域に入ったとき（Enter）や離れたとき（Exit）のハンドラーをサポートしています。たとえば、次のコードはホバー時に行のフォントスタイルを変更します:

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalComposeUiApi::class)
fun main() = singleWindowApplication(title = "Mouse enter listeners") {
    Column(
        Modifier.background(Color.White),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        repeat(10) { index ->
            var active by remember { mutableStateOf(false) }
            Text(modifier = Modifier
                .fillMaxWidth()
                .background(color = if (active) Color.Green else Color.White)
                .onPointerEvent(PointerEventType.Enter) { active = true }
                .onPointerEvent(PointerEventType.Exit) { active = false },
                fontSize = 30.sp,
                fontStyle = if (active) FontStyle.Italic else FontStyle.Normal,
                text = "Item $index",
                textAlign = TextAlign.Center
            )
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Text(modifier = Modifier.onPointerEvent(PointerEventType.Enter) { active ="}

<img src="compose-mouse-enter-listeners.animated.gif" alt="Mouse enter listeners" width="600" preview-src="compose-mouse-enter-listeners.png"/>

## スクロールリスナー {id="scroll-listeners"}

> `onPointerEvent`モディファイアは[試験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)です。オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。
> [安定（Stable）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)なAPIについては、[`Modifier.pointerInput`](#listening-for-raw-events-in-common-code-via-pointerinput)を参照してください。
>
{style="warning"}

次のコードサンプルは、マウスのスクロール方向に応じて表示される数値を増減させる方法を示しています:

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalComposeUiApi::class)
fun main() = singleWindowApplication(title = "Mouse scroll listeners") {
    var number by remember { mutableFloatStateOf(0f) }
    Box(
        Modifier
            .fillMaxSize()
            .onPointerEvent(PointerEventType.Scroll) {
                number += it.changes.first().scrollDelta.y
            },
        contentAlignment = Alignment.Center
    ) {
        Text("Scroll to change the number: $number", fontSize = 30.sp)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(Modifier.onPointerEvent(PointerEventType.Scroll) { number +="}

<img src="compose-mouse-scroll-listeners.animated.gif" alt="Mouse scroll listeners" width="600" preview-src="compose-mouse-scroll-listeners.png"/>

## 実験的なonClickハンドラー {id="onclick-handlers"}

> `onClick`モディファイアは[試験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)であり、デスクトッププロジェクトでのみサポートされています。オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。
>
{style="warning"}

`Modifier.onClick`は、クリック、ダブルクリック、およびロングクリックに対する独立したコールバックを提供します。これはポインタイベントに由来するクリックのみを処理し、そのままではアクセシビリティの`click`イベントを処理しません。

`matcher: PointerMatcher`および`keyboardModifiers: PointerKeyboardModifiers.() -> Boolean`を使用して、特定のポインタイベントをターゲットとするように各`onClick`を設定できます:
* `matcher`: どのマウスボタンがクリックイベントをトリガーするかを選択できます。
* `keyboardModifiers`: 指定したキーが押されているポインタイベントをフィルタリングできます。

複数の`onClick`モディファイアをチェーンして、matcherやキーボード修飾キーの異なる条件でさまざまなクリックを処理することもできます。
`clickable`とは異なり、`onClick`にはデフォルトの`Modifier.indication`および`Modifier.semantics`がなく、<shortcut>Enter</shortcut>キーを押したときにクリックイベントがトリガーされることもありません。必要な場合は、これらのモディファイアを個別に追加してください。
イベントが正しく伝播するように、最も汎用的な（条件が最も少ない）`onClick`ハンドラーを他のハンドラーよりも前に宣言する必要があります。

```kotlin
import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.LocalIndication
import androidx.compose.foundation.PointerMatcher
import androidx.compose.foundation.background
import androidx.compose.foundation.indication
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.onClick
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerButton
import androidx.compose.ui.input.pointer.isAltPressed
import androidx.compose.ui.input.pointer.isShiftPressed
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalFoundationApi::class)
fun main() = singleWindowApplication(title = "Mouse clicks") {
    Column {
        var topBoxText by remember { mutableStateOf("Click me\nusing LMB or LMB + Shift") }
        var topBoxCount by remember { mutableIntStateOf(0) }
        // No indication on interaction
        Box(modifier = Modifier
            .size(300.dp, 200.dp)
            .background(Color.LightGray)
            // The most generic click handler (without extra conditions) should be the first one
            .onClick {
                // Receives all left mouse button clicks except for when Shift is pressed
                println("Click with primary button")
                topBoxText = "LMB ${topBoxCount++}"
            }.onClick(
                keyboardModifiers = { isShiftPressed } // Accepts clicks only when Shift is pressed
            ) {
                // Receives all left mouse button clicks when Shift is pressed
                println("Click with primary button and shift pressed")
                topBoxCount++
                topBoxText = "LMB + Shift ${topBoxCount++}"
            }
        ) {
            AnimatedContent(
                targetState = topBoxText,
                modifier = Modifier.align(Alignment.Center)
            ) {
                Text(text = it, textAlign = TextAlign.Center)
            }
        }

        var bottomBoxText by remember { mutableStateOf("Click me\nusing LMB or\nRMB + Alt") }
        var bottomBoxCount by remember { mutableStateOf(0) }
        val interactionSource = remember { MutableInteractionSource() }
        // With indication on interaction
        Box(modifier = Modifier
            .size(300.dp, 200.dp)
            .background(Color.Yellow)
            .onClick(
                enabled = true,
                interactionSource = interactionSource,
                matcher = PointerMatcher.mouse(PointerButton.Secondary), // Right mouse button
                keyboardModifiers = { isAltPressed }, // Accepts clicks only when Alt is pressed
                onLongClick = { // Optional
                    bottomBoxText = "RMB Long Click + Alt ${bottomBoxCount++}"
                    println("Long Click with secondary button and Alt pressed")
                },
                onDoubleClick = { // Optional
                    bottomBoxText = "RMB Double Click + Alt ${bottomBoxCount++}"
                    println("Double Click with secondary button and Alt pressed")
                },
                onClick = {
                    bottomBoxText = "RMB Click + Alt ${bottomBoxCount++}"
                    println("Click with secondary button and Alt pressed")
                }
            )
            .onClick(interactionSource = interactionSource) { // Uses default parameters
                bottomBoxText = "LMB Click ${bottomBoxCount++}"
                println("Click with primary button (mouse left button)")
            }
            .indication(interactionSource, LocalIndication.current)
        ) {
            AnimatedContent(
                targetState = bottomBoxText,
                modifier = Modifier.align(Alignment.Center)
            ) {
                Text(text = it, textAlign = TextAlign.Center)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(modifier = Modifier.onClick {"}

<img src="compose-onclick-modifier.animated.gif" alt="Modifier.onClick" width="600" preview-src="compose-onclick-modifier.png"/>

## 実験的なonDragモディファイア {id="experimental-ondrag-modifier"}

> `onDrag`モディファイアは[試験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)であり、デスクトッププロジェクトでのみサポートされています。オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。
>
{style="warning"}

`Modifier.onDrag`を使用すると、`matcher: PointerMatcher`を介してドラッグをトリガーするポインタを指定できます。
`onClick`と同様に、複数の`onDrag`モディファイアをチェーンして連結できます。

キーによってドラッグの動作を変更したいケースでは、`LocalWindowInfo.current.keyboardModifiers`を介してキーボード修飾キーの状態を確認することもできます。
たとえば、通常のドラッグでアイテムを移動し、<shortcut>Ctrl</shortcut>を押しながらのドラッグでアイテムをコピー＆ペーストするような場合です。

次のコードサンプルは、マウスの左右のボタンによってトリガーされるドラッグイベントや、キーボード操作を伴うドラッグイベントを処理する方法を示しています:

```kotlin
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.PointerMatcher
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.onDrag
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerButton
import androidx.compose.ui.input.pointer.isCtrlPressed
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalFoundationApi::class)
fun main() = singleWindowApplication(title = "Drag") {
    val windowInfo = LocalWindowInfo.current

    Column {
        var topBoxOffset by remember { mutableStateOf(Offset(0f, 0f)) }

        Box(modifier = Modifier
            .offset {
                IntOffset(topBoxOffset.x.toInt(), topBoxOffset.y.toInt())
            }
            .size(200.dp)
            .background(Color.Green)
            .onDrag { // By default: enabled = true, matcher = PointerMatcher.Primary (left mouse button)
                topBoxOffset += it
            }
        ) {
            Text(text = "Drag with LMB", modifier = Modifier.align(Alignment.Center))
        }

        var bottomBoxOffset by remember { mutableStateOf(Offset(0f, 0f)) }

        Box(modifier = Modifier
            .offset {
                IntOffset(bottomBoxOffset.x.toInt(), bottomBoxOffset.y.toInt())
            }
            .size(200.dp)
            .background(Color.LightGray)
            .onDrag(
                matcher = PointerMatcher.mouse(PointerButton.Secondary), // Right mouse button
                onDragStart = {
                    println("Gray Box: drag start")
                },
                onDragEnd = {
                    println("Gray Box: drag end")
                }
            ) {
                val keyboardModifiers = windowInfo.keyboardModifiers
                bottomBoxOffset += if (keyboardModifiers.isCtrlPressed) it * 2f else it
            }
        ) {
            Text(
                text = "Drag with RMB,\ntry with CTRL",
                modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(modifier = Modifier.onDrag {"}

<img src="compose-ondrag-modifier.animated.gif" alt="Modifier.onDrag" width="600" preview-src="compose-ondrag-modifier.png"/>

モディファイアを使用しない方法として、`suspend fun PointerInputScope.detectDragGestures`を使用してドラッグを処理することもできます:

```kotlin
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.PointerMatcher
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalFoundationApi::class)
fun main() = singleWindowApplication(title = "Drag") {
    var topBoxOffset by remember { mutableStateOf(Offset(0f, 0f)) }

    Box(modifier = Modifier
        .offset {
            IntOffset(topBoxOffset.x.toInt(), topBoxOffset.y.toInt())
        }
        .size(200.dp)
        .background(Color.Green)
        .pointerInput(Unit) {
            detectDragGestures(
                matcher = PointerMatcher.Primary
            ) {
                topBoxOffset += it
            }
        }
    ) {
        Text(text = "Drag with LMB", modifier = Modifier.align(Alignment.Center))
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Modifier.pointerInput(Unit) { detectDragGestures(matcher = PointerMatcher.Primary)"}

## Swing相互運用による未加工のAWTイベントへのアクセス {id="accessing-raw-awt-events-with-swing-interoperability"}

> `onPointerEvent`モディファイアは[試験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)です。オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。
> [安定（Stable）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)なAPIについては、[`Modifier.pointerInput`](#listening-for-raw-events-in-common-code-via-pointerinput)を参照してください。
>
{style="warning"}

デスクトップ向けCompose Multiplatformは内部でSwingを使用しており、未加工の（raw）AWTイベントにアクセスできます:

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.awt.awtEventOrNull
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalComposeUiApi::class)
fun main() = singleWindowApplication(title = "Raw AWT events") {
    var text by remember { mutableStateOf("") }

    Box(
        Modifier
            .fillMaxSize()
            .onPointerEvent(PointerEventType.Press) {
                text = it.awtEventOrNull?.locationOnScreen?.toString().orEmpty()
            },
        contentAlignment = Alignment.Center
    ) {
        Text(text)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(Modifier.onPointerEvent(PointerEventType.Press) { text ="}

<img src="compose-raw-awt-events.animated.gif" alt="Swing interoperability" width="600" preview-src="compose-raw-awt-events.png"/>

## pointerInputを介して共通コードで未加工のイベントをリッスンする {id="listening-for-raw-events-in-common-code-via-pointerinput"}

上記のスニペットでは、ポインタイベントのタイプをサブスクライブするヘルパー関数である`Modifier.onPointerEvent`関数を使用しています。これは`Modifier.pointerInput`関数の新しく簡潔なバリアントです。
現在これは実験的であり、デスクトップ専用であるため、共通コードでは使用できません。

共通コードでイベントをサブスクライブする必要がある場合や、安定したAPIが必要な場合は、`Modifier.pointerInput`関数を使用できます:

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Text
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication(title = "Raw events via Modifier.pointerInput") {
    val list = remember { mutableStateListOf<String>() }

    Column(
        Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                awaitPointerEventScope {
                    while (true) {
                        val event = awaitPointerEvent()
                        val position = event.changes.first().position
                        // On each relayout, Compose will send a synthetic Move event,
                        // so we skip it to avoid event spam
                        if (event.type != PointerEventType.Move) {
                            list.add(0, "${event.type} $position")
                        }
                    }
                }
            },
    ) {
        for (item in list.take(20)) {
            Text(item)
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Column(Modifier.pointerInput(Unit) { awaitPointerEventScope {"}

<img src="compose-raw-events.animated.gif" alt="Raw events via Modifier.pointerInput" width="600" preview-src="compose-raw-events.png"/>

## 次のステップ {id="what-s-next"}

[その他のデスクトップコンポーネント](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)に関するチュートリアルをご覧ください。