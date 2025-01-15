import React, { createContext, useContext, useState, ReactNode } from 'react';
import { theme, darkTheme } from '../utils/theme';

interface ThemeContextType {
	theme: typeof theme | typeof darkTheme;
	isDarkTheme: boolean
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [isDarkTheme, setIsDarkTheme] = useState(false);

	const toggleTheme = () => {
		setIsDarkTheme(prev => !prev);
	};

	const currentTheme = isDarkTheme ? darkTheme : theme;

	return (
		<ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, isDarkTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}; 