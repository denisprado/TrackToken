import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Button } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchTokenPrice } from '../utils/api';
import { loadTokens, removeToken, saveToken } from '../utils/storage';
import TokenItem from '../components/TokenItem';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../types/navigation';
import { Feather } from '@expo/vector-icons';

interface TokenAddition {
	amount: string;
	timestamp: number;
}

interface Token {
	id: string;
	name: string;
	additions: TokenAddition[];
}

interface TokenData {
	name: string;
	id: string;
	totalAmount: number;
	currentValue: number | null;
	percentageChange: number | null
}

const TokensScreen = () => {
	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
	const [tokens, setTokens] = useState<TokenData[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
	const [redeemAmount, setRedeemAmount] = useState('');
	const updateInterval = useRef<any>(null);


	useFocusEffect(
		React.useCallback(() => {
			loadInitialTokens();
			updateInterval.current = setInterval(loadInitialTokens, 60000); // Update every 1 minute

			return () => {
				if (updateInterval.current) {
					clearInterval(updateInterval.current);
				}
			};
		}, [])
	);
	const calculateTotalAmount = (additions: TokenAddition[]) => {
		return additions.reduce((sum, addition) => sum + parseFloat(addition.amount), 0);
	};

	const calculatePercentageChange = (additions: TokenAddition[], currentPrice: number | null): number | null => {
		if (!currentPrice || additions.length === 0) return null
		let totalInvestment = 0;
		let totalAmount = 0;
		additions.forEach((addition) => {
			totalInvestment += currentPrice * parseFloat(addition.amount);
			totalAmount += parseFloat(addition.amount);
		})
		const currentTotalValue = totalAmount * currentPrice;
		const change = currentTotalValue - totalInvestment
		return (change / totalInvestment) * 100;
	};

	const loadInitialTokens = async () => {
		setLoading(true);
		try {
			const savedTokens = await loadTokens();
			if (savedTokens) {
				const tokensWithPrice = await Promise.all(
					savedTokens.map(async (token: Token) => {
						const price = await fetchTokenPrice(token.id);
						const totalAmount = calculateTotalAmount(token.additions);
						const percentageChange = calculatePercentageChange(token.additions, price);
						return {
							...token,
							totalAmount,
							currentValue: price ? totalAmount * price : null,
							percentageChange
						};
					})
				);
				setTokens(tokensWithPrice);
			}
		} catch (error) {
			console.error('Erro ao carregar tokens', error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenRedeemModal = (tokenId: string) => {
		setSelectedTokenId(tokenId);
		setModalVisible(true)
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

			const currentPrice = await fetchTokenPrice(selectedTokenId);

			await saveToken({
				id: selectedTokenId,
				name: tokens.find(token => token.id === selectedTokenId)?.name || '',
				amount: String(-amount),
				price: currentPrice
			});
			loadInitialTokens();
			handleCloseRedeemModal();
		}
		catch (error) {
			console.error('Error removing token: ', error);
			Alert.alert('Error', 'Failed to redeem token.');
		}
	};

	const handleTokenPress = (tokenId: string) => {
		navigation.navigate('TokenDetails', { tokenId });
	};

	const handleSwapTokensPress = (tokenId: string, totalAmount: number) => {
		navigation.navigate('SwapToken', { tokenId, totalAmount });
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>My Tokens</Text>
				<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddToken')}>
					<Feather name="plus-circle" size={24} color={theme.text} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SwapToken')}>
					<Feather name="repeat" size={24} color={theme.text} />
				</TouchableOpacity>
			</View>

			{loading ?
				(<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.accent} />
				</View>) :
				(<FlatList
					data={tokens}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TokenItem
							name={item.name}
							totalAmount={item.totalAmount}
							currentValue={item.currentValue}
							onRedeem={() => handleOpenRedeemModal(item.id)}
							onPress={() => handleTokenPress(item.id)}
							onSwap={() => handleSwapTokensPress(item.id, item.totalAmount)}
							percentageChange={item.percentageChange}
						/>
					)}
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
		color: theme.text
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
		right: 10
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
		marginBottom: 5,
		color: theme.text,
	},
	input: {
		height: 40,
		backgroundColor: theme.inputBackground,
		borderColor: theme.border,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10
	}
});

export default TokensScreen;