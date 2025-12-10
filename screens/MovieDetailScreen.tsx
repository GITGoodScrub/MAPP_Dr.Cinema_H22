import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Movie } from '../Services';
import { formatDuration } from '../Services/formatters';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addFavorite, removeFavorite } from '../store/favoritesSlice';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const favorites = useAppSelector((state) => state.favorites.favorites);
    
    // Parse the movie object from params
    const movie: Movie = params.movie ? JSON.parse(params.movie as string) : null;
    
    const isFav = movie ? favorites.some(f => f._id === movie._id) : false;

    const toggleFavorite = () => {
        if (!movie) return;
        
        if (isFav) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch(removeFavorite(movie._id));
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch(addFavorite(movie));
        }
    };

    if (!movie) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Movie not found</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleTrailerPress = (trailer: any) => {
        // Extract URL from trailer object structure
        let url = null;
        
        if (typeof trailer === 'string') {
            url = trailer;
        } else if (trailer.results && trailer.results.length > 0) {
            url = trailer.results[0].url;
        } else if (trailer.url) {
            url = trailer.url;
        }
        
        if (url && typeof url === 'string') {
            Linking.openURL(url);
        } else {
            console.log('No valid trailer URL found:', trailer);
        }
    };

    const handleTicketPress = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Poster Section */}
            <View style={styles.posterContainer}>
                <Image
                    source={{ uri: movie.poster }}
                    style={styles.poster}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={toggleFavorite}
                >
                    <Text style={styles.favoriteIcon}>
                        {isFav ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
                <View style={styles.posterOverlay}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <Text style={styles.year}>{movie.year}</Text>
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                {/* Genres */}
                <View style={styles.genresContainer}>
                    {movie.genres.map((genre, index) => (
                        <View key={index} style={styles.genreBadge}>
                            <Text style={styles.genreText}>{genre.Name}</Text>
                        </View>
                    ))}
                </View>

                {/* Duration and Certificate */}
                <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>
                        {formatDuration(movie.durationMinutes)}
                    </Text>
                    {movie.certificate && (
                        <View style={[styles.certificateBadge, { backgroundColor: movie.certificate.color || '#666' }]}>
                            <Text style={styles.certificateText}>{movie.certificate.is}</Text>
                        </View>
                    )}
                </View>

                {/* Ratings */}
                {movie.ratings && (
                    <View style={styles.ratingsContainer}>
                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingLabel}>IMDB</Text>
                            <Text style={styles.ratingValue}>
                                {movie.ratings.imdb || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingLabel}>Rotten Tomatoes</Text>
                            <Text style={styles.ratingValue}>
                                {movie.ratings.rotten_critics || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingLabel}>Audience</Text>
                            <Text style={styles.ratingValue}>
                                {movie.ratings.rotten_audience || 'N/A'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Plot */}
                {movie.plot && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Plot</Text>
                        <Text style={styles.plotText}>{movie.plot}</Text>
                    </View>
                )}

                {/* Cast & Crew */}
                {movie.directors_abridged && movie.directors_abridged.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Director{movie.directors_abridged.length > 1 ? 's' : ''}</Text>
                        <Text style={styles.bodyText}>
                            {movie.directors_abridged.map(d => d.name).join(', ')}
                        </Text>
                    </View>
                )}

                {movie.actors_abridged && movie.actors_abridged.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cast</Text>
                        <Text style={styles.bodyText}>
                            {movie.actors_abridged.map(a => a.name).join(', ')}
                        </Text>
                    </View>
                )}

                {/* Trailers */}
                {movie.trailers && movie.trailers.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trailers</Text>
                        {movie.trailers.map((trailer: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.trailerButton}
                                onPress={() => handleTrailerPress(trailer)}
                            >
                                <Text style={styles.trailerButtonText}>
                                    ▶ Watch Trailer {movie.trailers.length > 1 ? `${index + 1}` : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Showtimes */}
                {movie.showtimes && movie.showtimes.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Showtimes</Text>
                        {movie.showtimes.map((showtime, cinemaIndex) => (
                            <View key={cinemaIndex} style={styles.showtimeCard}>
                                <Text style={styles.cinemaName}>{showtime.cinema_name}</Text>
                                <View style={styles.timesContainer}>
                                    {showtime.schedule.map((slot, slotIndex) => (
                                        <TouchableOpacity
                                            key={slotIndex}
                                            style={styles.timeSlot}
                                            onPress={() => slot.purchase_url && handleTicketPress(slot.purchase_url)}
                                        >
                                            <Text style={styles.timeText}>{slot.time}</Text>
                                            {slot.info && (
                                                <Text style={styles.infoText}>{slot.info}</Text>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    posterContainer: {
        width: width,
        height: width * 1.5,
        position: 'relative',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    favoriteIcon: {
        fontSize: 32,
    },
    posterOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    year: {
        fontSize: 16,
        color: '#ccc',
    },
    infoSection: {
        padding: 16,
    },
    genresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    genreBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    genreText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    metaText: {
        fontSize: 14,
        color: '#666',
        marginRight: 12,
    },
    certificateBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    certificateText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ratingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ratingCard: {
        alignItems: 'center',
    },
    ratingLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    plotText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    bodyText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    trailerButton: {
        backgroundColor: '#FF0000',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    trailerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    showtimeCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cinemaName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeSlot: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    timeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    infoText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 2,
    },
});
