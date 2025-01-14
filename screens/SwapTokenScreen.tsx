import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
	Alert,
	Button,
	FlatList,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import { RootStackParamList } from '../types/navigation';
import { Coin, Currency } from '../types/types';
import { fetchCoins, fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { CURRENCY, loadCurrency, saveToken } from '../utils/storage';
import { theme } from '../utils/theme';

const SwapTokenScreen = () => {

	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { tokenId, totalAmount } = route.params as { tokenId?: string, totalAmount?: number };
	const [tokens, setTokens] = useState<Coin[]>([]);
	const [fromToken, setFromToken] = useState<Coin | null>(null);
	const [toToken, setToToken] = useState<Coin | null>(null);
	const [fromAmount, setFromAmount] = useState<string>('');
	const [toAmount, setToAmount] = useState<string>('');
	const [isCalculating, setIsCalculating] = useState(false);
	const debounceTimer = useRef<any>(null);
	const [fromModalVisible, setFromModalVisible] = useState(false);
	const [toModalVisible, setToModalVisible] = useState(false);
	const [currency, setCurrency] = useState<Currency | null>();

	useEffect(() => {
		const fetchTokens = async () => {
			const coins = await fetchCoins();
			if (coins) {
				setTokens(coins);
				if (tokenId) {
					const selectedToken = coins.find(coin => coin.id === tokenId) || null;
					setFromToken(selectedToken);
					if (totalAmount) {
						setFromAmount(String(totalAmount));
					}
				}
			}
		};
		fetchTokens();
	}, []);

	useEffect(() => {
		const calculateToAmount = async () => {
			if (!fromToken || !toToken || !fromAmount) {
				setToAmount('');
				return;
			}
			setIsCalculating(true);
			try {
				const fromPrice = await fetchTokenPrice(fromToken.id, currency!);
				const toPrice = await fetchTokenPrice(toToken.id, currency!);
				if (fromPrice && toPrice) {
					const amount = parseFloat(fromAmount.replace(',', '.'));
					if (isNaN(amount)) {
						setToAmount('');
						return;
					}
					const calculatedAmount = (amount * fromPrice) / toPrice;
					setToAmount(calculatedAmount.toFixed(6).toString());
				}
				else {
					setToAmount('');
				}
			}
			finally {
				setIsCalculating(false);
			}
		};
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}
		debounceTimer.current = setTimeout(() => {
			calculateToAmount();
		}, 500);

		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, [fromToken, toToken, fromAmount]);

	const handleSwapTokens = async () => {
		if (!fromToken || !toToken || !fromAmount) {
			Alert.alert('Error', 'Please select tokens and enter the amount.');
			return;
		}

		const parsedFromAmount = parseFloat(fromAmount.replace(',', '.'));
		if (isNaN(parsedFromAmount)) {
			Alert.alert('Error', 'Invalid amount');
			return;
		}
		Alert.alert(
			'Swap Tokens',
			`Are you sure you want to swap ${fromAmount} ${fromToken.name} for ${toAmount} ${toToken.name}?`,
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Swap',
					onPress: async () => {
						setIsCalculating(true);
						const currency = await loadCurrency();
						const parsedToAmount = parseFloat(toAmount);
						try {

							const findCurrencyBySymbol = async (symbolToFind: string) => {
								const currencies = await fetchCurrencies();
								const currency = currencies!.find(({ symbol }) => symbol === symbolToFind)
								return currency
							}

							const currencySaved = await loadCurrency()
							const currency = await findCurrencyBySymbol(currencySaved!)
							const toPrice1 = await fetchTokenPrice(toToken.id, currency!);
							// Subtract from fromToken
							await saveToken({
								id: fromToken.id,
								name: fromToken.name,
								amount: -parsedFromAmount,
								tokenCoin: fromToken!,
								totalAmount: 0,
								percentageChange: null,
								currentValue: null,
								walletId: '',
								percentageOfWallet: 0
							});
							// Add to toToken
							await saveToken({
								id: toToken.id,
								name: toToken.name,
								amount: parsedToAmount,
								priceCurrency1: toPrice1,
								tokenCoin: toToken,
								totalAmount: 0,
								percentageChange: null,
								currentValue: null,
								walletId: '',
								percentageOfWallet: 0
							});
							navigation.goBack();
						} catch (error) {
							console.error('Failed to swap tokens', error);
							Alert.alert('Error', 'Failed to swap tokens.');
						} finally {
							setIsCalculating(false);
						}
					}
				}
			],
			{ cancelable: false }
		);
	};
	const handleSelectFromToken = (token: Coin) => {
		setFromToken(token);
		setFromModalVisible(false);
	};

	const handleOpenFromModal = () => {
		setFromModalVisible(true);
	};

	const handleCloseFromModal = () => {
		setFromModalVisible(false);
	};

	const handleOpenToModal = () => {
		setToModalVisible(true);
	};

	const handleCloseToModal = () => {
		setToModalVisible(false);
	};

	const handleSelectToToken = (token: Coin) => {
		setToToken(token);
		setToModalVisible(false);
	};


	const renderTokenItem = ({ item }: { item: Coin }, isFrom: boolean) => (
		<TouchableOpacity style={styles.tokenItem} onPress={() => isFrom ? handleSelectFromToken(item) : handleSelectToToken(item)}>
			<Text style={styles.tokenItemText}>{item.name} ({item.symbol.toUpperCase()})</Text>
		</TouchableOpacity>
	);

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Swap Tokens</Text>

			{/* From Token Selection */}
			<View style={styles.pickerContainer}>
				<Text style={styles.label}>From Token:</Text>
				<TouchableOpacity style={styles.selectButton} onPress={handleOpenFromModal}>
					<Text style={styles.selectText}>
						{fromToken ? `${fromToken.name} (${fromToken.symbol.toUpperCase()})` : 'Select a token'}
					</Text>
					<Feather name="chevron-down" size={20} color="grey" />
				</TouchableOpacity>
			</View>

			{/* From Amount Input */}
			<View style={styles.inputContainer}>
				<Text style={styles.label}>Amount:</Text>
				<TextInput
					style={[styles.input, { color: theme.colors.text }]}
					keyboardType="numeric"
					value={fromAmount}
					onChangeText={setFromAmount}
					placeholder="Enter amount"
					placeholderTextColor={theme.colors.secondaryText}
					selectionColor={theme.colors.secondaryText}
				/>
			</View>


			{/* To Token Selection */}
			<View style={styles.pickerContainer}>
				<Text style={styles.label}>To Token:</Text>
				<TouchableOpacity style={styles.selectButton} onPress={handleOpenToModal}>
					<Text style={styles.selectText}>
						{toToken ? `${toToken.name} (${toToken.symbol.toUpperCase()})` : 'Select a token'}
					</Text>
					<Feather name="chevron-down" size={20} color="grey" />
				</TouchableOpacity>
			</View>

			{/*  To Amount Display */}
			{toAmount ? (
				<View style={styles.inputContainer}>
					<Text style={styles.label}>Amount to Receive:</Text>
					<Text style={[styles.calculatedAmount, { color: theme.colors.text }]}>
						{toAmount}
					</Text>
				</View>
			) : null}

			<Button title="Swap Tokens" onPress={handleSwapTokens} disabled={isCalculating} color={theme.colors.primary} />
			<Modal
				animationType="slide"
				transparent={true}
				visible={fromModalVisible}
				onRequestClose={handleCloseFromModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<FlatList
							data={tokens}
							renderItem={({ item }) => renderTokenItem({ item }, true)}
							keyExtractor={(item) => item.id}
						/>
					</View>
				</View>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={toModalVisible}
				onRequestClose={handleCloseToModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<FlatList
							data={tokens}
							renderItem={({ item }) => renderTokenItem({ item }, false)}
							keyExtractor={(item) => item.id}
						/>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: theme.spacing.xlarge,
		backgroundColor: theme.colors.background,
	},
	title: {
		fontSize: theme.fontSizes.xlarge,
		fontWeight: 'bold',
		marginBottom: theme.spacing.xlarge,
		textAlign: 'center',
		color: theme.colors.text,
	},
	inputContainer: {
		marginBottom: theme.spacing.medium,
	},
	label: {
		fontSize: theme.fontSizes.large,
		marginBottom: theme.spacing.small,
		color: theme.colors.text,
	},
	calculatedAmount: {
		fontSize: theme.fontSizes.large,
	},
	input: {
		height: 40,
		backgroundColor: theme.colors.inputBackground,
		borderColor: theme.colors.border,
		borderWidth: 1,
		padding: theme.spacing.medium,
		borderRadius: theme.spacing.small,
	},
	selectButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 40,
		backgroundColor: theme.colors.inputBackground,
		borderColor: theme.colors.border,
		borderWidth: 1,
		padding: theme.spacing.medium,
		borderRadius: theme.spacing.small,
	},
	selectText: {
		fontSize: theme.fontSizes.large,
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent
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
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		marginBottom: theme.spacing.medium,
	},
	searchIcon: {
		marginRight: theme.spacing.medium
	},
	searchInput: {
		flex: 1,
		height: 40,
		paddingVertical: theme.spacing.small,
	},
	modalClose: {
		paddingLeft: theme.spacing.medium
	},
	tokenItem: {
		padding: theme.spacing.medium,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	tokenItemText: {
		fontSize: theme.fontSizes.large,
	},
	pickerContainer: {
		marginBottom: theme.spacing.medium,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.spacing.small,
	},
	picker: {
		height: 50,
		backgroundColor: theme.colors.inputBackground
	}
});

export default SwapTokenScreen;