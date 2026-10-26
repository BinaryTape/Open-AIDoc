[//]: # (title: 지원 플랫폼)

Ktor HTTP 클라이언트는 Kotlin이 지원하는 다양한 플랫폼에서 사용할 수 있습니다:
- JVM
- [Android](https://kotlinlang.org/docs/android-overview.html)
- [Native](https://kotlinlang.org/docs/native-overview.html)
   > Kotlin/Native 프로젝트에서 Ktor를 사용하려면 [새로운 메모리 관리자](https://kotlinlang.org/docs/native-memory-manager.html)가 필요하며, 이는 Kotlin 1.7.20부터 기본으로 활성화되어 있습니다.
   >
   {id="newmm-note" style="note"}
- [JavaScript](https://kotlinlang.org/docs/js-overview.html)
- [WasmJs](https://kotlinlang.org/docs/wasm-overview.html)

멀티플랫폼 모바일이든 풀스택 웹 애플리케이션이든 관계없이 [멀티플랫폼 프로젝트](https://kotlinlang.org/docs/multiplatform.html)에서 사용할 수 있습니다. 멀티플랫폼 프로젝트에서는 다음 [타깃](https://kotlinlang.org/docs/multiplatform-dsl-reference.html#targets)이 지원됩니다:

<table>

<tr>
<td>
        타깃 플랫폼
    </td>
    <td>
        타깃 프리셋
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