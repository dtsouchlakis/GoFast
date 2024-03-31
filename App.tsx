/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { AnimatedCircularProgress } from "react-native-circular-progress";
import React, { useEffect, useMemo } from "react";
import type { PropsWithChildren } from "react";
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
} from "react-native";
import dayjs from "dayjs";
import * as Icons from "react-native-heroicons/solid";
import { Colors } from "react-native/Libraries/NewAppScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, UseFormReturn, Controller } from "react-hook-form";
import {
  dayOfTheWeekFromDate,
  getFastTimeLeft,
  getFastTimeLeftString,
  getPercentLeft,
  isFastExpired,
  isFastRunning,
  isObjectEmpty,
  cancelNotification,
  scheduleNotification,
  requestUserPermission,
  absTimeLeft,
} from "./utlis";
import DatePicker from "react-native-date-picker";
import SelectDropdown from "react-native-select-dropdown";
import { RadioButton } from "react-native-paper";

export type Fast = {
  totalHours: number;
  startTime: Date;
  endTime: Date;
  running: boolean;
  intermittent?: boolean;
  timeLeft?: number;
};

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === "dark";
  const [fast, setFast] = React.useState<Fast | null>(null);

  const [popUpVisible, setPopUpVisible] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState<
    boolean | "endTime" | "startTime"
  >(false);
  const form = useForm<Fast>();

  useEffect(() => {
    requestUserPermission();
    scheduleNotification(fast);
  }, [fast]);

  const storeFast = async (newFast: Fast) => {
    try {
      const value = await AsyncStorage.setItem(
        "currentFast",
        JSON.stringify(newFast)
      );
      let fastRunning = isFastRunning(newFast);
      setFast({
        ...newFast,
        running: fastRunning,
        timeLeft: absTimeLeft(newFast),
      });
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
    console.log("currentFast", fast);

    let interval: NodeJS.Timeout | null = null;

    if (fast) {
      interval = setInterval(() => {
        console.log(isFastExpired(fast!), "isFastExpired(fast)", fast);
        if (isFastExpired(fast!)) {
          scheduleNotification(fast);
          if (fast?.intermittent) {
            setFast(null);
            return;
          }

          let _fast = {
            startTime: new Date(),
            endTime: dayjs(new Date()).add(fast!.totalHours, "h").toDate(),
            totalHours: fast!.totalHours,
            running: true,
            intermittent: fast?.intermittent,
          } as Fast;
          let timeLeft = absTimeLeft(_fast);

          _fast.timeLeft = timeLeft;

          setFast(_fast);
          return;
        } else {
          setFast({
            ...fast,
            timeLeft: absTimeLeft(fast),
          });
        }
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
        (await AsyncStorage.getItem("currentFast")) || "{}"
      );
      console.log(value, fast);

      if (value !== null) {
        console.log("setFast", fast);
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
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View className="w-full h-full flex bg-white dark:bg-gray-800  relative">
        {popUpVisible && (
          <PopUp
            form={form}
            setPopUpVisible={setPopUpVisible}
            onSubmit={() => {
              storeFast({
                totalHours: form.getValues().totalHours,
                startTime: new Date(),
                endTime: dayjs(new Date())
                  .add(form.getValues().totalHours, "h")
                  .toDate(),
                running: true,
                intermittent: form.getValues().intermittent,
              });
            }}
          />
        )}
        <DatePicker
          className=" absolute z-20  w-[90%] bg-white  ml-5 bottom-1/2"
          onConfirm={(e) => {
            console.warn(e, showDatePicker, "TEEEEEST");
            let _fast = { ...fast };
            if (
              showDatePicker === "startTime" ||
              showDatePicker === "endTime"
            ) {
              _fast[showDatePicker] = new Date(e);
            }
            storeFast(_fast);
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
        <View className="w-full rounded-lg  flex flex-row justify-center items-center bg-white dark:bg-gray-700">
          <Text className="text-black dark:text-white text-2xl text-center font-bold">
            GoFast
          </Text>
          <Image
            className="w-16 h-16 -ml-2"
            source={require("./assets/logo.png")}
          />
        </View>
        <View className="justify-center items-center mt-6 bg-white dark:bg-gray-800">
          <DonutCountDown fast={fast!} />
          <View className="absolute w-full  flex justify-center items-center">
            <Text className="text-black dark:text-white p-4 text-start  text-5xl font-light">
              {getFastTimeLeftString(fast, 8)}
            </Text>
            <View className="absolute -bottom-14 flex flex-row justify-evenly w-1/2 z-10">
              <TouchableOpacity className="rounded-full z-50 w-8 h-8 text-black dark:text-white border-2 border-gray-400 dark:border-gray-300">
                <Text
                  className="text-3xl text-center text-black dark:text-white -mt-1"
                  onPress={() => {
                    fast?.totalHours &&
                      fast.totalHours > 0 &&
                      storeFast({
                        ...fast,
                        totalHours: fast?.totalHours - 1,
                        endTime: dayjs(new Date())
                          .add(fast?.totalHours - 1, "h")
                          .toDate(),
                      });
                  }}
                >
                  -
                </Text>
              </TouchableOpacity>
              <Text className="text-black dark:text-white px-4 my-auto py-1 flex items-center justify-center  border-2 border-gray-400 dark:border-gray-300 rounded-full ">
                {fast && getFastTimeLeft(fast)[0]} HRS
              </Text>
              <TouchableOpacity className="rounded-full z-[100] w-8 h-8 text-black dark:text-white border-2 border-gray-400 dark:border-gray-300">
                <Text
                  className="text-xl text-center text-black dark:text-white"
                  onPress={() => {
                    fast?.totalHours &&
                      storeFast({
                        ...fast,
                        totalHours: fast?.totalHours + 1,
                        endTime: dayjs(new Date())
                          .add(fast?.totalHours + 1, "h")
                          .toDate(),
                      });
                    console.log(fast);
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="w-full rounded-lg flex flex-row items-center justify-center -mt-6 bg-white dark:bg-gray-800">
          <View className="w-1/2  flex flex-col items-start  justify-end pl-4">
            <View className="flex flex-row items-center ">
              <Text className="text-gray-800 dark:text-gray-200 text-md text-center ml-2">
                Fast Start
              </Text>
              <TouchableOpacity
                className="h-4 ml-2 z-10"
                onPress={() => {
                  setShowDatePicker("endTime");
                }}
              >
                <Icons.PencilIcon
                  className=" text-black dark:text-white"
                  size={14}
                />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-black dark:text-white text-sm text-start">
                {fast?.endTime
                  ? `${dayOfTheWeekFromDate(fast?.startTime)} ${fast?.startTime
                      .toLocaleString()
                      .slice(11, 19)}`
                  : ""}
              </Text>
            </View>
          </View>
          <View className="w-1/2  flex flex-col items-end  justify-end pr-4">
            <View className="flex flex-row items-center ">
              <Text className="text-gray-800 dark:text-gray-200 text-md text-center ml-2">
                Fast End
              </Text>
              <TouchableOpacity
                className="h-4 ml-2 z-10"
                onPress={() => {
                  setShowDatePicker("endTime");
                }}
              >
                <Icons.PencilIcon
                  className="text-black dark:text-white "
                  size={14}
                />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-black dark:text-gray-200 text-sm text-start">
                {fast?.endTime
                  ? `${dayOfTheWeekFromDate(fast?.endTime)} ${fast?.endTime
                      .toLocaleString()
                      .slice(11, 19)}`
                  : ""}
              </Text>
            </View>
          </View>
        </View>

        {isObjectEmpty(fast) || !fast?.running ? (
          <TouchableOpacity
            className="w-[90%] h-16 mx-4  bg-green-800  rounded-full mt-12 flex justify-center"
            onPress={() => setPopUpVisible(true)}
          >
            <Text className="text-white dark:text-gray-100 text-3xl text-center font-semibold">
              New Fast
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={!fast?.running}
            className={`w-[90%] h-16 mx-4  bg-green-800 rounded-full mt-12 flex justify-center ${
              !fast?.running ? "bg-gray-300" : "bg-[#14744aff]"
            }`}
            onPress={() => {
              console.log("REEE");

              setFast(null);
              AsyncStorage.removeItem("currentFast");
            }}
          >
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
    fontWeight: "600",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  highlight: {
    fontWeight: "700",
  },
});

export default App;

const PopUp = (props: {
  form: UseFormReturn<Fast, any, undefined>;
  setPopUpVisible: (value: boolean) => void;
  onSubmit: (TotalHours: number) => void;
}) => {
  const isDarkMode = useColorScheme() === "dark";

  const fastOptions = Array.from({ length: 24 }, (_, i) => {
    return {
      label: `${i + 1}:${24 - i - 1}`,
      value: i + 1,
    };
  });

  console.log(fastOptions, "fastOptions");

  return (
    <View
      className="w-full h-full absolute z-[100] px-4 flex justify-center items-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onTouchStart={(e) => {
        e.currentTarget == e.target && props.setPopUpVisible(false);
      }}
    >
      <View className="w-full  bg-white dark:bg-zinc-300 rounded-2xl mt-4 p-4 pb-8 flex items-center space-y-4">
        <Text>Enter the amount of time you want to spend on this fast</Text>

        <Controller
          name="totalHours"
          control={props.form.control}
          render={({ field: { value, onChange, onBlur } }) => (
            <SelectDropdown
              data={fastOptions.map((x) => x.label)}
              dropdownIconPosition="right"
              onSelect={(selectedItem, index) => {
                onChange(fastOptions[index].value);
              }}
              defaultValue={value}
            />
          )}
        />
        <Text className="text-gray-600">or select a custom duration</Text>
        <Controller
          name="totalHours"
          control={props.form.control}
          render={({ field: { value, onChange, onBlur } }) => (
            <SelectDropdown
              data={Array.from({ length: 24 }, (_, i) => i + 1)}
              onSelect={(selectedItem, index) => {
                onChange(selectedItem);
              }}
              defaultValue={value}
            />
          )}
        />
        <Text className="text-gray-600">Is fast recurring</Text>
        <Controller
          name="intermittent"
          control={props.form.control}
          render={({ field: { value, onChange, onBlur } }) => (
            <RadioButton
              status={value ? "checked" : "unchecked"}
              onPress={() => onChange(!value)}
              color="black"
              value="true"
            />
          )}
        />

        <View className="flex flex-row justify-end w-full items-center space-x-6">
          <TouchableOpacity
            className="h-4"
            onPress={() => {
              props.setPopUpVisible(false);
            }}
          >
            <Text className="text-cyan-800 text-sm">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-4"
            onPress={() => {
              props.setPopUpVisible(false);
              props.onSubmit(props.form.getValues("totalHours"));
            }}
          >
            <Text className=" text-cyan-800 text-sm">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

function DonutCountDown({ fast }: { fast?: Fast }) {
  const { height, width } = useWindowDimensions();

  const radius = 80;
  const circleCircumference = 2 * Math.PI * radius;
  let percentage = 0;
  let strokeDashoffset = useMemo(() => {
    if (isFastRunning(fast!)) {
      percentage = getPercentLeft(fast!);
      strokeDashoffset = 100 - percentage;
    } else {
      strokeDashoffset = circleCircumference;
    }
    return strokeDashoffset;
  }, [fast]);

  return (
    <View className="w-full flex items-center relative">
      <AnimatedCircularProgress
        size={width}
        width={30}
        fill={strokeDashoffset}
        style={{ position: "relative" }}
        tintColor="#f6f925"
        backgroundColor="#14744aff"
        rotation={15}
        padding={30}
        arcSweepAngle={330}
        backgroundWidth={30}
        renderCap={({ center }) => (
          <View className="w-full bg-slate-800  overflow-visible">
            <Image
              source={require("./assets/cap.png")}
              className=" w-24 h-24 "
              resizeMode="contain"
              style={{
                position: "absolute",
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
}
