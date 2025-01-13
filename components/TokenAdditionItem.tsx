import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../utils/theme';

interface TokenAdditionItemProps {
	amount: string;
	timestamp: number;
	percentageChange: number | null;
	currentValue: number | null
	currency: string
}

const TokenAdditionItem: React.FC<TokenAdditionItemProps> = ({ amount, timestamp, percentageChange, currentValue, currency }) => {

	const formattedCurrencyTotalAmount = currentValue !== null
		? new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: currency || 'usd', // Usar 'usd' como padrão se currency não estiver definido
		}).format(currentValue)
		: 'Loading...';

	console.log(percentageChange)
	return (
		<View style={styles.additionItem}>
			<View style={styles.additionInfo}>
				<Text style={styles.additionAmount}>{amount}</Text>
				<Text style={styles.additionTimestamp}>{new Date(timestamp).toLocaleString()}</Text>
			</View>


			<View>
				<Text style={[styles.additionAmount, percentageChange! >= 0 ? styles.gain : styles.loss]}>{formattedCurrencyTotalAmount}</Text>
				<Text style={[styles.percentageChange, percentageChange! >= 0 ? styles.gain : styles.loss]}>
					{percentageChange && percentageChange?.toFixed(2)}%
				</Text>
			</View>

		</View>
	);
};

const styles = StyleSheet.create({
	additionItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	additionInfo: {
	},
	additionAmount: {
		color: theme.text,
		fontSize: 14,
		fontFamily: 'monospace'
	},
	additionTimestamp: {
		color: theme.secondaryText,
		fontSize: 12
	},
	percentageChange: {
		fontSize: 12,
		fontFamily: 'monospace',
	},
	gain: {
		color: '#69F0AE'
	},
	loss: {
		color: theme.error
	}
});

export default TokenAdditionItem;