// Configuración de carga de Pyodide - Versión optimizada y solucionada
const loadPyodide = async () => {
  // Si ya tenemos una instancia cargada, retornarla directamente
  if (window.pyodide) {
    console.log('Usando instancia de Pyodide ya cargada');
    return window.pyodide;
  }
  
  // Mostrar información de carga
  console.log('Cargando Pyodide en:', navigator.userAgent);
  
  // Función para mostrar mensajes de estado
  const updateStatus = (text) => {
    console.log(`Estado: ${text}`);
    const output = document.getElementById('game-output');
    if (output) {
      const line = document.createElement('div');
      line.textContent = `[Sistema] ${text}`;
      line.style.color = '#4CAF50';
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }
  };
  
  // Cargar Pyodide con manejo de errores mejorado
  try {
    updateStatus('Preparando entorno Python...');
    
    // Comprobación previa del estado de la red
    try {
      const testResponse = await fetch('https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js', {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'cors',
        timeout: 3000
      });
      
      if (!testResponse.ok) {
        throw new Error(`Estado de respuesta: ${testResponse.status}`);
      }
    } catch (networkError) {
      console.error('Error de conexión al CDN:', networkError);
      updateStatus('Problema de conectividad detectado. Ejecutando en modo compatible...');
      throw new Error('No se puede acceder al CDN. Revisa tu conexión a internet.');
    }
    
    updateStatus('Cargando módulos básicos...');
    
    // Configuración optimizada para carga rápida
    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/",
      stdLibURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/python_stdlib.zip",
      stdout: (text) => {
        // Redirigir salida estándar
        console.log(text);
        const output = document.getElementById('game-output');
        if (output) {
          const line = document.createElement('div');
          line.textContent = text;
          output.appendChild(line);
          output.scrollTop = output.scrollHeight;
        }
      },
      stderr: (text) => {
        // Redirigir salida de error
        console.error(text);
        const output = document.getElementById('game-output');
        if (output) {
          const line = document.createElement('div');
          line.textContent = text;
          line.style.color = 'red';
          output.appendChild(line);
          output.scrollTop = output.scrollHeight;
        }
      }
    });
    
    updateStatus('✅ Entorno Python básico cargado');
    
    // Configuración minimalista
    try {
      await pyodide.runPythonAsync(`
        import sys
        print(f"Python {sys.version} listo")
      `);
    } catch (error) {
      console.error('Error en configuración básica:', error);
      updateStatus('⚠️ Modo de compatibilidad activado');
    }
    
    // Guardar la instancia para reutilización
    window.pyodide = pyodide;
    return pyodide;
  } catch (error) {
    console.error('Error fatal al cargar Pyodide:', error);
    
    const output = document.getElementById('game-output');
    if (output) {
      const line = document.createElement('div');
      line.textContent = `[Error] No se pudo cargar Python: ${error.message}`;
      line.style.color = 'red';
      line.style.fontWeight = 'bold';
      output.appendChild(line);
    }
    
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = `Error al cargar Python: ${error.message}. Prueba con otro navegador como Chrome o Edge.`;
    }
    
    // Lanzar el error para manejarlo en el llamador
    throw error;
  }
}; 