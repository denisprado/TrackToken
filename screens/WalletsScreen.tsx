import { Feather } from '@expo/vector-icons'; // Importando Feather para ícones
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SettingsModal from '../components/SettingsModal';
import { Currency, Wallet, WalletData } from '../types/types';
import { fetchCurrencies, fetchTokenPrice } from '../utils/api';
import { clearStorage, fetchWallets, loadCurrency, loadTokensByWalletId } from '../utils/storage'; // Função para buscar carteiras

import { useTheme } from '../context/ThemeContext';
import useThemedStyles from '../hooks/useThemedStyles';
import theme from '../utils/theme';


const WalletsScreen = ({ navigation }: { navigation: any }) => {

	const { toggleTheme } = useTheme(); // Usando o contexto do tema
	const styles = useThemedStyles(); // Obtendo estilos baseados no tema

	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [currency, setCurrency] = useState<Currency | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [settingsModalVisible, setSettingsModalVisible] = useState(false);
	const [tempPrimaryCurrency, setTempPrimaryCurrency] = useState<string | null>(null);
	const [walletData, setWalletData] = useState<WalletData>();

	const loadWallets = async () => {
		const loadedWallets = await fetchWallets(); // Carregar carteiras do armazenamento
		setWallets(loadedWallets);
	};

	useFocusEffect(
		React.useCallback(() => {
			loadWallets();
		}, [])
	);

	useEffect(() => {
		loadWallets();
	}, []);

	const handleWalletPress = (wallet: Wallet) => {
		navigation.navigate('Tokens', { walletId: wallet.id, walletName: wallet.name, initialCurrency: currency }); // Navegar para a tela de tokens
	};

	const handleCreateWallet = () => {
		navigation.navigate('CreateWalletScreen'); // Navegar para a tela de criação de carteira
	};

	useEffect(() => {
		const loadInitialCurrency = async () => {
			const savedCurrency = await loadCurrency();
			setCurrency({ id: savedCurrency!, name: savedCurrency!, symbol: savedCurrency! });
		};

		const fetchCurrenciesData = async () => {
			const data = await fetchCurrencies();
			if (data) {
				setCurrencies(data);
			}
		};
		fetchCurrenciesData();
		loadInitialCurrency();
	}, []);

	const formattedCurrencyTotalAmount = (ammount: number) => {
		return ammount !== null
			? new Intl.NumberFormat('pt-BR', {
				style: 'currency',
				currency: currency?.symbol || 'usd', // Usar 'usd' como padrão se currency não estiver definido
			}).format(ammount)
			: 'Loading...'
	};

	const handleOpenSettingsModal = () => {
		setSettingsModalVisible(true);
	};

	const handleCloseSettingsModal = () => {
		setSettingsModalVisible(false);
	};

	const handleConfirmCurrencySelection = () => {
		// Lógica para confirmar a seleção da moeda
		handleCloseSettingsModal();
	};

	const handleClearStorage = async () => {
		await clearStorage(); // Chama a função para limpar o armazenamento
		Alert.alert("Sucesso", "Todos os dados foram limpos."); // Exibe um alerta de sucesso
		loadWallets(); // Recarrega os tokens após a limpeza
	};

	const walletAmount = async (walletId: string) => {
		const tokens = await loadTokensByWalletId(walletId);
		let amount = 0;
		let percentageChange = 0;
		const tokenImages: string[] = [];

		for (const token of tokens || []) {
			const price = await fetchTokenPrice(token.tokenCoin?.id!, currency);

			for (const addition of token.additions || []) {
				const currentPrice = price || 0;
				const purchasePrice = addition.priceAtPurchaseCurrency1 || 0;

				// Cálculo do amount
				amount += addition.amount * currentPrice;

				// Cálculo do percentageChange
				if (addition.amount > 0) {
					percentageChange += ((currentPrice - purchasePrice) / purchasePrice) * 100; // Cálculo percentual
				}
			}

			if (token.tokenCoin?.image) {
				tokenImages.push(token.tokenCoin.image);
			}
		}

		return { amount, percentageChange: percentageChange.toFixed(2), tokenImages };
	}

	const loadWalletAmounts = async () => {
		const data = {} as any;
		for (const wallet of wallets) {
			data[wallet.id] = await walletAmount(wallet.id);
		}
		setWalletData(data);
	};

	useEffect(() => {
		loadWallets();
	}, []);

	useEffect(() => {
		if (wallets.length > 0) {
			loadWalletAmounts();
		}
	}, [wallets]);

	const renderWalletItem = ({ item }: { item: Wallet }) => (
		<TouchableOpacity style={styles.itemContainer} onPress={() => handleWalletPress(item)}>
			<View style={styles.leftContainer}>
				<Text style={styles.name}>{item.name}</Text>

				<View style={styles.tokenImagesContainer}>
					{walletData?.[item.id]?.tokenImages.map((image, index) => (
						<Image key={index} source={{ uri: image }} style={styles.tokenImage} />
					))}
				</View>
			</View>
			<View style={styles.rightContainer}>
				<Text style={styles.value}>{formattedCurrencyTotalAmount(walletData?.[item.id]?.amount || 0)}</Text>
				<Text style={[styles.currencyPercentageChange, walletData && +walletData?.[item.id]?.percentageChange >= 0 ? styles.gain : styles.loss]}>{walletData && walletData[item.id]?.percentageChange || 0}%</Text>
			</View>

			<TouchableOpacity style={styles.iconButton} onPress={() => handleWalletPress(item)}>
				<Feather name="chevron-right" size={18} color={styles.iconButtonText.color} />
			</TouchableOpacity>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Carteiras</Text>
				<TouchableOpacity style={styles.iconButton} onPress={handleOpenSettingsModal}>
					<Feather name='settings' size={24} color={styles.iconButtonText.color} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
					<Feather name='moon' size={24} color={styles.iconButtonText.color} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={handleClearStorage}>
					<Feather name="trash-2" size={24} color={styles.iconButtonText.color} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={handleCreateWallet}>
					<Feather name="plus-circle" size={24} color={styles.iconButtonText.color} />
				</TouchableOpacity>
			</View>

			<FlatList
				data={wallets}
				renderItem={renderWalletItem}
				keyExtractor={(item) => item.id}
			/>


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

export default WalletsScreen; 