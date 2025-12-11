import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Movie } from '../Services';
import { MovieCard } from '../components/Movie';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUpcomingMovies } from '../store/upcomingMoviesSlice';
import { selectSortedUpcomingMovies, selectUpcomingMoviesLoading, selectUpcomingMoviesError } from '../store/selectors';

export default function UpcomingMoviesScreen() {
    const dispatch = useAppDispatch();
    const sortedMovies = useAppSelector(selectSortedUpcomingMovies);
    const loading = useAppSelector(selectUpcomingMoviesLoading);
    const error = useAppSelector(selectUpcomingMoviesError);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (!hasLoadedRef.current && sortedMovies.length === 0) {
            dispatch(fetchUpcomingMovies());
            hasLoadedRef.current = true;
        }
    }, [dispatch, sortedMovies.length]);

    const onRefresh = useCallback(async () => {
        setIsManualRefresh(true);
        await dispatch(fetchUpcomingMovies()).unwrap().catch(() => {});
        // Random delay between 500-2500ms for better perceived value
        const randomDelay = Math.floor(Math.random() * 2000) + 500;
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        setIsManualRefresh(false);
    }, [dispatch]);

    const handleMoviePress = useCallback((movie: Movie) => {
        router.push({
            pathname: '/movie-detail' as any,
            params: {
                movie: JSON.stringify(movie)
            }
        });
    }, []);

    const keyExtractor = useCallback((item: Movie) => item._id, []);

    const renderMovieItem = useCallback(({ item }: { item: Movie }) => {
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
    }, [handleMoviePress]);

    if (loading || isManualRefresh) {
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
                    {sortedMovies.length} {sortedMovies.length === 1 ? 'movie' : 'movies'} coming soon
                </Text>
            </View>

            <FlatList
                data={sortedMovies}
                keyExtractor={keyExtractor}
                renderItem={renderMovieItem}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={50}
                initialNumToRender={8}
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
        backgroundColor: '#383d40',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f1f1f1ff',
    },
    subtitle: {
        fontSize: 14,
        color: '#bbb8b8ff',
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
