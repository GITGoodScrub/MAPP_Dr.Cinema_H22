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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import DraggableFlatList, { ScaleDecorator, RenderItemParams, OpacityDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable-item';
import { Movie, getFavorites, removeFavorite, reorderFavorites } from '../Services';
import { MovieCard } from '../components/Movie';

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [originalFavorites, setOriginalFavorites] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const itemRefs = useRef(new Map());
    const [swipingItemId, setSwipingItemId] = useState<string | null>(null);

    // Reload favorites when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
            setEditMode(false);
            setHasChanges(false);
        }, [])
    );

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const data = await getFavorites();
            setFavorites(data);
            setOriginalFavorites(data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMoviePress = (movie: Movie) => {
        if (editMode) return; // Disable navigation in edit mode
        
        router.push({
            pathname: '/movie-detail' as any,
            params: {
                movie: JSON.stringify(movie)
            }
        });
    };

    const handleLongPress = () => {
        if (!editMode) {
            setEditMode(true);
        }
    };

    const handleRemove = async (movieId: string) => {
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
                    onPress: async () => {
                        try {
                            await removeFavorite(movieId);
                            const updated = favorites.filter(m => m._id !== movieId);
                            setFavorites(updated);
                            setOriginalFavorites(updated);
                        } catch (error) {
                            console.error('Error removing favorite:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleDragEnd = ({ data }: { data: Movie[] }) => {
        setFavorites(data);
        
        // Check if order changed
        const orderChanged = data.some((movie, index) => movie._id !== originalFavorites[index]?._id);
        setHasChanges(orderChanged);
    };

    const handleConfirm = async () => {
        try {
            await reorderFavorites(favorites);
            setOriginalFavorites(favorites);
            setEditMode(false);
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving order:', error);
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    const handleCancel = () => {
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
                            setFavorites(originalFavorites);
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
    };

    const renderUnderlayLeft = () => (
        <View style={styles.underlayContainer}>
            <Ionicons name="trash-outline" size={36} color="white" />
        </View>
    );

    const renderMovieItem = ({ item, drag, isActive }: RenderItemParams<Movie>) => {
        const handleSwipe = () => {
            setTimeout(() => {
                handleRemove(item._id);
            }, 100);
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
                    onChange={({ openDirection }) => {
                        if (openDirection === 'left') {
                            handleSwipe();
                        }
                    }}
                >
                <View style={styles.movieContainer}>
                    <TouchableOpacity
                        style={styles.movieCardWrapper}
                        onPress={() => !editMode && handleMoviePress(item)}
                        onPressIn={editMode ? drag : undefined}
                        onLongPress={() => {
                            if (!editMode) {
                                setEditMode(true);
                            }
                        }}
                        delayLongPress={500}
                        disabled={isActive}
                        activeOpacity={editMode ? 0.8 : 0.7}
                    >
                        <View pointerEvents="none">
                            <MovieCard 
                                movie={item}
                                onPress={() => {}}
                            />
                        </View>
                    </TouchableOpacity>
                    
                    
                    {editMode && (
                        <View style={styles.dragHandle}>
                            <Text style={styles.dragHandleText}>☰</Text>
                        </View>
                    )}
                </View>
            </Swipeable>
        </OpacityDecorator>
        );
    };

    if (loading) {
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
                        {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'}
                    </Text>
                    {editMode && (
                        <Text style={styles.editModeText}>Drag to reorder</Text>
                    )}
                </View>

                {favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>💔</Text>
                        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                        <Text style={styles.emptyText}>
                            Add movies to your favorites by tapping the heart icon on movie details
                        </Text>
                    </View>
                ) : (
                    <>
                        <DraggableFlatList
                            data={favorites}
                            keyExtractor={(item) => item._id}
                            renderItem={renderMovieItem}
                            onDragEnd={handleDragEnd}
                            contentContainerStyle={styles.listContent}
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
