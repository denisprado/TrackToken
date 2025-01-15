import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useThemedStyles from '../hooks/useThemedStyles';
import { theme } from '../utils/theme';
interface TokenAdditionItemProps {
	amount: string;
	timestamp: number;
	percentageChange: number | null;
	currentValue: number | null
	currency: string
}

const TokenAdditionItem: React.FC<TokenAdditionItemProps> = ({ amount, timestamp, percentageChange, currentValue, currency }) => {

	const styles = useThemedStyles(); // Obtendo estilos baseados no tema

	const formattedCurrencyTotalAmount = currentValue !== null
		? new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: currency || 'usd', // Usar 'usd' como padrão se currency não estiver definido
		}).format(currentValue)
		: 'Loading...';


	return (
		<View style={styles.itemContainer}>
			<View style={styles.leftContainer}>
				<Text style={styles.value}>{amount}</Text>
				<Text style={styles.additionTimestamp}>{new Date(timestamp).toLocaleString()}</Text>
			</View>


			<View style={styles.rightContainer}>
				<Text style={[styles.value, percentageChange! >= 0 ? styles.gain : styles.loss]}>{formattedCurrencyTotalAmount}</Text>
				<Text style={[styles.percentageChange, percentageChange! >= 0 ? styles.gain : styles.loss]}>
					{percentageChange && percentageChange?.toFixed(2)}%
				</Text>
			</View>

		</View>
	);
};


export default TokenAdditionItem;