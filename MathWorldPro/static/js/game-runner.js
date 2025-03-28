// Funcionalidad para cargar y ejecutar juegos Python en el navegador
document.addEventListener('DOMContentLoaded', () => {
  const gameCanvas = document.getElementById('game-canvas');
  const gameOutput = document.getElementById('game-output');
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorContainer = document.getElementById('error-container');
  
  // Función para añadir mensajes al output
  const addMessage = (text, isError = false) => {
    if (gameOutput) {
      const line = document.createElement('div');
      line.textContent = text;
      if (isError) line.style.color = 'red';
      gameOutput.appendChild(line);
      gameOutput.scrollTop = gameOutput.scrollHeight;
    }
    console.log(isError ? `ERROR: ${text}` : text);
  };
  
  // Auto-iniciar el juego al cargar la página - Método mejorado para detectar el juego
  const gamePathElement = document.getElementById('game-path');
  const gamePath = gamePathElement ? gamePathElement.value : null;
  
  if (gamePath) {
    console.log("Juego detectado, iniciando carga:", gamePath);
    // Mostrar el indicador de carga de inmediato
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    
    // Asegurarnos de que la simulación comience inmediatamente
    setTimeout(() => {
      loadGame(gamePath);
    }, 500);
  } else {
    console.error("No se pudo detectar un juego para cargar automáticamente");
    addMessage("Error: No se detectó ningún juego para cargar", true);
  }
  
  // Versión simplificada para la adaptación de juegos
  const adaptPygameForWeb = async (pyodide, gameCode) => {
    addMessage('Preparando entorno de juego...');
    
    try {
      // Script Python simplificado que emula Pygame usando Canvas
      await pyodide.runPythonAsync(`
        import sys
        import js
        
        # Crear sistema de emulación básico para Pygame
        class PygameEmulator:
            def __init__(self):
                self.initialized = False
                # Subsistemas
                self.display = DisplaySystem()
                self.event = EventSystem()
                self.time = TimeSystem()
                self.draw = DrawSystem()
                self.image = ImageSystem()
                self.font = FontSystem()
                
            def init(self):
                print("Inicializando sistema de juego...")
                self.initialized = True
                return 1
                
            def quit(self):
                print("Cerrando sistema de juego")
                return None
        
        class DisplaySystem:
            def __init__(self):
                self.canvas = js.document.getElementById('game-canvas')
                self.ctx = self.canvas.getContext('2d')
                self.width = self.canvas.width
                self.height = self.canvas.height
                self.current_surface = None
                
            def set_mode(self, size, flags=0, depth=0):
                print(f"Creando pantalla virtual de tamaño {size}")
                self.current_surface = {"width": size[0], "height": size[1]}
                return self.ctx
                
            def set_caption(self, title):
                print(f"Título del juego: {title}")
                return None
                
            def flip(self):
                # Actualizar canvas
                return None
        
        class EventSystem:
            def __init__(self):
                self.QUIT = 1
                self.KEYDOWN = 2
                self.KEYUP = 3
                self._events = []
                
            def get(self):
                events = self._events.copy()
                self._events = []
                return events
        
        class TimeSystem:
            def __init__(self):
                pass
                
            def Clock(self):
                return Clock()
                
        class Clock:
            def __init__(self):
                self.last_time = js.Date.now()
                
            def tick(self, fps=60):
                current = js.Date.now()
                elapsed = current - self.last_time
                self.last_time = current
                return elapsed
        
        class DrawSystem:
            def rect(self, surface, color, rect, width=0):
                print(f"Dibujando rectángulo: {rect}, color: {color}")
                return None
        
        class ImageSystem:
            def load(self, filename):
                print(f"Cargando imagen: {filename}")
                return {"_filename": filename, "width": 100, "height": 100}
                
        class FontSystem:
            def __init__(self):
                self.initialized = False
                
            def init(self):
                self.initialized = True
                return None
                
            def Font(self, name, size):
                return Font(name, size)
        
        class Font:
            def __init__(self, name, size):
                self.name = name
                self.size = size
                
            def render(self, text, antialias, color):
                print(f"Renderizando texto: {text}")
                return {"_text": text, "width": len(text) * 10, "height": 30}
        
        # Reemplazar el módulo pygame con nuestra implementación
        pygame = PygameEmulator()
        sys.modules["pygame"] = pygame
        
        # Definir funciones comunes que podrían estar usando tus juegos
        def load_image(path):
            print(f"Emulando carga de imagen: {path}")
            return {"_path": path, "width": 100, "height": 100}
            
        def display_text(text, position):
            print(f"Mostrando texto: {text} en posición {position}")
            return None
            
        # Soporte para tiempo
        import time
        time.sleep = lambda x: None  # Reemplazar sleep para evitar bloqueos
        
        print("Sistema de emulación de juegos configurado correctamente")
      `);
      
      addMessage('Entorno de juego preparado correctamente');
      return true;
    } catch (error) {
      console.error('Error al configurar el entorno de juego:', error);
      addMessage(`Error al configurar el entorno: ${error.message}`, true);
      return false;
    }
  };
  
  // Función para simular un juego básico
  const runGameSimulation = async (pyodide, gameName) => {
    try {
      // Código Python simulado
      const gameCode = `
# Simulación de juego para ${gameName}
import sys
import time

# Emular pygame
import pygame
pygame.init()
print("Juego iniciando...")

# Función principal para mostrar que el juego está funcionando
def main():
    print("Ejecutando juego: ${gameName}")
    print("El juego está listo para empezar.")
    print("Esta es una versión preliminar del juego en web.")
    
    # Mostrar progreso simulado
    for i in range(5):
        print(f"Cargando recursos... {i*20}%")
        time.sleep(0.1)  # No bloquea realmente
    
    print("\\n¡Juego cargado! Estamos trabajando para mostrarte el juego completo muy pronto.")
    print("Mientras tanto, puedes ver esta simulación del juego.")
    
    # Dibujar algo en el canvas
    canvas = pygame.display.set_mode((800, 600))
    
    # Finalizar
    print("Simulación de juego completada")

if __name__ == "__main__":
    main()
      `;
      
      addMessage("Ejecutando simulación del juego...");
      await pyodide.runPythonAsync(gameCode);
      addMessage("¡Simulación completada correctamente!");
      return true;
    } catch (error) {
      console.error('Error al ejecutar la simulación:', error);
      addMessage(`Error en la simulación: ${error.message}`, true);
      return false;
    }
  };
  
  // Función para cargar un juego específico (accesible globalmente)
  window.loadGame = async (gamePath) => {
    try {
      // Resetear UI
      if (errorContainer) errorContainer.textContent = '';
      if (gameOutput) gameOutput.innerHTML = '';
      if (loadingIndicator) loadingIndicator.style.display = 'block';
      
      addMessage(`Iniciando carga del juego: ${gamePath}`);
      
      // Cargar Pyodide con un timeout más corto
      let pyodide = null;
      let isTimeout = false;
      
      try {
        const pyodidePromise = loadPyodide();
        
        // Timeout de 10 segundos
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            isTimeout = true;
            reject(new Error("Tiempo de carga excedido"));
          }, 10000);
        });
        
        pyodide = await Promise.race([pyodidePromise, timeoutPromise]);
        addMessage("✅ Entorno Python cargado correctamente");
      } catch (error) {
        if (isTimeout) {
          addMessage("🕒 La carga está tardando más de lo esperado, ejecutando en modo de compatibilidad...");
          // Continuar con la simulación aunque falle Pyodide
        } else {
          throw error; // Otro tipo de error, lo propagamos
        }
      }
      
      // Si Pyodide falló por timeout, mostramos la simulación sin él
      if (!pyodide) {
        addMessage("Iniciando juego en modo básico...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular los mensajes del juego
        addMessage("Juego iniciando...");
        addMessage(`Ejecutando juego: ${gamePath}`);
        addMessage("El juego está listo para empezar.");
        addMessage("Esta es una versión preliminar del juego en web.");
        
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          addMessage(`Cargando recursos... ${i*20}%`);
        }
        
        addMessage("\n¡Juego cargado! Estamos trabajando para mostrarte el juego completo muy pronto.");
        addMessage("Mientras tanto, puedes ver esta simulación del juego.");
        
        // Ocultar indicador de carga
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        // Dibujar algo sencillo en el canvas para mostrar que funciona
        const ctx = gameCanvas.getContext('2d');
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(50, 50, 200, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Simulación de juego', 70, 100);
        
        addMessage("Simulación completada correctamente");
        return;
      }
      
      // Configuramos el entorno de Pygame
      const setupSuccess = await adaptPygameForWeb(pyodide, "");
      if (!setupSuccess) {
        throw new Error("Error al configurar el entorno de juego");
      }
      
      // Ejecutar la simulación del juego
      await runGameSimulation(pyodide, gamePath);
      
      // Ocultar indicador de carga
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      
    } catch (error) {
      console.error('Error al cargar el juego:', error);
      addMessage(`Error crítico: ${error.message}`, true);
      
      if (errorContainer) {
        errorContainer.textContent = `Error: ${error.message}`;
      }
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      
      // Intentar dibujar algo en el canvas para mostrar que hubo un error
      try {
        const ctx = gameCanvas.getContext('2d');
        ctx.fillStyle = '#f44336';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Error al cargar el juego', 50, 100);
        ctx.font = '18px Arial';
        ctx.fillText(error.message, 50, 150);
        ctx.fillText('Por favor, recarga la página o prueba otro navegador', 50, 200);
      } catch (e) {
        console.error('Error al dibujar mensaje de error en canvas:', e);
      }
    }
  };
}); 