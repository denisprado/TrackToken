import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Button, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchTokenPrice, fetchCurrencies } from '../utils/api';
import { loadTokens, saveToken, loadCurrency, saveCurrency, clearStorage } from '../utils/storage';
import TokenItem from '../components/TokenItem';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
// Definições de tipos
interface TokenAddition {
	amount: string;
	priceAtPurchaseCurrency1: number;
	priceAtPurchaseCurrency2: number;
	timestamp: number;
}

interface Token {
	id: string;
	name: string;
	additions: TokenAddition[];
	selectedCurrency1: string;
	selectedCurrency2: string;
}

interface TokenData {
	name: string;
	id: string;
	totalAmount: number;
	currency1Value: number | null;
	currency1Change: number | null;
	selectedCurrency1: string;
	selectedCurrency2: string;
	currency2Value: number | null;
	currency2Change: number | null;
}

interface Currency {
	id: string;
	symbol: string;
	name: string;
}

const TokensScreen = () => {
	// Constantes
	const DEFAULT_CURRENCY_1 = "usdc";
	const DEFAULT_CURRENCY_2 = "brl";

	// Estado
	const navigation = useNavigation();
	const [tokens, setTokens] = useState<TokenData[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
	const [redeemAmount, setRedeemAmount] = useState('');
	const updateInterval = useRef<any>(null);
	const [currency1, setCurrency1] = useState(DEFAULT_CURRENCY_1);
	const [currency2, setCurrency2] = useState(DEFAULT_CURRENCY_2);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [tempPrimaryCurrency, setTempPrimaryCurrency] = useState(DEFAULT_CURRENCY_1);
	const [tempSecondaryCurrency, setTempSecondaryCurrency] = useState(DEFAULT_CURRENCY_2);
	const [isPrimaryPickerVisible, setIsPrimaryPickerVisible] = useState(false);
	const [isSecondaryPickerVisible, setIsSecondaryPickerVisible] = useState(false);
	const [settingsModalVisible, setSettingsModalVisible] = useState(false);

	// Efeitos
	useEffect(() => {
		loadInitialTokens();
	}, [currency1, currency2]);

	useFocusEffect(
		React.useCallback(() => {
			loadInitialTokens();
			updateInterval.current = setInterval(loadInitialTokens, 60000); // Atualiza a cada 1 minuto

			return () => {
				if (updateInterval.current) {
					clearInterval(updateInterval.current);
				}
			};
		}, [])
	);

	useEffect(() => {
		const loadInitialCurrency = async () => {
			const savedCurrency1 = await loadCurrency("1") || DEFAULT_CURRENCY_1;
			const savedCurrency2 = await loadCurrency("2") || DEFAULT_CURRENCY_2;
			setCurrency1(savedCurrency1);
			setCurrency2(savedCurrency2);
		};


		const fetchCurrenciesData = async () => {
			const data = await fetchCurrencies();
			if (data) {
				setCurrencies(data);
			}
		};

		loadInitialCurrency();
		fetchCurrenciesData();
	}, []);

	// Funções
	const loadInitialTokens = async () => {
		setLoading(true);
		try {
			const savedTokens = await loadTokens();
			if (savedTokens) {
				const tokensWithPrice = await Promise.all(savedTokens.map(processToken));
				setTokens(tokensWithPrice);
			}
		} catch (error) {
			console.error('Erro ao carregar tokens', error);
		} finally {
			setLoading(false);
		}
	};

	const processToken = async (token: Token): Promise<TokenData> => {
		try {
			const currentPriceCurrency1 = await fetchTokenPrice(token.id, currency1);
			const currentPriceCurrency2 = await fetchTokenPrice(token.id, currency2);
			const totalAmount = calculateTotalAmount(token.additions);

			const { currency1Change, currency2Change } = calculatePercentageChange(
				token.additions,
				currentPriceCurrency1,
				currentPriceCurrency2
			);

			return {
				...token,
				totalAmount,
				currency1Value: currentPriceCurrency1 ? totalAmount * currentPriceCurrency1 : null,
				currency2Value: currentPriceCurrency2 ? totalAmount * currentPriceCurrency2 : null,
				currency1Change,
				currency2Change,
				selectedCurrency1: currency1,
				selectedCurrency2: currency2,
			};
		} catch (error) {
			console.error(`Erro ao processar token ${token.id}`, error);
			return {
				...token,
				totalAmount: 0,
				currency1Value: null,
				currency2Value: null,
				currency1Change: null,
				currency2Change: null,
				selectedCurrency1: currency1,
				selectedCurrency2: currency2,
			};
		}
	};

	const calculateTotalAmount = (additions: TokenAddition[]) => {
		return additions.reduce((sum, addition) => sum + parseFloat(addition.amount), 0);
	};

	const calculatePercentageChange = (
		additions: TokenAddition[],
		currentPriceCurrency1: number | null,
		currentPriceCurrency2: number | null
	): { currency1Change: number | null; currency2Change: number | null } => {
		// Verifica se os preços atuais estão disponíveis
		if (!currentPriceCurrency1 || !currentPriceCurrency2 || additions.length === 0) {
			console.log("Preços atuais ou adições não disponíveis.");
			return { currency1Change: null, currency2Change: null };
		}

		let totalInvestmentCurrency1 = 0; // Total investido para moeda 1
		let totalInvestmentCurrency2 = 0; // Total investido para moeda 2
		let totalAmount = 0; // Total de quantidades

		// Itera sobre as adições para calcular o total investido e a quantidade total
		additions.forEach((addition) => {
			const amount = parseFloat(addition.amount);
			totalAmount += amount; // Soma a quantidade total
			totalInvestmentCurrency1 += amount * addition.priceAtPurchaseCurrency1; // Usa o preço no momento da compra para moeda 1
			totalInvestmentCurrency2 += amount * addition.priceAtPurchaseCurrency2; // Usa o preço no momento da compra para moeda 2

			// Logs para debugar
			console.log(`Adição: ${JSON.stringify(addition)}`);
			console.log(`Total Amount: ${totalAmount}`);
			console.log(`Total Investment Currency 1: ${totalInvestmentCurrency1}`);
			console.log(`Total Investment Currency 2: ${totalInvestmentCurrency2}`);
		});

		// Calcula o valor total atual para cada moeda
		const currentTotalValueCurrency1 = totalAmount * currentPriceCurrency1;
		const currentTotalValueCurrency2 = totalAmount * currentPriceCurrency2;

		// Logs para verificar os valores atuais
		console.log(`Current Price Currency 1: ${currentPriceCurrency1}`);
		console.log(`Current Price Currency 2: ${currentPriceCurrency2}`);
		console.log(`Current Total Value Currency 1: ${currentTotalValueCurrency1}`);
		console.log(`Current Total Value Currency 2: ${currentTotalValueCurrency2}`);

		// Calcula a porcentagem de mudança
		const currency1Change = ((currentTotalValueCurrency1 - totalInvestmentCurrency1) / totalInvestmentCurrency1) * 100;
		const currency2Change = ((currentTotalValueCurrency2 - totalInvestmentCurrency2) / totalInvestmentCurrency2) * 100;

		// Logs para verificar as porcentagens calculadas
		console.log(`Currency 1 Change: ${currency1Change}`);
		console.log(`Currency 2 Change: ${currency2Change}`);

		return { currency1Change, currency2Change };
	};

	const handleOpenRedeemModal = (tokenId: string) => {
		setSelectedTokenId(tokenId);
		setModalVisible(true);
	};

	const handleCloseRedeemModal = () => {
		setSelectedTokenId(null);
		setModalVisible(false);
		setRedeemAmount('');
	};

	const handleRedeemToken = async () => {
		if (!selectedTokenId || !redeemAmount) {
			Alert.alert('Error', 'Please enter the amount to redeem.');
			return;
		}
		try {
			const amount = parseFloat(redeemAmount.replace(',', '.'));
			if (isNaN(amount)) {
				Alert.alert('Error', 'Invalid amount.');
				return;
			}

			const currentPrice1 = await fetchTokenPrice(selectedTokenId, currency1);
			const currentPrice2 = await fetchTokenPrice(selectedTokenId, currency2);

			await saveToken({
				id: selectedTokenId,
				name: tokens.find(token => token.id === selectedTokenId)?.name || '',
				amount: String(-amount),
				priceCurrency1: currentPrice1,
				priceCurrency2: currentPrice2,
				selectedCurrency1: currency1,
				selectedCurrency2: currency2,
			});
			loadInitialTokens();
			handleCloseRedeemModal();
		} catch (error) {
			console.error('Error removing token: ', error);
			Alert.alert('Error', 'Failed to redeem token.');
		}
	};

	const handleTokenPress = (tokenId: string) => {
		navigation.navigate('TokenDetails', { tokenId });
	};

	const handleOpenSettingsModal = () => {
		setSettingsModalVisible(true)
	};

	const handleCloseSettingsModal = () => {
		setSettingsModalVisible(false);
	};

	const handleConfirmCurrencySelection = async () => {
		setCurrency1(tempPrimaryCurrency);
		setCurrency2(tempSecondaryCurrency);
		await saveCurrency("1", tempPrimaryCurrency!); // Salva a moeda primária
		await saveCurrency("2", tempSecondaryCurrency!); // Salva a moeda secundária
		handleCloseSettingsModal(); // Fecha o modal

		// Recarrega os tokens após a seleção das moedas
		loadInitialTokens(); // Chama a função para recarregar os tokens
	};

	const handleClearStorage = async () => {
		await clearStorage(); // Chama a função para limpar o armazenamento
		Alert.alert("Sucesso", "Todos os dados foram limpos."); // Exibe um alerta de sucesso
		loadInitialTokens(); // Recarrega os tokens após a limpeza
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Wallet</Text>
				<TouchableOpacity style={styles.iconButton} onPress={handleClearStorage}>
					<Feather name="trash-2" size={24} color={theme.text} /> {/* Ícone de lixeira */}
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddToken')}>
					<Feather name="plus-circle" size={24} color={theme.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SwapToken')}>
					<Feather name="repeat" size={24} color={theme.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={handleOpenSettingsModal}>
					<Feather name="settings" size={24} color={theme.text} />
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.accent} />
				</View>
			) : (
				<FlatList
					data={tokens}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TokenItem
							name={item.name}
							totalAmount={item.totalAmount}
							currency1Value={item.currency1Value}
							onRedeem={() => handleOpenRedeemModal(item.id)}
							onPress={() => handleTokenPress(item.id)}
							currency1PercentageChange={item.currency1Change}
							selectedCurrency1={item.selectedCurrency1}
							selectedCurrency2={item.selectedCurrency2}
							currency2Value={item.currency2Value}
							currency2PercentageChange={item.currency2Change}
						/>
					)}
					style={styles.listStyle}
				/>
			)}

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
								style={[styles.input, { color: theme.text }]}
								keyboardType="numeric"
								value={redeemAmount}
								onChangeText={setRedeemAmount}
								placeholder="Enter amount"
								placeholderTextColor={theme.secondaryText}
								selectionColor={theme.secondaryText}
							/>
						</View>
						<Button title="Redeem" onPress={handleRedeemToken} color={theme.primary} />
						<TouchableOpacity style={styles.modalClose} onPress={handleCloseRedeemModal}>
							<Feather name="x" size={20} color={theme.secondaryText} />
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={settingsModalVisible}
				onRequestClose={handleCloseSettingsModal}
			>
				<View style={styles.centeredView}>
					<View style={[styles.modalView, { minWidth: '70%' }]}>
						<Text style={styles.modalTitle}>Settings</Text>
						<ScrollView>
							<Text style={styles.label}>Select currency 1</Text>
							<TouchableOpacity onPress={() => { setIsPrimaryPickerVisible(true); setIsSecondaryPickerVisible(false); }}>
								<Text style={styles.selectText}>{tempPrimaryCurrency}</Text>
							</TouchableOpacity>
							{isPrimaryPickerVisible && (
								<Picker
									selectedValue={tempPrimaryCurrency}
									onValueChange={(value) => setTempPrimaryCurrency(value)}
									style={[styles.picker, { minWidth: '100%', height: 150 }]}
								>
									{currencies?.map(currency => (
										<Picker.Item key={currency.id} label={`${currency.name} (${currency.symbol.toUpperCase()})`} value={currency.id} />
									))}
								</Picker>
							)}
							<Text style={styles.label}>Select currency 2</Text>
							<TouchableOpacity onPress={() => { setIsSecondaryPickerVisible(true); setIsPrimaryPickerVisible(false); }}>
								<Text style={styles.selectText}>{tempSecondaryCurrency}</Text>
							</TouchableOpacity>
							{isSecondaryPickerVisible && (
								<Picker
									selectedValue={tempSecondaryCurrency}
									onValueChange={(value) => setTempSecondaryCurrency(value)}
									style={[styles.picker, { minWidth: '100%', height: 150 }]}
								>
									{currencies?.map(currency => (
										<Picker.Item key={currency.id} label={`${currency.name} (${currency.symbol.toUpperCase()})`} value={currency.id} />
									))}
								</Picker>
							)}
							<TouchableOpacity style={styles.confirmButton} onPress={handleConfirmCurrencySelection}>
								<Text style={styles.confirmButtonText}>Confirm</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalClose} onPress={handleCloseSettingsModal}>
								<Feather name="x" size={20} color={theme.secondaryText} />
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
};

// Estilos
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: theme.background,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: theme.text,
	},
	iconButton: {
		padding: 5,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		margin: 20,
		backgroundColor: theme.cardBackground,
		borderRadius: 10,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalClose: {
		position: 'absolute',
		top: 10,
		right: 10,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: theme.text,
		marginBottom: 10,
	},
	inputContainer: {
		marginBottom: 10,
	},
	label: {
		fontSize: 16,
		color: theme.text,
		marginBottom: 5,
	},
	input: {
		height: 40,
		backgroundColor: theme.inputBackground,
		borderColor: theme.border,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
	},
	listStyle: {
		marginHorizontal: -20,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10
	},
	picker: {
		height: 50,
		backgroundColor: theme.inputBackground,
		color: theme.text,
	},
	confirmButton: {
		backgroundColor: theme.primary,
		padding: 10,
		borderRadius: 5,
		marginTop: 10,
		alignItems: 'center',
		zIndex: 1,
	},
	confirmButtonText: {
		color: theme.text,
		fontWeight: 'bold',
	},
	selectText: {
		fontSize: 16,
		color: theme.text,
		padding: 10,
		borderWidth: 1,
		borderColor: theme.border,
		borderRadius: 5,
		textAlign: 'center',
		marginBottom: 10,
	},
});

export default TokensScreen;