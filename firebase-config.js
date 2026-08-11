// firebase-config.js - Main Synchronous Initialization Engine
// Pushes Firebase production instances cleanly into the global runtime environment

(function() {
  // 1. Dynamic Injection of Firebase Core SDK scripts to avoid script-order crashes in HTML
  const modules = [
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics-compat.js"
  ];

  // Helper to load scripts sequentially before bootstrapping configuration mapping structures
  function loadFirebaseScripts(urls, callback) {
    if (urls.length === 0) return callback();
    const url = urls.shift();
    
    // Skip loading if already declared elsewhere in the DOM
    if (document.querySelector(`script[src="${url}"]`)) {
      return loadFirebaseScripts(urls, callback);
    }
    
    const script = document.createElement("script");
    script.src = url;
    script.async = false; // Forces sequential loading down the chain
    script.onload = () => loadFirebaseScripts(urls, callback);
    document.head.appendChild(script);
  }

  // 2. Your Official Firebase project structural credentials parameters block
  const firebaseConfig = {
    apiKey: "AIzaSyDYbg-Ywn6KQJLWYjsZcE6q6_AjOX4EUWE",
    authDomain: "fort-492.firebaseapp.com",
    projectId: "fort-492",
    storageBucket: "fort-492.firebasestorage.app",
    messagingSenderId: "255260729739",
    appId: "1:255260729739:web:9c20d200b571ec650d0f8e",
    measurementId: "G-R2L2GTVKNR"
  };

  // Start script chain execution loading loop
  loadFirebaseScripts(modules, function() {
    if (typeof firebase === "undefined") {
      console.error("Fort Mart Cloud Core Interface: Failed to load script engines from CDN network vectors.");
      return;
    }

    // Initialize Firebase App Instance context
    const app = firebase.initializeApp(firebaseConfig);
    
    // Establish primary services handles references 
    const db = firebase.firestore();
    const storage = firebase.storage();
    
    // Enable offline analytics logging 
    if (typeof firebase.analytics === "function") {
      firebase.analytics();
    }

    /**
     * UNIFIED TRANSLATION LAYER:
     * Exposes modern-looking function interfaces matching your codebase demands while using 
     * reliable, synchronous compat engines under the hood. Prevents crashes across all code files.
     */
    window.FortMartFirebase = {
      db: db,
      storage: storage,
      
      // Collection query routing: handles collection(dbRef, "path")
      collection: (dbRef, path) => db.collection(path),
      
      // Document queries translation layer: handles doc(db, "path", id) or doc(collectionRef, id)
      doc: (parentRef, pathOrId, optionalId) => {
        if (optionalId) {
          return db.collection(pathOrId).doc(optionalId);
        }
        if (parentRef && typeof parentRef.doc === 'function') {
          return parentRef.doc(pathOrId);
        }
        return db.doc(pathOrId);
      },
      
      // Real-time synchronization callback framework handler
      onSnapshot: (ref, callback) => ref.onSnapshot(callback),
      
      // Document manipulation data writing hooks
      setDoc: (docRef, data, options) => options ? docRef.set(data, options) : docRef.set(data),
      updateDoc: (docRef, data) => docRef.update(data),
      deleteDoc: (docRef) => docRef.delete(),
      
      // Storage file transactions upload vectors mapping targets
      ref: (storageRef, path) => storage.ref(path),
      uploadString: async (fileRef, dataString, format) => {
        // Formats data url blobs cleanly back down onto core structural byte fields
        const snapshot = await fileRef.putString(dataString, 'data_url');
        return snapshot;
      },
      getDownloadURL: (fileRef) => fileRef.getDownloadURL(),
      deleteObject: (fileRef) => fileRef.delete(),

      getCountFromServer: async (queryOrRef) => {
          // In SDK v10/v12 standard compat mode, count() is available on Query objects:
          const snapshot = await queryOrRef.count().get();
          return snapshot.data().count;
        },      
      
      // Advanced Data Filtering Engine Links wrappers
      query: (collectionRef, ...queryConstraints) => {
        let activeQuery = collectionRef;
        queryConstraints.forEach(constraint => {
          if (constraint && typeof constraint.applyTo === 'function') {
            activeQuery = constraint.applyTo(activeQuery);
          }
        });
        return activeQuery;
      },
      where: (fieldPath, operationStr, value) => {
        return {
          applyTo: (qRef) => qRef.where(fieldPath, operationStr, value)
        };
      }
    };

    console.log("🚀 Fort Mart Global Firebase Infrastructure Layer Synced & Ready!");
    
    // Automatically trigger app updates or re-initializations if functions exist on window
    if (typeof initializeProfileDetailsAccountManagementFieldsValues === "function") {
        initializeProfileDetailsAccountManagementFieldsValues();
    }
  });
})();