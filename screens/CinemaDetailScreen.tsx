import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableTabWrapper from '../components/SwipeableTabWrapper';
import { Theater, Movie, getMovies } from '../Services';
import { MovieCard } from '../components/Movie';

export default function CinemaDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    
    const cinema: Theater = params.cinema ? JSON.parse(params.cinema as string) : null;
    
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (cinema && !hasLoaded) {
            loadCinemaMovies();
        }
    }, [cinema, hasLoaded]);

    const loadCinemaMovies = async () => {
        if (hasLoaded) return;
        
        setLoading(true);
        try {
            const allMovies = await getMovies();
            
            // Filter and deduplicate movies showing at this cinema
            // Use title + year as the unique key since _id might not be reliable
            const movieMap = new Map<string, Movie>();
            
            allMovies.forEach(movie => {
                const hasShowtimeAtCinema = movie.showtimes.some(
                    showtime => showtime.cinema.id === cinema.id
                );
                
                if (hasShowtimeAtCinema) {
                    // Create a unique key from title and year
                    const uniqueKey = `${movie.title}-${movie.year}`;
                    
                    // Only add if we haven't seen this movie before
                    if (!movieMap.has(uniqueKey)) {
                        movieMap.set(uniqueKey, movie);
                    }
                }
            });
            
            setMovies(Array.from(movieMap.values()));
            setHasLoaded(true);
        } catch (err) {
            console.error('Error loading cinema movies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWebsitePress = () => {
        if (cinema.website) {
            let url = cinema.website;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            Linking.openURL(url);
        }
    };

    const handlePhonePress = () => {
        if (cinema.phone) {
            Linking.openURL(`tel:${cinema.phone}`);
        }
    };

    const handleMapPress = () => {
        if (cinema.google_map) {
            let mapUrl = cinema.google_map;
            
            // Check if it's an iframe embed code
            if (mapUrl.includes('<iframe')) {
                // Extract the src URL from the iframe
                const srcMatch = mapUrl.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    mapUrl = srcMatch[1];
                    // Decode HTML entities
                    mapUrl = mapUrl.replace(/&amp;/g, '&');
                }
            }
            
            // If it's still not a valid URL or is a relative path, create a Google Maps search URL
            if (!mapUrl.startsWith('http://') && !mapUrl.startsWith('https://')) {
                // Use cinema address or name for search
                const searchQuery = encodeURIComponent(cinema.address || cinema.name);
                mapUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
            }
            
            Linking.openURL(mapUrl);
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

    if (!cinema) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Cinema not found</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SwipeableTabWrapper
                canSwipeRight={true}
                rightRoute="back"
            >
                <ScrollView style={styles.container}>
            {/* Cinema Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.name}>{cinema.name}</Text>
                <Text style={styles.city}>{cinema.city}</Text>
                
                {cinema.description && (
                    <Text style={styles.description}>{cinema.description}</Text>
                )}

                {/* Contact Info */}
                <View style={styles.contactSection}>
                    {cinema.address && (
                        <View style={styles.contactItem}>
                            <View style={styles.contactLabelContainer}>
                                <Ionicons name="location-outline" size={18} color="#007AFF" />
                                <Text style={styles.contactLabel}>Address</Text>
                            </View>
                            <Text style={styles.contactText}>{cinema.address}</Text>
                        </View>
                    )}

                    {cinema.phone && (
                        <TouchableOpacity 
                            style={styles.contactItem}
                            onPress={handlePhonePress}
                        >
                            <Text style={styles.contactLabel}>📞 Phone</Text>
                            <Text style={[styles.contactText, styles.linkText]}>{cinema.phone}</Text>
                        </TouchableOpacity>
                    )}

                    {cinema.website && (
                        <TouchableOpacity 
                            style={styles.contactItem}
                            onPress={handleWebsitePress}
                        >
                            <Text style={styles.contactLabel}>🌐 Website</Text>
                            <Text style={[styles.contactText, styles.linkText]}>{cinema.website}</Text>
                        </TouchableOpacity>
                    )}

                    {cinema.google_map && (
                        <TouchableOpacity 
                            style={styles.mapButton}
                            onPress={handleMapPress}
                        >
                            <Ionicons name="location-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.mapButtonText}>Open in Maps</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Movies Section */}
            <View style={styles.moviesSection}>
                <Text style={styles.sectionTitle}>
                    Now Showing ({movies.length})
                </Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading movies...</Text>
                    </View>
                ) : movies.length > 0 ? (
                    movies.map((movie) => {
                        // Get showtimes for this cinema only
                        const cinemaShowtime = movie.showtimes.find(
                            st => st.cinema.id === cinema.id
                        );
                        
                        return (
                            <View key={movie._id} style={styles.movieCardWrapper}>
                                <MovieCard
                                    movie={movie}
                                    onPress={handleMoviePress}
                                />
                                {cinemaShowtime && cinemaShowtime.schedule && cinemaShowtime.schedule.length > 0 && (
                                    <View style={styles.showtimesContainer}>
                                        <View style={styles.timeSlotsContainer}>
                                            {cinemaShowtime.schedule.map((slot, idx) => (
                                                <View key={idx} style={styles.timeSlot}>
                                                    <Text style={styles.timeText}>{slot.time}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.noMoviesText}>No movies currently showing</Text>
                )}
            </View>
            </ScrollView>
            </SwipeableTabWrapper>
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
    infoSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    city: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 20,
    },
    contactSection: {
        gap: 12,
    },
    contactItem: {
        marginBottom: 8,
    },
    contactLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    contactLabel: {
        fontSize: 12,
        color: '#999',
    },
    contactText: {
        fontSize: 15,
        color: '#333',
    },
    linkText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    mapButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    moviesSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    noMoviesText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        padding: 32,
    },
    movieCardWrapper: {
        marginBottom: 16,
    },
    showtimesContainer: {
        backgroundColor: '#fff',
        padding: 12,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginTop: -8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeSlot: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    timeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
