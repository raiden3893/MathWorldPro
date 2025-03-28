import pygame
import os
from game import Game
import traceback
import sys
import time

def main():
    try:
        # Inicializar Pygame
        pygame.init()
        pygame.font.init()
        
        # Configurar pantalla
        SCREEN_WIDTH = 800
        SCREEN_HEIGHT = 600
        
        # Obtener dimensiones de la pantalla para centrar la ventana
        info_pantalla = pygame.display.Info()
        ancho_pantalla = info_pantalla.current_w
        alto_pantalla = info_pantalla.current_h
        
        # Calcular posición central
        pos_x = (ancho_pantalla - SCREEN_WIDTH) // 2
        pos_y = (alto_pantalla - SCREEN_HEIGHT) // 2
        
        # Establecer posición de la ventana
        os.environ['SDL_VIDEO_WINDOW_POS'] = f"{pos_x},{pos_y}"
        
        screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Prueba de Juego de Cálculo")
        
        # Crear instancia del juego e iniciar directamente en modo juego
        game = Game(screen)
        game.width = SCREEN_WIDTH
        game.height = SCREEN_HEIGHT
        game.state = "playing"  # Directo a modo juego
        game.reset_game()
        game.generate_new_round()
        
        print("¡Juego iniciado en modo 'playing'!")
        print("Presiona ESC para salir")
        
        # Loop principal
        running = True
        clock = pygame.time.Clock()
        
        while running:
            # Procesar eventos
            events = pygame.event.get()
            for event in events:
                if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                    running = False
                    print("Saliendo del juego...")
                game.handle_event(event)
            
            # Actualizar estado del juego
            game.update()
            
            # Dibujar en pantalla
            game.draw()
            
            # Actualizar pantalla
            pygame.display.flip()
            
            # Controlar velocidad
            clock.tick(60)
        
        print("Juego terminado")
        pygame.quit()
    except Exception as e:
        print(f"Error en el juego: {e}")
        print(f"Detalles del error:")
        traceback.print_exc()
        pygame.quit()
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main()) 