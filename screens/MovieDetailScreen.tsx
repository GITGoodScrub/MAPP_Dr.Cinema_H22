import React, { useState, useRef } from 'react';
import {
    Dimensions,
    Image,
    Linking as RNLinking,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import Review from '@/components/Movie/review';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableTabWrapper from '../components/SwipeableTabWrapper';
import { Movie } from '../Services';
import { formatDuration } from '../Services/formatters';
import { addFavorite, removeFavorite } from '../store/favoritesSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const { width } = Dimensions.get('window');

// Function to extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
};

// Function to get country flag emoji from country name
const getCountryFlag = (country: string): string => {
    const countryFlags: { [key: string]: string } = {
        'USA': '🇺🇸', 'United States': '🇺🇸', 'US': '🇺🇸',
        'UK': '🇬🇧', 'United Kingdom': '🇬🇧', 'England': '🇬🇧',
        'Canada': '🇨🇦', 'France': '🇫🇷', 'Germany': '🇩🇪',
        'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Japan': '🇯🇵',
        'China': '🇨🇳', 'South Korea': '🇰🇷', 'Korea': '🇰🇷',
        'Australia': '🇦🇺', 'Brazil': '🇧🇷', 'Mexico': '🇲🇽',
        'India': '🇮🇳', 'Russia': '🇷🇺', 'Sweden': '🇸🇪',
        'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮',
        'Iceland': '🇮🇸', 'Ireland': '🇮🇪', 'Netherlands': '🇳🇱',
        'Belgium': '🇧🇪', 'Switzerland': '🇨🇭', 'Austria': '🇦🇹',
        'Poland': '🇵🇱', 'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺',
        'Portugal': '🇵🇹', 'Greece': '🇬🇷', 'Turkey': '🇹🇷',
        'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴',
        'New Zealand': '🇳🇿', 'South Africa': '🇿🇦', 'Israel': '🇮🇱',
        'Thailand': '🇹🇭', 'Hong Kong': '🇭🇰', 'Taiwan': '🇹🇼',
        'Singapore': '🇸🇬', 'Malaysia': '🇲🇾', 'Indonesia': '🇮🇩',
        'Philippines': '🇵🇭', 'Vietnam': '🇻🇳', 'Egypt': '🇪🇬',
    };
    
    // Check for exact match first
    if (countryFlags[country]) {
        return countryFlags[country];
    }
    
    // Check if country string contains multiple countries (e.g., "USA, UK")
    const countries = country.split(',').map(c => c.trim());
    const flags = countries.map(c => countryFlags[c]).filter(Boolean);
    if (flags.length > 0) {
        return flags.join(' ');
    }
    
    // Default to globe emoji if country not found
    return '🌍';
};

export default function MovieDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const favorites = useAppSelector((state) => state.favorites.favorites);

    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [currentYouTubeId, setCurrentYouTubeId] = useState<string | null>(null);

    // sharing movies here
    const handleShareMovie = async () => {
        if (!movie) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        //Deep link created for the movie
        const url = Linking.createURL('/movie-detail', {
            queryParams: { movieId: movie._id},
        });
        
        try {
            await Share.share({
                message: `${movie.title} (${movie.year}) \n\n${url}`,
            });
        } catch (error) {
            console.log('Error sharing the movie', error);
        }
    };
    
    // Parse the movie object from params
    const movie: Movie = params.movie ? JSON.parse(params.movie as string) : null;
    const cinemaId = params.cinemaId ? parseInt(params.cinemaId as string) : null;
    
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

    const handleTrailerPress = async (trailer: any) => {
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
            // Extract YouTube ID
            const youtubeId = extractYouTubeId(url);
            
            if (youtubeId) {
                // Open in-app YouTube player
                setCurrentYouTubeId(youtubeId);
                setVideoModalVisible(true);
            } else {
                // Fallback: If not a YouTube URL, could show an error or handle differently
                console.log('Not a valid YouTube URL:', url);
            }
        } else {
            console.log('No valid trailer URL found:', trailer);
        }
    };

    const closeVideoModal = () => {
        setVideoModalVisible(false);
        setCurrentYouTubeId(null);
    };

    const handleTicketPress = (url: string) => {
        RNLinking.openURL(url);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SwipeableTabWrapper
                canSwipeRight={true}
                rightRoute="back"
            >
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
                    <Ionicons 
                        name={isFav ? 'heart' : 'heart-outline'} 
                        size={32} 
                        color={isFav ? '#FF3B30' : '#000'} 
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.shareButtonCircular}
                    onPress={handleShareMovie}
                >
                    <Ionicons 
                        name="share-outline" 
                        size={28} 
                        color="#000" 
                    />
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
                            <View style={styles.ratingValueContainer}>
                                <Ionicons name="star" size={20} color="#F5C518" />
                                <Text style={styles.ratingValue}>
                                    {movie.ratings.imdb && !isNaN(Number(movie.ratings.imdb)) ? movie.ratings.imdb : '--'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingLabel}>Rotten Tomatoes</Text>
                            <View style={styles.ratingValueContainer}>
                                <Text style={styles.tomatoIcon}>🍅</Text>
                                <Text style={styles.ratingValue}>
                                    {movie.ratings.rotten_critics && !isNaN(Number(movie.ratings.rotten_critics)) ? movie.ratings.rotten_critics : '--'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingLabel}>Audience</Text>
                            <View style={styles.ratingValueContainer}>
                                <Text style={styles.tomatoIcon}>🍿</Text>
                                <Text style={styles.ratingValue}>
                                    {movie.ratings.rotten_audience && !isNaN(Number(movie.ratings.rotten_audience)) ? movie.ratings.rotten_audience : '--'}
                                </Text>
                            </View>
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

                {/* Your review */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your review</Text>
                    <Review movieId={movie._id} />
                </View>

                {/* Showtimes */}
                {movie.showtimes && movie.showtimes.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Showtimes</Text>
                        {movie.showtimes
                            .filter(showtime => !cinemaId || showtime.cinema.id === cinemaId)
                            .map((showtime, cinemaIndex) => (
                            <View key={cinemaIndex} style={styles.showtimeCard}>
                                <Text style={styles.cinemaName}>{showtime.cinema.name}</Text>
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

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailsHeader}>
                        <View style={styles.detailsAccent} />
                        <Text style={styles.detailsTitle}>Details</Text>
                    </View>
                    
                    {movie.omdb && movie.omdb[0]?.Released && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Release date</Text>
                            <Text style={styles.detailValue}>{movie.omdb[0].Released}</Text>
                        </View>
                    )}
                    
                    {movie.durationMinutes && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Runtime</Text>
                            <Text style={styles.detailValue}>
                                {formatDuration(movie.durationMinutes)} ({movie.durationMinutes}m)
                            </Text>
                        </View>
                    )}
                    
                    {movie.omdb && movie.omdb[0]?.Country && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Countries of origin</Text>
                            <Text style={styles.detailValue}>{movie.omdb[0].Country}</Text>
                        </View>
                    )}
                    
                    {movie.omdb && movie.omdb[0]?.Language && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Language</Text>
                            <Text style={styles.detailValue}>{movie.omdb[0].Language}</Text>
                        </View>
                    )}
                    
                    {movie.alternativeTitles && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Also known as</Text>
                            <Text style={styles.detailValue}>{movie.alternativeTitles}</Text>
                        </View>
                    )}
                    
                    {movie.omdb && movie.omdb[0]?.Production && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Production companies</Text>
                            <Text style={styles.detailValue}>{movie.omdb[0].Production}</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
            </SwipeableTabWrapper>

            {/* Video Modal */}
            <Modal
                visible={videoModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={closeVideoModal}
            >
                <View style={styles.videoModalContainer}>
                    <View style={styles.videoModalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={closeVideoModal}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        
                        {currentYouTubeId && (
                            <YoutubePlayer
                                height={250}
                                play={true}
                                videoId={currentYouTubeId}
                                onChangeState={(state: string) => {
                                    if (state === 'ended') {
                                        // Optionally close modal when video ends
                                    }
                                }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
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
    shareButtonCircular: {
        position: 'absolute',
        top: 84,
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
        marginRight: 12,
    },
    certificateText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    countryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    flagEmoji: {
        fontSize: 18,
    },
    countryText: {
        fontSize: 14,
        color: '#666',
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
    ratingValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    tomatoIcon: {
        fontSize: 18,
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
    detailsSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 8,
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailsAccent: {
        width: 4,
        height: 28,
        backgroundColor: '#F5C518',
        marginRight: 12,
        borderRadius: 2,
    },
    detailsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        width: 140,
        flexShrink: 0,
    },
    detailValue: {
        fontSize: 14,
        color: '#007AFF',
        flex: 1,
        flexWrap: 'wrap',
    },
    videoModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoModalContent: {
        width: width - 40,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        paddingTop: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
