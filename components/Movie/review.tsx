import { getReview, MovieReview, saveReview } from '@/Services/reviewStorage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';


type ReviewProps = {
    movieId: string;
};

const Review: React.FC<ReviewProps> = ({ movieId }) => {
    const [rating, setRating] = useState<number>(0);       // changed to stars instead of 1-5
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [initialRating, setInitialRating] = useState<number>(0);
    const [initialText, setInitialText] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
    const toastOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const load = async () => {
      const existing = await getReview(movieId);
      if (existing) {
        setRating(existing.rating);
        setText(existing.text);
        setInitialRating(existing.rating);
        setInitialText(existing.text);
      }
      setLoading(false);
    };

    load();
  }, [movieId]);

  const hasChanges = rating !== initialRating || text !== initialText;

  const handleSave = async () => {
    if (!hasChanges) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    const review: MovieReview = {
        rating: Number(rating),
        text
    };

    // Simulate save with random delay
    const saveDelay = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    await new Promise(resolve => setTimeout(resolve, saveDelay));
    
    await saveReview(movieId, review);
    
    setInitialRating(rating);
    setInitialText(text);
    setIsSaving(false);

    // Show success toast
    setShowSuccessToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSuccessToast(false));
  }

  if (loading) {
    return (
        <View style={styles.container}>
            <Text>Loading review...</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>

        {/* <Text style={styles.label}>Your rating (1-5)</Text> */}
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
            >
                <Text style={star <= rating ? styles.starFilled : styles.starEmpty}>
                    ★
                </Text>
                </TouchableOpacity>
            ))}
        </View>


        <Text style={styles.label}>Your review</Text>
        <TextInput 
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            placeholder="Please leave a review here..."
            style={[styles.input, styles.textArea]}
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    (!hasChanges || isSaving) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!hasChanges || isSaving}
                activeOpacity={0.7}
            >
                {isSaving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Review</Text>
                )}
            </TouchableOpacity>

            {/* Success Toast - Overlays the button */}
            {showSuccessToast && (
                <Animated.View style={[styles.successToast, { opacity: toastOpacity }]}>
                    <Text style={styles.successToastText}>✓ Review saved successfully</Text>
                </Animated.View>
            )}
        </View>
    </View>
  );
};

export default Review;

const styles = StyleSheet.create({

    container: {
        gap: 12,
    },

    label: {
        fontWeight: 'bold',
    },

    starsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },

    starFilled: {
        fontSize: 32,
        color: '#FFD700',
        marginRight: 6,
    },

    starEmpty: {
        fontSize: 32,
        color: '#ccc',
        marginRight: 6,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
    },

    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },

    buttonContainer: {
        position: 'relative',
    },

    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },

    saveButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },

    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    successToast: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

    successToastText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

});