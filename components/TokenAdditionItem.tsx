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
		paddingVertical: theme.spacing.large,
		paddingLeft: theme.spacing.large,
		marginHorizontal: theme.spacing.small,
		marginVertical: theme.spacing.small,
		borderBottomWidth: 1,
		borderRadius: theme.spacing.medium,
		borderBottomColor: theme.colors.border,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.cardBackground,
	},

	additionInfo: {
	},
	additionAmount: {
		color: theme.colors.text,
		fontSize: theme.fontSizes.medium,
		fontFamily: theme.fontFamilies.monospace
	},
	additionTimestamp: {
		color: theme.colors.secondaryText,
		fontSize: theme.fontSizes.small
	},
	percentageChange: {
		fontSize: theme.fontSizes.small,
		fontFamily: theme.fontFamilies.monospace,
	},
	gain: {
		color: theme.colors.accent
	},
	loss: {
		color: theme.colors.error
	}
});

export default TokenAdditionItem;