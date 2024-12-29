import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TokensScreen from './screens/TokensScreen';
import AddTokenScreen from './screens/AddTokenScreen';
import { StyleSheet, View } from 'react-native';
import { theme } from './utils/theme';
import { RootStackParamList } from './types/navigation';
import TokenDetailsScreen from './screens/TokenDetailsScreen';
import SwapTokenScreen from './screens/SwapTokenScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
	return (
		<NavigationContainer >
			<View style={styles.container}>
				<Stack.Navigator initialRouteName="Tokens" screenOptions={{
					headerStyle: {
						backgroundColor: theme.background
					},
					headerTitleStyle: {
						color: theme.text
					},
					headerTintColor: theme.text
				}}>
					<Stack.Screen name="Tokens" component={TokensScreen} options={{ headerShown: false }} />
					<Stack.Screen name="AddToken" component={AddTokenScreen} />
					<Stack.Screen name="TokenDetails" component={TokenDetailsScreen} />
					<Stack.Screen name="SwapToken" component={SwapTokenScreen} />
				</Stack.Navigator>
			</View>
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.background,
	},
});

export default App;