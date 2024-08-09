"use strict";
// noinspection ExceptionCaughtLocallyJS
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHTMLElement = extractHTMLElement;
exports.extractHTMLElementIndex = extractHTMLElementIndex;
exports.extractJSONValueIndex = extractJSONValueIndex;
exports.buildHeaders = buildHeaders;
exports.convertResponsePosToAbsolutePos = convertResponsePosToAbsolutePos;
exports.parseHttpResponse = parseHttpResponse;
exports.makeRegex = makeRegex;
exports.matchRedactedStrings = matchRedactedStrings;
const esprima_next_1 = require("esprima-next");
const jsonpath_plus_1 = require("jsonpath-plus");
const utils_1 = require("../../utils");
let RE2;
try {
    RE2 = require('re2');
    if (!Object.keys(RE2).length) {
        RE2 = undefined;
        throw new Error();
    }
}
catch (_a) {
    console.log('RE2 not found. Using standard regex');
}
let jsd;
if (typeof window !== 'undefined') {
    // @ts-ignore
    jsd = window.jsdom;
}
else {
    jsd = require('jsdom');
}
function extractHTMLElement(html, xpathExpression, contentsOnly) {
    const { start, end } = extractHTMLElementIndex(html, xpathExpression, contentsOnly);
    return html.slice(start, end);
}
function extractHTMLElementIndex(html, xpathExpression, contentsOnly) {
    var _a;
    const dom = new jsd.JSDOM(html, {
        contentType: 'text/html',
        includeNodeLocations: true
    });
    const document = dom.window.document;
    const node = (_a = document
        .evaluate(xpathExpression, document, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null)) === null || _a === void 0 ? void 0 : _a.singleNodeValue;
    if (!node) {
        throw new Error(`Failed to find XPath: "${xpathExpression}"`);
    }
    const nodeLocation = dom.nodeLocation(node);
    if (!nodeLocation) {
        throw new Error(`Failed to find XPath node location: "${xpathExpression}"`);
    }
    if (contentsOnly) {
        const start = nodeLocation.startTag.endOffset;
        const end = nodeLocation.endTag.startOffset;
        return { start, end };
    }
    else {
        return { start: nodeLocation.startOffset, end: nodeLocation.endOffset };
    }
}
function extractJSONValueIndex(json, jsonPath) {
    const pointers = (0, jsonpath_plus_1.JSONPath)({
        path: jsonPath,
        json: JSON.parse(json),
        wrap: false,
        resultType: 'pointer',
        preventEval: true
    });
    if (!pointers) {
        throw new Error('jsonPath not found');
    }
    const tree = (0, esprima_next_1.parseScript)('(' + json + ')', { range: true }); //wrap in parentheses for esprima to parse
    if (tree.body[0] instanceof esprima_next_1.ExpressionStatement) {
        if (tree.body[0].expression instanceof esprima_next_1.ObjectExpression || tree.body[0].expression instanceof esprima_next_1.ArrayExpression) {
            const index = traverse(tree.body[0].expression, '', pointers);
            if (index) {
                return {
                    start: index.start - 1, //account for '('
                    end: index.end - 1,
                };
            }
        }
    }
    throw new Error('jsonPath not found');
}
/**
 * recursively go through AST tree and build a JSON path while it's not equal to the one we search for
 * @param o - esprima expression for root object
 * @param path - path that is being built
 * @param pointer - JSON pointer to compare to
 */
function traverse(o, path, pointer) {
    if (o instanceof esprima_next_1.ObjectExpression) {
        for (const p of o.properties) {
            if (p instanceof esprima_next_1.Property) {
                let localPath;
                if (p.key.type === esprima_next_1.Syntax.Literal) {
                    localPath = path + '/' + p.key.value;
                }
                else {
                    localPath = path;
                }
                if (localPath === pointer && 'range' in p && Array.isArray(p.range)) {
                    return {
                        start: p.range[0],
                        end: p.range[1],
                    };
                }
                if (p.value instanceof esprima_next_1.ObjectExpression) {
                    const res = traverse(p.value, localPath, pointer);
                    if (res) {
                        return res;
                    }
                }
                if (p.value instanceof esprima_next_1.ArrayExpression) {
                    const res = traverse(p.value, localPath, pointer);
                    if (res) {
                        return res;
                    }
                }
            }
        }
    }
    if (o instanceof esprima_next_1.ArrayExpression) {
        for (let i = 0; i < o.elements.length; i++) {
            const element = o.elements[i];
            if (!element) {
                continue;
            }
            const localPath = path + '/' + i;
            if (localPath === pointer &&
                'range' in element &&
                Array.isArray(element.range)) {
                return {
                    start: element.range[0],
                    end: element.range[1],
                };
            }
            if (element instanceof esprima_next_1.ObjectExpression) {
                const res = traverse(element, localPath, pointer);
                if (res) {
                    return res;
                }
            }
            if (element instanceof esprima_next_1.ArrayExpression) {
                const res = traverse(element, localPath, pointer);
                if (res) {
                    return res;
                }
            }
        }
    }
    return null;
}
function buildHeaders(input) {
    const headers = [];
    for (const [key, value] of Object.entries(input || {})) {
        headers.push(`${key}: ${value}`);
    }
    return headers;
}
/**
 * Converts position in HTTP response body to an absolute position in TLS transcript considering chunked encoding
 * @param pos
 * @param bodyStartIdx
 * @param chunks
 */
function convertResponsePosToAbsolutePos(pos, bodyStartIdx, chunks) {
    if (chunks === null || chunks === void 0 ? void 0 : chunks.length) {
        let chunkBodyStart = 0;
        for (let i = 0; i < chunks.length; i++) {
            const chunkSize = chunks[i].toIndex - chunks[i].fromIndex;
            if (pos >= chunkBodyStart && pos <= (chunkBodyStart + chunkSize)) {
                return pos - chunkBodyStart + chunks[i].fromIndex;
            }
            chunkBodyStart += chunkSize;
        }
        throw new Error('position out of range');
    }
    return bodyStartIdx + pos;
}
function parseHttpResponse(buff) {
    const parser = (0, utils_1.makeHttpResponseParser)();
    parser.onChunk(buff);
    parser.streamEnded();
    return parser.res;
}
function makeRegex(str) {
    if (RE2 !== undefined) {
        return RE2(str, 'sgiu');
    }
    return new RegExp(str, 'sgi');
}
const TEMPLATE_START_CHARCODE = '{'.charCodeAt(0);
const TEMPLATE_END_CHARCODE = '}'.charCodeAt(0);
/**
 * Try to match strings that contain templates like {{param}}
 * against redacted string that has *** instead of that param
 */
function matchRedactedStrings(templateString, redactedString) {
    if (templateString.length === 0 && (redactedString === null || redactedString === void 0 ? void 0 : redactedString.length) === 0) {
        return true;
    }
    if (!redactedString) {
        return false;
    }
    let ts = -1;
    let rs = -1;
    while (ts < templateString.length && rs < redactedString.length) {
        let ct = getTChar();
        let cr = getRChar();
        if (ct !== cr) {
            // only valid if param contains "{" & redacted contains "*"
            if (ct === TEMPLATE_START_CHARCODE && cr === utils_1.REDACTION_CHAR_CODE) {
                //check that the char after first "{" is also "{"
                if (getTChar() !== TEMPLATE_START_CHARCODE) {
                    return false;
                }
                //look for first closing bracket
                while (((ct = getTChar()) !== TEMPLATE_END_CHARCODE) && ct !== -1) {
                }
                //look for second closing bracket
                while (((ct = getTChar()) !== TEMPLATE_END_CHARCODE) && ct !== -1) {
                }
                if (ct === -1) {
                    return false;
                }
                //find the end of redaction
                while (((cr = getRChar()) === utils_1.REDACTION_CHAR_CODE) && cr !== -1) {
                }
                if (cr === -1) {
                    //if there's nothing after template too then both ended at the end of strings
                    return getTChar() === -1;
                }
                //rewind redacted string position back 1 char because we read one extra
                rs--;
            }
            else {
                return false;
            }
        }
    }
    function getTChar() {
        ts++;
        if (ts < templateString.length) {
            return templateString[ts];
        }
        else {
            return -1;
        }
    }
    function getRChar() {
        if (!redactedString) {
            return -1;
        }
        rs++;
        if (rs < redactedString.length) {
            return redactedString[rs];
        }
        else {
            return -1;
        }
    }
    return ts === templateString.length && rs === redactedString.length;
}
