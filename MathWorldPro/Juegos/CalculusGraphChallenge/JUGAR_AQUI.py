"""
JUEGO DE CÁLCULO DIFERENCIAL
----------------------------

Instrucciones:
1. Este juego requiere las siguientes dependencias:
   - Python 3.x
   - Pygame
   - Numpy
   - Matplotlib

2. Para jugar:
   - Usa el mouse para interactuar con los botones y puertas
   - En el menú principal, haz clic en "Jugar" para comenzar
   - Selecciona la puerta que corresponde a la gráfica correcta
   - Presiona ESC para salir del juego en cualquier momento

3. Si el juego se cierra inesperadamente:
   - Asegúrate de tener todas las dependencias instaladas
   - Prueba con "pip install pygame numpy matplotlib"
   - Verifica que los archivos de iconos estén en la carpeta assets/

¡Diviértete!
"""

import sys
import os
import subprocess
import time

def verificar_dependencias():
    """Verifica que todas las dependencias estén instaladas"""
    dependencias = ["pygame", "numpy", "matplotlib"]
    faltantes = []
    
    for dep in dependencias:
        try:
            __import__(dep)
            print(f"✓ {dep} está instalado")
        except ImportError:
            faltantes.append(dep)
            print(f"✗ {dep} NO está instalado")
    
    return faltantes

def instalar_dependencias(deps):
    """Instala las dependencias faltantes"""
    if not deps:
        return True
    
    print("\nSe necesita instalar las siguientes dependencias:")
    for dep in deps:
        print(f"  - {dep}")
    
    respuesta = input("\n¿Deseas instalarlas ahora? (s/n): ")
    if respuesta.lower() != 's':
        return False
    
    print("\nInstalando dependencias...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + deps)
        print("Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError:
        print("Error al instalar dependencias")
        return False

def iniciar_juego():
    """Inicia el juego"""
    print("\nIniciando juego...")
    try:
        import pygame
        from game import Game
        
        # Inicializar Pygame
        pygame.init()
        pygame.font.init()
        
        # Obtener el tamaño de la pantalla del sistema
        info_pantalla = pygame.display.Info()
        ancho_pantalla = info_pantalla.current_w
        alto_pantalla = info_pantalla.current_h
        
        # Definir dimensiones del juego
        ancho_juego = 1024
        alto_juego = 768
        
        # Calcular posición para centrar la ventana
        pos_x = (ancho_pantalla - ancho_juego) // 2
        pos_y = (alto_pantalla - alto_juego) // 2
        
        # Configurar posición y tamaño de pantalla
        os.environ['SDL_VIDEO_WINDOW_POS'] = f"{pos_x},{pos_y}"
        screen = pygame.display.set_mode((ancho_juego, alto_juego))
        pygame.display.set_caption("Juego de Cálculo Diferencial")
        
        # Crear instancia del juego
        game = Game(screen)
        
        # Loop principal
        running = True
        clock = pygame.time.Clock()
        
        print("\n" + "-"*50)
        print("¡JUEGO INICIADO!")
        print("Usa el mouse para interactuar con los menús y puertas.")
        print("Presiona ESC para salir.")
        print("-"*50 + "\n")
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                game.handle_event(event)
                
            game.update()
            game.draw()
            
            pygame.display.flip()
            clock.tick(60)
            
        pygame.quit()
        print("\nJuego terminado.")
        return True
    except Exception as e:
        print(f"\nError al iniciar el juego: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "="*50)
    print("JUEGO DE CÁLCULO DIFERENCIAL")
    print("="*50 + "\n")
    
    # Verificar dependencias
    print("Verificando dependencias...")
    deps_faltantes = verificar_dependencias()
    
    if deps_faltantes:
        if not instalar_dependencias(deps_faltantes):
            print("\nNo se pudieron instalar todas las dependencias.")
            print("Por favor, instálalas manualmente con:")
            print(f"pip install {' '.join(deps_faltantes)}")
            input("\nPresiona Enter para salir...")
            return
    
    # Verificar archivos críticos
    if not os.path.exists("game.py"):
        print("\nERROR: No se encontró el archivo game.py")
        print("Asegúrate de estar en el directorio correcto del juego.")
        input("\nPresiona Enter para salir...")
        return
    
    # Iniciar juego
    iniciar_juego()
    
    # Despedida
    print("\nGracias por jugar.")
    input("\nPresiona Enter para salir...")

if __name__ == "__main__":
    main() 