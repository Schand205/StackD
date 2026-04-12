import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_BASE_URL, APP_VERSION } from "@/constants/app";

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.block}>
        <ThemedText type="title">Explore</ThemedText>
        <ThemedText>
          Hier kannst du später Features, Listen oder API-Daten ergänzen.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.block}>
        <ThemedText type="subtitle">App-Konfiguration</ThemedText>
        <ThemedText>Version: {APP_VERSION}</ThemedText>
        <ThemedText>API: {API_BASE_URL}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  block: {
    gap: 8,
  },
});
