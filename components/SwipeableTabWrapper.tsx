import React, { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { PanGestureHandler, State, HandlerStateChangeEvent, PanGestureHandlerGestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';

interface SwipeableTabWrapperProps {
    children: React.ReactNode;
    canSwipeRight?: boolean;
    rightRoute?: string;
}

export default function SwipeableTabWrapper({
    children,
    canSwipeRight = false,
    rightRoute,
}: SwipeableTabWrapperProps) {
    const translateX = useSharedValue(0);
    const isNavigating = useSharedValue(false);

    const navigateToRoute = useCallback((route: string) => {
        if (route === 'back') {
            router.back();
        } else {
            router.push(route as any);
        }
    }, []);

    const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        'worklet';
        if (isNavigating.value) return;
        
        const { translationX } = event.nativeEvent;
        
        if (translationX > 0 && canSwipeRight) {
            // Dragging right - allow full movement
            translateX.value = translationX;
        } else {
            // Add heavy resistance when dragging in disabled direction
            translateX.value = translationX * 0.05;
        }
    };

    const handleStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        'worklet';
        const { translationX, velocityX, state } = event.nativeEvent;
        
        if (state === State.END || state === State.CANCELLED) {
            // Check if swipe was strong enough (threshold: 1/4 to 1/3 of screen or high velocity)
            const shouldNavigate = translationX > 120 || (translationX > 80 && velocityX > 500);
            
            if (shouldNavigate && canSwipeRight && rightRoute) {
                // Mark as navigating to prevent gesture updates
                isNavigating.value = true;
                // Navigate immediately while keeping current position
                runOnJS(navigateToRoute)(rightRoute);
            } else {
                // Bounce back from current position
                translateX.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300,
                });
            }
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleStateChange}
            activeOffsetX={[-10, 10]}
        >
            <Animated.View style={[styles.container, animatedStyle]}>
                {children}
            </Animated.View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
