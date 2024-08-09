"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApm = getApm;
const elastic_apm_node_1 = __importDefault(require("elastic-apm-node"));
const env_1 = require("../../utils/env");
const logger_1 = require("../../utils/logger");
let apm;
/**
 * Initialises the APM agent if required,
 * and returns it.
 *
 * Utilises the standard env variables mentioned
 * here: https://www.elastic.co/guide/en/apm/agent/nodejs/current/custom-stack.html#custom-stack-advanced-configuration
 */
function getApm() {
    if (!apm) {
        const sampleRate = +((0, env_1.getEnvVariable)('ELASTIC_APM_SAMPLE_RATE')
            || '0.1');
        apm = elastic_apm_node_1.default.start({
            serviceName: 'reclaim_witness',
            serviceVersion: '2.0.0',
            transactionSampleRate: sampleRate,
            instrumentIncomingHTTPRequests: false,
            instrument: true,
        });
        logger_1.logger.info('initialised APM agent');
    }
    return apm;
}
