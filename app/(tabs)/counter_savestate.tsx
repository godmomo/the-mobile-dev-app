import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Button, Text, TextInput, View } from 'react-native';

export default function CounterState  () {
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
    } catch (error) {
      console.error('Error saving text:', error);
    }
  };

  const startRequest = () => {
    setIsLoading(true);
    setRequestProgress(0);
    setIsPaused(false);
    requestIntervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setRequestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(requestIntervalRef.current);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        multiline
        style={{ flex: 1, borderWidth: 1, padding: 10 }}
        value={text}
        onChangeText={setText}
      />
      <Button
        title={isLoading ? 'Request in Progress' : 'Simulate Network Request'}
        onPress={startRequest}
        disabled={isLoading}
      />
      {isLoading && <Text>Progress: {requestProgress}%</Text>}
    </View>
  );
};

