import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { withRetry } from '@/utils/retry';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Demo() {
  const router = useRouter();
  const { state } = useApp();
  const { showToast } = useToast();

  const handleTestNetworkRetry = async () => {
    showToast('Testing network retry (will fail 3 times then succeed)...', 'info');
    
    let attemptCount = 0;
    
    try {
      await withRetry(
        async () => {
          attemptCount++;
          // Simulate a network request that fails first 2 times
          if (attemptCount < 3) {
            throw new Error(`Network error - Attempt ${attemptCount} failed`);
          }
          return { success: true };
        },
        {
          maxRetries: 3,
          delayMs: 1000,
          onRetry: (attempt, error) => {
            showToast(`Retry attempt ${attempt} - ${error.message}`, 'error');
          }
        }
      );
      
      showToast('Network request succeeded after retries!', 'success');
    } catch (error) {
      showToast(`All retries failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleTestError = () => {
    // This will trigger the error boundary
    throw new Error('Test error triggered by user');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Demo' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Demo Page</Text>
        
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Persisted State (AsyncStorage):</Text>
          <Text style={styles.stateText}>Counter: {state.counter}</Text>
          <Text style={styles.stateText}>Username: {state.username}</Text>
          <Text style={styles.stateText}>Theme: {state.theme}</Text>
        </View>

        <Text style={styles.content}>This page demonstrates:</Text>
        <Text style={styles.listItem}>• Toast notifications</Text>
        <Text style={styles.listItem}>• Error boundary</Text>
        <Text style={styles.listItem}>• Network retry logic</Text>
        <Text style={styles.listItem}>• Persisted state with AsyncStorage</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleTestNetworkRetry}
        >
          <Text style={styles.buttonText}>Test Network Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.errorButton]} 
          onPress={handleTestError}
        >
          <Text style={styles.buttonText}>Trigger Test Error</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/')}
        >
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  stateContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  errorButton: {
    backgroundColor: '#F44336',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

