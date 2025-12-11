import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onValueChange: (value: number) => void;
    useRatingColors?: boolean;
}

// Helper function to get color based on rating value
const getColorForValue = (value: number, min: number, max: number): string => {
    const percentage = (value - min) / (max - min);
    
    if (percentage < 0.2) return '#FF3B30'; // Red (0-20%)
    if (percentage < 0.4) return '#FF9500'; // Orange (20-40%)
    if (percentage < 0.6) return '#FFCC00'; // Yellow (40-60%)
    if (percentage < 0.8) return '#A0D468'; // Light Green (60-80%)
    return '#4CD964'; // Green (80-100%)
};

export default function Slider({
    min,
    max,
    step,
    value,
    onValueChange,
    useRatingColors = false,
}: SliderProps) {
    const sliderWidth = 300;
    const range = max - min;
    
    // Convert value to position
    const valueToPosition = (val: number) => {
        return ((val - min) / range) * sliderWidth;
    };
    
    // Convert position to value
    const positionToValue = (position: number) => {
        const val = (position / sliderWidth) * range + min;
        const steppedValue = Math.round(val / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    };
    
    const position = useSharedValue(valueToPosition(value));
    const startX = useSharedValue(0);
    const lastValue = useSharedValue(value);
    
    // Sync position when value prop changes externally
    useEffect(() => {
        position.value = withSpring(valueToPosition(value));
        lastValue.value = value;
    }, [value]);
    
    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
    
    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        const { translationX } = event.nativeEvent;
        const newPosition = Math.max(0, Math.min(sliderWidth, startX.value + translationX));
        position.value = newPosition;
        
        const newValue = positionToValue(newPosition);
        if (newValue !== lastValue.value) {
            lastValue.value = newValue;
            runOnJS(triggerHaptic)();
            runOnJS(onValueChange)(newValue);
        }
    };
    
    const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        const { state } = event.nativeEvent;
        
        if (state === State.BEGAN) {
            startX.value = position.value;
            lastValue.value = value;
        } else if (state === State.END || state === State.CANCELLED) {
            const newValue = positionToValue(position.value);
            position.value = withSpring(valueToPosition(newValue));
        }
    };
    
    const thumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: position.value }],
            backgroundColor: '#007AFF',
        };
    });
    
    const activeTrackStyle = useAnimatedStyle(() => {
        return {
            width: position.value,
            backgroundColor: '#007AFF',
        };
    });
    
    return (
        <View style={styles.container}>
            <View style={styles.sliderContainer}>
                {/* Background track */}
                <View style={styles.track} />
                
                {/* Active track */}
                <Animated.View style={[styles.activeTrack, activeTrackStyle]} />
                
                {/* Thumb */}
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View style={[styles.thumb, thumbStyle]} />
                </PanGestureHandler>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    sliderContainer: {
        width: 300,
        height: 40,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        width: '100%',
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
    },
    activeTrack: {
        position: 'absolute',
        height: 4,
        borderRadius: 2,
    },
    thumb: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        marginLeft: -14,
        top: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});
