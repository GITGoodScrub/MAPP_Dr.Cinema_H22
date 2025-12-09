import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Theater, getTheaters } from '../Services';
import { CinemaCard } from '../components/Cinema';

export default function CinemasScreen() {
    const [cinemas, setCinemas] = useState<Theater[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCinemas();
    }, []);

    const loadCinemas = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTheaters();
            // Sort alphabetically by name
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            setCinemas(sorted);
        } catch (err: any) {
            setError(err.message || 'Failed to load cinemas');
            console.error('Error loading cinemas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCinemaPress = (cinema: Theater) => {
        router.push({
            pathname: '/cinema-detail' as any,
            params: {
                cinema: JSON.stringify(cinema)
            }
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading cinemas...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cinemas</Text>
                <Text style={styles.subtitle}>
                    {cinemas.length} {cinemas.length === 1 ? 'cinema' : 'cinemas'}
                </Text>
            </View>

            <FlatList
                data={cinemas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CinemaCard 
                        cinema={item}
                        onPress={handleCinemaPress}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No cinemas available</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#c62828',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
