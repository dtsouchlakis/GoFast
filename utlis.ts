import { Fast } from "./App";
import notifee from "@notifee/react-native";

function isFastRunning(fast: Fast): boolean {
  if (!fast || !fast.startTime || !fast.endTime || !fast.totalHours) {
    return false;
  }

  if (typeof fast.startTime === "string" || typeof fast.endTime === "string") {
    fast.startTime = new Date(fast.startTime);
    fast.endTime = new Date(fast.endTime);
  }

  const now = new Date();

  return (
    fast.startTime.getTime() < now.getTime() &&
    now.getTime() < fast.endTime.getTime()
  );
}

function isFastExpired(fast: Fast): boolean {
  if (!fast || !fast.startTime || !fast.endTime || !fast.totalHours) {
    return false;
  }
  const now = new Date();

  return now.getTime() > new Date(fast.endTime).getTime();
}

function getFastTimeLeft(fast: Fast): [number, number, number] {
  if (!fast || !fast.startTime || !fast.endTime || !fast.totalHours) {
    return [0, 0, 0];
  }

  let _fast = fastToDates(fast);
  const now = new Date();
  let hours = Math.floor(
    (_fast.endTime.getTime() - now.getTime()) / 1000 / 60 / 60
  );
  let minutes = Math.floor(
    (_fast.endTime.getTime() - now.getTime()) / 1000 / 60 - hours * 60
  );
  let seconds = Math.floor(
    (_fast.endTime.getTime() - now.getTime()) / 1000 -
      minutes * 60 -
      hours * 60 * 60
  );

  return [hours, minutes, seconds];
}

function fastToDates(fast: Fast): Fast {
  return {
    totalHours: fast.totalHours,
    startTime: new Date(fast.startTime),
    endTime: new Date(fast.endTime),
    running: isFastRunning(fast),
  };
}

function getFastTimeLeftString(fast: Fast | null, digits = 2): string {
  if (!fast) {
    return "00:00:00".substring(0, digits);
  }
  const [hours, minutes, seconds] = getFastTimeLeft(fast);

  return `${numberToTime(hours)}:${numberToTime(minutes)}:${numberToTime(
    seconds
  )}`.substring(0, digits);
}

function numberToTime(number: number): string {
  if (number < 10) {
    return `0${number}`;
  }
  return `${number}`;
}

function dayOfTheWeekFromDate(day: Date): string {
  if (!day) {
    return "";
  }

  if (typeof day == "string") {
    day = new Date(day);
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let now = new Date();
  let yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (day.getDate() === now.getDate()) {
    return "Today";
  }
  if (day.getDate() === yesterday.getDate()) {
    return "Yesterday";
  }
  if (day.getDate() === tomorrow.getDate()) {
    return "Tomorrow";
  }
  return days[day.getDay()];
}

function absTimeLeft(fast: Fast | null): number {
  if (!fast || !fast.totalHours) {
    return 0;
  }
  let now = new Date().getTime();
  let totalTime = fast.totalHours * 60 * 60 * 1000;

  return totalTime - (now - fast.startTime.getTime());
}

// Helpers
const isObjectEmpty = (objectName: {} | null) => {
  if (!objectName) {
    return true;
  }
  return Object.keys(objectName).length === 0;
};

function getPercentLeft(fast: Fast | null): number {
  if (!fast) {
    return 0;
  }
  let now = new Date().getTime();
  let totalTime = fast.endTime.getTime() - fast.startTime.getTime();
  let progress = now - fast.startTime.getTime();

  return 100 - (progress / totalTime) * 100;
}

// Notifications

async function requestUserPermission() {
  const settings = await notifee.requestPermission();

  return settings.authorizationStatus;
}

const cancelNotification = async () => {
  await notifee.cancelAllNotifications(["default"]);
};
const scheduleNotification = async (fast: Fast) => {
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
  });

  let notifications = await notifee.getDisplayedNotifications();
  notifee.displayNotification({
    title: "Time left",
    body: "Your fast is running",
    id: "default",
    android: {
      channelId,
      timestamp: fastToDates(fast).endTime.getTime(),
      showTimestamp: true,
      showChronometer: true,
      ongoing: true,
      chronometerDirection: "down",
      onlyAlertOnce: true,
      progress: {
        max: 100,
        current: getPercentLeft(fast),
      },
    },
  });
};

export {
  isFastRunning,
  isFastExpired,
  absTimeLeft,
  getFastTimeLeft,
  getFastTimeLeftString,
  fastToDates,
  numberToTime,
  dayOfTheWeekFromDate,
  isObjectEmpty,
  getPercentLeft,
  requestUserPermission,
  cancelNotification,
  scheduleNotification,
};
