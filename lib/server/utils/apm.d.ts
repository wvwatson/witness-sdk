import { Agent } from 'elastic-apm-node';
/**
 * Initialises the APM agent if required,
 * and returns it.
 *
 * Utilises the standard env variables mentioned
 * here: https://www.elastic.co/guide/en/apm/agent/nodejs/current/custom-stack.html#custom-stack-advanced-configuration
 */
export declare function getApm(): Agent | undefined;
