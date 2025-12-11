import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, SafeAreaView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Movie, groupMoviesByCinema, filterMovies, MovieFilters } from '../Services';
import { MovieCard } from '../components/Movie';
import { FilterModal } from '../components/FilterModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMovies } from '../store/moviesSlice';

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const { movies, loading, error } = useAppSelector((state) => state.movies);
    
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<MovieFilters>({});
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (!hasLoadedRef.current && movies.length === 0) {
            dispatch(fetchMovies());
            hasLoadedRef.current = true;
        }
    }, [dispatch, movies.length]);

    const onRefresh = useCallback(async () => {
        setIsManualRefresh(true);
        await dispatch(fetchMovies()).unwrap().catch(() => {});
        // Random delay between 500-2500ms for better perceived value
        const randomDelay = Math.floor(Math.random() * 2000) + 500;
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        setIsManualRefresh(false);
    }, [dispatch]);

    // Memoize filtered movies to avoid recalculation on every render
    const filteredMovies = useMemo(() => {
        const combinedFilters = { ...filters, searchText };
        if (Object.keys(combinedFilters).filter(key => combinedFilters[key as keyof MovieFilters]).length === 0) {
            return movies;
        }
        return filterMovies(movies, combinedFilters);
    }, [movies, filters, searchText]);

    // Memoize grouped movies for SectionList
    const groupedMovies = useMemo(() => {
        if (filteredMovies.length === 0) return [];
        
        const grouped = groupMoviesByCinema(filteredMovies);
        return grouped.map(group => ({
            title: group.cinemaName,
            cinemaId: group.cinemaId,
            data: group.movies
        }));
    }, [filteredMovies]);

    // Memoize active filter count (excluding search text)
    const activeFilterCount = useMemo(() => {
        try {
            const count = Object.entries(filters).filter(([key, value]) => {
                if (key === 'searchText') return false;
                if (value === undefined || value === null || value === '') return false;
                // For numeric values, check if > 0
                if (typeof value === 'number') return value > 0;
                return true;
            }).length;
            return Number(count) || 0;
        } catch (e) {
            return 0;
        }
    }, [filters]);

    const applyFilters = useCallback((newFilters: MovieFilters) => {
        setFilters(newFilters);
        setFilterModalVisible(false);
    }, []);

    const handleMoviePress = useCallback((movie: Movie) => {
        router.push({
            pathname: '/movie-detail' as any,
            params: {
                movie: JSON.stringify(movie)
            }
        });
    }, []);

    // Memoize keyExtractor
    const keyExtractor = useCallback((item: Movie, index: number) => {
        return `${item._id}-${index}`;
    }, []);

    // Memoize renderItem
    const renderItem = useCallback(({ item }: { item: Movie }) => (
        <MovieCard 
            movie={item} 
            onPress={handleMoviePress}
        />
    ), [handleMoviePress]);

    // Memoize renderSectionHeader
    const renderSectionHeader = useCallback(({ section }: any) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.movieCount}>
                {section.data.length} {section.data.length === 1 ? 'movie' : 'movies'}
            </Text>
        </View>
    ), []);

    if (loading || isManualRefresh) {
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
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search movies, actors, directors..."
                    placeholderTextColor="#999"
                    clearButtonMode="while-editing"
                />
            </View>
            
            <SectionList
                sections={groupedMovies}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={5}
                onScroll={(e) => {
                    // Trigger refresh when scrolled to top and pulled down
                    if (e.nativeEvent.contentOffset.y < -100 && !isManualRefresh && !loading) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        onRefresh();
                    }
                }}
                scrollEventThrottle={16}
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
        backgroundColor: '#383d40',
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
        color: '#f1f1f1ff',
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
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
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
