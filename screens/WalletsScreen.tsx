import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchWallets } from '../utils/storage'; // Função para buscar carteiras
import { TokenData } from './TokensScreen';
import { Feather } from '@expo/vector-icons'; // Importando Feather para ícones

interface Wallet {
	id: string;
	name: string;
	tokens: TokenData[]; // Lista de tokens que pertencem a esta carteira
}

const WalletsScreen = ({ navigation }: { navigation: any }) => {
	const [wallets, setWallets] = useState<Wallet[]>([]);

	useEffect(() => {
		const loadWallets = async () => {
			const loadedWallets = await fetchWallets(); // Carregar carteiras do armazenamento
			setWallets(loadedWallets);
		};

		loadWallets();
	}, []);

	const handleWalletPress = (wallet: Wallet) => {
		navigation.navigate('TokensScreen', { walletId: wallet.id }); // Navegar para a tela de tokens
	};

	const handleCreateWallet = () => {
		navigation.navigate('CreateWalletScreen'); // Navegar para a tela de criação de carteira
	};

	const renderWalletItem = ({ item }: { item: Wallet }) => (
		<TouchableOpacity style={styles.walletItem} onPress={() => handleWalletPress(item)}>
			<Text style={styles.walletName}>{item.name}</Text>
			<Text>Total de Tokens: {item.tokens.length}</Text>
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
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	walletItem: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
	walletName: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	createButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	createButtonText: {
		fontSize: 18,
		marginLeft: 10,
		color: 'green',
	},
});

export default WalletsScreen; 