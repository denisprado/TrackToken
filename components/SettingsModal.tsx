import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { Currency } from '../types/types';
import { theme } from '../utils/theme';

interface SettingsModalProps {
	visible: boolean;
	onClose: () => void;
	currencies: Currency[];
	selectedCurrency: string | null;
	onCurrencyChange: (value: string) => void;
	onConfirm: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	visible,
	onClose,
	currencies,
	selectedCurrency,
	onCurrencyChange,
	onConfirm,
}) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.centeredView}>
				<View style={[styles.modalView, { minWidth: '70%' }]}>
					<Text style={styles.modalTitle}>Settings</Text>
					<ScrollView>
						<Text style={styles.label}>Select currency</Text>
						<TouchableOpacity onPress={() => { }}>
							<Text style={styles.selectText}>{selectedCurrency}</Text>
						</TouchableOpacity>
						<Picker
							selectedValue={selectedCurrency!}
							onValueChange={onCurrencyChange}
							style={[styles.picker, { minWidth: '100%', height: 150 }]}
						>
							{currencies.map(currency => (
								<Picker.Item key={currency.id} label={`${currency.name} (${currency.symbol.toUpperCase()})`} value={currency.id} />
							))}
						</Picker>
						<TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
							<Text style={styles.confirmButtonText}>Confirm</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalClose} onPress={onClose}>
							<Feather name="x" size={20} color={theme.secondaryText} />
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

// Estilos
const styles = StyleSheet.create({
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
	label: {
		fontSize: 16,
		color: theme.text,
		marginBottom: 5,
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
});

export default SettingsModal;
