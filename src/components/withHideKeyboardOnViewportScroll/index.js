/* eslint-disable react/jsx-props-no-spreading */
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import Keyboard from '../../libs/NativeWebKeyboard';

export default function (WrappedComponent) {
    const MIN_NUMBER_OF_SCROLL_EVENTS = 5;

    const WithHideKeyboardOnViewportScroll = (props) => {
        let numberOfScrollsAfterVPResize = MIN_NUMBER_OF_SCROLL_EVENTS;

        useEffect(() => {
            const handleWindowScroll = () => {
                if (numberOfScrollsAfterVPResize < MIN_NUMBER_OF_SCROLL_EVENTS && Keyboard.isVisible()) {
                    Keyboard.dismiss();
                }
                if (numberOfScrollsAfterVPResize >= MIN_NUMBER_OF_SCROLL_EVENTS && Keyboard.isVisible()) {
                    numberOfScrollsAfterVPResize--;
                }
                if (!Keyboard.isVisible()) {
                    numberOfScrollsAfterVPResize = MIN_NUMBER_OF_SCROLL_EVENTS;
                }
            };

            const handleVPResize = () => {
                if (!Keyboard.isVisible()) {
                    numberOfScrollsAfterVPResize = MIN_NUMBER_OF_SCROLL_EVENTS;
                    window.visualViewport.removeEventListener('scroll', handleWindowScroll);
                } else {
                    window.visualViewport.addEventListener('scroll', handleWindowScroll);
                }
            };
            
            window.visualViewport.addEventListener('resize', handleVPResize);

            return () => {
                window.visualViewport.removeEventListener('scroll', handleWindowScroll);
                window.visualViewport.removeEventListener('resize', handleVPResize);
            };
        }, []);

        return (
            <WrappedComponent
                {...props}
                ref={props.forwardedRef}
            />
        );
    };

    WithHideKeyboardOnViewportScroll.displayName = `WithHideKeyboardOnViewportScroll(${getComponentDisplayName(WrappedComponent)})`;
    WithHideKeyboardOnViewportScroll.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    WithHideKeyboardOnViewportScroll.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef((props, ref) => (
        <WithHideKeyboardOnViewportScroll
            {...props}
            forwardedRef={ref}
        />
    ));
}
