import { useClusterState, useClusterStatus } from '@solana/react-hooks';

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

function describeStatus(status: ReturnType<typeof useClusterStatus>): string {
	if (status.status === 'connecting') {
		return 'Dialing RPC and WebSocket endpoints…';
	}
	if (status.status === 'ready') {
		return status.latencyMs !== undefined
			? `Connected (latency ≈ ${status.latencyMs.toFixed(0)}ms)`
			: 'Connected to the cluster.';
	}
	if (status.status === 'error') {
		return 'Cluster connection failed. Check the logs for details.';
	}
	return 'Waiting for the client to start.';
}

export function ClusterStatusCard() {
	const cluster = useClusterState();
	const status = useClusterStatus();
	const label = status.status === 'ready' ? 'Ready' : status.status;

	return (
		<Card>
			<CardHeader>
				<div>
					<CardTitle>Cluster</CardTitle>
					<CardDescription>Connection state for the configured RPC and WebSocket endpoints.</CardDescription>
				</div>
				<CardAction>
					<span
						aria-live="polite"
						className="status-badge"
						data-state={status.status === 'error' ? 'error' : 'success'}
					>
						{label}
					</span>
				</CardAction>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				<div className="grid gap-1">
					<span className="font-medium text-foreground">Endpoint</span>
					<code className="inline-block break-all bg-card px-2 py-1">{cluster.endpoint}</code>
				</div>
				{cluster.websocketEndpoint ? (
					<div className="grid gap-1">
						<span className="font-medium text-foreground">WebSocket</span>
						<code className="inline-block break-all bg-card px-2 py-1">{cluster.websocketEndpoint}</code>
					</div>
				) : null}
				<p className="text-muted-foreground">{describeStatus(status)}</p>
			</CardContent>
		</Card>
	);
}
