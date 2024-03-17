import type {WithAndroidWidgetsParams} from 'react-native-android-widget';

const widgetConfig: WithAndroidWidgetsParams = {
  // Paths to all custom fonts used in all widgets
  fonts: ['./assets/fonts/Inter.ttf'],
  widgets: [
    {
      name: 'HelloWidget', // This name will be the **name** with which we will reference our widget.
      label: 'My Hello Widget', // Label shown in the widget picker
      minWidth: '320dp',
      minHeight: '120dp',
      description: 'This is my first widget', // Description shown in the widget picker
      previewImage: './assets/widget-preview/hello.png', // Path to widget preview image

      // How often, in milliseconds, that this AppWidget wants to be updated.
      // The task handler will be called with widgetAction = 'UPDATE_WIDGET'.
      // Default is 0 (no automatic updates)
      // Minimum is 1800000 (30 minutes == 30 * 60 * 1000).
      updatePeriodMillis: 1800000,
    },
  ],
};

export default widgetConfig;
