import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Movie } from '../../Services';

interface MovieCardProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress(movie)}>
            <Image
                source={{ uri: movie.poster }}
                style={styles.poster}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
                <Text style={styles.year}>{movie.year}</Text>
                <View style={styles.genres}>
                    {movie.genres.slice(0, 2).map((genre, index) => (
                        <Text key={index} style={styles.genre}>
                            {genre.NameEN}
                        </Text>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    poster: {
        width: 100,
        height: 150,
        backgroundColor: '#e0e0e0',
    },
    info: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    year: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    genres: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    genre: {
        fontSize: 12,
        color: '#007AFF',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
});
