import XCTest
import SwiftTreeSitter
import TreeSitterPic

final class TreeSitterPicTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_pic())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Pic grammar")
    }
}
