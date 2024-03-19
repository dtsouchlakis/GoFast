/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import dayjs from 'dayjs';
import * as Icons from 'react-native-heroicons/solid';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useForm, UseFormReturn, Controller} from 'react-hook-form';
import {
  dayOfTheWeekFromDate,
  getFastTimeLeft,
  getFastTimeLeftString,
  isFastExpired,
  isFastRunning,
  isObjectEmpty,
} from './utlis';
import DatePicker from 'react-native-date-picker';
import SelectDropdown from 'react-native-select-dropdown';
import {Circle} from 'react-native-svg';

export type Fast = {
  totalHours: number;
  startTime: Date;
  endTime: Date;
  running: boolean;
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
  const [showDatePicker, setShowDatePicker] = React.useState<
    boolean | 'endTime' | 'startTime'
  >(false);
  const form = useForm<Fast>();

  const storeFast = async (fast: Fast) => {
    console.log(fast, currentTime, 'asdadssda');

    try {
      const value = await AsyncStorage.setItem(
        'currentFast',
        JSON.stringify(fast),
      );
      setCurrentTime(1);
      console.log(fast, 'setFast1');
      let fastRunning = isFastRunning(fast);
      setFast({...fast, running: fastRunning});
      if (value !== null) {
        // value previously stored
      }
    } catch (e) {
      console.log(e);
    }
  };
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    console.log('currentFast', fast);

    let interval: NodeJS.Timeout | null = null;

    if (fast) {
      interval = setInterval(() => {
        console.log(isFastExpired(fast!), 'isFastExpired(fast)', fast);
        if (isFastExpired(fast!)) {
          setFast(null);
          setCurrentTime(0);
          return;
        }
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
        if (new Date().getTime() > new Date(value.endTime).getTime()) {
          setFast(null);
        } else {
          setFast(value);
        }
        console.log(fast);
      }
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
    console.log(currentTime, fast, 'asd');
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
            onSubmit={() => {
              storeFast({
                totalHours: form.getValues().totalHours,
                startTime: new Date(),
                endTime: dayjs(new Date())
                  .add(form.getValues().totalHours, 'h')
                  .toDate(),
                running: true,
              });
            }}
          />
        )}
        <DatePicker
          className=" absolute z-20  w-[90%] bg-white ml-5 bottom-1/2"
          onConfirm={e => {
            console.log(e, 'TEEEEEST');
            let _fast = {
              ...fast,
              showDatePicker: e,
            };
            storeFast(fast!);
            setShowDatePicker(false);
          }}
          date={new Date()}
          open={showDatePicker ? true : false}
          androidVariant="nativeAndroid"
          fadeToColor="white"
          modal
          onCancel={() => {
            setShowDatePicker(false);
          }}
        />
        <View className="w-full rounded-lg  flex flex-row justify-center items-center">
          <Text className="text-black dark:text-white text-2xl text-center font-bold">
            GoFast
          </Text>
          <Image
            className="w-16 h-16 -ml-2"
            source={require('./assets/logo.png')}
          />
        </View>
        <View className="justify-center items-center mt-6">
          <DonutCountDown timeLeft={currentTime} totalTime={fast?.totalHours} />
          <View className="absolute w-full  flex justify-center items-center">
            <Text className="text-black dark:text-white p-4 text-start  text-5xl font-light">
              {getFastTimeLeftString(fast, 8)}
            </Text>
            <View className="absolute -bottom-12 flex flex-row justify-evenly w-1/2 z-10">
              <TouchableOpacity className="rounded-full z-50 w-8 h-8 text-black dark:text-white border-2 border-gray-400">
                <Text
                  className="text-xl text-center"
                  onPress={() => {
                    fast?.totalHours &&
                      fast.totalHours > 0 &&
                      storeFast({
                        ...fast,
                        totalHours: fast?.totalHours - 1,
                        endTime: dayjs(new Date())
                          .add(fast?.totalHours - 1, 'h')
                          .toDate(),
                      });
                  }}>
                  -
                </Text>
              </TouchableOpacity>
              <Text className="text-black dark:text-white px-4 my-auto py-1 flex items-center justify-center  border-2 border-gray-400 rounded-full ">
                {fast && getFastTimeLeft(fast)[0]} HRS
              </Text>
              <TouchableOpacity className="rounded-full z-[100] w-8 h-8 text-black dark:text-white border-2 border-gray-400">
                <Text
                  className="text-xl text-center"
                  onPress={() => {
                    fast?.totalHours &&
                      storeFast({
                        ...fast,
                        totalHours: fast?.totalHours + 1,
                        endTime: dayjs(new Date())
                          .add(fast?.totalHours + 1, 'h')
                          .toDate(),
                      });
                    console.log(fast);
                  }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="w-full rounded-lg flex flex-row items-center justify-center -mt-6">
          <View className="w-1/2  flex flex-col items-start  justify-end pl-4">
            <View className="flex flex-row items-center ">
              <Text className="text-gray-400 dark:text-white text-md text-center ml-2">
                Fast Start
              </Text>
              <TouchableOpacity
                className="h-4 ml-2 z-10"
                onPress={() => {
                  setShowDatePicker('endTime');
                }}>
                <Icons.PencilIcon className="w text-black " size={14} />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-black dark:text-white text-sm text-start">
                {fast?.endTime
                  ? `${dayOfTheWeekFromDate(fast?.startTime)} ${fast?.startTime
                      .toLocaleString()
                      .slice(11, 19)}`
                  : ''}
              </Text>
            </View>
          </View>
          <View className="w-1/2  flex flex-col items-end  justify-end pr-4">
            <View className="flex flex-row items-center ">
              <Text className="text-gray-400 dark:text-white text-md text-center ml-2">
                Fast End
              </Text>
              <TouchableOpacity
                className="h-4 ml-2 z-10"
                onPress={() => {
                  setShowDatePicker('endTime');
                }}>
                <Icons.PencilIcon className="w text-black " size={14} />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-black dark:text-white text-sm text-start">
                {fast?.endTime
                  ? `${dayOfTheWeekFromDate(fast?.endTime)} ${fast?.endTime
                      .toLocaleString()
                      .slice(11, 19)}`
                  : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* <View className="w-full h-1/3 bg-zinc-300 rounded-lg mt-4 shadow-md shadow-black">
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
        </View> */}
        {isObjectEmpty(fast) || !fast?.running ? (
          <TouchableOpacity
            className="w-[90%] h-16 mx-4  bg-green-800 rounded-full mt-12 flex justify-center"
            onPress={() => setPopUpVisible(true)}>
            <Text className="text-white dark:text-white text-3xl text-center font-semibold">
              New Fast
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={Number.isNaN(currentTime) || currentTime == 0}
            className={`w-[90%] h-16 mx-4  bg-green-800 rounded-full mt-12 flex justify-center ${
              Number.isNaN(currentTime) || currentTime == 0 //TODO: remove currtime, use isRunning instead
                ? 'bg-gray-300'
                : 'bg-[#14744aff]'
            }`}
            onPress={() => {
              console.log('REEE');

              setCurrentTime(0);
              setFast(null);
              AsyncStorage.removeItem('currentFast');
            }}>
            <Text className="text-white dark:text-white text-3xl text-center font-semibold">
              Stop Fast
            </Text>
          </TouchableOpacity>
        )}
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
      className="w-full h-full absolute z-[100] px-4 flex justify-center items-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onTouchStart={e => {
        e.currentTarget == e.target && props.setPopUpVisible(false);
      }}>
      <View className="w-full  bg-white dark:bg-zinc-300 rounded-lg mt-4 p-4 pb-12 flex items-center justify-center">
        <Text>Enter the amount of time you want to spend on this fast</Text>

        <Controller
          name="totalHours"
          control={props.form.control}
          render={({field: {value, onChange, onBlur}}) => (
            <SelectDropdown
              data={Array.from({length: 24}, (_, i) => i + 1)}
              onSelect={(selectedItem, index) => {
                onChange(selectedItem);
              }}
              defaultValue={value}
            />
          )}
        />
        <Text className="text-gray-600">or select a custom duration</Text>
        <Controller
          name="totalHours"
          control={props.form.control}
          render={({field: {value, onChange, onBlur}}) => (
            <SelectDropdown
              data={Array.from({length: 24}, (_, i) => i + 1)}
              onSelect={(selectedItem, index) => {
                onChange(selectedItem);
              }}
              defaultValue={value}
            />
          )}
        />

        <TouchableOpacity
          className="w-full h-12 rounded-lg mt-4 flex justify-center items-center"
          onPress={() => {
            console.log(props.form.getValues('totalHours'), 'TotalHours');

            props.setPopUpVisible(false);
            props.onSubmit(props.form.getValues('totalHours'));
          }}>
          <Text className="text-red-600 text-2xl text-center flex">Save</Text>
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
  const {height, width} = useWindowDimensions();

  const radius = 80;
  const circleCircumference = 2 * Math.PI * radius;
  let percentage = 0;
  let strokeDashoffset = circleCircumference;

  if (totalTime && timeLeft !== undefined) {
    const spentAmount = totalTime * 3600 * 1000 - timeLeft;
    percentage = (spentAmount / (totalTime * 3600 * 1000)) * 100;
    strokeDashoffset = circleCircumference * (percentage / 100);
  }

  console.log(percentage, strokeDashoffset);
  const segments = [
    {
      filledColor: '#28E037',
      emptyColor: '#FFFFFF',
      filled: percentage,
    },
  ];
  return (
    <View className="w-full flex items-center relative">
      <AnimatedCircularProgress
        size={width}
        width={30}
        fill={strokeDashoffset}
        style={{position: 'relative'}}
        tintColor="#f6f925"
        backgroundColor="#14744aff"
        rotation={15}
        padding={30}
        arcSweepAngle={330}
        backgroundWidth={30}
        onAnimationComplete={() => console.log('onAnimationComplete')}
        renderCap={({center}) => (
          <View className="w-full bg-slate-800  overflow-visible">
            <Image
              source={require('./assets/cap.png')}
              className=" w-24 h-24 "
              resizeMode="contain"
              style={{
                position: 'absolute',
                top: center.y - 55,
                left: center.x - 40,
                zIndex: 100,
              }}
            />
          </View>
        )}
      />
    </View>
  );
};
