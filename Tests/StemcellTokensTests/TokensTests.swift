import Testing
import SwiftUI
@testable import StemcellTokens

// この作業機に Swift のツールチェーンが無いので、まだ一度も走らせていない。
// macOS へ移ったら最初にここを通す（DESIGN.md §7）。

@Test func 間隔の段は四の倍数である() {
    #expect(StemcellTokens.Spacing.s4 == 16)
    #expect(StemcellTokens.Spacing.s2 == 8)
}

@Test func 動きの長さは秒で入っている() {
    #expect(StemcellTokens.Motion.Duration.fast01 == 0.07)
    #expect(StemcellTokens.Motion.Duration.slow02 < 1.0)
}

@Test func 明暗で地の面の色が違う() {
    let light = StemcellThemeStandardLight.Color.App.background
    let dark = StemcellThemeStandardDark.Color.App.background
    #expect(light != dark)
}

@Test func 明暗の対を解ける() {
    let pair = DynamicColor(
        light: StemcellThemeStandardLight.Color.App.background,
        dark: StemcellThemeStandardDark.Color.App.background
    )
    #expect(pair.light != pair.dark)
}
