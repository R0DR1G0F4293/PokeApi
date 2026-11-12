import { Link } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Index() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pokeCoins, setPokeCoins] = useState(1000);
  const [apuesta, setApuesta] = useState(100);
  const [resultado, setResultado] = useState(null);
  const [apostando, setApostando] = useState(false);

  const player = useAudioPlayer(null);

  useEffect(() => {
    let cancelado = false;

    const obtenerPokemon = async () => {
      try {
        const response = await fetch(
          'https://pokeapi.co/api/v2/pokemon?limit=30'
        );

        if (!response.ok) {
          throw new Error('No se pudieron obtener los Pokémon.');
        }

        const data = await response.json();

        const detalles = await Promise.all(
          data.results.map(async (item) => {
            const pokemonResponse = await fetch(item.url);

            if (!pokemonResponse.ok) {
              throw new Error('Error al cargar un Pokémon.');
            }

            const pokemonData = await pokemonResponse.json();
            const speciesResponse = await fetch(pokemonData.species.url);

            if (!speciesResponse.ok) {
              throw new Error('Error al obtener la descripción.');
            }

            const speciesData = await speciesResponse.json();
            const entrada = speciesData.flavor_text_entries.find(
              (entry) => entry.language.name === 'es'
            );

            return {
              ...pokemonData,
              descripcion:
                entrada?.flavor_text?.replace(/[\f\n\r]/g, ' ') ??
                'Descripción no disponible en español.',
            };
          })
        );

        if (!cancelado) {
          setPokemon(detalles);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'Ocurrió un error al cargar los Pokémon.');
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    obtenerPokemon();

    return () => {
      cancelado = true;
    };
  }, []);

  const reproducirAudio = (item) => {
    const audioUrl = item.cries?.latest;

    if (!audioUrl) {
      return;
    }

    player.replace({ uri: audioUrl });
    player.play();
  };

  const apostar = () => {
    if (apostando || apuesta <= 0 || apuesta > pokeCoins) {
      return;
    }

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
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Pokédex</Text>

      <Link href="/haptics" asChild>
        <Pressable style={styles.hapticsLink}>
          <Text style={styles.hapticsLinkText}>PROBAR HAPTICS</Text>
        </Pressable>
      </Link>

      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.casino}>
            <Text style={styles.casinoTitle}>Casino</Text>

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
              Probabilidad de ganar: 45%
            </Text>

            <Pressable
              style={[
                styles.jugarBtn,
                (apostando || apuesta > pokeCoins || pokeCoins <= 0) &&
                  styles.apuestaDeshabilitada,
              ]}
              disabled={
                apostando || apuesta > pokeCoins || pokeCoins <= 0
              }
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
                  { color: resultado.gana ? '#50a86b' : '#d94c60' },
                ]}
              >
                {resultado.texto}
              </Text>
            )}

            {pokeCoins === 0 && (
              <Text style={styles.info}>💸 ¡Estás en bancarrota!</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri:
                  item.sprites?.front_shiny ??
                  item.sprites?.front_default,
              }}
              style={styles.image}
            />

            <Text style={styles.name}>{item.name.toUpperCase()}</Text>
            <Text style={styles.number}>N.º {item.id}</Text>
            <Text style={styles.description}>{item.descripcion}</Text>

            {item.cries?.latest && (
              <Pressable
                style={styles.audioButton}
                onPress={() => reproducirAudio(item)}
              >
                <Text style={styles.audioButtonText}>▶ Escuchar sonido</Text>
              </Pressable>
            )}
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
    padding: 24,
  },
  error: {
    color: '#b00020',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
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
    textAlign: 'center',
  },
  number: {
    marginTop: 4,
    color: '#666',
  },
  description: {
    marginTop: 8,
    color: '#555',
    textAlign: 'center',
    fontSize: 12,
  },
  audioButton: {
    marginTop: 10,
    padding: 8,
  },
  audioButtonText: {
    color: '#C27C84',
    fontWeight: '600',
  },
  casino: {
    marginTop: 12,
    marginBottom: 12,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0E5E5',
    alignItems: 'center',
    elevation: 2,
  },
  casinoTitle: {
    color: '#4A4141',
    fontSize: 23,
    fontWeight: '600',
    marginBottom: 20,
  },
  saldoLabel: {
    color: '#A69A9A',
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  saldo: {
    color: '#C27C84',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 12,
    textAlign: 'center',
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
    backgroundColor: '#fff',
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
    color: '#fff',
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
  hapticsLink: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  hapticsLinkText: {
    color: '#C27C84',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
