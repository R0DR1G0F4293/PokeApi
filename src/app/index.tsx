import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';



export default function Index() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const player = useAudioPlayer(null);


  const reproducirAudio = (item) => {
    const audioUrl = item.cries?.latest;

    if (!audioUrl) {
      console.log('Este Pokémon no tiene audio disponible');
      return;
    }

    player.replace({ uri: audioUrl });
    player.play();
  };

  const [ciclando, setCiclando] = useState(false);
  const [repeticiones, setRepeticiones] = useState(0);

const iniciarCiclo = async (item) => {
  if (ciclando || !item.cries?.latest) return;

  setCiclando(true);
  setRepeticiones(0);

  try {
    for (let i = 1; i <= 1000; i++) {
      player.replace({ uri: item.cries.latest });
      player.play();

      setRepeticiones(i);

      // Esperar 1 segundo antes de la siguiente repetición
      await new Promise((resolve) => setTimeout(resolve, 670));
    }
  } catch (error) {
    console.error('Error al reproducir:', error);
  } finally {
    setCiclando(false);
  }
};
  useEffect(() => {
    const obtenerPokemon = async () => {
      try {
        const response = await fetch(
          'https://pokeapi.co/api/v2/pokemon?limit=300'
        );

        if (!response.ok) {
          throw new Error('No se pudieron obtener los Pokémon');
        }

        const data = await response.json();

        // Obtener los detalles de cada Pokémon
        const detalles = await Promise.all(
          data.results.map(async (item) => {
            const res = await fetch(item.url);
            if (!res.ok) {
              throw new Error('Error al cargar un Pokémon');
            }
            return await res.json();
          })
        );

        setPokemon(detalles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerPokemon();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text>Cargando Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Pokédex</Text>

      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.sprites.front_shiny,
              }}
              style={styles.image}
            />

            <Text style={styles.name}>
              {item.name.toUpperCase()}
            </Text>

            <Text style={styles.number}>
              N.º {item.id}
            </Text>
            <Button
              title="🔊 Escuchar"
              onPress={() => reproducirAudio(item)}
            />
            <Button
              title="🔁 Ciclo ×1000"
              onPress={() => iniciarCiclo(item)}
            />
            <Text>
              Reproducciones: {repeticiones} / 1000
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 55,
    paddingHorizontal: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 6,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  number: {
    marginTop: 4,
    color: '#666',
  },
});