import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { clearStorage, fetchWallets, loadCurrency, loadTokensByWalletId, removeWallet } from '../utils/storage'; // Função para buscar carteiras
import { Feather } from '@expo/vector-icons'; // Importando Feather para ícones
import { theme } from '../utils/theme';
import { Currency, Wallet } from '../types/types';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCurrencies, fetchTokenPrice } from '../utils/api';
import SettingsModal from '../components/SettingsModal';

const WalletsScreen = ({ navigation }: { navigation: any }) => {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [currency, setCurrency] = useState<Currency | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [settingsModalVisible, setSettingsModalVisible] = useState(false);
	const [tempPrimaryCurrency, setTempPrimaryCurrency] = useState<string | null>(null);
	const [walletData, setWalletData] = useState<{ [key: string]: { amount: number, percentageChange: number, tokenImages: string[] } }>({});

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
						loadWallets(); // Recarrega as carteiras após a exclusão
					},
				},
			],
			{ cancelable: false }
		);
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
			percentageChange += token.percentageChange!;

			for (const addition of token.additions || []) {
				amount += addition.amount * (price || 0);
			}

			if (token.tokenCoin?.image) {
				tokenImages.push(token.tokenCoin.image);
			}
		}

		return { amount, percentageChange, tokenImages };
	}

	const loadWalletAmounts = async () => {
		const data: { [key: string]: { amount: number, percentageChange: number, tokenImages: string[] } } = {};
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
		<TouchableOpacity style={styles.walletItem} onPress={() => handleWalletPress(item)}>
			<View>
				<Text style={styles.walletName}>{item.name}</Text>
				<Text style={styles.walletName}>{formattedCurrencyTotalAmount(walletData[item.id]?.amount || 0)}</Text>
				<Text style={styles.walletTotal}>Mudança: {walletData[item.id]?.percentageChange || 0}%</Text>
				<View style={styles.tokenImagesContainer}>
					{walletData[item.id]?.tokenImages.map((image, index) => (
						<Image key={index} source={{ uri: image }} style={styles.tokenImage} />
					))}
				</View>
			</View>
			<TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteWallet(item.id)}>
				<Feather name="trash" size={24} color={theme.text} />
			</TouchableOpacity>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Carteiras</Text>
				<TouchableOpacity style={styles.iconButton} onPress={handleOpenSettingsModal}>
					<Feather name='settings' size={24} color={theme.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={handleClearStorage}>
					<Feather name="trash-2" size={24} color={theme.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={handleCreateWallet}>
					<Feather name="plus-circle" size={24} color={theme.text} />
				</TouchableOpacity>
			</View>
			<View>
				<FlatList
					data={wallets}
					renderItem={renderWalletItem}
					keyExtractor={(item) => item.id}
				/>
			</View>

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
		flex: 1
	},
	iconButton: {
		display: 'flex',
		flexDirection: 'row',
		gap: 10,
		padding: 5,
	},
	walletItem: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 15,
		margin: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		color: theme.text,
		backgroundColor: theme.cardBackground
	},
	walletName: {
		fontSize: 16,
		color: theme.text,
		fontWeight: 'bold',
	},
	tokenImagesContainer: {
		flexDirection: 'row',
		marginTop: 5,
	},
	tokenImage: {
		width: 30,
		height: 30,
		marginRight: 5,
	},
	walletTotal: {
		fontSize: 12,
		color: theme.text,
		fontWeight: 'normal',
	},
	createButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	createButtonText: {
		fontSize: 18,
		marginLeft: 10,
		color: theme.text,
	},
});

export default WalletsScreen; 