import pygame
import os
from game import Game
import traceback
import sys

def main():
    try:
        # Inicializar Pygame
        pygame.init()
        pygame.font.init()
        
        # Configurar pantalla (tamaño más pequeño)
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
        pygame.display.set_caption("Juego de Cálculo Diferencial")
        
        # Crear instancia del juego
        game = Game(screen)
        # Ajustar tamaño de juego
        game.width = SCREEN_WIDTH
        game.height = SCREEN_HEIGHT
        
        # Loop principal
        running = True
        clock = pygame.time.Clock()
        
        while running:
            events = pygame.event.get()
            for event in events:
                if event.type == pygame.QUIT:
                    running = False
                game.handle_event(event)
                
            game.update()
            game.draw()
            
            pygame.display.flip()
            clock.tick(60)
            
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