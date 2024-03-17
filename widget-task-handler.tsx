import React from 'react';
import type {WidgetTaskHandlerProps} from 'react-native-android-widget';
import {HelloWidget} from './HelloWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Fast} from './App';

const nameToWidget = {
  // Hello will be the **name** with which we will reference our widget.
  Hello: HelloWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];
  const fast = (await AsyncStorage.getItem('currentFast')) || '{}';

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      console.log('Widget added');
      props.renderWidget(<Widget {...JSON.parse(fast)} />);
      break;

    case 'WIDGET_UPDATE':
      // Not needed for now

      props.renderWidget(<Widget {...JSON.parse(fast)} />);

      // Not needed for now
      break;

    case 'WIDGET_RESIZED':
      // Not needed for now
      break;

    case 'WIDGET_DELETED':
      console.log('Widget deleted');
      break;

    case 'WIDGET_CLICK':
      // Not needed for now
      break;

    default:
      break;
  }
}
