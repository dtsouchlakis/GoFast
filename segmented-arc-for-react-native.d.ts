declare module '@shipt/segmented-arc-for-react-native' {
  import React from 'react';
  import {StyleProp, TextStyle, ViewStyle, Animated} from 'react-native';

  interface SegmentType {
    scale?: number;
    filledColor: string;
    emptyColor: string;
    data?: object;
  }

  interface SegmentedArcProps {
    fillValue?: number;
    segments: SegmentType[];
    filledArcWidth?: number;
    emptyArcWidth?: number;
    spaceBetweenSegments?: number;
    arcDegree?: number;
    radius?: number;
    animationDuration?: number;
    isAnimated?: boolean;
    animationDelay?: number;
    showArcRanges?: boolean;
    middleContentContainerStyle?: StyleProp<ViewStyle>;
    ranges?: string[];
    rangesTextColor?: string;
    rangesTextStyle?: StyleProp<TextStyle>;
    capInnerColor?: string;
    capOuterColor?: string;
    children?: (props: {lastFilledSegment: ArcType}) => React.ReactNode;
  }

  interface ArcType {
    centerX: number;
    centerY: number;
    start: number;
    end: number;
    filled: number;
    isComplete: boolean;
    filledColor: string;
    emptyColor: string;
    data?: object;
  }

  interface SegmentedArcContextType {
    margin: number;
    center: number;
    filledArcWidth: number;
    radius: number;
    isAnimated: boolean;
    animationDuration: number;
    emptyArcWidth: number;
    totalArcs: number;
    arcsStart: number;
    spaceBetweenSegments: number;
    arcSegmentDegree: number;
    arcAnimatedValue: Animated.Value;
    lastFilledSegment: ArcType | undefined;
    ranges: string[];
    rangesTextColor: string;
    rangesTextStyle: StyleProp<TextStyle>;
    capInnerColor: string;
    capOuterColor: string;
  }

  const SegmentedArc: React.FC<SegmentedArcProps>;
  export {SegmentedArc, SegmentedArcContextType};
}
