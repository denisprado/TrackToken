import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';

// Definição de tipos para as propriedades do componente
interface TokenItemProps {
	name: string;
	totalAmount: number;
	currency1Value: number | null;
	onRedeem: () => void;
	currency1PercentageChange: number | null;
	selectedCurrency1: string;
	onPress: () => void;
}

// Componente funcional TokenItem
const TokenItem: React.FC<TokenItemProps> = ({
	name,
	totalAmount,
	currency1Value,
	currency1PercentageChange,
	selectedCurrency1,

	onPress,
}) => {
	// Função para formatar o nome do token
	const formatTokenName = (name: string) => {
		const symbol = name.includes('(') ? name.split('(')[1]?.split(')')[0] : '';
		const tokenName = name.includes('(') ? name.split('(')[0] : name;
		return { tokenName, symbol };
	};

	const { tokenName, symbol } = formatTokenName(name);

	return (
		<TouchableOpacity style={styles.itemContainer} onPress={onPress}>
			<View style={styles.leftContainer}>
				<Text style={styles.name}>{tokenName}</Text>
				<Text style={styles.amount}>{symbol} {totalAmount?.toFixed(6)}</Text>
			</View>
			<View style={styles.centerContainer}>
				<Text style={[styles.value, currency1PercentageChange !== null ? (currency1PercentageChange >= 0 ? styles.gain : styles.loss) : null]}>
					{currency1Value !== null ? <><Text style={styles.currency}>{selectedCurrency1}</Text>{currency1Value?.toFixed(2)}</> : 'Loading...'}
				</Text>
				{currency1PercentageChange !== null && (
					<Text style={[styles.currency1PercentageChange, currency1PercentageChange >= 0 ? styles.gain : styles.loss]}>
						({currency1PercentageChange?.toFixed(2)}%)
					</Text>
				)}

			</View>

			<View style={styles.detailsButton}>
				<Feather name="chevron-right" size={18} color={theme.secondaryText} />
			</View>
		</TouchableOpacity>
	);
};

// Estilos
const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: 8,
		paddingLeft: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,

		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.cardBackground,
	},
	leftContainer: {
		width: '30%',
		paddingLeft: 5,
	},
	centerContainer: {
		width: '56%',
		paddingLeft: 5,
		flexDirection: 'column',
		alignItems: 'flex-end',
	},

	currencyValueContainer: {
		alignItems: 'flex-end',
	},
	name: {
		fontSize: 15,
		color: theme.text,
		textAlign: 'left',
		fontWeight: 'bold',
	},
	amount: {
		fontSize: 12,
		color: theme.secondaryText,
		fontFamily: 'monospace',

	},
	value: {
		fontSize: 12,
		color: theme.text,
		fontFamily: 'monospace',
	},
	currency1PercentageChange: {
		fontSize: 10,
		marginLeft: 5,
		fontFamily: 'monospace',
	},
	gain: {
		color: '#69F0AE',
	},
	loss: {
		color: theme.error,
	},
	currency: {
		textTransform: 'uppercase',
		paddingRight: 5,
		fontSize: 12,
		color: theme.secondaryText,
		fontFamily: 'monospace',
	},
	detailsButton: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: 15,
	},
});

export default TokenItem;