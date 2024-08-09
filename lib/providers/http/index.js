"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tls_1 = require("@reclaimprotocol/tls");
const config_1 = require("../../config");
const utils_1 = require("../../utils");
const utils_2 = require("./utils");
const OK_HTTP_HEADER = 'HTTP/1.1 200';
const dateHeaderRegex = '[dD]ate: ((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (?:[0-3][0-9]) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (?:[0-9]{4}) (?:[01][0-9]|2[0-3])(?::[0-5][0-9]){2} GMT)';
const dateDiff = 1000 * 60 * 10; // allow 10 min difference
const HTTP_PROVIDER = {
    hostPort: getHostPort,
    writeRedactionMode(params) {
        return ('writeRedactionMode' in params)
            ? params.writeRedactionMode
            : undefined;
    },
    geoLocation(params) {
        return ('geoLocation' in params)
            ? getGeoLocation(params)
            : undefined;
    },
    additionalClientOptions(params) {
        let defaultOptions = {
            applicationLayerProtocols: ['http/1.1']
        };
        if ('additionalClientOptions' in params) {
            defaultOptions = {
                ...defaultOptions,
                ...params.additionalClientOptions
            };
        }
        return defaultOptions;
    },
    createRequest(secretParams, params) {
        var _a;
        if (!secretParams.cookieStr &&
            !secretParams.authorisationHeader &&
            !secretParams.headers) {
            throw new Error('auth parameters are not set');
        }
        const pubHeaders = params.headers || {};
        const secHeaders = { ...secretParams.headers };
        if (secretParams.cookieStr) {
            secHeaders['Cookie'] = secretParams.cookieStr;
        }
        if (secretParams.authorisationHeader) {
            secHeaders['Authorization'] = secretParams.authorisationHeader;
        }
        const hasUserAgent = Object.keys(pubHeaders)
            .some(k => k.toLowerCase() === 'user-agent') ||
            Object.keys(secHeaders)
                .some(k => k.toLowerCase() === 'user-agent');
        if (!hasUserAgent) {
            //only set user-agent if not set by provider
            pubHeaders['User-Agent'] = config_1.RECLAIM_USER_AGENT;
        }
        const newParams = substituteParamValues(params, secretParams);
        params = newParams.newParams;
        const url = new URL(params.url);
        const { pathname } = url;
        const searchParams = params.url.includes('?') ? params.url.split('?')[1] : '';
        utils_1.logger.info({ url: params.url, path: pathname, query: searchParams.toString() });
        const body = params.body instanceof Uint8Array
            ? params.body
            : (0, tls_1.strToUint8Array)(params.body || '');
        const contentLength = body.length;
        const reqLine = `${params.method} ${pathname}${(searchParams === null || searchParams === void 0 ? void 0 : searchParams.length) ? '?' + searchParams : ''} HTTP/1.1`;
        const secHeadersList = (0, utils_2.buildHeaders)(secHeaders);
        utils_1.logger.info({ requestLine: reqLine });
        const httpReqHeaderStr = [
            reqLine,
            `Host: ${getHostHeaderString(url)}`,
            `Content-Length: ${contentLength}`,
            'Connection: close',
            //no compression
            'Accept-Encoding: identity',
            ...(0, utils_2.buildHeaders)(pubHeaders),
            ...secHeadersList,
            '\r\n',
        ].join('\r\n');
        const headerStr = (0, tls_1.strToUint8Array)(httpReqHeaderStr);
        const data = (0, tls_1.concatenateUint8Arrays)([headerStr, body]);
        // hide all secret headers
        const secHeadersStr = secHeadersList.join('\r\n');
        const tokenStartIndex = (0, utils_1.findIndexInUint8Array)(data, (0, tls_1.strToUint8Array)(secHeadersStr));
        const redactions = [
            {
                fromIndex: tokenStartIndex,
                toIndex: tokenStartIndex + secHeadersStr.length,
            }
        ];
        if (((_a = newParams.hiddenBodyParts) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            for (const hiddenBodyPart of newParams.hiddenBodyParts) {
                if (hiddenBodyPart.length) {
                    redactions.push({
                        fromIndex: headerStr.length + hiddenBodyPart.index,
                        toIndex: headerStr.length + hiddenBodyPart.index + hiddenBodyPart.length,
                    });
                }
            }
        }
        return {
            data,
            redactions: redactions,
        };
    },
    getResponseRedactions(response, rawParams) {
        var _a, _b;
        const res = (0, utils_2.parseHttpResponse)(response);
        if (!((_a = rawParams.responseRedactions) === null || _a === void 0 ? void 0 : _a.length)) {
            return [];
        }
        const newParams = substituteParamValues(rawParams, undefined, true);
        const params = newParams.newParams;
        const headerEndIndex = res.statusLineEndIndex;
        const bodyStartIdx = (_b = res.bodyStartIndex) !== null && _b !== void 0 ? _b : 0;
        if (bodyStartIdx < 4) {
            utils_1.logger.error({ response: (0, utils_1.uint8ArrayToBinaryStr)(response) });
            throw new Error('Failed to find response body');
        }
        const reveals = [{ fromIndex: 0, toIndex: headerEndIndex }];
        //reveal date header
        if (res.headerIndices['date']) {
            reveals.push(res.headerIndices['date']);
        }
        const body = (0, utils_1.uint8ArrayToBinaryStr)(res.body);
        for (const rs of params.responseRedactions || []) {
            let element = body;
            let elementIdx = 0;
            let elementLength = -1;
            if (rs.xPath) {
                const { start, end } = (0, utils_2.extractHTMLElementIndex)(body, rs.xPath, !!rs.jsonPath);
                element = body.slice(start, end);
                elementIdx = start;
                elementLength = end - start;
            }
            if (rs.jsonPath) {
                const { start, end } = (0, utils_2.extractJSONValueIndex)(element, rs.jsonPath);
                element = body.slice(elementIdx + start, elementIdx + end);
                elementIdx += start;
                elementLength = end - start;
            }
            if (rs.regex) {
                const regexp = (0, utils_2.makeRegex)(rs.regex);
                const elem = element || body;
                const match = regexp.exec(elem);
                if (!(match === null || match === void 0 ? void 0 : match[0])) {
                    utils_1.logger.error({ response: (0, utils_1.uint8ArrayToBinaryStr)(res.body) });
                    throw new Error(`regexp ${rs.regex} does not match found element '${elem}'`);
                }
                elementIdx += match.index;
                elementLength = regexp.lastIndex - match.index;
                element = match[0];
            }
            if (elementIdx >= 0 && elementLength > 0) {
                const from = (0, utils_2.convertResponsePosToAbsolutePos)(elementIdx, bodyStartIdx, res.chunks);
                const to = (0, utils_2.convertResponsePosToAbsolutePos)(elementIdx + elementLength, bodyStartIdx, res.chunks);
                reveals.push({ fromIndex: from, toIndex: to });
            }
        }
        reveals.sort((a, b) => {
            return a.toIndex - b.toIndex;
        });
        const redactions = [];
        if (reveals.length > 1) {
            let currentIndex = 0;
            for (const r of reveals) {
                if (currentIndex < r.fromIndex) {
                    redactions.push({ fromIndex: currentIndex, toIndex: r.fromIndex });
                }
                currentIndex = r.toIndex;
            }
            redactions.push({ fromIndex: currentIndex, toIndex: response.length });
        }
        return redactions;
    },
    assertValidProviderReceipt(receipt, paramsAny) {
        let extractedParams = {};
        const secretParams = ('secretParams' in paramsAny) ? paramsAny.secretParams : undefined;
        const newParams = substituteParamValues(paramsAny, secretParams, false);
        const params = newParams.newParams;
        extractedParams = { ...extractedParams, ...newParams.extractedValues };
        const req = (0, utils_1.getHttpRequestDataFromTranscript)(receipt);
        if (req.method !== params.method.toLowerCase()) {
            logTranscript();
            throw new Error(`Invalid method: ${req.method}`);
        }
        const url = new URL(params.url);
        const { protocol, pathname } = url;
        if (protocol !== 'https:') {
            utils_1.logger.error('params URL: %s', params.url);
            logTranscript();
            throw new Error(`Expected protocol: https, found: ${protocol}`);
        }
        const searchParams = params.url.includes('?') ? params.url.split('?')[1] : '';
        const expectedPath = pathname + ((searchParams === null || searchParams === void 0 ? void 0 : searchParams.length) ? '?' + searchParams : '');
        if (req.url !== expectedPath) {
            utils_1.logger.error('params URL: %s', params.url);
            logTranscript();
            throw new Error(`Expected path: ${expectedPath}, found: ${req.url}`);
        }
        const expectedHostStr = getHostHeaderString(url);
        if (req.headers.host !== expectedHostStr) {
            logTranscript();
            throw new Error(`Expected host: ${expectedHostStr}, found: ${req.headers.host}`);
        }
        const connectionheader = req.headers['connection'];
        if (connectionheader !== 'close') {
            logTranscript();
            throw new Error(`Connection header must be "close", got "${connectionheader}"`);
        }
        const serverBlocks = receipt
            .filter(s => s.sender === 'server')
            .map((r) => r.message)
            .filter(b => !b.every(b => b === utils_1.REDACTION_CHAR_CODE)); // filter out fully redacted blocks
        const res = (0, utils_1.uint8ArrayToStr)(concatArrays(...serverBlocks));
        if (!res.startsWith(OK_HTTP_HEADER)) {
            logTranscript();
            const statusRegex = (0, utils_2.makeRegex)('^HTTP\\/1.1 (\\d{3})');
            const matchRes = statusRegex.exec(res);
            if (matchRes && matchRes.length > 1) {
                throw new Error(`Provider returned error ${matchRes[1]}"`);
            }
            throw new Error(`Response did not start with "${OK_HTTP_HEADER}"}`);
        }
        //validate server Date header if present
        const dateHeader = (0, utils_2.makeRegex)(dateHeaderRegex).exec(res);
        if ((dateHeader === null || dateHeader === void 0 ? void 0 : dateHeader.length) > 1) {
            const serverDate = Date.parse(dateHeader[1]);
            if ((Date.now() - serverDate) > dateDiff) {
                utils_1.logger.info({ dateHeader: dateHeader[0], current: Date.now() }, 'date header is off');
                throw new Error(`Server date is off by "${(Date.now() - serverDate) / 1000} s"`);
            }
        }
        const paramBody = params.body instanceof Uint8Array
            ? params.body
            : (0, tls_1.strToUint8Array)(params.body || '');
        if (paramBody.length > 0) {
            if (!(0, utils_2.matchRedactedStrings)(paramBody, req.body)) {
                logTranscript();
                throw new Error('request body mismatch');
            }
        }
        for (const { type, value, invert } of params.responseMatches || []) {
            const inv = Boolean(invert); // explicitly cast to boolean
            switch (type) {
                case 'regex':
                    const regexRes = (0, utils_2.makeRegex)(value).exec(res);
                    const match = regexRes !== null;
                    if (match === inv) { // if both true or both false then fail
                        logTranscript();
                        throw new Error(`Invalid receipt. Regex "${value}" ${invert ? 'matched' : "didn't match"}`);
                    }
                    if (match) {
                        const groups = regexRes === null || regexRes === void 0 ? void 0 : regexRes.groups;
                        if (groups) {
                            for (const paramName in groups) {
                                if (paramName in extractedParams) {
                                    throw new Error(`Duplicate parameter ${paramName}`);
                                }
                                extractedParams[paramName] = groups[paramName];
                            }
                        }
                    }
                    break;
                case 'contains':
                    const includes = res.includes(value);
                    if (includes === inv) {
                        logTranscript();
                        throw new Error(`Invalid receipt. Response ${invert ? 'contains' : 'does not contain'} "${value}"`);
                    }
                    break;
                default:
                    throw new Error(`Invalid response match type ${type}`);
            }
        }
        function concatArrays(...bufs) {
            const totalSize = bufs.reduce((acc, e) => acc + e.length, 0);
            const merged = new Uint8Array(totalSize);
            bufs.forEach((array, i, arrays) => {
                const offset = arrays.slice(0, i).reduce((acc, e) => acc + e.length, 0);
                merged.set(array, offset);
            });
            return merged;
        }
        return { extractedParameters: extractedParams };
        function logTranscript() {
            /*const clientMsgs = receipt.filter(s => s.sender === 'client').map(m => m.message)
            const serverMsgs = receipt.filter(s => s.sender === 'server').map(m => m.message)

            const clientTranscript = uint8ArrayToStr(concatenateUint8Arrays(clientMsgs))
            const serverTranscript = uint8ArrayToStr(concatenateUint8Arrays(serverMsgs))

            logger.error({ request: clientTranscript, response:serverTranscript, params:paramsAny })*/
        }
    },
};
function getHostPort(params) {
    const { host } = new URL(getURL(params));
    if (!host) {
        throw new Error('url is incorrect');
    }
    return host;
}
/**
 * Obtain the host header string from the URL.
 * https://stackoverflow.com/a/3364396
 */
function getHostHeaderString(url) {
    const host = url.hostname;
    const port = url.port;
    return port && +port !== config_1.DEFAULT_HTTPS_PORT
        ? `${host}:${port}`
        : host;
}
const paramsRegex = /\{\{([^{}]+)}}/sgi;
function substituteParamValues(currentParams, secretParams, ignoreMissingBodyParams) {
    const params = JSON.parse(JSON.stringify(currentParams));
    let extractedValues = {};
    const urlParams = extractAndReplaceTemplateValues(params.url);
    if (urlParams) {
        params.url = urlParams.newParam;
        extractedValues = { ...urlParams.extractedValues };
    }
    let bodyParams;
    let hiddenBodyParts = [];
    if (params.body) {
        const strBody = typeof params.body === 'string' ? params.body : (0, utils_1.uint8ArrayToStr)(params.body);
        bodyParams = extractAndReplaceTemplateValues(strBody, ignoreMissingBodyParams);
        if (bodyParams) {
            params.body = bodyParams.newParam;
            extractedValues = { ...extractedValues, ...bodyParams.extractedValues };
            hiddenBodyParts = bodyParams.hiddenParts;
        }
    }
    const geoParams = extractAndReplaceTemplateValues(params.geoLocation);
    if (geoParams) {
        params.geoLocation = geoParams.newParam;
        extractedValues = { ...extractedValues, ...geoParams.extractedValues };
    }
    if (params.responseRedactions) {
        params.responseRedactions.forEach(r => {
            if (r.regex) {
                const regexParams = extractAndReplaceTemplateValues(r.regex);
                r.regex = regexParams === null || regexParams === void 0 ? void 0 : regexParams.newParam;
            }
            if (r.xPath) {
                const xpathParams = extractAndReplaceTemplateValues(r.xPath);
                r.xPath = xpathParams === null || xpathParams === void 0 ? void 0 : xpathParams.newParam;
            }
            if (r.jsonPath) {
                const jsonPathParams = extractAndReplaceTemplateValues(r.jsonPath);
                r.jsonPath = jsonPathParams === null || jsonPathParams === void 0 ? void 0 : jsonPathParams.newParam;
            }
        });
    }
    if (params.responseMatches) {
        params.responseMatches.forEach(r => {
            if (r.value !== '') {
                const matchParam = extractAndReplaceTemplateValues(r.value);
                r.value = matchParam === null || matchParam === void 0 ? void 0 : matchParam.newParam;
                extractedValues = { ...extractedValues, ...matchParam === null || matchParam === void 0 ? void 0 : matchParam.extractedValues };
            }
        });
    }
    return {
        newParams: params,
        extractedValues: extractedValues,
        hiddenBodyParts: hiddenBodyParts
    };
    function extractAndReplaceTemplateValues(param, ignoreMissingParams) {
        if (!param) {
            return null;
        }
        //const paramNames: Set<string> = new Set()
        const extractedValues = {};
        const hiddenParts = [];
        let totalOffset = 0;
        param = param.replace(paramsRegex, (match, pn, offset) => {
            if (params.paramValues && pn in params.paramValues) {
                extractedValues[pn] = params.paramValues[pn];
                totalOffset += params.paramValues[pn].length - match.length;
                return params.paramValues[pn];
            }
            else if (secretParams) {
                if ((secretParams === null || secretParams === void 0 ? void 0 : secretParams.paramValues) && pn in (secretParams === null || secretParams === void 0 ? void 0 : secretParams.paramValues)) {
                    hiddenParts.push({
                        index: offset + totalOffset,
                        length: secretParams.paramValues[pn].length,
                    });
                    totalOffset += secretParams.paramValues[pn].length - match.length;
                    return secretParams.paramValues[pn];
                }
                else {
                    throw new Error(`parameter's "${pn}" value not found in paramValues and secret parameter's paramValues`);
                }
            }
            else {
                if (!(!!ignoreMissingParams)) {
                    throw new Error(`parameter's "${pn}" value not found in paramValues`);
                }
                else {
                    return match;
                }
            }
        });
        return {
            newParam: param,
            extractedValues: extractedValues,
            hiddenParts: hiddenParts
        };
    }
}
function getGeoLocation(v2Params) {
    if (v2Params === null || v2Params === void 0 ? void 0 : v2Params.geoLocation) {
        const paramNames = new Set();
        let geo = v2Params.geoLocation;
        //extract param names
        let match = null;
        while (match = paramsRegex.exec(geo)) {
            paramNames.add(match[1]);
        }
        paramNames.forEach(pn => {
            if (v2Params.paramValues && pn in v2Params.paramValues) {
                geo = geo === null || geo === void 0 ? void 0 : geo.replaceAll(`{{${pn}}}`, v2Params.paramValues[pn].toString());
            }
            else {
                throw new Error(`parameter "${pn}" value not found in templateParams`);
            }
        });
        return geo;
    }
    return undefined;
}
function getURL(v2Params) {
    let hostPort = v2Params === null || v2Params === void 0 ? void 0 : v2Params.url;
    const paramNames = new Set();
    //extract param names
    let match = null;
    while (match = paramsRegex.exec(hostPort)) {
        paramNames.add(match[1]);
    }
    paramNames.forEach(pn => {
        if (v2Params.paramValues && pn in v2Params.paramValues) {
            hostPort = hostPort === null || hostPort === void 0 ? void 0 : hostPort.replaceAll(`{{${pn}}}`, v2Params.paramValues[pn].toString());
        }
        else {
            throw new Error(`parameter "${pn}" value not found in templateParams`);
        }
    });
    return hostPort;
}
exports.default = HTTP_PROVIDER;
