// @stemcell/tokens が生成した。手で直さない。
// 長さは pt。数は Web の CSS px と同じ値である（size.md §5）。
// 時間は秒。SwiftUI の Animation が TimeInterval を取るため。
//
// 出していないトークン（土地の写像が要る。DESIGN.md §9）:
//   elevation.flat.shadow
//   elevation.surface.shadow
//   elevation.navigation.shadow
//   elevation.popover.shadow
//   elevation.modal.shadow
//   elevation.notification.shadow

import CoreGraphics
import SwiftUI

public enum StemcellThemeStandardLight {
    public enum Color {
        public enum App {
            public static let system: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
            public static let background: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
            public static let foreground: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
            public static let surfaceRaised: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
            public static let overlay: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
            public static let fgMuted: SwiftUI.Color = .init(.sRGB, red: 0.3216, green: 0.3765, blue: 0.4431, opacity: 1.0)
            public static let fgSubtle: SwiftUI.Color = .init(.sRGB, red: 0.3608, green: 0.4235, blue: 0.502, opacity: 1.0)
            public static let fgDisabled: SwiftUI.Color = .init(.sRGB, red: 0.6078, green: 0.651, blue: 0.7098, opacity: 1.0)
            public static let link: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
            public static let border: SwiftUI.Color = .init(.sRGB, red: 0.5216, green: 0.5725, blue: 0.6353, opacity: 1.0)
            public static let divider: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.9098, blue: 0.9255, opacity: 1.0)
            public static let shadow: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
            public static let shadowUmbra: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
            public static let shadowPenumbra: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
            public static let scrim: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
        }
        public enum Code {
            public static let comment: SwiftUI.Color = .init(.sRGB, red: 0.3216, green: 0.3765, blue: 0.4431, opacity: 1.0)
            public static let keyword: SwiftUI.Color = .init(.sRGB, red: 0.5765, green: 0.0706, blue: 0.8235, opacity: 1.0)
            public static let string: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.4196, blue: 0.251, opacity: 1.0)
            public static let number: SwiftUI.Color = .init(.sRGB, red: 0.5725, green: 0.2941, blue: 0.0941, opacity: 1.0)
            public static let function: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
            public static let type: SwiftUI.Color = .init(.sRGB, red: 0.1373, green: 0.4078, blue: 0.4, opacity: 1.0)
        }
        public enum Semantic {
            public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
            public enum Primary {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.1098, green: 0.2588, blue: 1.0, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.1098, green: 0.2588, blue: 1.0, opacity: 1.0)
                public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let bgHover: SwiftUI.Color = .init(.sRGB, red: 0.0392, green: 0.1922, blue: 0.9412, opacity: 1.0)
                public static let bgPressed: SwiftUI.Color = .init(.sRGB, red: 0.0745, green: 0.1765, blue: 0.6863, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 0.9529, green: 0.9569, blue: 0.9843, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.0745, green: 0.1765, blue: 0.6863, opacity: 1.0)
                public static let softBgHover: SwiftUI.Color = .init(.sRGB, red: 0.8941, green: 0.9098, blue: 0.9882, opacity: 1.0)
                public static let softBgPressed: SwiftUI.Color = .init(.sRGB, red: 0.7608, green: 0.8039, blue: 1.0, opacity: 1.0)
            }
            public enum Danger {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1412, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1412, opacity: 1.0)
                public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let bgHover: SwiftUI.Color = .init(.sRGB, red: 0.6275, green: 0.1137, blue: 0.1255, opacity: 1.0)
                public static let bgPressed: SwiftUI.Color = .init(.sRGB, red: 0.4784, green: 0.1098, blue: 0.1059, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.9412, blue: 0.9294, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.4784, green: 0.1098, blue: 0.1059, opacity: 1.0)
                public static let softBgHover: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.8863, blue: 0.8627, opacity: 1.0)
                public static let softBgPressed: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.7529, blue: 0.7059, opacity: 1.0)
            }
            public enum Warning {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.4431, green: 0.3608, blue: 0.1216, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.4431, green: 0.3608, blue: 0.1216, opacity: 1.0)
                public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let bgHover: SwiftUI.Color = .init(.sRGB, red: 0.3922, green: 0.3137, blue: 0.1137, opacity: 1.0)
                public static let bgPressed: SwiftUI.Color = .init(.sRGB, red: 0.3098, green: 0.2392, blue: 0.098, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 0.9804, green: 0.9608, blue: 0.8078, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.3098, green: 0.2392, blue: 0.098, opacity: 1.0)
                public static let softBgHover: SwiftUI.Color = .init(.sRGB, red: 0.9608, green: 0.9176, blue: 0.6157, opacity: 1.0)
                public static let softBgPressed: SwiftUI.Color = .init(.sRGB, red: 0.8824, green: 0.8235, blue: 0.1843, opacity: 1.0)
            }
            public enum Success {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.4196, blue: 0.251, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.4196, blue: 0.251, opacity: 1.0)
                public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let bgHover: SwiftUI.Color = .init(.sRGB, red: 0.1176, green: 0.3686, blue: 0.2235, opacity: 1.0)
                public static let bgPressed: SwiftUI.Color = .init(.sRGB, red: 0.1059, green: 0.2824, blue: 0.1765, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 0.8824, green: 0.9804, blue: 0.9098, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.1059, green: 0.2824, blue: 0.1765, opacity: 1.0)
                public static let softBgHover: SwiftUI.Color = .init(.sRGB, red: 0.7647, green: 0.9569, blue: 0.8196, opacity: 1.0)
                public static let softBgPressed: SwiftUI.Color = .init(.sRGB, red: 0.4588, green: 0.898, blue: 0.6235, opacity: 1.0)
            }
            public enum Info {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let bgHover: SwiftUI.Color = .init(.sRGB, red: 0.1412, green: 0.298, blue: 0.6667, opacity: 1.0)
                public static let bgPressed: SwiftUI.Color = .init(.sRGB, red: 0.1373, green: 0.2314, blue: 0.5059, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 0.9529, green: 0.9529, blue: 1.0, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.1373, green: 0.2314, blue: 0.5059, opacity: 1.0)
                public static let softBgHover: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.902, blue: 1.0, opacity: 1.0)
                public static let softBgPressed: SwiftUI.Color = .init(.sRGB, red: 0.7843, green: 0.7961, blue: 1.0, opacity: 1.0)
            }
            public enum Plain {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.3216, green: 0.3765, blue: 0.4431, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.5216, green: 0.5725, blue: 0.6353, opacity: 1.0)
                public static let focusRing: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let bgHover: SwiftUI.Color = .init(.sRGB, red: 0.2824, green: 0.3255, blue: 0.3843, opacity: 1.0)
                public static let bgPressed: SwiftUI.Color = .init(.sRGB, red: 0.2196, green: 0.2549, blue: 0.2941, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 0.949, green: 0.9569, blue: 0.9647, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.2196, green: 0.2549, blue: 0.2941, opacity: 1.0)
                public static let softBgHover: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.9098, blue: 0.9255, opacity: 1.0)
                public static let softBgPressed: SwiftUI.Color = .init(.sRGB, red: 0.7882, green: 0.8118, blue: 0.8471, opacity: 1.0)
            }
            public enum Disabled {
                public static let bg: SwiftUI.Color = .init(.sRGB, red: 0.7882, green: 0.8118, blue: 0.8471, opacity: 1.0)
                public static let fg: SwiftUI.Color = .init(.sRGB, red: 0.6078, green: 0.651, blue: 0.7098, opacity: 1.0)
                public static let border: SwiftUI.Color = .init(.sRGB, red: 0.7882, green: 0.8118, blue: 0.8471, opacity: 1.0)
                public static let softBg: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.9098, blue: 0.9255, opacity: 1.0)
                public static let softFg: SwiftUI.Color = .init(.sRGB, red: 0.7059, green: 0.7373, blue: 0.7843, opacity: 1.0)
            }
        }
        public enum Dataviz {
            public enum Categorical {
                public static let s1: SwiftUI.Color = .init(.sRGB, red: 0.1098, green: 0.2588, blue: 1.0, opacity: 1.0)
                public static let s2: SwiftUI.Color = .init(.sRGB, red: 0.6235, green: 0.0941, blue: 0.3255, opacity: 1.0)
                public static let s3: SwiftUI.Color = .init(.sRGB, red: 0.0, green: 0.3647, blue: 0.3647, opacity: 1.0)
                public static let s4: SwiftUI.Color = .init(.sRGB, red: 0.698, green: 0.5255, blue: 0.0, opacity: 1.0)
                public static let s5: SwiftUI.Color = .init(.sRGB, red: 0.4118, green: 0.1608, blue: 0.7686, opacity: 1.0)
                public static let s6: SwiftUI.Color = .init(.sRGB, red: 0.098, green: 0.502, blue: 0.2196, opacity: 1.0)
            }
            public enum Sequential {
                public static let s1: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.902, blue: 1.0, opacity: 1.0)
                public static let s2: SwiftUI.Color = .init(.sRGB, red: 0.7843, green: 0.7961, blue: 1.0, opacity: 1.0)
                public static let s3: SwiftUI.Color = .init(.sRGB, red: 0.6902, green: 0.7137, blue: 1.0, opacity: 1.0)
                public static let s4: SwiftUI.Color = .init(.sRGB, red: 0.1098, green: 0.3882, blue: 0.8824, opacity: 1.0)
                public static let s5: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
                public static let s6: SwiftUI.Color = .init(.sRGB, red: 0.1412, green: 0.298, blue: 0.6667, opacity: 1.0)
                public static let s7: SwiftUI.Color = .init(.sRGB, red: 0.1373, green: 0.2314, blue: 0.5059, opacity: 1.0)
                public static let s8: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.1686, blue: 0.349, opacity: 1.0)
            }
            public enum Diverging {
                public static let s1: SwiftUI.Color = .init(.sRGB, red: 0.6275, green: 0.1137, blue: 0.1255, opacity: 1.0)
                public static let s2: SwiftUI.Color = .init(.sRGB, red: 0.8235, green: 0.102, blue: 0.1529, opacity: 1.0)
                public static let s3: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.6431, blue: 0.5882, opacity: 1.0)
                public static let s4: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.9098, blue: 0.9255, opacity: 1.0)
                public static let s5: SwiftUI.Color = .init(.sRGB, red: 0.3804, green: 0.8, blue: 0.7882, opacity: 1.0)
                public static let s6: SwiftUI.Color = .init(.sRGB, red: 0.1569, green: 0.4627, blue: 0.451, opacity: 1.0)
                public static let s7: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.3569, blue: 0.349, opacity: 1.0)
            }
        }
    }
    public enum Elevation {
        public enum Flat {
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
        }
        public enum Surface {
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
        }
        public enum Navigation {
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
        }
        public enum Popover {
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
        }
        public enum Modal {
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
        }
        public enum Notification {
            public static let surface: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
        }
    }
    public static let scrim: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
}
