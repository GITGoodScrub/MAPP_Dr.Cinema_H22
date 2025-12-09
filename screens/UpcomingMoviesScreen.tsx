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
import { Movie, getUpcomingMovies } from '../Services';
import { MovieCard } from '../components/Movie';

export default function UpcomingMoviesScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUpcomingMovies();
    }, []);

    const loadUpcomingMovies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUpcomingMovies();
            
            // Sort by release date (if available in omdb data)
            const sorted = data.sort((a, b) => {
                const dateA = a.omdb?.[0]?.Released ? new Date(a.omdb[0].Released).getTime() : 0;
                const dateB = b.omdb?.[0]?.Released ? new Date(b.omdb[0].Released).getTime() : 0;
                return dateA - dateB;
            });
            
            setMovies(sorted);
        } catch (err: any) {
            setError(err.message || 'Failed to load upcoming movies');
            console.error('Error loading upcoming movies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMoviePress = (movie: Movie) => {
        router.push({
            pathname: '/movie-detail' as any,
            params: {
                movie: JSON.stringify(movie)
            }
        });
    };

    const renderMovieItem = ({ item }: { item: Movie }) => {
        const releaseDate = item.omdb?.[0]?.Released;
        return (
            <View>
                <MovieCard 
                    movie={item}
                    onPress={handleMoviePress}
                />
                {releaseDate && (
                    <Text style={styles.releaseDate}>
                        Release Date: {new Date(releaseDate).toLocaleDateString()}
                    </Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading upcoming movies...</Text>
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
                <Text style={styles.headerTitle}>Upcoming Movies</Text>
                <Text style={styles.subtitle}>
                    {movies.length} {movies.length === 1 ? 'movie' : 'movies'} coming soon
                </Text>
            </View>

            <FlatList
                data={movies}
                keyExtractor={(item) => item._id}
                renderItem={renderMovieItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No upcoming movies available</Text>
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
    releaseDate: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        marginTop: -8,
        marginBottom: 12,
        marginLeft: 16,
    },
});
