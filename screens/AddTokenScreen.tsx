import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
	Alert,
	Button,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { CurrencyContext } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import useThemedStyles from '../hooks/useThemedStyles';
import { Coin } from '../types/types';
import { fetchCoins, fetchTokenPrice } from '../utils/api';
import { saveToken } from '../utils/storage';

const AddTokenScreen = ({ route }: { route: { params: { walletId: string } } }) => {
	const { theme } = useTheme(); // Usando o contexto do tema
	const styles = useThemedStyles(); // Obtendo estilos baseados no tema

	const navigation = useNavigation();
	const [tokens, setTokens] = useState<Coin[]>([]);
	const [selectedToken, setSelectedToken] = useState<Coin | null>(null);
	const [tokenAmount, setTokenAmount] = useState<string>('');
	const [modalVisible, setModalVisible] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [filteredTokens, setFilteredTokens] = useState<Coin[]>([]);
	const [currentTokenValue, setCurrentTokenValue] = useState<number>(0);
	const [totalValueReceived, setTotalValueReceived] = useState<number>(0);
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

	const currencyContextValues = useContext(CurrencyContext);
	const currency = currencyContextValues?.currency;


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
			style={{ flex: 1, backgroundColor: theme.colors.background }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
		>
			<ScrollView contentContainerStyle={{ backgroundColor: theme.colors.background, }}>
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
							placeholderTextColor={styles.inputText.color}
							selectionColor={theme.colors.inputText}
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
								placeholderTextColor={styles.inputText.color}
								selectionColor={styles.inputText.color}
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
						<Text style={styles.label}>{totalValueReceived}</Text>
					</View>

					<Button title="Add Token" onPress={handleAddToken} color={styles.createButton.color} />

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

export default AddTokenScreen;