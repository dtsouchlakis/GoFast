import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import {WidgetPreview} from 'react-native-android-widget';

import {HelloWidget} from './HelloWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function HelloWidgetPreviewScreen() {
  const fast = (await AsyncStorage.getItem('currentFast')) || '{}';
  return (
    <View style={styles.container}>
      <WidgetPreview
        renderWidget={() => <HelloWidget {...JSON.parse(fast)} />}
        width={200}
        height={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
