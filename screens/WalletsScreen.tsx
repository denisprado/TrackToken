import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { fetchWallets, loadCurrency, removeWallet } from '../utils/storage'; // Função para buscar carteiras
import { Feather } from '@expo/vector-icons'; // Importando Feather para ícones
import { theme } from '../utils/theme';
import { Currency, Wallet } from '../types/types';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCurrencies } from '../utils/api';
import SettingsModal from '../components/SettingsModal';

const WalletsScreen = ({ navigation }: { navigation: any }) => {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [currency, setCurrency] = useState<Currency | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [settingsModalVisible, setSettingsModalVisible] = useState(false);
	const [tempPrimaryCurrency, setTempPrimaryCurrency] = useState<string | null>(null);

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

	const renderWalletItem = ({ item }: { item: Wallet }) => (
		<TouchableOpacity style={styles.walletItem} onPress={() => handleWalletPress(item)}>
			<View>
				<Text style={styles.walletName}>{item.name}</Text>
				<Text style={styles.walletTotal}>Total de Tokens: {item.tokens.length}</Text>
			</View>
			<TouchableOpacity onPress={() => handleDeleteWallet(item.id)}>
				<Feather name="trash" size={24} color="red" />
			</TouchableOpacity>
			{/* Aqui você pode adicionar mais informações sobre os tokens */}
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Carteiras</Text>
			<TouchableOpacity style={styles.createButton} onPress={handleCreateWallet}>
				<Feather name="plus-circle" size={24} color="green" />
				<Text style={styles.createButtonText}> Criar Carteira</Text>
			</TouchableOpacity>
			<FlatList
				data={wallets}
				renderItem={renderWalletItem}
				keyExtractor={(item) => item.id}

			/>
			<TouchableOpacity onPress={handleOpenSettingsModal}>
				<Text style={styles.createButtonText}>Open Settings</Text>
			</TouchableOpacity>

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
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: theme.text
	},
	walletItem: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		color: theme.text
	},
	walletName: {
		fontSize: 16,
		color: theme.text,
		fontWeight: 'bold',
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
		color: theme.accent,
	},
});

export default WalletsScreen; 