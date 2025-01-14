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
			currency: currency?.symbol || 'usd', // Usar 'usd' como padrão se currency não estiver definido
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
				<Feather name="chevron-right" size={18} color={theme.colors.secondaryText} />
			</View>

		</TouchableOpacity>
	);
};

// Estilos
const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: theme.spacing.medium,
		paddingLeft: theme.spacing.medium,
		marginHorizontal: theme.spacing.large,
		marginVertical: theme.spacing.small,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.cardBackground,
		borderRadius: theme.spacing.medium
	},
	imageContainer: {
		width: 32,
		height: 32
	},
	leftContainer: {
		width: '30%',
		paddingLeft: theme.spacing.small,
	},
	centerContainer: {
		flex: 1,
		paddingLeft: theme.spacing.small,
		flexDirection: 'column',
		alignItems: 'flex-end',
	},
	currencyValueContainer: {
		alignItems: 'flex-end',
	},
	name: {
		fontSize: theme.fontSizes.large,
		color: theme.colors.text,
		textAlign: 'left',
		fontWeight: 'bold',
	},
	amount: {
		fontSize: theme.fontSizes.medium,
		color: theme.colors.secondaryText,
		fontFamily: theme.fontFamilies.monospace,

	},
	value: {
		fontSize: theme.fontSizes.medium,
		color: theme.colors.text,
		fontFamily: theme.fontFamilies.monospace,
	},
	currencyPercentageChange: {
		fontSize: theme.fontSizes.small,
		marginLeft: theme.spacing.small,
		fontFamily: theme.fontFamilies.monospace,
	},
	gain: {
		color: theme.colors.accent,
	},
	loss: {
		color: theme.colors.error,
	},
	currency: {
		textTransform: 'uppercase',
		paddingRight: theme.spacing.small,
		fontSize: theme.fontSizes.small,
		color: theme.colors.secondaryText,
		fontFamily: theme.fontFamilies.monospace,
	},
	detailsButton: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: theme.spacing.xlarge,

	},
	percentageBarContainer: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		height: 8,
		backgroundColor: theme.colors.border,
		borderRadius: 4,
		marginTop: theme.spacing.small,
	},
	percentageBar: {
		height: '100%',
		backgroundColor: '#fff', // Cor da barra, pode ser ajustada
		borderRadius: 4,
	},
});

export default TokenItem;