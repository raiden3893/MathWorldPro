import numpy as np
import matplotlib.pyplot as plt
import pygame
from io import BytesIO

class EquationGenerator:
    def __init__(self):
        self.equation_types = [
            self.linear,
            self.quadratic,
            self.cubic,
            self.sine,
            self.exponential
        ]

    def generate(self):
        # Seleccionar tipo de ecuación aleatoria
        eq_func = np.random.choice(self.equation_types)

        # Generar ecuación correcta y su gráfica
        eq, x, y = eq_func()
        correct_graph = self.create_graph_surface(x, y)

        # Generar gráficas incorrectas
        wrong_graphs = []
        attempts = 0
        max_attempts = 10

        while len(wrong_graphs) < 5 and attempts < max_attempts:  # Generar más gráficas para soportar más puertas
            wrong_eq_func = np.random.choice(self.equation_types)
            wrong_eq, wx, wy = wrong_eq_func()
            if not np.array_equal(y, wy):  # Asegurar que sea diferente
                wrong_graphs.append(self.create_graph_surface(wx, wy))
            attempts += 1

        return eq, correct_graph, wrong_graphs

    def create_graph_surface(self, x, y, color='b'):
        plt.figure(figsize=(3, 2))
        plt.plot(x, y, f'{color}-')
        plt.grid(True)
        plt.axhline(y=0, color='k', linestyle='-', linewidth=0.5)
        plt.axvline(x=0, color='k', linestyle='-', linewidth=0.5)

        # Ajustar límites
        plt.xlim(-5, 5)
        plt.ylim(-5, 5)

        # Convertir plot a surface de Pygame
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        plt.close()
        buffer.seek(0)

        image = pygame.image.load(buffer)
        buffer.close()
        return image

    def create_example_graph(self, equation):
        """Crear una gráfica de ejemplo para el tutorial"""
        x = np.linspace(-5, 5, 100)

        # Evaluar la ecuación
        if "sin" in equation:
            y = np.sin(x)
        elif "e^x" in equation:
            y = np.exp(x)
        elif "log" in equation:
            y = np.log(x + 6)  # Desplazamiento para evitar log(0)
        elif "|x|" in equation:
            y = np.abs(x)
        elif "cos" in equation:
            y = np.cos(x)
        elif "^" in equation:
            try:
                base = float(equation.split('^')[0].split('=')[1].strip())
                y = base**x
            except ValueError:
                y = 2**x  # valor por defecto si hay error
        elif "³" in equation or "x^3" in equation:
            y = x**3
        elif "²" in equation or "x^2" in equation:
            # Extraer coeficientes de la ecuación cuadrática
            try:
                # Intentar con notación x^2
                if "x^2" in equation:
                    parts = equation.split('=')[1].strip().split('x^2')
                else:  # Notación con ²
                    parts = equation.split('=')[1].strip().split('x²')
                
                a = float(parts[0] if parts[0].strip() else "1")
                b_c = parts[1].strip() if len(parts) > 1 else "0"

                if not b_c:
                    b, c = 0, 0
                elif '+' in b_c:
                    b, c = map(float, b_c.replace('+', ' ').split())
                elif '-' in b_c:
                    b, c = map(float, b_c.replace('-', ' -').split())
                else:
                    b = float(b_c.replace('x', ''))
                    c = 0
            except (IndexError, ValueError):
                a, b, c = 1, 0, 0
            y = a * x**2 + b * x + c
        else:
            # Ecuación lineal por defecto
            y = 2 * x + 1

        return self.create_graph_surface(x, y, 'r')

    def linear(self):
        m = np.random.randint(-3, 4)
        b = np.random.randint(-3, 4)
        x = np.linspace(-5, 5, 100)
        y = m * x + b
        return f"y = {m}x + {b}", x, y

    def quadratic(self):
        a = np.random.choice([-2, -1, 1, 2])
        b = np.random.randint(-3, 4)
        c = np.random.randint(-3, 4)
        x = np.linspace(-5, 5, 100)
        y = a * x**2 + b * x + c
        return f"y = {a}x² + {b}x + {c}", x, y

    def cubic(self):
        a = np.random.choice([-1, 1])
        x = np.linspace(-5, 5, 100)
        y = a * x**3
        return f"y = {a}x³", x, y

    def sine(self):
        a = np.random.choice([1, 2])
        b = np.random.choice([1, 2])
        x = np.linspace(-5, 5, 100)
        y = a * np.sin(b * x)
        return f"y = {a}sin({b}x)", x, y

    def exponential(self):
        a = np.random.choice([0.5, 2])
        x = np.linspace(-5, 5, 100)
        y = a**x
        return f"y = {a}^x", x, y