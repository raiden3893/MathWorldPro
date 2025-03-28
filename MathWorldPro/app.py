import os
import logging
from flask import Flask, render_template, jsonify, redirect, url_for, request, send_from_directory
import subprocess
import sys
import threading
import time

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "mundo_matematico_secreto")

# Diccionario para almacenar los procesos de juego
game_processes = {}

# Routes
@app.route('/')
def index():
    logger.info("Ruta principal / solicitada")
    return render_template('index.html')

@app.route('/exams')
def exams():
    logger.info("Ruta /exams solicitada")
    return render_template('exams.html')

@app.route('/games')
def games():
    """Mostrar juegos disponibles"""
    logger.info("Ruta /games solicitada")
    return render_template('web_games.html', games=get_available_games())

@app.route('/web-game-embed/<game_id>')
def web_game_embed(game_id):
    """Embeber juegos de Pygame usando Pygbag"""
    logger.info(f"Solicitando juego embebido: {game_id}")
    
    # Mapeo de juegos a URLs de Pygbag
    pygbag_urls = {
        'calculus-challenge': '/static/web_games/calculus-challenge/index.html',
        'graph-challenge': '/static/web_games/graph-challenge/index.html',
    }
    
    if game_id not in pygbag_urls:
        logger.error(f"Juego embebido no encontrado: {game_id}")
        return render_template('base.html', error="Juego no encontrado"), 404
    
    return render_template('game_embed.html', 
                          game_id=game_id,
                          game_url=pygbag_urls[game_id])

# Lista de juegos disponibles
def get_available_games():
    """Obtener lista de juegos disponibles"""
    return [
        {
            'id': 'calculus-challenge',
            'name': 'Calabozo de derivadas',
            'description': '¡Pon a prueba tu conocimiento de cálculo!',
            'image': '/static/images/game1.jpg',
            'embed_available': True,  # Indica si el juego tiene versión embebida
            'external_url': 'https://v0-calabozo-de-derivadas.vercel.app'  # URL externa del juego
        },
        {
            'id': 'graph-challenge',
            'name': 'MathRunner',
            'description': 'Juego de identificación de gráficas con puertas donde pones a prueba tu conocimiento visual',
            'image': '/static/images/game2.jpg',
            'embed_available': True  # Indica si el juego tiene versión embebida
        }
    ]

@app.route('/run-game/<game_id>')
def run_game(game_id):
    """Ejecutar juego directamente con Python"""
    logger.info(f"Ejecutando juego: {game_id}")
    
    # Mapeo de identificadores de juego a archivos Python
    game_files = {
        'calculus-challenge': {
            'dir': 'ProyectoCalculo - copia - copia 90% listo',
            'file': 'VideoJuego.py'
        },
        'graph-challenge': {
            'dir': 'CalculusGraphChallenge',
            'file': 'JUGAR_AQUI.py'
        }
    }
    
    if game_id not in game_files:
        logger.error(f"Juego no encontrado: {game_id}")
        return render_template('base.html', error="Juego no encontrado"), 404
    
    game_info = game_files[game_id]
    game_path = os.path.join('Juegos', game_info['dir'], game_info['file'])
    
    if not os.path.exists(game_path):
        logger.error(f"Archivo de juego no encontrado: {game_path}")
        return render_template('base.html', error=f"Archivo de juego no encontrado: {game_path}"), 404
    
    try:
        # Ejecutar el juego en un proceso separado
        if game_id in game_processes and game_processes[game_id].poll() is None:
            # El juego ya está en ejecución
            logger.info(f"El juego {game_id} ya está en ejecución")
        else:
            logger.info(f"Iniciando juego desde: {game_path}")
            # Iniciar proceso en un nuevo hilo para no bloquear Flask
            thread = threading.Thread(
                target=start_game_process,
                args=(game_id, game_path)
            )
            thread.daemon = True
            thread.start()
        
        # Renderizar una plantilla que confirme que el juego se está ejecutando
        return render_template('game_launched.html', 
                              game_name=game_info['file'].split('.')[0],
                              game_path=game_path)
    
    except Exception as e:
        logger.error(f"Error al ejecutar el juego: {str(e)}")
        return render_template('base.html', error=f"Error al ejecutar el juego: {str(e)}"), 500

def start_game_process(game_id, game_path):
    """Iniciar un proceso de juego Python"""
    try:
        # Obtener la ruta completa al intérprete de Python
        python_exe = sys.executable
        
        # Para Windows, necesitamos iniciar un nuevo proceso
        if os.name == 'nt':  # Windows
            # Usando el intérprete de Python del sistema y creando una nueva ventana
            game_processes[game_id] = subprocess.Popen(
                [python_exe, game_path],
                cwd=os.path.dirname(os.path.abspath(game_path)),
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:  # Linux/Mac
            game_processes[game_id] = subprocess.Popen(
                [python_exe, game_path],
                cwd=os.path.dirname(os.path.abspath(game_path))
            )
        
        logger.info(f"Juego {game_id} iniciado con PID: {game_processes[game_id].pid}")
        
        # Esperar a que el proceso termine
        game_processes[game_id].wait()
        logger.info(f"Juego {game_id} terminado")
        
    except Exception as e:
        logger.error(f"Error al iniciar proceso del juego: {str(e)}")

@app.route('/game/<game_id>')
def game(game_id):
    """Redireccionar a la ejecución del juego o a URL externa"""
    # Verificar si es calabozo de derivadas para redireccionar a URL externa
    if game_id == 'calculus-challenge':
        games = get_available_games()
        for game in games:
            if game['id'] == game_id and 'external_url' in game:
                logger.info(f"Redireccionando a URL externa para {game_id}: {game['external_url']}")
                return redirect(game['external_url'])
    
    return redirect(url_for('run_game', game_id=game_id))

# Servir archivos estáticos de los juegos
@app.route('/game-assets/<path:file_path>')
def game_assets(file_path):
    """Servir archivos estáticos de los juegos"""
    games_dir = os.path.join(os.getcwd(), 'Juegos')
    return send_from_directory(games_dir, file_path)

# Rutas de compatibilidad (redireccionan a nuevas rutas)
@app.route('/web-games')
def web_games():
    return redirect(url_for('games'))

@app.route('/web-game/<game_id>')
def web_game(game_id):
    return redirect(url_for('game', game_id=game_id))

# Error handling
@app.errorhandler(404)
def page_not_found(e):
    return render_template('base.html', error="Página no encontrada"), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('base.html', error="Error interno del servidor"), 500

if __name__ == '__main__':
    logger.info("Iniciando la aplicación Flask en http://localhost:5000")
    print("Servidor Flask iniciado. Navega a http://localhost:5000 en tu navegador.")
    print("Para acceder a los juegos, ve a http://localhost:5000/games")
    app.run(debug=True, host='0.0.0.0', port=5000)
