#!/usr/bin/env python
"""
Script para automatizar la conversión de juegos Python/Pygame a versiones web
usando pygbag y copiar los archivos resultantes a la carpeta static/web_games.
"""

import os
import sys
import shutil
import subprocess
import argparse
from pathlib import Path

def check_requirements():
    """Verifica que pygbag está instalado y disponible."""
    try:
        import pygbag
        print("✅ Pygbag está instalado correctamente.")
        return True
    except ImportError:
        print("❌ Pygbag no está instalado. Instalando...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pygbag"])
            print("✅ Pygbag instalado correctamente.")
            return True
        except subprocess.CalledProcessError:
            print("❌ Error al instalar pygbag. Intente manualmente con 'pip install pygbag'")
            return False

def convert_game(game_path, game_id):
    """Convierte un juego de Python a formato web usando pygbag."""
    print(f"📦 Convirtiendo juego en {game_path} a formato web...")
    
    abs_game_path = os.path.abspath(game_path)
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pygbag", "--build", abs_game_path
        ])
        print(f"✅ Juego convertido exitosamente. Archivos generados en {abs_game_path}/build/web")
        return os.path.join(abs_game_path, "build", "web")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al convertir el juego: {e}")
        return None

def copy_to_static(build_path, game_id):
    """Copia los archivos generados a la carpeta static/web_games."""
    # Encontrar la carpeta raíz del proyecto (donde está app.py)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Ir un nivel arriba si estamos en scripts/
    if os.path.basename(current_dir) == "scripts":
        root_dir = os.path.dirname(current_dir)
    else:
        root_dir = current_dir
        
    target_dir = os.path.join(root_dir, "static", "web_games", game_id)
    
    print(f"📋 Copiando archivos a {target_dir}...")
    
    # Limpiar carpeta de destino si existe
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    
    # Crear carpeta de destino
    os.makedirs(target_dir, exist_ok=True)
    
    # Copiar archivos web generados
    try:
        for item in os.listdir(build_path):
            src_path = os.path.join(build_path, item)
            dst_path = os.path.join(target_dir, item)
            
            if os.path.isdir(src_path):
                shutil.copytree(src_path, dst_path)
            else:
                shutil.copy2(src_path, dst_path)
        
        print(f"✅ Archivos copiados correctamente a {target_dir}")
        return True
    except Exception as e:
        print(f"❌ Error al copiar archivos: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Convertir juegos Python/Pygame a versiones web")
    parser.add_argument("game_path", help="Ruta al directorio del juego Python/Pygame")
    parser.add_argument("--id", help="ID del juego (usado para la URL, por ejemplo 'calculus-challenge')", required=True)
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🎮 CONVERTIDOR DE JUEGOS PYTHON A WEB")
    print("=" * 60)
    
    if not check_requirements():
        return 1
    
    print(f"🔍 Procesando juego: {args.id}")
    
    # Verificar que la carpeta del juego existe
    if not os.path.isdir(args.game_path):
        print(f"❌ La carpeta del juego no existe: {args.game_path}")
        return 1
    
    # Verificar archivo principal
    main_candidates = ["main.py", "VideoJuego.py", "JUGAR_AQUI.py"]
    main_file = None
    
    for candidate in main_candidates:
        if os.path.exists(os.path.join(args.game_path, candidate)):
            main_file = candidate
            break
    
    if not main_file:
        print("❌ No se encontró un archivo principal en la carpeta del juego.")
        print("Asegúrate de que existe main.py, VideoJuego.py o JUGAR_AQUI.py")
        return 1
    
    print(f"✅ Archivo principal encontrado: {main_file}")
    
    # Convertir el juego
    build_path = convert_game(args.game_path, args.id)
    if not build_path:
        return 1
    
    # Copiar archivos a static/web_games
    if not copy_to_static(build_path, args.id):
        return 1
    
    print("=" * 60)
    print(f"✨ ¡CONVERSIÓN COMPLETADA CON ÉXITO! ✨")
    print(f"📱 Ahora puedes acceder a tu juego en: http://localhost:5000/web-game-embed/{args.id}")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 