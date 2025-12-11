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

interface RangeSliderProps {
    min: number;
    max: number;
    step: number;
    minValue: number;
    maxValue: number;
    onValuesChange: (min: number, max: number) => void;
}

export default function RangeSlider({
    min,
    max,
    step,
    minValue,
    maxValue,
    onValuesChange,
}: RangeSliderProps) {
    const sliderWidth = 300; // Will be adjusted dynamically
    const range = max - min;
    
    // Convert values to positions
    const valueToPosition = (value: number) => {
        return ((value - min) / range) * sliderWidth;
    };
    
    // Convert positions to values
    const positionToValue = (position: number) => {
        const value = (position / sliderWidth) * range + min;
        const steppedValue = Math.round(value / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    };
    
    const minPosition = useSharedValue(valueToPosition(minValue));
    const maxPosition = useSharedValue(valueToPosition(maxValue));
    const minStartX = useSharedValue(0);
    const maxStartX = useSharedValue(0);
    const lastMinValue = useSharedValue(minValue);
    const lastMaxValue = useSharedValue(maxValue);
    
    // Sync positions when value props change externally
    useEffect(() => {
        minPosition.value = withSpring(valueToPosition(minValue));
        maxPosition.value = withSpring(valueToPosition(maxValue));
        lastMinValue.value = minValue;
        lastMaxValue.value = maxValue;
    }, [minValue, maxValue]);
    
    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
    
    const onMinGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        const { translationX } = event.nativeEvent;
        const newPosition = Math.max(0, Math.min(maxPosition.value - 20, minStartX.value + translationX));
        minPosition.value = newPosition;
        
        const newValue = positionToValue(newPosition);
        if (newValue !== lastMinValue.value) {
            lastMinValue.value = newValue;
            runOnJS(triggerHaptic)();
            runOnJS(onValuesChange)(newValue, positionToValue(maxPosition.value));
        }
    };
    
    const onMinHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        const { state } = event.nativeEvent;
        
        if (state === State.BEGAN) {
            minStartX.value = minPosition.value;
            lastMinValue.value = minValue;
        } else if (state === State.END || state === State.CANCELLED) {
            const newValue = positionToValue(minPosition.value);
            minPosition.value = withSpring(valueToPosition(newValue));
        }
    };
    
    const onMaxGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        const { translationX } = event.nativeEvent;
        const newPosition = Math.max(minPosition.value + 20, Math.min(sliderWidth, maxStartX.value + translationX));
        maxPosition.value = newPosition;
        
        const newValue = positionToValue(newPosition);
        if (newValue !== lastMaxValue.value) {
            lastMaxValue.value = newValue;
            runOnJS(triggerHaptic)();
            runOnJS(onValuesChange)(positionToValue(minPosition.value), newValue);
        }
    };
    
    const onMaxHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        const { state } = event.nativeEvent;
        
        if (state === State.BEGAN) {
            maxStartX.value = maxPosition.value;
            lastMaxValue.value = maxValue;
        } else if (state === State.END || state === State.CANCELLED) {
            const newValue = positionToValue(maxPosition.value);
            maxPosition.value = withSpring(valueToPosition(newValue));
        }
    };
    
    const minThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: minPosition.value }],
        };
    });
    
    const maxThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: maxPosition.value }],
        };
    });
    
    const activeTrackStyle = useAnimatedStyle(() => {
        return {
            left: minPosition.value,
            width: maxPosition.value - minPosition.value,
        };
    });
    
    return (
        <View style={styles.container}>
            <View style={styles.sliderContainer}>
                {/* Background track */}
                <View style={styles.track} />
                
                {/* Active track */}
                <Animated.View style={[styles.activeTrack, activeTrackStyle]} />
                
                {/* Min thumb */}
                <PanGestureHandler
                    onGestureEvent={onMinGestureEvent}
                    onHandlerStateChange={onMinHandlerStateChange}
                >
                    <Animated.View style={[styles.thumb, minThumbStyle]} />
                </PanGestureHandler>
                
                {/* Max thumb */}
                <PanGestureHandler
                    onGestureEvent={onMaxGestureEvent}
                    onHandlerStateChange={onMaxHandlerStateChange}
                >
                    <Animated.View style={[styles.thumb, maxThumbStyle]} />
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
        backgroundColor: '#007AFF',
        borderRadius: 2,
    },
    thumb: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#007AFF',
        marginLeft: -14,
        top: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});
