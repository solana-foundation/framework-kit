import type { Address, Commitment, SendableTransaction, Signature, Transaction } from '@solana/kit';

export type WalletConnectorMetadata = Readonly<{
	canAutoConnect?: boolean;
	icon?: string;
	id: string;
	kind?: string;
	name: string;
	ready?: boolean;
}>;

export type WalletAccount = Readonly<{
	address: Address;
	label?: string;
	publicKey: Uint8Array;
}>;

export type WalletSession = Readonly<{
	account: WalletAccount;
	connector: WalletConnectorMetadata;
	disconnect(): Promise<void>;
	onAccountsChanged?: (listener: (accounts: WalletAccount[]) => void) => () => void;
	sendTransaction?(
		transaction: SendableTransaction & Transaction,
		config?: Readonly<{ commitment?: Commitment }>,
	): Promise<Signature>;
	signMessage?(message: Uint8Array): Promise<Uint8Array>;
	signTransaction?(transaction: SendableTransaction & Transaction): Promise<SendableTransaction & Transaction>;
}>;

export type WalletConnector = WalletConnectorMetadata & {
	connect(opts?: Readonly<{ autoConnect?: boolean; allowInteractiveFallback?: boolean }>): Promise<WalletSession>;
	disconnect(): Promise<void>;
	isSupported(): boolean;
};

type WalletStatusConnected = Readonly<{
	autoConnect?: boolean;
	connectorId: string;
	session: WalletSession;
	status: 'connected';
}>;

type WalletStatusConnecting = Readonly<{
	autoConnect?: boolean;
	connectorId: string;
	status: 'connecting';
}>;

type WalletStatusDisconnected = Readonly<{
	status: 'disconnected';
}>;

type WalletStatusError = Readonly<{
	autoConnect?: boolean;
	connectorId?: string;
	error: unknown;
	status: 'error';
}>;

export type WalletStatus =
	| WalletStatusConnected
	| WalletStatusConnecting
	| WalletStatusDisconnected
	| WalletStatusError;

export type WalletRegistry = Readonly<{
	all: readonly WalletConnector[];
	get(id: string): WalletConnector | undefined;
}>;
