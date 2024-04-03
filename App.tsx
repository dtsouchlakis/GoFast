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
  state?: "fasting" | "eating";
};

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
      await AsyncStorage.setItem("currentFast", JSON.stringify(newFast));
      const fastRunning = isFastRunning(newFast);
      const updatedFast: Fast = {
        ...newFast,
        running: fastRunning,
        timeLeft: absTimeLeft(newFast),
      };
      setFast(updatedFast);
    } catch (error) {
      console.error("Error storing fast:", error);
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    console.log("currentFast", fast);

    let interval: NodeJS.Timeout | null = null;

    const updateFast = () => {
      if (!fast) return;
      console.log(isFastExpired(fast), "isFastExpired(fast)", fast);
      if (isFastExpired(fast)) {
        scheduleNotification(fast);

        if (!fast.intermittent) {
          setFast(null);
          return;
        }

        const _totalHours = 24 - fast.totalHours;
        const _fast: Fast = {
          startTime: new Date(),
          endTime: dayjs(new Date()).add(_totalHours, "h").toDate(),
          totalHours: _totalHours,
          running: true,
          intermittent: fast.intermittent,
          state: fast.state === "fasting" ? "eating" : "fasting",
        };
        const timeLeft = absTimeLeft(_fast);

        _fast.timeLeft = timeLeft;

        setFast(_fast);
        return;
      } else {
        setFast((prevFast) => ({
          ...prevFast!,
          timeLeft: absTimeLeft(prevFast!),
        }));
      }
    };

    if (fast) {
      interval = setInterval(updateFast, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fast]);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("currentFast");
      if (value) {
        const parsedValue: Fast = JSON.parse(value);
        if (new Date().getTime() > new Date(parsedValue.endTime).getTime()) {
          setFast(null);
        } else {
          setFast(parsedValue);
        }
      }
    } catch (error) {
      console.error("Error retrieving fast:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView className={`bg-${isDarkMode ? "darker" : "lighter"}`}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={`bg-${isDarkMode ? "darker" : "lighter"}`}
      />

      <View className="flex h-full bg-white dark:bg-gray-800 relative">
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
                state: "fasting",
              });
            }}
          />
        )}

        {/* DatePicker */}
        <DatePicker
          className="absolute z-20 w-[90%] bg-white ml-5 bottom-1/2"
          onConfirm={(selectedDate) => {
            console.warn(selectedDate, showDatePicker, "TEEEEEST");
            const _fast = { ...fast };
            if (
              showDatePicker === "startTime" ||
              showDatePicker === "endTime"
            ) {
              _fast[showDatePicker] = new Date(selectedDate);
            }
            storeFast(_fast);
            setShowDatePicker(false);
          }}
          date={new Date()}
          open={!!showDatePicker}
          androidVariant="nativeAndroid"
          fadeToColor="white"
          modal
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Logo */}
        <View className="flex-row justify-center items-center bg-white dark:bg-gray-700">
          <Text className="text-black dark:text-white text-2xl font-bold">
            GoFast
          </Text>
          <Image
            className="w-16 h-16 -ml-2"
            source={require("./assets/logo.png")}
          />
        </View>

        {/* Countdown */}
        <View className="justify-center items-center mt-6 bg-white dark:bg-gray-800">
          <DonutCountDown fast={fast!} />
          <View className="absolute w-full flex justify-center items-center">
            <Text className="text-black dark:text-white p-4 text-5xl font-light">
              {getFastTimeLeftString(fast, 8)}
            </Text>
            {/* Buttons */}
            <View className="absolute -bottom-14 flex flex-row justify-evenly w-1/2 z-10">
              <TouchableOpacity
                className="rounded-full z-50 w-8 h-8 text-black dark:text-white border-2 border-gray-400 dark:border-gray-300"
                onPress={() => {
                  if (fast?.totalHours && fast.totalHours > 0) {
                    storeFast({
                      ...fast,
                      totalHours: fast.totalHours - 1,
                      endTime: dayjs(new Date())
                        .add(fast.totalHours - 1, "h")
                        .toDate(),
                    });
                  }
                }}
              >
                <Text className="text-3xl text-center -mt-1">-</Text>
              </TouchableOpacity>
              <Text className="px-4 my-auto py-1 flex items-center justify-center border-2 border-gray-400 dark:border-gray-300 rounded-full">
                {fast && getFastTimeLeft(fast)[0]} HRS
              </Text>
              <TouchableOpacity
                className="rounded-full z-[100] w-8 h-8 text-black dark:text-white border-2 border-gray-400 dark:border-gray-300"
                onPress={() => {
                  if (fast?.totalHours) {
                    storeFast({
                      ...fast,
                      totalHours: fast.totalHours + 1,
                      endTime: dayjs(new Date())
                        .add(fast.totalHours + 1, "h")
                        .toDate(),
                    });
                  }
                }}
              >
                <Text className="text-xl text-center">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Start/End Times */}
        <View className="rounded-lg flex flex-row items-center justify-between -mt-6 bg-white dark:bg-gray-800">
          <View className="flex flex-col items-start justify-end pl-4">
            <View className="flex flex-row items-center ">
              <TouchableOpacity
                className="-ml-2"
                onPress={() => setShowDatePicker("startTime")}
              >
                <Icons.PencilIcon
                  className="text-black dark:text-white"
                  size={14}
                />
              </TouchableOpacity>

              <Text className="text-gray-800 dark:text-gray-200 text-md ml-1">
                {fast && fast.state === "eating" ? "Rest Start" : "Fast Start"}
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-black dark:text-white text-sm">
                {fast?.endTime
                  ? `${dayOfTheWeekFromDate(fast?.startTime)} ${fast?.startTime
                      .toLocaleString()
                      .slice(9, 14)}`
                  : ""}
              </Text>
            </View>
          </View>
          <View className="flex flex-col items-end justify-end pr-4">
            <View className="flex flex-row items-center mr-1">
              <Text className="text-gray-800 dark:text-gray-200 text-md mr-2">
                {fast && fast.state === "eating" ? "Rest End" : "Fast End"}
              </Text>

              <TouchableOpacity onPress={() => setShowDatePicker("endTime")}>
                <Icons.PencilIcon
                  className="text-black dark:text-white -mr-2"
                  size={14}
                />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-black dark:text-white text-sm">
                {fast?.endTime
                  ? `${dayOfTheWeekFromDate(fast?.endTime)} ${fast?.endTime
                      .toLocaleString()
                      .slice(9, 14)}`
                  : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
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
                top: center.y - 50,
                left: center.x - 9,
                zIndex: 100,
              }}
            />
          </View>
        )}
      />
    </View>
  );
}
