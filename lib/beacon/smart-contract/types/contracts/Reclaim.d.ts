import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export declare namespace Reclaim {
    type WitnessStruct = {
        addr: PromiseOrValue<string>;
        host: PromiseOrValue<string>;
    };
    type WitnessStructOutput = [string, string] & {
        addr: string;
        host: string;
    };
    type EpochStruct = {
        id: PromiseOrValue<BigNumberish>;
        timestampStart: PromiseOrValue<BigNumberish>;
        timestampEnd: PromiseOrValue<BigNumberish>;
        witnesses: Reclaim.WitnessStruct[];
        minimumWitnessesForClaimCreation: PromiseOrValue<BigNumberish>;
    };
    type EpochStructOutput = [
        number,
        number,
        number,
        Reclaim.WitnessStructOutput[],
        number
    ] & {
        id: number;
        timestampStart: number;
        timestampEnd: number;
        witnesses: Reclaim.WitnessStructOutput[];
        minimumWitnessesForClaimCreation: number;
    };
}
export declare namespace Claims {
    type ClaimInfoStruct = {
        provider: PromiseOrValue<string>;
        parameters: PromiseOrValue<string>;
        context: PromiseOrValue<string>;
    };
    type ClaimInfoStructOutput = [string, string, string] & {
        provider: string;
        parameters: string;
        context: string;
    };
    type CompleteClaimDataStruct = {
        identifier: PromiseOrValue<BytesLike>;
        owner: PromiseOrValue<string>;
        timestampS: PromiseOrValue<BigNumberish>;
        epoch: PromiseOrValue<BigNumberish>;
    };
    type CompleteClaimDataStructOutput = [
        string,
        string,
        number,
        BigNumber
    ] & {
        identifier: string;
        owner: string;
        timestampS: number;
        epoch: BigNumber;
    };
}
export interface ReclaimInterface extends utils.Interface {
    functions: {
        "addAsWitness(address,string)": FunctionFragment;
        "addNewEpoch()": FunctionFragment;
        "assertValidEpochAndSignedClaim(uint32,(string,string,string),(bytes32,address,uint32,uint256),bytes[])": FunctionFragment;
        "currentEpoch()": FunctionFragment;
        "epochDurationS()": FunctionFragment;
        "epochs(uint256)": FunctionFragment;
        "fetchEpoch(uint32)": FunctionFragment;
        "fetchWitnessesForClaim(uint32,bytes32,uint32)": FunctionFragment;
        "initialize()": FunctionFragment;
        "minimumWitnessesForClaimCreation()": FunctionFragment;
        "owner()": FunctionFragment;
        "proxiableUUID()": FunctionFragment;
        "removeAsWitness(address)": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
        "updateWitnessWhitelist(address,bool)": FunctionFragment;
        "upgradeTo(address)": FunctionFragment;
        "upgradeToAndCall(address,bytes)": FunctionFragment;
        "witnesses(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addAsWitness" | "addNewEpoch" | "assertValidEpochAndSignedClaim" | "currentEpoch" | "epochDurationS" | "epochs" | "fetchEpoch" | "fetchWitnessesForClaim" | "initialize" | "minimumWitnessesForClaimCreation" | "owner" | "proxiableUUID" | "removeAsWitness" | "renounceOwnership" | "transferOwnership" | "updateWitnessWhitelist" | "upgradeTo" | "upgradeToAndCall" | "witnesses"): FunctionFragment;
    encodeFunctionData(functionFragment: "addAsWitness", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "addNewEpoch", values?: undefined): string;
    encodeFunctionData(functionFragment: "assertValidEpochAndSignedClaim", values: [
        PromiseOrValue<BigNumberish>,
        Claims.ClaimInfoStruct,
        Claims.CompleteClaimDataStruct,
        PromiseOrValue<BytesLike>[]
    ]): string;
    encodeFunctionData(functionFragment: "currentEpoch", values?: undefined): string;
    encodeFunctionData(functionFragment: "epochDurationS", values?: undefined): string;
    encodeFunctionData(functionFragment: "epochs", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "fetchEpoch", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "fetchWitnessesForClaim", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "initialize", values?: undefined): string;
    encodeFunctionData(functionFragment: "minimumWitnessesForClaimCreation", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "proxiableUUID", values?: undefined): string;
    encodeFunctionData(functionFragment: "removeAsWitness", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "updateWitnessWhitelist", values: [PromiseOrValue<string>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "upgradeTo", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "upgradeToAndCall", values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "witnesses", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "addAsWitness", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addNewEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "assertValidEpochAndSignedClaim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "currentEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "epochDurationS", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "epochs", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fetchEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fetchWitnessesForClaim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "minimumWitnessesForClaimCreation", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proxiableUUID", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeAsWitness", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateWitnessWhitelist", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "upgradeToAndCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "witnesses", data: BytesLike): Result;
    events: {
        "AdminChanged(address,address)": EventFragment;
        "BeaconUpgraded(address)": EventFragment;
        "EpochAdded(tuple)": EventFragment;
        "Initialized(uint8)": EventFragment;
        "OwnershipTransferred(address,address)": EventFragment;
        "Upgraded(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AdminChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "BeaconUpgraded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "EpochAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}
export interface AdminChangedEventObject {
    previousAdmin: string;
    newAdmin: string;
}
export type AdminChangedEvent = TypedEvent<[
    string,
    string
], AdminChangedEventObject>;
export type AdminChangedEventFilter = TypedEventFilter<AdminChangedEvent>;
export interface BeaconUpgradedEventObject {
    beacon: string;
}
export type BeaconUpgradedEvent = TypedEvent<[
    string
], BeaconUpgradedEventObject>;
export type BeaconUpgradedEventFilter = TypedEventFilter<BeaconUpgradedEvent>;
export interface EpochAddedEventObject {
    epoch: Reclaim.EpochStructOutput;
}
export type EpochAddedEvent = TypedEvent<[
    Reclaim.EpochStructOutput
], EpochAddedEventObject>;
export type EpochAddedEventFilter = TypedEventFilter<EpochAddedEvent>;
export interface InitializedEventObject {
    version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;
export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;
export interface OwnershipTransferredEventObject {
    previousOwner: string;
    newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[
    string,
    string
], OwnershipTransferredEventObject>;
export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;
export interface UpgradedEventObject {
    implementation: string;
}
export type UpgradedEvent = TypedEvent<[string], UpgradedEventObject>;
export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;
export interface Reclaim extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ReclaimInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        addAsWitness(witnessAddress: PromiseOrValue<string>, host: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        addNewEpoch(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        assertValidEpochAndSignedClaim(epochNum: PromiseOrValue<BigNumberish>, claimInfo: Claims.ClaimInfoStruct, claimData: Claims.CompleteClaimDataStruct, signatures: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[void]>;
        currentEpoch(overrides?: CallOverrides): Promise<[number]>;
        epochDurationS(overrides?: CallOverrides): Promise<[number]>;
        epochs(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            number
        ] & {
            id: number;
            timestampStart: number;
            timestampEnd: number;
            minimumWitnessesForClaimCreation: number;
        }>;
        fetchEpoch(epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[Reclaim.EpochStructOutput]>;
        fetchWitnessesForClaim(epoch: PromiseOrValue<BigNumberish>, identifier: PromiseOrValue<BytesLike>, timestampS: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[Reclaim.WitnessStructOutput[]]>;
        initialize(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        minimumWitnessesForClaimCreation(overrides?: CallOverrides): Promise<[number]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        proxiableUUID(overrides?: CallOverrides): Promise<[string]>;
        removeAsWitness(witnessAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateWitnessWhitelist(addr: PromiseOrValue<string>, isWhitelisted: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        upgradeTo(newImplementation: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        upgradeToAndCall(newImplementation: PromiseOrValue<string>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        witnesses(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string, string] & {
            addr: string;
            host: string;
        }>;
    };
    addAsWitness(witnessAddress: PromiseOrValue<string>, host: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    addNewEpoch(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    assertValidEpochAndSignedClaim(epochNum: PromiseOrValue<BigNumberish>, claimInfo: Claims.ClaimInfoStruct, claimData: Claims.CompleteClaimDataStruct, signatures: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<void>;
    currentEpoch(overrides?: CallOverrides): Promise<number>;
    epochDurationS(overrides?: CallOverrides): Promise<number>;
    epochs(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
        number,
        number,
        number,
        number
    ] & {
        id: number;
        timestampStart: number;
        timestampEnd: number;
        minimumWitnessesForClaimCreation: number;
    }>;
    fetchEpoch(epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<Reclaim.EpochStructOutput>;
    fetchWitnessesForClaim(epoch: PromiseOrValue<BigNumberish>, identifier: PromiseOrValue<BytesLike>, timestampS: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<Reclaim.WitnessStructOutput[]>;
    initialize(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    minimumWitnessesForClaimCreation(overrides?: CallOverrides): Promise<number>;
    owner(overrides?: CallOverrides): Promise<string>;
    proxiableUUID(overrides?: CallOverrides): Promise<string>;
    removeAsWitness(witnessAddress: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    renounceOwnership(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateWitnessWhitelist(addr: PromiseOrValue<string>, isWhitelisted: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    upgradeTo(newImplementation: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    upgradeToAndCall(newImplementation: PromiseOrValue<string>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    witnesses(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string, string] & {
        addr: string;
        host: string;
    }>;
    callStatic: {
        addAsWitness(witnessAddress: PromiseOrValue<string>, host: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        addNewEpoch(overrides?: CallOverrides): Promise<void>;
        assertValidEpochAndSignedClaim(epochNum: PromiseOrValue<BigNumberish>, claimInfo: Claims.ClaimInfoStruct, claimData: Claims.CompleteClaimDataStruct, signatures: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<void>;
        currentEpoch(overrides?: CallOverrides): Promise<number>;
        epochDurationS(overrides?: CallOverrides): Promise<number>;
        epochs(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            number
        ] & {
            id: number;
            timestampStart: number;
            timestampEnd: number;
            minimumWitnessesForClaimCreation: number;
        }>;
        fetchEpoch(epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<Reclaim.EpochStructOutput>;
        fetchWitnessesForClaim(epoch: PromiseOrValue<BigNumberish>, identifier: PromiseOrValue<BytesLike>, timestampS: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<Reclaim.WitnessStructOutput[]>;
        initialize(overrides?: CallOverrides): Promise<void>;
        minimumWitnessesForClaimCreation(overrides?: CallOverrides): Promise<number>;
        owner(overrides?: CallOverrides): Promise<string>;
        proxiableUUID(overrides?: CallOverrides): Promise<string>;
        removeAsWitness(witnessAddress: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        updateWitnessWhitelist(addr: PromiseOrValue<string>, isWhitelisted: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        upgradeTo(newImplementation: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        upgradeToAndCall(newImplementation: PromiseOrValue<string>, data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        witnesses(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string, string] & {
            addr: string;
            host: string;
        }>;
    };
    filters: {
        "AdminChanged(address,address)"(previousAdmin?: null, newAdmin?: null): AdminChangedEventFilter;
        AdminChanged(previousAdmin?: null, newAdmin?: null): AdminChangedEventFilter;
        "BeaconUpgraded(address)"(beacon?: PromiseOrValue<string> | null): BeaconUpgradedEventFilter;
        BeaconUpgraded(beacon?: PromiseOrValue<string> | null): BeaconUpgradedEventFilter;
        "EpochAdded(tuple)"(epoch?: null): EpochAddedEventFilter;
        EpochAdded(epoch?: null): EpochAddedEventFilter;
        "Initialized(uint8)"(version?: null): InitializedEventFilter;
        Initialized(version?: null): InitializedEventFilter;
        "OwnershipTransferred(address,address)"(previousOwner?: PromiseOrValue<string> | null, newOwner?: PromiseOrValue<string> | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: PromiseOrValue<string> | null, newOwner?: PromiseOrValue<string> | null): OwnershipTransferredEventFilter;
        "Upgraded(address)"(implementation?: PromiseOrValue<string> | null): UpgradedEventFilter;
        Upgraded(implementation?: PromiseOrValue<string> | null): UpgradedEventFilter;
    };
    estimateGas: {
        addAsWitness(witnessAddress: PromiseOrValue<string>, host: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        addNewEpoch(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        assertValidEpochAndSignedClaim(epochNum: PromiseOrValue<BigNumberish>, claimInfo: Claims.ClaimInfoStruct, claimData: Claims.CompleteClaimDataStruct, signatures: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<BigNumber>;
        currentEpoch(overrides?: CallOverrides): Promise<BigNumber>;
        epochDurationS(overrides?: CallOverrides): Promise<BigNumber>;
        epochs(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        fetchEpoch(epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        fetchWitnessesForClaim(epoch: PromiseOrValue<BigNumberish>, identifier: PromiseOrValue<BytesLike>, timestampS: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        initialize(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        minimumWitnessesForClaimCreation(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        proxiableUUID(overrides?: CallOverrides): Promise<BigNumber>;
        removeAsWitness(witnessAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateWitnessWhitelist(addr: PromiseOrValue<string>, isWhitelisted: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        upgradeTo(newImplementation: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        upgradeToAndCall(newImplementation: PromiseOrValue<string>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        witnesses(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addAsWitness(witnessAddress: PromiseOrValue<string>, host: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        addNewEpoch(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        assertValidEpochAndSignedClaim(epochNum: PromiseOrValue<BigNumberish>, claimInfo: Claims.ClaimInfoStruct, claimData: Claims.CompleteClaimDataStruct, signatures: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        currentEpoch(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        epochDurationS(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        epochs(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        fetchEpoch(epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        fetchWitnessesForClaim(epoch: PromiseOrValue<BigNumberish>, identifier: PromiseOrValue<BytesLike>, timestampS: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initialize(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        minimumWitnessesForClaimCreation(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        proxiableUUID(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeAsWitness(witnessAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateWitnessWhitelist(addr: PromiseOrValue<string>, isWhitelisted: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        upgradeTo(newImplementation: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        upgradeToAndCall(newImplementation: PromiseOrValue<string>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        witnesses(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
