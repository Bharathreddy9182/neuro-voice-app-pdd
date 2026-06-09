import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome" as any);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧠</Text>

      <Text style={styles.title}>
        Neuro Voice Companion
      </Text>

      <Text style={styles.subtitle}>
        Your AI Memory Assistant
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    fontSize: 90,
  },

  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});