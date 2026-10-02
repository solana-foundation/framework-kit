import { useContext } from 'react';
import { TransactionToastContext } from './TransactionToastProvider';

export function useTransactionToast() {
	const context = useContext(TransactionToastContext);
	if (!context) {
		throw new Error('useTransactionToast must be used within a TransactionToastProvider');
	}
	return context;
}
