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
            // Filter movies that are showing at this cinema
            const cinemaMovies = allMovies.filter(movie =>
                movie.showtimes.some(showtime => showtime.cinema.id === cinema.id)
            );
            setMovies(cinemaMovies);
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
            Linking.openURL(cinema.google_map);
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
                            <Text style={styles.contactLabel}>📍 Address</Text>
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
                            <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
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
                    movies.map((movie) => (
                        <MovieCard
                            key={movie._id}
                            movie={movie}
                            onPress={handleMoviePress}
                        />
                    ))
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
    contactLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
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
        alignItems: 'center',
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
});
