import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { MovieFilters } from '../../Services/formatters';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: MovieFilters) => void;
    initialFilters: MovieFilters;
}

export default function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
    const [searchText, setSearchText] = useState(initialFilters.searchText || '');
    const [minImdbRating, setMinImdbRating] = useState(initialFilters.minImdbRating?.toString() || '');
    const [minRottenRating, setMinRottenRating] = useState(initialFilters.minRottenRating?.toString() || '');
    const [showAfter, setShowAfter] = useState(initialFilters.showAfter || '');
    const [showBefore, setShowBefore] = useState(initialFilters.showBefore || '');
    const [actor, setActor] = useState(initialFilters.actor || '');
    const [director, setDirector] = useState(initialFilters.director || '');
    const [pgRating, setPgRating] = useState(initialFilters.pgRating || '');

    const pgRatings = ['L', '7', '9', '12', '14', '16', '18'];

    const handleApply = () => {
        const filters: MovieFilters = {
            searchText: searchText.trim() || undefined,
            minImdbRating: minImdbRating ? parseFloat(minImdbRating) : undefined,
            minRottenRating: minRottenRating ? parseFloat(minRottenRating) : undefined,
            showAfter: showAfter.trim() || undefined,
            showBefore: showBefore.trim() || undefined,
            actor: actor.trim() || undefined,
            director: director.trim() || undefined,
            pgRating: pgRating || undefined,
        };
        onApply(filters);
    };

    const handleClear = () => {
        setSearchText('');
        setMinImdbRating('');
        setMinRottenRating('');
        setShowAfter('');
        setShowBefore('');
        setActor('');
        setDirector('');
        setPgRating('');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView}>
                        {/* Title Search */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Movie Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Search by title..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        {/* IMDB Rating */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Minimum IMDB Rating</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 7.0"
                                keyboardType="decimal-pad"
                                value={minImdbRating}
                                onChangeText={setMinImdbRating}
                            />
                        </View>

                        {/* Rotten Tomatoes Rating */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Minimum Rotten Tomatoes Rating</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 70"
                                keyboardType="decimal-pad"
                                value={minRottenRating}
                                onChangeText={setMinRottenRating}
                            />
                        </View>

                        {/* Showtime Range */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Showtime After</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="HH:MM (e.g., 18:00)"
                                value={showAfter}
                                onChangeText={setShowAfter}
                            />
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Showtime Before</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="HH:MM (e.g., 22:00)"
                                value={showBefore}
                                onChangeText={setShowBefore}
                            />
                        </View>

                        {/* Actor */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Actor Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Search by actor..."
                                value={actor}
                                onChangeText={setActor}
                            />
                        </View>

                        {/* Director */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Director Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Search by director..."
                                value={director}
                                onChangeText={setDirector}
                            />
                        </View>

                        {/* PG Rating */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Age Rating</Text>
                            <View style={styles.pgRatingContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.pgButton,
                                        !pgRating && styles.pgButtonActive
                                    ]}
                                    onPress={() => setPgRating('')}
                                >
                                    <Text style={[
                                        styles.pgButtonText,
                                        !pgRating && styles.pgButtonTextActive
                                    ]}>All</Text>
                                </TouchableOpacity>
                                {pgRatings.map((rating) => (
                                    <TouchableOpacity
                                        key={rating}
                                        style={[
                                            styles.pgButton,
                                            pgRating === rating && styles.pgButtonActive
                                        ]}
                                        onPress={() => setPgRating(rating)}
                                    >
                                        <Text style={[
                                            styles.pgButtonText,
                                            pgRating === rating && styles.pgButtonTextActive
                                        ]}>{rating}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.clearButton]}
                            onPress={handleClear}
                        >
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.applyButton]}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
    },
    scrollView: {
        padding: 20,
    },
    filterSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    pgRatingContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pgButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    pgButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    pgButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    pgButtonTextActive: {
        color: '#fff',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    applyButton: {
        backgroundColor: '#007AFF',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
