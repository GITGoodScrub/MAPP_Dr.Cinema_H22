import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Movie, getMovies, groupMoviesByCinema } from '../Services';
import { MovieCard } from '../components/Movie';

export default function HomeScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [groupedMovies, setGroupedMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMovies();
            setMovies(data);
            
            // Group movies by cinema
            const grouped = groupMoviesByCinema(data);
            
            // Convert to SectionList format
            const sections = grouped.map(group => ({
                title: group.cinemaName,
                cinemaId: group.cinemaId,
                data: group.movies
            }));
            
            setGroupedMovies(sections);
        } catch (err: any) {
            setError(err.message || 'Failed to load movies');
            console.error('Error loading movies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMoviePress = (movie: Movie) => {
        // TODO: Navigate to movie detail screen
        console.log('Movie pressed:', movie.title);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading movies...</Text>
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
                <Text style={styles.headerTitle}>Movies</Text>
            </View>
            
            <SectionList
                sections={groupedMovies}
                keyExtractor={(item, index) => `${item._id}-${groupedMovies.findIndex(section => section.data.includes(item))}-${index}`}
                renderItem={({ item }) => (
                    <MovieCard 
                        movie={item} 
                        onPress={handleMoviePress}
                    />
                )}
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.movieCount}>
                            {section.data.length} {section.data.length === 1 ? 'movie' : 'movies'}
                        </Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={true}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No movies available</Text>
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
    sectionHeader: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
    },
    movieCount: {
        fontSize: 14,
        color: '#666',
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
