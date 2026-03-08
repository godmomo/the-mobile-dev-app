import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { withRetry } from '@/utils/retry';

export default function CounterState() {
  const { state, incrementCounter, decrementCounter, resetCounter } = useApp();
  const { showToast } = useToast();
  const [text, setText] = useState<string>('');
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requestProgress, setRequestProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const requestIntervalRef = useRef<number | undefined>(undefined);
  const isPausedRef = useRef<boolean>(isPaused);

  useEffect(() => {
    const loadText = async () => {
      try {
        const savedText = await AsyncStorage.getItem('notepadText');
        if (savedText !== null) {
          setText(savedText);
        }
      } catch (error) {
        console.error('Error loading text:', error);
      }
    };
    loadText();
  }, []);

  // Auto-save text whenever it changes (debounced)
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (text !== '') {
        AsyncStorage.setItem('notepadText', text).catch(err => 
          console.error('Auto-save error:', err)
        );
      }
    }, 1000); // Save after 1 second of no typing

    return () => clearTimeout(saveTimeout);
  }, [text]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        if (isLoading && isPaused) {
          setIsPaused(false);
          console.log('Request resumed!');
        }
      } else if (nextAppState === 'background') {
        console.log('App is in background!');
        saveText();
        if (isLoading) {
          setIsPaused(true);
          console.log('Request paused!');
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const saveText = async () => {
    try {
      await AsyncStorage.setItem('notepadText', text);
      console.log('Text saved!');
      showToast('Notes saved!', 'success');
    } catch (error) {
      console.error('Error saving text:', error);
      showToast('Failed to save notes', 'error');
    }
  };

  const simulateNetworkCall = async (): Promise<string> => {
    const shouldFail = Math.random() < 0.3;
    if (shouldFail) {
      throw new Error('Network request failed');
    }
    return 'Success';
  };

  const startRequest = async () => {
    setIsLoading(true);
    setRequestProgress(0);
    
    try {
      await withRetry(simulateNetworkCall, {
        maxRetries: 3,
        delayMs: 1000,
        onRetry: (attempt: number, error: Error) => {
          setRequestProgress(0);
          showToast(`Retry attempt ${attempt}...`, 'info');
          console.log(`Retry attempt ${attempt}: ${error.message}`);
        }
      });
      showToast('Request successful!', 'success');
      setIsLoading(false);
    } catch (error) {
      showToast('Request failed after 3 retries', 'error');
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Counter Section */}
      <ThemedView style={styles.counterContainer}>
        <ThemedText type="title">Counter</ThemedText>
        <Text style={styles.counterValue}>
          {String(state.counter)}
        </Text>
        <View style={styles.counterButtons}>
          <TouchableOpacity style={styles.counterButton} onPress={decrementCounter}>
            <ThemedText style={styles.counterButtonText}>-</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.counterButton} onPress={resetCounter}>
            <ThemedText style={styles.counterButtonText}>Reset</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.counterButton} onPress={incrementCounter}>
            <ThemedText style={styles.counterButtonText}>+</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText type="default">Try changing the counter and restarting the app!</ThemedText>
      </ThemedView>

      {/* Notepad Section */}
      <TextInput
        multiline
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Type your notes here..."
      />
      <Button
        title={isLoading ? 'Request in Progress' : 'Simulate Network Request'}
        onPress={startRequest}
        disabled={isLoading}
      />
      {isLoading && <Text>Progress: {requestProgress}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  counterContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  counterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  counterButton: {
    backgroundColor: '#1D3D47',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
});

