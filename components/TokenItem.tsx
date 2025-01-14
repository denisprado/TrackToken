import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useThemedStyles from '../hooks/useThemedStyles';
import { Coin, Currency } from '../types/types';
import { theme } from '../utils/theme';

// Definição de tipos para as propriedades do componente
interface TokenItemProps {
	tokenCoin: Coin;
	totalAmount: string;
	percentageOfWallet: number;
	currencyTotalAmount: number | null;
	currencyPercentageChange: number;
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
	const styles = useThemedStyles(); // Obtendo estilos baseados no tema

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


export default TokenItem;