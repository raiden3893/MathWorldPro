import pygame
import random
import json
from enum import Enum
# Initialize Pygame
pygame.init()

# Define GameState enum first
class GameState(Enum):
    MENU = 1
    PLAYING = 2
    INSTRUCTIONS = 3
    LOGIN = 4
    GAME_OVER = 5
    SCORES = 6  # Nuevo estado para mostrar puntuaciones

# Constants
WIDTH = 800
HEIGHT = 600
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
PURPLE = (128, 0, 128)
ORANGE = (255, 165, 0)

# Base de datos de problemas matemáticos por nivel
MATH_PROBLEMS = {
    1: [  # Nivel 1: Derivadas básicas
        {"function": "5", "derivative": "0"},
        {"function": "x", "derivative": "1"},
        {"function": "3x", "derivative": "3"},
        {"function": "7x + 2", "derivative": "7"},
        {"function": "4x - 1", "derivative": "4"}
    ],
    2: [  # Nivel 2: Potencias simples
        {"function": "x²", "derivative": "2x"},
        {"function": "x³", "derivative": "3x²"},
        {"function": "2x²", "derivative": "4x"},
        {"function": "3x² + 2x", "derivative": "6x + 2"},
        {"function": "x² - 3x", "derivative": "2x - 3"}
    ],
    3: [  # Nivel 3: Potencias más complejas
        {"function": "x⁴", "derivative": "4x³"},
        {"function": "2x³ - x²", "derivative": "6x² - 2x"},
        {"function": "x³ + 2x² + 3x", "derivative": "3x² + 4x + 3"},
        {"function": "5x⁴ - 2x³", "derivative": "20x³ - 6x²"},
        {"function": "x⁵", "derivative": "5x⁴"}
    ],
    4: [  # Nivel 4: Trigonométricas básicas
        {"function": "sin(x)", "derivative": "cos(x)"},
        {"function": "cos(x)", "derivative": "-sin(x)"},
        {"function": "2sin(x)", "derivative": "2cos(x)"},
        {"function": "3cos(x)", "derivative": "-3sin(x)"},
        {"function": "3sin(3x)", "derivative": "9cos(3x)"}
    ],
    5: [  # Nivel 5: Exponenciales y logaritmos
        {"function": "e^x", "derivative": "e^x"},
        {"function": "ln(x)", "derivative": "1/x"},
        {"function": "2e^x", "derivative": "2e^x"},
        {"function": "3ln(x)", "derivative": "3/x"},
        {"function": "ln(2x+1)", "derivative": "2/2x+1"}
    ]
}

class Player:
    def __init__(self):
        self.width = 40
        self.height = 40
        self.x = 100
        self.y = HEIGHT - self.height - 10
        self.jumping = False
        self.jump_speed = -15
        self.gravity = 0.8
        self.velocity = 0

    def jump(self):
        if not self.jumping:
            self.jumping = True
            self.velocity = self.jump_speed

    def update(self):
        if self.jumping:
            self.y += self.velocity
            self.velocity += self.gravity

            if self.y >= HEIGHT - self.height - 10:
                self.y = HEIGHT - self.height - 10
                self.jumping = False
                self.velocity = 0

    def draw(self, screen):
        pygame.draw.rect(screen, BLUE, (self.x, self.y, self.width, self.height))

class Obstacle:
    def __init__(self, speed, level, recent_problems=None):
        self.width = 30
        self.height = 50
        self.x = WIDTH
        self.y = HEIGHT - self.height - 10
        self.speed = speed
        
        # Seleccionar un problema que no esté en la lista de recientes
        if recent_problems is not None:
            available_problems = [p for p in MATH_PROBLEMS[level] if p not in recent_problems]
            # Si todos los problemas están en la lista de recientes, usar todos los problemas
            if not available_problems:
                available_problems = MATH_PROBLEMS[level]
            self.problem = random.choice(available_problems)
        else:
            self.problem = random.choice(MATH_PROBLEMS[level])

    def update(self):
        self.x -= self.speed

    def draw(self, screen):
        pygame.draw.rect(screen, RED, (self.x, self.y, self.width, self.height))

class Button:
    def __init__(self, x, y, width, height, text, color, hover_color):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = hover_color
        self.is_hovered = False

    def draw(self, screen, font):
        color = self.hover_color if self.is_hovered else self.color
        pygame.draw.rect(screen, color, self.rect, border_radius=10)
        pygame.draw.rect(screen, BLACK, self.rect, 3, border_radius=10)
        text_surface = font.render(self.text, True, BLACK)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.is_hovered:
                return True
        return False

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("MathRunner: Escape del Cálculo")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 32)
        self.small_font = pygame.font.Font(None, 24)
        self.title_font = pygame.font.Font(None, 56)
        
        self.state = GameState.MENU
        self.current_email = ""
        self.logged_in_email = None
        self.users_file = "users.json"
        self.load_users()
        
        self.init_menu()
        self.init_game_state()
        self.back_button = Button(50, HEIGHT - 70, 100, 40, "Volver", ORANGE, RED)
        
        # Lista para llevar un registro de problemas recientes
        self.recent_problems = []

    def init_game_state(self):
        self.player = Player()
        self.obstacles = []
        self.score = 0
        self.game_speed = 3  # Velocidad inicial para el nivel 1
        self.obstacle_timer = 0
        self.obstacle_interval = 4000
        self.current_answer = ""
        self.game_over = False
        self.level = 1
        self.recent_problems = []  # Reiniciar la lista de problemas recientes

    def load_users(self):
        try:
            with open(self.users_file, 'r') as f:
                self.users_data = json.load(f)
                # Asegurarse de que existe la estructura para puntuaciones
                if "scores" not in self.users_data:
                    self.users_data["scores"] = []
        except (json.JSONDecodeError, FileNotFoundError):
            self.users_data = {"users": [], "scores": []}
            with open(self.users_file, 'w') as f:
                json.dump(self.users_data, f)

    def save_user(self, email):
        if email not in self.users_data["users"]:
            self.users_data["users"].append(email)
            with open(self.users_file, 'w') as f:
                json.dump(self.users_data, f)
        self.logged_in_email = email

    def init_menu(self):
        # Reducir el tamaño de los botones
        button_width = 160
        button_height = 50
        button_x = WIDTH // 2 - button_width // 2
        # Ajustar el espaciado vertical entre botones
        button_spacing = 70
        start_y = HEIGHT // 2 - 80  # Posición inicial más arriba

        self.menu_buttons = [
            Button(button_x, start_y, button_width, button_height, "Login", GREEN, BLUE),
            Button(button_x, start_y + button_spacing, button_width, button_height, "Jugar", GREEN, BLUE),
            Button(button_x, start_y + button_spacing*2, button_width, button_height, "Instrucciones", ORANGE, RED),
            Button(button_x, start_y + button_spacing*3, button_width, button_height, "Puntuaciones", PURPLE, BLUE),
            Button(button_x, start_y + button_spacing*4, button_width, button_height, "Salir", PURPLE, RED)
        ]

    def draw_menu(self):
        self.screen.fill(WHITE)
        title = self.title_font.render("MathRunner", True, BLUE)
        subtitle = self.font.render("Escape del Cálculo", True, BLACK)
        
        # Mover el título más arriba
        title_rect = title.get_rect(centerx=WIDTH//2, y=HEIGHT//8)  # Más arriba (antes era HEIGHT//6)
        subtitle_rect = subtitle.get_rect(centerx=WIDTH//2, y=title_rect.bottom + 10)  # Menos espacio
        
        self.screen.blit(title, title_rect)
        self.screen.blit(subtitle, subtitle_rect)

        for button in self.menu_buttons:
            button.draw(self.screen, self.font)

    def draw_login(self):
        self.screen.fill(WHITE)
        title = self.font.render("Login", True, BLACK)
        self.screen.blit(title, (WIDTH//2 - title.get_width()//2, 50))

        # Aumentar el ancho del recuadro de entrada de 300 a 400 píxeles
        input_box = pygame.draw.rect(self.screen, BLACK, (WIDTH//2 - 200, HEIGHT//2 - 30, 400, 40), 2)
        email_text = self.font.render(self.current_email, True, BLACK)
        self.screen.blit(email_text, (input_box.x + 5, input_box.y + 5))

        instruction_text = self.small_font.render("Ingresa tu correo y presiona Enter", True, BLACK)
        self.screen.blit(instruction_text, (WIDTH//2 - instruction_text.get_width()//2, HEIGHT//2 + 50))

        self.back_button.draw(self.screen, self.small_font)

    def handle_login_input(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN and '@' in self.current_email:
                self.save_user(self.current_email)
                self.state = GameState.MENU
                self.current_email = ""
            elif event.key == pygame.K_BACKSPACE:
                self.current_email = self.current_email[:-1]
            elif event.unicode.isprintable():
                self.current_email += event.unicode

    def draw_instructions(self):
        self.screen.fill(WHITE)
        title = self.font.render("Instrucciones", True, BLACK)
        self.screen.blit(title, (WIDTH//2 - title.get_width()//2, 50))

        instructions = [
            "1. Resuelve las derivadas de las funciones que aparecen",
            "2. Escribe la respuesta y presiona Enter",
            "3. Si la respuesta es correcta, el personaje saltará",
            "4. Evita chocar con los obstáculos",
            "5. Gana puntos por cada respuesta correcta"
        ]

        y = 120
        for instruction in instructions:
            text = self.small_font.render(instruction, True, BLACK)
            self.screen.blit(text, (50, y))
            y += 40

        self.back_button.draw(self.screen, self.small_font)

    def handle_input(self, event):
        if event.key == pygame.K_RETURN:
            self.check_answer()
        elif event.key == pygame.K_BACKSPACE:
            self.current_answer = self.current_answer[:-1]
        elif event.unicode.isprintable():
            self.current_answer += event.unicode

    def check_answer(self):
        if self.obstacles and self.current_answer.strip():
            correct_answer = self.obstacles[0].problem["derivative"]
            if self.current_answer.strip() == correct_answer:
                self.player.jump()
                self.score += 100
                if self.score % 500 == 0:
                    self.level = min(self.level + 1, 5)
                    # Mantener la velocidad en 2.5 para todos los niveles a partir del nivel 2
                    if self.level >= 2:
                        self.game_speed = 2.5
        self.current_answer = ""

    def update(self):
        current_time = pygame.time.get_ticks()
        
        if not self.game_over:
            self.player.update()
            
            for obstacle in self.obstacles[:]:
                obstacle.update()
                
                if (obstacle.x < self.player.x + self.player.width and
                    obstacle.x + obstacle.width > self.player.x and
                    obstacle.y < self.player.y + self.player.height and
                    obstacle.y + obstacle.height > self.player.y):
                    self.game_over = True
                    # Guardar puntuación cuando el juego termina
                    self.save_score()
                
                if obstacle.x + obstacle.width < 0:
                    self.obstacles.remove(obstacle)
            
            if (not self.obstacles or 
                current_time - self.obstacle_timer > self.obstacle_interval):
                # Crear un nuevo obstáculo evitando problemas recientes
                new_obstacle = Obstacle(self.game_speed, min(self.level, 5), self.recent_problems)
                self.obstacles.append(new_obstacle)
                
                # Agregar el nuevo problema a la lista de recientes
                self.recent_problems.append(new_obstacle.problem)
                # Mantener solo los últimos 3 problemas en la lista
                if len(self.recent_problems) > 3:
                    self.recent_problems.pop(0)
                    
                self.obstacle_timer = current_time

    def draw(self):
        self.screen.fill(WHITE)
        
        self.player.draw(self.screen)
        for obstacle in self.obstacles:
            obstacle.draw(self.screen)
            # Get derivative type and order based on level
            derivative_types = {
                1: "Primera Derivada",  # Linear functions
                2: "Primera Derivada",  # Changed to Primera Derivada
                3: "Primera Derivada",  # Changed to Primera Derivada
                4: "Primera Derivada",  # Trigonometric functions
                5: "Primera Derivada"   # Exponential and logarithmic functions
            }
            
            problem_text = self.font.render(
                f"f(x) = {obstacle.problem['function']}", True, BLACK)
            derivative_type = self.small_font.render(
                f"{derivative_types[self.level]}", True, BLUE)
            self.screen.blit(problem_text, (WIDTH//2 - problem_text.get_width()//2, 30))
            self.screen.blit(derivative_type, (WIDTH//2 - derivative_type.get_width()//2, 70))
            
            # Dibujar la caja de respuesta debajo del texto de la derivada
            if not self.game_over:
                answer_box = pygame.draw.rect(self.screen, BLACK, 
                                          (WIDTH//2 - 100, 110, 200, 40), 2)
                answer_text = self.font.render(self.current_answer, True, BLACK)
                self.screen.blit(answer_text, (answer_box.x + 5, answer_box.y + 5))
        
        score_text = self.font.render(f"Puntuación: {self.score}", True, BLACK)
        level_text = self.font.render(f"Nivel: {self.level}", True, BLACK)
        self.screen.blit(score_text, (10, 10))
        self.screen.blit(level_text, (10, 50))
        
        # Mostrar las 3 mejores puntuaciones en la esquina superior derecha
        top_scores = self.users_data["scores"][:3]
        top_score_title = self.small_font.render("Mejores Puntuaciones:", True, BLUE)
        self.screen.blit(top_score_title, (WIDTH - 200, 10))
        
        y_pos = 40
        for i, score in enumerate(top_scores):
            if i < 3:  # Mostrar solo las 3 mejores
                player_name = score["email"].split('@')[0]
                score_display = self.small_font.render(
                    f"{i+1}. {player_name}: {score['score']}", True, BLACK)
                self.screen.blit(score_display, (WIDTH - 200, y_pos))
                y_pos += 25
        
        if self.game_over:
            game_over_text = self.font.render("¡Juego Terminado!", True, RED)
            restart_text = self.small_font.render(
                "Presiona R para reiniciar, ESC para menú", True, BLACK)
            
            self.screen.blit(game_over_text, 
                           (WIDTH//2 - game_over_text.get_width()//2, HEIGHT//2 - 50))
            self.screen.blit(restart_text, 
                           (WIDTH//2 - restart_text.get_width()//2, HEIGHT//2 + 10))
            return  # Don't draw answer box when game is over
        
        # Eliminé la caja de respuesta que estaba aquí y la moví arriba
        
        if self.game_over:
            game_over_text = self.font.render("¡Juego Terminado!", True, RED)
            restart_text = self.small_font.render(
                "Presiona R para reiniciar o ESC para volver al menú", True, BLACK)
            
            self.screen.blit(game_over_text, 
                           (WIDTH//2 - game_over_text.get_width()//2, HEIGHT//2 - 50))
            self.screen.blit(restart_text, 
                           (WIDTH//2 - restart_text.get_width()//2, HEIGHT//2 + 10))

    def run(self):
        running = True
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif self.state == GameState.MENU:
                    for i, button in enumerate(self.menu_buttons):
                        if button.handle_event(event):
                            if i == 0:  # Login
                                self.state = GameState.LOGIN
                            elif i == 1:  # Jugar
                                if self.logged_in_email:
                                    self.state = GameState.PLAYING
                                    self.init_game_state()
                            elif i == 2:  # Instrucciones
                                self.state = GameState.INSTRUCTIONS
                            elif i == 3:  # Puntuaciones
                                self.state = GameState.SCORES
                            elif i == 4:  # Salir
                                running = False
                elif self.state == GameState.LOGIN:
                    self.handle_login_input(event)
                    if self.back_button.handle_event(event):
                        self.state = GameState.MENU
                        self.current_email = ""
                elif self.state == GameState.INSTRUCTIONS:
                    if self.back_button.handle_event(event):
                        self.state = GameState.MENU
                elif self.state == GameState.SCORES:
                    # Añadir manejo del botón de volver en la pantalla de puntuaciones
                    if self.back_button.handle_event(event):
                        self.state = GameState.MENU
                elif self.state == GameState.PLAYING:
                    if event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_r and self.game_over:
                            self.init_game_state()
                        elif event.key == pygame.K_ESCAPE:
                            self.state = GameState.MENU
                        # Eliminamos la opción de salir con Q
                        else:
                            self.handle_input(event)

            if self.state == GameState.MENU:
                self.draw_menu()
            elif self.state == GameState.LOGIN:
                self.draw_login()
            elif self.state == GameState.INSTRUCTIONS:
                self.draw_instructions()
            elif self.state == GameState.SCORES:
                self.draw_scores()
            elif self.state == GameState.PLAYING:
                self.update()
                self.draw()

            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()

    def save_score(self):
        if self.logged_in_email and self.game_over:
            # Crear entrada de puntuación
            score_entry = {
                "email": self.logged_in_email,
                "score": self.score,
                "level": self.level,
                "date": pygame.time.get_ticks()  # Usar como timestamp simple
            }
            
            # Añadir a la lista de puntuaciones
            self.users_data["scores"].append(score_entry)
            
            # Ordenar por puntuación (mayor a menor)
            self.users_data["scores"].sort(key=lambda x: x["score"], reverse=True)
            
            # Mantener solo las mejores puntuaciones (opcional)
            if len(self.users_data["scores"]) > 100:  # Guardar hasta 100 puntuaciones
                self.users_data["scores"] = self.users_data["scores"][:100]
            
            # Guardar en el archivo
            with open(self.users_file, 'w') as f:
                json.dump(self.users_data, f)

    def draw_scores(self):
            self.screen.fill(WHITE)
            title = self.font.render("Mejores Puntuaciones", True, BLUE)
            self.screen.blit(title, (WIDTH//2 - title.get_width()//2, 50))
            
            # Obtener las 5 mejores puntuaciones
            top_scores = self.users_data["scores"][:5]
            
            y = 120
            if not top_scores:
                text = self.font.render("No hay puntuaciones registradas", True, BLACK)
                self.screen.blit(text, (WIDTH//2 - text.get_width()//2, y))
            else:
                # Encabezados
                headers = ["Posición", "Jugador", "Puntuación", "Nivel"]
                header_x = [100, 250, 500, 650]
                
                for i, header in enumerate(headers):
                    text = self.font.render(header, True, BLACK)
                    self.screen.blit(text, (header_x[i], y))
                
                y += 50
                
                # Mostrar puntuaciones
                for i, score in enumerate(top_scores):
                    # Posición
                    pos_text = self.font.render(f"{i+1}", True, BLACK)
                    self.screen.blit(pos_text, (header_x[0], y))
                    
                    # Email (mostrar solo la parte antes de @)
                    email = score["email"].split('@')[0]
                    email_text = self.font.render(email, True, BLACK)
                    self.screen.blit(email_text, (header_x[1], y))
                    
                    # Puntuación
                    score_text = self.font.render(f"{score['score']}", True, BLACK)
                    self.screen.blit(score_text, (header_x[2], y))
                    
                    # Nivel
                    level_text = self.font.render(f"{score['level']}", True, BLACK)
                    self.screen.blit(level_text, (header_x[3], y))
                    
                    y += 40
            
            self.back_button.draw(self.screen, self.small_font)

if __name__ == "__main__":
    game = Game()
    game.run()