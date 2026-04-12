import { ThemedText } from "@/components/themed-text";
import { APP_NAME } from "@/constants/app";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.background}>
      {/* Gradient als absoluter Hintergrund */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Glassmorphism Card */}
      <BlurView intensity={60} tint="light" style={styles.glassCard}>
        <View style={styles.glassInner}>
          <ThemedText type="title" style={styles.title}>
            {APP_NAME}
          </ThemedText>
          <View style={styles.divider} />
          <ThemedText style={styles.subtitle}>
            Dein React-Native Basisprojekt ist bereit.
          </ThemedText>

          <View style={styles.linkContainer}>
            <Link href="/(tabs)/explore" style={styles.glassButton}>
              <BlurView intensity={40} tint="light" style={styles.buttonBlur}>
                <ThemedText type="link" style={styles.linkText}>
                  Zur Explore-Seite →
                </ThemedText>
              </BlurView>
            </Link>

            <Link href="/modal" style={styles.glassButton}>
              <BlurView intensity={40} tint="light" style={styles.buttonBlur}>
                <ThemedText type="link" style={styles.linkText}>
                  Info als Modal öffnen →
                </ThemedText>
              </BlurView>
            </Link>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  glassCard: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  glassInner: {
    padding: 32,
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginVertical: 4,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 16,
    lineHeight: 22,
  },
  linkContainer: {
    gap: 12,
    marginTop: 8,
  },
  glassButton: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  buttonBlur: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  linkText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
