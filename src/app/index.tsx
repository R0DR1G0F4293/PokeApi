import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';



export default function Index() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const player = useAudioPlayer(null);
  const vibrar = async () => {
    await Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    );
  };

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
          'https://pokeapi.co/api/v2/pokemon?limit=30'
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

  const obtenerPokeDollars = async () => {
    try {
      const response = await fetch(
        'https://pokeapi.co/api/v2/currency/poke-dollar/'
      );

      if (!response.ok) {
        throw new Error('Error al obtener Poké Dollars');
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error al obtener la moneda:', error);
      return null;
    }
  };
  const [moneda, setMoneda] = useState(null);
  const [pokeCoins, setPokeCoins] = useState(1000);
  const [apuesta, setApuesta] = useState(100);
  const [resultado, setResultado] = useState(null);
  const [apostando, setApostando] = useState(false);
  const [descripciones, setDescripciones] = useState({});
  const apostar = () => {
    if (apostando || apuesta <= 0 || apuesta > pokeCoins) return;

    setApostando(true);
    setResultado(null);

    setTimeout(() => {
      const gana = Math.random() < 0.45;

      if (gana) {
        setPokeCoins((saldo) => saldo + apuesta);
        setResultado({
          gana: true,
          texto: `¡Ganaste ${apuesta * 2} PokéCoins! 🎉`,
        });
      } else {
        setPokeCoins((saldo) => saldo - apuesta);
        setResultado({
          gana: false,
          texto: `Perdiste ${apuesta} PokéCoins... 💀`,
        });
      }

      setApostando(false);
    }, 1000);
  };

  useEffect(() => {
    // obtenerPokeDollars().then(setMoneda);
  }, []);

  const obtenerDescripcion = async (pokemon) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`
      );

      if (!response.ok) {
        throw new Error('Error al obtener la descripción');
      }

      const data = await response.json();

      const entrada = data.flavor_text_entries.find(
        (item) => item.language.name === 'es'
      );

      return entrada?.flavor_text
        ?.replace(/\f|\n|\r/g, ' ')
        ?? 'Descripción no disponible en español.';
    } catch (error) {
      console.error('Error al obtener la descripción:', error);
      return 'No se pudo cargar la descripción.';
    }
  };

  const cargarDescripcion = async (pokemon) => {
    if (descripciones[pokemon.id]) return;

    const descripcion = await obtenerDescripcion(pokemon);

    setDescripciones((prev) => ({
      ...prev,
      [pokemon.id]: descripcion,
    }));
  };
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
      <Text>
        {moneda?.names?.find(
          (item) => item.language.name === 'es'
        )?.name ?? 'Poké Dollar'}
      </Text>



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


            <Text style={styles.description}>
              {descripciones[item.id] ?? ''}
            </Text>
            <Button
              title="🔊 Escuchar"
              onPress={() => reproducirAudio(item)}
            />
            <Button
              title="🔁 Ciclo ×1000"
              onPress={() => {
                iniciarCiclo(item);
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              }}
            />
            <Text>
              Reproducciones: {repeticiones} / 1000
            </Text>

          </View>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.casino}>
              <Text style={styles.casinoTitle}> Casino </Text>

              <Text style={styles.saldoLabel}>TU DINERO</Text>
              <Text style={styles.saldo}>
                🪙 {pokeCoins.toLocaleString()} PokéCoins
              </Text>

              <Text style={styles.label}>¿Cuánto quieres apostar?</Text>

              <View style={styles.apuestas}>
                {[50, 100, 250, 500].map((cantidad) => (
                  <Pressable
                    key={cantidad}
                    style={[
                      styles.apuestaBtn,
                      apuesta === cantidad && styles.apuestaActiva,
                      cantidad > pokeCoins && styles.apuestaDeshabilitada,
                    ]}
                    disabled={cantidad > pokeCoins || apostando}
                    onPress={() => setApuesta(cantidad)}
                  >
                    <Text style={styles.apuestaTexto}>{cantidad}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.info}>
                100% de probabilidad de ganar
              </Text>

              <Pressable
                style={[
                  styles.jugarBtn,
                  (apostando || apuesta > pokeCoins || pokeCoins <= 0) &&
                  styles.apuestaDeshabilitada,
                ]}
                disabled={apostando || apuesta > pokeCoins || pokeCoins <= 0}
                onPress={apostar}
              >
                <Text style={styles.jugarTexto}>
                  {apostando
                    ? '🎲 La ruleta está girando...'
                    : `APOSTAR ${apuesta} 🪙`}
                </Text>
              </Pressable>

              {resultado && (
                <Text
                  style={[
                    styles.resultado,
                    { color: resultado.gana ? '#50FA7B' : '#FF6B81' },
                  ]}
                >
                  {resultado.texto}
                </Text>
              )}

              {pokeCoins === 0 && (
                <Text style={styles.info}>
                  💸 ¡Estás en bancarrota!
                </Text>
              )}
            </View>
          </View>

        }



      />

    </View >
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



  casino: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E5E5',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  casinoTitle: {
    color: '#4A4141',
    fontSize: 23,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  saldoLabel: {
    color: '#A69A9A',
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  saldo: {
    color: '#C27C84',
    fontSize: 29,
    fontWeight: '700',
    marginVertical: 12,
  },
  label: {
    color: '#5F5555',
    marginTop: 16,
    marginBottom: 12,
    fontSize: 14,
  },
  apuestas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  apuestaBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9DEDE',
  },
  apuestaActiva: {
    backgroundColor: '#F8E9EB',
    borderColor: '#D9A0A6',
  },
  apuestaDeshabilitada: {
    opacity: 0.4,
  },
  apuestaTexto: {
    color: '#655858',
    fontSize: 14,
    fontWeight: '500',
  },
  info: {
    color: '#A69A9A',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  jugarBtn: {
    backgroundColor: '#C9878E',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  jugarTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 1,
  },
  resultado: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 18,
  },

});