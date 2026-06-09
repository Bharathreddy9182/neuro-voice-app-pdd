import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";

import API from "../src/services/api";

type SpeechResultsEvent = {
  value?: string[];
};

type SpeechErrorEvent = {
  error?: {
    message?: string;
  };
};

const voiceModule = Voice as typeof Voice | null;
const isExpoGo = Constants.appOwnership === "expo";
const canUseNativeVoice =
  !isExpoGo &&
  Platform.OS !== "web" &&
  Boolean(voiceModule?.start) &&
  Boolean(voiceModule?.destroy) &&
  Boolean(voiceModule?.removeAllListeners);

export default function VoiceScreen() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [manualText, setManualText] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceAvailable] = useState(canUseNativeVoice);

  useEffect(() => {
    if (canUseNativeVoice && voiceModule) {
      voiceModule.onSpeechResults = (event: SpeechResultsEvent) => {
        const speech = event.value?.[0] || "";

        setText(speech);
        setManualText(speech);
        setListening(false);

        if (speech.trim()) {
          sendToAI(speech);
        }
      };

      voiceModule.onSpeechError = (event: SpeechErrorEvent) => {
        console.log("VOICE ERROR:", event);
        setListening(false);

        Alert.alert(
          "Voice Error",
          event.error?.message || "Voice recognition stopped."
        );
      };
    }

    return () => {
      if (canUseNativeVoice && voiceModule) {
        voiceModule.destroy().then(voiceModule.removeAllListeners);
      }
    };
  }, []);

  const startListening = async () => {
    if (!voiceAvailable || !voiceModule?.start) {
      Alert.alert(
        "Voice Unavailable",
        "Speech recognition is not available in this app build. You can still type your question below."
      );
      return;
    }

    try {
      setListening(true);
      await voiceModule.start("en-US");
    } catch {
      setListening(false);

      Alert.alert(
        "Voice Error",
        "Voice recognition is unavailable in this build. Type your question or run an Android development build."
      );
    }
  };

  const sendToAI = async (message: string) => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      Alert.alert("Validation", "Please enter or speak a message.");
      return;
    }

    try {
      setLoading(true);
      setText(cleanMessage);

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (!user.id) {
        Alert.alert("Login Required", "Please log in again.");
        return;
      }

      const response = await API.post("/ai/chat", {
        user_id: user.id,
        message: cleanMessage,
      });

      const aiReply = response.data.reply || "";

      setReply(aiReply);

      if (aiReply) {
        Speech.speak(aiReply);
      }
    } catch (error: any) {
      console.log("AI ERROR:", error?.response?.data || error?.message);

      Alert.alert(
        "AI Error",
        JSON.stringify(error?.response?.data || error?.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Neuro Assistant</Text>
        <Text style={styles.subtitle}>
          Free companion intelligence for memories, reminders, medicines, and contacts.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.mic,
          listening && styles.activeMic,
          !voiceAvailable && styles.disabledMic,
        ]}
        onPress={startListening}
      >
        <Ionicons
          name={voiceAvailable ? "mic" : "keypad"}
          size={42}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <Text style={styles.status}>
        {listening
          ? "Listening..."
          : voiceAvailable
            ? "Tap microphone to speak"
            : "Voice is unavailable in this build. Type below."}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ask summary, add reminder, or save a memory..."
        value={manualText}
        onChangeText={setManualText}
        multiline
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => sendToAI(manualText)}
        disabled={loading}
      >
        <Text style={styles.sendText}>
          {loading ? "Thinking..." : "Ask Assistant"}
        </Text>
      </TouchableOpacity>

      <View style={styles.suggestions}>
        {[
          "summary",
          "remember my doctor is Rao",
          "remind me take medicine tomorrow at 8 am",
        ].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.suggestionChip}
            onPress={() => setManualText(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>You Said</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>{text || manualText || "-"}</Text>
      </View>

      <Text style={styles.label}>Assistant Reply</Text>

      <View style={[styles.card, styles.replyCard]}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.cardText}>{reply || "-"}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 18,
  },

  headerIcon: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    marginBottom: 14,
    width: 52,
  },

  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#64748B",
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },

  mic: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#2563EB",
    borderRadius: 70,
    height: 140,
    justifyContent: "center",
    width: 140,
  },

  activeMic: {
    backgroundColor: "#16A34A",
  },

  disabledMic: {
    backgroundColor: "#94A3B8",
  },

  status: {
    color: "#64748B",
    lineHeight: 21,
    marginBottom: 20,
    marginTop: 15,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 15,
    minHeight: 82,
    padding: 15,
    textAlignVertical: "top",
  },

  sendButton: {
    backgroundColor: "#2563EB",
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  suggestionChip: {
    backgroundColor: "#E0F2FE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  suggestionText: {
    color: "#075985",
    fontSize: 12,
    fontWeight: "700",
  },

  label: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    minHeight: 70,
    padding: 15,
  },

  cardText: {
    color: "#334155",
    lineHeight: 21,
  },

  replyCard: {
    backgroundColor: "#DBEAFE",
  },
});
