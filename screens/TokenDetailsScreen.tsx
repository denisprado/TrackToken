import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TokenAdditionItem from '../components/TokenAdditionItem';
import { useTheme } from '../context/ThemeContext';
import useThemedStyles from '../hooks/useThemedStyles';
import { RootStackParamList } from '../types/navigation';
import { TokenAddition, TokenData } from '../types/types';
import { fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { loadCurrency, loadTokens, saveToken } from '../utils/storage';

const TokenDetailsScreen = () => {
	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

	const { theme } = useTheme(); // Usando o contexto do tema
	const styles = useThemedStyles(); // Obtendo estilos baseados no tema


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

	return <View style={styles.container}>
		{token ? (
			<View>
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
			</View>
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
};

export default TokenDetailsScreen;