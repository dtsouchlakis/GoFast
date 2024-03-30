import React, {useEffect} from 'react';
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

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      console.log('Widget added');
      let fast = JSON.parse(
        (await AsyncStorage.getItem('currentFast')) || '{}',
      );
      let _fast = {
        ...fast,
        startTime: new Date(fast.startTime),
        endTime: new Date(fast.endTime),
      } as Fast;
      console.log(_fast, 'fastfast');

      props.renderWidget(<Widget {..._fast} />);
      break;

    case 'WIDGET_UPDATE':
      // Not needed for now
      console.log('Widget update');

      fast = (await AsyncStorage.getItem('currentFast')) || '{}';
      console.log(fast);

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
      console.log('Widget update');

      fast = (await AsyncStorage.getItem('currentFast')) || '{}';
      console.log(fast);

      props.renderWidget(<Widget {...JSON.parse(fast)} />);

      break;

    default:
      break;
  }
}
