import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../utils/theme';

import LoginScreen        from '../screens/LoginScreen';
import RegisterScreen     from '../screens/RegisterScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import HomeScreen         from '../screens/HomeScreen';
import CaloriesScreen     from '../screens/CaloriesScreen';
import WaterScreen        from '../screens/WaterScreen';
import BMIScreen          from '../screens/BMIScreen';
import ScreenTimeScreen   from '../screens/ScreenTimeScreen';
import AnalyticsScreen    from '../screens/AnalyticsScreen';
import ProfileScreen      from '../screens/ProfileScreen';
import FavoritesScreen    from '../screens/FavoritesScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TABS = [
  { name: 'Home',       component: HomeScreen,       icon: '🏠', label: 'Home'      },
  { name: 'Calories',   component: CaloriesScreen,   icon: '🍽️', label: 'Calories'  },
  { name: 'Water',      component: WaterScreen,       icon: '💧', label: 'Water'     },
  { name: 'BMI',        component: BMIScreen,         icon: '⚖️', label: 'BMI'       },
  { name: 'ScreenTime', component: ScreenTimeScreen,  icon: '📱', label: 'Screen'    },
  { name: 'Analytics',  component: AnalyticsScreen,   icon: '📊', label: 'Stats'     },
  { name: 'Profile',    component: ProfileScreen,     icon: '👤', label: 'Profile'   },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.45 }}>
              {tab?.icon}
            </Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 9, marginBottom: 3,
              color: focused ? COLORS.primary : COLORS.textMuted,
              fontWeight: focused ? '700' : '500',
            }}>
              {tab?.label}
            </Text>
          ),
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 4,
            paddingTop: 4,
          },
          headerStyle:      { backgroundColor: COLORS.white, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
          headerTintColor:  COLORS.text,
          headerTitleStyle: { fontWeight: '800', fontSize: FONTS.sizes.lg, color: COLORS.text },
          headerShadowVisible: false,
        };
      }}
    >
      {TABS.map(t => (
        <Tab.Screen key={t.name} name={t.name} component={t.component}
          options={{ title: t.name === 'ScreenTime' ? 'Screen Time' : t.name }} />
      ))}
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:      { backgroundColor: COLORS.white },
      headerTintColor:  COLORS.text,
      headerTitleStyle: { fontWeight: '700', color: COLORS.text },
      contentStyle:     { backgroundColor: COLORS.background },
    }}>
      <Stack.Screen name="Login"    component={LoginScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
}

function SetupStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:      { backgroundColor: COLORS.white },
      headerTintColor:  COLORS.text,
      headerTitleStyle: { fontWeight: '700', color: COLORS.text },
      contentStyle:     { backgroundColor: COLORS.background },
    }}>
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen}
        options={{ title: 'Complete Your Profile', headerLeft: () => null }} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:      { backgroundColor: COLORS.white },
      headerTintColor:  COLORS.text,
      headerTitleStyle: { fontWeight: '700', color: COLORS.text },
      contentStyle:     { backgroundColor: COLORS.background },
    }}>
      <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Favorites" component={FavoritesScreen} 
          options={{ title: 'Favorite Meals', headerShown: true }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <Text style={{ fontSize: 52 }}>❤️</Text>
      <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '800', marginTop: 16 }}>HealthTracker</Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 }}>Your personal health companion</Text>
    </View>
  );

  return (
    <NavigationContainer>
      {!user
        ? <AuthStack />
        : !user?.profile?.profileComplete
        ? <SetupStack />
        : <MainStack />
      }
    </NavigationContainer>
  );
}
