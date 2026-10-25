[//]: # (title: 支援的平台)

Ktor HTTP 用戶端可用於 Kotlin 支援的不同平台上：
- JVM
- [Android](https://kotlinlang.org/docs/android-overview.html)
- [Native](https://kotlinlang.org/docs/native-overview.html)
   > 在 Kotlin/Native 專案中使用 Ktor 需要
   > [新的記憶體管理器](https://kotlinlang.org/docs/native-memory-manager.html)，該管理器從 Kotlin 1.7.20 開始預設啟用。
   >
   {id="newmm-note" style="note"}
- [JavaScript](https://kotlinlang.org/docs/js-overview.html)
- [WasmJs](https://kotlinlang.org/docs/wasm-overview.html)

你可以在[多平台專案](https://kotlinlang.org/docs/multiplatform.html)中使用它，無論是多平台行動應用程式還是全端 Web 應用程式。多平台專案支援以下[目標](https://kotlinlang.org/docs/multiplatform-dsl-reference.html#targets)：

<table>

<tr>
<td>
        目標平台
    </td>
    <td>
        目標預設
    </td>
</tr>

<tr>
<td>
        Kotlin/JVM
    </td>
    <td>
        <list>
            <li>
                <code>jvm</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Kotlin/JS
    </td>
    <td>
        <list>
            <li>
                <code>js</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Kotlin/Wasm
    </td>
    <td>
        <list>
            <li>
                <code>wasmJs</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Android
    </td>
    <td>
        <list>
            <li>
                <code>android</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        iOS
    </td>
    <td>
        <list>
            <li>
                <code>iosArm32</code>
            </li>
            <li>
                <code>iosArm64</code>
            </li>
            <li>
                <code>iosX64</code>
            </li>
            <li>
                <code>iosSimulatorArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        watchOS
    </td>
    <td>
        <list>
            <li>
                <code>watchosArm32</code>
            </li>
            <li>
                <code>watchosArm64</code>
            </li>
            <li>
                <code>watchosX86</code>
            </li>
            <li>
                <code>watchosX64</code>
            </li>
            <li>
                <code>watchosSimulatorArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        tvOS
    </td>
    <td>
        <list>
            <li>
                <code>tvosArm64</code>
            </li>
            <li>
                <code>tvosX64</code>
            </li>
            <li>
                <code>tvosSimulatorArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        macOS
    </td>
    <td>
        <list>
            <li>
                <code>macosX64</code>
            </li>
            <li>
                <code>macosArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Linux
    </td>
    <td>
        <list>
            <li>
                <code>linuxX64</code>
            </li>
            <li>
                <code>linuxArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Windows
    </td>
    <td>
        <list>
            <li>
                <code>mingwX64</code>
            </li>
        </list>
    </td>
</tr>

</table>