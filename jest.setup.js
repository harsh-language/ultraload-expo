jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (Component) => Component,
    },
    useSharedValue: (initialValue) => ({ value: initialValue }),
    useAnimatedStyle: (updater) => updater(),
    withTiming: (toValue) => toValue,
  };
});
