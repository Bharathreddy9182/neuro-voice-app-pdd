import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

type ReminderNotification = {
  id: number;
  title: string;
  reminder_date: string;
  reminder_time: string;
  status?: string;
};

type MedicationNotification = {
  id: number;
  medicine_name: string;
  dosage: string;
  reminder_time: string;
  status?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function prepareNotifications() {
  const permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    const requested = await Notifications.requestPermissionsAsync();

    if (!requested.granted) {
      return false;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("care-alerts", {
      name: "Care Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  return true;
}

export async function syncCareNotifications({
  reminders = [],
  medications = [],
}: {
  reminders?: ReminderNotification[];
  medications?: MedicationNotification[];
}) {
  const enabled = await prepareNotifications();

  if (!enabled) return;

  if (reminders.length) {
    await cancelScheduledWithPrefix("reminder-");
  }

  if (medications.length) {
    await cancelScheduledWithPrefix("medication-");
  }

  for (const reminder of reminders) {
    if (reminder.status === "completed") continue;

    const date = getReminderDate(reminder.reminder_date, reminder.reminder_time);

    if (!date || date <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `reminder-${reminder.id}`,
      content: {
        title: "Reminder",
        body: reminder.title,
        data: {
          type: "reminder",
          id: reminder.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: "care-alerts",
      },
    });
  }

  for (const medication of medications) {
    if (medication.status === "completed") continue;

    const date = getTodayOrTomorrowTime(medication.reminder_time);

    await Notifications.scheduleNotificationAsync({
      identifier: `medication-${medication.id}`,
      content: {
        title: "Medicine Time",
        body: `${medication.medicine_name} - ${medication.dosage}`,
        data: {
          type: "medication",
          id: medication.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: "care-alerts",
      },
    });
  }
}

async function cancelScheduledWithPrefix(prefix: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.identifier.startsWith(prefix)) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

function getReminderDate(dateText: string, timeText: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hour, minute] = timeText.split(":").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, hour || 9, minute || 0, 0);
}

function getTodayOrTomorrowTime(timeText: string) {
  const [hour, minute] = timeText.split(":").map(Number);
  const date = new Date();

  date.setHours(hour || 9, minute || 0, 0, 0);

  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}
