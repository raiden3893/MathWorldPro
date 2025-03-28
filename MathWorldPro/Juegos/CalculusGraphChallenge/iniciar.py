import pygame
import sys
import time
import traceback
import os

print(f"Directorio actual: {os.getcwd()}")
print("Verificando módulos instalados...")
try:
    import pygame
    print(f"Pygame: {pygame.version.ver}")
    import numpy
    print(f"Numpy: {numpy.__version__}")
    import matplotlib
    print(f"Matplotlib: {matplotlib.__version__}")
except ImportError as e:
    print(f"Error de importación: {e}")
    
print("\nIniciando juego en 2 segundos...")
time.sleep(2)

try:
    # Iniciar pygame
    pygame.init()
    
    # Crear ventana pequeña
    ANCHO = 800
    ALTO = 600
    
    # Obtener dimensiones de la pantalla para centrar la ventana
    info_pantalla = pygame.display.Info()
    ancho_pantalla = info_pantalla.current_w
    alto_pantalla = info_pantalla.current_h
    
    # Calcular posición central
    pos_x = (ancho_pantalla - ANCHO) // 2
    pos_y = (alto_pantalla - ALTO) // 2
    
    # Establecer posición de la ventana
    os.environ['SDL_VIDEO_WINDOW_POS'] = f"{pos_x},{pos_y}"
    
    ventana = pygame.display.set_mode((ANCHO, ALTO))
    pygame.display.set_caption("Juego de Cálculo Diferencial")
    
    # Importar Game después de inicializar pygame
    from game import Game
    
    # Crear instancia del juego
    juego = Game(ventana)
    juego.width = ANCHO
    juego.height = ALTO
    
    # Temporizador para medir el tiempo de ejecución
    inicio = time.time()
    
    # Ciclo principal
    ejecutando = True
    clock = pygame.time.Clock()
    
    print("¡Juego iniciado!")
    
    contador_frames = 0
    while ejecutando:
        # Procesar eventos
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                ejecutando = False
            elif evento.type == pygame.KEYDOWN:
                if evento.key == pygame.K_ESCAPE:
                    ejecutando = False
                    
            juego.handle_event(evento)
            
        # Actualizar juego
        juego.update()
        
        # Dibujar
        juego.draw()
        
        # Actualizar pantalla
        pygame.display.flip()
        
        # Controlar FPS
        clock.tick(60)
        
        # Contar frames
        contador_frames += 1
        if contador_frames % 100 == 0:
            tiempo_actual = time.time() - inicio
            print(f"Tiempo de ejecución: {tiempo_actual:.1f} segundos, Frames: {contador_frames}, FPS: {contador_frames/tiempo_actual:.1f}")
    
    # Salir
    tiempo_total = time.time() - inicio
    print(f"Juego finalizado. Tiempo total: {tiempo_total:.1f} segundos. Frames: {contador_frames}")
    pygame.quit()
    
except Exception as e:
    print(f"¡ERROR EN EL JUEGO!")
    print(f"Tipo de error: {type(e).__name__}")
    print(f"Mensaje: {e}")
    traceback.print_exc()
    
print("Programa terminado.") 