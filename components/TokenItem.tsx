import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface TokenItemProps {
	name: string;
	totalAmount: number;
	currentValue: number | null;
	onRedeem: () => void;
	onSwap: () => void;
	onPress: () => void;
	percentageChange: number | null;
}

const TokenItem: React.FC<TokenItemProps> = ({ name, totalAmount, currentValue, onRedeem, onSwap, onPress, percentageChange }) => {
	const symbol = name.split('(')[1]?.split(')')[0] || '';
	return (
		<TouchableOpacity style={styles.itemContainer} onPress={onPress}>
			<View style={styles.infoContainer}>
				<Text style={styles.name}>{name.split('(')[0]}</Text>
				<Text style={styles.amount}>{symbol} {totalAmount.toFixed(6)}</Text>
			</View>
			<View style={styles.valueContainer}>
				<Text style={styles.valueLabel}>$</Text>
				<Text style={[styles.value, percentageChange !== null ? (percentageChange >= 0 ? styles.gain : styles.loss) : null]}>{currentValue !== null ? currentValue.toFixed(2) : 'Loading...'}</Text>
				{percentageChange !== null && (
					<Text style={[styles.percentageChange, percentageChange >= 0 ? styles.gain : styles.loss]}>
						({percentageChange.toFixed(2)}%)
					</Text>
				)}
			</View>
			<TouchableOpacity style={styles.swapButton} onPress={onSwap}>
				<Feather name="repeat" size={18} color={theme.secondaryText} />
			</TouchableOpacity>
			<View style={styles.redeemButton}>
				<TouchableOpacity onPress={onRedeem}>
					<Feather name="arrow-down-circle" size={18} color={theme.error} />
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: 8,
		paddingLeft: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	infoContainer: {
		flex: 1,
	},
	name: {
		fontSize: 16,
		color: theme.text,
	},
	amount: {
		fontSize: 14,
		color: theme.secondaryText
	},
	valueContainer: {
		alignItems: 'flex-end',
		flexDirection: 'row',
	},
	valueLabel: {
		fontSize: 14,
		color: theme.secondaryText,
		marginRight: 5
	},
	value: {
		fontSize: 14,
		color: theme.text,
	},
	swapButton: {
		padding: 5,
	},
	redeemButton: {
		padding: 5,
	},
	percentageChange: {
		fontSize: 12,
		marginLeft: 5
	},
	gain: {
		color: '#69F0AE'
	},
	loss: {
		color: theme.error
	}
});

export default TokenItem;