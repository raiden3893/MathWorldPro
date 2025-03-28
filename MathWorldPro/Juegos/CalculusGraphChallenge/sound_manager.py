import pygame
import os
import numpy as np

class SoundManager:
    def __init__(self):
        pygame.mixer.init()
        self.sounds = {}
        self.load_sounds()
        
    def load_sounds(self):
        # Definir efectos de sonido básicos usando pygame.mixer.Sound
        sample_rate = 44100
        duration = 0.1  # segundos
        
        # Sonido de acierto (frecuencia ascendente)
        correct_buffer = self.generate_sound(440, 880, duration, sample_rate)
        self.sounds['correct'] = pygame.mixer.Sound(buffer=correct_buffer)
        
        # Sonido de error (frecuencia descendente)
        wrong_buffer = self.generate_sound(440, 220, duration, sample_rate)
        self.sounds['wrong'] = pygame.mixer.Sound(buffer=wrong_buffer)
        
        # Sonido de click
        click_buffer = self.generate_sound(440, 440, 0.05, sample_rate)
        self.sounds['click'] = pygame.mixer.Sound(buffer=click_buffer)
        
        # Sonido de powerup
        powerup_buffer = self.generate_sound(440, 660, 0.15, sample_rate)
        self.sounds['powerup'] = pygame.mixer.Sound(buffer=powerup_buffer)
        
        # Crear la música de fondo
        background_buffer = self.generate_background_music(sample_rate)
        self.sounds['background'] = pygame.mixer.Sound(buffer=background_buffer)
        
        # Ajustar volumen
        for sound in self.sounds.values():
            sound.set_volume(0.3)
            
    def generate_sound(self, start_freq, end_freq, duration, sample_rate):
        t = np.linspace(0, duration, int(sample_rate * duration))
        frequencies = np.linspace(start_freq, end_freq, len(t))
        
        # Generar onda sinusoidal con frecuencia variable
        samples = np.sin(2 * np.pi * frequencies * t)
        
        # Aplicar envolvente ADSR simple
        envelope = np.linspace(0, 1, len(t))
        envelope = np.minimum(envelope * 10, 1.0) * np.exp(-2 * t)
        
        # Aplicar envolvente y normalizar
        samples = samples * envelope
        samples = np.int16(samples * 32767)
        
        return samples
    
    def generate_background_music(self, sample_rate):
        # Duración de la música de fondo
        duration = 4.0  # segundos
        num_samples = int(duration * sample_rate)
        
        # Crear un buffer para los datos de audio (estéreo)
        buffer = np.zeros((num_samples, 2), dtype=np.float32)
        
        # Generar un arreglo de tiempo
        t = np.linspace(0, duration, num_samples)
        
        # Generar una melodía simple con armonía
        tone1 = 0.3 * np.sin(2 * np.pi * 440 * t)  # Nota A
        tone2 = 0.2 * np.sin(2 * np.pi * 330 * t)  # Nota E
        tone3 = 0.15 * np.sin(2 * np.pi * 262 * t)  # Nota C
        
        # Combinar los tonos
        combined = tone1 + tone2 + tone3
        
        # Aplicar un envolvente para suavizar principio y final
        envelope = np.ones_like(t)
        attack = int(0.1 * num_samples)
        release = int(0.2 * num_samples)
        envelope[:attack] = np.linspace(0, 1, attack)
        envelope[-release:] = np.linspace(1, 0, release)
        
        combined = combined * envelope
        
        # Convertir a formato estéreo
        buffer[:, 0] = combined
        buffer[:, 1] = combined
        
        # Normalizar y convertir a int16
        return np.int16(buffer * 32767)
        
    def play(self, sound_name):
        if sound_name in self.sounds:
            self.sounds[sound_name].play()
            
    def play_background_music(self):
        try:
            if 'background' in self.sounds:
                self.sounds['background'].play(-1)  # Reproducir en bucle
                self.sounds['background'].set_volume(0.2)  # Volumen bajo para música de fondo
                print("Reproduciendo música de fondo generada")
            else:
                print("No se pudo cargar la música de fondo")
        except Exception as e:
            print(f"Error al reproducir música de fondo: {e}")
