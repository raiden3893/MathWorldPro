import pygame
import numpy as np
from equation_generator import EquationGenerator
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import os
import random
from sound_manager import SoundManager

class Game:
    def __init__(self, screen):
        try:
            print("Inicializando juego...")
            self.screen = screen
            self.width = 1024
            self.height = 768
            self.eq_generator = EquationGenerator()
            self.sound_manager = SoundManager()
            print("SoundManager inicializado correctamente")

            # Colores Cyberpunk
            self.WHITE = (255, 255, 255)
            self.BLACK = (0, 0, 0)
            self.NEON_GREEN = (57, 255, 20)
            self.NEON_PINK = (255, 20, 147)
            self.NEON_BLUE = (0, 191, 255)
            self.NEON_PURPLE = (147, 0, 211)
            self.BG_COLOR = (10, 10, 30)  # Azul muy oscuro
            self.DOOR_COLOR = (30, 30, 50)
            self.DOOR_HIGHLIGHT = (50, 50, 80)

            # Estado del juego
            self.state = "menu"  # menu, tutorial, playing, game_over
            self.num_doors = 3  # Número inicial de puertas
            self.correct_answers = 0  # Contador de respuestas correctas
            self.lives = 3
            self.score = 0
            self.has_shield = True  # Comienza con un escudo
            self.shield_available = True  # Control de disponibilidad
            self.multiplier = 1
            self.multiplier_available = True  # Control de disponibilidad
            self.powerup_recharge = 5  # Victorias necesarias para recargar
            self.victories_since_powerup = 0  # Contador de victorias desde última recarga
            self.time_limit = 15
            self.time_remaining = self.time_limit
            self.last_time = pygame.time.get_ticks()
            self.tutorial_scroll = 0

            # Fuentes
            self.font_large = pygame.font.SysFont('Arial', 36)
            self.font_small = pygame.font.SysFont('Arial', 24)
            self.font_title = pygame.font.SysFont('Arial', 48)

            # Inicializar sonidos
            self.sound_manager.play_background_music()

            # Cargar imágenes SVG con manejo de errores
            try:
                print("Cargando iconos SVG...")
                icon_paths = {
                    'shield': 'assets/shield.svg',
                    'multiplier': 'assets/multiplier.svg',
                    'extra_life': 'assets/extra_life.svg',
                    'risk_reward': 'assets/risk_reward.svg',
                    'last_chance': 'assets/last_chance.svg'
                }
                
                self.available_powers = {}
                for power_name, path in icon_paths.items():
                    try:
                        if os.path.exists(path):
                            self.available_powers[power_name] = {
                                'active': False, 
                                'available': False, 
                                'icon': pygame.image.load(path)
                            }
                            print(f"Icono {power_name} cargado correctamente")
                        else:
                            print(f"No se encontró el archivo: {path}")
                            # Crear un icono de fallback
                            fallback_icon = pygame.Surface((40, 40))
                            fallback_icon.fill(self.NEON_BLUE)
                            self.available_powers[power_name] = {
                                'active': False, 
                                'available': False, 
                                'icon': fallback_icon
                            }
                    except Exception as e:
                        print(f"Error al cargar icono {power_name}: {e}")
                        # Crear un icono de fallback
                        fallback_icon = pygame.Surface((40, 40))
                        fallback_icon.fill(self.NEON_BLUE)
                        self.available_powers[power_name] = {
                            'active': False, 
                            'available': False, 
                            'icon': fallback_icon
                        }
                
                print("Iconos cargados correctamente")
            except Exception as e:
                print(f"Error general al cargar iconos: {e}")
                # Crear iconos por defecto si hay error
                self.available_powers = {
                    'shield': {'active': False, 'available': False, 'icon': pygame.Surface((40, 40))},
                    'multiplier': {'active': False, 'available': False, 'icon': pygame.Surface((40, 40))},
                    'extra_life': {'active': False, 'available': False, 'icon': pygame.Surface((40, 40))},
                    'risk_reward': {'active': False, 'available': False, 'icon': pygame.Surface((40, 40))},
                    'last_chance': {'active': False, 'available': False, 'icon': pygame.Surface((40, 40))}
                }
                # Dar colores diferentes a cada icono
                self.available_powers['shield']['icon'].fill(self.NEON_GREEN)
                self.available_powers['multiplier']['icon'].fill(self.NEON_BLUE)
                self.available_powers['extra_life']['icon'].fill(self.NEON_PINK)
                self.available_powers['risk_reward']['icon'].fill(self.NEON_PURPLE)
                self.available_powers['last_chance']['icon'].fill((255, 215, 0))  # Dorado

            self.max_lives = 5
            self.correct_answers_for_power = 10  # Cada 10 aciertos muestra selección de poderes
            self.last_chance_used = False  # Control para última oportunidad

            # Inicializar 2 poderes aleatorios
            self.initialize_random_powers()
            print("Juego inicializado correctamente")
        except Exception as e:
            print(f"Error en __init__: {e}")
            import traceback
            traceback.print_exc()

    def initialize_random_powers(self):
        """Inicializa 2 poderes aleatorios al comenzar el juego"""
        available_powers = ['shield', 'multiplier', 'extra_life', 'risk_reward']
        selected_powers = random.sample(available_powers, 2)
        for power in selected_powers:
            self.available_powers[power]['available'] = True

    def show_menu(self):
        try:
            print("Mostrando menú principal...")
            # Fondo con efecto de gradiente cyberpunk
            for y in range(self.height):
                progress = y / self.height
                color = tuple(min(255, c1 + int((c2 - c1) * progress)) for c1, c2 in zip(self.BG_COLOR, self.NEON_BLUE))
                pygame.draw.line(self.screen, color, (0, y), (self.width, y))

            # Gráficas decorativas de fondo
            decorative_equations = [
                "y = x²", "y = sin(x)", "y = e^x", "y = |x|",
                "y = log(x)", "y = 1/x", "y = x³", "y = cos(x)"
            ]

            print("Dibujando gráficas decorativas...")
            for i, eq in enumerate(decorative_equations):
                try:
                    graph = self.eq_generator.create_example_graph(eq)
                    graph.set_alpha(128)  # Hacer transparente
                    pos_x = (i % 4) * 256
                    pos_y = (i // 4) * 200
                    self.screen.blit(graph, (pos_x, pos_y))
                except Exception as e:
                    print(f"Error dibujando gráfica {eq}: {e}")

            # Título con efecto neón mejorado
            title = self.font_title.render("Juego de Cálculo Diferencial", True, self.NEON_GREEN)
            title_pos = (self.width//2 - title.get_width()//2, 100)

            # Múltiples capas de brillo para el título
            for offset in [3, 2, 1]:
                glow = pygame.Surface((title.get_width() + offset*4, title.get_height() + offset*4))
                glow.fill(self.BG_COLOR)
                pygame.draw.rect(glow, self.NEON_BLUE, glow.get_rect(), offset)
                self.screen.blit(glow, (title_pos[0] - offset*2, title_pos[1] - offset*2))

            self.screen.blit(title, title_pos)

            # Botones
            buttons = [
                ("Jugar", "playing"),
                ("Tutorial", "tutorial")
            ]

            button_height = 80
            button_width = 200
            start_y = 300

            print("Dibujando botones del menú...")
            for i, (text, state) in enumerate(buttons):
                button_rect = pygame.Rect(
                    self.width//2 - button_width//2,
                    start_y + i * (button_height + 20),
                    button_width,
                    button_height
                )

                # Dibujar botón con efecto hover y neón
                mouse_pos = pygame.mouse.get_pos()
                if button_rect.collidepoint(mouse_pos):
                    pygame.draw.rect(self.screen, self.NEON_GREEN, button_rect, border_radius=10)
                    pygame.draw.rect(self.screen, self.NEON_BLUE, button_rect, 3, border_radius=10)
                else:
                    pygame.draw.rect(self.screen, self.DOOR_COLOR, button_rect, border_radius=10)
                    pygame.draw.rect(self.screen, self.NEON_BLUE, button_rect, 2, border_radius=10)

                text_surf = self.font_large.render(text, True, self.WHITE)
                self.screen.blit(text_surf, (
                    button_rect.centerx - text_surf.get_width()//2,
                    button_rect.centery - text_surf.get_height()//2
                ))

                if button_rect.collidepoint(mouse_pos) and pygame.mouse.get_pressed()[0]:
                    self.sound_manager.play('click')
                    self.state = state
                    print(f"Botón {text} presionado, cambiando estado a {state}")
                    if state == "playing":
                        self.reset_game()
                        self.generate_new_round()
                    pygame.time.wait(200)
            print("Menú mostrado correctamente")
        except Exception as e:
            print(f"Error en show_menu: {e}")
            import traceback
            traceback.print_exc()

    def show_tutorial(self):
        try:
            self.screen.fill(self.BG_COLOR)

            # Título con efecto neón
            title = self.font_title.render("Tutorial", True, self.NEON_PINK)
            title_pos = (self.width//2 - title.get_width()//2, 50)
            self.screen.blit(title, title_pos)
            # Efecto de brillo
            glow = pygame.Surface((title.get_width() + 10, title.get_height() + 10))
            glow.fill(self.BG_COLOR)
            pygame.draw.rect(glow, self.NEON_PINK, glow.get_rect(), 3)
            self.screen.blit(glow, (title_pos[0] - 5, title_pos[1] - 5))

            tutorial_sections = [
                {
                    "title": "Tipos de Funciones",
                    "examples": [
                        ("Lineal (y = mx + b)", "y = 2x + 1"),
                        ("Cuadratica (y = ax^2 + bx + c)", "y = x^2 + 2x - 1"),
                        ("Cubica (y = ax^3)", "y = x^3"),
                        ("Seno (y = sin(x))", "y = sin(x)"),
                        ("Exponencial (y = a^x)", "y = 2^x")
                    ]
                },
                {
                    "title": "Habilidades Especiales",
                    "powers": [
                        ("Escudo", "Te protege de perder una vida al fallar"),
                        ("Multiplicador", "Duplica los puntos de la siguiente respuesta correcta"),
                        ("Vida Extra", "Agrega una vida (max. 5). Si tienes 5 vidas, +500 puntos"),
                        ("Premio con Riesgo", "Multiplica x5 los puntos, pero si fallas pierdes 2 vidas"),
                        ("Ultima Oportunidad", "Poder legendario! Da una vida extra cuando pierdes todas. Solo aparece con 25% de probabilidad")
                    ]
                }
            ]

            y_pos = 120
            for section in tutorial_sections:
                # Título de la sección
                title = self.font_large.render(section["title"], True, self.NEON_GREEN)
                self.screen.blit(title, (self.width//2 - title.get_width()//2, y_pos + self.tutorial_scroll))
                y_pos += 60

                if "examples" in section:
                    for func_type, example in section["examples"]:
                        # Fondo para la gráfica con borde neón
                        graph_rect = pygame.Rect(80, y_pos + self.tutorial_scroll, 240, 180)
                        pygame.draw.rect(self.screen, self.DOOR_COLOR, graph_rect)
                        pygame.draw.rect(self.screen, self.NEON_BLUE, graph_rect, 2)

                        # Generar y mostrar la gráfica de ejemplo
                        graph = self.eq_generator.create_example_graph(example)
                        graph = pygame.transform.scale(graph, (200, 150))
                        self.screen.blit(graph, (100, y_pos + self.tutorial_scroll + 15))

                        # Texto explicativo con efecto neón
                        text = self.font_small.render(func_type, True, self.NEON_PINK)
                        self.screen.blit(text, (320, y_pos + self.tutorial_scroll + 60))

                        y_pos += 220
                elif "powers" in section:
                    for power_name, power_desc in section["powers"]:
                        text = self.font_small.render(f"{power_name}: {power_desc}", True, self.NEON_PINK)
                        self.screen.blit(text, (self.width // 2 - text.get_width() // 2, y_pos + self.tutorial_scroll))
                        y_pos += 40

            # Botón para volver al menú (siempre visible)
            back_button = pygame.Rect(self.width//2 - 100, self.height - 80, 200, 50)
            mouse_pos = pygame.mouse.get_pos()

            # Efecto hover en el botón
            if back_button.collidepoint(mouse_pos):
                pygame.draw.rect(self.screen, self.NEON_GREEN, back_button, border_radius=10)
                pygame.draw.rect(self.screen, self.NEON_BLUE, back_button, 3, border_radius=10)
            else:
                pygame.draw.rect(self.screen, self.DOOR_COLOR, back_button, border_radius=10)
                pygame.draw.rect(self.screen, self.NEON_BLUE, back_button, 2, border_radius=10)

            back_text = self.font_small.render("Volver al Menu", True, self.WHITE)
            self.screen.blit(back_text, (back_button.centerx - back_text.get_width()//2, back_button.centery - back_text.get_height()//2))

            # Manejar eventos
            for event in pygame.event.get():
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if back_button.collidepoint(mouse_pos):
                        self.sound_manager.play('click')
                        self.state = "menu"
                        pygame.time.wait(200)
                    elif event.button == 4:  # Scroll arriba
                        self.tutorial_scroll = min(0, self.tutorial_scroll + 30)
                    elif event.button == 5:  # Scroll abajo
                        self.tutorial_scroll = max(-(y_pos - self.height + 100), self.tutorial_scroll - 30)
                elif event.type == pygame.QUIT:
                    pygame.quit()
                    exit()

            pygame.display.flip()
        except Exception as e:
            print(f"Error en show_tutorial: {e}")
            traceback.print_exc()

    def reset_game(self):
        self.lives = 3
        self.score = 0
        self.num_doors = 3
        self.correct_answers = 0
        self.has_shield = True
        self.shield_available = True
        self.multiplier = 1
        self.multiplier_available = True
        self.victories_since_powerup = 0
        self.last_chance_used = False
        self.initialize_random_powers()


    def generate_new_round(self):
        try:
            print("Generando nueva ronda...")
            self.current_eq, self.correct_graph, self.wrong_graphs = self.eq_generator.generate()
            print(f"Ecuación generada: {self.current_eq}")
            spacing = self.width // (self.num_doors + 1)
            self.door_positions = [
                pygame.Rect(i * spacing, 300, 160, 240)
                for i in range(1, self.num_doors + 1)
            ]
            self.correct_door = np.random.randint(0, self.num_doors)
            print(f"Puerta correcta: {self.correct_door + 1}")
            self.time_remaining = self.time_limit
            self.last_time = pygame.time.get_ticks()
            print("Nueva ronda generada correctamente")
        except Exception as e:
            print(f"Error en generate_new_round: {e}")
            import traceback
            traceback.print_exc()

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.state == "menu" or self.state == "tutorial":
                return

            mouse_pos = pygame.mouse.get_pos()

            # Verificar click en puertas
            for i, door in enumerate(self.door_positions):
                if door.collidepoint(mouse_pos):
                    self.check_answer(i)

            # Verificar click en potenciadores
            power_x = 20
            power_y = 20
            power_spacing = 50
            for i, (power_name, power_data) in enumerate(self.available_powers.items()):
                if power_data['available']:
                    power_rect = pygame.Rect(power_x + i * power_spacing, power_y, 40, 40)
                    if power_rect.collidepoint(mouse_pos) and not power_data['active']:
                        self.sound_manager.play('powerup')
                        power_data['active'] = True
        
        # Manejar salida con ESC
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                # Regresar al menú si no estamos en él, o no hacer nada si ya estamos en el menú
                if self.state != "menu":
                    self.state = "menu"

    def check_answer(self, selected_door):
        if selected_door == self.correct_door:
            base_points = 100
            multiplier = 1

            if self.available_powers['multiplier']['active']:
                multiplier = 2
                self.available_powers['multiplier']['active'] = False
            elif self.available_powers['risk_reward']['active']:
                multiplier = 5
                self.available_powers['risk_reward']['active'] = False

            points = base_points * multiplier
            self.score += points
            self.sound_manager.play('correct')
            self.correct_answers += 1

            # Mostrar selección de poderes cada 10 aciertos
            if self.correct_answers % self.correct_answers_for_power == 0:
                self.show_power_selection()

            # Recargar potenciadores cada 5 victorias
            if self.correct_answers % self.powerup_recharge == 0:
                for power_name, power_data in self.available_powers.items():
                    if power_name != 'last_chance':
                        power_data['available'] = True
                self.victories_since_powerup = 0
                self.show_feedback("¡Potenciadores recargados!", self.NEON_BLUE)
                self.sound_manager.play('powerup')

            # Aumentar número de puertas cada 5 aciertos
            if self.correct_answers % 5 == 0 and self.num_doors < 8:
                self.num_doors += 1
                self.show_feedback(f"¡Nivel aumentado! Ahora hay {self.num_doors} puertas", self.NEON_GREEN)
            else:
                self.show_feedback("¡Correcto! +" + str(points), self.NEON_GREEN)
        else:
            lives_to_lose = 2 if self.available_powers['risk_reward']['active'] else 1

            if self.available_powers['shield']['active']:
                self.available_powers['shield']['active'] = False
                self.sound_manager.play('powerup')
                self.show_feedback("¡Escudo utilizado!", self.NEON_GREEN)
            else:
                self.lives -= lives_to_lose
                if self.lives <= 0 and not self.last_chance_used and self.available_powers['last_chance']['available']:
                    self.lives = 1
                    self.last_chance_used = True
                    self.show_feedback("¡Última Oportunidad Activada!", self.NEON_PURPLE)
                else:
                    self.sound_manager.play('wrong')
                    self.show_feedback(f"¡Incorrecto! La respuesta correcta era la puerta {self.correct_door + 1}", self.NEON_PINK)

        self.multiplier = 1
        self.multiplier_available = False
        for power_name, power_data in self.available_powers.items():
          if power_name == 'multiplier':
            power_data['available'] = False
        if self.lives > 0:
            self.generate_new_round()
        else:
            self.state = "game_over"

    def show_feedback(self, text, color):
        feedback = self.font_large.render(text, True, color)
        self.screen.blit(feedback, (self.width//2 - feedback.get_width()//2, 100))
        pygame.display.flip()
        pygame.time.wait(1000)

    def update(self):
        if self.state == "playing":
            current_time = pygame.time.get_ticks()
            self.time_remaining -= (current_time - self.last_time) / 1000
            self.last_time = current_time

            if self.time_remaining <= 0:
                self.lives -= 1
                self.sound_manager.play('wrong')
                self.show_feedback("¡Se acabó el tiempo!", self.NEON_PINK)
                if self.lives > 0:
                    self.generate_new_round()
                else:
                    self.state = "game_over"

    def draw(self):
        try:
            if self.state == "menu":
                self.show_menu()
                return
            elif self.state == "tutorial":
                self.show_tutorial()
                return
            elif self.state == "game_over":
                self.show_game_over()
                return

            self.screen.fill(self.BG_COLOR)

            # Dibujar ecuación con estilo
            eq_background = pygame.Surface((self.width - 100, 70))
            eq_background.fill((240, 240, 240))
            pygame.draw.rect(eq_background, (200, 200, 200), eq_background.get_rect(), 3)
            self.screen.blit(eq_background, (50, 30))

            eq_text = self.font_large.render(f"Ecuación: {self.current_eq}", True, self.NEON_BLUE)
            self.screen.blit(eq_text, (self.width//2 - eq_text.get_width()//2, 50))

            # Dibujar timer
            timer_text = self.font_small.render(f"Tiempo: {int(self.time_remaining)}s", True, self.NEON_PINK)
            self.screen.blit(timer_text, (self.width - 150, 20))

            # Dibujar puertas y gráficas con más detalle
            for i, door in enumerate(self.door_positions):
                # Sombra de la puerta
                shadow = pygame.Rect(door.x + 5, door.y + 5, door.width, door.height)
                pygame.draw.rect(self.screen, (100, 100, 100), shadow)

                # Puerta principal con gradiente
                color1 = self.DOOR_COLOR
                color2 = self.DOOR_HIGHLIGHT
                for y in range(door.height):
                    progress = y / door.height
                    color = tuple(int(c1 + (c2 - c1) * progress) for c1, c2 in zip(color1, color2))
                    pygame.draw.line(self.screen, color, (door.x, door.y + y), (door.x + door.width, door.y + y))

                # Marco de la puerta
                pygame.draw.rect(self.screen, (101, 67, 33), door, 5)

                # Perilla de la puerta
                pygame.draw.circle(self.screen, (255, 215, 0), (door.right - 30, door.centery), 15)
                pygame.draw.circle(self.screen, (218, 165, 32), (door.right - 30, door.centery), 15, 2)

                # Número de la puerta
                door_num = self.font_small.render(str(i + 1), True, self.WHITE)
                self.screen.blit(door_num, (door.centerx - door_num.get_width()//2, door.y + 20))

                # Dibujar gráfica en la puerta
                if i == self.correct_door:
                    graph = self.correct_graph
                else:
                    wrong_index = i if i < self.correct_door else i-1
                    if wrong_index < len(self.wrong_graphs):
                        graph = self.wrong_graphs[wrong_index]
                    else:
                        graph = self.wrong_graphs[0]  # Usar la primera gráfica incorrecta como respaldo

                graph_surface = pygame.transform.scale(graph, (140, 160))
                self.screen.blit(graph_surface, (door.x + 10, door.y + 50))

            # Panel de información con estilo
            info_panel = pygame.Surface((200, 150))
            info_panel.fill((240, 240, 240))
            pygame.draw.rect(info_panel, (200, 200, 200), info_panel.get_rect(), 3)
            self.screen.blit(info_panel, (10, 10))

            # Mostrar vidas con iconos en lugar de emoji
            lives_text = self.font_small.render("Vidas: ", True, self.NEON_PINK)
            self.screen.blit(lives_text, (20, 70))
            
            # Dibujar corazones como círculos rojos
            for i in range(self.lives):
                heart_pos_x = 85 + i * 25
                pygame.draw.circle(self.screen, (255, 0, 0), (heart_pos_x, 75), 10)
                pygame.draw.circle(self.screen, (200, 0, 0), (heart_pos_x, 75), 10, 1)
            
            score_text = self.font_small.render(f"Puntaje: {self.score}", True, self.NEON_BLUE)
            self.screen.blit(score_text, (20, 100))

            # Dibujar potenciadores con los nuevos iconos SVG y estado de disponibilidad
            power_x = 20
            power_y = 20
            power_spacing = 50
            for i, (power_name, power_data) in enumerate(self.available_powers.items()):
                if power_data['available']:
                    power_rect = pygame.Rect(power_x + i * power_spacing, power_y, 40, 40)
                    alpha = 255 if power_data['active'] else 128
                    power_data['icon'].set_alpha(alpha)
                    self.screen.blit(power_data['icon'], (power_rect.x, power_rect.y))


            # Mostrar contador de victorias para recarga
            recharge_text = self.font_small.render(f"Victorias para recarga: {self.powerup_recharge - (self.correct_answers % self.powerup_recharge)}", True, self.NEON_BLUE)
            self.screen.blit(recharge_text, (120, 30))
        except Exception as e:
            print(f"Error en draw: {e}")
            import traceback
            traceback.print_exc()

    def show_game_over(self):
        self.screen.fill(self.BG_COLOR)
        game_over = self.font_large.render("¡Juego Terminado!", True, self.NEON_PINK)
        final_score = self.font_large.render(f"Puntaje Final: {self.score}", True, self.NEON_BLUE)

        self.screen.blit(game_over, (self.width//2 - game_over.get_width()//2, self.height//2 - 50))
        self.screen.blit(final_score, (self.width//2 - final_score.get_width()//2, self.height//2 + 50))

        # Botón para volver al menú
        restart_button = pygame.Rect(self.width//2 - 100, self.height//2 + 120, 200, 50)
        pygame.draw.rect(self.screen, self.DOOR_COLOR, restart_button, border_radius=10)
        pygame.draw.rect(self.screen, self.NEON_BLUE, restart_button, 2, border_radius=10)
        restart_text = self.font_small.render("Volver al Menú", True, self.WHITE)
        self.screen.blit(restart_text, (restart_button.centerx - restart_text.get_width()//2, restart_button.centery - restart_text.get_height()//2))

        pygame.display.flip()

        # Esperar click en el botón
        waiting = True
        while waiting:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    exit()
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_pos = pygame.mouse.get_pos()
                    if restart_button.collidepoint(mouse_pos):
                        self.sound_manager.play('click')
                        self.state = "menu"
                        self.lives = 3
                        self.score = 0
                        waiting = False

    def show_power_selection(self):
        """Muestra la pantalla de selección de poderes"""
        self.screen.fill(self.BG_COLOR)
        title = self.font_title.render("¡Selecciona una Habilidad!", True, self.NEON_GREEN)
        self.screen.blit(title, (self.width//2 - title.get_width()//2, 50))

        available_powers = ['shield', 'multiplier', 'extra_life', 'risk_reward']
        if random.random() < 0.25:  # 25% de probabilidad de que aparezca última oportunidad
            available_powers.append('last_chance')

        powers_to_show = random.sample(available_powers, min(3, len(available_powers)))

        for i, power in enumerate(powers_to_show):
            button_rect = pygame.Rect(self.width//2 - 100, 150 + i*100, 200, 80)
            pygame.draw.rect(self.screen, self.NEON_BLUE, button_rect, border_radius=10)

            icon = self.available_powers[power]['icon']
            self.screen.blit(icon, (button_rect.x + 10, button_rect.centery - 20))

            power_name = power.replace('_', ' ').title()
            text = self.font_small.render(power_name, True, self.WHITE)
            self.screen.blit(text, (button_rect.x + 60, button_rect.centery - 10))

        pygame.display.flip()

        waiting = True
        while waiting:
            for event in pygame.event.get():
                if event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_pos = pygame.mouse.get_pos()
                    for i, power in enumerate(powers_to_show):
                        button_rect = pygame.Rect(self.width//2 - 100, 150 + i*100, 200, 80)
                        if button_rect.collidepoint(mouse_pos):
                            self.available_powers[power]['active'] = True
                            self.sound_manager.play('powerup')
                            waiting = False
                elif event.type == pygame.QUIT:
                    pygame.quit()
                    exit()