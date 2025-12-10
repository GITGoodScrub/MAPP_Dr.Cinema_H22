import { getReview, MovieReview, saveReview } from '@/Services/reviewStorage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


type ReviewProps = {
    movieId: string;
};

const Review: React.FC<ReviewProps> = ({ movieId }) => {
    const [rating, setRating] = useState<number>(0);       // changed to stars instead of 1-5
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      const existing = await getReview(movieId);
      if (existing) {
        setRating(existing.rating);
        setText(existing.text);
      }
      setLoading(false);
    };

    load();
  }, [movieId]);

  const handleSave = async () => {
    const review: MovieReview = {
        rating: Number(rating),
        text
    };

    await saveReview(movieId, review);
    // TODO: Finish navigating back here
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

        <Button title="Save Review" onPress={handleSave} />
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

});