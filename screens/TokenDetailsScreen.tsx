import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { loadTokens } from '../utils/storage';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../types/navigation';
import { fetchTokenPrice } from '../utils/api';

interface TokenAddition {
	amount: string;
	timestamp: number;
}

interface Token {
	id: string;
	name: string;
	additions: TokenAddition[];
}


const TokenDetailsScreen = () => {
	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { tokenId } = route.params as { tokenId: string };
	const [token, setToken] = useState<Token | null>(null);

	useEffect(() => {
		loadTokenDetails();
	}, []);

	const loadTokenDetails = async () => {
		try {
			const savedTokens = await loadTokens();
			if (savedTokens) {
				const tokenDetails = savedTokens.find(token => token.id === tokenId);
				if (tokenDetails) {
					const tokenWithPrice = await Promise.all(
						tokenDetails.additions.map(async (addition) => {
							const currentPrice = await fetchTokenPrice(tokenDetails.id);
							const percentageChange = currentPrice ? (((currentPrice - (addition.amount > "0" ? currentPrice : 0)) / (addition.amount > "0" ? currentPrice : 0)) * 100) : null
							return {
								...addition,
								percentageChange,
								currentPrice
							};
						})
					);
					setToken({
						...tokenDetails,
						additions: tokenWithPrice
					});
				}
				else {
					setToken(null);
				}
			}
		}
		catch (error) {
			console.error('Erro ao carregar token details: ', error);
		}
	};


	const renderAdditionItem = ({ item }: { item: any }) => (
		<View style={styles.additionItem}>
			<View style={styles.additionInfo}>
				<Text style={styles.additionAmount}>Amount: {item.amount}</Text>
				<Text style={styles.additionTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
			</View>
			{item.percentageChange !== null && (
				<Text style={[styles.percentageChange, item.percentageChange >= 0 ? styles.gain : styles.loss]}>
					{item.percentageChange.toFixed(2)}%
				</Text>
			)}
		</View>
	);


	return (
		<View style={styles.container}>
			{token ? (
				<>
					<Text style={styles.title}>{token.name} Details</Text>
					<FlatList
						data={token.additions}
						renderItem={renderAdditionItem}
						keyExtractor={(item, index) => String(index)}
					/>
				</>
			) : <Text style={styles.noTokenText}>Token not found</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: theme.background,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: theme.text,
		marginBottom: 20
	},
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
		fontSize: 16
	},
	additionTimestamp: {
		color: theme.secondaryText,
		fontSize: 14
	},
	noTokenText: {
		color: theme.secondaryText,
		textAlign: 'center',
		fontSize: 16
	},
	percentageChange: {
		fontSize: 12,
	},
	gain: {
		color: '#69F0AE'
	},
	loss: {
		color: theme.error
	}
});

export default TokenDetailsScreen;