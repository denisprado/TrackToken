import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import SettingsModal from '../components/SettingsModal';
import TokenItem from '../components/TokenItem';
import { Currency, TokenAddition, TokenData } from '../types/types';
import { fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { CURRENCY, loadCurrency, loadTokens, removeWallet, saveCurrency } from '../utils/storage';
// Definições de tipos
import { useTheme } from '../context/ThemeContext';
import useThemedStyles from '../hooks/useThemedStyles';
import { CurrencyContext } from '../context/CurrencyContext';

const TokensScreen = ({ route }: { route: any }) => {
	const { theme } = useTheme(); // Usando o contexto do tema
	const styles = useThemedStyles();
	// Estado
	const navigation = useNavigation();
	const routes = route.params; // Obter o ID da carteira
	const walletId = routes && routes.walletId
	const walletName = routes && routes.walletName; // Obtendo o nome da carteira a partir dos parâmetros
	const currencyContextValues = useContext(CurrencyContext);
	const currency = currencyContextValues?.currency?.symbol;

	const [tokens, setTokens] = useState<TokenData[]>([]);
	const [loading, setLoading] = useState(true);
	const updateInterval = useRef<any>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);


	// Efeitos
	useEffect(() => {
		loadTokensForWallet();
	}, [currency, walletId, navigation]);

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
		return currencyToFind
	}

	useEffect(() => {
		const fetchCurrenciesData = async () => {
			const data = await fetchCurrencies();
			if (data) {
				setCurrencies(data);
			}
		};
		fetchCurrenciesData();
	}, [navigation]);

	// Funções

	const loadTokensForWallet = async () => {
		const allTokens = await loadTokens();

		try {
			if (allTokens) {
				const tokensWithPrice = await Promise.all(
					allTokens.map(async (token: TokenData) => {

						const price = await fetchTokenPrice(token.id, { id: currency!, name: currency!, symbol: currency! });
						const totalAmount = calculateTotalAmount(token.additions);
						const { percentageChange } = await calculatePercentageChange(token.additions, price);

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
			console.log("Preços atuais ou adições não disponíveis.", currentPriceCurrency1, additions.length, currency);
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
		navigation.navigate('TokenDetails', { tokenId });
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
							currencyPercentageChange={item.percentageChange!}
							currencyTotalAmount={item.currentValue}
							currency={{ id: currency!, name: currency!, symbol: currency! }}
							percentageOfWallet={item.percentageOfWallet}
						/>
					)}
					style={styles.listStyle}
					onRefresh={loadTokensForWallet}
					refreshing={loading}
				/>
			)}
		</View>
	);
};

export default TokensScreen;