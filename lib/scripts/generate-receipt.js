"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const promises_1 = require("fs/promises");
require("../server/utils/config-env");
const server_1 = require("../server");
const utils_1 = require("../utils");
const env_1 = require("../utils/env");
const __1 = require("..");
const DEFAULT_WITNESS_HOST_PORT = 'wss://witness.reclaimprotocol.org/ws';
const PRIVATE_KEY_HEX = (0, env_1.getEnvVariable)('PRIVATE_KEY_HEX')
    // demo private key
    || '0x0123788edad59d7c013cdc85e4372f350f828e2cec62d9a2de4560e69aec7f89';
async function main(receiptParams) {
    var _a, _b;
    const paramsJson = receiptParams !== null && receiptParams !== void 0 ? receiptParams : (await getInputParameters());
    if (!(paramsJson.name in __1.providers)) {
        throw new Error(`Unknown provider "${paramsJson.name}"`);
    }
    (0, utils_1.assertValidateProviderParams)(paramsJson.name, paramsJson.params);
    let witnessHostPort = getCliArgument('witness')
        || DEFAULT_WITNESS_HOST_PORT;
    let server;
    if (witnessHostPort === 'local') {
        console.log('starting local witness server...');
        server = await (0, server_1.createServer)();
        witnessHostPort = `ws://localhost:${__1.API_SERVER_PORT}${__1.WS_PATHNAME}`;
    }
    const receipt = await (0, __1.createClaimOnWitness)({
        name: paramsJson.name,
        secretParams: paramsJson.secretParams,
        params: paramsJson.params,
        ownerPrivateKey: PRIVATE_KEY_HEX,
        client: { url: witnessHostPort },
        logger: __1.logger,
        zkEngine: 'snarkJS'
    });
    if (receipt.error) {
        console.error('claim creation failed:', receipt.error);
    }
    else {
        const ctx = ((_a = receipt.claim) === null || _a === void 0 ? void 0 : _a.context)
            ? JSON.parse(receipt.claim.context)
            : {};
        console.log(`receipt is valid for ${paramsJson.name} provider`);
        if (ctx.extractedParameters) {
            console.log('extracted params:', ctx.extractedParameters);
        }
    }
    const decTranscript = await (0, server_1.decryptTranscript)((_b = receipt.request) === null || _b === void 0 ? void 0 : _b.transcript, __1.logger, 'snarkJS');
    const transcriptStr = (0, __1.getTranscriptString)(decTranscript);
    console.log('receipt:\n', transcriptStr);
    const client = (0, __1.getWitnessClientFromPool)(witnessHostPort);
    await client.terminateConnection();
    server === null || server === void 0 ? void 0 : server.close();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getInputParameters() {
    const paramsJsonFile = getCliArgument('json');
    if (!paramsJsonFile) {
        const name = getCliArgument('name');
        const paramsStr = getCliArgument('params');
        const secretParamsStr = getCliArgument('secretParams');
        if (!name || !paramsStr || !secretParamsStr) {
            throw new Error('Either provide --json argument for parameters JSON or provide separately with --name, --params & --secretParams');
        }
        return {
            name,
            params: JSON.parse(paramsStr),
            secretParams: JSON.parse(secretParamsStr)
        };
    }
    let fileContents = await (0, promises_1.readFile)(paramsJsonFile, 'utf8');
    for (const variable in process.env) {
        fileContents = fileContents.replace(`{{${variable}}}`, process.env[variable]);
    }
    return JSON.parse(fileContents);
}
function getCliArgument(arg) {
    const index = process.argv.indexOf(`--${arg}`);
    if (index === -1) {
        return undefined;
    }
    return process.argv[index + 1];
}
if (require.main === module) {
    main()
        .catch(err => {
        console.error('error in receipt gen', err);
    });
}
