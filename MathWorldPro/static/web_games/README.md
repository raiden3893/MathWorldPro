# Instrucciones para embeber juegos de Python en el navegador

Este documento explica cómo convertir juegos de Python (especialmente los que usan Pygame) en versiones web que se pueden ejecutar directamente en el navegador sin necesidad de ventanas externas.

## Requisitos previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Juegos desarrollados con Pygame (recomendado) o librería gráfica compatible

## Método 1: Usando Pygbag (Recomendado para juegos Pygame)

[Pygbag](https://pygame-web.github.io/pygbag/) es una herramienta que permite empaquetar juegos Pygame para que funcionen en navegadores web mediante WebAssembly.

### Instalación

```bash
pip install pygbag
```

### Convertir un juego

1. Asegúrate de que tu juego Pygame funciona correctamente en modo local
2. Tu juego debe tener un archivo principal (por ejemplo, `main.py`)
3. Para la mejor compatibilidad, sigue las recomendaciones de Pygbag:
   - Usa bucle de juego async (ver ejemplo abajo)
   - Limita el uso de módulos externos
   - Organiza recursos en carpetas relativas

4. Convierte el juego:

```bash
pygbag ruta/a/tu/carpeta/del/juego
```

5. Los archivos generados se crearán en una carpeta `build/web`
6. Copia estos archivos a la carpeta correspondiente en `static/web_games/nombre-del-juego/`

### Ejemplo de estructura de juego compatible con Pygbag

```python
import asyncio
import pygame

async def main():
    pygame.init()
    screen = pygame.display.set_mode((800, 600))
    clock = pygame.time.Clock()
    
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        
        # Lógica del juego
        
        pygame.display.flip()
        await asyncio.sleep(0)  # Importante para compatibilidad web
    
    pygame.quit()

asyncio.run(main())
```

## Método 2: Usando Pyodide (Para juegos no-Pygame)

[Pyodide](https://pyodide.org/) es un port de Python a WebAssembly que permite ejecutar código Python directamente en el navegador.

### Pasos para implementar:

1. Crea un HTML que cargue Pyodide y tu código Python
2. Adapta tu código para funcionar con canvas web en lugar de ventanas nativas
3. Coordina la comunicación JavaScript-Python

Ejemplo básico de HTML+JavaScript para cargar Python:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js"></script>
</head>
<body>
    <canvas id="pythonCanvas" width="800" height="600"></canvas>
    
    <script>
        async function main() {
            let pyodide = await loadPyodide();
            await pyodide.loadPackagesFromImports(`
                import micropip
                await micropip.install('numpy')
            `);
            
            // Crear contexto para el juego
            const canvas = document.getElementById('pythonCanvas');
            pyodide.globals.set('canvas', canvas);
            
            // Ejecutar el código Python
            await pyodide.runPythonAsync(`
                # Tu código Python aquí
                # Usando el canvas desde JavaScript
            `);
        }
        main();
    </script>
</body>
</html>
```

## Notas importantes

- Ambos enfoques tienen limitaciones. No todos los módulos de Python funcionan en el navegador.
- Para juegos que usan Tkinter, considera reescribirlos con Pygame primero.
- Las versiones web pueden ser más lentas que las nativas.
- La primera carga puede tomar tiempo ya que se descarga el intérprete Python.

## Solución de problemas

- Si el juego no carga, verifica la consola del navegador (F12) para ver errores.
- Problemas comunes:
  - Módulos no disponibles en Pyodide/Pygbag
  - Rutas de archivos incorrectas (usa rutas relativas)
  - Problemas de compatibilidad con el navegador

## Enlaces útiles

- [Documentación de Pygbag](https://pygame-web.github.io/pygbag/index.html)
- [Documentación de Pyodide](https://pyodide.org/en/stable/)
- [Ejemplos de juegos Pygame en la web](https://pygame-web.github.io/showroom/) 