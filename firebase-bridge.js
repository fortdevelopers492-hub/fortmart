/**
 * Fort Mart Core Firebase Integration & Real-time Synchronization Gateway Bridge
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { 
    getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, deleteDoc, query, where,
    getCountFromServer 
} from "https://www.gstatic.com/firebasejs/12.14.0/firestore.js";

// Retrieve storage utilities and instance directly from global bridge
const { 
    storage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject 
} = window.FortMartFirebase;

// Your explicit project web configuration parameters
const firebaseConfig = {
    apiKey: "AIzaSyDYbg-Ywn6KQJLWYjsZcE6q6_AjOX4EUWE",
    authDomain: "fort-492.firebaseapp.com",
    projectId: "fort-492",
    storageBucket: "fort-492.firebasestorage.app",
    messagingSenderId: "255260729739",
    appId: "1:255260729739:web:9c20d200b571ec650d0f8e",
    measurementId: "G-R2L2GTVKNR"
};

// Initialize Firebase Core Instances
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state references inherited from your core app layout architecture
// These variables maintain local synchronization logic to avoid excessive reads
if (!window.SYSTEM_DATABASE) {
    window.SYSTEM_DATABASE = { users: [], products: [], chats: [], pinnedLeaderboard: [], networkSuiteEntities: [] };
}

/**
 * UTILITY: COMPRESS FILE WHEN UPLOADING
 * Downscales images below a target resolution canvas footprint to drastically reduce payload storage pressure.
 * Returns a raw Blob directly to ensure native compatibility with uploadBytesResumable streams.
 */
export async function compressVisualImagePayload(file, targetMaxWidth = 800) {
    return new Promise((resolve) => {
        if (!file.type || !file.type.startsWith('image/')) {
            resolve(file); // Return original File object if non-image format (e.g., zip, pdf)
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > targetMaxWidth) {
                    height = Math.round((height * targetMaxWidth) / width);
                    width = targetMaxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob); // Resolves raw Blob directly to prevent upload stream failures
                    } else {
                        resolve(file); // Fallback to original file if blob conversion yields null
                    }
                }, file.type, 0.75); // Compress with 75% visual output quality metric
            };

            img.onerror = () => resolve(file); // Fallback on image load error
        };

        reader.onerror = () => resolve(file); // Fallback on file read error
    });
}

/**
 * 1. REAL-TIME SYNCHRONIZATION LISTENERS
 * Listens for modifications on remote collections and propagates to UI elements instantly without manual page refreshes.
 */
export function initializeRealtimeDataSyncBridge() {
    // Sync Users System
    onSnapshot(collection(db, "users"), (snapshot) => {
        window.SYSTEM_DATABASE.users = [];
        snapshot.forEach((docSnap) => {
            window.SYSTEM_DATABASE.users.push(docSnap.data());
        });
        // Update local profile binding if current user data state mutated on backend context
        if (window.APP_STATE && window.APP_STATE.currentUser) {
            const freshProfileMatch = window.SYSTEM_DATABASE.users.find(u => u.uid === window.APP_STATE.currentUser.uid);
            if (freshProfileMatch) window.APP_STATE.currentUser = freshProfileMatch;
        }
    });

    // Sync Products Collection
    onSnapshot(collection(db, "products"), (snapshot) => {
        window.SYSTEM_DATABASE.products = [];
        snapshot.forEach((docSnap) => {
            window.SYSTEM_DATABASE.products.push(docSnap.data());
        });
        if (typeof window.renderMarketplaceProductsDisplayLoop === "function") {
            window.renderMarketplaceProductsDisplayLoop();
        }
    });

    // Sync Chats Core System
    onSnapshot(collection(db, "chats"), (snapshot) => {
        window.SYSTEM_DATABASE.chats = [];
        snapshot.forEach((docSnap) => {
            window.SYSTEM_DATABASE.chats.push(docSnap.data());
        });
        // Run clean lifecycle routine check to scrub items older than target date retention rules
        executeDataRetentionGarbageCollectorEngine();
        
        if (typeof window.refreshMessengerActiveStreamBubblesDisplayList === "function") {
            window.refreshMessengerActiveStreamBubblesDisplayList();
        }
        if (typeof window.renderUserConversationsLogRoster === "function") {
            window.renderUserConversationsLogRoster();
        }
    });
    
    // Sync Metadata / Pinned Leaderboard configuration arrays
    onSnapshot(doc(db, "system_metadata", "leaderboard"), (docSnap) => {
        if (docSnap.exists()) {
            window.SYSTEM_DATABASE.pinnedLeaderboard = docSnap.data().pinnedLeaderboard || [];
        }
    });
}

/**
 * 2. AUTHENTICATION CONTROLLER HANDLERS (Sign In, Sign Up, Forgot Password)
 */
export async function registerNewUserAccountRecord(signUpWizardData, profilePictureFileObj) {
    let profileImageUrlStr = "";
    
    if (profilePictureFileObj) {
        const compressedFile = await compressVisualImagePayload(profilePictureFileObj);
        const fileRef = ref(storage, `profiles/${Date.now()}_${profilePictureFileObj.name}`);
        const uploadTask = await uploadBytesResumable(fileRef, compressedFile);
        profileImageUrlStr = await getDownloadURL(uploadTask.ref);
    }

    const uniqueId = "u_" + Date.now();
    const finalNewUserRecord = {
        uid: uniqueId,
        identityName: signUpWizardData.identityName,
        accountType: signUpWizardData.accountType,
        country: signUpWizardData.country || "Nigeria",
        dialingCode: signUpWizardData.dialingCode || "+234",
        identifierText: signUpWizardData.identifierText, // email/phone entry string mapping
        secretKey: signUpWizardData.secretKey,
        avatar: profileImageUrlStr || "fort mart logo.png",
        verificationStatus: "verified", // User Correction Ledger Explicit Rule: Default state for new users is verified
        businessName: signUpWizardData.businessName || signUpWizardData.identityName,
        businessInfo: signUpWizardData.businessInfo || "No descriptions detailed yet."
    };

    // Save record securely to Firestore
    await setDoc(doc(db, "users", uniqueId), finalNewUserRecord);

    // Build automated welcome broadcast channel from operational admin infrastructure
    const welcomeChannelId = "chat_admin_" + uniqueId;
    const systemAdminWelcomeThreadNode = {
        chatId: welcomeChannelId,
        dynamicParticipants: ["admin", uniqueId],
        messageLog: [
            { mid: "wel1", senderUid: "admin", text: "Thanks for choosing Fort Mart. We are here with an amazing web app when it comes to online shopping. We wish you best of luck as you explore the market.", timestamp: new Date().toISOString() }
        ]
    };
    await setDoc(doc(db, "chats", welcomeChannelId), systemAdminWelcomeThreadNode);
    return finalNewUserRecord;
}

export async function loginUserAccountSession(identifierText, secretKey) {
    // Checks database baseline array state filled seamlessly via active snapshot streams
    const matchedAccount = window.SYSTEM_DATABASE.users.find(u => u.identifierText === identifierText && u.secretKey === secretKey);
    if (!matchedAccount) {
        throw new Error("Invalid access parameters context configuration tracking elements match error.");
    }
    return matchedAccount;
}

export async function resetUserPasswordTransaction(targetUid, newSecretKey) {
    const userDocRef = doc(db, "users", targetUid);
    await updateDoc(userDocRef, {
        secretKey: newSecretKey,
        password: newSecretKey
    });
}

/**
 * 3. INVENTORY MANAGEMENT MODULE METHODS (Upload, Edit, Delete Product)
 */
export async function uploadMarketplaceProductItem(name, category, info, price, rawFileObj, aiInfo) {
    if (!rawFileObj) throw new Error("A visual verification product media cover illustration photo file asset path is required.");
    
    // Check constraints size profile structure settings limit values
    if (rawFileObj.size > 250 * 1024 * 1024) {
        alert("maximum size exceeded");
        return;
    }

    const compressedFile = await compressVisualImagePayload(rawFileObj);
    const storagePathRef = ref(storage, `products/${Date.now()}_${rawFileObj.name}`);
    const uploadTask = await uploadBytesResumable(storagePathRef, compressedFile);
    const finalDownloadUrlStr = await getDownloadURL(uploadTask.ref);

    const productId = "p_" + Date.now();
    const finalProductInstanceObjectNode = {
        pid: productId,
        ownerUid: window.APP_STATE.currentUser.uid,
        name: name,
        category: category,
        info: info,
        price: parseFloat(price),
        coverPhoto: finalDownloadUrlStr,
        storagePath: storagePathRef.fullPath, // Documented path pointer hook context for accurate deletion
        aiInfo: aiInfo || "Standard platform baseline listed trading stock profile object reference specifications tracking structure model elements values data parameters.",
        clickCount: 0
    };

    await setDoc(doc(db, "products", productId), finalProductInstanceObjectNode);
}

export async function updateExistingProductInformation(productId, updatedFieldsMap) {
    const productDocRef = doc(db, "products", productId);
    await updateDoc(productDocRef, updatedFieldsMap);
}

export async function deleteProductPermanentlyFromSystem(productId) {
    const targetProductObj = window.SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!targetProductObj) return;

    // Remove text definition records from Firestore
    await deleteDoc(doc(db, "products", productId));

    // Remove file attachments cleanly out of Firebase Cloud Storage Bucket tracking nodes if reference exists
    if (targetProductObj.storagePath) {
        try {
            const fileStorageRef = ref(storage, targetProductObj.storagePath);
            await deleteObject(fileStorageRef);
        } catch (err) {
            console.error("Storage clean processing sequence trace failure intercept:", err);
        }
    }
}

/**
 * 4. MESSAGING SYSTEM REAL-TIME LAYER ENGINE
 */
export async function postRealtimeConversationMessageNode(chatId, messageTextStr, structuralRawFileBlob = null) {
    const currentChatInstance = window.SYSTEM_DATABASE.chats.find(c => c.chatId === chatId);
    if (!currentChatInstance) return;

    let attachedFileUrl = "";
    let attachedStoragePath = "";
    let containsFileFlag = false;

    if (structuralRawFileBlob) {
        if (structuralRawFileBlob.size > 250 * 1024 * 1024) {
            alert("maximum size exceeded");
            return;
        }
        containsFileFlag = true;
        const compressedBlob = await compressVisualImagePayload(structuralRawFileBlob);
        attachedStoragePath = `chats/${Date.now()}_${structuralRawFileBlob.name}`;
        const dataStorageRef = ref(storage, attachedStoragePath);
        const uploadTask = await uploadBytesResumable(dataStorageRef, compressedBlob);
        attachedFileUrl = await getDownloadURL(uploadTask.ref);
    }

    const newMessageElement = {
        mid: "m_" + Date.now(),
        senderUid: window.APP_STATE.currentUser.uid,
        text: messageTextStr || "",
        fileUrl: attachedFileUrl || null,
        storagePath: attachedStoragePath || null,
        hasFile: containsFileFlag,
        timestamp: new Date().toISOString()
    };

    const updatedLogArray = [...currentChatInstance.messageLog, newMessageElement];
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, { messageLog: updatedLogArray });
}

export async function deleteSingleMessageForAllParticipants(chatId, messageId) {
    const targetChat = window.SYSTEM_DATABASE.chats.find(c => c.chatId === chatId);
    if (!targetChat) return;

    const messageIndex = targetChat.messageLog.findIndex(m => m.mid === messageId);
    if (messageIndex === -1) return;

    const targetedMessageObj = targetChat.messageLog[messageIndex];

    // Wipe attached payload files cleanly out of cloud file server infrastructure buckets instantly
    if (targetedMessageObj.hasFile && targetedMessageObj.storagePath) {
        try {
            const assetBucketRef = ref(storage, targetedMessageObj.storagePath);
            await deleteObject(assetBucketRef);
        } catch (err) {
            console.error("Error clearing targeted file allocation map context asset row:", err);
        }
    }

    // Splice target record out from core chat stream timeline collection array context reference
    targetChat.messageLog.splice(messageIndex, 1);
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, { messageLog: targetChat.messageLog });
}

/**
 * 5. DATA RETENTION LIFE CYCLE SYSTEM RETENTION ENFORCER ENGINE
 * Automatic Data Scrub Execution Routine:
 * - Text from Fortmart lasts for 120 days.
 * - Shared chat file uploads are expunged permanently after 60 days.
 */
async function executeDataRetentionGarbageCollectorEngine() {
    const CURRENT_UNIX_TIME = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    window.SYSTEM_DATABASE.chats.forEach(async (chatTrackItem) => {
        let listWasMutated = false;
        const structuralFilteredMessageLogOutput = [];

        for (const messageNode of chatTrackItem.messageLog) {
            const timeDifferenceDays = (CURRENT_UNIX_TIME - new Date(messageNode.timestamp).getTime()) / MS_PER_DAY;
            
            if (messageNode.hasFile) {
                // Shared file attachment payload limits check cutoff rule: 60 days retention lifespan configuration rule
                if (timeDifferenceDays > 60) {
                    listWasMutated = true;
                    if (messageNode.storagePath) {
                        try {
                            await deleteObject(ref(storage, messageNode.storagePath));
                        } catch (e) { console.warn("Scrub validation lifecycle clear exception intercept:", e); }
                    }
                    continue; // Skip message insertion tracking array map index element block loop
                }
            } else {
                // Text from Fortmart notification trace limits check rule: 120 days retention timeline rules block
                if (timeDifferenceDays > 120) {
                    listWasMutated = true;
                    continue; // Purge completely from remote database row items matrix context
                }
            }
            structuralFilteredMessageLogOutput.push(messageNode);
        }

        if (listWasMutated) {
            const chatDocRef = doc(db, "chats", chatTrackItem.chatId);
            await updateDoc(chatDocRef, { messageLog: structuralFilteredMessageLogOutput });
        }
    });
}

// Automatically mount the initialization loop lifecycle onto runtime engine window context
window.addEventListener("DOMContentLoaded", () => {
    initializeRealtimeDataSyncBridge();
});