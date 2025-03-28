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
        print("Pygame inicializado correctamente")
        pygame.font.init()
        print("Fuentes inicializadas correctamente")
        
        # Configurar pantalla
        SCREEN_WIDTH = 1024
        SCREEN_HEIGHT = 768
        
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
        print("Pantalla configurada correctamente")
        pygame.display.set_caption("Juego de Cálculo Diferencial")
        
        # Crear instancia del juego
        print("Creando instancia del juego...")
        game = Game(screen)
        print("Instancia del juego creada correctamente")
        
        # Loop principal
        running = True
        clock = pygame.time.Clock()
        frame_count = 0
        
        print("Iniciando bucle principal...")
        while running:
            # Procesar eventos
            events = pygame.event.get()
            for event in events:
                if event.type == pygame.QUIT:
                    print("Evento QUIT recibido")
                    running = False
                game.handle_event(event)
            
            # Si no hay eventos, el juego podría cerrarse inesperadamente
            if len(events) == 0 and frame_count % 60 == 0:
                print(f"Sin eventos, frame: {frame_count}")
            
            # Actualizar estado del juego
            game.update()
            
            # Dibujar en pantalla
            game.draw()
            
            # Actualizar pantalla
            pygame.display.flip()
            
            # Controlar velocidad
            clock.tick(60)
            
            # Contar frames
            frame_count += 1
            if frame_count % 60 == 0:
                print(f"Frame: {frame_count}, Estado: {game.state}")
            
            # Pequeña pausa para depuración
            if frame_count < 5:
                print(f"Frame {frame_count} completado")
                time.sleep(0.1)
            
        print("Bucle principal terminado")
        pygame.quit()
        print("Pygame cerrado correctamente")
    except Exception as e:
        print(f"Error en el juego: {e}")
        print(f"Detalles del error:")
        traceback.print_exc()
        pygame.quit()
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
