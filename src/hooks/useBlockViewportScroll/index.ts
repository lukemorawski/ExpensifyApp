import {useNavigation} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import {useEffect, useRef} from 'react';
import Keyboard from '@libs/NativeWebKeyboard';

/**
 * A hook that blocks viewport scroll when the keyboard is visible.
 * It does this by capturing the current scrollY position when the keyboard is shown, then scrolls back to this position smoothly on 'touchend' event.
 * This scroll blocking is removed when the keyboard hides.
 * This hook is doing nothing on native platforms.
 *
 * @example
 * useBlockViewportScroll();
 */
function useBlockViewportScroll() {
    const optimalScrollY = useRef(0);
    const keyboardShowListenerRef = useRef(() => {});
    const keyboardHideListenerRef = useRef(() => {});
    const touchEndRegistered = useRef(false);
    const navigation = useNavigation();

    useEffect(() => {
        let unsubscribeTransitionEnd;
        console.log('Keyboard hook mount ', {isVisible: Keyboard.isVisible(), scroll: window.scrollY});
        const handleTouchEnd = () => {
            if (optimalScrollY.current === window.scrollY) {
                return;
            }
            window.scrollTo({top: optimalScrollY.current, behavior: 'smooth'});
        };

        const handleKeybShow = () => {
            console.log('Keyboard on show', window.scrollY);
            optimalScrollY.current = window.scrollY;
            if (touchEndRegistered.current) {
                return;
            }
            window.addEventListener('touchend', handleTouchEnd);
            touchEndRegistered.current = true;
        };

        const handleKeybHide = () => {
            console.log('Keyboard on hide');
            window.removeEventListener('touchend', handleTouchEnd);
            touchEndRegistered.current = false;
        };
        unsubscribeTransitionEnd = navigation.addListener('transitionEnd', (event) => {
            // Prevent firing the prop callback when user is exiting the page.
            if (lodashGet(event, 'data.closing')) {
                return;
            }
            console.log('Keyboard hook mount animation frame', {isVisible: Keyboard.isVisible(), scroll: window.scrollY, scrollB: document.documentElement.scrollTop});
            if (Keyboard.isVisible()) {
                optimalScrollY.current = window.scrollY;
                handleKeybShow();
            }
        });

        // requestAnimationFrame(() => {
        keyboardShowListenerRef.current = Keyboard.addListener('keyboardDidShow', handleKeybShow);
        keyboardHideListenerRef.current = Keyboard.addListener('keyboardDidHide', handleKeybHide);
        // });

        return () => {
            keyboardShowListenerRef.current();
            keyboardHideListenerRef.current();
            window.removeEventListener('touchend', handleTouchEnd);
            unsubscribeTransitionEnd();
        };
    }, []);
}

export default useBlockViewportScroll;
