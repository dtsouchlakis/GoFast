import React from 'react';
import {FlexWidget, TextWidget} from 'react-native-android-widget';
import {Fast} from './App';
import {getFastTimeLeft, isFastRunning} from './utlis';

export function HelloWidget(props: Fast) {
  const currTime = new Date().getTime();
  console.log(currTime, props, 'asdadssda');
  const timeLeft = getFastTimeLeft(props);
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
      }}>
      {isFastRunning(props) ? (
        <TextWidget
          text={`${timeLeft[0]} hours left ${timeLeft[1]} minutes left ${timeLeft[2]} seconds left`}
          style={{
            fontSize: 14,
            fontFamily: 'Inter',
            color: '#000000',
          }}
        />
      ) : (
        <TextWidget
          text="No active fast"
          style={{
            fontSize: 14,
            fontFamily: 'Inter',
            color: '#000000',
          }}
        />
      )}
    </FlexWidget>
  );
}
