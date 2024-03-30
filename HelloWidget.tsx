import React from 'react';
import {
  FlexWidget,
  ImageWidget,
  SvgWidget,
  TextWidget,
} from 'react-native-android-widget';
import {Fast} from './App';
import {getFastTimeLeft, getPercentLeft, isFastRunning} from './utlis';

export function HelloWidget(props: Fast) {
  const currTime = new Date().getTime();
  const circumference = 251.2; // Circumference of the circle (2 * Math.PI * 40)
  let percentage = 0;
  let strokeDashoffset = circumference;

  if (isFastRunning(props!)) {
    percentage = getPercentLeft(props!);
    strokeDashoffset = percentage / 100;
  }

  const timeLeft = getFastTimeLeft(props!);
  const svgString = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle
    cx="50"
    cy="50"
    r="60"
    fill="none"
    stroke="#000"
    stroke-width="40"
    stroke-dasharray="${circumference}"
    stroke-dashoffset="${strokeDashoffset}"
    transform="rotate(-90 50 50)"
  />
</svg>`;
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
      <SvgWidget svg={svgString} style={{height: 72, width: 72}} />

      <ImageWidget
        image={require('./assets/cap.png')}
        imageWidth={88}
        imageHeight={88}
      />
    </FlexWidget>
  );
}
