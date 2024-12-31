import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../utils/theme';

interface TokenAdditionItemProps {
	amount: string;
	timestamp: number;
	percentageChange: number | null;
}

const TokenAdditionItem: React.FC<TokenAdditionItemProps> = ({ amount, timestamp, percentageChange }) => {
	return (
		<View style={styles.additionItem}>
			<View style={styles.additionInfo}>
				<Text style={styles.additionAmount}>Amount: {amount}</Text>
				<Text style={styles.additionTimestamp}>{new Date(timestamp).toLocaleString()}</Text>
			</View>
			{percentageChange !== null && (
				<Text style={[styles.percentageChange, percentageChange >= 0 ? styles.gain : styles.loss]}>
					{percentageChange.toFixed(2)}%
				</Text>
			)}
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