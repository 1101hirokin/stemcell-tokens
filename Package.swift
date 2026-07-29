// swift-tools-version: 6.2
import PackageDescription

// stemcell のトークンを Swift から読むためのパッケージ。値は Style Dictionary が生成する。
// npm の側と同じリポジトリに置くのは、値の源が一つだからである。分けると版がずれる。
// manifest がリポジトリ直下にあるのは SPM の要求で、置き場所を選べない。
let package = Package(
    name: "stemcell-tokens",
    platforms: [.iOS(.v26), .macOS(.v26)],
    products: [
        .library(name: "StemcellTokens", targets: ["StemcellTokens"]),
    ],
    targets: [
        .target(name: "StemcellTokens"),
        .testTarget(name: "StemcellTokensTests", dependencies: ["StemcellTokens"]),
    ]
)
