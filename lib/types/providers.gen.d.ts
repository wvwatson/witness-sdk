type BinaryData = Uint8Array | string;
export interface HttpProviderParameters {
    /**
     * which URL does the request have to be made to Has to be a valid https URL for eg. https://amazon.in/orders?q=abcd
     */
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH";
    /**
     * Specify the geographical location from where to proxy the request. 2-letter ISO country code
     */
    geoLocation?: string;
    /**
     * Any additional headers to be sent with the request Note: these will be revealed to the witness & won't be redacted from the transcript. To add hidden headers, use 'secretParams.headers' instead
     */
    headers?: {
        [k: string]: string;
    };
    /**
     * Body of the HTTP request
     */
    body?: BinaryData;
    /**
     * If the API doesn't perform well with the "key-update" method of redaction, you can switch to "zk" mode by setting this to "zk"
     */
    writeRedactionMode?: "zk" | "key-update";
    /**
     * Apply TLS configuration when creating the tunnel to the witness.
     */
    additionalClientOptions?: {
        /**
         * @minItems 1
         */
        supportedProtocolVersions?: ("TLS1_2" | "TLS1_3")[];
    };
    /**
     * The witness will use this list to check that the redacted response does indeed match all the provided strings/regexes
     *
     * @minItems 1
     */
    responseMatches: {
        /**
         * "regex": the response must match the regex "contains": the response must contain the provided
         *  string exactly
         */
        value: string;
        /**
         * The string/regex to match against
         */
        type: "regex" | "contains";
        /**
         * Inverses the matching logic. Fail when match is found and proceed otherwise
         */
        invert?: boolean;
    }[];
    /**
     * which portions to select from a response. These are selected in order, xpath => jsonPath => regex * These redactions are done client side and only the selected portions are sent to the witness. The witness will only be able to see the selected portions alongside the first line of the HTTP response (i.e. "HTTP/1.1 200 OK") * To disable any redactions, pass an empty array
     */
    responseRedactions?: {
        /**
         * expect an HTML response, and to contain a certain xpath for eg. "/html/body/div.a1/div.a2/span.a5"
         */
        xPath?: string;
        /**
         * expect a JSON response, retrieve the item at this path using dot notation for e.g. 'email.addresses.0'
         */
        jsonPath?: string;
        /**
         * select a regex match from the response
         */
        regex?: string;
    }[];
    /**
     * A map of parameter values which are user in form of {{param}} in URL, responseMatches, responseRedactions, body, geolocation. Those in URL, responseMatches & geo will be put into context and signed This value will NOT be included in provider hash
     */
    paramValues?: {
        [k: string]: string;
    };
}
export declare const HttpProviderParametersJson: {
    title: string;
    type: string;
    required: string[];
    properties: {
        url: {
            type: string;
            format: string;
            description: string;
        };
        method: {
            type: string;
            enum: string[];
        };
        geoLocation: {
            type: string;
            nullable: boolean;
            pattern: string;
            description: string;
        };
        headers: {
            type: string;
            description: string;
            additionalProperties: {
                type: string;
            };
        };
        body: {
            description: string;
            oneOf: ({
                type: string;
                format: string;
            } | {
                type: string;
                format?: undefined;
            })[];
        };
        writeRedactionMode: {
            type: string;
            description: string;
            enum: string[];
        };
        additionalClientOptions: {
            type: string;
            description: string;
            nullable: boolean;
            properties: {
                supportedProtocolVersions: {
                    type: string;
                    minItems: number;
                    uniqueItems: boolean;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
        };
        responseMatches: {
            type: string;
            minItems: number;
            uniqueItems: boolean;
            description: string;
            items: {
                type: string;
                required: string[];
                properties: {
                    value: {
                        type: string;
                        description: string;
                    };
                    type: {
                        type: string;
                        description: string;
                        enum: string[];
                    };
                    invert: {
                        type: string;
                        description: string;
                    };
                };
                additionalProperties: boolean;
            };
        };
        responseRedactions: {
            type: string;
            uniqueItems: boolean;
            description: string;
            items: {
                type: string;
                properties: {
                    xPath: {
                        type: string;
                        nullable: boolean;
                        description: string;
                    };
                    jsonPath: {
                        type: string;
                        nullable: boolean;
                        description: string;
                    };
                    regex: {
                        type: string;
                        nullable: boolean;
                        description: string;
                    };
                };
                additionalProperties: boolean;
            };
        };
        paramValues: {
            type: string;
            description: string;
            additionalProperties: {
                type: string;
            };
        };
    };
    additionalProperties: boolean;
};
/**
 * Secret parameters to be used with HTTP provider. None of the values in this object will be shown to the witness
 */
export interface HttpProviderSecretParameters {
    /**
     * cookie string for authorisation.
     */
    cookieStr?: string;
    /**
     * authorisation header value
     */
    authorisationHeader?: string;
    /**
     * Headers that need to be hidden from the witness
     */
    headers?: {
        [k: string]: string;
    };
    /**
     * A map of parameter values which are user in form of {{param}} in body these parameters will NOT be shown to witness and extracted
     */
    paramValues?: {
        [k: string]: string;
    };
}
export declare const HttpProviderSecretParametersJson: {
    title: string;
    type: string;
    description: string;
    properties: {
        cookieStr: {
            type: string;
            description: string;
        };
        authorisationHeader: {
            type: string;
            description: string;
        };
        headers: {
            type: string;
            description: string;
            additionalProperties: {
                type: string;
            };
        };
        paramValues: {
            type: string;
            description: string;
            additionalProperties: {
                type: string;
            };
        };
    };
    additionalProperties: boolean;
};
export interface ProvidersConfig {
    http: {
        parameters: HttpProviderParameters;
        secretParameters: HttpProviderSecretParameters;
    };
}
export declare const PROVIDER_SCHEMAS: {
    http: {
        parameters: {
            title: string;
            type: string;
            required: string[];
            properties: {
                url: {
                    type: string;
                    format: string;
                    description: string;
                };
                method: {
                    type: string;
                    enum: string[];
                };
                geoLocation: {
                    type: string;
                    nullable: boolean;
                    pattern: string;
                    description: string;
                };
                headers: {
                    type: string;
                    description: string;
                    additionalProperties: {
                        type: string;
                    };
                };
                body: {
                    description: string;
                    oneOf: ({
                        type: string;
                        format: string;
                    } | {
                        type: string;
                        format?: undefined;
                    })[];
                };
                writeRedactionMode: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                additionalClientOptions: {
                    type: string;
                    description: string;
                    nullable: boolean;
                    properties: {
                        supportedProtocolVersions: {
                            type: string;
                            minItems: number;
                            uniqueItems: boolean;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
                responseMatches: {
                    type: string;
                    minItems: number;
                    uniqueItems: boolean;
                    description: string;
                    items: {
                        type: string;
                        required: string[];
                        properties: {
                            value: {
                                type: string;
                                description: string;
                            };
                            type: {
                                type: string;
                                description: string;
                                enum: string[];
                            };
                            invert: {
                                type: string;
                                description: string;
                            };
                        };
                        additionalProperties: boolean;
                    };
                };
                responseRedactions: {
                    type: string;
                    uniqueItems: boolean;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            xPath: {
                                type: string;
                                nullable: boolean;
                                description: string;
                            };
                            jsonPath: {
                                type: string;
                                nullable: boolean;
                                description: string;
                            };
                            regex: {
                                type: string;
                                nullable: boolean;
                                description: string;
                            };
                        };
                        additionalProperties: boolean;
                    };
                };
                paramValues: {
                    type: string;
                    description: string;
                    additionalProperties: {
                        type: string;
                    };
                };
            };
            additionalProperties: boolean;
        };
        secretParameters: {
            title: string;
            type: string;
            description: string;
            properties: {
                cookieStr: {
                    type: string;
                    description: string;
                };
                authorisationHeader: {
                    type: string;
                    description: string;
                };
                headers: {
                    type: string;
                    description: string;
                    additionalProperties: {
                        type: string;
                    };
                };
                paramValues: {
                    type: string;
                    description: string;
                    additionalProperties: {
                        type: string;
                    };
                };
            };
            additionalProperties: boolean;
        };
    };
};
export {};
