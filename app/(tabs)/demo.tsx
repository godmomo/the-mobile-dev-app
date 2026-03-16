import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { tasks } from '@/lib/database';

interface TaskDemo {
  id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export default function Demo() {
  const router = useRouter();
  const { state } = useApp();
  const { showToast } = useToast();
  const [demoTasks, setDemoTasks] = useState<TaskDemo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await tasks.getAll();
      setDemoTasks(allTasks);
      showToast(`Loaded ${allTasks.length} tasks`, 'info');
    } catch (error) {
      showToast('Error loading tasks', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleTask = async () => {
    try {
      await tasks.create({ title: `Sample Task ${Date.now()}` });
      showToast('Task created!', 'success');
      loadTasks();
    } catch (error) {
      showToast('Error creating task', 'error');
      console.error(error);
    }
  };

  const toggleFirstTask = async () => {
    if (demoTasks.length === 0) {
      showToast('No tasks to toggle', 'info');
      return;
    }
    try {
      const firstTask = demoTasks[0];
      await tasks.update(firstTask.id, { completed: firstTask.completed === 0 ? 1 : 0 });
      showToast('Task toggled!', 'success');
      loadTasks();
    } catch (error) {
      showToast('Error toggling task', 'error');
      console.error(error);
    }
  };

  const deleteAllTasks = async () => {
    try {
      for (const task of demoTasks) {
        await tasks.delete(task.id);
      }
      setDemoTasks([]);
      showToast('All tasks deleted!', 'success');
    } catch (error) {
      showToast('Error deleting tasks', 'error');
      console.error(error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const renderTask = ({ item }: { item: TaskDemo }) => (
    <View style={styles.taskItem}>
      <Text style={[styles.taskTitle, item.completed === 1 && styles.completedTask]}>
        {item.title} {item.completed === 1 ? '(✓)' : '( )'}
      </Text>
      <Text style={styles.taskDate}>{item.created_at.slice(0, 16)}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'SQLite Demo' }} />
      <View style={styles.container}>
        <Text style={styles.title}>SQLite CRUD Demo</Text>
        {loading ? (
          <Text>Loading tasks...</Text>
        ) : (
          <FlatList
            data={demoTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTask}
            style={styles.taskList}
            ListEmptyComponent={<Text style={styles.emptyText}>No tasks. Add some!</Text>}
          />
        )}
        <TouchableOpacity style={styles.button} onPress={addSampleTask}>
          <Text style={styles.buttonText}>➕ Add Sample Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleFirstTask} disabled={demoTasks.length === 0}>
          <Text style={styles.buttonText}>🔄 Toggle First Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={deleteAllTasks} disabled={demoTasks.length === 0}>
          <Text style={styles.buttonText}>🗑️ Delete All Tasks</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskList: {
    flex: 1,
    marginBottom: 16,
  },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    padding: 20,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

