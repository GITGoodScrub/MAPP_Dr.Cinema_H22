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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RangeSlider from '../RangeSlider';
import Slider from '../Slider';
import * as Haptics from 'expo-haptics';
import { MovieFilters } from '../../Services/formatters';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: MovieFilters) => void;
    initialFilters: MovieFilters;
}

// Helper function to convert HH:MM to minutes since midnight
const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Helper function to convert minutes since midnight to HH:MM
const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export default function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
    const [minImdbRating, setMinImdbRating] = useState(initialFilters.minImdbRating || 0);
    const [minRottenRating, setMinRottenRating] = useState(initialFilters.minRottenRating || 0);
    // Time range in minutes (0 = 00:00, 1435 = 23:55)
    const [timeRangeStart, setTimeRangeStart] = useState(timeToMinutes(initialFilters.showAfter || '00:00'));
    const [timeRangeEnd, setTimeRangeEnd] = useState(timeToMinutes(initialFilters.showBefore || '23:55'));
    const [pgRating, setPgRating] = useState(initialFilters.pgRating || '');

    const pgRatings = ['L', '7', '9', '12', '14', '16', '18'];

    const handleApply = () => {
        const filters: MovieFilters = {
            minImdbRating: minImdbRating > 0 ? minImdbRating : undefined,
            minRottenRating: minRottenRating > 0 ? minRottenRating : undefined,
            showAfter: timeRangeStart > 0 ? minutesToTime(timeRangeStart) : undefined,
            showBefore: timeRangeEnd < 1435 ? minutesToTime(timeRangeEnd) : undefined,
            pgRating: pgRating || undefined,
        };
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onApply(filters);
    };

    const handleClear = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setMinImdbRating(0);
        setMinRottenRating(0);
        setTimeRangeStart(0);
        setTimeRangeEnd(1435);
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

                    <GestureHandlerRootView style={styles.gestureContainer}>
                        <ScrollView style={styles.scrollView}>
                        {/* IMDB Rating */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Minimum IMDB Rating</Text>
                            <View style={styles.ratingValueContainer}>
                                <Text style={styles.ratingValue}>
                                    {minImdbRating > 0 ? minImdbRating.toFixed(1) : 'Any'}
                                </Text>
                            </View>
                            <Slider
                                min={0}
                                max={10}
                                step={0.1}
                                value={minImdbRating}
                                onValueChange={setMinImdbRating}
                                useRatingColors={true}
                            />
                        </View>

                        {/* Rotten Tomatoes Rating */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Minimum Rotten Tomatoes Rating</Text>
                            <View style={styles.ratingValueContainer}>
                                <Text style={styles.ratingValue}>
                                    {minRottenRating > 0 ? minRottenRating.toFixed(0) : 'Any'}
                                </Text>
                            </View>
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={minRottenRating}
                                onValueChange={setMinRottenRating}
                                useRatingColors={true}
                            />
                        </View>

                        {/* Showtime Range */}
                        <View style={styles.filterSection}>
                            <Text style={styles.label}>Showtime Range</Text>
                            <View style={styles.timeRangeContainer}>
                                <Text style={styles.timeLabel}>{minutesToTime(timeRangeStart)}</Text>
                                <Text style={styles.timeLabel}>{minutesToTime(timeRangeEnd)}</Text>
                            </View>
                            
                            <RangeSlider
                                min={0}
                                max={1435}
                                step={5}
                                minValue={timeRangeStart}
                                maxValue={timeRangeEnd}
                                onValuesChange={(min, max) => {
                                    setTimeRangeStart(min);
                                    setTimeRangeEnd(max);
                                }}
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
                    </GestureHandlerRootView>

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
    gestureContainer: {
        flexShrink: 1,
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
    timeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    timeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    ratingValueContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
    },
});
