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
import { Theater } from '../Services';
import { CinemaCard } from '../components/Cinema';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCinemas } from '../store/cinemasSlice';
import { selectSortedCinemas, selectCinemasLoading, selectCinemasError } from '../store/selectors';

export default function CinemasScreen() {
    const dispatch = useAppDispatch();
    const sortedCinemas = useAppSelector(selectSortedCinemas);
    const loading = useAppSelector(selectCinemasLoading);
    const error = useAppSelector(selectCinemasError);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (!hasLoadedRef.current && sortedCinemas.length === 0) {
            dispatch(fetchCinemas());
            hasLoadedRef.current = true;
        }
    }, [dispatch, sortedCinemas.length]);

    const onRefresh = useCallback(async () => {
        setIsManualRefresh(true);
        await dispatch(fetchCinemas()).unwrap().catch(() => {});
        // Random delay between 500-2500ms for better perceived value
        const randomDelay = Math.floor(Math.random() * 2000) + 500;
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        setIsManualRefresh(false);
    }, [dispatch]);

    const handleCinemaPress = useCallback((cinema: Theater) => {
        router.push({
            pathname: '/cinema-detail' as any,
            params: {
                cinema: JSON.stringify(cinema)
            }
        });
    }, []);

    const keyExtractor = useCallback((item: Theater) => item.id.toString(), []);

    const renderItem = useCallback(({ item }: { item: Theater }) => (
        <CinemaCard 
            cinema={item}
            onPress={handleCinemaPress}
        />
    ), [handleCinemaPress]);

    if (loading || isManualRefresh) {
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
                keyExtractor={keyExtractor}
                renderItem={renderItem}
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
});
