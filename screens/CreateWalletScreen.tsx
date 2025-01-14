import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { fetchWallets, saveWallet } from '../utils/storage'; // Função para salvar carteiras
import useThemedStyles from '../hooks/useThemedStyles';

const CreateWalletScreen = ({ navigation }: { navigation: any }) => {
	const [walletName, setWalletName] = useState('');
	const styles = useThemedStyles(); // Obtendo estilos baseados no tema

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
			navigation.navigate('Tokens', { walletId: newWallet.id, walletName: newWallet.name });
			//navigation.goBack(); // Voltar para a tela anterior
		} catch (error) {
			Alert.alert('Erro', 'Falha ao criar a carteira.');
		}
	};

	return (
		<View style={styles.container}>
			<View>

				<Text style={styles.title}>Criar Nova Carteira</Text>
				<TextInput
					style={styles.input}
					placeholder="Nome da Carteira"
					value={walletName}
					onChangeText={setWalletName}
				/>
			</View>
			<Button title="Criar Carteira" onPress={handleCreateWallet} />
		</View>
	);
};

export default CreateWalletScreen; 