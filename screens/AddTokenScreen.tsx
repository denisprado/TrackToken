import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Coin, Currency } from '../types/types';
import { fetchCoins, fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { loadCurrency, saveToken } from '../utils/storage';
import { theme } from '../utils/theme';

const AddTokenScreen = ({ route }: { route: { params: { walletId: string } } }) => {

	const navigation = useNavigation();
	const [tokens, setTokens] = useState<Coin[]>([]);
	const [selectedToken, setSelectedToken] = useState<Coin | null>(null);
	const [tokenAmount, setTokenAmount] = useState<string>('');
	const [modalVisible, setModalVisible] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [filteredTokens, setFilteredTokens] = useState<Coin[]>([]);
	const [currentTokenValue, setCurrentTokenValue] = useState<number>(0);
	const [totalValueReceived, setTotalValueReceived] = useState<number>(0);
	const [currency, setCurrency] = useState<Currency | null>(null);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const routes = route.params; // Obter o ID da carteira
	const walletId = routes && routes.walletId

	useEffect(() => {
		const fetchCoinsEffect = async () => {
			try {
				const response = await fetchCoins()
				setTokens(response!);
			} catch (error) {
				console.error('Error fetching coins:', error);
			}
		};
		fetchCoinsEffect();
	}, []);

	useEffect(() => {
		const fetchCurrenciesAddToken = async () => {
			const currency1saved = await loadCurrency();
			const currencies = await fetchCurrencies()
			const currency1Value = currencies!.find(({ name }) => name === currency1saved)
			setCurrency(currency1Value!);
		};

		fetchCurrenciesAddToken();
	}, []);

	useEffect(() => {
		if (searchText) {
			const filtered = tokens.filter(token =>
				token!.name!.toLowerCase().includes(searchText.toLowerCase()) ||
				token!.symbol!.toLowerCase().includes(searchText.toLowerCase())
			);
			setFilteredTokens(filtered)
		}
		else {
			setFilteredTokens(tokens);
		}
	}, [searchText, tokens])

	useEffect(() => {
		const fetchTokenValue = async () => {
			console.log(selectedToken?.id, currency)
			if (selectedToken) {
				const price = await fetchTokenPrice(selectedToken.id, currency!);
				console.log(price)
				setCurrentTokenValue(price ? price : 0);
			}
		};

		fetchTokenValue();
	}, [selectedToken, currency]);

	const handleTokenAmountChange = (value: string) => {
		const sanitizedValue = value.replace(',', '.');
		const parsedValue = parseFloat(sanitizedValue);

		if (!isNaN(parsedValue) || sanitizedValue === '') {
			setTokenAmount(sanitizedValue);
			if (!isNaN(parsedValue)) {
				updateTotalValueReceived(parsedValue);
			} else {
				updateTotalValueReceived(0);
			}
		} else {
			setTokenAmount('');
		}
	};

	const handleCurrentTokenValueChange = (number: number) => {
		setCurrentTokenValue(number);
		updateTotalValueReceived(parseFloat(tokenAmount));
	};

	const updateTotalValueReceived = (amount: number) => {
		const parsedAmount = amount;
		const parsedCurrentValue = currentTokenValue;

		if (!isNaN(parsedAmount) && !isNaN(parsedCurrentValue)) {
			const totalValue = parsedAmount * parsedCurrentValue;
			setTotalValueReceived(totalValue);
		} else {
			setTotalValueReceived(0);
		}
	};

	// screens/AddTokenScreen.tsx
	const handleAddToken = async () => {
		if (!selectedToken || !tokenAmount || !currentTokenValue) {
			Alert.alert('Error', 'Please select a token, enter the amount, and set the current value.');
			return;
		}

		const amount = parseFloat(tokenAmount.replace(',', '.'));
		const currentValue = currentTokenValue;

		if (isNaN(amount) || isNaN(currentValue)) {
			Alert.alert('Error', 'Invalid amount or current value.');
			return;
		}

		try {
			await saveToken({
				id: selectedToken.id,
				name: selectedToken.name,
				amount: amount,
				priceCurrency1: currentValue,
				tokenCoin: selectedToken,
				walletId: walletId,
				totalAmount: 0,
				currentValue: currentValue,
				percentageChange: null,
				percentageOfWallet: 0
			});

			navigation.goBack(); // Voltar para a tela anterior
		} catch (error) {
			Alert.alert('Error', 'Failed to save token.');
		}
	};

	const handleSelectToken = (token: Coin) => {
		setSelectedToken(token);
		setModalVisible(false);
	};

	const handleOpenModal = () => {
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		setSearchText('');
	};
	const renderTokenItem = ({ item }: { item: Coin }) => (
		<TouchableOpacity style={styles.tokenItem} onPress={() => handleSelectToken(item)}>

			<Image source={{ uri: item?.image }} width={32} height={32} ></Image>

			<Text style={styles.tokenItemText}>{item.name} ({item.symbol.toUpperCase()})</Text>
		</TouchableOpacity>
	);

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
				<View style={styles.container}>
					<Text style={styles.title}>Add New Token</Text>

					{/* Token Selection */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Select Token:</Text>
						<TouchableOpacity style={styles.selectButton} onPress={handleOpenModal}>
							<Text style={styles.selectText}>
								{selectedToken ? `${selectedToken.name} (${selectedToken.symbol.toUpperCase()})` : 'Select a token'}
							</Text>
							<Feather name="chevron-down" size={20} color="grey" />
						</TouchableOpacity>
					</View>

					{/* Token Amount Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Amount of Tokens:</Text>
						<TextInput
							style={[styles.input, { color: theme.colors.text }]}
							keyboardType="numeric"
							value={tokenAmount}
							onChangeText={handleTokenAmountChange}
							placeholder="Enter amount"
							placeholderTextColor={theme.colors.secondaryText}
							selectionColor={theme.colors.secondaryText}
						/>
					</View>

					{/* Valor Atual do Token */}
					<View style={styles.inputContainer}>
						{currency && <Text style={styles.label}>Current Value in {currency.name}:</Text>}
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<TextInput
								style={[styles.input, { color: theme.colors.text, flex: 1 }]}
								keyboardType="numeric"
								value={currentTokenValue.toString()}
								onChangeText={(value) => handleCurrentTokenValueChange(parseFloat(value))}
								placeholder="Enter current value"
								placeholderTextColor={theme.colors.secondaryText}
								selectionColor={theme.colors.secondaryText}
								editable={isEditing}
							/>
							<TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
								<Feather name={isEditing ? "check" : "edit"} size={24} color="grey" />
							</TouchableOpacity>
						</View>
					</View>

					{/* Valor Total Recebido */}
					<View style={styles.inputContainer}>
						{currency && <Text style={styles.label}>Total Value Received in {currency!.name}:</Text>}
						<Text style={styles.value}>{totalValueReceived}</Text>
					</View>

					<Button title="Add Token" onPress={handleAddToken} color={theme.colors.primary} />

					<Modal
						animationType="slide"
						transparent={true}
						visible={modalVisible}
						onRequestClose={handleCloseModal}
					>
						<View style={styles.centeredView}>
							<View style={styles.modalView}>
								<View style={styles.searchContainer}>
									<Feather name="search" size={20} color={theme.colors.secondaryText} style={styles.searchIcon} />
									<TextInput
										placeholder="Search token"
										style={[styles.searchInput, { color: theme.colors.text }]}
										onChangeText={setSearchText}
										placeholderTextColor={theme.colors.secondaryText}
									/>
									<TouchableOpacity onPress={handleCloseModal} style={styles.modalClose}>
										<Feather name="x" size={20} color={theme.colors.secondaryText} />
									</TouchableOpacity>
								</View>
								<FlatList
									data={filteredTokens}
									renderItem={renderTokenItem}
									keyExtractor={(item) => item.id}
								/>
							</View>
						</View>
					</Modal>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: theme.spacing.xlarge,
		backgroundColor: theme.colors.background,
	},
	title: {
		fontSize: theme.fontSizes.small,
		fontWeight: 'bold',
		marginBottom: theme.spacing.xlarge,
		textAlign: 'left',
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
		color: theme.colors.text,
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
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
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
		borderBottomColor: theme.colors.border,
		display: 'flex',
		flexDirection: 'row',
		gap: theme.spacing.xlarge,
		justifyContent: 'flex-start'
	},
	tokenItemText: {
		fontSize: theme.fontSizes.large,
		color: theme.colors.text,
		textAlign: 'left'
	},
	value: {
		fontSize: theme.fontSizes.large,
		color: theme.colors.text,
		fontWeight: 'bold',
	},
});

export default AddTokenScreen;