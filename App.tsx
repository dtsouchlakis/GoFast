/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import React, {useEffect, useMemo} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import * as Icons from 'react-native-heroicons/solid';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {G, Circle} from 'react-native-svg';
import {
  useForm,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  Controller,
} from 'react-hook-form';

type Fast = {
  totalHours: number;
  startTime: Date;
  endTime: Date;
};

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

const group = 'group.gofast';
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [fast, setFast] = React.useState<Fast | null>(null);

  const [popUpVisible, setPopUpVisible] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);

  const form = useForm<Fast>();

  const storeFast = async (totalHours: number) => {
    let fast = {
      totalHours,
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + totalHours * 60 * 60 * 1000),
    };
    console.log(fast, currentTime, 'asdadssda');

    try {
      await SharedGroupPreferences.setItem('currentFast', fast, group);
      const value = await AsyncStorage.setItem(
        'currentFast',
        JSON.stringify(fast),
      );
      setCurrentTime(1);
      setFast(fast as unknown as Fast);
      if (value !== null) {
        // value previously stored
      }
    } catch (e) {
      // error reading value
    }
  };
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!fast || new Date().getTime() > new Date(fast.endTime).getTime()) {
      setCurrentTime(0);
      interval = null;
    }
    if (fast) {
      interval = setInterval(() => {
        setCurrentTime(new Date(fast.endTime).getTime() - new Date().getTime());
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fast]);

  const getData = async () => {
    try {
      const value = await JSON.parse(
        (await AsyncStorage.getItem('currentFast')) || '{}',
      );
      console.log(value, fast);

      if (value !== null) {
        console.log('setFast', fast);
        setFast(value);
        console.log(fast);
      }
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View className="w-full h-full flex bg-white dark:bg-black  relative">
        {popUpVisible && (
          <PopUp
            form={form}
            setPopUpVisible={setPopUpVisible}
            onSubmit={storeFast}
          />
        )}

        <View className="w-full h-1/3 bg-zinc-300 rounded-lg mt-4 shadow-md shadow-black">
          <View className="flex flex-row justify-center">
            <Text className="text-black dark:text-white text-2xl p-4 text-center">
              Current Fast
            </Text>
          </View>
          <Text className="text-black dark:text-white text-lg  p-4 text-start">
            Start:{' '}
            {fast?.startTime &&
              fast?.startTime.toLocaleString().slice(0, 10) +
                ' ' +
                fast?.startTime.toLocaleString().slice(11, 19)}
          </Text>
          <Text className="text-black dark:text-white text-lg  p-4 text-start">
            End:{' '}
            {fast?.endTime &&
              fast?.endTime.toLocaleString().slice(0, 10) +
                ' ' +
                fast?.endTime.toLocaleString().slice(11, 19)}
          </Text>
          <Text className="text-black dark:text-white text-lg  p-4 text-start">
            Remaining: {Math.floor(currentTime / 60 / 60 / 1000)} hours{' '}
            {Math.floor(currentTime / 60 / 1000) % 60} minutes
          </Text>
        </View>
        <TouchableOpacity
          className="w-full h-12 bg-red-600 rounded-lg mt-4 flex justify-center "
          onPress={() => setPopUpVisible(true)}>
          <Text className="text-white dark:text-white text-2xl text-center">
            New Fast
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={Number.isNaN(currentTime) || currentTime == 0}
          className={`w-full h-12 z-10  rounded-lg mt-4 flex justify-center ${
            Number.isNaN(currentTime) || currentTime == 0
              ? 'bg-gray-300'
              : 'bg-green-600'
          }`}
          onPress={() => {
            console.log('REEE');

            setCurrentTime(0);
            setFast(null);
            AsyncStorage.removeItem('currentFast');
          }}>
          <Text className="text-white text-2xl text-center">Stop Fast</Text>
        </TouchableOpacity>
        <View className="flex-1 justify-center items-center mt-8">
          <DonutCountDown timeLeft={currentTime} totalTime={fast?.totalHours} />
          <Text className="text-black dark:text-white p-4 text-start absolute text-2xl font-bold">
            {Math.floor(currentTime / 60 / 60 / 1000)} :{' '}
            {Math.floor(currentTime / 60 / 1000) % 60}
          </Text>
        </View>
        <View className="relative right-0 bottom-5 flex flex-col justify-around items-end pr-4">
          <TouchableOpacity
            className="w-10 h-10 mt-4 ml-4  z-10"
            onPress={() => setPopUpVisible(true)}>
            <Icons.CogIcon className="w-6 h-6 text-black" />
          </TouchableOpacity>
          <Text className="text-black dark:text-white text-sm -mt-2 font-bold">
            Change fast
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

const PopUp = (props: {
  form: UseFormReturn<Fast, any, undefined>;
  setPopUpVisible: (value: boolean) => void;
  onSubmit: (TotalHours: number) => void;
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  return (
    <View
      className="w-full h-full absolute z-20 px-4 flex justify-center items-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onTouchStart={e => {
        e.currentTarget == e.target && props.setPopUpVisible(false);
      }}>
      <View className="w-full  bg-white dark:bg-zinc-300 rounded-lg mt-4 p-4 pb-12">
        <Text>Enter the amount of time you want to spend on this fast</Text>

        <Controller
          name="totalHours"
          control={props.form.control}
          render={({field: {value, onChange, onBlur}}) => (
            <TextInput
              className="w-full h-12 bg-zinc-300 rounded-lg mt-4 shadow-md shadow-black"
              keyboardType="numeric"
              value={value?.toString()}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <TouchableOpacity
          className="w-full h-12 bg-red-600 rounded-lg mt-4 flex justify-center items-center"
          onPress={() => {
            console.log(props.form.getValues('totalHours'));

            props.setPopUpVisible(false);
            props.onSubmit(props.form.getValues('totalHours'));
          }}>
          <Text className="text-white text-2xl text-center flex">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DonutCountDown = ({
  totalTime,
  timeLeft,
}: {
  totalTime?: number;
  timeLeft?: number;
}) => {
  const radius = 70;
  const circleCircumference = 2 * Math.PI * radius;

  let percentage = 0;
  let strokeDashoffset = 0;

  if (totalTime && timeLeft !== undefined) {
    const spentAmount = totalTime * 3600 * 1000 - timeLeft;
    percentage = (spentAmount / (totalTime * 3600 * 1000)) * 100;
    strokeDashoffset =
      circleCircumference - circleCircumference * (1 - percentage / 100);
  }
  console.log(percentage, strokeDashoffset);

  return (
    <>
      <Svg
        viewBox="0 0 180 180"
        className="mx-auto h-72 w-72 rounded-full mt-4 shadow-md shadow-black ">
        <G rotation={-90} originX="90" originY="90">
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#F1F6F9"
            fill="transparent"
            strokeWidth="40"
          />

          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#14274E"
            fill="transparent"
            strokeWidth="40"
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset ? strokeDashoffset : 0}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </>
  );
};
