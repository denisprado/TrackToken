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
							<Feather name="x" size={20} color={theme.colors.secondaryText} />
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
	label: {
		fontSize: theme.fontSizes.large,
		color: theme.colors.text,
		marginBottom: theme.spacing.small,
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
});

export default SettingsModal;
