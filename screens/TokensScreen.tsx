import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TokenItem from '../components/TokenItem';
import { Currency, TokenAddition, TokenData } from '../types/types';
import { fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { loadCurrency, loadTokens, removeWallet, saveCurrency } from '../utils/storage';
import { theme } from '../utils/theme';
import SettingsModal from '../components/SettingsModal';
// Definições de tipos

const TokensScreen = ({ route }: { route: any }) => {

	// Estado
	const navigation = useNavigation();
	const routes = route.params; // Obter o ID da carteira
	const walletId = routes && routes.walletId
	const walletName = routes && routes.walletName; // Obtendo o nome da carteira a partir dos parâmetros
	const initialCurrency = routes && routes.initialCurrency;

	const [tokens, setTokens] = useState<TokenData[]>([]);
	const [loading, setLoading] = useState(true);
	const updateInterval = useRef<any>(null);
	const [currency, setCurrency] = useState<Currency | null>(initialCurrency);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [tempPrimaryCurrency, setTempPrimaryCurrency] = useState<string | null>(null);
	const [settingsModalVisible, setSettingsModalVisible] = useState(false);

	// Efeitos
	useEffect(() => {
		loadTokensForWallet();
	}, [currency]);

	useFocusEffect(
		React.useCallback(() => {
			loadTokensForWallet();
			updateInterval.current = setInterval(loadTokensForWallet, 600000);

			return () => {
				if (updateInterval.current) {
					clearInterval(updateInterval.current);
				}
			};
		}, [])
	);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			// Chame a função para atualizar a lista de tokens aqui
			loadTokensForWallet();
		});

		return unsubscribe; // Limpa o listener ao desmontar
	}, [navigation]);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			// Chame a função para atualizar a lista de tokens aqui
			loadTokensForWallet();
		});

		return unsubscribe; // Limpa o listener ao desmontar
	}, [navigation]);

	const findCurrencyBySymbol = (symbolToFind: string) => {
		const currencyToFind = currencies.find(({ symbol }) => symbol === symbolToFind.toLowerCase())
		return currencyToFind!
	}

	useEffect(() => {
		const loadInitialCurrency = async () => {
			const savedCurrency = await loadCurrency();
			const currency = findCurrencyBySymbol(savedCurrency!)
			setCurrency(currency!);
		};


		const fetchCurrenciesData = async () => {
			const data = await fetchCurrencies();
			if (data) {
				setCurrencies(data);
			}
		};

		loadInitialCurrency();
		fetchCurrenciesData();
	}, [navigation]);

	// Funções

	const loadTokensForWallet = async () => {
		const allTokens = await loadTokens();

		try {
			if (allTokens) {
				const tokensWithPrice = await Promise.all(
					allTokens.map(async (token: TokenData) => {

						const price = await fetchTokenPrice(token.id, currency!);
						const totalAmount = calculateTotalAmount(token.additions);
						const { percentageChange } = await calculatePercentageChange(token.additions, price)

						return {
							...token,
							totalAmount: totalAmount,
							currentValue: price ? totalAmount * price : null,
							percentageChange,
							currency,
						};
					})
				)

				const walletTokens = tokensWithPrice.filter(token => token && token?.walletId! === walletId); // Filtrar tokens pela carteira

				// Calcular o valor total da carteira
				const totalWalletValue = walletTokens.reduce((sum, token) => sum + (token.currentValue || 0), 0);

				// Calcular a porcentagem que cada token representa do total da carteira
				const tokensWithPercentage = walletTokens.map(token => ({
					...token,
					percentageOfWallet: token.currentValue ? (token.currentValue / totalWalletValue) * 100 : 0,
				}));

				setTokens(tokensWithPercentage);
			} else {
				setTokens([]); // Se não houver tokens, define a lista como vazia
			}

		} catch (error) {
			console.error('Erro ao carregar tokens', error);
		} finally {
			setLoading(false);
		}
	}

	const calculateTotalAmount = (additions: TokenAddition[]) => {
		return additions.reduce((sum, addition) => sum + addition.amount, 0);
	};

	const calculatePercentageChange = async (
		additions: TokenAddition[],
		currentPriceCurrency1: number | null,
	): Promise<{ percentageChange: number | null; }> => {
		// Verifica se os preços atuais estão disponíveis

		if (!currentPriceCurrency1 || additions.length === 0 || !currency) {
			console.log("Preços atuais ou adições não disponíveis.");
			return { percentageChange: null };
		}

		let totalInvestmentCurrency1 = 0; // Total investido para moeda 1
		let totalAmount = 0; // Total de quantidades

		// Itera sobre as adições para calcular o total investido e a quantidade total
		additions.forEach((addition) => {
			const amount = addition.amount;
			totalAmount += amount; // Soma a quantidade total
			totalInvestmentCurrency1 += amount * addition.priceAtPurchaseCurrency1!; // Usa o preço no momento da compra para moeda 1

		});

		// Obtém o preço atual do token na moeda selecionada

		const currentTotalValueCurrency1 = totalAmount * currentPriceCurrency1; // Valor atual na moeda original

		// Calcula a porcentagem de mudança em relação à moeda original
		const percentageChangeCurrency1 = ((currentTotalValueCurrency1 - totalInvestmentCurrency1) / totalInvestmentCurrency1) * 100;

		return { percentageChange: percentageChangeCurrency1 }; // Retorna a porcentagem em relação à moeda atual
	};

	const handleTokenPress = (tokenId: string) => {
		navigation.navigate('TokenDetails', { tokenId, currency: currency?.symbol! });
	};

	const handleOpenSettingsModal = () => {
		setSettingsModalVisible(true);
	};

	const handleCloseSettingsModal = () => {
		setSettingsModalVisible(false);
	};

	const handleConfirmCurrencySelection = async () => {
		setCurrency(findCurrencyBySymbol(tempPrimaryCurrency!)!);
		await saveCurrency(tempPrimaryCurrency!); // Salva a moeda primária
		handleCloseSettingsModal(); // Fecha o modal

		// Recarrega os tokens após a seleção das moedas
		loadTokensForWallet(); // Chama a função para recarregar os tokens
	};


	const handleDeleteWallet = async (walletId: string) => {
		Alert.alert(
			'Confirmar Exclusão',
			'Você tem certeza que deseja excluir esta carteira?',
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Excluir',
					onPress: async () => {
						await removeWallet(walletId);
						navigation.navigate('Wallets'); // Recarrega as carteiras após a exclusão
					},
				},
			],
			{ cancelable: false }
		);
	};


	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>{walletName}</Text>

				<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddToken', { walletId: walletId })}>
					<Feather name="plus-circle" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={() => loadTokensForWallet()}>
					<Feather name="refresh-ccw" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteWallet(walletId)}>
					<Feather name="trash" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={handleOpenSettingsModal}>
					<Feather name="settings" size={24} color={theme.colors.text} />
					<Text style={styles.label}>({currency?.symbol.toUpperCase()})</Text>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.accent} />
				</View>
			) : (
				<FlatList
					data={tokens}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TokenItem
							onPress={() => handleTokenPress(item.id)}
							totalAmount={item.totalAmount.toString()}
							tokenCoin={item.tokenCoin!}
							currencyPercentageChange={item.percentageChange}
							currencyTotalAmount={item.currentValue}
							currency={currency}
							percentageOfWallet={item.percentageOfWallet}
						/>
					)}
					style={styles.listStyle}
					onRefresh={loadTokensForWallet}
					refreshing={loading}
				/>
			)}

			<SettingsModal
				visible={settingsModalVisible}
				onClose={handleCloseSettingsModal}
				currencies={currencies}
				selectedCurrency={tempPrimaryCurrency}
				onCurrencyChange={setTempPrimaryCurrency}
				onConfirm={handleConfirmCurrencySelection}
			/>
		</View>
	);
};

// Estilos
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
	title: {
		fontSize: theme.fontSizes.xlarge,
		fontWeight: 'bold',
		color: theme.colors.text,
		flex: 1
	},
	iconButton: {
		display: 'flex',
		flexDirection: 'row',
		gap: theme.spacing.medium,
		padding: theme.spacing.small,
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
		backgroundColor: theme.colors.background,
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
		right: theme.spacing.medium,
	},
	modalTitle: {
		fontSize: theme.fontSizes.xlarge,
		fontWeight: 'bold',
		color: theme.colors.text,
		marginBottom: theme.spacing.medium,
	},
	inputContainer: {
		marginBottom: theme.spacing.medium,
	},
	label: {
		fontSize: theme.fontSizes.large,
		color: theme.colors.text,
		marginBottom: theme.spacing.small,
	},
	input: {
		height: 40,
		backgroundColor: theme.colors.inputBackground,
		borderColor: theme.colors.border,
		borderWidth: 1,
		padding: theme.spacing.medium,
		borderRadius: theme.spacing.small,
	},
	listStyle: {
		marginHorizontal: -theme.spacing.xlarge,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: theme.spacing.medium
	},
	picker: {
		height: 50,
		backgroundColor: theme.colors.inputBackground,
		color: theme.colors.text,
	},
	confirmButton: {
		backgroundColor: theme.colors.primary,
		padding: theme.spacing.medium,
		borderRadius: theme.spacing.small,
		marginTop: theme.spacing.medium,
		alignItems: 'center',
		zIndex: 1,
	},
	confirmButtonText: {
		color: theme.colors.text,
		fontWeight: 'bold',
	},
	selectText: {
		fontSize: theme.fontSizes.large,
		color: theme.colors.text,
		padding: theme.spacing.medium,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.spacing.small,
		textAlign: 'center',
		marginBottom: theme.spacing.medium,
	},
});

export default TokensScreen;