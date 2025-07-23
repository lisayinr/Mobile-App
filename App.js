import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, TextInput, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const STORAGE_KEY = '@flashcards';

// Flashcard Screen where user can view, reveal, delete, or clear flashcards
function FlashcardScreen({navigation}) {
  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Load flashcards from async storage when screen first loads
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data !== null) {
          setFlashcards(JSON.parse(data));
        } else {
          // Default flashcards if none are saved yet
          setFlashcards([
            { question: 'This is a sample flashcard.\nPress "Reveal" to see the answer.', answer: 'Good job!\nNow you can add your own flashcards and delete this one.' },
          ]);
        }
      } catch (e) {
        Alert.alert('Error loading flashcards');
      }
    };
    loadFlashcards();
  }, []);

  // Go to the next flashcard
  const nextCard = () => {
    setShowAnswer(false);
    setIndex((prev) => (flashcards.length === 0 ? 0 : (prev + 1) % flashcards.length));
  };

  // Delete flashcard
  const deleteCard = async () => {
  if (flashcards.length === 0) return;

  const updatedCards = flashcards.filter((_, i) => i !== index);

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    setFlashcards(updatedCards);

    if (updatedCards.length === 0) {
      setIndex(0);
    } else {
      setIndex((prev) => (prev >= updatedCards.length ? 0 : prev));
    }

    setShowAnswer(false);
  } catch (e) {
    // Shows an alert if there is an error in deleting flashcard
    Alert.alert('Failed to delete flashcard.');
  }
};

// Clears all flashcards
const clearFlashcards = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setFlashcards([]);
    setIndex(0);
    setShowAnswer(false);
    Alert.alert('Flashcards cleared!');
  } catch (e) {
    Alert.alert('Failed to clear flashcards.');
  }
};

// Show buttons to reveal, go next, delete, or clear flashcards.
  return (
    <View style={styles.container}>
      {flashcards.length === 0 ? (
        <Text style={styles.noCards}>No flashcards available. Add some!</Text>
      ) : (
        <>
          <Text style={styles.question}>{flashcards[index].question}</Text>
          {showAnswer && <Text style={styles.answer}>{flashcards[index].answer}</Text>}
          <Button title={showAnswer ? 'Hide Answer' : 'Reveal Answer'} onPress={() => setShowAnswer(!showAnswer)} />
          <View style={{marginTop: 20}}>
            <Button title="Next Card" onPress={nextCard} />
          </View>
          <View style={{marginTop: 10}}>
            <Button title="Delete This Card" onPress={deleteCard} color="red" />
          </View>
          <View style={{marginTop: 20}}>
            <Button title="Clear All Flashcards" onPress={clearFlashcards} color="red" />
          </View>
        </>
      )}
      <View style={{marginTop: 40}}>
        <Button title="Add New Flashcard" onPress={() => navigation.navigate('AddFlashcard', {flashcards, setFlashcards})} />
      </View>
    </View>
  );
}

// Add Flashcard Screen lets  user type a question and answer, then saves the flashcard to storage
function AddFlashcardScreen({navigation, route}) {
  const {flashcards, setFlashcards} = route.params;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Save new flashcard to async storage
  const saveFlashcard = async () => {
    if (question.trim() === '' || answer.trim() === '') {
      Alert.alert('Please fill in both question and answer.');
      return;
    }

    const newFlashcards = [...flashcards, {question, answer}];

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFlashcards));
      setFlashcards(newFlashcards);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Failed to save flashcard.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Question:</Text>
      <TextInput
        style={styles.input}
        placeholder="Type question here"
        value={question}
        onChangeText={setQuestion}
      />
      <Text style={styles.label}>Enter Answer:</Text>
      <TextInput
        style={styles.input}
        placeholder="Type answer here"
        value={answer}
        onChangeText={setAnswer}
      />
      <Button title="Save Flashcard" onPress={saveFlashcard} />
    </View>
  );
}

// Sets up navigation between the flashcard and add flashcard screens
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Flashcards" component={FlashcardScreen} />
        <Stack.Screen name="AddFlashcard" component={AddFlashcardScreen} options={{title: 'Add Flashcard'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Design what the appearance and layout for the screens will be
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  question: {
    fontSize: 24,
    marginBottom: 20,
  },
  answer: {
    fontSize: 20,
    marginBottom: 20,
    color: 'blue',
  },
  noCards: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'gray',
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderColor: '#999',
    borderWidth: 1,
    padding: 8,
    fontSize: 16,
    borderRadius: 5,
  },
});
