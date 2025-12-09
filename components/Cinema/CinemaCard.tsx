import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Theater } from '../../Services/types';

interface CinemaCardProps {
    cinema: Theater;
    onPress: (cinema: Theater) => void;
}

export default function CinemaCard({ cinema, onPress }: CinemaCardProps) {
    const handleWebsitePress = (e: any) => {
        e.stopPropagation();
        if (cinema.website) {
            // Add https:// if missing
            let url = cinema.website;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            Linking.openURL(url);
        }
    };

    return (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => onPress(cinema)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.name}>{cinema.name}</Text>
                <Text style={styles.city}>{cinema.city}</Text>
            </View>
            
            {cinema.address && (
                <Text style={styles.address}>{cinema.address}</Text>
            )}
            
            {cinema.website && (
                <TouchableOpacity 
                    style={styles.websiteButton}
                    onPress={handleWebsitePress}
                >
                    <Text style={styles.websiteText}>🌐 Visit Website</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    city: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    websiteButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    websiteText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});
