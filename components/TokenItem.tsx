import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { Coin, CoinMarketData, Currency } from '../types/types';
import { loadCurrency } from '../utils/storage';

// Definição de tipos para as propriedades do componente
interface TokenItemProps {
	tokenCoin: Coin;
	totalAmount: string;
	percentageOfWallet: number;
	currencyTotalAmount: number | null;
	currencyPercentageChange: number | null;
	currency: Currency | null;
	onPress: () => void;
}

// Componente funcional TokenItem
const TokenItem: React.FC<TokenItemProps> = ({
	tokenCoin,
	totalAmount,
	percentageOfWallet,
	currencyTotalAmount,
	currencyPercentageChange,
	currency,
	onPress,
}) => {
	// Formatação do valor total da moeda
	const formattedCurrencyTotalAmount = currencyTotalAmount !== null
		? new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: currency?.symbol || 'BRL', // Usar 'BRL' como padrão se currency não estiver definido
		}).format(currencyTotalAmount)
		: 'Loading...';

	return (
		<TouchableOpacity style={styles.itemContainer} onPress={onPress}>
			<View style={styles.imageContainer}>
				<Image source={{ uri: tokenCoin.image }} width={32} height={32}></Image>
			</View>
			<View style={styles.leftContainer}>
				<Text style={styles.name}>{tokenCoin.name}</Text>
				<Text style={styles.amount}>{tokenCoin.symbol.toUpperCase()} {totalAmount}</Text>
				<Text style={styles.amount}>{percentageOfWallet.toFixed(2)}%</Text>
			</View>

			<View style={styles.centerContainer}>
				<Text style={[styles.value, currencyPercentageChange !== null ? (currencyPercentageChange >= 0 ? styles.gain : styles.loss) : null]}>
					{formattedCurrencyTotalAmount}
				</Text>
				{currencyPercentageChange !== null && (
					<Text style={[styles.currencyPercentageChange, currencyPercentageChange >= 0 ? styles.gain : styles.loss]}>
						({currencyPercentageChange?.toFixed(2)}%)
					</Text>
				)}

				<View style={styles.percentageBarContainer}>
					<View style={[styles.percentageBar, { width: `${percentageOfWallet}%` }]} />
				</View>
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
		gap: 10,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.cardBackground,
	},
	imageContainer: {
		width: 32,
		height: 32
	},
	leftContainer: {
		width: '30%',
		paddingLeft: 5,
	},
	centerContainer: {
		flex: 1,
		paddingLeft: 5,
		flexDirection: 'column',
		alignItems: 'flex-end',
	},
	currencyValueContainer: {
		alignItems: 'flex-end',
	},
	name: {
		fontSize: 16,
		color: theme.text,
		textAlign: 'left',
		fontWeight: 'bold',
	},
	amount: {
		fontSize: 14,
		color: theme.secondaryText,
		fontFamily: 'monospace',

	},
	value: {
		fontSize: 14,
		color: theme.text,
		fontFamily: 'monospace',
	},
	currencyPercentageChange: {
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
		paddingHorizontal: 20,

	},
	percentageBarContainer: {
		display: 'flex',
		flexDirection: 'row',

		width: '100%',
		height: 4,
		backgroundColor: theme.border,
		borderRadius: 4,
		marginTop: 5,
	},
	percentageBar: {

		height: '100%',
		backgroundColor: '#fff', // Cor da barra, pode ser ajustada
		borderRadius: 4,
	},
});

export default TokenItem;