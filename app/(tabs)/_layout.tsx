import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Movies',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎬</Text>,
                }}
            />
            <Tabs.Screen
                name="cinemas"
                options={{
                    title: 'Cinemas',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎭</Text>,
                }}
            />
            <Tabs.Screen
                name="upcoming"
                options={{
                    title: 'Upcoming',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📅</Text>,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favorites',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>❤️</Text>,
                }}
            />
        </Tabs>
    );
}
