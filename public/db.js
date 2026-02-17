// IndexedDB para armazenar dados offline
const DB_NAME = 'BoxMotorsDB';
const DB_VERSION = 1;
let db;

// Inicializar banco de dados
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Tabela para registros de manutenção
      if (!database.objectStoreNames.contains('registros')) {
        const registrosStore = database.createObjectStore('registros', { keyPath: 'id' });
        registrosStore.createIndex('cliente', 'cliente', { unique: false });
      }

      // Tabela para garantias
      if (!database.objectStoreNames.contains('garantias')) {
        const garantiasStore = database.createObjectStore('garantias', { keyPath: 'id' });
        garantiasStore.createIndex('cliente', 'cliente', { unique: false });
      }

      // Tabela para fila de sincronização
      if (!database.objectStoreNames.contains('syncQueue')) {
        database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// ===== REGISTROS =====

// Obter todos os registros do banco local
function getRegistrosLocal() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['registros'], 'readonly');
    const store = transaction.objectStore('registros');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => b.id - a.id));
    };
  });
}

// Salvar registro localmente
function saveRegistroLocal(registro) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['registros'], 'readwrite');
    const store = transaction.objectStore('registros');
    const request = store.put(registro);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Deletar registro localmente
function deleteRegistroLocal(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['registros'], 'readwrite');
    const store = transaction.objectStore('registros');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ===== GARANTIAS =====

// Obter todas as garantias do banco local
function getGarantiasLocal() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['garantias'], 'readonly');
    const store = transaction.objectStore('garantias');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => b.id - a.id));
    };
  });
}

// Salvar garantia localmente
function saveGarantiaLocal(garantia) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['garantias'], 'readwrite');
    const store = transaction.objectStore('garantias');
    const request = store.put(garantia);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Deletar garantia localmente
function deleteGarantiaLocal(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['garantias'], 'readwrite');
    const store = transaction.objectStore('garantias');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ===== FILA DE SINCRONIZAÇÃO =====

// Adicionar ação à fila de sincronização
function addToSyncQueue(action, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.add({ action, data, timestamp: Date.now() });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Obter fila de sincronização
function getSyncQueue() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Remover item da fila
function removeFromSyncQueue(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Inicializar banco ao carregar o script
initDB().catch(err => console.error('Erro ao inicializar IndexedDB:', err));
