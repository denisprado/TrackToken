import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { fetchWallets, saveWallet } from '../utils/storage'; // Função para salvar carteiras

const CreateWalletScreen = ({ navigation }: { navigation: any }) => {
	const [walletName, setWalletName] = useState('');

	const handleCreateWallet = async () => {
		if (!walletName.trim()) {
			Alert.alert('Erro', 'Por favor, insira um nome para a carteira.');
			return;
		}

		const newWallet = {
			id: Date.now().toString(), // Gerar um ID único
			name: walletName,
			tokens: [], // Inicialmente, a carteira não tem tokens
		};

		try {
			await saveWallet(newWallet); // Salvar a nova carteira
			fetchWallets();
			navigation.goBack(); // Voltar para a tela anterior
		} catch (error) {
			Alert.alert('Erro', 'Falha ao criar a carteira.');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Criar Nova Carteira</Text>
			<TextInput
				style={styles.input}
				placeholder="Nome da Carteira"
				value={walletName}
				onChangeText={setWalletName}
			/>
			<Button title="Criar Carteira" onPress={handleCreateWallet} />
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
	input: {
		height: 40,
		borderColor: '#ccc',
		borderWidth: 1,
		marginBottom: 20,
		paddingHorizontal: 10,
	},
});

export default CreateWalletScreen; 