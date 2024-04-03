# GoFast: Intermittent Fasting Tracker

This is an open-source React Native mobile app called "GoFast" designed to help you track and manage your intermittent fasting routine. Whether you're new to intermittent fasting or a seasoned practitioner, this app aims to simplify the process and provide you with valuable insights.

## Features

- **Fasting Timer**: Keep track of your current fasting and feeding windows with a user-friendly timer.
- **Reminders and Notifications**: Stay motivated and on track with customizable reminders and notifications.
- **Weight Tracking**:(Work in Progress) Record your weight changes over time and visualize your progress.
- **Insights and Analytics**:(Work in Progress) Gain valuable insights into your fasting patterns and progress through detailed analytics.
- **Upcoming Widget**: (Work in Progress) A convenient widget on your home screen to quickly access important information.

## Technologies Used

- **React Native**: The framework for building cross-platform mobile applications.
- **NativeWind**: A utility-first CSS framework for React Native, providing a familiar styling approach.
- **React Hook Form**: A lightweight library for managing form state and validation in React.
- **React Native SVG**: A library for rendering SVG graphics in React Native.
- **Async Storage**: A built-in API for storing data asynchronously in React Native.
- **Expo**: A set of services and tools for building and deploying React Native apps.

## Getting Started

To get started with building the GoFast app for Android and iOS using EAS, follow these steps:

# Step 1: Install Dependencies

First, ensure you have Node.js installed on your machine. Then, navigate to the root directory of your project and install the dependencies using either npm or Yarn:

```bash
# Using npm
npm install

# OR using Yarn
yarn
```

# Step 2: Configure Environment Variables

Before building the app for Android and iOS, ensure you have the necessary environment variables configured, such as JAVA_HOME and ANDROID_SDK_ROOT for Android development.

# Step 3: Build for Android

To build the GoFast app for Android using EAS, run the following command:

```bash
npx eas build --platform android
```

This command will trigger the build process for Android using EAS. Make sure you have Android Studio installed and a virtual device set up.

# Step 4: Build for iOS

To build the GoFast app for iOS using EAS, run the following command:

```bash
npx eas build --platform ios
```

This command will initiate the build process for iOS using EAS. Ensure you have Xcode installed and properly configured.

# Step 5: Start your Application

Once the build process completes successfully, you can start your application on a physical device or simulator:

- For Android:

```bash
npx expo start --android
```

- For IOS:

```bash
npx expo start --ios
```

Ensure your device or simulator is connected and follow the on-screen instructions to launch the app.

## License

This project is licensed under the [MIT License](LICENSE).
