import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    Animated,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DraggableFlatList, { ScaleDecorator, RenderItemParams, OpacityDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable-item';
import { Movie } from '../Services';
import { MovieCard } from '../components/Movie';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadFavoritesFromStorage, removeFavorite, reorderFavorites } from '../store/favoritesSlice';

export default function FavoritesScreen() {
    const dispatch = useAppDispatch();
    const { favorites, loading } = useAppSelector((state) => state.favorites);
    
    const [localFavorites, setLocalFavorites] = useState<Movie[]>([]);
    const [originalFavorites, setOriginalFavorites] = useState<Movie[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    const itemRefs = useRef(new Map());
    const hasLoadedRef = useRef(false);
    const scrollOffsetRef = useRef(0);
    const isRefreshingRef = useRef(false);
    const fadeAnims = useRef(new Map<string, Animated.Value>()).current;

    // Load favorites only once on mount
    useEffect(() => {
        if (!hasLoadedRef.current) {
            dispatch(loadFavoritesFromStorage());
            hasLoadedRef.current = true;
        }
    }, [dispatch]);

    // Reset edit mode when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setEditMode(false);
            setHasChanges(false);
        }, [])
    );

    const onRefresh = useCallback(async () => {
        if (editMode) return; // Don't refresh during edit mode
        setIsManualRefresh(true);
        try {
            await dispatch(loadFavoritesFromStorage());
            // Random delay between 500-1000ms for favorites (faster than other screens)
            const randomDelay = Math.floor(Math.random() * 500) + 500;
            await new Promise(resolve => setTimeout(resolve, randomDelay));
        } finally {
            setIsManualRefresh(false);
            isRefreshingRef.current = false;
        }
    }, [dispatch, editMode]);

    useEffect(() => {
        if (!isManualRefresh) {
            setLocalFavorites(favorites);
            setOriginalFavorites(favorites);
            // Initialize animations for new items
            favorites.forEach(movie => {
                if (!fadeAnims.has(movie._id)) {
                    fadeAnims.set(movie._id, new Animated.Value(1));
                }
            });
        }
    }, [favorites, isManualRefresh, fadeAnims]);

    const handleMoviePress = useCallback((movie: Movie) => {
        if (editMode) return; // Disable navigation in edit mode
        
        router.push({
            pathname: '/movie-detail' as any,
            params: {
                movie: JSON.stringify(movie)
            }
        });
    }, [editMode]);

    const handleRemove = useCallback(async (movieId: string) => {
        Alert.alert(
            'Remove from Favorites',
            'Are you sure you want to remove this movie from your favorites?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        // Close the swipeable item quickly
                        const ref = itemRefs.current.get(movieId);
                        if (ref) {
                            ref.close({ duration: 150 });
                        }
                    },
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        // Animate out before removing
                        const fadeAnim = fadeAnims.get(movieId);
                        if (fadeAnim) {
                            Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: 250,
                                useNativeDriver: true,
                            }).start(() => {
                                dispatch(removeFavorite(movieId));
                                const updated = localFavorites.filter(m => m._id !== movieId);
                                setLocalFavorites(updated);
                                setOriginalFavorites(updated);
                                fadeAnims.delete(movieId);
                            });
                        } else {
                            dispatch(removeFavorite(movieId));
                            const updated = localFavorites.filter(m => m._id !== movieId);
                            setLocalFavorites(updated);
                            setOriginalFavorites(updated);
                        }
                    },
                },
            ]
        );
    }, [dispatch, localFavorites]);

    const handleDragEnd = useCallback(({ data }: { data: Movie[] }) => {
        setLocalFavorites(data);
        
        // Check if order changed
        const orderChanged = data.some((movie, index) => movie._id !== originalFavorites[index]?._id);
        setHasChanges(orderChanged);
    }, [originalFavorites]);

    const handleConfirm = useCallback(() => {
        dispatch(reorderFavorites(localFavorites));
        setOriginalFavorites(localFavorites);
        setEditMode(false);
        setHasChanges(false);
    }, [dispatch, localFavorites]);

    const handleCancel = useCallback(() => {
        if (hasChanges) {
            Alert.alert(
                'Discard Changes',
                'Are you sure you want to discard your changes?',
                [
                    {
                        text: 'Keep Editing',
                        style: 'cancel',
                    },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            setLocalFavorites(originalFavorites);
                            setEditMode(false);
                            setHasChanges(false);
                        },
                    },
                ]
            );
        } else {
            setEditMode(false);
            setHasChanges(false);
        }
    }, [hasChanges, originalFavorites]);

    const renderUnderlayLeft = useCallback(() => (
        <View style={styles.underlayContainer}>
            <Ionicons name="trash-outline" size={36} color="white" />
        </View>
    ), []);

    const renderMovieItem = ({ item, drag, isActive }: RenderItemParams<Movie>) => {
        const swipeHapticFiredRef = useRef(false);
        
        const handleSwipe = () => {
            handleRemove(item._id);
            // Reset after a delay
            setTimeout(() => {
                swipeHapticFiredRef.current = false;
            }, 300);
        };

        return (
            <OpacityDecorator activeOpacity={0.8}>
                <Swipeable
                    key={item._id}
                    ref={(ref: any) => {
                        if (ref) {
                            itemRefs.current.set(item._id, ref);
                        } else {
                            itemRefs.current.delete(item._id);
                        }
                    }}
                    item={item._id}
                    renderUnderlayLeft={renderUnderlayLeft}
                    snapPointsLeft={[120]}
                    activationThreshold={15}
                    swipeEnabled={!editMode}
                    onChange={({ openDirection, snapPoint }) => {
                        if (openDirection === 'left' && snapPoint === 120 && !swipeHapticFiredRef.current) {
                            swipeHapticFiredRef.current = true;
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            handleSwipe();
                        }
                    }}
                >
                <Animated.View style={[
                    styles.movieContainer,
                    {
                        opacity: fadeAnims.get(item._id) || 1,
                        transform: [
                            {
                                scale: fadeAnims.get(item._id)?.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }) || 1,
                            },
                        ],
                    },
                ]}>
                    <TouchableOpacity
                        style={styles.movieCardWrapper}
                        onPress={() => !editMode && handleMoviePress(item)}
                        onPressIn={editMode ? () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); drag(); } : undefined}
                        onLongPress={() => {
                            if (!editMode) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                setEditMode(true);
                            }
                        }}
                        delayLongPress={500}
                        delayPressIn={0}
                        delayPressOut={0}
                        disabled={isActive || isManualRefresh}
                        activeOpacity={editMode ? 0.8 : 0.7}
                    >
                        <MovieCard 
                            movie={item}
                            onPress={() => {}}
                            disableTouch={true}
                        />
                    </TouchableOpacity>
                    
                    
                    {editMode && (
                        <View style={styles.dragHandle}>
                            <Text style={styles.dragHandleText}>☰</Text>
                        </View>
                    )}
                </Animated.View>
            </Swipeable>
        </OpacityDecorator>
        );
    };

    if (loading || isManualRefresh) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading favorites...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Favorites</Text>
                    <Text style={styles.subtitle}>
                        {localFavorites.length} {localFavorites.length === 1 ? 'movie' : 'movies'}
                    </Text>
                    {editMode && (
                        <Text style={styles.editModeText}>Drag to reorder</Text>
                    )}
                </View>

                {localFavorites.length === 0 ? (
                    <ScrollView
                        contentContainerStyle={{ flex: 1 }}
                        onScroll={(e) => {
                            // Trigger refresh when scrolled to top and pulled down
                            if (e.nativeEvent.contentOffset.y < -100 && !isManualRefresh && !loading && !editMode) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                onRefresh();
                            }
                        }}
                        scrollEventThrottle={16}
                    >
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>💔</Text>
                            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                            <Text style={styles.emptyText}>
                                Add movies to your favorites by tapping the heart icon on movie details
                            </Text>
                        </View>
                    </ScrollView>
                ) : (
                    <>
                        <DraggableFlatList
                            data={localFavorites}
                            keyExtractor={(item) => item._id}
                            renderItem={renderMovieItem}
                            onDragEnd={handleDragEnd}
                            contentContainerStyle={styles.listContent}
                            activationDistance={10}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={5}
                            windowSize={3}
                            onScrollOffsetChange={(offset) => {
                                scrollOffsetRef.current = offset;
                                // Only trigger refresh when pulled down from top
                                if (offset < -100 && !isRefreshingRef.current && !isManualRefresh && !loading && !editMode) {
                                    isRefreshingRef.current = true;
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    onRefresh();
                                }
                            }}
                        />
                        
                        {editMode && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.confirmButton,
                                        !hasChanges && styles.confirmButtonDisabled
                                    ]}
                                    onPress={handleConfirm}
                                    disabled={!hasChanges}
                                >
                                    <Text style={[
                                        styles.confirmButtonText,
                                        !hasChanges && styles.confirmButtonTextDisabled
                                    ]}>
                                        Confirm
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
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
    editModeText: {
        marginTop: 8,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    movieContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    movieContainerActive: {
        opacity: 0.8,
    },
    movieCardWrapper: {
        flex: 1,
    },
    underlayContainer: {
        flex: 1,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 30,
        marginBottom: 12,
        borderRadius: 12,
    },
    dragHandle: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8,
    },
    dragHandleText: {
        color: '#666',
        fontSize: 32,
        lineHeight: 32,
    },
    actionButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#ccc',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    confirmButtonTextDisabled: {
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
});
