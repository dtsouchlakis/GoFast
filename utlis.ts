import { Fast } from "./App";
import notifee from "@notifee/react-native";

/**
 * Check if the fast running activity is currently in progress.
 *
 * @param {Fast} fast - the fast running activity
 * @return {boolean} true if the fast activity is currently in progress, false otherwise
 */
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

/**
 * Checks if a Fast object is expired based on its start time, end time, and total hours.
 *
 * @param {Fast} fast - the Fast object to be checked for expiration
 * @return {boolean} true if the Fast object is expired, false otherwise
 */
function isFastExpired(fast: Fast): boolean {
  if (!fast || !fast.startTime || !fast.endTime || !fast.totalHours) {
    return false;
  }
  const now = new Date();

  return now.getTime() > new Date(fast.endTime).getTime();
}

/**
 * Calculates the time left for a given "Fast" object based on the current time.
 *
 * @param {Fast} fast - the Fast object containing start time, end time, and total hours
 * @return {Array} an array containing hours, minutes, and seconds left until the end time
 */
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

/**
 * Copies specific properties from the input Fast object and converts the start and end times to Date objects.
 *
 * @param {Fast} fast - the input Fast object to be processed
 * @return {Fast} a new Fast object with the specified properties and converted start and end times
 */
function fastToDates(fast: Fast): Fast {
  return {
    totalHours: fast.totalHours,
    startTime: new Date(fast.startTime),
    endTime: new Date(fast.endTime),
    running: isFastRunning(fast),
  };
}

/**
 * Generates a formatted time string representing the time left for a Fast object.
 *
 * @param {Fast | null} fast - The Fast object containing time information, or null if not available
 * @param {number} digits - The number of digits to include in the formatted time string (default is 2)
 * @return {string} The formatted time string representing the time left, truncated to the specified number of digits
 */
function getFastTimeLeftString(fast: Fast | null, digits = 2): string {
  if (!fast) {
    return "00:00:00".substring(0, digits);
  }
  const [hours, minutes, seconds] = getFastTimeLeft(fast);

  return `${numberToTime(hours)}:${numberToTime(minutes)}:${numberToTime(
    seconds
  )}`.substring(0, digits);
}

/**
 * Converts a number to a string representation of time.
 *
 * @param {number} number - the number to convert
 * @return {string} the string representation of time
 */
function numberToTime(number: number): string {
  if (number < 10) {
    return `0${number}`;
  }
  return `${number}`;
}

/**
 * Returns the day of the week for the given date.
 *
 * @param {Date} day - the input date
 * @return {string} the day of the week as a string
 */
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

/**
 * Calculates the remaining time in milliseconds based on the fast object's total hours and start time.
 *
 * @param {Fast | null} fast - The Fast object containing total hours and start time
 * @return {number} The remaining time in milliseconds
 */
function absTimeLeft(fast: Fast | null): number {
  if (!fast || !fast.totalHours) {
    return 0;
  }
  let now = new Date().getTime();
  let totalTime = fast.totalHours * 60 * 60 * 1000;

  return totalTime - (now - fast.startTime.getTime());
}

// Helpers

/**
 * Check if the given object is empty.
 *
 * @param {{} | null} objectName - The object to check for emptiness.
 * @return {boolean} Returns true if the object is empty, otherwise false.
 */
const isObjectEmpty = (objectName: {} | null) => {
  if (!objectName) {
    return true;
  }
  return Object.keys(objectName).length === 0;
};

/**
 * Calculates the percentage of time left in the fasting period based on the current time and fasting details.
 *
 * @param {Fast | null} fast - The fasting details including start and end time.
 * @return {number} The percentage of time left in the fasting period.
 */
function getPercentLeft(fast: Fast | null): number {
  if (!fast) {
    return 0;
  }
  let now = new Date().getTime();
  let totalTime = fast.endTime.getTime() - fast.startTime.getTime();
  let progress = now - fast.startTime.getTime();
  //if it is fasting time the percentage goes upward otherwise it goes downward
  if (fast.state === "fasting") {
    return 100 - (progress / totalTime) * 100;
  } else {
    return (progress / totalTime) * 100;
  }
}

// Notifications

/**
 * Requests user permission asynchronously and returns the authorization status.
 *
 * @return {string} The authorization status granted by the user.
 */
async function requestUserPermission() {
  const settings = await notifee.requestPermission();

  return settings.authorizationStatus;
}

/**
 * Cancels all notifications with the specified channel ID.
 *
 * @param {array} ['default'] - The channel ID of the notifications to cancel.
 * @return {Promise<void>} A promise that resolves once the notifications are cancelled.
 */
const cancelNotification = async () => {
  await notifee.cancelAllNotifications(["default"]);
};

/**
 * Schedule a notification for the given fasting state.
 *
 * @param {Fast} fast - The fasting state for which the notification is being scheduled.
 */
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
      chronometerDirection: `${fast.state === "fasting" ? "up" : "down"}`,
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
