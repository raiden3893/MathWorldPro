// Solución de respaldo para cuando Pyodide falla o no se carga correctamente
window.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando respaldo de juego');
  
  // Función para iniciar la simulación de respaldo
  window.startFallbackGame = function(gameName) {
    console.log('Iniciando simulación de respaldo para:', gameName);
    
    // Verificar elementos necesarios
    const canvas = document.getElementById('game-canvas');
    const output = document.getElementById('game-output');
    const loading = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-container');
    
    if (!canvas) {
      console.error('No se encontró el elemento canvas');
      return;
    }
    
    // Función para agregar mensajes al output
    const addMessage = (text, color = 'white') => {
      if (output) {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.color = color;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
      }
      console.log(text);
    };
    
    // Ocultar el indicador de carga si existe
    if (loading) {
      loading.style.display = 'none';
    }
    
    // Limpiar mensajes anteriores
    if (output) {
      output.innerHTML = '';
    }
    
    // Limpiar mensajes de error
    if (errorContainer) {
      errorContainer.textContent = '';
    }
    
    // Obtener el contexto del canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }
    
    // Limpiar el canvas
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar título del juego
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameName, canvas.width/2, 60);
    
    // Dibujar mensaje de simulación
    ctx.font = '20px Arial';
    ctx.fillText('Simulación de Juego', canvas.width/2, 120);
    
    // Generar algunas estrellas como elementos decorativos
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Dibujar "planeta" como elemento central
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar órbita
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 150, 0, Math.PI * 2);
    ctx.stroke();
    
    // Dibujar "nave espacial" que se moverá en la órbita
    let angle = 0;
    const drawFrame = () => {
      // Limpiar solo la zona de la órbita
      ctx.fillStyle = '#000033';
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, 170, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillRect(canvas.width/2 - 170, canvas.height/2 - 170, 340, 340);
      
      // Redibujar órbita
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, 150, 0, Math.PI * 2);
      ctx.stroke();
      
      // Calcular posición de la nave
      const x = canvas.width/2 + Math.cos(angle) * 150;
      const y = canvas.height/2 + Math.sin(angle) * 150;
      
      // Dibujar la "nave"
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.moveTo(x + 15 * Math.cos(angle), y + 15 * Math.sin(angle));
      ctx.lineTo(x + 10 * Math.cos(angle + 2.5), y + 10 * Math.sin(angle + 2.5));
      ctx.lineTo(x + 10 * Math.cos(angle - 2.5), y + 10 * Math.sin(angle - 2.5));
      ctx.fill();
      
      // Actualizar ángulo para la siguiente animación
      angle += 0.02;
      
      // Continuar la animación
      requestAnimationFrame(drawFrame);
    };
    
    // Mostrar mensajes simulados
    addMessage('Iniciando juego...');
    
    // Iniciar la animación
    drawFrame();
    
    // Simular mensajes de carga con retraso
    setTimeout(() => addMessage('Cargando recursos...'), 500);
    setTimeout(() => addMessage('Configurando niveles de juego...'), 1200);
    setTimeout(() => addMessage('Simulación lista. Disfruta del juego demo.'), 2000);
  };
  
  // Verificar si después de 8 segundos todavía no se ha cargado el juego principal
  setTimeout(() => {
    const loading = document.getElementById('loading-indicator');
    if (loading && loading.style.display !== 'none') {
      console.log('Detectada carga prolongada, iniciando respaldo');
      const gamePathElement = document.getElementById('game-path');
      const gameName = gamePathElement ? gamePathElement.value : 'Demo';
      window.startFallbackGame(gameName);
    }
  }, 8000);
}); 