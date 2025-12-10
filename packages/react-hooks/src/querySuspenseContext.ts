import { createContext, useContext } from 'react';

const QuerySuspenseContext = createContext<boolean | undefined>(undefined);

export function useQuerySuspensePreference(): boolean | undefined {
	return useContext(QuerySuspenseContext);
}

export { QuerySuspenseContext };
