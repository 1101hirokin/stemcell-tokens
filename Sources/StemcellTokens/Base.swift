// @stemcell/tokens が生成した。手で直さない。
// 長さは pt。数は Web の CSS px と同じ値である（size.md §5）。
// 時間は秒。SwiftUI の Animation が TimeInterval を取るため。
//
// 出していないトークン（土地の写像が要る。DESIGN.md §9）:
//   letter-spacing.tight
//   letter-spacing.normal
//   letter-spacing.wide
//   letter-spacing.wider
//   font-family.normal
//   font-family.code
//   focus-ring.style
//   container.prose
//   typography.display-lg.fontFamily
//   typography.display-lg.letterSpacing
//   typography.display-md.fontFamily
//   typography.display-md.letterSpacing
//   typography.headline-lg.fontFamily
//   typography.headline-lg.letterSpacing
//   typography.headline-md.fontFamily
//   typography.headline-md.letterSpacing
//   typography.headline-sm.fontFamily
//   typography.headline-sm.letterSpacing
//   typography.title-lg.fontFamily
//   typography.title-lg.letterSpacing
//   typography.title-md.fontFamily
//   typography.title-md.letterSpacing
//   typography.title-sm.fontFamily
//   typography.title-sm.letterSpacing
//   typography.body-lg.fontFamily
//   typography.body-lg.letterSpacing
//   typography.body-md.fontFamily
//   typography.body-md.letterSpacing
//   typography.body-sm.fontFamily
//   typography.body-sm.letterSpacing
//   typography.label-lg.fontFamily
//   typography.label-lg.letterSpacing
//   typography.label-md.fontFamily
//   typography.label-md.letterSpacing
//   typography.label-sm.fontFamily
//   typography.label-sm.letterSpacing
//   typography.mono-md.fontFamily
//   typography.mono-md.letterSpacing
//   typography.mono-sm.fontFamily
//   typography.mono-sm.letterSpacing

import CoreGraphics
import SwiftUI

public enum StemcellTokens {
    public enum Color {
        public enum Red {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.9412, blue: 0.9294, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.8863, blue: 0.8627, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.7529, blue: 0.7059, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.6431, blue: 0.5882, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.498, blue: 0.4392, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.8235, green: 0.102, blue: 0.1529, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1412, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.6275, green: 0.1137, blue: 0.1255, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.4784, green: 0.1098, blue: 0.1059, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.3373, green: 0.098, blue: 0.0824, opacity: 1.0)
        }
        public enum Orange {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.9451, blue: 0.9098, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.8902, blue: 0.8157, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.7608, blue: 0.6039, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.9961, green: 0.6549, blue: 0.4392, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.9569, green: 0.5373, blue: 0.2431, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.651, green: 0.3294, blue: 0.098, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.5725, green: 0.2941, blue: 0.0941, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.498, green: 0.2588, blue: 0.0902, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.3843, green: 0.2039, blue: 0.0824, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.2745, green: 0.149, blue: 0.0706, opacity: 1.0)
        }
        public enum Yellow {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.9804, green: 0.9608, blue: 0.8078, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.9608, green: 0.9176, blue: 0.6157, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.8824, green: 0.8235, blue: 0.1843, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.8235, green: 0.7373, blue: 0.1725, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.7412, green: 0.6431, blue: 0.1647, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.4902, green: 0.4118, blue: 0.1294, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.4431, green: 0.3608, blue: 0.1216, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.3922, green: 0.3137, blue: 0.1137, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.3098, green: 0.2392, blue: 0.098, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.2275, green: 0.1725, blue: 0.0824, opacity: 1.0)
        }
        public enum Green {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.8824, green: 0.9804, blue: 0.9098, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.7647, green: 0.9569, blue: 0.8196, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.4588, green: 0.898, blue: 0.6235, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.051, green: 0.8431, blue: 0.4824, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.098, green: 0.7412, blue: 0.4275, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.1255, green: 0.4745, blue: 0.2824, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.4196, blue: 0.251, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.1176, green: 0.3686, blue: 0.2235, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.1059, green: 0.2824, blue: 0.1765, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.0902, green: 0.2039, blue: 0.1333, opacity: 1.0)
        }
        public enum Teal {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.9686, blue: 0.9647, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.8039, green: 0.9373, blue: 0.9333, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.5725, green: 0.8627, blue: 0.851, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.3804, green: 0.8, blue: 0.7882, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.2431, green: 0.7137, blue: 0.698, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.1569, green: 0.4627, blue: 0.451, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.1373, green: 0.4078, blue: 0.4, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.3569, blue: 0.349, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.0941, green: 0.2784, blue: 0.2706, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.0667, green: 0.2, blue: 0.1961, opacity: 1.0)
        }
        public enum Blue {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.9529, green: 0.9529, blue: 1.0, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.902, blue: 1.0, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.7843, green: 0.7961, blue: 1.0, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.6902, green: 0.7137, blue: 1.0, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.5608, green: 0.6196, blue: 1.0, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.1098, green: 0.3882, blue: 0.8824, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.1294, green: 0.3412, blue: 0.7725, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.1412, green: 0.298, blue: 0.6667, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.1373, green: 0.2314, blue: 0.5059, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.1216, green: 0.1686, blue: 0.349, opacity: 1.0)
        }
        public enum Purple {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.9843, green: 0.9412, blue: 1.0, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.9647, green: 0.8824, blue: 0.9961, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.9216, green: 0.749, blue: 0.9922, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.8824, green: 0.6471, blue: 0.9843, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.8275, green: 0.5216, blue: 0.9765, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.651, green: 0.0314, blue: 0.9373, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.5765, green: 0.0706, blue: 0.8235, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.502, green: 0.0902, blue: 0.7098, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.3843, green: 0.098, blue: 0.5333, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.2745, green: 0.0902, blue: 0.3686, opacity: 1.0)
        }
        public enum Pink {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.9412, blue: 0.9686, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.8784, blue: 0.9373, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.7333, blue: 0.8667, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.9882, green: 0.6235, blue: 0.8118, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.9686, green: 0.4784, blue: 0.7451, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.7412, green: 0.1843, blue: 0.5216, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.651, green: 0.1765, blue: 0.4588, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.5647, green: 0.1608, blue: 0.4, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.4314, green: 0.1412, blue: 0.3059, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.302, green: 0.1137, blue: 0.2196, opacity: 1.0)
        }
        public enum Viz {
            public enum Magenta {
                public static let s300: SwiftUI.Color = .init(.sRGB, red: 1.0, green: 0.4941, blue: 0.7137, opacity: 1.0)
                public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.6235, green: 0.0941, blue: 0.3255, opacity: 1.0)
            }
            public enum Teal {
                public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.0314, green: 0.7412, blue: 0.7294, opacity: 1.0)
                public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.0, green: 0.3647, blue: 0.3647, opacity: 1.0)
            }
            public enum Gold {
                public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.8235, green: 0.6314, blue: 0.0235, opacity: 1.0)
                public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.698, green: 0.5255, blue: 0.0, opacity: 1.0)
            }
            public enum Violet {
                public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.8314, green: 0.7333, blue: 1.0, opacity: 1.0)
                public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.4118, green: 0.1608, blue: 0.7686, opacity: 1.0)
            }
            public enum Green {
                public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.4353, green: 0.8627, blue: 0.549, opacity: 1.0)
                public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.098, green: 0.502, blue: 0.2196, opacity: 1.0)
            }
        }
        public enum Gray {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.949, green: 0.9569, blue: 0.9647, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.902, green: 0.9098, blue: 0.9255, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.7882, green: 0.8118, blue: 0.8471, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.7059, green: 0.7373, blue: 0.7843, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.6078, green: 0.651, blue: 0.7098, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.3608, green: 0.4235, blue: 0.502, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.3216, green: 0.3765, blue: 0.4431, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.2824, green: 0.3255, blue: 0.3843, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.2196, green: 0.2549, blue: 0.2941, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.1608, green: 0.1843, blue: 0.2118, opacity: 1.0)
        }
        public enum Brand {
            public static let s50: SwiftUI.Color = .init(.sRGB, red: 0.9529, green: 0.9569, blue: 0.9843, opacity: 1.0)
            public static let s100: SwiftUI.Color = .init(.sRGB, red: 0.8941, green: 0.9098, blue: 0.9882, opacity: 1.0)
            public static let s200: SwiftUI.Color = .init(.sRGB, red: 0.7608, green: 0.8039, blue: 1.0, opacity: 1.0)
            public static let s300: SwiftUI.Color = .init(.sRGB, red: 0.6667, green: 0.7255, blue: 1.0, opacity: 1.0)
            public static let s400: SwiftUI.Color = .init(.sRGB, red: 0.549, green: 0.6275, blue: 1.0, opacity: 1.0)
            public static let s500: SwiftUI.Color = .init(.sRGB, red: 0.2078, green: 0.3412, blue: 1.0, opacity: 1.0)
            public static let s600: SwiftUI.Color = .init(.sRGB, red: 0.1098, green: 0.2588, blue: 1.0, opacity: 1.0)
            public static let s700: SwiftUI.Color = .init(.sRGB, red: 0.0392, green: 0.1922, blue: 0.9412, opacity: 1.0)
            public static let s800: SwiftUI.Color = .init(.sRGB, red: 0.0745, green: 0.1765, blue: 0.6863, opacity: 1.0)
            public static let s900: SwiftUI.Color = .init(.sRGB, red: 0.0863, green: 0.1451, blue: 0.451, opacity: 1.0)
        }
    }
    public enum FontWeight {
        public static let regular: CGFloat = 400
        public static let medium: CGFloat = 500
        public static let semibold: CGFloat = 600
        public static let bold: CGFloat = 700
    }
    public enum FontSize {
        public static let s0: CGFloat = 42
        public static let s1: CGFloat = 28
        public static let s2: CGFloat = 21
        public static let s3: CGFloat = 16.8
        public static let s4: CGFloat = 14
        public static let s5: CGFloat = 12
        public static let s6: CGFloat = 10.5
    }
    public static let lineHeight: CGFloat = 1.334
    public enum LetterSpacing {
    }
    public enum Elevation {
        public enum Flat {
            public static let level: CGFloat = 0
        }
        public enum Surface {
            public static let level: CGFloat = 1
        }
        public enum Navigation {
            public static let level: CGFloat = 2
        }
        public enum Popover {
            public static let level: CGFloat = 3
        }
        public enum Modal {
            public static let level: CGFloat = 4
        }
        public enum Notification {
            public static let level: CGFloat = 5
        }
    }
    public enum Spacing {
        public static let s0: CGFloat = 0
        public static let s1: CGFloat = 4
        public static let s2: CGFloat = 8
        public static let s3: CGFloat = 12
        public static let s4: CGFloat = 16
        public static let s5: CGFloat = 20
        public static let s6: CGFloat = 24
        public static let s7: CGFloat = 28
        public static let s8: CGFloat = 32
        public static let s9: CGFloat = 36
        public static let s10: CGFloat = 40
        public static let s11: CGFloat = 44
        public static let s12: CGFloat = 48
        public static let s13: CGFloat = 52
        public static let s14: CGFloat = 56
        public static let s15: CGFloat = 60
        public static let s16: CGFloat = 64
        public static let s17: CGFloat = 68
        public static let s18: CGFloat = 72
        public static let s19: CGFloat = 76
        public static let s20: CGFloat = 80
        public static let s21: CGFloat = 84
        public static let s22: CGFloat = 88
        public static let s23: CGFloat = 92
        public static let s24: CGFloat = 96
        public enum Inset {
            public static let sm: CGFloat = 8
            public static let md: CGFloat = 12
            public static let lg: CGFloat = 16
        }
        public enum Stack {
            public static let sm: CGFloat = 8
            public static let md: CGFloat = 12
            public static let lg: CGFloat = 16
        }
        public enum Inline {
            public static let sm: CGFloat = 4
            public static let md: CGFloat = 8
            public static let lg: CGFloat = 8
        }
        public enum Gap {
            public static let sm: CGFloat = 8
            public static let md: CGFloat = 12
            public static let lg: CGFloat = 16
        }
    }
    public enum Shape {
        public static let circular: CGFloat = 9999
        public static let roundedS: CGFloat = 2
        public static let roundedM: CGFloat = 6
        public static let roundedL: CGFloat = 10
        public static let angular: CGFloat = 0
        public static let borderWidth: CGFloat = 1
        public static let smoothing: CGFloat = 0.6
        public enum Semantic {
            public static let control: CGFloat = 6
            public static let selection: CGFloat = 2
            public static let card: CGFloat = 6
            public static let dialog: CGFloat = 10
            public static let popover: CGFloat = 6
            public static let pill: CGFloat = 9999
            public static let tag: CGFloat = 2
        }
        public enum Continuous {
            public static let roundedS: CGFloat = 6
            public static let roundedM: CGFloat = 14
            public static let roundedL: CGFloat = 20
            public enum Semantic {
                public static let control: CGFloat = 14
                public static let selection: CGFloat = 6
                public static let card: CGFloat = 14
                public static let dialog: CGFloat = 20
                public static let popover: CGFloat = 14
                public static let tag: CGFloat = 6
            }
        }
    }
    public enum FontFamily {
    }
    public enum FocusRing {
        public static let width: CGFloat = 2
        public static let offset: CGFloat = 2
    }
    public enum Motion {
        public enum Duration {
            public static let fast01: TimeInterval = 0.07
            public static let fast02: TimeInterval = 0.11
            public static let moderate01: TimeInterval = 0.15
            public static let moderate02: TimeInterval = 0.24
            public static let slow01: TimeInterval = 0.4
            public static let slow02: TimeInterval = 0.7
        }
        public enum Easing {
            public static let standard: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 0.38, 0.9)
            public static let exit: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 1, 1)
            public static let linear: (CGFloat, CGFloat, CGFloat, CGFloat) = (0, 0, 1, 1)
        }
        public static let scale: CGFloat = 1
        public enum None {
            public static let duration: TimeInterval = 0
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0, 0, 1, 1)
        }
        public enum Feedback {
            public static let duration: TimeInterval = 0.11
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 0.38, 0.9)
        }
        public enum Transition {
            public static let duration: TimeInterval = 0.15
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 0.38, 0.9)
        }
        public enum Entrance {
            public static let duration: TimeInterval = 0.24
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 0.38, 0.9)
        }
        public enum Exit {
            public static let duration: TimeInterval = 0.15
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 1, 1)
        }
        public enum Expand {
            public static let duration: TimeInterval = 0.24
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 0.38, 0.9)
        }
        public enum Draw {
            public static let duration: TimeInterval = 0.4
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0.2, 0, 0.38, 0.9)
        }
        public enum Loop {
            public static let duration: TimeInterval = 0.7
            public static let easing: (CGFloat, CGFloat, CGFloat, CGFloat) = (0, 0, 1, 1)
        }
    }
    public enum Layer {
        public enum Base {
            public static let rank: CGFloat = 0
            public static let z: CGFloat = 0
        }
        public enum Navigation {
            public static let rank: CGFloat = 1
            public static let z: CGFloat = 10
        }
        public enum Popover {
            public static let rank: CGFloat = 2
            public static let z: CGFloat = 1000
        }
        public enum Scrim {
            public static let rank: CGFloat = 3
            public static let z: CGFloat = 1300
        }
        public enum Modal {
            public static let rank: CGFloat = 4
            public static let z: CGFloat = 1400
        }
        public enum Notification {
            public static let rank: CGFloat = 5
            public static let z: CGFloat = 1700
        }
        public enum Tooltip {
            public static let rank: CGFloat = 6
            public static let z: CGFloat = 1800
        }
    }
    public enum Breakpoint {
        public static let compact: CGFloat = 0
        public static let medium: CGFloat = 600
        public static let expanded: CGFloat = 840
        public static let large: CGFloat = 1200
        public static let xLarge: CGFloat = 1600
    }
    public enum Container {
        public static let sm: CGFloat = 640
        public static let md: CGFloat = 768
        public static let lg: CGFloat = 1024
        public static let xl: CGFloat = 1280
    }
    public enum Avatar {
        public static let sm: CGFloat = 24
        public static let md: CGFloat = 32
        public static let lg: CGFloat = 40
    }
    public enum Loader {
        public static let sm: CGFloat = 16
        public static let md: CGFloat = 24
        public static let lg: CGFloat = 32
    }
    public enum Progress {
        public static let trackThickness: CGFloat = 4
    }
    public enum Selection {
        public static let size: CGFloat = 16
        public static let markSize: CGFloat = 8
    }
    public enum Slider {
        public static let trackThickness: CGFloat = 4
        public static let thumbSize: CGFloat = 16
    }
    public enum Typography {
        public enum DisplayLg {
            public static let fontWeight: CGFloat = 600
            public static let fontSize: CGFloat = 42
            public static let lineHeight: CGFloat = 1.334
        }
        public enum DisplayMd {
            public static let fontWeight: CGFloat = 600
            public static let fontSize: CGFloat = 28
            public static let lineHeight: CGFloat = 1.334
        }
        public enum HeadlineLg {
            public static let fontWeight: CGFloat = 700
            public static let fontSize: CGFloat = 28
            public static let lineHeight: CGFloat = 1.334
        }
        public enum HeadlineMd {
            public static let fontWeight: CGFloat = 700
            public static let fontSize: CGFloat = 21
            public static let lineHeight: CGFloat = 1.334
        }
        public enum HeadlineSm {
            public static let fontWeight: CGFloat = 700
            public static let fontSize: CGFloat = 16.8
            public static let lineHeight: CGFloat = 1.334
        }
        public enum TitleLg {
            public static let fontWeight: CGFloat = 600
            public static let fontSize: CGFloat = 21
            public static let lineHeight: CGFloat = 1.334
        }
        public enum TitleMd {
            public static let fontWeight: CGFloat = 600
            public static let fontSize: CGFloat = 16.8
            public static let lineHeight: CGFloat = 1.334
        }
        public enum TitleSm {
            public static let fontWeight: CGFloat = 600
            public static let fontSize: CGFloat = 14
            public static let lineHeight: CGFloat = 1.334
        }
        public enum BodyLg {
            public static let fontWeight: CGFloat = 400
            public static let fontSize: CGFloat = 16.8
            public static let lineHeight: CGFloat = 1.334
        }
        public enum BodyMd {
            public static let fontWeight: CGFloat = 400
            public static let fontSize: CGFloat = 14
            public static let lineHeight: CGFloat = 1.334
        }
        public enum BodySm {
            public static let fontWeight: CGFloat = 400
            public static let fontSize: CGFloat = 12
            public static let lineHeight: CGFloat = 1.334
        }
        public enum LabelLg {
            public static let fontWeight: CGFloat = 500
            public static let fontSize: CGFloat = 14
            public static let lineHeight: CGFloat = 1.334
        }
        public enum LabelMd {
            public static let fontWeight: CGFloat = 500
            public static let fontSize: CGFloat = 12
            public static let lineHeight: CGFloat = 1.334
        }
        public enum LabelSm {
            public static let fontWeight: CGFloat = 500
            public static let fontSize: CGFloat = 10.5
            public static let lineHeight: CGFloat = 1.334
        }
        public enum MonoMd {
            public static let fontWeight: CGFloat = 400
            public static let fontSize: CGFloat = 14
            public static let lineHeight: CGFloat = 1.334
        }
        public enum MonoSm {
            public static let fontWeight: CGFloat = 400
            public static let fontSize: CGFloat = 12
            public static let lineHeight: CGFloat = 1.334
        }
    }
}
