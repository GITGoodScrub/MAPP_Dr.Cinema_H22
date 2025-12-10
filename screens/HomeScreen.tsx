import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Movie, groupMoviesByCinema, filterMovies, MovieFilters } from '../Services';
import { MovieCard } from '../components/Movie';
import { FilterModal } from '../components/FilterModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMovies } from '../store/moviesSlice';

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const { movies, loading, error } = useAppSelector((state) => state.movies);
    
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [groupedMovies, setGroupedMovies] = useState<any[]>([]);
    const [filters, setFilters] = useState<MovieFilters>({});
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    useEffect(() => {
        dispatch(fetchMovies());
    }, [dispatch]);

    useEffect(() => {
        if (movies.length > 0) {
            setFilteredMovies(movies);
            
            // Group movies by cinema
            const grouped = groupMoviesByCinema(movies);
            
            // Convert to SectionList format
            const sections = grouped.map(group => ({
                title: group.cinemaName,
                cinemaId: group.cinemaId,
                data: group.movies
            }));
            
            setGroupedMovies(sections);
        }
    }, [movies]);

    const applyFilters = (newFilters: MovieFilters) => {
        setFilters(newFilters);
        setFilterModalVisible(false);
        
        // Count active filters
        const count = Object.values(newFilters).filter(v => v !== undefined && v !== '').length;
        setActiveFilterCount(count);
        
        // Apply filters
        const filtered = filterMovies(movies, newFilters);
        setFilteredMovies(filtered);
        
        // Re-group filtered movies
        const grouped = groupMoviesByCinema(filtered);
        const sections = grouped.map(group => ({
            title: group.cinemaName,
            cinemaId: group.cinemaId,
            data: group.movies
        }));
        
        setGroupedMovies(sections);
    };

    const handleMoviePress = (movie: Movie) => {
        router.push({
            pathname: '/movie-detail' as any,
            params: {
                movie: JSON.stringify(movie)
            }
        });
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
                <TouchableOpacity 
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Text style={styles.filterButtonText}>🔍 Filters</Text>
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
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
            
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={applyFilters}
                initialFilters={filters}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        position: 'relative',
    },
    filterButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    filterBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
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
