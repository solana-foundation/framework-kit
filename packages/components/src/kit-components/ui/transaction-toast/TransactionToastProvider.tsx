import * as ToastPrimitive from '@radix-ui/react-toast';
import type React from 'react';
import { createContext, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { DEFAULT_DURATION, TransactionToast, type TransactionToastData } from './TransactionToast';

// define context type

//internal toast with unique_ID
interface ToastItem extends TransactionToastData {
	id: string;
}
// context value provided to children
interface TransactionToastContextValue {
	toast: (data: TransactionToastData) => string;
	dismiss: (id: string) => void;
	update: (id: string, data: Partial<TransactionToastData>) => void;
}

// provider props
export interface TransactionToastProviderProps {
	children: React.ReactNode;
}

//context
export const TransactionToastContext = createContext<TransactionToastContextValue | null>(null);

//provider component
export const TransactionToastProvider: React.FC<TransactionToastProviderProps> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	//toast function to add new toast
	const toast = useCallback((data: TransactionToastData): string => {
		const id = Math.random().toString(36).substring(2, 9);
		setToasts((prev) => [...prev, { ...data, id }]);
		return id;
	}, []);
	//dismiss function to remove toast by ID
	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);
	//update existing toast for instance pending -> success
	const update = useCallback((id: string, data: Partial<TransactionToastData>) => {
		setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
	}, []);
	return (
		<TransactionToastContext.Provider value={{ toast, dismiss, update }}>
			<ToastPrimitive.Provider swipeDirection="right">
				{children}
				{toasts.map((t: ToastItem) => (
					<ToastPrimitive.Root
						key={t.id}
						duration={DEFAULT_DURATION[t.status]}
						onOpenChange={(open: boolean) => {
							if (!open) dismiss(t.id);
						}}
						className={cn(
							'data-[state=open]:animate-in data-[state=closed]:animate-out',
							'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0',
							'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
						)}
					>
						<TransactionToast {...t} />
					</ToastPrimitive.Root>
				))}
				<ToastPrimitive.Viewport
					className={cn('fixed top-4 right-4 z-50 flex flex-col gap-2', 'w-auto max-w-sm')}
				/>
			</ToastPrimitive.Provider>
		</TransactionToastContext.Provider>
	);
};
