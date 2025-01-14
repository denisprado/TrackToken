import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { loadTokens, saveToken, saveCurrency, loadCurrency } from '../utils/storage';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../types/navigation';
import TokenAdditionItem from '../components/TokenAdditionItem';
import { Feather } from '@expo/vector-icons';
import { fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { Token, TokenAddition, TokenData } from '../types/types';



const TokenDetailsScreen = () => {
	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { tokenId, currency } = route.params as { tokenId: string, currency: string };
	const [token, setToken] = useState<TokenData | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [redeemAmount, setRedeemAmount] = useState('');

	useEffect(() => {
		loadTokenDetails();
	}, []);

	const calculatePercentageChange = async (
		ammout: TokenAddition['amount'], priceAtPurchase: number, tokenId: string

	): Promise<{ percentageChange: number; }> => {



		// Verifica se os preços atuais estão disponíveis
		const priceNow = await fetchTokenPrice(tokenId, { id: currency, symbol: currency, name: currency })
		if (!ammout || !priceNow) {
			return { percentageChange: 0 };
		}

		// Obtém o preço atual do token na moeda selecionada
		const totalNow = ammout * priceNow!; // Valor atual na moeda original

		const totalInvestment = ammout * priceAtPurchase

		// Calcula a porcentagem de mudança em relação à moeda original
		const percentageChange = ((totalNow - totalInvestment) / totalInvestment) * 100;

		console.log(ammout, priceNow, totalNow, totalInvestment, priceAtPurchase, percentageChange)

		return { percentageChange: percentageChange }; // Retorna a porcentagem em relação à moeda atual
	};

	const loadTokenDetails = async () => {
		try {
			const savedTokens = await loadTokens();
			if (savedTokens) {
				const tokenDetails = savedTokens.find(token => token.id === tokenId);
				if (tokenDetails) {
					const tokenWithPrice = await Promise.all(
						tokenDetails.additions.map(async (addition: TokenAddition) => {
							const currentValue = await fetchTokenPrice(tokenDetails.id, { id: currency, name: currency, symbol: currency });

							const { percentageChange } = await calculatePercentageChange(addition.amount, addition.priceAtPurchaseCurrency1!, tokenDetails?.tokenCoin?.id!);

							const timestamp = addition.timestamp

							return {
								...addition,
								timestamp,
								percentageChange,
								currentValue: currentValue ? currentValue * addition.amount : 0
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

	const handleOpenRedeemModal = () => {
		setModalVisible(true);
	};

	const handleCloseRedeemModal = () => {
		setModalVisible(false);
		setRedeemAmount('');
	};

	const findCurrencyBySymbol = async (symbolToFind: string) => {
		const currencies = await fetchCurrencies();
		const currency = currencies!.find(({ symbol }) => symbol === symbolToFind)
		return currency
	}

	const handleRedeemToken = async () => {
		if (!tokenId || !redeemAmount) {
			Alert.alert('Error', 'Please enter the amount to redeem.');
			return;
		}

		try {
			const amount = parseFloat(redeemAmount.replace(',', '.'));

			if (isNaN(amount)) {
				Alert.alert('Error', 'Invalid amount.');
				return;
			}



			const currencySaved = await loadCurrency()
			const currency = await findCurrencyBySymbol(currencySaved!)
			const currentPrice = await fetchTokenPrice(tokenId, currency!);

			await saveToken({
				id: tokenId,
				name: token?.name || '',
				amount: -amount,
				priceCurrency1: currentPrice,
				tokenCoin: token!.tokenCoin,
				totalAmount: 0,
				percentageChange: null,
				currentValue: null,
				walletId: '',
				percentageOfWallet: 0
			});
			loadTokenDetails();
			handleCloseRedeemModal();
		}
		catch (error) {
			console.error('Error removing token: ', error);
			Alert.alert('Error', 'Failed to redeem token.');
		}
	};


	const handleSwapTokensPress = (tokenId: string, totalAmount: number) => {
		navigation.navigate('SwapToken', { tokenId, totalAmount });
	};

	const renderAdditionItem = ({ item }: { item: any }) => (
		<TokenAdditionItem amount={item.amount} timestamp={item.timestamp} percentageChange={item.percentageChange} currentValue={item.currentValue} currency={currency} />
	);

	return (
		<View style={styles.container}>
			{token ? (
				<>
					<View style={styles.header}>
						<View style={styles.headerToken}>
							<Image source={{ uri: token.tokenCoin?.image }} width={32} height={32}></Image>
							<Text style={styles.title}>{token.name} Details</Text>
						</View>
						<TouchableOpacity style={styles.iconButton} onPress={() => handleSwapTokensPress(token.id, 0)}>
							<Feather name="repeat" size={24} color={theme.colors.text} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.redeemButton} onPress={handleOpenRedeemModal}>
							<Feather name="arrow-down-circle" size={24} color={theme.colors.error} />
						</TouchableOpacity>
					</View>

					<FlatList
						data={token.additions}
						renderItem={renderAdditionItem}
						keyExtractor={(item, index) => String(index)}
					/>
				</>
			) : <Text style={styles.noTokenText}>Token not found</Text>}

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseRedeemModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalTitle}>Redeem Token</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Amount:</Text>
							<TextInput
								style={[styles.input, { color: theme.colors.text }]}
								keyboardType="numeric"
								value={redeemAmount}
								onChangeText={setRedeemAmount}
								placeholder="Enter amount"
								placeholderTextColor={theme.colors.secondaryText}
								selectionColor={theme.colors.secondaryText}
							/>
						</View>
						<Button title="Redeem" onPress={handleRedeemToken} color={theme.colors.primary} />
						<TouchableOpacity style={styles.modalClose} onPress={handleCloseRedeemModal}>
							<Feather name="x" size={20} color={theme.colors.secondaryText} />
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: theme.spacing.xlarge,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: theme.spacing.xlarge,
	},
	headerToken: {
		display: 'flex',
		justifyContent: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.xlarge,
		flex: 1,

	},
	title: {
		fontSize: theme.fontSizes.xlarge,
		fontWeight: 'bold',
		color: theme.colors.text,


	},
	additionItem: {
		padding: theme.spacing.medium,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	additionInfo: {
	},
	additionAmount: {
		color: theme.colors.text,
		fontSize: theme.fontSizes.large
	},
	additionTimestamp: {
		color: theme.colors.secondaryText,
		fontSize: 14
	},
	noTokenText: {
		color: theme.colors.secondaryText,
		textAlign: 'center',
		fontSize: theme.fontSizes.large
	},
	iconButton: {
		padding: theme.spacing.small,
	},
	redeemButton: {
		padding: 5
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		margin: theme.spacing.xlarge,
		backgroundColor: theme.colors.cardBackground,
		borderRadius: theme.spacing.medium,
		padding: theme.spacing.xlarge,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: theme.spacing.small,
	},
	modalClose: {
		position: 'absolute',
		top: theme.spacing.medium,
		right: theme.spacing.medium
	},
	modalTitle: {
		fontSize: theme.fontSizes.xlarge,
		fontWeight: 'bold',
		color: theme.colors.text,
		marginBottom: theme.spacing.medium
	},
	inputContainer: {
		marginBottom: theme.spacing.medium,
	},
	label: {
		fontSize: theme.fontSizes.large,
		marginBottom: theme.spacing.small,
		color: theme.colors.text,
	},
	input: {
		height: 40,
		backgroundColor: theme.colors.inputBackground,
		borderColor: theme.colors.border,
		borderWidth: 1,
		padding: theme.spacing.medium,
		borderRadius: theme.spacing.small,
	},
});

export default TokenDetailsScreen;