import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Demo() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen options={{ title: 'Demo' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Demo Page</Text>
        <Text style={styles.content}>This is a simple demo page with plain text content.</Text>
        <Text style={styles.content}>Navigate back to see the tabs index screen.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <Text style={styles.backButtonText}>Go Back to Homepage</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#1D3D47',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

