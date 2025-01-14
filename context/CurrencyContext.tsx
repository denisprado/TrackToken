// currencyContext.ts
import { createContext, ReactNode, useState } from 'react';
import { Currency } from '../types/types';

const CurrencyContext = createContext<{ currency: Currency, setCurrency: (currency: Currency) => void } | null>(null);

const CurrencyProvider = ({ children }: { children: ReactNode }) => {
	const [currency, setCurrency] = useState<Currency>({ id: '', name: '', symbol: '' });

	return (
		<CurrencyContext.Provider value={{ currency, setCurrency }}>
			{children}
		</CurrencyContext.Provider>
	);
};

export { CurrencyProvider, CurrencyContext };
