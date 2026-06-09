import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Colors from "../constants/Colors";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
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
    backgroundColor: Colors.primary,
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