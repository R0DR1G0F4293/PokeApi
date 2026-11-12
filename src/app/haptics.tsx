import { Link } from 'expo-router';
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Haptics from 'expo-haptics';

export default function HapticButton() {
  const [openBack, setOpenBack] = useState(false);
  const [openFront, setOpenFront] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleCameraPress = async (
    facing: 'front' | 'back'
  ) => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    if (facing === 'front') {
      setOpenFront(!openFront);
      setOpenBack(false);
    } else {
      setOpenBack(!openBack);
      setOpenFront(false);
    }
  };

  return (
    <View>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.text}>Vibrar</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => handleCameraPress('front')}
      >
        <Text style={styles.text}>
          {openFront ? 'Cerrar cámara frontal' : 'Abrir cámara frontal'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => handleCameraPress('back')}
      >
        <Text style={styles.text}>
          {openBack ? 'Cerrar cámara trasera' : 'Abrir cámara trasera'}
        </Text>
      </Pressable>
          {/* <Link href="/haptics" asChild>
            <Pressable style={styles.hapticsLink}>
              <Text style={styles.hapticsLinkText}>REGRESAR A LA POKEDEX</Text>
            </Pressable>
          </Link> */}
        
      {openBack && (
        <CameraView style={styles.camera} facing="back" />
      )}

      {openFront && (
        <CameraView style={styles.camera} facing="front" />
      )}
    </View>
    
  );


}



const styles = StyleSheet.create({
  button: {
    backgroundColor: '#222',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
   cameraContainer: {
    flex: 1,
    gap: 12,
  },
  camera: {
    flex: 1,
    minHeight: 300,
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

