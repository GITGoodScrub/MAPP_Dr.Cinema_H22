import React, { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Theater } from '../Services';
import { CinemaCard } from '../components/Cinema';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCinemas } from '../store/cinemasSlice';

export default function CinemasScreen() {
    const dispatch = useAppDispatch();
    const { cinemas, loading, error } = useAppSelector((state) => state.cinemas);
    
    const sortedCinemas = useMemo(() => {
        return [...cinemas].sort((a, b) => a.name.localeCompare(b.name));
    }, [cinemas]);

    useEffect(() => {
        dispatch(fetchCinemas());
    }, [dispatch]);

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
                    {sortedCinemas.length} {sortedCinemas.length === 1 ? 'cinema' : 'cinemas'}
                </Text>
            </View>

            <FlatList
                data={sortedCinemas}
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
