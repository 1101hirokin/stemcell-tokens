// 手で書く。生成物ではない。

import SwiftUI

/// 明暗で値が変わる色。
///
/// アセットカタログを使わないのは、テーマを実行時に差し替えられる必要があるからである。
/// 憲法 第3条 は消費者がブランドの色を上書きできることを求めていて（StemcellProvider §7）、
/// アセットカタログは静的なので、それを表せない。二つの機構を並べるより一つに寄せる。
///
/// 解決に `UIColor` / `NSColor` の dynamicProvider を使うのは、View の外でも解けるようにするため
/// である。`@Environment(\.colorScheme)` で選ぶ形だと、View の文脈が無い場所でトークンを引けない。
public struct DynamicColor: Sendable, Hashable {
    public let light: Color
    public let dark: Color

    public init(light: Color, dark: Color) {
        self.light = light
        self.dark = dark
    }

    /// いまの外観に合わせて解いた色。
    public var resolved: Color {
        #if canImport(UIKit)
        return Color(uiColor: UIColor { traits in
            UIColor(traits.userInterfaceStyle == .dark ? dark : light)
        })
        #elseif canImport(AppKit)
        return Color(nsColor: NSColor(name: nil) { appearance in
            let isDark = appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
            return NSColor(isDark ? dark : light)
        })
        #else
        return light
        #endif
    }
}

// ShapeStyle へ適合させれば `.foregroundStyle(token)` と書けるが、Color.Resolved を返す形が
// 手元でコンパイルできないので v0 では出さない。実機で確かめてから足す。
