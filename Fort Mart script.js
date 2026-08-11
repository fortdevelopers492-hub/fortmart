/**
 * Fort Mart Core Single-Page Application Application State Machine Archetype
 */

// Global App State Data Layer Initialization
let APP_STATE = {
    deviceMode: 'laptop', 
    currentUser: null,    
    activeViewPage: 'home',
    navbarExpanded: true,
    categoryDrawerOpen: false,
    currentSelectedCategory: 'Trending',
    searchQuery: '',
    chatConfiguration: {
        notificationsEnabled: true,
        autoReplyEnabled: false,
        autoReplyMessageText: "Thank you for contacting us. We will evaluate your query and message you shortly.",
        autoDownloadEnabled: false
    },
    activeChatTargetUserHash: null,
    selectedMessageNodesCollection: [],
    fortAiActiveTaggedProductObject: null
};

// Local System Caching Array State - Preserving Default Admin, Sarah,starboyosaro492 and Account Manager accounts
let SYSTEM_DATABASE = {
    users: [
        { uid: "admin", identityName: "Fort Mart Admin", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "fortdevelopers492@gmail.com", secretKey: "Fortmart492#", avatar: "Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Core Operations", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified" },
        { uid: "account_manager", identityName: "Fort Mart Account Manager", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "starboyosaro492@gmail.com", secretKey: "Fortmart492#", avatar:"Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Account Manager", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified"  }
    ],
    products: [],
    chats: [],
    networkSuiteEntities: [],
    pinnedLeaderboard: [] 
};

// Destructure references comprehensively from your main global Firebase configuration script
const { db, collection, onSnapshot, doc, setDoc, updateDoc, getCountFromServer } = window.FortMartFirebase;

/**
 * REAL-TIME DATABASE LIFECYCLE LISTENERS
 * Syncs Firestore changes into your SYSTEM_DATABASE cache while preserving hardcoded defaults.
 */
function initializeRealtimeSystemSync() {
    // 1. Live Sync Users (Appends Firebase users while preserving all three hardcoded baseline profiles securely)
    onSnapshot(collection(db, "users"), (snapshot) => {
        // Reset to default accounts first to avoid infinite duplication arrays on snapshot triggers
        SYSTEM_DATABASE.users = [
            { uid: "admin", identityName: "Fort Mart Admin", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "fortdevelopers492@gmail.com", secretKey: "Fortmart492#", avatar: "Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Core Operations", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified" },
            { uid: "account_manager", identityName: "Fort Mart Account Manager", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "starboyosaro492@gmail.com", secretKey: "Fortmart492#", avatar:"Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Account Manager", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified"  }
        ];
        
        snapshot.forEach(doc => {
            let userData = doc.data();
            // Avoid adding duplicate profiles if core system infrastructure default profiles exist inside Firestore collections
            if (userData.uid !== "admin" && userData.uid !== "user_sarah" && userData.uid !== "account_manager") {
                SYSTEM_DATABASE.users.push(userData);
            }
        });
        updateClientSessionContextState();
    });

    // 2. Live Sync Products
    onSnapshot(collection(db, "products"), (snapshot) => {
        SYSTEM_DATABASE.products = [];
        snapshot.forEach(doc => SYSTEM_DATABASE.products.push(doc.data()));
        if (typeof renderMarketplaceProductsDisplayLoop === "function") {
            renderMarketplaceProductsDisplayLoop(); 
        }
    });

    // 3. Live Sync Chats & Automated Retention Enforcement
    onSnapshot(collection(db, "chats"), (snapshot) => {
        SYSTEM_DATABASE.chats = [];
        snapshot.forEach(doc => {
            let data = doc.data();
            data.messageLog = executeDataRetentionLifespanCleanup(data.messageLog || [], doc.id);
            SYSTEM_DATABASE.chats.push(data);
        });
        if (typeof refreshMessengerActiveStreamBubblesDisplayList === "function") {
            refreshMessengerActiveStreamBubblesDisplayList();
        }
        if (typeof renderUserConversationsLogRoster === "function") {
            renderUserConversationsLogRoster();
        }
    });

    // 4. Live Sync Configuration Settings (Leaderboard Pins)
    onSnapshot(doc(db, "system_metadata", "leaderboardConfig"), (docSnap) => {
        if (docSnap.exists()) {
            window.SYSTEM_DATABASE.pinnedLeaderboard = docSnap.data().pinnedLeaderboard || [];
        } else {
            window.SYSTEM_DATABASE.pinnedLeaderboard = [];
        }
        if (typeof renderMarketplaceProductsDisplayLoop === "function") {
            renderMarketplaceProductsDisplayLoop();
        }
    });
}

/**
 * Data Retention Lifecycle Filter Module
 * Automated rules: Text is wiped after 120 days, and files are wiped after 60 days.
 */
function executeDataRetentionLifespanCleanup(messageLog, chatId) {
    const now = Date.now();
    const hundredTwentyDaysMs = 120 * 24 * 60 * 60 * 1000;
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    
    let updatedLog = messageLog.filter(msg => {
        const extractedTimestamp = msg.mid ? parseInt(msg.mid.split("_")[1], 10) : null;
        const msgTime = extractedTimestamp || new Date(msg.timestamp).getTime() || now;
        const age = now - msgTime;
        
        if (msg.fileUrl || msg.isFile || msg.hasFile) {
            return age < sixtyDaysMs; // Keep shared file attachment vectors only if under 60 days
        } else {
            return age < hundredTwentyDaysMs; // Keep text logs under 120 days
        }
    });

    if (updatedLog.length !== messageLog.length) {
        updateDoc(doc(db, "chats", chatId), {
            messageLog: updatedLog
        }).catch(err => console.error("Data retention transaction write-back fault: ", err));
    }
    return updatedLog;
}

/**
 * Keeps current logged-in session context responsive if values shift online
 */
function updateClientSessionContextState() {
    if (APP_STATE.currentUser) {
        const freshUserRecord = SYSTEM_DATABASE.users.find(u => u.uid === APP_STATE.currentUser.uid);
        if (freshUserRecord) {
            APP_STATE.currentUser = freshUserRecord;
            const avatarFrame = document.getElementById("nav-user-avatar");
            if (avatarFrame) avatarFrame.src = freshUserRecord.avatar || "fort mart logo.png";
        }
    }
}

/**
 * Consolidated State Saving Abstract Wrapper (Firebase Compatible Replace for legacy storage saves)
 */
function administrativeSaveAndRefreshDisplay(activeProductId = null) {
    if (typeof renderMarketplaceProductsDisplayLoop === "function") {
        renderMarketplaceProductsDisplayLoop();
    }
    if (activeProductId && typeof launchComprehensiveProductSpecificationsExpandedModalView === "function") {
        launchComprehensiveProductSpecificationsExpandedModalView(activeProductId);
    }
}

/**
 * Fort Mart Preloader and Progress Meter Controller Hook
 */
function initPreloaderAnimation() {
    const preloader = document.getElementById("preloader-container");
    const progressBar = document.getElementById("preloader-progress-bar");
    const progressText = document.getElementById("preloader-percentage-text");

    if (!preloader || !progressBar) return;

    let progress = 0;
    const duration = 3000; // Total loading screen time (3 seconds)
    const intervalTime = 30; // Update step resolution in milliseconds
    const step = (intervalTime / duration) * 100;

    const progressInterval = setInterval(() => {
        progress += step;

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Turn completely solid blue in its final stage
            progressBar.classList.add("fully-complete");
            progressBar.style.width = "100%";
            if (progressText) progressText.innerText = "Ready!";

            // Smoothly remove preloader after reaching full status
            setTimeout(() => {
                preloader.classList.add("fade-out");
                
                // Let other state machine rendering scripts safely execute after opening
                if (typeof initApplicationState === 'function') {
                    initApplicationState();
                }
            }, 400); // Tiny delay to let the user see the 100% complete state
        } else {
            progressBar.style.width = `${progress}%`;
            if (progressText) progressText.innerText = `Loading ${Math.floor(progress)}%`;

            // Change to complete blue within the last 1-2 seconds of loading 
            if (progress >= 66) { 
                progressBar.classList.add("fully-complete");
            }
        }
    }, intervalTime);
}

// Safely launch whether DOM is already loaded or still loading
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPreloaderAnimation);
} else {
    initPreloaderAnimation();
}

/**
 * Sets a secure browser cookie optimized for HTTPS, HTTP, and local filesystem environments
 */
function setSecureAuthCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    
    const protocol = window.location.protocol;
    let cookieString = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    
    if (protocol === "https:") {
        cookieString += "; Secure; SameSite=Strict";
        document.cookie = cookieString;
    } else if (protocol === "http:") {
        cookieString += "; SameSite=Lax";
        document.cookie = cookieString;
    } else {
        // file:// fallback context — cookies are blocked, logging silently
        console.warn("Cookies are not supported on the current protocol context:", protocol);
    }
}

/**
 * Gets a cookie value cleanly by string splitting parameters
 */
function getSecureAuthCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

/**
 * Erases a secure browser cookie token profile reference
 */
function eraseSecureAuthCookie(name) {
    setSecureAuthCookie(name, "", -1);
}

// System Init Bootstrap Hook Lifecycle Engine Activation Loop
window.addEventListener("DOMContentLoaded", () => {
    // 1. Establish the realtime sync channels to download users and products
    initializeRealtimeSystemSync();
    
    // 2. Render static layout nodes
    if (typeof buildCategoryRibbonFilterInterfaceElements === "function") {
        buildCategoryRibbonFilterInterfaceElements();
    }
    if (typeof populateNetworkSuiteExtensionsDisplayView === "function") {
        populateNetworkSuiteExtensionsDisplayView();
    }

    // 3. RUN THE SESSION RESTORATION (Checks cookies/localStorage fallbacks)
    if (typeof triggerAuthenticationModalSequence === "function") {
        triggerAuthenticationModalSequence();
    }
});

/**
 * Structural Architecture, Layout & View Rendering Module Engines
 */
function toggleSideDrawer() {
    const drawerNode = document.getElementById("side-drawer");
    
    // Check screen width instead of a manual state
    if (window.innerWidth <= 1024) {
        drawerNode.classList.toggle("active-phone-drawer");
    } else {
        drawerNode.classList.toggle("closed");
    }
}

// Close phone responsive side layouts drawer automatically upon completion
if (window.innerWidth <= 1024) {
    const sideDrawer = document.getElementById("side-drawer");
    if (sideDrawer) sideDrawer.classList.remove("active-phone-drawer");
}

function navigateToPage(targetPageId) {
    // Intercept Gate: Require validation state before access maps logic blocks
    if(!APP_STATE.currentUser && targetPageId !== 'home') {
        triggerAuthenticationModalSequence();
        return;
    }
    
    // Hide all architectural pages views nodes
    document.querySelectorAll(".view-page").forEach(page => {
        page.classList.add("hidden-view");
        page.classList.remove("active-view");
    });
    
    const targetedPageElement = document.getElementById(`page-${targetPageId}`);
    if(targetedPageElement) {
        targetedPageElement.classList.add("active-view");
        targetedPageElement.classList.remove("hidden-view");
        APP_STATE.activeViewPage = targetPageId;
    }
    
    // Close phone responsive side layouts drawer automatically upon completion
    if(APP_STATE.deviceMode === 'phone') {
        const sideDrawer = document.getElementById("side-drawer");
        if(sideDrawer) sideDrawer.classList.remove("active-phone-drawer");
    }
    
    // Update structural layouts dynamically based on sub page scopes
    const searchBarPlaceholder = document.getElementById("global-search-bar");
    if(searchBarPlaceholder) {
        if(targetPageId === 'home') {
            searchBarPlaceholder.placeholder = "Search Products……";
        } else if(targetPageId === 'messages') {
            searchBarPlaceholder.placeholder = "Search Chats……";
            // Ensure live messages list updates from active Firebase database cache instantly
            if (typeof renderUserConversationsLogRoster === "function") {
                renderUserConversationsLogRoster();
            }
        } else if(targetPageId === 'my-account') {
            searchBarPlaceholder.placeholder = "Search Settings……";
            if (typeof initializeProfileDetailsAccountManagementFieldsValues === "function") {
                initializeProfileDetailsAccountManagementFieldsValues();
            }
        } else if (targetPageId === 'admin-dashboard') {
            searchBarPlaceholder.placeholder = "Search Users....."
            if (typeof renderAdminUsersManagementList === "function") {
                renderAdminUsersManagementList();
            }
        } else {
            // Default safe fallback placeholder when viewing admin control center or Fort-AI console
            searchBarPlaceholder.placeholder = "Search Fort Mart……";
        }
    }
    
    // Execute module-specific initializations with protective safety checks
    if(targetPageId === 'fort-ai') {
        if (typeof initializeFortAiChatWindowWorkspace === "function") {
            initializeFortAiChatWindowWorkspace();
        }
    } else if (targetPageId === 'admin') {
        // Fix layout mapping target from 'admin-nav-item' to 'admin'
        if (typeof renderAdminUsersManagementList === "function") {
            renderAdminUsersManagementList();
        }
    }
}

/**
 * Complete Universal Modal Step-Workflow Lifecycle Framework Management Core
 */
function displayConfirmationModalOverlayAction(messageStringText, callbackFunctionReference) {
    const confirmModalNode = document.getElementById("confirm-modal");
    document.getElementById("confirm-modal-text").innerText = messageStringText;
    confirmModalNode.classList.add("active");
    
    const yesButtonNode = document.getElementById("confirm-yes-btn");
    const noButtonNode = document.getElementById("confirm-no-btn");

    const cleanYesNode = yesButtonNode.cloneNode(true);
    const cleanNoNode = noButtonNode.cloneNode(true);
    yesButtonNode.parentNode.replaceChild(cleanYesNode, yesButtonNode);
    noButtonNode.parentNode.replaceChild(cleanNoNode, noButtonNode);

    cleanYesNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
        callbackFunctionReference();
    });
    cleanNoNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
    });
}

// 1. Closes the main modal directly
function closeActiveModalDirectly(modalElementId) {
    const modalNode = document.getElementById(modalElementId);
    if (modalNode) {
        modalNode.classList.remove("active");
    }
}

// 2. Initiates the confirmation flow
function closeActiveModalWithConfirmationFlow(modalElementId) {
    displayConfirmationModalOverlayAction(
        "Are you sure you want to exit this window? Progress or entered structural fields changes may be permanently lost.", 
        () => {
            // This is the callback that runs ONLY when "Yes" is clicked
            closeActiveModalDirectly(modalElementId);
        }
    );
}

// 3. The confirmation handler (Make sure your function looks like this)
function displayConfirmationModalOverlayAction(message, onConfirmCallback) {
    const confirmModal = document.getElementById("confirmationModal");
    const confirmMessage = document.getElementById("confirmationMessage");
    const yesButton = document.getElementById("confirmYesBtn");
    const noButton = document.getElementById("confirmNoBtn");

    if (!confirmModal || !confirmMessage || !yesButton || !noButton) {
        console.error("Confirmation modal DOM elements missing.");
        return;
    }

    // Set the dynamic warning message
    confirmMessage.textContent = message;

    // Show the confirmation modal
    confirmModal.classList.add("active");

    // Clean up old event listeners to prevent duplicate triggers
    const newYesButton = yesButton.cloneNode(true);
    const newNoButton = noButton.cloneNode(true);
    yesButton.parentNode.replaceChild(newYesButton, yesButton);
    noButton.parentNode.replaceChild(newNoButton, noButton);

    // YES Flow: Run the callback (close main modal) and hide confirmation
    newYesButton.addEventListener("click", () => {
        onConfirmCallback(); 
        confirmModal.classList.remove("active");
    });

    // NO Flow: Just hide the confirmation modal, leaving the main modal open
    newNoButton.addEventListener("click", () => {
        confirmModal.classList.remove("active");
    });
}

/**
 * =========================================================================
 * COMPLETE ACCOUNTS AUTHENTICATION SUBSYSTEM (FIREBASE & DUAL-LAYER STORAGE)
 * =========================================================================
 */
/**
 * Authentication Sequence initializing via Cookies with a Local Storage fallback for file:// protocols
 */
/**
 * Authentication Sequence initializing via Cookies with a Local Storage fallback for file:// protocols
 */
async function triggerAuthenticationModalSequence() {
    try {
        let savedUid = getSecureAuthCookie("fort_mart_logged_uid");

        if (!savedUid) {
            savedUid = localStorage.getItem("fort_mart_cookie_fallback_uid");
        }

        if (savedUid) {
            let accountRecordMatch = null;

            // Target A: Look inside the local memory cache matrix
            if (typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
                accountRecordMatch = SYSTEM_DATABASE.users.find(u => u.uid === savedUid);
            }

            // Target B: ASYNC FALLBACK - If Firestore snapshot hasn't finished loading yet, pull directly from server doc link!
            if (!accountRecordMatch && window.FortMartFirebase) {
                const { db, doc, getDoc } = window.FortMartFirebase;
                const userDocRef = doc(db, "users", savedUid);
                const userSnapshot = await getDoc(userDocRef);
                
                if (userSnapshot.exists()) {
                    accountRecordMatch = userSnapshot.data();
                }
            }

            if (accountRecordMatch) {
                finalizeSuccessfulAuthenticationSequence(accountRecordMatch);
                return;
            } else {
                eraseSecureAuthCookie("fort_mart_logged_uid");
                localStorage.removeItem("fort_mart_cookie_fallback_uid");
            }
        }
    } catch (e) {
        console.error("Authentication initialization exception context:", e);
        eraseSecureAuthCookie("fort_mart_logged_uid");
        localStorage.removeItem("fort_mart_cookie_fallback_uid");
    }

    // Show authentication prompt modal if no active verification context matches
    renderSignInModalStepContentLayout();
    document.getElementById("auth-modal").classList.add("active");
}

/**
 * Renders the default Sign-In interface view inside the authentication modal target wrapper
 */
function renderSignInModalStepContentLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h2>Sign In to Fort Mart</h2>

        <div class="form-input-container">
            <label>Select Preferred Location:</label>
            <select id="auth-signin-country" class="form-field-control">
                <option value="Nigeria|+234">Nigeria (+234)</option>
            </select>
        </div>
      
        <div class="form-input-container">
            <label>Input Registered Email Address:</label>
            <input type="text" name="email" id="auth-signin-identifier" class="form-field-control" placeholder="Input registered email address" oninput="if(typeof executeLiveProfilePictureLookup === 'function') executeLiveProfilePictureLookup(this.value)">
            <div id="err-signin-identifier" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>
        <div class="form-input-container">
            <label>Account Password:</label>
            <input type="password" id="auth-signin-password" class="form-field-control" placeholder="Enter password">
            <div id="err-signin-password" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>            
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-signin-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'auth-signin-password')">
            <label for="chk-signin-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-signin-rememberme">
            <label for="chk-signin-rememberme" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Remember Me</label>            
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>
        <div class="btn-group" style="margin-top: 15px;">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button id="btn-signin-submit-action" onclick="executeAccountSignInAuthenticationRequest()" class="btn-blue">Sign In</button>
        </div>
        <div class="text-center margin-top-sm" style="font-size:0.9rem;">
            <span>Don't have an account? </span><strong style="color:var(--fort-blue-light); cursor:pointer;" onclick="renderSignUpModalWizardStepOne()">Sign up</strong>
        </div>
    `;
}

/**
 * Utility helper toggling clear-text/password field visibility states dynamically
 */
function toggleFormPasswordFieldVisibility(checkboxElement, targetPasswordFieldId) {
    const passwordField = document.getElementById(targetPasswordFieldId);
    if (passwordField) {
        passwordField.type = checkboxElement.checked ? "text" : "password";
    }
}

/**
 * Fetches targeted account dataset from Cloud Firestore Server or falls back to local storage,
 * and records authentication properties cleanly across cookies and storage fallback vectors.
 */
async function executeAccountSignInAuthenticationRequest() {
    const countryDropdownParts = document.getElementById("auth-signin-country").value.split("|");
 
    const targetDialingCode = countryDropdownParts[1]; 
    const identifierInput = document.getElementById("auth-signin-identifier").value.trim().toLowerCase();
    const passwordInput = document.getElementById("auth-signin-password").value;
    
    const errIdNode = document.getElementById("err-signin-identifier");
    const errPassNode = document.getElementById("err-signin-password");
    const submitBtn = document.getElementById("btn-signin-submit-action");
    
    errIdNode.classList.add("hidden-node");
    errPassNode.classList.add("hidden-node");
    errIdNode.innerText = "";
    errPassNode.innerText = "";

    if (identifierInput === "") {
        errIdNode.innerText = "Identification data field input cannot be empty.";
        errIdNode.classList.remove("hidden-node");
        return;
    }
    
    if (passwordInput === "") {
        errPassNode.innerText = "Password structural input field cannot be empty.";
        errPassNode.classList.remove("hidden-node");
        return;
    }
    
    if (submitBtn) submitBtn.disabled = true;

    try {
        let accountRecordMatch = null;

        // 1. First target: Query the live Firebase/Firestore server instance
        if (window.FortMartFirebase) {
            const { db, collection, getDocs, query, where } = window.FortMartFirebase;
            const remoteQueryInstance = query(
                collection(db, "users"), 
                where("dialingCode", "==", targetDialingCode),
                where("identifierText", "==", identifierInput)
            );
            const fetchedRecordsSnapshot = await getDocs(remoteQueryInstance);

            if (!fetchedRecordsSnapshot.empty) {
                accountRecordMatch = fetchedRecordsSnapshot.docs[0].data();
            }
        }

        // 2. Second target fallback: Query the local SYSTEM_DATABASE cache matrix
        if (!accountRecordMatch && typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
            accountRecordMatch = SYSTEM_DATABASE.users.find(u =>
                u.dialingCode === targetDialingCode &&
                (u.identifierText.toLowerCase() === identifierInput || (u.email && u.email.toLowerCase() === identifierInput))
            );
        }

        if (!accountRecordMatch) {
            errIdNode.innerText = "No registered matching account found for specified credentials.";
            errIdNode.classList.remove("hidden-node");
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        // Verify tracking credential mutations alignment
        const isCredentialValid = accountRecordMatch.secretKey === passwordInput || accountRecordMatch.password === passwordInput;
        
        if (!isCredentialValid) {
            errPassNode.innerText = "Incorrect Password.";
            errPassNode.classList.remove("hidden-node");
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        // Evaluate 'Remember Me' preference to commit persistent or session token profiles
        const rememberMeChecked = document.getElementById("chk-signin-rememberme").checked;
        if (rememberMeChecked) {
            // Set persistent 7-day cookie (HTTPS/HTTP) + backup fallback key (file://)
            setSecureAuthCookie("fort_mart_logged_uid", accountRecordMatch.uid, 7);
            localStorage.setItem("fort_mart_cookie_fallback_uid", accountRecordMatch.uid);
        } else {
            // Session validation context only
            setSecureAuthCookie("fort_mart_logged_uid", accountRecordMatch.uid, null);
            localStorage.removeItem("fort_mart_cookie_fallback_uid");
        }

        // Synchronize state down to local baseline caches
        if (typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
            const localIndex = SYSTEM_DATABASE.users.findIndex(u => u.uid === accountRecordMatch.uid);
            if (localIndex === -1) {
                SYSTEM_DATABASE.users.push(accountRecordMatch);
            } else {
                SYSTEM_DATABASE.users[localIndex] = accountRecordMatch;
            }
        }
        
        if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
            syncPlatformDatabaseStateToWebStorage();
        }

        finalizeSuccessfulAuthenticationSequence(accountRecordMatch);

    } catch (err) {
        console.error("Critical authentication handshake exception intercept tracker log:", err);
        errIdNode.innerText = "Secure Connection Interrupted: Failed to pull data values cleanly from server.";
        errIdNode.classList.remove("hidden-node");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/**
 * Shared helper utility containing common success operations and UI layout modifications
 */
function finalizeSuccessfulAuthenticationSequence(accountRecordMatch) {
    if (typeof APP_STATE === 'undefined') {
        window.APP_STATE = {};
    }

    APP_STATE.currentUser = accountRecordMatch;

    if (typeof closeActiveModalDirectly === "function") {
        closeActiveModalDirectly('auth-modal');
    } else {
        const modal = document.getElementById("auth-modal");
        if (modal) modal.classList.remove("active");
    }
    
    const adminNavItem = document.getElementById("admin-nav-item");
    const adminSuiteBtn = document.getElementById("admin-add-suite-site-btn");
    
    if (accountRecordMatch.uid === 'admin') {
        if (adminNavItem) adminNavItem.classList.remove("hidden-admin-node");
        if (adminSuiteBtn) adminSuiteBtn.classList.remove("hidden-node");
    } else {
        if (adminNavItem) adminNavItem.classList.add("hidden-admin-node");
        if (adminSuiteBtn) adminSuiteBtn.classList.add("hidden-node");
    }
    
    const userAvatarFrame = document.getElementById("nav-user-avatar");
    if (userAvatarFrame) {
        userAvatarFrame.src = accountRecordMatch.avatar || "fort mart logo.png";
    }
    
    syncDrawerGuestTerminalNodeToActiveUser();
    changelogoutosignupviceVersa();

    const welcomeModal = document.getElementById("welcome-modal");
    if (welcomeModal) {
        welcomeModal.classList.add("active");
    }
    
    if (typeof renderMarketplaceProductsDisplayLoop === "function") {
        renderMarketplaceProductsDisplayLoop();
    }
}

/**
 * Registration System Multi-step Engine Framework Array
 * Optimized for direct Firebase Firestore document ID configurations.
 */
let SIGNUP_WIZARD_TEMPORARY_OBJECT = {};

function renderSignUpModalWizardStepOne() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Provide Contact (Step 1 of 4)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Select Preferred Location:</label>
            <select id="reg-country" class="form-field-control" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
                <option value="Nigeria|+234" selected>Nigeria (+234)</option>
            </select>
        </div>
        <div class="form-input-container">
            <label>Input Email Address:</label>
            <input type="text" name="email" id="reg-identifier" class="form-field-control" placeholder="Input email address" oninput="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <div id="err-reg-step1-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Input all information properly</div>
        </div>
        
        <div class="form-checkbox-group-row margin-top-xs">
            <input type="checkbox" id="chk-reg-terms" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <label for="chk-reg-terms" style="font-size:0.82rem;">I accept the <a href="fort mart terms and conditions.html" >terms and conditions</a></label>
        </div>
        <div class="form-checkbox-group-row margin-top-xs">
            <input type="checkbox" id="chk-reg-privacy" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <label for="chk-reg-privacy" style="font-size:0.82rem;">I accept the <a href="fort mart privacy policy.html" >privacy policy</a></label>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button id="btn-signup-step1-next" onclick="executeProcessSignUpStepOneNextSequenceAction()" class="btn-blue faintly-colored" disabled>Next</button>
        </div>
    `;
}

function evaluateSignUpStepOneFormCompletenessStateValidation() {
    const identifierTextVal = document.getElementById("reg-identifier").value.trim();
    const termsAcceptedFlag = document.getElementById("chk-reg-terms").checked;
    const privacyAcceptedFlag = document.getElementById("chk-reg-privacy").checked;
    const nextButtonNode = document.getElementById("btn-signup-step1-next");
    
    if(identifierTextVal.length > 4 && termsAcceptedFlag && privacyAcceptedFlag) {
        nextButtonNode.disabled = false;
        nextButtonNode.classList.remove("faintly-colored");
    } else {
        nextButtonNode.disabled = true;
        nextButtonNode.classList.add("faintly-colored");
    }
}

function executeProcessSignUpStepOneNextSequenceAction() {
    const countryRawVal = document.getElementById("reg-country").value.split("|");
    const identifierInputVal = document.getElementById("reg-identifier").value.trim();
    const errFieldFeedback = document.getElementById("err-reg-step1-feedback");
    
    errFieldFeedback.classList.add("hidden-node");
    const duplicateMatchCheck = SYSTEM_DATABASE.users.find(u => u.dialingCode === countryRawVal[1] && u.identifierText.toLowerCase() === identifierInputVal.toLowerCase());
    if(duplicateMatchCheck) {
        errFieldFeedback.innerText = "An account is already linked to this phone number/email address. Sign in.";
        errFieldFeedback.classList.remove("hidden-node");
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.country = countryRawVal[0];
    SIGNUP_WIZARD_TEMPORARY_OBJECT.dialingCode = countryRawVal[1];
    SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText = identifierInputVal;
    
    renderSignUpModalWizardStepTwo();
}

function renderSignUpModalWizardStepTwo() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Provide Account Info (Step 2 of 4)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Select Account Type:</label>
            <select id="reg-account-type" class="form-field-control" onchange="toggleSignUpStepTwoClassificationFormsLayout(this.value)">
                <option value="personal" selected>Personal (Consumer) Account</option>
                <option value="business">Business (Commercial) Account</option>
            </select>
        </div>
        
        <div id="signup-dynamic-fields-wrapper">
            <div class="form-input-container">
                <label>Input Personal Full Name:</label>
                <input type="text" name="name" id="reg-personal-name" class="form-field-control" placeholder="Enter personal name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
                <div class="form-input-container-image">
                    <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                        <span id="placeholderTextimg-signup">No image selected</span>
                        <img id="imagePreview-signup" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
                    </div>
                </div>
                <input type="file" id="reg-avatar-file" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processSignUpAvatarFileSelection()">
            </div>
            <div id="err-reg-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Input all information properly</div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="renderSignUpModalWizardStepOne()" class="btn-gray">Back</button>
            <button id="btn-signup-step2-next" onclick="executeProcessSignUpStepTwoNextSequenceAction()" class="btn-blue faintly-colored" disabled>Next</button>
        </div>
    `;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = ""; 
    validateSignUpStepTwoDataFormCompleteness();
}

function toggleSignUpStepTwoClassificationFormsLayout(selectedClassificationType) {
    const fieldsWrapper = document.getElementById("signup-dynamic-fields-wrapper");
    if(selectedClassificationType === 'personal') {
        fieldsWrapper.innerHTML = `
            <div class="form-input-container">
                <label>Input Personal Full Name:</label>
                <input type="text" name="name" id="reg-personal-name" class="form-field-control" placeholder="Enter personal name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
                <div class="form-input-container-image">
                    <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                        <span id="placeholderTextimg-signup">No image selected</span>
                        <img id="imagePreview-signup" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
                    </div>
                </div>
                <input type="file" id="reg-avatar-file" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processSignUpAvatarFileSelection()">
            </div>
            <div id="err-reg-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Input all information properly</div>
        `;
    } else {
        fieldsWrapper.innerHTML = `
            <div class="form-input-container">
                <label>Input Business Name:</label>
                <input type="text" id="reg-biz-name" class="form-field-control" placeholder="Enter corporate trading identity" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Provide Business Public Summary:</label>
                <input type="text" id="reg-biz-info" class="form-field-control" placeholder="Briefly describe your company summary" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Input Personal Full Name:</label>
                <input type="text" name="name" id="reg-personal-name" class="form-field-control" placeholder="Enter operational manager name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Inventory Specification:</label>
                <input type="text" id="reg-biz-deals" class="form-field-control" placeholder="e.g. Mobile Accessories, Clothing apparel, Laptops" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
                <div class="form-input-container-image">
                    <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                        <span id="placeholderTextimg-signup">No image selected</span>
                        <img id="imagePreview-signup" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
                    </div>
                </div>
                <input type="file" id="reg-avatar-file" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processSignUpAvatarFileSelection()">
            </div>
            <div id="err-reg-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Input all information properly</div>
        `;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = ""; 
    validateSignUpStepTwoDataFormCompleteness();
}

function processSignUpAvatarFileSelection() {
    const fileNode = document.getElementById("reg-avatar-file");
    const previewImgNode = document.getElementById("imagePreview-signup");
    const placeholderTextNode = document.getElementById("placeholderTextimg-signup");
    const nextBtn = document.getElementById("btn-signup-step2-next");

    if (fileNode && fileNode.files && fileNode.files[0]) {
        const selectedFile = fileNode.files[0];

        // Store raw File object in temporary state (passed to Firebase Storage upon submit)
        SIGNUP_WIZARD_TEMPORARY_OBJECT.avatarFile = selectedFile;
        // Keep avatar string cleared so Base64 never gets saved into Firestore
        SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = "";

        // Disable Next button momentarily while processing preview
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.classList.add("faintly-colored");
        }
        if (placeholderTextNode) {
            placeholderTextNode.innerText = "Processing image preview...";
        }

        // FileReader used strictly for UI image preview display
        const readerInstance = new FileReader();
        readerInstance.onload = function(e) {
            if (previewImgNode) {
                previewImgNode.src = e.target.result;
                previewImgNode.style.display = "block";
            }
            if (placeholderTextNode) {
                placeholderTextNode.style.display = "none";
            }

            // Run completeness validation checklist
            validateSignUpStepTwoDataFormCompleteness();
        };
        readerInstance.readAsDataURL(selectedFile);
    } else {
        // Clear stored file reference and reset preview if selection was cleared
        SIGNUP_WIZARD_TEMPORARY_OBJECT.avatarFile = null;
        SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = "";

        if (previewImgNode) {
            previewImgNode.style.display = "none";
            previewImgNode.src = "";
        }
        if (placeholderTextNode) {
            placeholderTextNode.innerText = "No image selected";
            placeholderTextNode.style.display = "inline";
        }
        validateSignUpStepTwoDataFormCompleteness();
    }
}

function validateSignUpStepTwoDataFormCompleteness() {
    const currentType = document.getElementById("reg-account-type").value;
    const nextBtn = document.getElementById("btn-signup-step2-next");
    const personalNameInput = document.getElementById("reg-personal-name") ? document.getElementById("reg-personal-name").value.trim() : "";
    
    if(currentType === 'personal') {
        if(personalNameInput.length > 1) {
            nextBtn.disabled = false;
            nextBtn.classList.remove("faintly-colored");
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add("faintly-colored");
        }
    } else {
        const bizNameInput = document.getElementById("reg-biz-name").value.trim();
        const bizInfoInput = document.getElementById("reg-biz-info").value.trim();
        const bizDealsInput = document.getElementById("reg-biz-deals").value.trim();
        
        if(personalNameInput.length > 1 && bizNameInput.length > 1 && bizInfoInput.length > 1 && bizDealsInput.length > 1) {
            nextBtn.disabled = false;
            nextBtn.classList.remove("faintly-colored");
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add("faintly-colored");
        }
    }
}

function executeProcessSignUpStepTwoNextSequenceAction() {
    const currentType = document.getElementById("reg-account-type").value;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType = currentType;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName = document.getElementById("reg-personal-name").value.trim();
    if(currentType === 'business') {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName = document.getElementById("reg-biz-name").value.trim();
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo = document.getElementById("reg-biz-info").value.trim();
        SIGNUP_WIZARD_TEMPORARY_OBJECT.productsDealtIn = document.getElementById("reg-biz-deals").value.trim();
    } else {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName = "";
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo = "";
        SIGNUP_WIZARD_TEMPORARY_OBJECT.productsDealtIn = "";
    }
    
    renderSignUpModalWizardStepThree();
}

function renderSignUpModalWizardStepThree() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Create Security Password (Step 3 of 4)</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:4px;">Must contain at least 6 characters comprising 1 uppercase literal, 1 lowercase literal, 1 numeric digit, and 1 non-alphanumeric special character symbol.</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Input Desired Password:</label>
            <input type="password" id="reg-password-1" class="form-field-control" placeholder="Input Password Expression">
        </div>
        <div class="form-input-container">
            <label>Re-type Password to Confirm:</label>
            <input type="password" id="reg-password-2" class="form-field-control" placeholder="Confirm Password">
            <div id="err-reg-step3-validation-msg" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-reg-showpass" onchange="toggleFormPasswordVisibilityChainSignUp()">
            <label for="chk-reg-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Passwords</label>            
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="renderSignUpModalWizardStepTwo()" class="btn-gray">Back</button>
            <button onclick="executeValidateAndProcessSignUpStepThree()" class="btn-blue">Next</button>
        </div>
    `;
}

function toggleFormPasswordVisibilityChainSignUp() {
    const status = document.getElementById("chk-reg-showpass").checked;
    document.getElementById("reg-password-1").type = status ? "text" : "password";
    document.getElementById("reg-password-2").type = status ? "text" : "password";
}

function executeValidateAndProcessSignUpStepThree() {
    const pass1 = document.getElementById("reg-password-1").value;
    const pass2 = document.getElementById("reg-password-2").value;
    const errorNode = document.getElementById("err-reg-step3-validation-msg");
    errorNode.classList.add("hidden-node");
    
    const requirementStatementText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
    if(pass1 !== pass2) {
        errorNode.innerText = "Password mismatch configuration discovered. Verification entries must align perfectly.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    const passesLengthTest = pass1.length >= 6;
    const passesUppercaseTest = /[A-Z]/.test(pass1);
    const passesLowercaseTest = /[a-z]/.test(pass1);
    const passesDigitTest = /[0-9]/.test(pass1);
    const passesSymbolTest = /[^A-Za-z0-9]/.test(pass1);
    if(!passesLengthTest || !passesUppercaseTest || !passesLowercaseTest || !passesDigitTest || !passesSymbolTest) {
        errorNode.innerText = requirementStatementText;
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.secretKey = pass1;
    sendSignUpEmailJsOtpWorkflow(true);
}

/**
 * Handles generating, tracking, and executing EmailJS calls for OTP validation.
 * Enforces a daily constraint limit of 5 total sent requests per email address.
 */
async function sendSignUpEmailJsOtpWorkflow(isInitialLaunch = false) {
    const targetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText;
    const todayKeyStr = "otp_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-reg-step4-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                feedbackElement.classList.remove("hidden-node");
            }
        } else {
            renderSignUpModalWizardStepFour();
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-reg-step4-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                    feedbackElement.classList.remove("hidden-node");
                }
            }, 50);
        }
        return;
    }

    // Trigger visual/logical 30-second resend cooldown block on successful checks
    initiateSignUpOtpResendCooldown();

    const freshGeneratedOtpCode = Math.floor(1000 + Math.random() * 9000);
    SIGNUP_WIZARD_TEMPORARY_OBJECT.activeVerificationOtp = freshGeneratedOtpCode;

    dailyAttemptsCount++;
    localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());

    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-reg-step4-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh code...";
            feedbackElement.style.color = "blue";
            feedbackElement.classList.remove("hidden-node");
        }
    }

    try {
        if (window.emailjs) {
            await window.emailjs.send(
                "service_ejag5pe", 
                "template_jz0s31e", 
                {
                    to_email: targetEmail,
                    user_name: SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
                    otp_code: freshGeneratedOtpCode
                }
            );
            if (isInitialLaunch) {
                renderSignUpModalWizardStepFour();
            } else {
                const feedbackElement = document.getElementById("err-reg-step4-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "A new verification code has been successfully sent.";
                    feedbackElement.style.color = "green";
                }
            }
        } else {
            console.warn("EmailJS library not loaded on global window context.");
            if (isInitialLaunch) renderSignUpModalWizardStepFour();
        }
    } catch (sendErr) {
        console.error("EmailJS transport error:", sendErr);
        if (isInitialLaunch) {
            renderSignUpModalWizardStepFour();
        } else {
            const feedbackElement = document.getElementById("err-reg-step4-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Failed to send code. Please check your connection.";
                feedbackElement.style.color = "red";
            }
        }
    }
}

/**
 * Handles running tracking operations and layouts for the registration 30-second timer.
 */
function initiateSignUpOtpResendCooldown() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
    }

    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 30;

    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = setInterval(() => {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft--;
        
        const resendLinkNode = document.getElementById("signup-otp-resend-link");
        if (resendLinkNode) {
            if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft > 0) {
                resendLinkNode.innerText = `Resend in ${SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
                SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
            }
        } else if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft <= 0) {
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
        }
    }, 1000);
}

/**
 * Click interceptor block safeguarding link responses against active cooldowns.
 */
function handleSignUpOtpResendActionClickInterception() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft > 0) {
        return;
    }
    sendSignUpEmailJsOtpWorkflow(false);
}

function renderSignUpModalWizardStepFour() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    const maskedTargetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText;
    
    const secondsLeft = SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerEventsStyle = secondsLeft > 0 ? "none" : "auto";

    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Verify Email Identity (Step 4 of 4)</h3>
        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Enter the OTP sent to ${maskedTargetEmail}
        </p>
        
        <div class="form-input-container margin-top-sm" style="margin-top:15px;">
            <label>Input 4-Digit OTP Code:</label>
            <input type="text" id="reg-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px;">
            <div id="err-reg-step4-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem;">
            <span>Didn't receive message? </span>
            <a href="javascript:void(0)" 
               id="signup-otp-resend-link"
               onclick="handleSignUpOtpResendActionClickInterception()" 
               style="color: #007bff; font-weight: ${weightStyle}; opacity: ${opacityStyle}; pointer-events: ${pointerEventsStyle}; text-decoration: none;">${textLabel}</a>
        </div>

        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Note: If you didn't see the message in your inbox, also check the spam section in your email and tag the email "Not Spam".
        </p>
        
        <div class="btn-group margin-top-lg" style="margin-top: 20px;">
            <button onclick="handleClearSignUpTimersAndReturnToStepThree()" class="btn-gray">Back</button>
            <button id="btn-signup-finalize-submit" onclick="executeFinalizeAccountRegistrationPipelineSubmission()" class="btn-blue">Complete Registration</button>
        </div>
    `;
}

function handleClearSignUpTimersAndReturnToStepThree() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 0;
    renderSignUpModalWizardStepThree();
}

async function executeFinalizeAccountRegistrationPipelineSubmission() {
    const userInputCodeField = document.getElementById("reg-otp-input");
    const feedbackElement = document.getElementById("err-reg-step4-feedback");
    const submitBtn = document.getElementById("btn-signup-finalize-submit");

    if (feedbackElement) {
        feedbackElement.classList.add("hidden-node");
        feedbackElement.style.color = "red";
    }

    const typedOtpValue = userInputCodeField.value.trim();
    const systemExpectedValue = String(SIGNUP_WIZARD_TEMPORARY_OBJECT.activeVerificationOtp || "");
    if (!typedOtpValue || typedOtpValue !== systemExpectedValue) {
        if (feedbackElement) {
            feedbackElement.innerText = "Invalid verification token. Please verify entry values.";
            feedbackElement.classList.remove("hidden-node");
        }
        return;
    }

    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 0;

    if (submitBtn) submitBtn.disabled = true;

    try {
        const finalNewUserRecord = await registerNewUserAccountRecord(
            SIGNUP_WIZARD_TEMPORARY_OBJECT,
            SIGNUP_WIZARD_TEMPORARY_OBJECT.avatarFile
        );

        if (typeof SYSTEM_DATABASE !== "undefined" && SYSTEM_DATABASE.users) {
            SYSTEM_DATABASE.users.push(finalNewUserRecord);
        }

        if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
            syncPlatformDatabaseStateToWebStorage();
        }

        // Re-sync metrics count directly from Firebase after new account registration
        syncAdminDashboardMetricsFromFirebase();

        if (typeof APP_STATE !== "undefined") {
            APP_STATE.currentUser = finalNewUserRecord;
        }

        if (typeof closeActiveModalDirectly === "function") {
            closeActiveModalDirectly('auth-modal');
        } else {
            const authModal = document.getElementById("auth-modal");
            if (authModal) authModal.classList.remove("active");
        }

        const welcomeModal = document.getElementById("welcome-modal");
        if (welcomeModal) welcomeModal.classList.add("active");

    } catch (error) {
        console.error("Firebase registration failure sequence exception logging report trace:", error);
        if (feedbackElement) {
            feedbackElement.innerText = "Network Registry Error: Could not verify and sync account profile securely down to the global server.";
            feedbackElement.classList.remove("hidden-node");
        } else if (typeof showTopRightToast === "function") {
            showTopRightToast("Network Registry Error: Could not verify and sync account profile securely down to the global server.", "error");
        }
        if (submitBtn) submitBtn.disabled = false;
    }
}

function renderForgotPasswordModalWorkflow() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Reset Password - Identify Account (Step 1 of 3)</h3>
        <p style="font-size:0.85rem; margin-top:6px; color:var(--fort-gray-slate);">
            Provide your country code and registered identification details to verify your account profile.
        </p>
        
        <div class="form-input-container margin-top-sm">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Country Code:</label>
            <select id="forgot-country" class="form-field-control">
                <option value="+234" selected>Nigeria (+234)</option>
            </select>
        </div>

        <div class="form-input-container margin-top-xs">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Registration Contact (Email Address):</label>
            <input type="text" name="email" id="forgot-id" class="form-field-control" placeholder="example@domain.com">
            <div id="err-forgot-step1-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Close</button>
            <button id="btn-forgot-step1-next" onclick="executeValidateForgotPasswordStepOnePipelineTrace()" class="btn-blue">Next</button>
        </div>
    `;
}

async function executeValidateForgotPasswordStepOnePipelineTrace() {
    const code = document.getElementById("forgot-country").value.trim();
    const rawId = document.getElementById("forgot-id").value.trim();
    const errorNode = document.getElementById("err-forgot-step1-feedback");
    const nextBtn = document.getElementById("btn-forgot-step1-next");
    
    errorNode.classList.add("hidden-node");
    errorNode.innerText = "";

    const accountMatch = SYSTEM_DATABASE.users.find(u => 
        u.dialingCode === code && 
        u.identifierText.toLowerCase() === rawId.toLowerCase()
    );
    if(!accountMatch) {
        errorNode.innerText = "No structural match trace discovered checking records configuration baseline arrays.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetUid = accountMatch.uid;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail = accountMatch.identifierText;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetName = accountMatch.identityName || "User";

    if (nextBtn) nextBtn.disabled = true;
    await sendForgotPasswordEmailJsOtpWorkflow(true);
}

async function sendForgotPasswordEmailJsOtpWorkflow(isInitialLaunch = false) {
    const targetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail;
    const todayKeyStr = "otp_forgot_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-forgot-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 recovery OTPs per day.";
                feedbackElement.classList.remove("hidden-node");
            }
        } else {
            renderForgotPasswordOtpVerificationLayout();
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-forgot-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 recovery OTPs per day.";
                    feedbackElement.classList.remove("hidden-node");
                }
            }, 50);
        }
        return;
    }

    // Trigger the 30 seconds countdown timer when a request successfully passes limits
    initiateOtpResendCooldown();

    const freshGeneratedOtpCode = Math.floor(1000 + Math.random() * 9000);
    SIGNUP_WIZARD_TEMPORARY_OBJECT.activeResetOtp = freshGeneratedOtpCode;

    dailyAttemptsCount++;
    localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());

    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-forgot-step2-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh token key paths...";
            feedbackElement.style.color = "blue";
            feedbackElement.classList.remove("hidden-node");
        }
    }

    try {
        if (window.emailjs) {
            await window.emailjs.send(
                "service_ejag5pe", 
                "template_nzub7tk", 
                {
                    to_email: targetEmail,
                    user_name: SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetName,
                    otp_code: freshGeneratedOtpCode
                }
            );
            if (isInitialLaunch) {
                renderForgotPasswordOtpVerificationLayout();
            } else {
                const feedbackElement = document.getElementById("err-forgot-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "A new security token validation string code has been sent.";
                    feedbackElement.style.color = "green";
                }
            }
        } else {
            console.warn("EmailJS script dependency structure is unavailable.");
            if (isInitialLaunch) renderForgotPasswordOtpVerificationLayout();
        }
    } catch (sendErr) {
        console.error("EmailJS password recovery submission sequence failure:", sendErr);
        if (isInitialLaunch) {
            renderForgotPasswordOtpVerificationLayout();
        } else {
            const feedbackElement = document.getElementById("err-forgot-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Failed transmission delivery. Please verify connectivity.";
                feedbackElement.style.color = "red";
            }
        }
    }
}

/**
 * Handles controlling tracking values and interval states for the 30-second cooldown.
 */
function initiateOtpResendCooldown() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
    }

    SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft = 30;

    SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = setInterval(() => {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft--;
        
        const resendLinkNode = document.getElementById("forgot-otp-resend-link");
        if (resendLinkNode) {
            if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft > 0) {
                resendLinkNode.innerText = `Resend in ${SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
                SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
            }
        } else if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft <= 0) {
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
        }
    }, 1000);
}

/**
 * Wrapper interceptor ensuring code execution doesn't process if a cooldown window is active.
 */
function handleOtpResendActionClickInterception() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft > 0) {
        return; 
    }
    sendForgotPasswordEmailJsOtpWorkflow(false);
}

function renderForgotPasswordOtpVerificationLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    const maskedTargetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail;

    const secondsLeft = SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerEventsStyle = secondsLeft > 0 ? "none" : "auto";

    wrapperTargetNode.innerHTML = `
        <h3>Reset Password - Verify Identity (Step 2 of 3)</h3>
        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Enter the OTP sent to ${maskedTargetEmail}
        </p>
        
        <div class="form-input-container margin-top-sm" style="margin-top:15px;">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Input 4-Digit Security Reset Code Key:</label>
            <input type="text" id="forgot-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px;">
            <div id="err-forgot-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem;">
            <span>Didn't receive message? </span>
            <a href="javascript:void(0)" 
               id="forgot-otp-resend-link"
               onclick="handleOtpResendActionClickInterception()" 
               style="color: #007bff; font-weight: ${weightStyle}; opacity: ${opacityStyle}; pointer-events: ${pointerEventsStyle}; text-decoration: none;">${textLabel}</a>
        </div>

        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Note: If you didn't see the message in your inbox, also check the spam section in your email and tag the email "Not Spam".
        </p>
        
        <div class="btn-group margin-top-lg" style="margin-top: 20px;">
            <button onclick="renderForgotPasswordModalWorkflow()" class="btn-gray">Back</button>
            <button id="btn-forgot-finalize-otp" onclick="executeValidateForgotPasswordOtpEntryToken()" class="btn-blue">Verify Code</button>
        </div>
    `;
}

function executeValidateForgotPasswordOtpEntryToken() {
    const userInputCodeField = document.getElementById("forgot-otp-input");
    const feedbackElement = document.getElementById("err-forgot-step2-feedback");
    if (feedbackElement) {
        feedbackElement.classList.add("hidden-node");
        feedbackElement.style.color = "red";
    }

    const typedOtpValue = userInputCodeField.value.trim();
    const systemExpectedValue = String(SIGNUP_WIZARD_TEMPORARY_OBJECT.activeResetOtp || "");
    if (!typedOtpValue || typedOtpValue !== systemExpectedValue) {
        if (feedbackElement) {
            feedbackElement.innerText = "Invalid security verification token matched. Verify entry values.";
            feedbackElement.classList.remove("hidden-node");
        }
        return;
    }

    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft = 0;

    renderForgotPasswordStepTwoLayout();
}

function renderForgotPasswordStepTwoLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Reset Password - Define New Security Key (Step 3 of 3)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Input New Security Access Password Token Key Pattern:</label>
            <input type="password" id="forgot-newpass-1" class="form-field-control" placeholder="New Password Expression">
        </div>
        <div class="form-input-container">
            <label>Re-type New Password Expression to Confirm Alignment:</label>
            <input type="password" id="forgot-newpass-2" class="form-field-control" placeholder="Confirm Password Expression">
            <div id="err-forgot-newpass-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>
        <div class="btn-group" style="margin-top: 15px;">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Discard Session</button>
            <button id="btn-forgot-submit-firebase" onclick="executeCommitNewPasswordToSystemDatabase()" class="btn-blue">Save & Login</button>
        </div>
    `;
}

async function executeCommitNewPasswordToSystemDatabase() {
    const p1 = document.getElementById("forgot-newpass-1").value;
    const p2 = document.getElementById("forgot-newpass-2").value;
    const errorNode = document.getElementById("err-forgot-newpass-feedback");
    const submitBtn = document.getElementById("btn-forgot-submit-firebase");
    
    errorNode.classList.add("hidden-node");
    
    if(p1 !== p2) {
        errorNode.innerText = "Password structural mismatch discovered checking confirmation fields string parameters.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    if(p1.length < 6 || !/[A-Z]/.test(p1) || !/[a-z]/.test(p1) || !/[0-9]/.test(p1) || !/[^A-Za-z0-9]/.test(p1)) {
        errorNode.innerText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    const targetUid = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetUid;
    const accountIndexId = SYSTEM_DATABASE.users.findIndex(u => u.uid === targetUid);
    
    if(accountIndexId !== -1) {
        if(submitBtn) submitBtn.disabled = true;
        
        try {
            // Overwrite and sync records down to Firebase Server instance
            if (window.db && typeof window.updateDoc === "function" && typeof window.doc === "function") {
                const userDocReferenceRef = window.doc(window.db, "users", targetUid);
                await window.updateDoc(userDocReferenceRef, {
                    secretKey: p1,
                    password: p1
                });
            } else if (typeof doc === "function" && typeof updateDoc === "function" && typeof db !== "undefined") {
                // Alternative reference check depending on variable initialization scope
                const userDocReferenceRef = doc(db, "users", targetUid);
                await updateDoc(userDocReferenceRef, {
                    secretKey: p1,
                    password: p1
                });
            }

            // Sync to local runtime state configurations safely
            SYSTEM_DATABASE.users[accountIndexId].secretKey = p1;
            SYSTEM_DATABASE.users[accountIndexId].password = p1; 
            
            APP_STATE.currentUser = SYSTEM_DATABASE.users[accountIndexId];
            
            if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
                syncPlatformDatabaseStateToWebStorage();
            }
            
            closeActiveModalDirectly('auth-modal');
            
            const welcomeModal = document.getElementById("welcome-modal");
            if (welcomeModal) welcomeModal.classList.add("active");
            
            if (typeof renderMarketplaceProductsDisplayLoop === "function") {
                renderMarketplaceProductsDisplayLoop();
            }
            
        } catch (firebaseErr) {
            console.error("Firebase cloud update sequence exception trace reported:", firebaseErr);
            errorNode.innerText = "Network Database Synch Error: Unable to safely record changes to the server database. Please verify your connection status.";
            errorNode.classList.remove("hidden-node");
            if(submitBtn) submitBtn.disabled = false;
        }
    }
}

/**
 * Fort Mart Section 5 - Product Discovery, Inventory Pipeline, Search Engine & Leaderboard Subsystem
 * Fully optimized to fetch live data from Firebase Firestore and enforce accurate Uid mapping.
 */

function buildCategoryRibbonFilterInterfaceElements() {
    const structuralCategoryListArray = ["Trending", "Electrical Appliances", "Mobile Devices & Computers", "Home Furniture", "Fashion Clothing Apparel", "Automotive Parts & Engines","Beauty & Personal Care", "Sports, Fitness and Outdoors", "Groceries & Essentials", "Others"];
    const targetsWrapperNode = document.getElementById("category-items-container");
    if (!targetsWrapperNode) return;
    targetsWrapperNode.innerHTML = "";
    
    structuralCategoryListArray.forEach(catName => {
        const chipBtnNode = document.createElement("button");
        chipBtnNode.className = `category-chip-btn ${APP_STATE.currentSelectedCategory === catName ? 'active' : ''}`;
        chipBtnNode.innerText = catName;
        chipBtnNode.onclick = () => {
            document.querySelectorAll(".category-chip-btn").forEach(b => b.classList.remove("active"));
            chipBtnNode.classList.add("active");
            executeCategorizedInventoryFilterAction(catName);
        };
        targetsWrapperNode.appendChild(chipBtnNode);
    });
}

function toggleCategoryDrawer() {
    const targetNode = document.getElementById("category-items-container");
    if (!targetNode) return;
    APP_STATE.categoryDrawerOpen = !APP_STATE.categoryDrawerOpen;
    if(APP_STATE.categoryDrawerOpen) {
        targetNode.classList.remove("hidden");
    } else {
        targetNode.classList.add("hidden");
    }
}

function executeCategorizedInventoryFilterAction(categoryNameString) {
    APP_STATE.currentSelectedCategory = categoryNameString;
    const subheaderNode = document.getElementById("active-category-header");
    
    if(subheaderNode) {
        if(categoryNameString === 'Trending') {
            subheaderNode.classList.add("hidden-node");
        } else {
            subheaderNode.classList.remove("hidden-node");
            const titleTextNode = document.getElementById("category-title-text");
            if (titleTextNode) titleTextNode.innerText = categoryNameString;
        }
    }
    renderMarketplaceProductsDisplayLoop();
}

function handleGlobalSearch(searchStringQuery) {
    APP_STATE.searchQuery = searchStringQuery.trim().toLowerCase();
    if(APP_STATE.activeViewPage === 'home') {
         renderMarketplaceProductsDisplayLoop();
    } else if(APP_STATE.activeViewPage === 'messages') {
         if (typeof renderUserConversationsLogRoster === "function") renderUserConversationsLogRoster();
    } else if(APP_STATE.activeViewPage === 'my-account') {
         if (typeof executeFilteringSettingsContentPaneRowsNodesDisplay === "function") {
             executeFilteringSettingsContentPaneRowsNodesDisplay(APP_STATE.searchQuery);
         }
    }
}

function handleCategorySearch(searchStringQuery) {
    APP_STATE.searchQuery = searchStringQuery.trim().toLowerCase();
    renderMarketplaceProductsDisplayLoop();
}

/**
 * CORE GRID RENDERING SYSTEM
 * Fetches real-time localized listings and handles empty/error states explicitly.
 * Integrates Firebase Storage download URL resolutions for cloud-stored images.
 */
/**
 * CORE GRID RENDERING SYSTEM
 * Fetches real-time localized listings, sorts normal products by clickCount descending,
 * and handles empty/error states explicitly.
 */
async function renderMarketplaceProductsDisplayLoop() {
    const loopDisplayTargetGrid = document.getElementById("products-display-grid");
    if (!loopDisplayTargetGrid) return;
    
    // 1. Initial Loading State UI
    loopDisplayTargetGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--fort-blue-primary);">
            <div class="spinner" style="margin: 0 auto 10px auto;"></div>
            <p style="font-weight: 600;">Syncing secure inventory pipelines with cloud matrix...</p>
        </div>
    `;
    
    let baselineCurrencyIndicatorSymbol = "₦";
    let locationFilteringCriteriaString = "Nigeria";
    
    if (APP_STATE.currentUser) {
        locationFilteringCriteriaString = APP_STATE.currentUser.country || "Nigeria";
        baselineCurrencyIndicatorSymbol = (locationFilteringCriteriaString === 'Nigeria') ? '₦' : '$';
    }
    
    let activeProductsList = [];
    let activeUsersCache = [];
    let leaderboard = [];
    let adminSlotPid = null;

    const FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fproduct_placeholder.png?alt=media";
    const FIREBASE_STORAGE_DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fuser_avatar_placeholder.png?alt=media";

    async function resolveFirebaseStorageUrl(imageRefOrUrl, fallbackUrl) {
        if (!imageRefOrUrl) return fallbackUrl;
        if (imageRefOrUrl.startsWith("http://") || imageRefOrUrl.startsWith("https://") || imageRefOrUrl.startsWith("data:")) {
            return imageRefOrUrl;
        }
        try {
            if (window.FortMartFirebase && window.FortMartFirebase.storage && window.FortMartFirebase.ref && window.FortMartFirebase.getDownloadURL) {
                const { storage, ref, getDownloadURL } = window.FortMartFirebase;
                const storageRef = ref(storage, imageRefOrUrl);
                return await getDownloadURL(storageRef);
            }
        } catch (storageErr) {
            console.warn(`Could not resolve Firebase Storage reference [${imageRefOrUrl}]:`, storageErr);
        }
        return fallbackUrl;
    }

    try {
        if (window.FortMartFirebase) {
            const { db, collection, getDocs } = window.FortMartFirebase;
            
            // Fetch System Metadata
            try {
                const systemMetaRef = await getDocs(collection(db, "system_metadata"));
                systemMetaRef.forEach(doc => {
                    if (doc.id === "leaderboardConfig") {
                        const data = doc.data();
                        leaderboard = data.pinnedLeaderboard || [];
                        adminSlotPid = data.adminSlot || null;
                    }
                });
                SYSTEM_DATABASE.pinnedLeaderboard = leaderboard;
                SYSTEM_DATABASE.adminSlot = adminSlotPid;
            } catch (metaErr) {
                console.warn("Unable to fetch system_metadata collection:", metaErr);
            }

            // Fetch Products
            const productsSnapshot = await getDocs(collection(db, "products"));
            productsSnapshot.forEach(doc => {
                activeProductsList.push({ pid: doc.id, ...doc.data() });
            });
            SYSTEM_DATABASE.products = activeProductsList;

            // Fetch Users
            const usersSnapshot = await getDocs(collection(db, "users"));
            usersSnapshot.forEach(doc => {
                activeUsersCache.push({ uid: doc.id, ...doc.data() });
            });
            SYSTEM_DATABASE.users = activeUsersCache;

        } else {
            activeProductsList = [...(SYSTEM_DATABASE.products || [])];
            activeUsersCache = [...(SYSTEM_DATABASE.users || [])];
            leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
            adminSlotPid = SYSTEM_DATABASE.adminSlot || null;
        }

        // Apply localization & filtering
        let computedInventoryOutputArray = activeProductsList.filter(item => {
            const structuralOwnerAccountPointer = activeUsersCache.find(u => u.uid === item.ownerUid);
            if (!structuralOwnerAccountPointer) return false;
            if (structuralOwnerAccountPointer.country !== locationFilteringCriteriaString) return false;
            if (APP_STATE.currentSelectedCategory !== 'Trending' && item.category !== APP_STATE.currentSelectedCategory) return false;
            
            if (APP_STATE.searchQuery !== '') {
                const matchTitleFlag = String(item.name).toLowerCase().includes(APP_STATE.searchQuery);
                const matchInfoFlag = String(item.info).toLowerCase().includes(APP_STATE.searchQuery);
                if (!matchTitleFlag && !matchInfoFlag) return false;
            }
            return true;
        });

        // 1. Admin Slot Item
        let adminPinnedItem = computedInventoryOutputArray.filter(item => item.pid === adminSlotPid);
        
        // 2. Standard Leaderboard Pinned items
        let pinnedItems = computedInventoryOutputArray.filter(item => leaderboard.includes(item.pid) && item.pid !== adminSlotPid);
        
        // 3. Normal items sorted by clickCount (hit count) descending
        let normalItems = computedInventoryOutputArray.filter(item => !leaderboard.includes(item.pid) && item.pid !== adminSlotPid);

        pinnedItems.sort((a, b) => leaderboard.indexOf(a.pid) - leaderboard.indexOf(b.pid));
        normalItems.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));

        let displayArrayToProcess = [...adminPinnedItem, ...pinnedItems, ...normalItems];

        loopDisplayTargetGrid.innerHTML = "";

        if (displayArrayToProcess.length === 0) {
            loopDisplayTargetGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #f9fbfd; border: 2px dashed #cbd5e1; border-radius: 12px; margin: 20px 0;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📦</div>
                    <h3 style="color: var(--fort-blue-dark, #1e293b); margin-bottom: 6px;">No Products Found</h3>
                    <p style="color: #64748b; font-size: 0.9rem; max-width: 400px; margin: 0 auto 16px auto;">
                        We couldn't find any products listed for <strong>${locationFilteringCriteriaString}</strong> in the <strong>${APP_STATE.currentSelectedCategory}</strong> category.
                    </p>
                    <button class="btn-blue" style="padding: 8px 16px; font-size: 0.85rem;" onclick="APP_STATE.searchQuery=''; APP_STATE.currentSelectedCategory='Trending'; renderMarketplaceProductsDisplayLoop();">
                        Reset Filters
                    </button>
                </div>
            `;
            return;
        }

        // Render Cards
        for (const product of displayArrayToProcess) {
            const contextualOwnerRecord = activeUsersCache.find(u => u.uid === product.ownerUid);
            const ownerCorporateEntityLabel = contextualOwnerRecord ? (contextualOwnerRecord.businessName || contextualOwnerRecord.identityName) : "External Global Distribution Partner Hub";
            
            const ownerCircularAvatarSrcString = await resolveFirebaseStorageUrl(
                contextualOwnerRecord ? contextualOwnerRecord.avatar : null, 
                FIREBASE_STORAGE_DEFAULT_AVATAR
            );
            const productCoverPhotoSrc = await resolveFirebaseStorageUrl(
                product.coverPhoto, 
                FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE
            );

            const cardContainerBlockElement = document.createElement("div");
            cardContainerBlockElement.className = "product-item-card-container rounded-rect";
            
            const isProductAdminPinned = (product.pid === adminSlotPid);
            const isProductPinned = leaderboard.includes(product.pid);
            
            let pinnedBadgeHTML = '';
            if (isProductAdminPinned) {
                pinnedBadgeHTML = `<span style="background:crimson; color:white; padding:2px 8px; font-size:0.7rem; border-radius:4px; font-weight:bold; margin-left:auto;">👑</span>`;
            } else if (isProductPinned) {
                pinnedBadgeHTML = `<span style="background:var(--fort-blue-light, #0066cc); color:white; padding:2px 8px; font-size:0.7rem; border-radius:4px; font-weight:bold; margin-left:auto;">📌</span>`;
            }
                
            cardContainerBlockElement.innerHTML = `
                <div class="poster-profile-strip" onclick="event.stopPropagation(); launchDetailedUserProfileContextOverlaySummaryModal('${product.ownerUid}')">
                    <img class="mini-profile-avatar circle-container" src="${ownerCircularAvatarSrcString}" alt="Avatar" onerror="this.src='${FIREBASE_STORAGE_DEFAULT_AVATAR}'">
                    <span class="mini-profile-business-name" style="font-weight:600; font-size:0.85rem;">${ownerCorporateEntityLabel}</span>
                    ${pinnedBadgeHTML}
                </div>
                <div class="product-card-image-box" onclick="launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')">
                    <img src="${productCoverPhotoSrc}" alt="Product Render" onerror="this.src='${FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE}'">
                </div>
                <div class="product-card-details-block" onclick="launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')">
                    <h4 class="product-card-title">${product.name}</h4>
                    <p class="product-card-description">${String(product.info || '').substring(0, 85)}...</p>
                    <div class="product-card-price-tag" style="font-weight:700; color:#d32f2f;">${baselineCurrencyIndicatorSymbol}${parseFloat(product.price || 0).toLocaleString()}</div>
                    <div class="btn-group" style="margin-top:auto;">
                        <button class="btn-blue" style="width:100%; font-size:0.8rem;" onclick="event.stopPropagation(); initialDirectMessageCommunicationPipelineSetup('${product.ownerUid}')">Message Seller</button>
                    </div>
                </div>
            `;
            loopDisplayTargetGrid.appendChild(cardContainerBlockElement);
        }

    } catch (err) {
        console.error("Firebase fetch failed or grid loop execution error:", err);
        loopDisplayTargetGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 2rem; margin-bottom: 8px;">⚠️</div>
                <h4 style="color: #c53030; margin-bottom: 6px;">Failed to Load Products</h4>
                <p style="color: #742a2a; font-size: 0.85rem; margin-bottom: 12px;">${err.message || 'Unable to communicate with Firebase Firestore.'}</p>
                <button class="btn-blue" style="padding: 6px 14px; font-size: 0.8rem;" onclick="renderMarketplaceProductsDisplayLoop();">
                    🔄 Retry Connection
                </button>
            </div>
        `;
    }
}

/**
 * EXPANDED SPECIFICATIONS VIEW MODEL
 * Updated with Firebase Storage Image links, Document Title & PushState URL Routing.
 */
/**
 * EXPANDED SPECIFICATIONS VIEW MODEL
 * Records hit count on launch and renders product details asynchronously.
 */
async function launchComprehensiveProductSpecificationsExpandedModalView(productIdTokenKey, pushHistory = true) {
    if (!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }

    const detailOverlayBodyNode = document.getElementById("product-detail-modal-body");
    if (!detailOverlayBodyNode) return;

    // 1. Trigger the click/hit counter
    await recordProductHitCount(productIdTokenKey);

    detailOverlayBodyNode.innerHTML = `<div style="text-align:center; padding:40px; color:var(--fort-blue-dark);">Fetching complete product metadata from cloud servers...</div>`;
    document.getElementById("product-detail-modal").classList.add("active");

    const FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fproduct_placeholder.png?alt=media";
    const FIREBASE_STORAGE_DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fuser_avatar_placeholder.png?alt=media";

    async function resolveFirebaseStorageUrl(imageRefOrUrl, fallbackUrl) {
        if (!imageRefOrUrl) return fallbackUrl;
        if (imageRefOrUrl.startsWith("http://") || imageRefOrUrl.startsWith("https://") || imageRefOrUrl.startsWith("data:")) {
            return imageRefOrUrl;
        }
        try {
            if (window.FortMartFirebase && window.FortMartFirebase.storage && window.FortMartFirebase.ref && window.FortMartFirebase.getDownloadURL) {
                const { storage, ref, getDownloadURL } = window.FortMartFirebase;
                const storageRef = ref(storage, imageRefOrUrl);
                return await getDownloadURL(storageRef);
            }
        } catch (e) {
            console.warn("Storage resolution warning:", e);
        }
        return fallbackUrl;
    }

    try {
        let targetedProductItemMatch = null;
        let operationalTargetProfileOwnerRecord = null;

        if (window.FortMartFirebase) {
            const { db, doc, getDoc } = window.FortMartFirebase;
            const productDocRef = doc(db, "products", productIdTokenKey);
            const productSnapshot = await getDoc(productDocRef);
            
            if (productSnapshot.exists()) {
                targetedProductItemMatch = { pid: productSnapshot.id, ...productSnapshot.data() };
            }
        }

        if (!targetedProductItemMatch) {
            targetedProductItemMatch = (SYSTEM_DATABASE.products || []).find(p => p.pid === productIdTokenKey) || {
                pid: productIdTokenKey, ownerUid: "admin", name: "Synchronized Affiliate System Feed Record", category: "General Ledger", info: "Fallback inventory trace mapping record placeholder data structural component metrics analysis logs references.", price: 12500, coverPhoto: FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE, aiInfo: "External baseline mapping tracking references model arrays values.", clickCount: 1
            };
        }

        // Dynamic Page Title Update
        document.title = `${targetedProductItemMatch.name} - Fort Mart`;

        // Dynamic URL PushState Update
        if (pushHistory && typeof createProductSlug === "function") {
            const productSlug = createProductSlug(targetedProductItemMatch.name);
            const newUrl = `${window.location.origin}${window.location.pathname}?product=${productSlug}&pid=${targetedProductItemMatch.pid}`;
            window.history.pushState({ pid: targetedProductItemMatch.pid }, "", newUrl);
        }

        if (window.FortMartFirebase && !productIdTokenKey.startsWith("ext_mock_")) {
            const { db, doc, getDoc } = window.FortMartFirebase;
            const userSnapshot = await getDoc(doc(db, "users", targetedProductItemMatch.ownerUid));
            if (userSnapshot.exists()) {
                operationalTargetProfileOwnerRecord = { uid: userSnapshot.id, ...userSnapshot.data() };
            }
        }

        if (!operationalTargetProfileOwnerRecord) {
            operationalTargetProfileOwnerRecord = (SYSTEM_DATABASE.users || []).find(u => u.uid === targetedProductItemMatch.ownerUid) || {
                businessName: "External Distribution Partner Network", country: "Nigeria", avatar: FIREBASE_STORAGE_DEFAULT_AVATAR
            };
        }

        let baselineCurrencySymbolSign = (APP_STATE.currentUser.country === 'Nigeria') ? '₦' : '$';
        let operationalActionControlsLayoutStringHTML = "";
        
        if (APP_STATE.currentUser.uid === targetedProductItemMatch.ownerUid) {
            operationalActionControlsLayoutStringHTML = `
                <button class="btn-gray" onclick="closeActiveModalDirectly('product-detail-modal'); switchSettingsSection('my-products'); navigateToPage('my-account');">⚙️ Manage Products</button>
            `;
        } else {
            operationalActionControlsLayoutStringHTML = `
                <button class="btn-blue" onclick="closeActiveModalDirectly('product-detail-modal'); initialDirectMessageCommunicationPipelineSetup('${targetedProductItemMatch.ownerUid}')">💬 Message Seller</button>
            `;
        }

        let adminPinControlHTML = "";
        const isUserAdmin = (APP_STATE.currentUser.uid === 'admin' || APP_STATE.currentUser.id === 'admin');
        
        if (isUserAdmin) {
            const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
            const isCurrentPinned = leaderboard.includes(targetedProductItemMatch.pid);
            const isAdminSlotOccupant = (SYSTEM_DATABASE.adminSlot === targetedProductItemMatch.pid);
            
            adminPinControlHTML = `
                <div style="background: #edf2f7; border: 1px dashed var(--fort-blue-primary); padding: 12px; border-radius: 6px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-size: 0.85rem; font-weight: bold; color: var(--fort-blue-dark);">🛡️ Admin Controls Hub</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="${isCurrentPinned ? 'btn-gray' : 'btn-blue'}" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold;"
                            onclick="executeToggleProductPinState('${targetedProductItemMatch.pid}')">
                            ${isCurrentPinned ? '🛑 Unpin Standard Slot' : '📌 Pin to Standard'}
                        </button>
                        <button class="${isAdminSlotOccupant ? 'btn-danger' : 'btn-success'}" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold; background: ${isAdminSlotOccupant ? 'crimson':'green'}; color: white; border:none; border-radius:4px; cursor:pointer;"
                            onclick="toggleAdminExclusiveSlotState('${targetedProductItemMatch.pid}')">
                            ${isAdminSlotOccupant ? '❌ Unassign Admin Slot' : '👑 Assign Admin Slot'}
                        </button>
                    </div>
                    <button class="btn-blue" style="width: 100%; padding: 6px; font-size: 0.8rem; font-weight: bold; margin-top: 4px;" 
                        onclick="launchPinnedProductsLeaderboardModal()">
                        🏆 Open Pinned Products Leaderboard
                    </button>
                </div>
            `;
        }
        
        const productDisplayImage = await resolveFirebaseStorageUrl(targetedProductItemMatch.coverPhoto, FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE);
        const vendorAvatarImage = await resolveFirebaseStorageUrl(operationalTargetProfileOwnerRecord.avatar, FIREBASE_STORAGE_DEFAULT_AVATAR);

        detailOverlayBodyNode.innerHTML = `
            <div class="modal-expanded-header-row" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fort-gray-border); padding-bottom:14px;">
                <h3>Product Detailed Specifications</h3>
                <button onclick="closeActiveModalDirectly('product-detail-modal')" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
            </div>
            <div class="modal-expanded-content-split-grid margin-top-md" style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                <div class="expanded-left-visuals-column">
                   <div class="expanded-master-image-box rounded-rect" style="width:100%; height:320px; background-color:#fcfcfc; overflow:hidden; border:1px solid var(--fort-gray-border); display:flex; align-items:center; justify-content:center;">
                        <img src="${productDisplayImage}" style="width:100%; height:100%; object-fit:contain;" alt="Master Expanded Product Frame" onerror="this.src='${FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE}'">
                    </div>
                </div>
                <div class="expanded-right-details-column" style="display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${vendorAvatarImage}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;" class="circle-container" alt="Vendor Profile Photo" onerror="this.src='${FIREBASE_STORAGE_DEFAULT_AVATAR}'">
                        <div>
                            <h4 style="color:var(--fort-blue-primary); margin:0;">${operationalTargetProfileOwnerRecord.businessName || operationalTargetProfileOwnerRecord.identityName}</h4>
                            <span style="font-size:0.75rem; color:var(--fort-gray-slate);">Country: ${operationalTargetProfileOwnerRecord.country || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <h2 style="color:var(--fort-blue-dark); font-weight:800; margin-top:8px; margin-bottom:0;">${targetedProductItemMatch.name}</h2>
                    <div style="font-size:1.6rem; font-weight:900; color:var(--fort-blue-light);">${baselineCurrencySymbolSign}${parseFloat(targetedProductItemMatch.price || 0).toLocaleString()}</div>
                    
                    <div class="spec-note-paragraph-block">
                        <h5 style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; color:var(--fort-gray-slate); margin:0;">Primary Descriptive Summary Logs</h5>
                        <p style="font-size:0.95rem; line-height:1.4; color:var(--fort-blue-dark); margin-top:4px;">${targetedProductItemMatch.info || ''}</p>
                    </div>

                    <div class="spec-note-paragraph-block">
                        <h5 style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; color:var(--fort-gray-slate); margin:0;">More Info and Specifications (AI Assessment)</h5>
                        <p style="font-size:0.9rem; line-height:1.4; font-style:italic; color:var(--fort-blue-primary); margin-top:4px;">${targetedProductItemMatch.aiInfo || 'Standard platform baseline listed trading stock profile object reference specifications.'}</p>
                    </div>
                    
                    ${adminPinControlHTML}

                    <div class="modal-expanded-actions-footer-row btn-group" style="margin-top:auto; padding-top:16px; border-top:1px solid #f0f0f0;">
                        ${operationalActionControlsLayoutStringHTML}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Modal generation error:", err);
        detailOverlayBodyNode.innerHTML = `<div style="text-align:center; padding:20px; color:red;">Failed to load product details: ${err.message}</div>`;
    }
}

/**
 * EXPANDED SPECIFICATIONS VIEW MODEL
 * Updated with Firebase Storage Image links, Document Title & PushState URL Routing.
 */
async function launchComprehensiveProductSpecificationsExpandedModalView(productIdTokenKey, pushHistory = true) {
    if (!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }

    const detailOverlayBodyNode = document.getElementById("product-detail-modal-body");
    if (!detailOverlayBodyNode) return;

    detailOverlayBodyNode.innerHTML = `<div style="text-align:center; padding:40px; color:var(--fort-blue-dark);">Fetching complete product metadata from cloud servers...</div>`;
    document.getElementById("product-detail-modal").classList.add("active");

    const FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fproduct_placeholder.png?alt=media";
    const FIREBASE_STORAGE_DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fuser_avatar_placeholder.png?alt=media";

    try {
        let targetedProductItemMatch = null;
        let operationalTargetProfileOwnerRecord = null;

        if (window.FortMartFirebase) {
            const { db, doc, getDoc, setDoc } = window.FortMartFirebase;
            
            const productDocRef = doc(db, "products", productIdTokenKey);
            const productSnapshot = await getDoc(productDocRef);
            
            if (productSnapshot.exists()) {
                targetedProductItemMatch = { pid: productSnapshot.id, ...productSnapshot.data() };
                
                targetedProductItemMatch.clickCount = (targetedProductItemMatch.clickCount || 0) + 1;
                await setDoc(productDocRef, { clickCount: targetedProductItemMatch.clickCount }, { merge: true });
            }
        }

        if (!targetedProductItemMatch) {
            targetedProductItemMatch = SYSTEM_DATABASE.products.find(p => p.pid === productIdTokenKey) || {
                pid: productIdTokenKey, ownerUid: "admin", name: "Synchronized Affiliate System Feed Record", category: "General Ledger", info: "Fallback inventory trace mapping record placeholder data structural component metrics analysis logs references.", price: 12500, coverPhoto: FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE, aiInfo: "External baseline mapping tracking references model arrays values.", clickCount: 1
            };
        }

        // 1. Dynamic Page Title Update
        document.title = `${targetedProductItemMatch.name} - Fort Mart`;

        // 2. Dynamic URL PushState Update
        if (pushHistory) {
            const productSlug = createProductSlug(targetedProductItemMatch.name);
            const newUrl = `${window.location.origin}${window.location.pathname}?product=${productSlug}&pid=${targetedProductItemMatch.pid}`;
            window.history.pushState({ pid: targetedProductItemMatch.pid }, "", newUrl);
        }

        if (window.FortMartFirebase && !productIdTokenKey.startsWith("ext_mock_")) {
            const { db, doc, getDoc } = window.FortMartFirebase;
            const userSnapshot = await getDoc(doc(db, "users", targetedProductItemMatch.ownerUid));
            if (userSnapshot.exists()) {
                operationalTargetProfileOwnerRecord = { uid: userSnapshot.id, ...userSnapshot.data() };
            }
        }

        if (!operationalTargetProfileOwnerRecord) {
            operationalTargetProfileOwnerRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetedProductItemMatch.ownerUid) || {
                businessName: "External Distribution Partner Network", country: "Nigeria", avatar: FIREBASE_STORAGE_DEFAULT_AVATAR
            };
        }

        let baselineCurrencySymbolSign = (APP_STATE.currentUser.country === 'Nigeria') ? '₦' : '$';
        let operationalActionControlsLayoutStringHTML = "";
        
        if(APP_STATE.currentUser.uid === targetedProductItemMatch.ownerUid) {
            operationalActionControlsLayoutStringHTML = `
                <button class="btn-gray" onclick="closeActiveModalDirectly('product-detail-modal'); switchSettingsSection('my-products'); navigateToPage('my-account');">⚙️ Manage Products</button>
            `;
        } else {
            operationalActionControlsLayoutStringHTML = `
                <button class="btn-blue" onclick="closeActiveModalDirectly('product-detail-modal'); initialDirectMessageCommunicationPipelineSetup('${targetedProductItemMatch.ownerUid}')">💬 Message Seller</button>
            `;
        }

        let adminPinControlHTML = "";
        const isUserAdmin = (APP_STATE.currentUser.uid === 'admin' || APP_STATE.currentUser.id === 'admin');
        
        if (isUserAdmin) {
            const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
            const isCurrentPinned = leaderboard.includes(targetedProductItemMatch.pid);
            const isAdminSlotOccupant = (SYSTEM_DATABASE.adminSlot === targetedProductItemMatch.pid);
            
            adminPinControlHTML = `
                <div style="background: #edf2f7; border: 1px dashed var(--fort-blue-primary); padding: 12px; border-radius: 6px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-size: 0.85rem; font-weight: bold; color: var(--fort-blue-dark);">🛡️ Admin Controls Hub</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="${isCurrentPinned ? 'btn-gray' : 'btn-blue'}" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold;"
                            onclick="executeToggleProductPinState('${targetedProductItemMatch.pid}')">
                            ${isCurrentPinned ? '🛑 Unpin Standard Slot' : '📌 Pin to Standard'}
                        </button>
                        <button class="${isAdminSlotOccupant ? 'btn-danger' : 'btn-success'}" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold; background: ${isAdminSlotOccupant ? 'crimson':'green'}; color: white; border:none; border-radius:4px; cursor:pointer;"
                            onclick="toggleAdminExclusiveSlotState('${targetedProductItemMatch.pid}')">
                            ${isAdminSlotOccupant ? '❌ Unassign Admin Slot' : '👑 Assign Admin Slot'}
                        </button>
                    </div>
                    <button class="btn-blue" style="width: 100%; padding: 6px; font-size: 0.8rem; font-weight: bold; margin-top: 4px;" 
                        onclick="launchPinnedProductsLeaderboardModal()">
                        🏆 Open Pinned Products Leaderboard
                    </button>
                </div>
            `;
        }
        
        const productDisplayImage = targetedProductItemMatch.coverPhoto || FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE;
        const vendorAvatarImage = operationalTargetProfileOwnerRecord.avatar || FIREBASE_STORAGE_DEFAULT_AVATAR;

        detailOverlayBodyNode.innerHTML = `
            <div class="modal-expanded-header-row" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fort-gray-border); padding-bottom:14px;">
                <h3>Product Detailed Specifications</h3>
                <button onclick="closeActiveModalDirectly('product-detail-modal')" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
            </div>
            <div class="modal-expanded-content-split-grid margin-top-md" style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                <div class="expanded-left-visuals-column">
                   <div class="expanded-master-image-box rounded-rect" style="width:100%; height:320px; background-color:#fcfcfc; overflow:hidden; border:1px solid var(--fort-gray-border); display:flex; align-items:center; justify-content:center;">
                        <img src="${productDisplayImage}" style="width:100%; height:100%; object-fit:contain;" alt="Master Expanded Product Frame">
                    </div>
                </div>
                <div class="expanded-right-details-column" style="display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${vendorAvatarImage}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;" class="circle-container" alt="Vendor Profile Photo">
                        <div>
                            <h4 style="color:var(--fort-blue-primary); margin:0;">${operationalTargetProfileOwnerRecord.businessName || operationalTargetProfileOwnerRecord.identityName}</h4>
                            <span style="font-size:0.75rem; color:var(--fort-gray-slate);">Country: ${operationalTargetProfileOwnerRecord.country}</span>
                        </div>
                    </div>
                    
                    <h2 style="color:var(--fort-blue-dark); font-weight:800; margin-top:8px; margin-bottom:0;">${targetedProductItemMatch.name}</h2>
                    <div style="font-size:1.6rem; font-weight:900; color:var(--fort-blue-light);">${baselineCurrencySymbolSign}${parseFloat(targetedProductItemMatch.price).toLocaleString()}</div>
                    
                    <div class="spec-note-paragraph-block">
                        <h5 style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; color:var(--fort-gray-slate); margin:0;">Primary Descriptive Summary Logs</h5>
                        <p style="font-size:0.95rem; line-height:1.4; color:var(--fort-blue-dark); margin-top:4px;">${targetedProductItemMatch.info}</p>
                    </div>

                    <div class="spec-note-paragraph-block">
                        <h5 style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; color:var(--fort-gray-slate); margin:0;">More Info and Specifications (AI Assessment)</h5>
                        <p style="font-size:0.9rem; line-height:1.4; font-style:italic; color:var(--fort-blue-primary); margin-top:4px;">${targetedProductItemMatch.aiInfo || 'Standard platform baseline listed trading stock profile object reference specifications.'}</p>
                    </div>
                    
                    ${adminPinControlHTML}

                    <div class="modal-expanded-actions-footer-row btn-group" style="margin-top:auto; padding-top:16px; border-top:1px solid #f0f0f0;">
                        ${operationalActionControlsLayoutStringHTML}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Failure opening comprehensive expanded specification container view pipeline:", err);
        detailOverlayBodyNode.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Global Storage Error: Failed to load this product profile context from Firestore.</div>`;
    }
}

/**
 * Increments hit/click count in Firebase Firestore and updates local state.
 * @param {string} productIdTokenKey - Unique ID of the product
 */
async function recordProductHitCount(productIdTokenKey) {
    if (!productIdTokenKey || productIdTokenKey.startsWith("ext_mock_")) return;

    // 1. Local state update
    const targetedProduct = (SYSTEM_DATABASE.products || []).find(p => p.pid === productIdTokenKey);
    if (targetedProduct) {
        targetedProduct.clickCount = (targetedProduct.clickCount || 0) + 1;
    }

    // 2. Firebase Firestore atomic update
    try {
        if (window.FortMartFirebase) {
            const { db, doc, updateDoc, increment } = window.FortMartFirebase;
            const productRef = doc(db, "products", productIdTokenKey);
            
            await updateDoc(productRef, {
                clickCount: increment(1)
            });
        } else if (window.firebase && window.firebase.firestore) {
            const db = window.firebase.firestore();
            await db.collection("products").doc(productIdTokenKey).update({
                clickCount: firebase.firestore.FieldValue.Increment(1)
            });
        }
    } catch (err) {
        console.warn("Could not increment product clickCount in Firestore:", err);
    }
}

/**
 * ADMIN TOGGLE EXCLUSIVE ADMIN SLOT STATE
 * Assigns or unassigns the single admin-exclusive slot and persists it live to Firestore system_metadata/leaderboardConfig.
 */
async function toggleAdminExclusiveSlotState(pid) {
    let newAdminSlotValue = null;
    if (SYSTEM_DATABASE.adminSlot === pid) {
        SYSTEM_DATABASE.adminSlot = null;
        if (typeof showTopRightToast === "function") showTopRightToast("Admin slot unassigned successfully.", "error");
    } else {
        SYSTEM_DATABASE.adminSlot = pid;
        newAdminSlotValue = pid;
        if (typeof showTopRightToast === "function") showTopRightToast("Admin slot assigned to this product exclusively.", "success");
    }

    try {
        if (window.FortMartFirebase) {
            const { db, doc, setDoc } = window.FortMartFirebase;
            await setDoc(doc(db, "system_metadata", "leaderboardConfig"), { adminSlot: newAdminSlotValue }, { merge: true });
        }
        
        administrativeSaveAndRefreshDisplay(pid);
    } catch (err) {
        console.error("Unable to persist admin exclusive slot assignment back to Firestore:", err);
    }
}

/**
 * ADMIN TOGGLE PIN STATE
 * Safely updates the global pinned metrics tracking document within the server collections workspace.
 */
async function executeToggleProductPinState(productIdKey) {
    if (!SYSTEM_DATABASE.pinnedLeaderboard) SYSTEM_DATABASE.pinnedLeaderboard = [];
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard;
    const indexLocation = leaderboard.indexOf(productIdKey);
    
    if (indexLocation > -1) {
        leaderboard.splice(indexLocation, 1);
    } else {
        if (leaderboard.length >= 20) {
            if (typeof showTopRightToast === "function") showTopRightToast("Administrative Action Blocked: The leaderboard has hit its maximum limit of 20 slots.", "error");
            return;
        }
        leaderboard.push(productIdKey);
    }

    try {
        if (window.FortMartFirebase) {
            const { db, doc, setDoc } = window.FortMartFirebase;
            await setDoc(doc(db, "system_metadata", "leaderboardConfig"), { pinnedLeaderboard: leaderboard }, { merge: true });
        }
        
        if (typeof administrativeSaveAndRefreshDisplay === "function") {
            administrativeSaveAndRefreshDisplay(productIdKey);
        } else {
            renderMarketplaceProductsDisplayLoop();
            launchComprehensiveProductSpecificationsExpandedModalView(productIdKey);
        }
    } catch (err) {
        console.error("Unable to persist admin toggle pin mutation trace back to Firestore:", err);
    }
}

function ensureLeaderboardModalHTMLExists() {
    if (document.getElementById("pinned-leaderboard-modal")) return;

    const modalWrapperNode = document.createElement("div");
    modalWrapperNode.id = "pinned-leaderboard-modal";
    modalWrapperNode.className = "universal-modal-container-wrapper";
    modalWrapperNode.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); display: none; align-items: center;
        justify-content: center; z-index: 10000; padding: 20px;
    `;

    modalWrapperNode.innerHTML = `
        <div style="background: white; width: 100%; max-width: 550px; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; max-height: 85vh;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                <h3 style="margin: 0; color: var(--fort-blue-dark);">🏆 Pinned Products Leaderboard (20 Slots)</h3>
                <button onclick="closeActiveModalDirectly('pinned-leaderboard-modal')" style="background: none; border: none; font-size: 1.3rem; cursor: pointer;">✕</button>
            </div>
            <div id="leaderboard-slots-container" style="overflow-y: auto; margin-top: 15px; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;"></div>
        </div>
    `;
    document.body.appendChild(modalWrapperNode);
}

let trackingActiveSelectedLeaderboardPid = null;

function launchPinnedProductsLeaderboardModal() {
    ensureLeaderboardModalHTMLExists();
    
    const container = document.getElementById("leaderboard-slots-container");
    if (!container) return;
    container.innerHTML = "";
    
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
    
    if (leaderboard.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #718096; font-size: 0.9rem; margin: 20px 0;">No items are currently pinned to the leaderboard.</p>`;
    } else {
        leaderboard.forEach((pid, index) => {
            const product = SYSTEM_DATABASE.products.find(p => p.pid === pid);
            const isSelected = (trackingActiveSelectedLeaderboardPid === pid);
            
            const slotRowElement = document.createElement("div");
            slotRowElement.style.cssText = `
                border: 1px solid ${isSelected ? 'var(--fort-blue-primary)' : '#e2e8f0'};
                border-radius: 6px; padding: 10px; background: ${isSelected ? '#f7fafc' : 'white'};
                cursor: pointer; display: flex; flex-direction: column; gap: 8px;
            `;
            slotRowElement.onclick = () => {
                trackingActiveSelectedLeaderboardPid = isSelected ? null : pid;
                launchPinnedProductsLeaderboardModal();
            };
            
            const titleText = product ? product.name : `[Unknown/Deleted Product ID: ${pid}]`;
            const clickCountInfo = product ? `(${product.clickCount || 0} views)` : '';
            
            let actionButtonsBarHTML = "";
            if (isSelected) {
                actionButtonsBarHTML = `
                    <div style="display: flex; gap: 6px; margin-top: 4px;" onclick="event.stopPropagation();">
                        <button class="btn-blue" style="flex: 1; padding: 4px; font-size: 0.75rem; font-weight: bold;" onclick="shiftLeaderboardRankPosition('${pid}', -1)">▲ Move Up</button>
                        <button class="btn-blue" style="flex: 1; padding: 4px; font-size: 0.75rem; font-weight: bold;" onclick="shiftLeaderboardRankPosition('${pid}', 1)">▼ Move Down</button>
                        <button class="btn-gray" style="flex: 1; padding: 4px; font-size: 0.75rem; font-weight: bold; background: #fed7d7; color: #c53030; border: 1px solid #feb2b2;" onclick="removeLeaderboardItemDirectly('${pid}')">🗑️ Remove</button>
                    </div>
                `;
            }
            
            slotRowElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem;">
                    <div style="font-weight: bold; color: var(--fort-blue-light); display: flex; gap: 8px;">
                        <span>#${index + 1}</span>
                        <span style="color: #2d3748; font-weight: 500; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titleText}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: #a0aec0;">${clickCountInfo}</span>
                </div>
                ${actionButtonsBarHTML}
            `;
            container.appendChild(slotRowElement);
        });
    }
    
    document.getElementById("pinned-leaderboard-modal").style.display = "flex";
}

/**
 * Changes rank index ordering position up or down inside leaderboard tracking fields arrays (with Cloud Sync)
 */
async function shiftLeaderboardRankPosition(pid, directionalDeltaIndex) {
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
    const targetIndex = leaderboard.indexOf(pid);
    if (targetIndex === -1) return;
    
    const computedNewPositionIndex = targetIndex + directionalDeltaIndex;
    if (computedNewPositionIndex < 0 || computedNewPositionIndex >= leaderboard.length) return;
    
    let temporaryHolderPlaceholder = leaderboard[targetIndex];
    leaderboard[targetIndex] = leaderboard[computedNewPositionIndex];
    leaderboard[computedNewPositionIndex] = temporaryHolderPlaceholder;
    
    try {
        if (window.FortMartFirebase) {
            const { db, doc, setDoc } = window.FortMartFirebase;
            await setDoc(doc(db, "system_metadata", "leaderboardConfig"), { pinnedLeaderboard: leaderboard }, { merge: true });
        }
        if (typeof administrativeSaveAndRefreshDisplay === "function") {
            administrativeSaveAndRefreshDisplay();
        } else {
            renderMarketplaceProductsDisplayLoop();
        }
        launchPinnedProductsLeaderboardModal();
    } catch (err) {
        console.error("Error shifting positioning configurations metrics vectors on server collections:", err);
    }
}

/**
 * Removes a product code identifier sequence directly from pinned rankings arrays (with Cloud Sync)
 */
async function removeLeaderboardItemDirectly(pid) {
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
    const index = leaderboard.indexOf(pid);
    
    if (index > -1) {
        leaderboard.splice(index, 1);
        if (trackingActiveSelectedLeaderboardPid === pid) {
            trackingActiveSelectedLeaderboardPid = null;
        }
        
        try {
            if (window.FortMartFirebase) {
                const { db, doc, setDoc } = window.FortMartFirebase;
                await setDoc(doc(db, "system_metadata", "leaderboardConfig"), { pinnedLeaderboard: leaderboard }, { merge: true });
            }
            if (typeof administrativeSaveAndRefreshDisplay === "function") {
                administrativeSaveAndRefreshDisplay(pid);
            } else {
                renderMarketplaceProductsDisplayLoop();
            }
            launchPinnedProductsLeaderboardModal();
        } catch (err) {
            console.error("Error synchronizing pin excision updates to Cloud services:", err);
        }
    }
}

/**
 * Intercepts modal closing triggers to control specific configuration views cleanly
 */
window.closeActiveModalDirectly = function(modalIdString) {
    if (modalIdString === 'pinned-leaderboard-modal') {
        const modal = document.getElementById("pinned-leaderboard-modal");
        if (modal) modal.style.display = "none";
        return;
    }
    
    const structuralModalNode = document.getElementById(modalIdString);
    if (structuralModalNode) structuralModalNode.classList.remove("active");
};

/**
 * Messenger Communications Infrastructure Core System Engine Processing Architecture Module
 */

// Core Global Structural Reference Tracking Flags for Realtime Streaming
let ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER = null;

function renderUserConversationsLogRoster() {
    const logContainerTargetNode = document.getElementById("chat-threads-target-list");
    if(!logContainerTargetNode) return;
    
    logContainerTargetNode.innerHTML = "";
    
    if(!APP_STATE.currentUser) return;
    
    // --- FEATURE: SPECIAL ADMIN BROADCAST CHANNEL CONTROLS ---
    if (APP_STATE.currentUser.uid === 'admin') {
        // Render All Personal Accounts Node Channel
        const personalBroadcastNode = document.createElement("div");
        personalBroadcastNode.className = `chat-thread-roster-row broadcast-system-node ${APP_STATE.activeChatTargetUserHash === 'broadcast_personal' ? 'active' : ''}`;
        personalBroadcastNode.onclick = () => activateMessengerConversationWorkspaceSessionBlock('broadcast_personal');
        personalBroadcastNode.innerHTML = `
            <div class="circle-container" style="width:38px; height:38px; background-color:#3182ce; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1.1rem;">📢</div>
            <div style="flex:1; overflow:hidden;">
                <h5 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#2b6cb0; font-weight:800;">[ALL PERSONAL ACCOUNTS]</h5>
                <p style="font-size:0.78rem; color:var(--fort-gray-slate); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">System Broadcast Console Terminal</p>
            </div>
        `;
        logContainerTargetNode.appendChild(personalBroadcastNode);

        // Render All Business Accounts Node Channel
        const businessBroadcastNode = document.createElement("div");
        businessBroadcastNode.className = `chat-thread-roster-row broadcast-system-node ${APP_STATE.activeChatTargetUserHash === 'broadcast_business' ? 'active' : ''}`;
        businessBroadcastNode.onclick = () => activateMessengerConversationWorkspaceSessionBlock('broadcast_business');
        businessBroadcastNode.innerHTML = `
            <div class="circle-container" style="width:38px; height:38px; background-color:#319795; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1.1rem;">📢</div>
            <div style="flex:1; overflow:hidden;">
                <h5 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#234e52; font-weight:800;">[ALL BUSINESS ACCOUNTS]</h5>
                <p style="font-size:0.78rem; color:var(--fort-gray-slate); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">System Broadcast Console Terminal</p>
            </div>
        `;
        logContainerTargetNode.appendChild(businessBroadcastNode);
    }
    
    // Track matching historical stream records blocks inside systems execution memory databases maps sets
    const computedMatchingDialoguesArray = SYSTEM_DATABASE.chats.filter(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid));
    // --- FEATURE: RECENCY SORTING METHOD ---
    computedMatchingDialoguesArray.sort((a, b) => {
        const getLatestMessageTimeToken = (threadInstance) => {
            if (!threadInstance.messageLog || threadInstance.messageLog.length === 0) return 0;
            const lastMsg = threadInstance.messageLog[threadInstance.messageLog.length - 1];
            const numericExtractionMatch = String(lastMsg.mid).match(/\d+/);
            return numericExtractionMatch ? parseInt(numericExtractionMatch[0], 10) : 0;
        };
        return getLatestMessageTimeToken(b) - getLatestMessageTimeToken(a);
    });

    if(computedMatchingDialoguesArray.length === 0 && APP_STATE.currentUser.uid !== 'admin') {
        logContainerTargetNode.innerHTML = `<div class="text-center" style="padding:20px; color:var(--fort-gray-slate); font-size:0.85rem;"><p>No active history logs tracking conversation threads instances detected within specified regional parameters profile databases.</p></div>`;
        return;
    }
    
    computedMatchingDialoguesArray.forEach(thread => {
        const opposingParticipantUid = thread.dynamicParticipants.find(id => id !== APP_STATE.currentUser.uid);
        const opposingAccountRecord = SYSTEM_DATABASE.users.find(u => u.uid === opposingParticipantUid);
        
        if(!opposingAccountRecord) return;
        
        let structuralLabelDisplayExpressionString = "";
        if(opposingAccountRecord.accountType === 'personal') {
            structuralLabelDisplayExpressionString = `${opposingAccountRecord.identityName} (Personal)`;
        } else {
            structuralLabelDisplayExpressionString = `${opposingAccountRecord.businessName} (Business) – ${opposingAccountRecord.identityName}`;
        }
        
        if(APP_STATE.searchQuery !== '') {
            if(!structuralLabelDisplayExpressionString.toLowerCase().includes(APP_STATE.searchQuery)) return;
        }
        
        // Filter out locally deleted preview lines
        const activeMessages = thread.messageLog.filter(m => !m.deletedBy || !m.deletedBy.includes(APP_STATE.currentUser.uid));
        const lastMessageLogEntry = activeMessages[activeMessages.length - 1];
        
        let previewTextLineString = "Click thread node to initiate workspace session.";
        if (lastMessageLogEntry) {
            if (lastMessageLogEntry.isDeletedForAll) {
                previewTextLineString = "This message was deleted";
            } else if (lastMessageLogEntry.isFile) {
                if (lastMessageLogEntry.isImage) previewTextLineString = `📷 [Image] ${lastMessageLogEntry.text}`;
                else if (lastMessageLogEntry.isVideo) previewTextLineString = `🎥 [Video] ${lastMessageLogEntry.text}`;
                else previewTextLineString = `📁 [File] ${lastMessageLogEntry.text}`;
            } else {
                previewTextLineString = lastMessageLogEntry.text.substring(0, 35);
            }
        }
        
        const rowWrapperNodeElement = document.createElement("div");
        rowWrapperNodeElement.className = `chat-thread-roster-row ${APP_STATE.activeChatTargetUserHash === opposingParticipantUid ? 'active' : ''}`;
        rowWrapperNodeElement.onclick = () => activateMessengerConversationWorkspaceSessionBlock(opposingParticipantUid);
        rowWrapperNodeElement.innerHTML = `
            <img src="${opposingAccountRecord.avatar || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23718096\'><path d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/></svg>'}" class="mini-profile-avatar circle-container" style="width:38px; height:38px;" alt="Avatar">
            <div style="flex:1; overflow:hidden;">
                <h5 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--fort-blue-dark); font-weight:700;">${structuralLabelDisplayExpressionString}</h5>
                <p style="font-size:0.78rem; color:var(--fort-gray-slate); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${previewTextLineString}</p>
            </div>
        `;
        logContainerTargetNode.appendChild(rowWrapperNodeElement);
    });
}

function initialDirectMessageCommunicationPipelineSetup(targetVendorOwnerUidTokenKey) {
    if(!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }
    if(APP_STATE.currentUser.uid === targetVendorOwnerUidTokenKey) {
        showTopRightToast("You are the seller, and according to Fort Mart application protocols there is no message yourself feature.", "info");
        return;
    }
    
    let ongoingThreadMatchRecord = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(targetVendorOwnerUidTokenKey));
    if(!ongoingThreadMatchRecord) {
        ongoingThreadMatchRecord = {
            chatId: `chat_${APP_STATE.currentUser.uid}_${targetVendorOwnerUidTokenKey}`,
            dynamicParticipants: [APP_STATE.currentUser.uid, targetVendorOwnerUidTokenKey],
            messageLog: []
        };
        SYSTEM_DATABASE.chats.push(ongoingThreadMatchRecord);
        syncPlatformDatabaseStateToWebStorage();
    }
    
    APP_STATE.activeChatTargetUserHash = targetVendorOwnerUidTokenKey;
    navigateToPage('messages');
    activateMessengerConversationWorkspaceSessionBlock(targetVendorOwnerUidTokenKey);
}

function getChannelConversationMemoryCache(currentUserId, activePartnerId) {
    try {
        const cachedBlob = localStorage.getItem(`fortmart_msg_cache_${currentUserId}_${activePartnerId}`);
        return cachedBlob ? JSON.parse(cachedBlob) : null;
    } catch (e) {
        console.error("Cache memory read structural block error: ", e);
        return null;
    }
}

function setChannelConversationMemoryCache(currentUserId, activePartnerId, messagesArray) {
    try {
        localStorage.setItem(`fortmart_msg_cache_${currentUserId}_${activePartnerId}`, JSON.stringify(messagesArray));
    } catch (e) {
        console.error("Cache memory storage register allocation fault: ", e);
    }
}

function initializeFirebaseRealtimeMessageStream(currentUserId, activePartnerId) {
    if (typeof ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER === "function") {
        ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER();
        ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER = null;
    }

    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(currentUserId) && c.dynamicParticipants.includes(activePartnerId));
    if (!operationalThreadRecordData) return;

    const temporaryLocalCache = getChannelConversationMemoryCache(currentUserId, activePartnerId);
    if (temporaryLocalCache) {
        operationalThreadRecordData.messageLog = temporaryLocalCache;
        refreshMessengerActiveStreamBubblesDisplayList();
    }

    if (!window.FortMartFirebase) return;
    const { db, collection, query, where, orderBy, onSnapshot } = window.FortMartFirebase;

    const queryConstraints = query(
        collection(db, "messages"),
        where("chatId", "==", operationalThreadRecordData.chatId),
        orderBy("serverTimestamp", "asc")
    );

    ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER = onSnapshot(queryConstraints, (querySnapshot) => {
        const freshlySynchronizedMessages = [];
        
        querySnapshot.forEach((docNode) => {
            const dataPayload = docNode.data();
            
            let resolvedTimeString = dataPayload.timestamp;
            if (dataPayload.serverTimestamp && typeof dataPayload.serverTimestamp.toDate === 'function') {
                resolvedTimeString = dataPayload.serverTimestamp.toDate().toLocaleTimeString([], { day: '2-digit', month: '2-digit', hour: '2-digit', year: '2-digit', minute: '2-digit' });
            }

            freshlySynchronizedMessages.push({
                mid: docNode.id,
                senderUid: dataPayload.senderUid,
                text: dataPayload.text,
                timestamp: resolvedTimeString,
                status: dataPayload.status || "single",
                isFile: dataPayload.isFile || false,
                isImage: dataPayload.isImage || false,
                isVideo: dataPayload.isVideo || false,
                fileData: dataPayload.fileData || null,
                deletedBy: dataPayload.deletedBy || [],
                isDeletedForAll: dataPayload.isDeletedForAll || false
            });
        });

        operationalThreadRecordData.messageLog = freshlySynchronizedMessages;
        setChannelConversationMemoryCache(currentUserId, activePartnerId, freshlySynchronizedMessages);
        
        refreshMessengerActiveStreamBubblesDisplayList();
        renderUserConversationsLogRoster();
    }, (errorTrace) => {
        console.error("Firebase Snapshot listener connection failure boundary condition: ", errorTrace);
    });
}

function activateMessengerConversationWorkspaceSessionBlock(targetCounterpartyUidValue) {
    if (window.innerWidth <= 768) {
        APP_STATE.deviceMode = 'phone';
    } else {
        APP_STATE.deviceMode = 'laptop';
    }

    APP_STATE.activeChatTargetUserHash = targetCounterpartyUidValue;
    
    document.getElementById("chat-pane-empty-notice").classList.add("hidden-node");
    const activeWorkspaceBlockNode = document.getElementById("chat-pane-active-view");
    activeWorkspaceBlockNode.classList.remove("hidden-node");
    
    const chatContainerPane = document.getElementById("chat-conversation-pane");
    if (chatContainerPane) {
        chatContainerPane.classList.add("phone-active-thread");
    }
    
    const targetToolbarNodeElement = document.getElementById("chat-window-top-toolbar");
    if (targetCounterpartyUidValue === 'broadcast_personal' || targetCounterpartyUidValue === 'broadcast_business') {
        const headlineLabel = targetCounterpartyUidValue === 'broadcast_personal' ? 'Broadcast to All Personal Accounts' : 'Broadcast to All Business Accounts';
        targetToolbarNodeElement.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; width:100%; justify-content:space-between; background-color: #2c5282; color:var(--fort-white-pure); padding:8px 14px;" class="rounded-rect">
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="event.stopPropagation(); closePhoneConversationOverlayViewBlock()" class="mobile-close-chat-btn" style="background:none; border:none; color:#fff; font-size:1.3rem; margin-right:8px; padding:0 5px; cursor:pointer;">
                        ←
                    </button>
                    <span style="font-weight:700; font-size:0.95rem;">📢 ${headlineLabel}</span>
                </div>
            </div>
        `;
        refreshMessengerActiveStreamBubblesDisplayList();
    } else {
        const counterpartyUserRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetCounterpartyUidValue);
        targetToolbarNodeElement.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; width:100%; justify-content:space-between; background-color: var(--fort-blue-primary); color:var(--fort-white-pure); padding:8px 14px;" class="rounded-rect">
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="launchDetailedUserProfileContextOverlaySummaryModal('${targetCounterpartyUidValue}')">
                    <button onclick="event.stopPropagation(); closePhoneConversationOverlayViewBlock()" class="mobile-close-chat-btn" style="background:none; border:none; color:#fff; font-size:1.3rem; margin-right:8px; padding:0 5px; cursor:pointer;">
                        ←
                    </button>
                    <img src="${counterpartyUserRecord.avatar || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ffffff\'><path d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/></svg>'}" style="width:32px; height:32px;" class="circle-container" alt="User Avatar Image Context">
                    <span style="font-weight:600; font-size:0.9rem;">${counterpartyUserRecord.identityName}</span>
                </div>
                <div class="toolbar-buttons-sets" style="display:flex; gap:8px;">
                    <button class="btn-danger" style="padding:4px 10px; font-size:0.75rem;" onclick="executeWipeEntireDialogueLogsHistoryContextChain()">Clear Chat</button>
                </div>
            </div>
        `;
        
        initializeFirebaseRealtimeMessageStream(APP_STATE.currentUser.uid, targetCounterpartyUidValue);
    }
}

function closePhoneConversationOverlayViewBlock() {
    if (typeof ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER === "function") {
        ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER();
        ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER = null;
    }
    const chatContainerPane = document.getElementById("chat-conversation-pane");
    if (chatContainerPane) {
        chatContainerPane.classList.remove("phone-active-thread");
    }
    APP_STATE.activeChatTargetUserHash = null;
    renderUserConversationsLogRoster();
}

function refreshMessengerActiveStreamBubblesDisplayList() {
    const streamTargetBoxNode = document.getElementById("chat-bubble-stream-area");
    if(!streamTargetBoxNode) return;
    
    streamTargetBoxNode.innerHTML = "";
    
    if(!APP_STATE.activeChatTargetUserHash || !APP_STATE.currentUser) return;
    
    if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
        streamTargetBoxNode.innerHTML = `<div class='empty-placeholder' style='align-self:center; margin:auto;'><p style='color:#2b6cb0; font-size:0.88rem; font-weight:600;'>System Broadcast Terminal Mode Active.<br><span style='font-weight:400; color:var(--fort-gray-slate); font-size:0.8rem;'>Messages pushed through this form pipeline will automatically populate all designated account communication channels.</span></p></div>`;
        return;
    }
    
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if(!operationalThreadRecordData || operationalThreadRecordData.messageLog.length === 0) {
        streamTargetBoxNode.innerHTML = `<div class='empty-placeholder' style='align-self:center; margin:auto;'><p style='color:var(--fort-gray-slate); font-size:0.85rem;'>Dialogue stream initialized. Type message lines below to execute securely transmitted communication.</p></div>`;
        return;
    }
    
    operationalThreadRecordData.messageLog.forEach(msg => {
        // --- FEATURE: UNILATERAL PURGE SKIP INTERCEPTOR ---
        if (msg.deletedBy && msg.deletedBy.includes(APP_STATE.currentUser.uid)) return;

        const outboundFlagCondition = msg.senderUid === APP_STATE.currentUser.uid;
        const failedTransmissionFlag = msg.status === 'failed';
        
        const bubbleWrapperElementNode = document.createElement("div");
        bubbleWrapperElementNode.className = `chat-bubble-node rounded-rect ${outboundFlagCondition ? 'outgoing-msg' : 'incoming-msg'} ${failedTransmissionFlag ? 'transmission-failed-node' : ''}`;
        
        let dynamicTicksLayoutHTML = "";        
        let bodyLayoutHTML = "";
        let downloadControlHTML = "";
        
        // --- FEATURE: FORMAT DELETED PAYLOAD GLOBAL STATE ---
        if (msg.isDeletedForAll) {
            bodyLayoutHTML = `<p style="word-break:break-word; font-style:italic; opacity:0.75;">this message was deleted</p>`;
        } else if (msg.isFile) {
            if (msg.isImage) {
                bodyLayoutHTML = `
                    <div style="display: block;">
                        <img src="${msg.fileData}" class="msg-image-preview" style="max-width: 200px; max-height: 200px; border-radius: 6px; display: block; margin-bottom: 4px;" alt="Image File Payload">
                        <p style="word-break:break-word; font-size:0.78rem; color:inherit; opacity:0.85; margin:0; display:flex; align-items:center; gap:4px;">🖼️ ${msg.text}</p>
                    </div>
                `;
            } else if (msg.isVideo) {
                bodyLayoutHTML = `
                    <div style="display: block; position: relative; max-width: 240px; border-radius: 6px; overflow: hidden; background: #000; margin-bottom: 4px;">
                        <video src="${msg.fileData}" style="width: 100%; height: auto; display: block; pointer-events: none;" preload="metadata"></video>
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.35);">
                            <span style="font-size: 2rem; color: #fff; opacity: 0.85;">▶</span>
                        </div>
                    </div>
                    <p style="word-break:break-word; font-size:0.78rem; color:inherit; opacity:0.85; margin:0; display:flex; align-items:center; gap:4px;">🎥 ${msg.text}</p>
                `;
            } else {
                let documentBadgeSVGHTML = "";
                const absoluteFileExtensionToken = msg.text.split('.').pop().toLowerCase();
                
                if (absoluteFileExtensionToken === 'pdf') {
                    documentBadgeSVGHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:2px;">
                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM11.5 9.5C11.5 10.33 10.83 11 10 11H8.5V12.5H7V7H10C10.83 7 11.5 7.67 11.5 8.5V9.5ZM17 8.5C17 9.88 15.88 11 14.5 11H13V7H14.5C15.88 7 17 8.12 17 8.5ZM21 15H19.5V14H21V12.5H19.5V11.5H21V10H18V16H21V15Z" fill="#E53E3E"/>
                            <path d="M8.5 8.5H10V9.5H8.5V8.5ZM14.5 8.5H15.5V9.5H14.5V8.5Z" fill="#E53E3E"/>
                        </svg>`;
                } else if (absoluteFileExtensionToken === 'txt') {
                    documentBadgeSVGHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:2px;">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#4A5568"/>
                        </svg>`;
                } else {
                    documentBadgeSVGHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:2px;">
                            <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM12 18C9.79 18 8 16.21 8 14C8 11.79 9.79 10 12 10C14.21 10 16 11.79 16 14C16 16.21 14.21 18 12 18Z" fill="#3182CE"/>
                        </svg>`;
                }
                
                bodyLayoutHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 6px; min-width: 120px;">
                        ${documentBadgeSVGHTML}
                        <p style="word-break:break-word; font-weight:600; font-size:0.82rem; margin:4px 0 0 0; text-align:center;">${msg.text}</p>
                    </div>
                `;
            }
            if (!failedTransmissionFlag) {
                downloadControlHTML = `<button class="msg-action-btn" onclick="executeMessageFileDownloadTracker('${msg.mid}')">📥 Download</button>`;
            }
        } else {
            bodyLayoutHTML = `<p style="word-break:break-word;">${msg.text}</p>`;
        }
        
        let deleteForAllControlHTML = "";
        let retryControlHTML = "";
        
        if (failedTransmissionFlag) {
            retryControlHTML = `<button class="msg-action-btn" style="color:#e53e3e; font-weight:700;" onclick="executeRetryMessageTransmissionPipeline('${msg.mid}')">🔄 Retry</button>`;
        } else if (outboundFlagCondition && !msg.isDeletedForAll) {
            deleteForAllControlHTML = `<button class="msg-action-btn" style="color:#c53030; font-weight:700;" onclick="executeSelectedBubbleMessagePurgeForAll('${msg.mid}')">💥 Delete for All</button>`;
        }
        
        let actionControlsMenuHTML = "";
        if (!msg.isDeletedForAll) {
            actionControlsMenuHTML = `
                <div class="msg-hover-actions">
                    ${retryControlHTML}
                    <button class="msg-action-btn" onclick="executeMessageTextCopyClipboard('${msg.mid}')">📋 Copy</button>
                    ${downloadControlHTML}
                    <button class="msg-action-btn" style="color:#9b2c2c;" onclick="executeSelectedBubbleMessagePurge('${msg.mid}')">🗑️ Delete</button>
                    ${deleteForAllControlHTML}
                </div>
            `;
        }
        
        bubbleWrapperElementNode.innerHTML = `
            ${bodyLayoutHTML}
            <div class="msg-meta-row">
                <span>${msg.timestamp}</span> 
                ${dynamicTicksLayoutHTML}
            </div>
            ${actionControlsMenuHTML}
        `;
        streamTargetBoxNode.appendChild(bubbleWrapperElementNode);
    });
    
    streamTargetBoxNode.scrollTop = streamTargetBoxNode.scrollHeight;
}

async function sendChatMessageDirect() {
    const textInputNodeElement = document.getElementById("chat-text-input-field");
    if (!textInputNodeElement) return;
    
    const enteredMessageTextString = textInputNodeElement.value.trim();
    if(enteredMessageTextString === "" || !APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;
    
    if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
        executeSystemWideBroadcastTransmission(enteredMessageTextString, null);
        textInputNodeElement.value = "";
        return;
    }
    
    if(APP_STATE.activeChatTargetUserHash === 'admin') {
         showTopRightToast("The Fort Mart profile can't be replied.", "info");
         textInputNodeElement.value = "";
         return;
    }
    
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if(operationalThreadRecordData) {
        textInputNodeElement.value = "";

        // --- RETENTION POLICY UPDATE: 60 DAYS ---
        const sixtyDayRetentionHorizonMs = 60 * 24 * 60 * 60 * 1000;
        const expectedAutoDeletionDeadlineDate = new Date(Date.now() + sixtyDayRetentionHorizonMs);

        const messagePayload = {
            chatId: operationalThreadRecordData.chatId,
            senderUid: APP_STATE.currentUser.uid,
            text: enteredMessageTextString,
            isFile: false,
            isImage: false,
            isVideo: false,
            fileData: null,
            deletedBy: [],
            isDeletedForAll: false,
            autoDeleteAt: expectedAutoDeletionDeadlineDate
        };

        if (window.FortMartFirebase) {
            try {
                const { db, collection, addDoc, serverTimestamp } = window.FortMartFirebase;
                await addDoc(collection(db, "messages"), {
                    ...messagePayload,
                    serverTimestamp: serverTimestamp()
                });
            } catch (err) {
                console.error("Database tracking fault dispatching payload message cluster:", err);
                // Fallback locally to flag a failed state to the user interface pipeline
                flagLocalTemporaryTransmissionFailure(operationalThreadRecordData, messagePayload);
            }
        }
        
    }
}

function handleMessageAttachedFileSelectionEvent(inputNodeContextElement) {
    if (!inputNodeContextElement.files || inputNodeContextElement.files.length === 0) return;
    if (!APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;
    if (APP_STATE.activeChatTargetUserHash === 'admin') {
         showTopRightToast("The Fort Mart profile can't be replied.", "info");
         inputNodeContextElement.value = "";
         return;
    }
    
    const singleFileReference = inputNodeContextElement.files[0];
    const checkIsImageFormatCondition = singleFileReference.type.startsWith('image/');
    const checkIsVideoFormatCondition = singleFileReference.type.startsWith('video/');
    
    const fileStorageProcessingReader = new FileReader();
    
    fileStorageProcessingReader.onload = async function(readerEvent) {
        const transportFilePayloadConfig = {
            isFile: true,
            isImage: checkIsImageFormatCondition,
            isVideo: checkIsVideoFormatCondition,
            fileData: readerEvent.target.result
        };

        if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
            executeSystemWideBroadcastTransmission(singleFileReference.name, transportFilePayloadConfig);
            inputNodeContextElement.value = "";
            return;
        }

        const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
        if (operationalThreadRecordData) {
            inputNodeContextElement.value = "";

            // --- RETENTION POLICY UPDATE: 60 DAYS ---
            const sixtyDayRetentionHorizonMs = 60 * 24 * 60 * 60 * 1000;
            const expectedAutoDeletionDeadlineDate = new Date(Date.now() + sixtyDayRetentionHorizonMs);

            const messagePayload = {
                chatId: operationalThreadRecordData.chatId,
                senderUid: APP_STATE.currentUser.uid,
                text: singleFileReference.name,
                isFile: true,
                isImage: checkIsImageFormatCondition,
                isVideo: checkIsVideoFormatCondition,
                fileData: readerEvent.target.result,
                deletedBy: [],
                isDeletedForAll: false,
                autoDeleteAt: expectedAutoDeletionDeadlineDate
            };

            if (window.FortMartFirebase) {
                try {
                    const { db, collection, addDoc, serverTimestamp } = window.FortMartFirebase;
                    await addDoc(collection(db, "messages"), {
                        ...messagePayload,
                        serverTimestamp: serverTimestamp()
                    });
                } catch (err) {
                    console.error("Failed writing media configuration packet payload to cloud: ", err);
                    flagLocalTemporaryTransmissionFailure(operationalThreadRecordData, messagePayload);
                }
            }
            
        }
    };
    
    fileStorageProcessingReader.readAsDataURL(singleFileReference);
}

// --- FEATURE: FLAG LOCAL UNTRANSMITTED MESSAGE DATA IN MEMORY ---
function flagLocalTemporaryTransmissionFailure(threadRef, basePayload) {
    const failedLocalMockId = "m_failed_" + Date.now();
    threadRef.messageLog.push({
        ...basePayload,
        mid: failedLocalMockId,
        status: 'failed',
        timestamp: new Date().toLocaleTimeString([], { day: '2-digit', month: '2-digit', hour: '2-digit', year: '2-digit', minute: '2-digit' })
    });
    refreshMessengerActiveStreamBubblesDisplayList();
}

// --- FEATURE: MANUALLY RETRY TRANSLATING TRANSMISSIONS ---
async function executeRetryMessageTransmissionPipeline(failedLocalMockId) {
    if (!window.FortMartFirebase || !APP_STATE.activeChatTargetUserHash) return;
    
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const targetFailedMemoryNodeIndex = operationalThreadRecordData.messageLog.findIndex(m => m.mid === failedLocalMockId);
    if (targetFailedMemoryNodeIndex === -1) return;
    
    const clonedDataPayload = { ...operationalThreadRecordData.messageLog[targetFailedMemoryNodeIndex] };
    
    // Purge local identifiers before hitting Firestore engine collection clusters
    delete clonedDataPayload.mid;
    
    try {
        const { db, collection, addDoc, serverTimestamp } = window.FortMartFirebase;
        
        // Wipe local failed bubble before attempting write to maintain thread chronology
        operationalThreadRecordData.messageLog.splice(targetFailedMemoryNodeIndex, 1);
        
        await addDoc(collection(db, "messages"), {
            ...clonedDataPayload,
            serverTimestamp: serverTimestamp()
        });
    } catch (err) {
        console.error("Re-dispatch connection terminal execution timeout context fault:", err);
        showTopRightToast("Transmission still failing. Please verify network connectivity options.", "error");
    }
}

// --- FEATURE: FIRESTORE SINGLE USER RETENTION WIPE ---
async function executeSelectedBubbleMessagePurge(messageDocId) {
    if (!window.FortMartFirebase || !APP_STATE.currentUser) return;
    if (String(messageDocId).startsWith("m_failed_")) {
        // Drop local failed items out of cache logs immediately
        const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid));
        if (operationalThreadRecordData) {
            operationalThreadRecordData.messageLog = operationalThreadRecordData.messageLog.filter(m => m.mid !== messageDocId);
            refreshMessengerActiveStreamBubblesDisplayList();
        }
        return;
    }

    try {
        const { db, doc, updateDoc, arrayUnion } = window.FortMartFirebase;
        const targetedDocNodeRef = doc(db, "messages", messageDocId);
        
        await updateDoc(targetedDocNodeRef, {
            deletedBy: arrayUnion(APP_STATE.currentUser.uid)
        });
    } catch (err) {
        console.error("Error executing server unilateral reference array updates:", err);
    }
}

// --- FEATURE: FIRESTORE UNILATERAL BULK CLEAR CHAT ENGINE ---
function executeWipeEntireDialogueLogsHistoryContextChain() {
    displayConfirmationModalOverlayAction("Are you sure you want to clear this chat?", async () => {
        if (!APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash || !window.FortMartFirebase) return;
        
        const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
        if (!operationalThreadRecordData || operationalThreadRecordData.messageLog.length === 0) return;
        
        const { db, doc, updateDoc, arrayUnion } = window.FortMartFirebase;
        
        // Loop through current items in thread cache to register your deletion flag onto all matching records
        for (const msg of operationalThreadRecordData.messageLog) {
            if (!String(msg.mid).startsWith("m_failed_")) {
                try {
                    const targetedDocNodeRef = doc(db, "messages", msg.mid);
                    await updateDoc(targetedDocNodeRef, {
                        deletedBy: arrayUnion(APP_STATE.currentUser.uid)
                    });
                } catch (err) {
                    console.error("Failed handling mass structural document updates mapping on document ID: " + msg.mid, err);
                }
            }
        }
    });
}

// --- FEATURE: FIRESTORE DELETE FOR ALL DISPATCH MUTATOR ---
async function executeSelectedBubbleMessagePurgeForAll(messageDocId) {
    if (!window.FortMartFirebase) return;
    
    try {
        const { db, doc, updateDoc } = window.FortMartFirebase;
        const targetedDocNodeRef = doc(db, "messages", messageDocId);
        
        await updateDoc(targetedDocNodeRef, {
            text: "this message was deleted",
            isDeletedForAll: true,
            isFile: false,
            isImage: false,
            isVideo: false,
            fileData: null
        });
    } catch (err) {
        console.error("Error committing global data deletion updates context parameters:", err);
    }
}

function executeMessageTextCopyClipboard(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch) {
        navigator.clipboard.writeText(exactMessagePayloadMatch.text).catch(err => {
            console.error("System Matrix Clipboard Exception Handling Log:", err);
        });
    }
    showTopRightToast("Text Copied Successfully", "success");
}

function executeMessageFileDownloadTracker(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch && exactMessagePayloadMatch.isFile && exactMessagePayloadMatch.fileData) {
        const structuralAnchorDownloadElement = document.createElement("a");
        structuralAnchorDownloadElement.href = exactMessagePayloadMatch.fileData;
        structuralAnchorDownloadElement.download = exactMessagePayloadMatch.text;
        document.body.appendChild(structuralAnchorDownloadElement);
        structuralAnchorDownloadElement.click();
        document.body.removeChild(structuralAnchorDownloadElement);
    }
}

/**
 * --- FEATURE: ADMIN BROADCAST ROUTING SYSTEM ENGINE ---
 * Writes broadcast nodes dynamically directly into the Firestore messaging context logs
 */
async function executeSystemWideBroadcastTransmission(textPayloadString, filePackageConfigObject) {
    const targetGroupString = APP_STATE.activeChatTargetUserHash === 'broadcast_personal' ? 'personal' : 'business';
    const destinationAccountsArray = SYSTEM_DATABASE.users.filter(u => u.accountType === targetGroupString && u.uid !== 'admin');
    if (destinationAccountsArray.length === 0) {
        showTopRightToast("Broadcast processing aborted. There are no target accounts.", "error");
        return;
    }
    
    if (!window.FortMartFirebase) {
        showTopRightToast("Firebase infrastructure not configured.", "error");
        return;
    }

    const { db, collection, addDoc, serverTimestamp } = window.FortMartFirebase;
    const ninetyDayRetentionHorizonMs = 90 * 24 * 60 * 60 * 1000;
    const expectedAutoDeletionDeadlineDate = new Date(Date.now() + ninetyDayRetentionHorizonMs);

    try {
        for (let i = 0; i < destinationAccountsArray.length; i++) {
            const profileRecord = destinationAccountsArray[i];
            
            // Construct target dynamic tracking combo chatId string
            const derivedChatId = `chat_admin_${profileRecord.uid}`;
            
            const broadcastPayload = {
                chatId: derivedChatId,
                senderUid: 'admin',
                text: textPayloadString,
                isFile: filePackageConfigObject ? filePackageConfigObject.isFile : false,
                isImage: filePackageConfigObject ? filePackageConfigObject.isImage : false,
                isVideo: filePackageConfigObject ? filePackageConfigObject.isVideo : false,
                fileData: filePackageConfigObject ? filePackageConfigObject.fileData : null,
                deletedBy: [],
                autoDeleteAt: expectedAutoDeletionDeadlineDate
            };

            await addDoc(collection(db, "messages"), {
                ...broadcastPayload,
                serverTimestamp: serverTimestamp()
            });
        }
        showTopRightToast(`Broadcast routed successfully to all ${destinationAccountsArray.length} active ${targetGroupString} profile logs.`, "success");
    } catch (err) {
        console.error("Critical block exception propagating message broadcasts: ", err);
    }
}

/**
 * Bubble Level Action Controls Core Utilities
 */
function executeMessageTextCopyClipboard(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch) {
        navigator.clipboard.writeText(exactMessagePayloadMatch.text).catch(err => {
            console.error("System Matrix Clipboard Exception Handling Log:", err);
        });
    }

    showTopRightToast("Text Copied Successfully", "success");
}

async function executeSelectedBubbleMessagePurge(messageIdentifierKey) {
    if (!window.FortMartFirebase) return;
    const { db, doc, updateDoc, arrayUnion } = window.FortMartFirebase;

    try {
        // Appends the current user ID to the deletedBy array tracking mask on Firebase side
        await updateDoc(doc(db, "messages", messageIdentifierKey), {
            deletedBy: arrayUnion(APP_STATE.currentUser.uid)
        });
    } catch (err) {
        console.error("Failed to flag message tracking indices as deleted: ", err);
    }
}

async function executeSelectedBubbleMessagePurgeForAll(messageIdentifierKey) {
    if (!window.FortMartFirebase) return;
    const { db, doc, deleteDoc } = window.FortMartFirebase;

    try {
        await deleteDoc(doc(db, "messages", messageIdentifierKey));
    } catch (err) {
        console.error("Failed to execute destructive remote write on targeted atomic message: ", err);
    }
}

function executeMessageFileDownloadTracker(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch && exactMessagePayloadMatch.isFile && exactMessagePayloadMatch.fileData) {
        const structuralAnchorDownloadElement = document.createElement("a");
        structuralAnchorDownloadElement.href = exactMessagePayloadMatch.fileData;
        structuralAnchorDownloadElement.download = exactMessagePayloadMatch.text;
        document.body.appendChild(structuralAnchorDownloadElement);
        structuralAnchorDownloadElement.click();
        document.body.removeChild(structuralAnchorDownloadElement);
    }
}

function executeAutoReplyEvaluationProcessFrame(operationalThreadRecordData) {
    const counterpartyAccountProfile = SYSTEM_DATABASE.users.find(u => u.uid === APP_STATE.activeChatTargetUserHash);
    if(counterpartyAccountProfile && APP_STATE.activeChatTargetUserHash !== 'admin') {
        const totalOutboundLinesCount = operationalThreadRecordData.messageLog.filter(m => m.senderUid === APP_STATE.currentUser.uid).length;
        if(totalOutboundLinesCount === 1) {
            setTimeout(async () => {
                if (!window.FortMartFirebase) return;
                const { db, collection, addDoc, serverTimestamp } = window.FortMartFirebase;

                const ninetyDayRetentionHorizonMs = 90 * 24 * 60 * 60 * 1000;
                const expectedAutoDeletionDeadlineDate = new Date(Date.now() + ninetyDayRetentionHorizonMs);

                try {
                    await addDoc(collection(db, "messages"), {
                        chatId: operationalThreadRecordData.chatId,
                        senderUid: counterpartyAccountProfile.uid,
                        text: `[Automated Reply]: Thank you for reaching out to ${counterpartyAccountProfile.businessName || counterpartyAccountProfile.identityName}. We will get back to you soon.`,
                        isFile: false,
                        isImage: false,
                        isVideo: false,
                        fileData: null,
                        deletedBy: [],
                        autoDeleteAt: expectedAutoDeletionDeadlineDate,
                        serverTimestamp: serverTimestamp()
                    });
                } catch(e) {
                    console.error("AutoReply processing pipeline failure: ", e);
                }
            }, 1500);
        }
    }
}

async function executeWipeEntireDialogueLogsHistoryContextChain() {
    displayConfirmationModalOverlayAction("Are you absolutely sure you want to purge all text rows entries inside this workspace log trace container? This cannot be undone.", async () => {
        const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
        if(!operationalThreadRecordData || !window.FortMartFirebase) return;

        const { db, collection, query, where, getDocs, doc, updateDoc, arrayUnion } = window.FortMartFirebase;
        
        try {
            const targetQuery = query(collection(db, "messages"), where("chatId", "==", operationalThreadRecordData.chatId));
            const querySnapshot = await getDocs(targetQuery);
            
            // Loop over documents to add user to deletedBy array tracking indicators cleanly
            const batchPromises = [];
            querySnapshot.forEach((docNode) => {
                batchPromises.push(updateDoc(doc(db, "messages", docNode.id), {
                    deletedBy: arrayUnion(APP_STATE.currentUser.uid)
                }));
            });
            await Promise.all(batchPromises);
        } catch(e) {
            console.error("Bulk wiping routine encountered a write fault boundary layout: ", e);
        }
    });
}

function triggerMessageAttachedFileBrowserLink() {
    const targetFileInputNode = document.getElementById("chat-message-file-attachment-input");
    if (targetFileInputNode) {
        targetFileInputNode.click();
    }
}

/**
 * Universal Unified Infrastructure Floating Operations System Controller Launcher Method Engine
 */
function handleFloatingActionButtonTrigger() {
    if(!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }
    
    // Evaluate operational dynamic parameters rules routes contexts relative to view page positions
    if(APP_STATE.currentUser.accountType !== 'business' && APP_STATE.currentUser.uid !== 'admin') {
        launchadvertismentofBusinessUpgrade();
        return;
    }
    
    // Launch the security verification step first instead of going straight to the form
    launchUploadProductPasswordVerificationStep();
}

/**
 * Step 1: Verify account ownership via password authentication
 */
function launchUploadProductPasswordVerificationStep() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    modalContentTargetNode.innerHTML = `
        <h3>Enter Current Password (Step 1 of 2)</h3>
       
        <div class="form-input-container margin-top-sm">
            <label>Active Password:</label>
            <input type="password" id="upload-verify-password" class="form-field-control" placeholder="Enter password to verify ownership context">
            
            <div id="err-upload-reauth-msg" class="text-danger-alert hidden-node">Incorrect Password</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-upload-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'upload-verify-password')">
            <label for="chk-upload-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>
        <br>
        
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button> 
            <button onclick="verifyPasswordAndProceed()" class="btn-blue">Verify Password Phrase</button>
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active"); 
}

/**
 * Validates Step 1 password against active system state variables and advances to Step 2
 */
function verifyPasswordAndProceed() {
    const enteredPassword = document.getElementById("upload-verify-password").value;
    const errNode = document.getElementById("err-upload-reauth-msg");
    
    errNode.classList.add("hidden-node");
    
    if (enteredPassword !== APP_STATE.currentUser.secretKey) { 
        errNode.innerText = "Incorrect Password"; 
        errNode.classList.remove("hidden-node"); 
        return;
    }
    
    // Step 1 Success -> Proceed to Step 2 Form Inventory Template Layout
    launchUploadProductInventoryModalFormLayoutShell();
}

/**
 * Step 2: Input product details and specifications
 */
function launchUploadProductInventoryModalFormLayoutShell() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    modalContentTargetNode.innerHTML = `
        <h3>Product Upload - Step 2 of 2</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:2px;">Products created are localized and viewable exclusively within corresponding matching legal registration domain regions [Country Scope: <strong>${APP_STATE.currentUser.country}</strong>]</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Product Name</label>
            <input type="text" id="newprod-name" class="form-field-control" placeholder="Enter concise commercial inventory title text">
        </div>
 
        <div class="form-input-container">
            <label>Select Logistics Catalog Classification Category:</label>
            <select id="newprod-cat" class="form-field-control">
                <option value="Electrical Appliances">Electrical Appliances</option>
                <option value="Mobile Devices & Computers">Mobile Devices & Computers</option>
                <option value="Home Furniture">Home Furniture</option>
                <option value="Fashion Clothing Apparel">Fashion Clothing Apparel</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Sports, Fitness and Outdoors">Sports, Fitness and Outdoors</option>
                <option value="Groceries & Essentials">Groceries & Essentials</option>
                <option value="Others">Others</option>
            </select>
        </div>
        <div class="form-input-container">
            <label>Primary Short Product Description (Max 100 Chars):</label>
            <input type="text" id="newprod-info" class="form-field-control" maxlength="100" placeholder="Max 100 text characters symbols structural limits constraints loops">
        </div>
        <div class="form-input-container-image">
            <label>Upload and Preview your Image</label>
            <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                <span id="placeholderTextimg">No image selected</span>
                <img id="imagePreview" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
            </div>
            <input type="file" id="imageInput" accept="image/*">
        </div>
        <br>
        <div class="form-input-container">
            <label>More Info and Specifications</label>
            <textarea id="newprod-aiinfo" class="form-field-control rounded-rect" style="height:60px;" placeholder="A more detailed explanation of product. (Optional but recommended)"></textarea>
        </div>
        <div class="form-input-container">
            <label>Unit Commercial Pricing Valuation Baseline Quote Amount Number (${APP_STATE.currentUser.country === 'Nigeria' ? '₦' : '$'}):</label>
            <input type="number" id="newprod-price" class="form-field-control" placeholder="Enter numeric base rate configuration">
        </div>
        
        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel Form</button>
            <button onclick="executePipelineCommitNewInventoryPostRecord()" class="btn-blue">Publish Active Post</button>
        </div>
    `;

    // Initialize visual logic and file attachments
    setupImagePreviewListener();
    document.getElementById("auth-modal").classList.add("active");
}

/**
 * Handles live preview display of chosen file
 */
function setupImagePreviewListener() {
    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const placeholderText = document.getElementById("placeholderTextimg");

    imageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
                placeholderText.style.display = "none";
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = "";
            imagePreview.style.display = "none";
            placeholderText.style.display = "block";
        }
    });
}

function executePipelineCommitNewInventoryPostRecord() {
    const name = document.getElementById("newprod-name").value.trim();
    const cat = document.getElementById("newprod-cat").value;
    const info = document.getElementById("newprod-info").value.trim();
    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const aiInfo = document.getElementById("newprod-aiinfo").value.trim();
    const priceRaw = document.getElementById("newprod-price").value;

    if(name === "" || info === "" || priceRaw === "" || !imageInput.files[0]) {
        showTopRightToast("All compulsory info must be imputed and select an image before publishing.", "error");
        return;
    }
    
    const productImgDataUrl = imagePreview.src;

    const ownerUid = APP_STATE.currentUser.uid;
    const ownerName = APP_STATE.currentUser.identityName || "User Account";
    const ownerBusinessName = APP_STATE.currentUser.businessName || ownerName;

    const finalProductInstanceObjectNode = {
        pid: "p_" + Date.now(),
        ownerUid: ownerUid,
        ownerName: ownerName,
        ownerBusinessName: ownerBusinessName,
        name: name,
        category: cat,
        info: info,
        price: parseFloat(priceRaw),
        coverPhoto: productImgDataUrl,
        aiInfo: aiInfo || "Standard platform baseline listed trading stock profile object reference specifications tracking structure model elements values data parameters.",
        clickCount: 0
    };

    SYSTEM_DATABASE.products.push(finalProductInstanceObjectNode);

    if (window.FortMartFirebase) {
        const { db, doc, setDoc } = window.FortMartFirebase;
        setDoc(doc(db, "products", finalProductInstanceObjectNode.pid), finalProductInstanceObjectNode)
            .then(() => {
                // Re-sync dashboard metrics count directly from Firebase after successful write
                syncAdminDashboardMetricsFromFirebase();
            })
            .catch(err => console.error("Cloud inventory post storage failure synchronization traceback:", err));
    }

    if (typeof syncPlatformDatabaseStateToWebStorage === 'function') {
        syncPlatformDatabaseStateToWebStorage();
    }
    
    closeActiveModalDirectly('auth-modal');
    showTopRightToast("Product Uploading Request Sent Succesfully.", "success");
    
    if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
        renderMarketplaceProductsDisplayLoop();
    }
}

/**
 * Intelligent Cognitive AI Framework Search Integration Engine Assistant Workspace Panel Module
 */
let COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY = [
    { source: "ai", text: "Greetings! I am the integrated Fort AI Systems Cognitive Assistant. I possess complete operational system diagnostic metrics blueprints maps details to aid your experience. Ask me anything regarding site rules, features layout systems controls parameters, or dynamic product functionalities analysis schemas profiles.", graphics: null }
];

function initializeFortAiChatWindowWorkspace() {
    refreshAiAssistantBubbleLayoutStreamScroller();
}

function routeProductContextInquiryDirectlyToAiAssistant(productIdKeyValString) {
    const matchObj = SYSTEM_DATABASE.products.find(p => p.pid === productIdKeyValString);
    if(matchObj) {
         APP_STATE.fortAiActiveTaggedProductObject = matchObj;
         COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({
              source: "user",
              text: `[System Context Bound Reference Trigger Mapping Attach Element Event]: Actively inspecting target inventory trace: "${matchObj.name}". Please outline functional specs overview mappings indices.`,
              graphics: null
         });
         
         navigateToPage('fort-ai');
         
         // Trigger automated delayed downstream intelligence mapping lookup responses structures vectors sets algorithms
         setTimeout(() => {
             COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({
                 source: "ai",
                 text: `Analyzing core technical tracking schemas variables metrics data blocks references for inventory profile item listing matching key: "${matchObj.name}". Found metadata profiles: ${matchObj.info} Additional AI Parameters Framework Blueprint Specs Mapping Log reads: ${matchObj.aiInfo}`,
                 graphics: null
             });
             refreshAiAssistantBubbleLayoutStreamScroller();
         }, 1000);
    }
}

function refreshAiAssistantBubbleLayoutStreamScroller() {
    const containerTargetNode = document.getElementById("ai-chat-bubble-scroller");
    if(!containerTargetNode) return;
    
    containerTargetNode.innerHTML = "";
    
    const tagLabelNode = document.getElementById("ai-active-product-tag");
    if(APP_STATE.fortAiActiveTaggedProductObject) {
        tagLabelNode.innerText = `🏷️ Context Anchor Active: ${APP_STATE.fortAiActiveTaggedProductObject.name}`;
        tagLabelNode.classList.remove("hidden-node");
    } else {
        tagLabelNode.classList.add("hidden-node");
    }
    
    COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.forEach(row => {
        const bubbleNodeElement = document.createElement("div");
        const aiFlagCondition = row.source === 'ai';
        bubbleNodeElement.className = `chat-bubble-node rounded-rect ${aiFlagCondition ? 'incoming-msg' : 'outgoing-msg'}`;
        if(aiFlagCondition) {
             bubbleNodeElement.style.backgroundColor = "#e0f2f1"; // unique assistant panel visual tracking color
        }
        
        bubbleNodeElement.innerHTML = `
            <p style="font-weight:${aiFlagCondition ? '500' : '400'};">${row.text}</p>
            <div class="msg-meta-row"><span>Fort AI Core</span></div>
        `;
        containerTargetNode.appendChild(bubbleNodeElement);
    });
    
    containerTargetNode.scrollTop = containerTargetNode.scrollHeight;
}

function submitAiQueryRequest() {
    const inputNode = document.getElementById("ai-text-input-field");
    const QueryString = inputNode.value.trim();
    if(QueryString === "") return;
    
    COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({ source: "user", text: QueryString, graphics: null });
    inputNode.value = "";
    refreshAiAssistantBubbleLayoutStreamScroller();
    
    // Cognitive execution sequence parsing rules matches patterns behaviors
    setTimeout(() => {
        let responseLineText = "I have queried the global external web references databases indices to parse your evaluation request parameters loops tracking metrics constraints, but found no direct infrastructure adjustments. Please clarify details.";
        const normalizedInput = QueryString.toLowerCase();
        
        if(normalizedInput.includes("admin") || normalizedInput.includes("password") || normalizedInput.includes("login")) {
            responseLineText = "System Operational Guide Rule Mapping Log: Global system platform management accounts operate via dial prefix selector set 'Nigeria +234' with access credentials handle matching text string 'Fort Mart'. Core parameters entries cannot be reset without validation.";
        } else if(normalizedInput.includes("shipping") || normalizedInput.includes("currency") || normalizedInput.includes("country")) {
            responseLineText = "System Architecture Framework Parameters Metric Check: Core product matching streams currency symbols outputs (₦ or $) adjust dynamically checking localized regional geo settings identifiers attributes logged when registering.";
        } else if(normalizedInput.includes("hello") || normalizedInput.includes("hi ")) {
            responseLineText = "Hello! I am standing by to process system tools troubleshooting questions, core features mapping descriptions parameters traces, or catalog asset lookup evaluations requests.";
        }
        
        COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({ source: "ai", text: responseLineText, graphics: null });
        refreshAiAssistantBubbleLayoutStreamScroller();
    }, 1200);
}

function clearAiChatHistory() {
    displayConfirmationModalOverlayAction("Are you sure you want to clear your current AI conversation session window timeline logs traces baseline elements matrices indexes?", () => {
        COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY = [
            { source: "ai", text: "Session timeline memory traces purged successfully. Framework canvas running clean. State system standing by to parse inquiries models.", graphics: null }
        ];
        APP_STATE.fortAiActiveTaggedProductObject = null;
        refreshAiAssistantBubbleLayoutStreamScroller();
    });
}

/**
 * ============================================================================
 * FORT MART MARKETPLACE APPLICATION - ENGINE ARCHITECTURE FOR SETTINGS & PRODUCTS
 * ============================================================================
 */

// Global temporary state cache for tracking unsaved media blobs before cloud upload
const APP_CACHE = {
    temporaryProfileAvatarDataUrl: "",
    temporaryProductCoverPhotoUrl: ""
};

/**
 * Manages UI sub-panel section switching inside settings dashboard view.
 */
function switchSettingsSection(selectedSectionTabIdKey) {
    document.querySelectorAll(".settings-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".settings-sub-panel").forEach(panel => panel.classList.add("hidden-node"));
    
    event.currentTarget.classList.add("active");
    document.getElementById(`settings-node-${selectedSectionTabIdKey}`).classList.remove("hidden-node");
    if(selectedSectionTabIdKey === 'my-products') {
         renderAccountInventoryLedgerManagementDashboardGrid();
    }
}

/**
 * Dynamically updates UI elements and image frames with current user data.
 */
function initializeProfileDetailsAccountManagementFieldsValues() {
    if(!APP_STATE.currentUser) return;
    
    const globalDefaultVectorAvatarURI = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230288d1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    const operationalActiveAvatarImageSrc = APP_STATE.currentUser.avatar || globalDefaultVectorAvatarURI;

    // Apply the avatar framing class styles
    const profilePaneAvatarNodeFrame = document.getElementById("profile-pane-avatar-display");
    if(profilePaneAvatarNodeFrame) {
        profilePaneAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
        profilePaneAvatarNodeFrame.className = "fort-avatar-circle-img";
    }

    const navUserAvatarNodeFrame = document.getElementById("nav-user-avatar");
    if(navUserAvatarNodeFrame) {
        navUserAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
        navUserAvatarNodeFrame.className = "fort-avatar-circle-img";
    }

    const drawerUserAvatarNodeFrame = document.getElementById("drawer-user-avatar");
    if(drawerUserAvatarNodeFrame) {
        drawerUserAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
        drawerUserAvatarNodeFrame.className = "fort-avatar-circle-img";
    }

    const nameDisplayLabelNode = document.getElementById("txt-profile-username-val");
    if(nameDisplayLabelNode) {
        nameDisplayLabelNode.innerText = APP_STATE.currentUser.identityName ||
            APP_STATE.currentUser.username || "N/A"; 
    }
    
    const bizFieldsNodeWrapper = document.getElementById("business-profile-only-fields");
    if(bizFieldsNodeWrapper) {
        if(APP_STATE.currentUser.accountType === 'business' || APP_STATE.currentUser.uid === 'admin' || APP_STATE.currentUser.id === 'admin') { 
            bizFieldsNodeWrapper.classList.remove("hidden-node");
            document.getElementById("txt-profile-busname-val").innerText = APP_STATE.currentUser.businessName || "N/A"; 
            document.getElementById("txt-profile-businfo-val").innerText = APP_STATE.currentUser.businessInfo || "N/A";
        } else {
            bizFieldsNodeWrapper.classList.add("hidden-node");
        }
    }
}

/**
 * Profile Edit Multi-step Wizard Management System
 * Enforces current password validation followed by a secure email OTP check before saving mutations to Firebase Firestore.
 */

function openProfileEditWizard(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content");
    if (!modalTargetNode) return;

    modalTargetNode.innerHTML = `
        <h3>Validate Account Ownership (Step 1 of 3)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Input Current Password:</label>
            <input type="password" id="profile-reauth-key" class="form-field-control" placeholder="Enter password to verify ownership context">
            <div id="err-profile-reauth-msg" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Incorrect Password</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-signin-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'profile-reauth-key')">
            <label for="chk-signin-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button onclick="executeVerifyProfileReauthCredentialPasswordMatch('${targetFieldNameStringTokenKey}')" class="btn-blue">Verify Password</button>
        </div>
    `;
}

function executeVerifyProfileReauthCredentialPasswordMatch(targetFieldNameStringTokenKey) {
    const enteredPasswordValue = document.getElementById("profile-reauth-key").value;
    const errorDisplayNode = document.getElementById("err-profile-reauth-msg");
    
    errorDisplayNode.classList.add("hidden-node");
    
    if (enteredPasswordValue !== APP_STATE.currentUser.secretKey) {
        errorDisplayNode.innerText = "Incorrect Password";
        errorDisplayNode.classList.remove("hidden-node");
        return;
    }
    
    sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, true);
}

async function sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, isInitialLaunch = false) {
    const targetEmail = APP_STATE.currentUser.identifierText;
    const todayKeyStr = "profile_otp_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-profile-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                feedbackElement.style.color = "red";
                feedbackElement.classList.remove("hidden-node");
            }
        } else {
            renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-profile-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                    feedbackElement.style.color = "red";
                    feedbackElement.classList.remove("hidden-node");
                }
            }, 50);
        }
        return;
    }

    initiateProfileEditOtpResendCooldown(targetFieldNameStringTokenKey);

    const freshGeneratedOtpCode = Math.floor(1000 + Math.random() * 9000);
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileActiveVerificationOtp = freshGeneratedOtpCode;

    dailyAttemptsCount++;
    localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());

    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-profile-step2-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh token...";
            feedbackElement.style.color = "blue";
            feedbackElement.classList.remove("hidden-node");
        }
    }

    try {
        if (window.emailjs) {
            await window.emailjs.send(
                "service_ejag5pe", 
                "template_jz0s31e", 
                {
                    to_email: targetEmail,
                    user_name: APP_STATE.currentUser.identityName,
                    otp_code: freshGeneratedOtpCode
                }
            );
            if (isInitialLaunch) {
                renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
            } else {
                const feedbackElement = document.getElementById("err-profile-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "A new verification code has been successfully sent.";
                    feedbackElement.style.color = "green";
                    feedbackElement.classList.remove("hidden-node");
                }
            }
        } else {
            console.warn("EmailJS library missing.");
            if (isInitialLaunch) renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
        }
    } catch (sendErr) {
        console.error("EmailJS profile update error:", sendErr);
        if (isInitialLaunch) {
            renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
        } else {
            const feedbackElement = document.getElementById("err-profile-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Failed to send code. Please check your connection.";
                feedbackElement.style.color = "red";
                feedbackElement.classList.remove("hidden-node");
            }
        }
    }
}

function initiateProfileEditOtpResendCooldown(targetFieldNameStringTokenKey) {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft = 30;

    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = setInterval(() => {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft--;
        const resendLinkNode = document.getElementById("profile-otp-resend-link");
        
        if (resendLinkNode) {
            if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft > 0) {
                resendLinkNode.innerText = `Resend in ${SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
                SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
            }
        } else if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft <= 0) {
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
        }
    }, 1000);
}

function handleProfileEditOtpResendClickInterception(targetFieldNameStringTokenKey) {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft > 0) return;
    sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, false);
}

function renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content");
    const targetEmail = APP_STATE.currentUser.identifierText;
    
    const secondsLeft = SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerStyle = secondsLeft > 0 ? "none" : "auto";

    modalTargetNode.innerHTML = `
        <h3>Verify Security Profile Identity (Step 2 of 3)</h3>
        <p style="font-size:0.9rem; margin-top:6px; color:var(--fort-gray-slate);">
            An identity verification message code was sent to your registered profile email address: ${targetEmail}
        </p>

        <div class="form-input-container margin-top-sm">
            <label>Input 4-Digit Security OTP Token Key:</label>
            <input type="text" id="profile-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px;">
            <div id="err-profile-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem;">
            <span>Didn't receive message? </span>
            <a href="javascript:void(0)" id="profile-otp-resend-link" onclick="handleProfileEditOtpResendClickInterception('${targetFieldNameStringTokenKey}')" style="color: #007bff; text-decoration:none; font-weight:${weightStyle}; opacity:${opacityStyle}; pointer-events:${pointerStyle};">${textLabel}</a>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="handleClearProfileTimersAndReturnToStepOne('${targetFieldNameStringTokenKey}')" class="btn-gray">Back</button>
            <button onclick="executeValidateProfileWizardOtpTokenKey('${targetFieldNameStringTokenKey}')" class="btn-blue">Verify Security Code</button>
        </div>
    `;
}

function handleClearProfileTimersAndReturnToStepOne(targetFieldNameStringTokenKey) {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft = 0;
    openProfileEditWizard(targetFieldNameStringTokenKey);
}

function executeValidateProfileWizardOtpTokenKey(targetFieldNameStringTokenKey) {
    const inputVal = document.getElementById("profile-otp-input").value.trim();
    const feedback = document.getElementById("err-profile-step2-feedback");
    
    feedback.classList.add("hidden-node");
    feedback.style.color = "red";

    const systemExpected = String(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileActiveVerificationOtp || "");
    if (!inputVal || inputVal !== systemExpected) {
        feedback.innerText = "Invalid verification token code expression entry parameter configuration.";
        feedback.classList.remove("hidden-node");
        return;
    }

    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft = 0;

    renderProfileEditWizardStepThreeFinalModificationInputLayout(targetFieldNameStringTokenKey);
}

function renderProfileEditWizardStepThreeFinalModificationInputLayout(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content");
    let inputFieldTypeLayoutPlaceholderHTML = ``;

    if (targetFieldNameStringTokenKey === 'secretKey') {
        inputFieldTypeLayoutPlaceholderHTML = `
            <div class="form-input-container margin-top-sm">
                <label>Input New Security Password Expression:</label>
                <input type="password" id="profile-new-value-1" class="form-field-control" placeholder="New structural value">
            </div>
            <div class="form-input-container">
                <label>Confirm Entry Configuration Parameters Match:</label>
                <input type="password" id="profile-new-value-2" class="form-field-control" placeholder="Retype expression code configurations">
            </div>
        `;
    } else {
        const structuralDisplayLabelText = targetFieldNameStringTokenKey === 'identityName' ? 'Personal Full Name Context' : 
                                            (targetFieldNameStringTokenKey === 'businessName' ? 'Business Trading Enterprise Title' : 'Business Strategy Description Information Portfolio Summary Statement');
        inputFieldTypeLayoutPlaceholderHTML = `
            <div class="form-input-container margin-top-sm">
                <label>Modify ${structuralDisplayLabelText}:</label>
                <input type="text" id="profile-new-value-1" class="form-field-control" value="${APP_STATE.currentUser[targetFieldNameStringTokenKey] || ''}" placeholder="Enter updated field text value mappings">
            </div>
        `;
    }

    modalTargetNode.innerHTML = `
        <h3>Commit Field Mutations (Step 3 of 3)</h3>
        <div id="profile-mutation-fields-context-node-target">
            ${inputFieldTypeLayoutPlaceholderHTML}
            <div id="err-profile-step3-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button onclick="executeSaveProfileWizardModificationsToDatabase('${targetFieldNameStringTokenKey}')" class="btn-blue">Save Changes</button>
        </div>
    `;
}

async function executeSaveProfileWizardModificationsToDatabase(targetFieldNameStringTokenKey) {
    const val1 = document.getElementById("profile-new-value-1").value.trim();
    const errorNode = document.getElementById("err-profile-step3-feedback");
    errorNode.classList.add("hidden-node");

    if (!val1) {
        errorNode.innerText = "Structural modifications field expression cannot post blank spaces updates tokens.";
        errorNode.classList.remove("hidden-node");
        return;
    }

    if (targetFieldNameStringTokenKey === 'secretKey') {
        const val2 = document.getElementById("profile-new-value-2").value.trim();
        if (val1 !== val2) {
            errorNode.innerText = "Password mismatch configuration parameter error mapping tracking metrics discovered.";
            errorNode.classList.remove("hidden-node");
            return;
        }
        if (val1.length < 6 || !/[A-Z]/.test(val1) || !/[a-z]/.test(val1) || !/[0-9]/.test(val1) || !/[^A-Za-z0-9]/.test(val1)) {
            errorNode.innerText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
            errorNode.classList.remove("hidden-node");
            return;
        }
    }

    const currentUserId = APP_STATE.currentUser.uid;
    const updatedFieldsPayload = {};
    updatedFieldsPayload[targetFieldNameStringTokenKey] = val1;
    if (targetFieldNameStringTokenKey === 'secretKey') {
        updatedFieldsPayload.password = val1;
    }

    try {
        // Secure transaction commit directly to cloud infrastructure clusters
        await setDoc(doc(db, "users", currentUserId), updatedFieldsPayload, { merge: true });

        // Synchronize mutations internally inside local data array tracking setups
        const targetedUserIndexId = SYSTEM_DATABASE.users.findIndex(u => (u.uid === currentUserId || u.id === currentUserId));
        if (targetedUserIndexId !== -1) {
            SYSTEM_DATABASE.users[targetedUserIndexId] = { ...SYSTEM_DATABASE.users[targetedUserIndexId], ...updatedFieldsPayload };
        }

        APP_STATE.currentUser = { ...APP_STATE.currentUser, ...updatedFieldsPayload };
        APP_CACHE.temporaryProfileAvatarDataUrl = ""; // Reset memory cache references safely
        
        if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
            syncPlatformDatabaseStateToWebStorage();
        }

        closeActiveModalDirectly('auth-modal');
        if (typeof initializeProfileDetailsAccountManagementFieldsValues === "function") {
            initializeProfileDetailsAccountManagementFieldsValues(); 
        }
        
        if (typeof showAlertModal === "function") {
            showAlertModal("Profile Synchronized", "System values successfully overwritten.");
        } else {
            showTopRightToast("Profile Changes Made Succesfully.","success");
        }
        
    } catch (cloudWriteExceptionError) {
        console.error("Firebase Cloud Storage Core Fields Overwrite Failure Event Exception:", cloudWriteExceptionError);
        showTopRightToast("Cloud transaction boundary mismatch runtime error. Check device tracking configurations.", "error");
    }
}

// ============================================================================
// CONSTANTS & PRICING CONFIGURATIONS
// ============================================================================

// Cleaned pricing matrix matching exactly 20 slots from specifications
const LEADERBOARD_SLOT_PRICES = [
    6000, 5500, 5000, 4750, 4500, 4250, 4000, 3750, 3500, 3250,
    3000, 2750, 2500, 2250, 2000, 1700, 1500, 1200, 1000, 500
];

const LEADERBOARD_PAYSTACK_PLAN_CODES = [
    "PLN_0j80to7xqksqqxx", // Plan 1
    "PLN_f75y0jhvim7a56r", // Plan 2
    "PLN_liyqjmp1qncjarn", // Plan 3
    "PLN_simekhu9m69dztb", // Plan 4
    "PLN_3c0od5kkzjo2h3s", // Plan 5
    "PLN_lj2enl3b4pgyfor", // Plan 6
    "PLN_ejw2l81gxvntprk", // Plan 7
    "PLN_1e0rb2t8gpf170y", // Plan 8
    "PLN_1pfakn5dsqsrr3h", // Plan 9
    "PLN_eclvsaz7o38ug3f", // Plan 10
    "PLN_i2xrie9zc0y1hn0", // Plan 11
    "PLN_fb9x888p2v5fo0v", // Plan 12
    "PLN_5eydk6g9n4bnfkv", // Plan 13
    "PLN_qw2g5sbfoc7vt7d", // Plan 14
    "PLN_s99g9sr1jk4eeez", // Plan 15
    "PLN_0k1n2aipe4a9bpt", // Plan 16
    "PLN_uajjx1lfqs4hrqj", // Plan 17
    "PLN_f9wcm0p5y9jzgvq", // Plan 18
    "PLN_chd5qbiut7lthpl", // Plan 19
    "PLN_fs8ribiee7klbl0"  // Plan 20
];

// Ensure fallback structures exist in standard memory
if (!SYSTEM_DATABASE.pinnedLeaderboard) {
    SYSTEM_DATABASE.pinnedLeaderboard = Array(20).fill(null);
}
if (!SYSTEM_DATABASE.slotMetadata) {
    SYSTEM_DATABASE.slotMetadata = Array(20).fill(null).map(() => ({
        expirationTime: null,
        autoRenew: true,
        previousOwnerUid: null
    }));
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function formatToNaira(amount) {
    return "₦" + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================================
// INVENTORY & DASHBOARD RENDERERS (FIREBASE INTEGRATED)
// ============================================================================

/**
 * CORE MODULE FIREBASE SYNC: Fetches and displays the logged-in user's 
 * products in real-time from the Firestore collection while appending the Leaderboard.
 */
function renderAccountInventoryLedgerManagementDashboardGrid() {
    const listContainerNodeElement = document.getElementById("my-products-list-container");
    if (!listContainerNodeElement) return;
    
    listContainerNodeElement.innerHTML = "";
    if (!APP_STATE.currentUser) return;

    if (APP_STATE.currentUser.accountType !== 'business' && APP_STATE.currentUser.uid !== 'admin') {
        listContainerNodeElement.innerHTML = `
            <div class="upgrade-notice-box">
                Upgrade to business account to post, view products and also have access to pinned products.
            </div>

            <!-- Account Upgrade Action Button -->
            <div class="text-center margin-top-xs">
                <button id="btn-upgrade-to-business" class="btn-blue" onclick="initiateBusinessAccountUpgradeSequence()">
                    Upgrade Account to Business (₦2,500)
                </button>
            </div>
        `;
        renderLeaderboardInterfaceSectionInSettings(listContainerNodeElement.parentNode);
        return;
    }

    // Real-Time Firebase Listener Pipeline
    if (window.FortMartFirebase || window.firebase) {
        const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
        
        if (window.FortMartFirebase) {
            const { collection, query, where, onSnapshot } = window.FortMartFirebase;
            
            const userProductsQuery = query(
                collection(dbRefInstance, "products"), 
                where("ownerUid", "==", APP_STATE.currentUser.uid)
            );
            
            onSnapshot(userProductsQuery, (querySnapshot) => {
                populateDashboardInventoryGridItems(listContainerNodeElement, querySnapshot);
            }, (error) => {
                console.error("Error listening to user products stream:", error);
            });
        } else {
            dbRefInstance.collection("products")
                .where("ownerUid", "==", APP_STATE.currentUser.uid)
                .onSnapshot((querySnapshot) => {
                    populateDashboardInventoryGridItems(listContainerNodeElement, querySnapshot);
                }, (error) => {
                    console.error("Error fetching user products collection snapshot:", error);
                });
        }
    } else {
        // Fallback for non-networked local database state if offline
        const userOwnedItems = SYSTEM_DATABASE.products.filter(p => p.ownerUid === APP_STATE.currentUser.uid);
        if (userOwnedItems.length === 0) {
            listContainerNodeElement.innerHTML = `<div style="padding:16px; color:var(--fort-gray-slate); font-size:0.85rem;"><p>You have no posted products.</p></div>`;
        } else {
            userOwnedItems.forEach(item => {
                appendProductRowToContainer(listContainerNodeElement, item, item.pid || item.id);
            });
        }
    }

    // Always attach the Global Leaderboard Subscription Slots interface underneath
    renderLeaderboardInterfaceSectionInSettings(listContainerNodeElement.parentNode);
}

/**
 * Helper utility to build individual DOM elements from database snapshot payloads
 */
function populateDashboardInventoryGridItems(containerElement, querySnapshot) {
    containerElement.innerHTML = "";
    
    if (querySnapshot.empty) {
        containerElement.innerHTML = `<div style="padding:16px; color:var(--fort-gray-slate); font-size:0.85rem;"><p>You have no posted products.</p></div>`;
        return;
    }
    
    querySnapshot.forEach((docSnapshot) => {
        const item = docSnapshot.data();
        const productId = docSnapshot.id;
        appendProductRowToContainer(containerElement, item, productId);
    });
}

/**
 * Helper utility to render row entries for vendor settings dashboard 
 * using Firebase Storage hosted URLs for product thumbnails.
 */
function appendProductRowToContainer(containerElement, item, productId) {
    const FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE = "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fproduct_placeholder.png?alt=media";

    const itemRowRowStripContainerElementNode = document.createElement("div");
    itemRowRowStripContainerElementNode.className = "rounded-rect";
    itemRowRowStripContainerElementNode.style.cssText = "display:flex; align-items:center; justify-content:space-between; padding:12px; border:1px solid var(--fort-gray-border); margin-bottom:10px; background-color:var(--fort-white-snow);";
    
    const coverPhotoUrl = item.coverPhoto || FIREBASE_STORAGE_DEFAULT_PRODUCT_IMAGE;

    itemRowRowStripContainerElementNode.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex:1;">
            <img src="${coverPhotoUrl}" style="width:40px; height:40px; object-fit:cover;" class="rounded-rect" alt="Thumb">
            <div>
                <h5 style="font-weight:700; color:var(--fort-blue-dark);">${item.name || 'Unnamed Product'}</h5>
                <span style="font-size:0.75rem; color:var(--fort-gray-slate);">Category: ${item.category || 'Others'} | Analytics Metrics Hits Counter Value: ${item.clickCount || 0} hits</span>
            </div>
        </div>
        <div style="display:flex; gap:8px;">
            <button class="btn-blue" style="padding:4px 10px; font-size:0.75rem;" onclick="launchEditProductInventoryModalFormLayoutShell('${productId}')">Edit Details</button>
            <button class="btn-danger" style="padding:4px 10px; font-size:0.75rem;" onclick="executeDeletePlatformInventoryItemListingPostRecord('${productId}')">Delete Inventory Post</button>
        </div>
    `;
    containerElement.appendChild(itemRowRowStripContainerElementNode);
}

/**
 * UPLOADS A FILE TO FIREBASE STORAGE AND RETURNS THE PUBLIC DOWNLOAD URL
 * @param {File} fileObject - HTML File Object from input element
 * @param {String} storageFolder - Remote destination folder ('products', 'avatars', etc.)
 * @returns {Promise<String>} Public HTTPS Download URL string
 */
async function uploadFileToFirebaseStorage(fileObject, storageFolder = "products") {
    if (!fileObject) return null;
    
    if (window.FortMartFirebase && window.FortMartFirebase.storage) {
        const { storage, ref, uploadBytes, getDownloadURL } = window.FortMartFirebase;
        const fileExtension = fileObject.name.split('.').pop();
        const uniqueFileName = `${storageFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        
        const storageRef = ref(storage, uniqueFileName);
        const snapshot = await uploadBytes(storageRef, fileObject);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } else {
        console.warn("Firebase Storage unavailable. Falling back to local Base64 Data URL reader.");
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileObject);
        });
    }
}




// ============================================================================
// GLOBAL LEADERBOARD SUBSCRIPTION INTERFACE
// ============================================================================

function renderLeaderboardInterfaceSectionInSettings(parentElementContainer) {
    if (!parentElementContainer) return;
    
    let existingSubSection = document.getElementById("settings-leaderboard-sub-container");
    if (existingSubSection) existingSubSection.remove();

    const subSectionNode = document.createElement("div");
    subSectionNode.id = "settings-leaderboard-sub-container";
    subSectionNode.className = "leaderboard-settings-section";
    
    subSectionNode.innerHTML = `
        <h3 style="margin-bottom: 4px; color: var(--fort-blue-dark);">🏆 Global Leaderboard Subscription Slots</h3>
        <p style="font-size: 0.8rem; color: var(--fort-gray-slate); margin-bottom: 12px;">Review positioning slots, check real-time availability states or manage active subscriptions.</p>
        <div id="settings-slots-stack-target" style="display: flex; flex-direction: column; gap: 8px;"></div>
    `;
    parentElementContainer.appendChild(subSectionNode);

    const targetStackGrid = document.getElementById("settings-slots-stack-target");
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard;
    const metadata = SYSTEM_DATABASE.slotMetadata;
    const currentUserId = APP_STATE.currentUser.uid;
    const isAdmin = (currentUserId === 'admin');
    const now = Date.now();

    for (let idx = 0; idx < 20; idx++) {
        const productPid = leaderboard[idx];
        const linkedProduct = productPid ? SYSTEM_DATABASE.products.find(p => (p.pid === productPid || p.id === productPid)) : null;
        const slotMeta = metadata[idx];
        const slotPrice = LEADERBOARD_SLOT_PRICES[idx];

        let inlineColorStyle = "background: #f4f6f9; border-left: 5px solid #ccc;"; 
        let slotStatusLabelText = `Available Vacant Slot — ${formatToNaira(slotPrice)}`;
        let operationalActionButtonHTML = `<button class="btn-blue" style="padding: 6px 12px; font-size:0.75rem;" onclick="initiateSlotSubscriptionPurchaseSequence(${idx})">Buy Slot</button>`;

        const isExpired = slotMeta.expirationTime && now > slotMeta.expirationTime;
        const gracePeriodEnd = slotMeta.expirationTime ? slotMeta.expirationTime + (24 * 60 * 60 * 1000) : null;
        const isInGracePeriod = isExpired && gracePeriodEnd && now <= gracePeriodEnd;

        const isActuallyOwned = linkedProduct || (slotMeta.expirationTime && !isExpired);
        const ownerUid = linkedProduct ? linkedProduct.ownerUid : slotMeta.previousOwnerUid;
        const isUserOwner = (ownerUid === currentUserId);

        if (isActuallyOwned && !isExpired) {
            const ownerAccount = SYSTEM_DATABASE.users ? SYSTEM_DATABASE.users.find(u => u.uid === ownerUid) : null;
            const ownerDisplayName = ownerAccount ? (ownerAccount.businessName || ownerAccount.identityName) : "Unknown Vendor";
            
            if (isUserOwner) {
                inlineColorStyle = "background: #e3f2fd; border-left: 5px solid var(--fort-blue-primary);";
                slotStatusLabelText = `Occupied by You (Expires: ${new Date(slotMeta.expirationTime).toLocaleDateString()})`;
                operationalActionButtonHTML = `
                    <div style="display:flex; gap:6px;">
                        <button class="btn-blue" style="padding: 6px 12px; font-size:0.75rem;" onclick="launchManageSlotModal(${idx})">Manage Slot</button>
                        <button class="btn-danger" style="padding: 6px 12px; font-size:0.75rem; background:crimson; color:white; border:none; border-radius:4px;" onclick="cancelActiveSlotSubscription(${idx})">Cancel</button>
                    </div>`;
            } else {
                inlineColorStyle = "background: #e0e0e0; border-left: 5px solid #9e9e9e; opacity: 0.75; color: #616161;";
                slotStatusLabelText = `Occupied by: ${ownerDisplayName} — Unavailable`;
                operationalActionButtonHTML = isAdmin ? `<button class="btn-gray" style="padding: 6px 12px; font-size:0.75rem; color: red;" onclick="cancelActiveSlotSubscription(${idx})">Force Evict</button>` : '';
            }
        } else if (isInGracePeriod) {
            if (isUserOwner) {
                inlineColorStyle = "background: #ffebee; border-left: 5px solid #ef5350; color: #c62828;";
                slotStatusLabelText = `Your subscription expired! 24h Grace Period Active — ${formatToNaira(slotPrice)}`;
                operationalActionButtonHTML = `<button class="btn-danger" style="background:#d32f2f; color:white; padding: 6px 12px; font-size:0.75rem;" onclick="initiateSlotSubscriptionPurchaseSequence(${idx})">Renew Now</button>`;
            } else {
                inlineColorStyle = "background: #e0e0e0; border-left: 5px solid #9e9e9e; opacity: 0.6; color: #616161;";
                slotStatusLabelText = `Unavailable (In Grace Period Renewal window)`;
                operationalActionButtonHTML = '';
            }
        } else {
            if (isExpired && !isInGracePeriod && slotMeta.previousOwnerUid) {
                leaderboard[idx] = null;
                const oldOwner = slotMeta.previousOwnerUid;
                slotMeta.previousOwnerUid = null;
                slotMeta.expirationTime = null;
                sendFortMartAdminSystemNotification(oldOwner, "Your 24-hour grace renewal period has expired. The slot is now publicly available.");
            }
        }

        const slotCardElement = document.createElement("div");
        slotCardElement.style.cssText = `${inlineColorStyle} display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 6px; margin-bottom: 4px; box-sizing: border-box;`;
        slotCardElement.innerHTML = `
            <div>
                <strong style="font-size: 0.9rem;">Slot Position #${idx + 1}</strong>
                <div style="font-size: 0.78rem; margin-top: 2px;">${slotStatusLabelText} ${linkedProduct && !isExpired ? `(${linkedProduct.name})` : ''}</div>
            </div>
            <div>${operationalActionButtonHTML}</div>
        `;
        targetStackGrid.appendChild(slotCardElement);
    }
}

// ============================================================================
// PAYSTACK PAYMENT GATEWAY SEQUENCING & CHECKOUT
// ============================================================================

function initiateSlotSubscriptionPurchaseSequence(slotIndexPositionId) {
    const userProducts = SYSTEM_DATABASE.products.filter(p => p.ownerUid === APP_STATE.currentUser.uid);
    if (userProducts.length === 0) {
        showTopRightToast("Action Required: You must list at least one standard product before buying a leaderboard ranking slot.", "info");
        return;
    }

    displayConfirmationModalOverlayAction("Verify account credentials before initializing the third-party Paystack processing node interface stream:", () => {
        const confirmModalNode = document.getElementById("confirm-modal");
        if (confirmModalNode) confirmModalNode.classList.remove("active");
        
        setTimeout(() => {
            launchPaystackPaymentCheckoutModalView(slotIndexPositionId);
        }, 150);
    });
}

function launchPaystackPaymentCheckoutModalView(slotIndex) {
    let existingModal = document.getElementById("paystack-checkout-modal");
    if (existingModal) existingModal.remove();

    const checkoutModalContainer = document.createElement("div");
    checkoutModalContainer.id = "paystack-checkout-modal";
    checkoutModalContainer.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    const targetPrice = LEADERBOARD_SLOT_PRICES[slotIndex];
    const initialAutoRenewState = SYSTEM_DATABASE.slotMetadata[slotIndex].autoRenew;

    checkoutModalContainer.innerHTML = `
        <div class="paystack-modal-box" style="background: white; border-radius: 8px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid var(--fort-gray-border);">
            <div class="paystack-header-brand" style="background-color: #09a5db; color: white; padding: 20px; text-align: center;">
                <h3 style="margin:0; color:white;">Fort Mart Gateway</h3>
                <span style="font-size:0.75rem; opacity:0.9;">Securing payments for Fort Mart Pinned Products Slots</span>
            </div>
            <div class="paystack-body-content" style="padding: 24px;">
                <p style="font-size:0.85rem; color:var(--fort-blue-dark); margin-bottom:12px;">You are authorizing a payment subscription setup for <strong>Leaderboard Slot Position #${slotIndex + 1}</strong>.</p>
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Email Address</label>
                    <input type="text" id="paystack-email-field" class="form-field-control" value="${APP_STATE.currentUser.identifierText || 'user@fortmart.com'}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div class="form-input-container" style="margin-bottom:14px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Price</label>
                    <input type="text" class="form-field-control" value="${formatToNaira(targetPrice)}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
            </div>
            <div class="paystack-footer-row" style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
                <button class="btn-gray" onclick="document.getElementById('paystack-checkout-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background-color:#3bb75e; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:700;" onclick="executeActualPaystackIframePopRuntime(${slotIndex})">Proceed to Payment Method</button>
            </div>
        </div>
    `;
    document.body.appendChild(checkoutModalContainer);
}

function executeActualPaystackIframePopRuntime(slotIndex) {
    if (typeof PaystackPop === 'undefined') {
        showTopRightToast("Paystack SDK not loaded! Check your internet connection.", "error");
        return;
    }

    const emailField = document.getElementById("paystack-email-field");
    const userEmail = emailField ? emailField.value : null;

    if (!userEmail) {
        showTopRightToast("Please enter a valid email address before proceeding.", "info");
        return;
    }

    const userUid = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) 
        ? APP_STATE.currentUser.uid 
        : 'GUEST_USER';

    const targetPrice = LEADERBOARD_SLOT_PRICES[slotIndex];
    const autoRenewToggle = document.getElementById("paystack-autorenew-toggle");
    const isAutoRenewChecked = autoRenewToggle ? autoRenewToggle.checked : false;

    if (typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.slotMetadata) {
        SYSTEM_DATABASE.slotMetadata[slotIndex].autoRenew = isAutoRenewChecked;
    }

    const modal = document.getElementById('paystack-checkout-modal');
    if (modal) modal.remove();

    let paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214', 
        email: userEmail,
        amount: targetPrice * 100, 
        currency: "NGN",
        ref: 'FT-LEADERBOARD-' + slotIndex + '-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            slot_index: slotIndex,
            user_uid: userUid
        },
        callback: function(response) {
            processPaystackPaymentSuccess(slotIndex);
        },
        onClose: function() {
            showTopRightToast('Payment window closed by customer session.', "info");
        }
    };

    if (isAutoRenewChecked) {
        paymentConfig.plan = LEADERBOARD_PAYSTACK_PLAN_CODES[slotIndex];
    }

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        showTopRightToast("Error launching Paystack modal: " + error.message, "error");
    }
}

function processPaystackPaymentSuccess(slotIndex) {
    const now = Date.now();
    const oneMonthDurationMs = 30 * 24 * 60 * 60 * 1000;
    
    SYSTEM_DATABASE.slotMetadata[slotIndex].expirationTime = now + oneMonthDurationMs;
    SYSTEM_DATABASE.slotMetadata[slotIndex].previousOwnerUid = APP_STATE.currentUser.uid;
    
    sendFortMartAdminSystemNotification(
        APP_STATE.currentUser.uid, 
        `Payment Successful! You have successfully acquired Leaderboard Slot Position #${slotIndex + 1}. Subscription valid for 1 month.`
    );

    showTopRightToast("Transaction authenticated cleanly by Paystack! Opening product allocation tools...", "success");
    launchManageSlotModal(slotIndex);
}

// ============================================================================
// SLOT ALLOCATION & MANAGEMENT MODALS
// ============================================================================

function launchManageSlotModal(slotIndex) {
    let existingModal = document.getElementById("manage-slot-allocation-modal");
    if (existingModal) existingModal.remove();

    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard;
    const activeProductId = leaderboard[slotIndex];
    const slotMeta = SYSTEM_DATABASE.slotMetadata[slotIndex];

    const userOwnedProducts = SYSTEM_DATABASE.products.filter(p => p.ownerUid === APP_STATE.currentUser.uid);
    const unpinnedAvailableProducts = userOwnedProducts.filter(p => !leaderboard.includes(p.pid || p.id) || (p.pid || p.id) === activeProductId);

    const managementModalContainer = document.createElement("div");
    managementModalContainer.id = "manage-slot-allocation-modal";
    managementModalContainer.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    let dropdownSelectionHTML = `<option value="">-- No Product Assigned (Vacant) --</option>`;
    if (unpinnedAvailableProducts.length > 0) {
        dropdownSelectionHTML += unpinnedAvailableProducts.map(p => {
            const pKey = p.pid || p.id;
            return `<option value="${pKey}" ${pKey === activeProductId ? 'selected' : ''}>${p.name} [ID: ${pKey}]</option>`;
        }).join("");
    }

    managementModalContainer.innerHTML = `
        <div class="modal-box rounded-rect" style="padding: 24px; max-width: 450px; width: 100%; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3>⚙️ Manage Leaderboard Slot #${slotIndex + 1}</h3>
            <p style="margin-bottom:14px; font-size:0.85rem; color:var(--fort-gray-slate);">Assign an item post entry directly to this slot, or change assignments.</p>
            
            <div class="form-input-container" style="margin-bottom:16px;">
                <label style="font-weight: 600; display:block; margin-bottom:4px;">Active Associated Product</label>
                <select id="slot-product-mapping-dropdown" class="form-field-control" style="width:100%; padding:8px;">
                    ${dropdownSelectionHTML}
                </select>
            </div>

            <div style="margin-top:12px; font-size:0.8rem; color:var(--fort-gray-slate);">
                * Note: A product can occupy exactly one slot context at any given time.
            </div>

            <div class="btn-group" style="justify-content: flex-end; margin-top:20px; display:flex; gap:10px;">
                <button class="btn-gray" onclick="document.getElementById('manage-slot-allocation-modal').remove()">Close Window</button>
                <button class="btn-blue" onclick="saveSlotAllocationSettingsMapping(${slotIndex})">Save Allocation Settings</button>
            </div>
        </div>
    `;
    document.body.appendChild(managementModalContainer);
}

function saveSlotAllocationSettingsMapping(slotIndex) {
    const selectedProductId = document.getElementById("slot-product-mapping-dropdown").value;
    const autoRenewChecked = document.getElementById("manage-autorenew-checkbox").checked;
    
    SYSTEM_DATABASE.slotMetadata[slotIndex].autoRenew = autoRenewChecked;

    if (selectedProductId === "") {
        SYSTEM_DATABASE.pinnedLeaderboard[slotIndex] = null;
        showTopRightToast("Product unlinked successfully. Slot remains owned but is currently vacant.", "success");
    } else {
        const existingSlotIndex = SYSTEM_DATABASE.pinnedLeaderboard.indexOf(selectedProductId);
        if (existingSlotIndex !== -1 && existingSlotIndex !== slotIndex) {
            showTopRightToast("Error Constraint: This item is already pinned inside another leaderboard tracking container slot node!", "error");
            return;
        }
        SYSTEM_DATABASE.pinnedLeaderboard[slotIndex] = selectedProductId;
        showTopRightToast("Leaderboard slot mapping criteria update applied successfully!", "success");
    }

    document.getElementById("manage-slot-allocation-modal").remove();
    if (typeof administrativeSaveAndRefreshDisplay === "function") {
        administrativeSaveAndRefreshDisplay();
    }
    renderAccountInventoryLedgerManagementDashboardGrid();
}

function cancelActiveSlotSubscription(slotIndexPositionId) {
    if (!SYSTEM_DATABASE.pinnedLeaderboard) return;
    
    displayConfirmationModalOverlayAction("Are you sure you want to cancel this slot positioning subscription setup?", () => {
        SYSTEM_DATABASE.pinnedLeaderboard[slotIndexPositionId] = null;
        SYSTEM_DATABASE.slotMetadata[slotIndexPositionId].expirationTime = null;
        SYSTEM_DATABASE.slotMetadata[slotIndexPositionId].previousOwnerUid = null;
        
        if (typeof administrativeSaveAndRefreshDisplay === "function") {
            administrativeSaveAndRefreshDisplay();
        }
        renderAccountInventoryLedgerManagementDashboardGrid();
        showTopRightToast("Subscription terminated successfully.", "success");
    });
}

// ============================================================================
// PRODUCT MODALS & EDIT/DELETE MUTATIONS (FIREBASE STORAGE ENABLED)
// ============================================================================

function launchEditProductInventoryModalFormLayoutShell(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
    if (!targetProduct) {
        showTopRightToast("Product record could not be found.", "error");
        return;
    }

    const modalContentTargetNode = document.getElementById("auth-modal-content");
    if (!modalContentTargetNode) return;

    modalContentTargetNode.innerHTML = `
        <h3>Enter Current Password (Step 1 of 2)</h3>
        
        <div class="form-input-container margin-top-sm">
            <label>Active Password:</label>
            <input type="password" id="edit-verify-password" class="form-field-control" placeholder="Enter password to verify ownership context">
            
            <div id="err-edit-reauth-msg" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px; display: none;">Incorrect Password</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-edit-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'edit-verify-password')">
            <label for="chk-edit-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>
        <br>
        
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button> 
            <button onclick="verifyEditPasswordAndProceedFirebase('${targetProductIdKeyValueString}')" class="btn-blue">Verify Password Phrase</button>
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active");
}

function verifyEditPasswordAndProceedFirebase(targetProductIdKeyValueString) {
    const enteredPassword = document.getElementById("edit-verify-password").value;
    const errNode = document.getElementById("err-edit-reauth-msg");
    
    if (errNode) errNode.style.display = "none";
    
    if (enteredPassword !== APP_STATE.currentUser.secretKey) {
        if (errNode) {
            errNode.innerText = "Incorrect Password";
            errNode.style.display = "block";
        }
        return;
    }
    
    renderActualEditProductFormFirebase(targetProductIdKeyValueString);
}

function renderActualEditProductFormFirebase(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
    if (!targetProduct) return;

    if (typeof APP_CACHE === 'undefined') window.APP_CACHE = {};
    APP_CACHE.temporaryProductCoverPhotoUrl = targetProduct.coverPhoto || "";
    
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    
    modalContentTargetNode.innerHTML = `
        <h3>Edit Product Details (Step 2 of 2)</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:2px;">Overwriting structural inventory configurations fields values.</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Product Name</label>
            <input type="text" id="editprod-name" class="form-field-control" value="${targetProduct.name || ''}">
        </div>
        
        <div class="form-input-container">
            <label>Select Logistics Catalog Classification Category:</label>
            <select id="editprod-cat" class="form-field-control">
                <option value="Electrical Appliances" ${targetProduct.category === 'Electrical Appliances' ? 'selected' : ''}>Electrical Appliances</option>
                <option value="Mobile Devices & Computers" ${targetProduct.category === 'Mobile Devices & Computers' ? 'selected' : ''}>Mobile Devices & Computers</option>
                <option value="Home Furniture" ${targetProduct.category === 'Home Furniture' ? 'selected' : ''}>Home Furniture</option>
                <option value="Fashion Clothing Apparel" ${targetProduct.category === 'Fashion Clothing Apparel' ? 'selected' : ''}>Fashion Clothing Apparel</option>
                <option value="Beauty & Personal Care" ${targetProduct.category === 'Beauty & Personal Care' ? 'selected' : ''}>Beauty & Personal Care</option>
                <option value="Sports, Fitness and Outdoors" ${targetProduct.category === 'Sports, Fitness and Outdoors' ? 'selected' : ''}>Sports, Fitness and Outdoors</option>
                <option value="Groceries & Essentials" ${targetProduct.category === 'Groceries & Essentials' ? 'selected' : ''}>Groceries & Essentials</option>
                <option value="Others" ${targetProduct.category === 'Others' ? 'selected' : ''}>Others</option>
            </select>
        </div>
        
        <div class="form-input-container">
            <label>Primary Short Product Description  (Max 100 Chars) [Compulsory Overwrite]:</label>
            <input type="text" id="editprod-info" class="form-field-control" maxlength="100" value="${targetProduct.info || ''}">
        </div>
        
        <div class="form-input-container-image" style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom:6px; font-weight:700;">Update Product Asset Image Coverage View</label>
            <div class="fort-avatar-circle-container" style="width: 120px; height: 120px; border-radius: 8px; margin-bottom:10px;">
                <img id="imagePreview" class="fort-avatar-circle-img" src="${targetProduct.coverPhoto || ''}" alt="Image Preview">
            </div>
            <input type="file" id="imageInput" accept="image/*" onchange="processWizardProductImageSelectionDirectly()">
        </div>
        
        <div class="form-input-container">
            <label>More Info and Specifications</label>
            <textarea id="editprod-aiinfo" class="form-field-control rounded-rect" style="height:60px;">${targetProduct.aiInfo || ''}</textarea>
        </div>
        
        <div class="form-input-container">
            <label>Unit Commercial Pricing Valuation Baseline Quote Amount Number:</label>
            <input type="number" id="editprod-price" class="form-field-control" value="${targetProduct.price || ''}">
        </div>
        
        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel Changes</button>
            <button onclick="executePipelineCommitUpdatedInventoryPostRecord('${targetProduct.pid || targetProduct.id}')" class="btn-blue">Commit System Database Overwrite</button>
        </div>
    `;
}

function processWizardProductImageSelectionDirectly() {
    const fileNode = document.getElementById("imageInput");
    if (fileNode && fileNode.files && fileNode.files[0]) {
        const readerInstance = new FileReader();
        readerInstance.onload = function(e) {
            APP_CACHE.temporaryProductCoverPhotoUrl = e.target.result;
            const previewEl = document.getElementById("imagePreview");
            if (previewEl) previewEl.src = e.target.result;
        };
        readerInstance.readAsDataURL(fileNode.files[0]);
    }
}

/**
 * CORE MODULE FIREBASE SYNC: Overwrites product parameters data objects inside remote Firestore database.
 */
async function executePipelineCommitUpdatedInventoryPostRecord(targetProductIdKeyValueString) {
    const name = document.getElementById("editprod-name").value.trim();
    const cat = document.getElementById("editprod-cat").value;
    const info = document.getElementById("editprod-info").value.trim();
    const aiInfo = document.getElementById("editprod-aiinfo").value.trim();
    const priceRaw = document.getElementById("editprod-price").value;
    
    if (name === "" || info === "" || priceRaw === "" || !APP_CACHE.temporaryProductCoverPhotoUrl) {
        showTopRightToast("All compulsory info must be filled.", "info");
        return;
    }
    
    try {
        const productUpdatePayload = {
            name: name,
            category: cat,
            info: info,
            price: parseFloat(priceRaw),
            coverPhoto: APP_CACHE.temporaryProductCoverPhotoUrl,
            aiInfo: aiInfo || "Standard platform baseline listed trading stock profile object reference specifications."
        };

        const idx = SYSTEM_DATABASE.products.findIndex(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
        if (idx !== -1) {
            SYSTEM_DATABASE.products[idx] = { ...SYSTEM_DATABASE.products[idx], ...productUpdatePayload };
            if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
                syncPlatformDatabaseStateToWebStorage();
            }
        }
        
        // Write updates downstream to Cloud Firebase Firestore
        if (window.FortMartFirebase || window.firebase) {
            const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
            
            if (window.FortMartFirebase) {
                const { doc, updateDoc } = window.FortMartFirebase;
                await updateDoc(doc(dbRefInstance, "products", targetProductIdKeyValueString), productUpdatePayload);
            } else {
                await dbRefInstance.collection("products").doc(targetProductIdKeyValueString).update(productUpdatePayload);
            }
        }

        APP_CACHE.temporaryProductCoverPhotoUrl = "";
        closeActiveModalDirectly('auth-modal');
        
        if (typeof showTopRightToast === "function") {
            showTopRightToast("Overwrites Saved : Product configurations uploaded successfully.", "success");
        } else {
            showTopRightToast("Product Details Updated Successfully", "success");
        }
        
        if (typeof listenForRealTimeMarketplaceSnapshots === "function") {
            listenForRealTimeMarketplaceSnapshots();
        }
        
    } catch (firebaseCloudMutationExceptionError) {
        console.error("Firebase Collection Product Mutation Failure Exception Log:", firebaseCloudMutationExceptionError);
        showTopRightToast("Error mapping product tracking instance registry.", "error");
    }
}

function executeDeletePlatformInventoryItemListingPostRecord(targetProductIdKeyValueString) {
    const confirmationPromptMessage = "Are you sure you want to delete this product?";
    
    displayConfirmationModalOverlayAction(confirmationPromptMessage, async () => {
        try {
            if (window.FortMartFirebase || window.firebase) {
                const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
                if (window.FortMartFirebase) {
                    const { doc, deleteDoc } = window.FortMartFirebase;
                    await deleteDoc(doc(dbRefInstance, "products", targetProductIdKeyValueString));
                } else {
                    await dbRefInstance.collection("products").doc(targetProductIdKeyValueString).delete();
                }
            }
            
            const structuralIndexMatchPointerId = SYSTEM_DATABASE.products.findIndex(p => (p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString));
            if (structuralIndexMatchPointerId !== -1) {
                SYSTEM_DATABASE.products.splice(structuralIndexMatchPointerId, 1);

                if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
                    syncPlatformDatabaseStateToWebStorage();
                }
            }

            // Re-sync metric count directly from Firebase
            syncAdminDashboardMetricsFromFirebase();

            showTopRightToast("Product successfully purged from system and Cloud Infrastructure layers.", "success");
            
            if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
                renderAccountInventoryLedgerManagementDashboardGrid();
            }
            if (typeof renderMarketplaceProductsDisplayLoop === "function") {
                renderMarketplaceProductsDisplayLoop();
            }

        } catch (err) {
            console.error("Error executing backend document purge context execution mutation:", err);
            showTopRightToast("Failed to securely purge matching collection element from network streams.", "error");
        }
    });
}

// ============================================================================
// SYSTEM NOTIFICATIONS & REUSABLE CONFIRMATION OVERLAYS
// ============================================================================

function sendFortMartAdminSystemNotification(userId, messageContentText) {
    if (!SYSTEM_DATABASE.adminMessages) {
        SYSTEM_DATABASE.adminMessages = [];
    }
    SYSTEM_DATABASE.adminMessages.push({
        recipientUid: userId,
        sender: "Fort Mart Admin",
        timestamp: Date.now(),
        message: messageContentText
    });
    console.log(`[Notification Sent to User: ${userId}] From: Admin -> "${messageContentText}"`);
}

function displayConfirmationModalOverlayAction(messageStringText, callbackFunctionReference) {
    const confirmModalNode = document.getElementById("confirm-modal");
    if (!confirmModalNode) return;

    document.getElementById("confirm-modal-text").innerHTML = `
        <p style="margin-bottom: 12px; font-weight: 500;">${messageStringText}</p>
        <div class="form-input-container" style="text-align: left; margin-top: 14px;">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--fort-blue-dark);">Confirm Security Password Phrase:</label>
            <input type="password" id="delete-verify-password" class="form-field-control" placeholder="Enter password to authorize operation" style="margin-top: 6px; width: 100%; box-sizing: border-box; padding: 6px;">
            <div id="err-delete-reauth-msg" class="text-danger-alert" style="color: red; font-size: 0.8rem; margin-top: 6px; display: none;">Incorrect Password Phrase</div>
        </div>
        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-delete-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'delete-verify-password')">
            <label for="chk-delete-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>
    `;

    confirmModalNode.classList.add("active");
    
    const yesButtonNode = document.getElementById("confirm-yes-btn");
    const noButtonNode = document.getElementById("confirm-no-btn");
    if (yesButtonNode) yesButtonNode.innerText = "Confirm Action";
    
    const cleanYesNode = yesButtonNode.cloneNode(true);
    const cleanNoNode = noButtonNode.cloneNode(true);
    yesButtonNode.parentNode.replaceChild(cleanYesNode, yesButtonNode);
    noButtonNode.parentNode.replaceChild(cleanNoNode, noButtonNode);
    
    cleanYesNode.addEventListener("click", () => {
        const enteredPassword = document.getElementById("delete-verify-password").value;
        const errNode = document.getElementById("err-delete-reauth-msg");
        
        if (enteredPassword !== APP_STATE.currentUser.secretKey) {
            if (errNode) errNode.style.display = "block";
            return;
        }
        
        if (errNode) errNode.style.display = "none";
        confirmModalNode.classList.remove("active");
        callbackFunctionReference();
    });

    cleanNoNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
    });
}

function closeActiveModalDirectly(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove("active");
}

/**
 * Form presentation UI injection for assigning extension node configurations.
 */
function openAdminSuiteRegistrationModalWindowPanelFormLayout() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    if (!modalContentTargetNode) return;

    modalContentTargetNode.innerHTML = `
        <h3>Register External Platform Suite Entity Node Link</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:2px;">Populate details below to broadcast access gateways lines across operational suite frameworks.</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Suite Node Label Identifier String Name:</label>
            <input type="text" id="adm-suite-name" class="form-field-control" placeholder="e.g. Fort Trade Matrix Terminal Platform">
        </div>
        <div class="form-input-container">
            <label>Context Summary Functional Description Text Baseline Info:</label>
            <input type="text" id="adm-suite-info" class="form-field-control" placeholder="e.g. Realtime B2B clearing and wholesale accounting pipeline infrastructure workspace.">
        </div>
        <div class="form-input-container">
            <label>Gateway Direct Target Routing Address Locator Link URL String:</label>
            <input type="url" id="adm-suite-url" class="form-field-control" value="https://">
        </div>
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Discard Link Record</button>
            <button onclick="executeAdminPipelineSaveNewSuiteEntityLinkNodeRecordRowItem()" class="btn-blue">Publish Network Node Entity Link</button>
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active");
}

/**
 * Saves and updates suite registrations directly back into the cloud layout registry models.
 */
async function executeAdminPipelineSaveNewSuiteEntityLinkNodeRecordRowItem() {
    const name = document.getElementById("adm-suite-name").value.trim();
    const info = document.getElementById("adm-suite-info").value.trim();
    const url = document.getElementById("adm-suite-url").value.trim();
    
    if(name === "" || info === "" || url === "") {
        showTopRightToast("Missing system criteria: All registration inputs are required.", "error");
        return;
    }
    
    const generatedNodeRecordId = "s_" + Date.now();
    const suitePayloadData = { 
        siteId: generatedNodeRecordId, 
        logo: "", 
        name: name, 
        info: info, 
        url: url 
    };

    try {
        if (window.FortMartFirebase || window.firebase) {
            const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
            
            if (window.FortMartFirebase) {
                const { doc, setDoc } = window.FortMartFirebase;
                await setDoc(doc(dbRefInstance, "networkSuiteEntities", generatedNodeRecordId), suitePayloadData);
            } else {
                await dbRefInstance.collection("networkSuiteEntities").doc(generatedNodeRecordId).set(suitePayloadData);
            }
        }

        SYSTEM_DATABASE.networkSuiteEntities.push(suitePayloadData);
        if (typeof syncPlatformDatabaseStateToWebStorage === "function") syncPlatformDatabaseStateToWebStorage();
        
        closeActiveModalDirectly('auth-modal');
        if (typeof populateNetworkSuiteExtensionsDisplayView === "function") populateNetworkSuiteExtensionsDisplayView();
        
        showTopRightToast("Admin Framework Master Ledger Synchronization Engine: Added entity block safely.", "success");
    } catch (e) {
        console.error("Failed adding platform network matrix node record item: ", e);
    }
}

/**
 * Privileged Platform System Monitoring Operations Analytics Calculation Metrics Control Module Subsystem
 */
function recalculateSystemAnalyticalMetricsSummary(selectedTimeframeContextStringValueWindowValueStringKey) {
    // Generate pseudo randomized tracking metrics numbers logs values profiles arrays shifts constrained safely checking filters
    const hoursLabelNode = document.getElementById("lbl-metric-hours");
    const topProdLabelNode = document.getElementById("lbl-metric-top-product");
    const topUserLabelNode = document.getElementById("lbl-metric-top-user");
    
    if(selectedTimeframeContextStringValueWindowValueStringKey === 'Today') {
        hoursLabelNode.innerText = "42 Hrs Active Session Execution Telemetry Logs";
        topProdLabelNode.innerText = "Smart OLED Television Set 4K Set Frame Array [ID: #p2]";
        topUserLabelNode.innerText = "Anonymous Client Broker Session Node Line Trace Vector Pointer #742";
    } else if(selectedTimeframeContextStringValueWindowValueStringKey === 'Yesterday') {
        hoursLabelNode.innerText = "94 Hrs Aggregated Cluster Session Close Log Execution Telemetry Logs";
        topProdLabelNode.innerText = "Premium Wireless Noise-Cancelling Headphones [ID: #p1]";
        topUserLabelNode.innerText = "Sarah Enterprise Hub (ID: #user_sarah)";
    } else {
        hoursLabelNode.innerText = "1,482 Hrs Total Active Running Service Infrastructure Analytics Logs Telemetry Parameters Matrix Units Metrics Data Profiles Elements Lines";
        topProdLabelNode.innerText = "Premium Wireless Noise-Cancelling Headphones System Inventory Component Log Baseline Registry Asset [ID: #p1]";
        topUserLabelNode.innerText = "Sarah Enterprise Hub Tracking Infrastructure Identity Master Accounting Ledger Profile Mapping Key Node Target Token Value Row #user_sarah Register Metrics Analysis";
    }
}

function executeFilteringSettingsContentPaneRowsNodesDisplay(searchQueryStringTextStringSyntaxPhrase) {
     const structuralSettingsPanelsElementsCollectionRowsArray = document.querySelectorAll(".settings-sub-panel div");
     structuralSettingsPanelsElementsCollectionRowsArray.forEach(nodeBlock => {
          if(nodeBlock.innerText.toLowerCase().includes(searchQueryStringTextStringSyntaxPhrase)) {
               nodeBlock.style.opacity = "1";
          } else {
               nodeBlock.style.opacity = "0.4"; // soft dimmer scaling to assist navigation discovery mapping indicators traces bounds
          }
     });
}

/**
 * Detailed Profile Presentation Context Overlay Summary Modal Processing Architecture Engine
 * Renders extended data layouts, business certificates, metrics parameters, and product lists for a given user profile.
 */
function launchDetailedUserProfileContextOverlaySummaryModal(userIdTokenKeyParameterValue, pushHistory = true) {
    const targetUserObjMatchRecord = SYSTEM_DATABASE.users.find(u => u.uid === userIdTokenKeyParameterValue || u.id === userIdTokenKeyParameterValue);
    if (!targetUserObjMatchRecord) return;
    const standardModalBodyElementNode = document.getElementById("product-detail-modal-body");
    if (!standardModalBodyElementNode) return;
    
    // 1. Dynamic Page Title Update
    const userDisplayName = targetUserObjMatchRecord.businessName || targetUserObjMatchRecord.identityName || targetUserObjMatchRecord.username || 'User Profile';
    document.title = `${userDisplayName} - Fort Mart`;

    // 2. Dynamic URL PushState Update
    if (pushHistory) {
        const userSlug = createProductSlug(userDisplayName);
        const targetUid = targetUserObjMatchRecord.uid || targetUserObjMatchRecord.id;
        const newUrl = `${window.location.origin}${window.location.pathname}?user=${userSlug}&uid=${targetUid}`;
        window.history.pushState({ uid: targetUid }, "", newUrl);
    }

    let subAccountClassificationMetadataDetailsBlockHTML = "";
    if (targetUserObjMatchRecord.accountType === 'business' || targetUserObjMatchRecord.type === 'business') {
         subAccountClassificationMetadataDetailsBlockHTML = `
             <div style="background-color:var(--fort-white-snow); padding:14px; border:1px solid var(--fort-gray-border);" class="rounded-rect margin-top-xs">
                 <h5 style="text-transform:uppercase; font-size:0.7rem; color:var(--fort-gray-slate); letter-spacing:0.5px;">User's Name and Info</h5>
                 <p style="font-size:0.95rem; font-weight:700; color:var(--fort-blue-dark); margin-top:4px;">${targetUserObjMatchRecord.businessName || ''}</p>
                 <p style="font-size:0.88rem; color:var(--fort-blue-primary); line-height:1.4; margin-top:4px;">${targetUserObjMatchRecord.businessInfo || ''}</p>
             </div> 
         `;
    } else {
         subAccountClassificationMetadataDetailsBlockHTML = `
             <div style="background-color:var(--fort-white-snow); padding:14px; border:1px solid var(--fort-gray-border);" class="rounded-rect margin-top-xs">
                 <h5 style="text-transform:uppercase; font-size:0.7rem; color:var(--fort-gray-slate); letter-spacing:0.5px;">User's Name and Info</h5>
                 <p style="font-size:0.95rem; font-weight:700; color:var(--fort-blue-dark); margin-top:4px;">${targetUserObjMatchRecord.identityName || targetUserObjMatchRecord.username || ''}</p>
             </div>
         `;
    }

    // --- ADMINISTRATIVE CONTROL LAYER LINKED DIRECTLY TO EXECUTEINLINEADMINSAVE ---
    let administrativeControlsInlineHTML = "";
    if (APP_STATE.currentUser && (APP_STATE.currentUser.uid === 'admin' || APP_STATE.currentUser.id === 'admin' || APP_STATE.currentUser.uid === 'account_manager')) {
        const rawVerificationCode = targetUserObjMatchRecord.UserAccountAuthenticationVerificationCode || targetUserObjMatchRecord.verificationCode || 'N/A';
        const currentGovernanceStatus = targetUserObjMatchRecord.verificationStatus || targetUserObjMatchRecord.status || 'unverified';
        const currentAccountType = targetUserObjMatchRecord.accountType || targetUserObjMatchRecord.type || 'personal';
        const registrationContactIdentifier = targetUserObjMatchRecord.identifierText || '';
        const securityAccessPassword = targetUserObjMatchRecord.secretKey || targetUserObjMatchRecord.password || '';
        const uid = targetUserObjMatchRecord.uid || targetUserObjMatchRecord.id || '';
        
        administrativeControlsInlineHTML = `
            <div style="margin-top:12px; margin-bottom:12px; padding:14px; background:#f7fafc; border:1px solid #cbd5e0; border-radius:8px; display:flex; flex-direction:column; gap:10px;">
                <h5 style="margin:0; text-transform:uppercase; font-size:0.75rem; color:var(--fort-gray-slate); letter-spacing:0.5px;">🛡️ Administrative Console Workspace</h5>
                
                <div style="display:flex; gap:8px;">
                    <div style="flex:1;">
                        <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Registration Contact (Email / Phone):</span>
                        <input type="text" id="adm-user-identifier-text" class="form-field-control" style="margin-top:4px; font-family:monospace;" value="${registrationContactIdentifier}">
                    </div>
                    <div style="flex:1;">
                        <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Account Password:</span>
                        <input type="text" id="adm-user-security-password" class="form-field-control" style="margin-top:4px; font-family:monospace;" value="${securityAccessPassword}">
                    </div>
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Account Signup Authentication Verification Code:</span>
                    <input type="text" id="UserAccountAuthenticationVerificationCode" class="form-field-control" style="margin-top:4px;" value="${rawVerificationCode}">
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">User ID:</span>
                    <input type="text" id="UserIdAdminSeen" class="form-field-control" style="margin-top:4px;" value="${uid}" disabled >
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Manage Account Type Privilege:</span>
                    <select id="adm-change-account-type" class="form-field-control" style="margin-top:4px;">
                        <option value="personal" ${currentAccountType === 'personal' ? 'selected' : ''}>Personal Account</option>
                        <option value="business" ${currentAccountType === 'business' ? 'selected' : ''}>Business (Commercial) Account</option>
                    </select>
                </div>
                
                <div style="font-size:0.82rem; color:var(--fort-blue-dark); margin-top:2px;">
                    Current Status Boundary: <strong id="lbl-inspector-active-status-tag" data-pending-status-value="${currentGovernanceStatus}" style="text-transform:uppercase;">${currentGovernanceStatus}</strong>
                </div>
                
                <div class="btn-group" style="margin-top:4px;">
                    <button class="btn-blue" style="padding:6px 12px; font-size:0.8rem;" onclick="executeInlineAdminSave('${targetUserObjMatchRecord.uid || targetUserObjMatchRecord.id}')">Apply Policy Changes</button>
                    <button class="btn-gray" style="padding:6px 12px; font-size:0.8rem;" onclick="(() => {
                        const tag = document.getElementById('lbl-inspector-active-status-tag');
                        if (tag) {
                            const currentVal = tag.getAttribute('data-pending-status-value') || 'unverified';
                            const nextStatus = currentVal.toLowerCase() === 'verified' ? 'unverified' : 'verified';
                            tag.setAttribute('data-pending-status-value', nextStatus);
                            tag.textContent = nextStatus;
                        }
                    })()">Toggle Verification Identity State</button>
                </div>
            </div>
        `;
    }

    // --- USER'S PRODUCTS GRID VIEW LOOP LAYER ---
    let userProductsListHTML = "";
    if (targetUserObjMatchRecord.accountType === 'business' || targetUserObjMatchRecord.type === 'business') {
        let currencySymbol = (APP_STATE.currentUser && APP_STATE.currentUser.country === 'Nigeria') ? '₦' : '$';
        const sellerProducts = SYSTEM_DATABASE.products.filter(p => p.ownerUid === targetUserObjMatchRecord.uid || p.ownerUid === targetUserObjMatchRecord.id);
        
        let productsGridItemsHTML = "";
        if (sellerProducts.length > 0) {
            sellerProducts.forEach(product => {
                const imgUrl = product.coverPhoto || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e0'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>";
                productsGridItemsHTML += `
                    <div class="profile-product-item-row" style="display:flex; align-items:center; gap:12px; padding:8px; background:var(--fort-white-snow); border:1px solid var(--fort-gray-border); border-radius:6px; cursor:pointer; transition:background 0.2s;" onclick="closeActiveModalDirectly('product-detail-modal'); launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')" onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='var(--fort-white-snow)'">
                        <img src="${imgUrl}" style="width:50px; height:50px; object-fit:contain; border-radius:4px; background:#fcfcfc; border:1px solid #e2e8f0;" alt="${product.name}">
                        <div style="flex:1; min-width:0;">
                            <h4 style="margin:0; font-size:0.9rem; color:var(--fort-blue-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${product.name}</h4>
                            <div style="font-size:0.85rem; font-weight:700; color:var(--fort-blue-light); margin-top:2px;">${currencySymbol}${product.price.toLocaleString()}</div>
                        </div>
                        <span style="font-size:1.1rem; color:var(--fort-gray-slate); padding-right:4px;">›</span>
                    </div>
                `;
            });
        } else {
            productsGridItemsHTML = `<p style="font-size:0.88rem; color:var(--fort-gray-slate); font-style:italic; margin:0; padding:4px;">This business user does not have any active product.</p>`;
        }

        userProductsListHTML = `
            <div class="user-products-section-block" style="margin-top:14px; margin-bottom:14px;">
                <h5 style="text-transform:uppercase; font-size:0.75rem; color:var(--fort-gray-slate); letter-spacing:0.5px; margin-bottom:8px;">Active Product Catalog Roster (${sellerProducts.length})</h5>
                <div style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;">
                    ${productsGridItemsHTML}
                </div>
            </div>
        `;
    }

    let userProfilePhotoSrc = targetUserObjMatchRecord.avatar || "https://firebasestorage.googleapis.com/v0/b/fort-mart.appspot.com/o/defaults%2Fuser_avatar_placeholder.png?alt=media";
    
    standardModalBodyElementNode.innerHTML = `
        <div class="modal-expanded-header-row" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fort-gray-border); padding-bottom:14px;">
            <h3>User Profile Identity Summary Context</h3>
            <button onclick="closeActiveModalDirectly('product-detail-modal')" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
        </div>
        
        <div class="modal-expanded-content-split-grid margin-top-md" style="display:grid; grid-template-columns: 100px 1fr; gap:20px; align-items:start;">
            <div class="profile-left-avatar-frame">
                <img src="${userProfilePhotoSrc}" class="circle-container" style="width:100px; height:100px; object-fit:cover; border:2px solid var(--fort-blue-primary);" alt="User Profile Master Photo">
            </div>
            
            <div class="profile-right-fields-column" style="display:flex; flex-direction:column;">
                <h2 style="color:var(--fort-blue-dark); font-weight:800; margin:0;">${targetUserObjMatchRecord.identityName || ''}</h2>
                <span style="font-size:0.82rem; color:var(--fort-gray-slate); margin-top:2px;">Account Boundary Class: <strong style="text-transform:uppercase;">${targetUserObjMatchRecord.accountType || targetUserObjMatchRecord.type || 'personal'}</strong></span>
                <span style="font-size:0.82rem; color:var(--fort-gray-slate); margin-top:2px;">Operational Country Localization Region: <strong>${targetUserObjMatchRecord.country || 'Nigeria'}</strong></span>
                
                ${subAccountClassificationMetadataDetailsBlockHTML}
                ${administrativeControlsInlineHTML}
                ${userProductsListHTML}
                
                <div class="modal-expanded-actions-footer-row btn-group" style="margin-top:12px; padding-top:14px; border-top:1px solid #f0f0f0;">
                    <button class="btn-gray" onclick="closeActiveModalDirectly('product-detail-modal')">Close</button>
                    ${(APP_STATE.currentUser && APP_STATE.currentUser.uid !== targetUserObjMatchRecord.uid) ? `<button class="btn-blue" onclick="closeActiveModalDirectly('product-detail-modal'); initialDirectMessageCommunicationPipelineSetup('${targetUserObjMatchRecord.uid || targetUserObjMatchRecord.id}')">💬 Message User</button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById("product-detail-modal").classList.add("active");
}

/**
 * NEW: Displays the password secure logout prompt layout
 */
function openLogoutConfirmationModal() {
    const passInput = document.getElementById("logout-auth-password");
    const errNode = document.getElementById("err-logout-password");
    
    if (passInput) passInput.value = "";
    if (errNode) errNode.classList.add("hidden-node");
    
    const logoutModal = document.getElementById("logout-confirm-modal");
    if (logoutModal) logoutModal.classList.add("active");
}

/**
 * NEW: Verifies secret key credentials before clearing security cookie tokens 
 */
function executeSecureAccountLogout() {
    const errNode = document.getElementById("err-logout-password");
    const passwordInput = document.getElementById("logout-auth-password").value;
    
    errNode.classList.add("hidden-node");

    if (typeof APP_STATE === 'undefined' || !APP_STATE.currentUser) {
        // Fallback if system app state configuration drops cleanly out of loop bounds
        performGlobalSessionPurge();
        return;
    }

    // Authenticate the current context user against the stored database match record
    if (APP_STATE.currentUser.secretKey !== passwordInput) {
        errNode.innerText = "Incorrect password. Logout verification failed.";
        errNode.classList.remove("hidden-node");
        return;
    }

    // Verification successful, execute state clear
    performGlobalSessionPurge();
    changelogoutosignupviceVersafunctionTwo();
    syncDrawerGuestTerminalNodeToActiveUserfunctiontwo();
}

/**
 * NEW: Secondary clean workflow execution to clear cookies, DOM classes, and structural roots
 */
function performGlobalSessionPurge() {
    // 1. CLEAR BOTH TRACKING CONTEXTS (Wipes cookies and file:// fallback)
    eraseSecureAuthCookie("fort_mart_logged_uid");
    localStorage.removeItem("fort_mart_cookie_fallback_uid");

    // 2. FORCE HOME NAVIGATION MANUALLY (Bypasses router lock gates)
    document.querySelectorAll(".view-page").forEach(page => {
        page.classList.add("hidden-view");
        page.classList.remove("active-view");
    });
    
    const homePageElement = document.getElementById("page-home");
    if (homePageElement) {
        homePageElement.classList.add("active-view");
        homePageElement.classList.remove("hidden-view");
        if (typeof APP_STATE !== 'undefined') {
            APP_STATE.activeViewPage = 'home';
        }
    }

    // 3. Reset the global runtime memory user state object
    if (typeof APP_STATE !== 'undefined') {
        APP_STATE.currentUser = null;
    }

    // 4. Close the security prompt window overlay stack box
    closeActiveModalDirectly('logout-confirm-modal');

    // 5. UI Resets: Re-hide the administrative workspace flags safely
    const adminNavItem = document.getElementById("admin-nav-item");
    const adminSuiteBtn = document.getElementById("admin-add-suite-site-btn");
    if (adminNavItem) adminNavItem.classList.add("hidden-admin-node");
    if (adminSuiteBtn) adminSuiteBtn.classList.add("hidden-node");

    // 6. Revert user context picture element back to default outline avatar
    const navUserAvatar = document.getElementById("nav-user-avatar");
    if (navUserAvatar) {
        navUserAvatar.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }

    // 7. Reload marketplace layouts cleanly
    if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
        renderMarketplaceProductsDisplayLoop();
    }

    syncDrawerGuestTerminalNodeToActiveUserfunctiontwo();
    
    // 8. Re-trigger the authentication initialization gate to show the clean Sign-In card panel
    if (typeof triggerAuthenticationModalSequence === 'function') {
        triggerAuthenticationModalSequence();
    }
}

/**
 * Updates the user drawer terminal node values based on the active authenticated session state data
 */
function syncDrawerGuestTerminalNodeToActiveUser() {
    // Ensure there is an active logged-in user available
    if (!APP_STATE || !APP_STATE.currentUser) {
        return;
    }

    const currentAccount = APP_STATE.currentUser;
    
    // 1. Resolve DOM node elements references matching target layout criteria
    const drawerAvatarNode = document.getElementById("drawer-user-avatar-frame-node");
    
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const headerCardPane = document.querySelector(".drawer-header-pane-card");
    
    if (headerCardPane) {
        const nameHeadingNode = headerCardPane.querySelector("h4");
        const statusSpanNode = headerCardPane.querySelector("span");
        
        // Update user identity display text label strings context definitions
        if (nameHeadingNode) {
            nameHeadingNode.innerText = currentAccount.identityName; // Changes "Guest Terminal Node" to actual name
        }
        
        if (statusSpanNode) {
            statusSpanNode.innerText = "Logged In Active"; // Changes status
            // Optional: add active system theme layout modification class styles here
            statusSpanNode.style.color = "#48bb78"; // Light green indicating active online node state tracking
        }
    }

    // 3. Update profile avatar display image resource mapping strings fallback paths
    if (drawerAvatarNode) {
        drawerAvatarNode.src = currentAccount.avatar || 
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }
}

function changelogoutosignupviceVersa() {
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const statusSpanNodetwo = document.getElementById("changeable-logout-btn");
    
    if (statusSpanNodetwo) {
        statusSpanNodetwo.innerText = "Logout"; // Changes status
        statusSpanNodetwo.className = "btn-danger"; // Red indicating Logout
    }   
}

function doubleButtonFunction() {
    if(!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }
    
    openLogoutConfirmationModal();
}

function changelogoutosignupviceVersafunctionTwo() {
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const statusSpanNodetwo = document.getElementById("changeable-logout-btn");
    
    if (statusSpanNodetwo) {
        statusSpanNodetwo.innerText = "Sign in"; // Changes status
        statusSpanNodetwo.className = "btn-blue"; // Blue indicating sign in
    }   
}

function syncDrawerGuestTerminalNodeToActiveUserfunctiontwo() {
    
    // 1. Resolve DOM node elements references matching target layout criteria
    const drawerAvatarNode = document.getElementById("drawer-user-avatar-frame-node");
    
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const headerCardPane = document.querySelector(".drawer-header-pane-card");
    
    if (headerCardPane) {
        const nameHeadingNode = headerCardPane.querySelector("h4");
        const statusSpanNode = headerCardPane.querySelector("span");
        
        // Update user identity display text label strings context definitions
        if (nameHeadingNode) {
            nameHeadingNode.innerText = "Guest Terminal Node"; // Changes "Guest Terminal Node" to actual name
        }
        
        if (statusSpanNode) {
            statusSpanNode.innerText = "Logged Out (Guest)"; // Changes status
            // Optional: add active system theme layout modification class styles here
            statusSpanNode.className = "profile-mode-tag-label personal" // Light green indicating active online node state tracking
            statusSpanNode.style.color = "#4a5568"
        }
    }

    // 3. Update profile avatar display image resource mapping strings fallback paths
    if (drawerAvatarNode) {
        drawerAvatarNode.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }
}

/**
 * Displays a custom animated toast notification from top-right.
 * @param {string} message - Text content of the alert.
 * @param {'success'|'error'|'info'} type - Theme flavor (default: 'success').
 * @param {number} durationMs - Display duration before sliding out (default: 3500ms).
 */
function showTopRightToast(message, type = 'success', durationMs = 3500) {
    // 1. Ensure the global container exists on the DOM
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // Add text message + manual close button
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    // 3. Trigger entry animation in next animation frame
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    // Helper for graceful exit removal
    const dismissToast = () => {
        toast.classList.remove('toast-show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    };

    // Manual close trigger on button click
    toast.querySelector('.toast-close-btn').addEventListener('click', dismissToast);

    // Auto dismiss timer
    if (durationMs > 0) {
        setTimeout(dismissToast, durationMs);
    }
}

/**
 * Extends working delete feature to purge image assets from Firebase Storage,
 * document entries from Firestore database, and memory structures locally.
 */
async function executeDeletePlatformInventoryItemListingPostRecord(targetProductIdKeyValueString) {
    const confirmationPromptMessage = "Are you sure you want to delete this product?";
    
    displayConfirmationModalOverlayAction(confirmationPromptMessage, async () => {
        try {
            // 1. Locate product record locally or within memory to check for stored image assets
            const productToDelete = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
            
            // 2. Delete asset from Firebase Storage if a remote storage URL exists
            const imageUrl = productToDelete?.coverPhoto || productToDelete?.imageUrl;
            if (imageUrl && (imageUrl.startsWith("gs://") || imageUrl.startsWith("https://firebasestorage.googleapis.com"))) {
                try {
                    if (window.FortMartFirebase && window.FortMartFirebase.storage) {
                        const { ref, deleteObject } = window.FortMartFirebase;
                        const storageInstance = window.FortMartFirebase.storage;
                        const imageRef = ref(storageInstance, imageUrl);
                        await deleteObject(imageRef);
                    } else if (window.firebase && window.firebase.storage) {
                        const imageRef = window.firebase.storage().refFromURL(imageUrl);
                        await imageRef.delete();
                    }
                } catch (storageErr) {
                    console.warn("Firebase Storage file removal notice (file may already be removed or missing):", storageErr);
                }
            }

            // 3. Delete document entry from Cloud Firestore Database
            if (window.FortMartFirebase || window.firebase) {
                const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
                
                if (window.FortMartFirebase) {
                    const { doc, deleteDoc } = window.FortMartFirebase;
                    await deleteDoc(doc(dbRefInstance, "products", targetProductIdKeyValueString));
                } else {
                    await dbRefInstance.collection("products").doc(targetProductIdKeyValueString).delete();
                }
            }

            // 4. Splice and remove from local application memory arrays safely
            const structuralIndexMatchPointerId = SYSTEM_DATABASE.products.findIndex(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
            
            if (structuralIndexMatchPointerId !== -1) {
                SYSTEM_DATABASE.products.splice(structuralIndexMatchPointerId, 1);
                
                // Sync mutated array down to local persistent web storage
                if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
                    syncPlatformDatabaseStateToWebStorage();
                }

                // Custom animated success toast
                showTopRightToast("Product and assets successfully purged from system storage.", "success");
                
                // Trigger user interface lifecycle rendering view loops to instantly refresh screens
                if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
                    renderAccountInventoryLedgerManagementDashboardGrid();
                }
                if (typeof renderMarketplaceProductsDisplayLoop === "function") {
                    renderMarketplaceProductsDisplayLoop();
                }
            } else {
                showTopRightToast("Error: Target product identifier mapping reference could not be found.", "error");
            }

        } catch (err) {
            console.error("Error executing backend document/storage purge mutation:", err);
            showTopRightToast("Failed to completely purge product from Cloud Infrastructure layers.", "error");
        }
    });
}

function launchadvertismentofBusinessUpgrade() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    modalContentTargetNode.innerHTML = `
        <h3>Upgrade Account To Business To Publish Products</h3>
    
        <div style="margin-top: 14px; padding: 12px; background: #eef9ff; border: 1px solid #bbeeef; border-radius: 6px; text-align: center;">
            <p style="font-size: 0.85rem; color: #0d233a; margin-bottom: 8px;">
                Want to list products and unlock commercial tools?
            </p>
            <button class="btn-blue" style="background-color: #09a5db; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 700; cursor: pointer;" onclick="closeActiveModalDirectly('auth-modal'); initiateBusinessAccountUpgradeSequence()">
                Upgrade Account to Business (₦2,500)
            </button>
        </div>        
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Close</button> 
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active"); 
}

/**
 * Fort Mart Preloader and Progress Meter Controller Hook
 */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader-container");
    const progressBar = document.getElementById("preloader-progress-bar");
    const progressText = document.getElementById("preloader-percentage-text");

    if (!preloader || !progressBar) return;

    let progress = 0;
    const duration = 3000; // Total loading screen time (3 seconds)
    const intervalTime = 30; // Update step resolution in milliseconds
    const step = (intervalTime / duration) * 100;

    const progressInterval = setInterval(() => {
        progress += step;

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Turn completely solid blue in its final stage
            progressBar.classList.add("fully-complete");
            progressBar.style.width = "100%";
            progressText.innerText = "Ready!";

            // Smoothly remove preloader after reaching full status
            setTimeout(() => {
                preloader.classList.add("fade-out");
                
                // Let other state machine rendering scripts safely execute after opening
                if (typeof initApplicationState === 'function') {
                    initApplicationState();
                }
            }, 400); // Tiny delay to let the user see the 100% complete state
        } else {
            progressBar.style.width = `${progress}%`;
            progressText.innerText = `Loading ${Math.floor(progress)}%`;

            // Change to complete blue within the last 1-2 seconds of loading 
            if (progress >= 66) { 
                progressBar.classList.add("fully-complete");
            }
        }
    }, intervalTime);
});

/**
 * Commits administrative edits, user credential updates, verification statuses, 
 * and account classification toggles directly to Firebase Storage / Firestore.
 * Always overwrites/merges user parameters into the Firestore "users" collection.
 */
async function executeInlineAdminSave(userId) {
    if (!userId) {
        console.error("Admin save failed: Invalid or missing User ID.");
        return;
    }

    // 1. Locate local memory instance fallback
    const accountInstance = SYSTEM_DATABASE.users.find(u => u.id === userId || u.uid === userId);
    
    // 2. Read values from the Administrative Console DOM fields
    const cachedStatusElement = document.getElementById("lbl-inspector-active-status-tag");
    const evaluatedStatusValue = cachedStatusElement && cachedStatusElement.getAttribute("data-pending-status-value") 
        ? cachedStatusElement.getAttribute("data-pending-status-value") 
        : (accountInstance ? (accountInstance.verificationStatus || accountInstance.status || 'unverified') : 'unverified');

    const inputIdentifierField = document.getElementById("adm-user-identifier-text");
    const structuralIdentifierValue = inputIdentifierField ? inputIdentifierField.value.trim() : "";

    const inputPasswordField = document.getElementById("adm-user-security-password");
    const operationalPasswordValue = inputPasswordField ? inputPasswordField.value.trim() : "";

    const inputCodeField = document.getElementById("UserAccountAuthenticationVerificationCode");
    const boundCodeValue = inputCodeField ? inputCodeField.value.trim() : "";

    const accountTypeSelectField = document.getElementById("adm-change-account-type");
    const selectedType = accountTypeSelectField ? accountTypeSelectField.value : "personal";

    // 3. Assemble the updated user payload object
    const updatedUserPayload = {
        uid: userId,
        verificationStatus: evaluatedStatusValue,
        status: evaluatedStatusValue,
        identifierText: structuralIdentifierValue,
        secretKey: operationalPasswordValue,
        password: operationalPasswordValue,
        UserAccountAuthenticationVerificationCode: boundCodeValue,
        verificationCode: boundCodeValue,
        accountType: selectedType,
        type: selectedType
    };

    if (selectedType === 'business') {
        const existingBizName = accountInstance ? accountInstance.businessName : null;
        const existingBizInfo = accountInstance ? accountInstance.businessInfo : null;
        const existingName = accountInstance ? (accountInstance.identityName || accountInstance.username) : "Corporate Entity";

        updatedUserPayload.businessName = existingBizName || existingName;
        updatedUserPayload.businessInfo = existingBizInfo || "Commercial business distribution account profile workspace.";
    }

    try {
        // 4. Overwrite/Sync changes directly to Firebase Firestore
        if (window.FortMartFirebase && window.FortMartFirebase.db) {
            const { db, doc, setDoc } = window.FortMartFirebase;
            
            // setDoc with { merge: true } guarantees existing record properties are overwritten with the new values
            await setDoc(doc(db, "users", userId), updatedUserPayload, { merge: true });
        } else {
            console.warn("Firebase instance missing on window context. Saved to local memory only.");
        }

        // 5. Update local runtime state (SYSTEM_DATABASE cache)
        if (accountInstance) {
            Object.assign(accountInstance, updatedUserPayload);
        }

        // 6. Refresh UI components & Admin table display
        if (typeof updateClientSessionContextState === "function") {
            updateClientSessionContextState();
        }

        if (typeof renderAdminUsersManagementList === "function") {
            renderAdminUsersManagementList();
        }

        // Close overlay modal upon save completion
        closeActiveModalDirectly("product-detail-modal");

        // Display confirmation alert/toast
        if (typeof showAlertModal === "function") {
            showAlertModal("Overwrites Saved", "Target credential variables, account type matrices, and identity parameters permanently written to Firebase.");
        } else if (typeof showTopRightToast === "function") {
            showTopRightToast("Overwrites Saved successfully to Firebase.", "success");
        } else {
            alert("Overwrites Saved successfully to Firebase.");
        }

    } catch (error) {
        console.error("Critical error persisting administrative updates to Firebase Firestore:", error);
        if (typeof showAlertModal === "function") {
            showAlertModal("Save Error", "Failed to update target user data in Firebase Storage/Firestore.");
        } else {
            alert("Failed to update target user data in Firebase Storage/Firestore.");
        }
    }
}

// Global state object for managing account upgrades
let BUSINESS_UPGRADE_WIZARD = {
    otpCode: null,
    cooldownInterval: null,
    cooldownSeconds: 0
};

/**
 * Step 1: Initiate Account Upgrade Workflow - Password Verification Modal
 */
function initiateBusinessAccountUpgradeSequence() {
    if (!APP_STATE.currentUser) {
        showTopRightToast("Please log in to upgrade your account.", "info");
        return;
    }

    const currentAccountType = APP_STATE.currentUser.accountType || APP_STATE.currentUser.type || 'personal';
    if (currentAccountType === 'business') {
        showTopRightToast("Your account is already registered as a Business Account.", "info");
        return;
    }

    // Reuse existing confirm modal or build password verification modal inline
    let pwdModal = document.getElementById("upgrade-password-modal");
    if (pwdModal) pwdModal.remove();

    pwdModal = document.createElement("div");
    pwdModal.id = "upgrade-password-modal";
    pwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    pwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark, #0d233a);">Confirm Password</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Verify your account credentials before upgrading your account to a Business Account (₦2,500 fee):</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Account Password</label>
                <input type="password" id="upgrade-pwd-input" class="form-field-control" placeholder="Enter your password" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="upgrade-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="document.getElementById('upgrade-password-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="validateUpgradePasswordAndProceed()">Verify Password</button>
            </div>
        </div>
    `;

    document.body.appendChild(pwdModal);
}

/**
 * Validates password input against APP_STATE user records.
 */
function validateUpgradePasswordAndProceed() {
    const pwdInput = document.getElementById("upgrade-pwd-input");
    const errFeedback = document.getElementById("upgrade-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value.trim() : "";

    const actualSecret = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password || "";

    if (!enteredPassword || enteredPassword !== actualSecret) {
        if (errFeedback) {
            errFeedback.innerText = "Invalid password. Please check your password and try again.";
            errFeedback.style.display = "block";
        }
        return;
    }

    // Close password modal
    document.getElementById("upgrade-password-modal").remove();

    // Trigger Step 2: Send OTP and launch OTP Modal
    sendBusinessUpgradeEmailOtpWorkflow(true);
}

/**
 * Step 2: OTP Generation & EmailJS Sending Logic (Fixed)
 */
async function sendBusinessUpgradeEmailOtpWorkflow(isInitialLaunch = false) {
    const userObj = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : {};
    
    // Fallback email retrieval
    const targetEmail = userObj.identifierText || userObj.email || "";
    
    if (!targetEmail || !targetEmail.includes("@")) {
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "No valid email associated with this account.";
            feedbackElement.style.color = "red";
            feedbackElement.style.display = "block";
        } else {
            alert("No valid email address found for this account.");
        }
        return;
    }

    const todayKeyStr = "otp_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached (5 OTPs per day).";
                feedbackElement.style.color = "red";
                feedbackElement.style.display = "block";
            }
        } else {
            renderBusinessUpgradeOtpModal();
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached (5 OTPs per day).";
                    feedbackElement.style.color = "red";
                    feedbackElement.style.display = "block";
                }
            }, 50);
        }
        return;
    }

    // Generate 4-digit code
    const freshOtpCode = Math.floor(1000 + Math.random() * 9000);
    BUSINESS_UPGRADE_WIZARD.otpCode = freshOtpCode;

    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh code...";
            feedbackElement.style.color = "blue";
            feedbackElement.style.display = "block";
        }
    } else {
        renderBusinessUpgradeOtpModal();
    }

    // Check if EmailJS SDK is attached to window
    if (!window.emailjs) {
        console.error("EmailJS SDK not loaded on window.");
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Email service unavailable. Please refresh and try again.";
            feedbackElement.style.color = "red";
            feedbackElement.style.display = "block";
        }
        return;
    }

    try {
        // Start resend cooldown only when send is attempted
        initiateUpgradeOtpResendCooldown();

        const templateParams = {
            to_email: targetEmail,
            email: targetEmail, // Fallback alias
            user_name: userObj.identityName || userObj.username || "Valued Customer",
            to_name: userObj.identityName || userObj.username || "Valued Customer", // Fallback alias
            otp_code: freshOtpCode,
            code: freshOtpCode // Fallback alias
        };

        // Send via EmailJS
        const response = await window.emailjs.send(
            "service_ejag5pe", 
            "template_nzub7tk", 
            templateParams
        );

        console.log("EmailJS Success:", response.status, response.text);

        // Increment attempts count only after successful API call
        dailyAttemptsCount++;
        localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());

        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = `Verification code sent to ${targetEmail}`;
            feedbackElement.style.color = "green";
            feedbackElement.style.display = "block";
        }
    } catch (sendErr) {
        console.error("EmailJS dispatch failed:", sendErr);
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Failed to send code. Verify connection or email setup.";
            feedbackElement.style.color = "red";
            feedbackElement.style.display = "block";
        }
    }
}

/**
 * Handles 30-second resend timer cooldown for Upgrade OTP
 */
function initiateUpgradeOtpResendCooldown() {
    if (BUSINESS_UPGRADE_WIZARD.cooldownInterval) {
        clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
    }

    BUSINESS_UPGRADE_WIZARD.cooldownSeconds = 30;

    BUSINESS_UPGRADE_WIZARD.cooldownInterval = setInterval(() => {
        BUSINESS_UPGRADE_WIZARD.cooldownSeconds--;
        
        const resendLinkNode = document.getElementById("upgrade-otp-resend-link");
        if (resendLinkNode) {
            if (BUSINESS_UPGRADE_WIZARD.cooldownSeconds > 0) {
                resendLinkNode.innerText = `Resend in ${BUSINESS_UPGRADE_WIZARD.cooldownSeconds}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
                BUSINESS_UPGRADE_WIZARD.cooldownInterval = null;
            }
        } else if (BUSINESS_UPGRADE_WIZARD.cooldownSeconds <= 0) {
            clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
            BUSINESS_UPGRADE_WIZARD.cooldownInterval = null;
        }
    }, 1000);
}

/**
 * Renders Step 2 Modal UI for OTP Input
 */
function renderBusinessUpgradeOtpModal() {
    let otpModal = document.getElementById("upgrade-otp-modal");
    if (otpModal) otpModal.remove();

    const maskedTargetEmail = APP_STATE.currentUser.identifierText || "user@fortmart.com";
    const secondsLeft = BUSINESS_UPGRADE_WIZARD.cooldownSeconds || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerEventsStyle = secondsLeft > 0 ? "none" : "auto";

    otpModal = document.createElement("div");
    otpModal.id = "upgrade-otp-modal";
    otpModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    otpModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 420px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark, #0d233a);">Verify Email Identity</h3>
            <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
                Enter the OTP sent to <strong>${maskedTargetEmail}</strong>
            </p>
            
            <div style="margin-top:15px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Input 4-Digit OTP Code:</label>
                <input type="text" id="upgrade-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px; width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="err-upgrade-otp-feedback" style="color: red; font-size: 0.8rem; margin-top: 4px; display:none;"></div>
            </div>

            <div style="margin-top: 10px; font-size: 0.85rem;">
                <span>Didn't receive message? </span>
                <a href="javascript:void(0)" 
                   id="upgrade-otp-resend-link"
                   onclick="if(BUSINESS_UPGRADE_WIZARD.cooldownSeconds <= 0) sendBusinessUpgradeEmailOtpWorkflow(false);" 
                   style="color: #007bff; font-weight: ${weightStyle}; opacity: ${opacityStyle}; pointer-events: ${pointerEventsStyle}; text-decoration: none;">${textLabel}</a>
            </div>

            <p style="font-size:0.85rem; color:#666; line-height: 1.4; margin-top:12px;">
                Note: Check your spam folder if the code isn't in your primary inbox and tagged the message "not spam".
            </p>
            
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top: 20px;">
                <button class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="closeUpgradeOtpModal()">Cancel</button>
                <button class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="executeVerifyUpgradeOtpSubmission()">Verify OTP</button>
            </div>
        </div>
    `;

    document.body.appendChild(otpModal);
}

function closeUpgradeOtpModal() {
    if (BUSINESS_UPGRADE_WIZARD.cooldownInterval) {
        clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
        BUSINESS_UPGRADE_WIZARD.cooldownInterval = null;
    }
    const modal = document.getElementById("upgrade-otp-modal");
    if (modal) modal.remove();
}

/**
 * Validates typed OTP input against BUSINESS_UPGRADE_WIZARD.otpCode
 */
function executeVerifyUpgradeOtpSubmission() {
    const inputField = document.getElementById("upgrade-otp-input");
    const feedback = document.getElementById("err-upgrade-otp-feedback");

    const enteredOtp = inputField ? inputField.value.trim() : "";
    const expectedOtp = String(BUSINESS_UPGRADE_WIZARD.otpCode || "");

    if (!enteredOtp || enteredOtp !== expectedOtp) {
        if (feedback) {
            feedback.innerText = "Invalid verification token. Please verify entry values.";
            feedback.style.color = "red";
            feedback.style.display = "block";
        }
        return;
    }

    // Clear timers and close modal
    closeUpgradeOtpModal();

    // Trigger Step 3: Launch Fort Mart Final Paystack Confirmation Modal
    launchBusinessUpgradePaystackConfirmationModal();
}

/**
 * Step 3: Final Fort Mart Confirmation Modal prior to Paystack Checkout launch
 */
function launchBusinessUpgradePaystackConfirmationModal() {
    let checkoutModal = document.getElementById("upgrade-paystack-checkout-modal");
    if (checkoutModal) checkoutModal.remove();

    checkoutModal = document.createElement("div");
    checkoutModal.id = "upgrade-paystack-checkout-modal";
    checkoutModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    const userEmail = APP_STATE.currentUser.identifierText || 'user@fortmart.com';
    const upgradePrice = 2500; // 2,500 Naira

    checkoutModal.innerHTML = `
        <div class="paystack-modal-box" style="background: white; border-radius: 8px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid var(--fort-gray-border, #ccc);">
            <div class="paystack-header-brand" style="background-color: #09a5db; color: white; padding: 20px; text-align: center;">
                <h3 style="margin:0; color:white;">Fort Mart Gateway</h3>
                <span style="font-size:0.75rem; opacity:0.9;">Account Plan Upgrade to Business Account</span>
            </div>
            <div class="paystack-body-content" style="padding: 24px;">
                <p style="font-size:0.85rem; color:var(--fort-blue-dark, #0d233a); margin-bottom:12px;">You are authorizing a one-time payment to upgrade your account to a <strong>Business (Commercial) Account</strong>.</p>
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Email Address</label>
                    <input type="text" id="upgrade-paystack-email-field" class="form-field-control" value="${userEmail}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div class="form-input-container" style="margin-bottom:14px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Fee Amount</label>
                    <input type="text" class="form-field-control" value="₦${upgradePrice.toLocaleString()}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
            </div>
            <div class="paystack-footer-row" style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
                <button class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="document.getElementById('upgrade-paystack-checkout-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background-color:#3bb75e; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="executeBusinessUpgradePaystackIframePopRuntime()">Proceed to Payment Method</button>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);
}

/**
 * Step 4: Paystack Runtime Initialization Execution
 */
function executeBusinessUpgradePaystackIframePopRuntime() {
    if (typeof PaystackPop === 'undefined') {
        showTopRightToast("Paystack SDK not loaded! Check your internet connection.", "info");
        return;
    }

    const emailField = document.getElementById("upgrade-paystack-email-field");
    const userEmail = emailField ? emailField.value : APP_STATE.currentUser.identifierText;

    const userUid = APP_STATE.currentUser ? APP_STATE.currentUser.uid : 'GUEST_USER';
    const upgradePrice = 2500; // 2500 NGN

    // Close preview modal
    const modal = document.getElementById('upgrade-paystack-checkout-modal');
    if (modal) modal.remove();

    let paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: upgradePrice * 100, // Amount in kobo (250,000 kobo = 2,500 NGN)
        currency: "NGN",
        ref: 'FT-BUS-UPGRADE-' + userUid + '-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            upgrade_type: "business_account",
            user_uid: userUid
        },
        callback: function(response) {
            console.log("Business Upgrade Payment successful response:", response);
            processBusinessUpgradePaymentSuccess();
        },
        onClose: function() {
            showTopRightToast('Payment window closed by customer session.', "info");
        }
    };

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        showTopRightToast("Error launching Paystack modal: " + error.message, "error");
    }
}

/**
 * Step 5: Post-Payment Business Account Transition and Firestore / Local Storage Sync
 */
async function processBusinessUpgradePaymentSuccess() {
    const userUid = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;

    // Build payload updates for user profile
    const businessNameVal = APP_STATE.currentUser.businessName || APP_STATE.currentUser.identityName || APP_STATE.currentUser.username || "Corporate Entity";
    const businessInfoVal = APP_STATE.currentUser.businessInfo || "Commercial business distribution account profile workspace.";

    const userUpdates = {
        accountType: 'business',
        type: 'business',
        businessName: businessNameVal,
        businessInfo: businessInfoVal
    };

    // 1. Update matching user record in SYSTEM_DATABASE.users local cache
    const targetUserRecord = SYSTEM_DATABASE.users.find(u => u.uid === userUid || u.id === userUid);
    if (targetUserRecord) {
        Object.assign(targetUserRecord, userUpdates);
    }

    // 2. Synchronize current active runtime state
    Object.assign(APP_STATE.currentUser, userUpdates);

    // 3. Automated Message sent by Fort Mart Admin to User
    const adminMessageText = "Congratulations! Your account has been successfully upgraded to a Business Account. You now have full access to business features on Fort Mart.";
    const targetChatId = "chat_admin_" + userUid;

    let adminChatThread = SYSTEM_DATABASE.chats.find(c => c.chatId === targetChatId);

    const newMessageObj = {
        mid: "msg_" + Date.now(),
        senderUid: "admin",
        text: adminMessageText,
        timestamp: new Date().toLocaleTimeString([], { day: '2-digit', month: '2-digit', hour: '2-digit', year: '2-digit', minute: '2-digit' }),
    };

    if (adminChatThread) {
        adminChatThread.messageLog.push(newMessageObj);
    } else {
        // Create chat thread if non-existent
        adminChatThread = {
            chatId: targetChatId,
            dynamicParticipants: ["admin", userUid],
            messageLog: [newMessageObj]
        };
        SYSTEM_DATABASE.chats.push(adminChatThread);
    }

    // 4. Update Cloud Firestore database directly via window.FortMartFirebase SDK
    if (window.FortMartFirebase) {
        const { db, doc, updateDoc, setDoc } = window.FortMartFirebase;
        
        try {
            // Write user account changes to Firestore 'users' collection
            await updateDoc(doc(db, "users", userUid), userUpdates).catch(async (err) => {
                // Fall back to setDoc merge if document snapshot is missing
                await setDoc(doc(db, "users", userUid), userUpdates, { merge: true });
            });

            // Sync updated or created admin congratulatory chat to Firestore 'chats' collection
            await setDoc(doc(db, "chats", targetChatId), adminChatThread, { merge: true });

            console.log("Account upgrade and admin notification synced to Cloud Firestore.");
        } catch (firebaseErr) {
            console.error("Firestore upgrade sync failed:", firebaseErr);
        }
    }

    // 5. Commit and sync modifications to local web storage fallback
    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
        syncPlatformDatabaseStateToWebStorage();
    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
        commitDatabasesStateToLocalStorage();
    }

    showTopRightToast("Payment successful! Your account has been upgraded to a Business Account.", "success");

    // Refresh UI/view rendering if applicable
    if (typeof renderMarketplaceProductsDisplayLoop === "function") {
        renderMarketplaceProductsDisplayLoop();
    }
}

/**
 * Admin User List Rendering Engine (Firestore Synchronized)
 * Fetches user accounts live from Cloud Firestore, applies search query filters,
 * and displays accounts sorted by creation date (newest first).
 */
async function renderAdminUsersManagementList() {
    const listContainer = document.getElementById("admin-users-list-container");
    const searchInput = document.getElementById("admin-user-search-bar");
    if (!listContainer) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // Default SVG / Firebase Storage Fallback Assets
    const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

    // Render Loading Feedback State
    listContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--fort-blue-primary, #0066cc);">
            <div class="spinner" style="margin: 0 auto 8px auto;"></div>
            <span style="font-size: 0.88rem; font-weight: 500;">Fetching live user registry from Cloud Firestore...</span>
        </div>
    `;

    let rawUsersList = [];

    // 1. Fetch live user data directly from Firestore or fall back to local state
    try {
        if (window.FortMartFirebase && window.FortMartFirebase.db) {
            const { db, collection, getDocs } = window.FortMartFirebase;
            const usersSnapshot = await getDocs(collection(db, "users"));
            
            usersSnapshot.forEach(doc => {
                rawUsersList.push({ uid: doc.id, ...doc.data() });
            });
            
            // Keep system database memory cache in sync
            if (typeof SYSTEM_DATABASE !== "undefined") {
                SYSTEM_DATABASE.users = rawUsersList;
            }
        } else if (typeof SYSTEM_DATABASE !== "undefined" && Array.isArray(SYSTEM_DATABASE.users)) {
            rawUsersList = [...SYSTEM_DATABASE.users];
        }
    } catch (err) {
        console.error("Firestore Error: Failed to fetch users list.", err);
        listContainer.innerHTML = `
            <div style="padding: 16px; color: #c53030; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; text-align: center; font-size: 0.85rem;">
                ⚠️ Failed to load user accounts from Cloud Database: ${err.message || "Network Error"}
            </div>
        `;
        return;
    }

    // 2. Filter out administrative self-accounts and execute multi-field search matching
    let filteredUsers = rawUsersList.filter(u => {
        const userId = u.uid || u.id || "";
        if (userId === 'admin' || userId === 'user_sarah' || userId === 'account_manager') return false;

        const nameMatch = (u.identityName || u.username || u.businessName || '').toLowerCase().includes(searchTerm);
        const emailMatch = (u.identifierText || u.email || '').toLowerCase().includes(searchTerm);
        const statusMatch = (u.verificationStatus || u.status || '').toLowerCase().includes(searchTerm);
        const typeMatch = (u.accountType || u.type || '').toLowerCase().includes(searchTerm);

        return nameMatch || emailMatch || statusMatch || typeMatch;
    });

    // 3. Sort accounts chronologically from newest created to oldest created
    filteredUsers.sort((a, b) => {
        const extractTime = (record) => {
            if (record.createdAt) {
                return new Date(record.createdAt).getTime() || 0;
            }
            const idStr = String(record.uid || record.id || "");
            const parsedTs = parseInt(idStr.replace("user_", ""), 10);
            return isNaN(parsedTs) ? 0 : parsedTs;
        };

        return extractTime(b) - extractTime(a);
    });

    // 4. Render account listing DOM nodes or empty state feedback
    if (filteredUsers.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 20px; color: var(--fort-gray-slate, #64748b); text-align: center; font-style: italic; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
                No registered user accounts found matching criteria.
            </div>
        `;
        return;
    }

    let listHTML = "";
    filteredUsers.forEach(user => {
        const userId = user.uid || user.id;
        const displayName = user.identityName || user.businessName || user.username || "Unnamed User";
        const email = user.identifierText || user.email || "No Contact";
        const accountType = user.accountType || user.type || "personal";
        const status = user.verificationStatus || user.status || "unverified";
        const avatar = user.avatar && user.avatar.trim() !== "" ? user.avatar : DEFAULT_AVATAR;

        const isVerified = status === "verified";
        const badgeBg = isVerified ? "#e6fffa" : "#fff5f5";
        const badgeColor = isVerified ? "#234e52" : "#9b2c2c";
        const badgeBorder = isVerified ? "#b2f5ea" : "#feb2b2";

        listHTML += `
            <div class="admin-user-card-item" onclick="launchDetailedUserProfileContextOverlaySummaryModal('${userId}')" style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; transition:all 0.2s; margin-bottom:8px;" onmouseover="this.style.borderColor='#cbd5e0'; this.style.background='#f8fafc';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#fff';">
                <img src="${avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e0;" alt="Avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h4 style="margin:0; font-size:0.92rem; color:var(--fort-blue-dark, #1e293b); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${displayName}</h4>
                        <span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:2px 6px; border-radius:4px; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder};">${status}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--fort-gray-slate, #64748b); margin-top:2px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                        Email: <strong>${email}</strong> | Type: <span style="text-transform:capitalize;">${accountType}</span> 
                    </div>
                </div>
                <button class="btn-blue" style="padding:4px 10px; font-size:0.75rem; shrink:0;" onclick="event.stopPropagation(); launchDetailedUserProfileContextOverlaySummaryModal('${userId}')">Manage</button>
            </div>
        `;
    });

    listContainer.innerHTML = listHTML;
}

/**
 * Utility Slug Generator Function for Clean URLs
 */
function createProductSlug(textString) {
    if (!textString) return "item";
    return textString
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove non-word characters
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

/**
 * Close modal directly and reset URL & document title to baseline state.
 */
function closeActiveModalDirectly(modalId = 'product-detail-modal') {
    const modalTarget = document.getElementById(modalId);
    if (modalTarget) {
        modalTarget.classList.remove("active");
    }

    // Reset document title to application default
    document.title = "Fort Mart - Marketplace";

    // Clean query parameters from URL without triggering page reload
    if (window.location.search) {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({}, "", cleanUrl);
    }
}

/**
 * Synonym alias pointing to closeActiveModalDirectly
 */
function closeProductSpecificationOverlay() {
    closeActiveModalDirectly('product-detail-modal');
}

/**
 * URL Routing Handler: Parses query strings (`?product=...&pid=...` or `?user=...&uid=...`) 
 * on direct link hits or browser Back/Forward back-history navigation.
 */
async function handleProductUrlRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('pid');
    const uid = urlParams.get('uid');

    if (pid) {
        // Pass false so pushState isn't duplicated on page load/popstate
        await launchComprehensiveProductSpecificationsExpandedModalView(pid, false);
    } else if (uid) {
        launchDetailedUserProfileContextOverlaySummaryModal(uid, false);
    } else {
        // Ensure modal is hidden if no query params exist
        const modal = document.getElementById("product-detail-modal");
        if (modal && modal.classList.contains("active")) {
            modal.classList.remove("active");
            document.title = "Fort Mart - Marketplace";
        }
    }
}

// Window Event Listeners
window.addEventListener("popstate", () => {
    handleProductUrlRouting();
});

window.addEventListener("DOMContentLoaded", () => {
    handleProductUrlRouting();
});

const ad1 = {
    type: 'image',
    header: 'Need a Custom Website!',
    text: 'Try Fort Developers (createawebsite.fort.com)',
    src: 'flyer fort - landscape.png',
    url: 'https://createawebsite.fort.com'
};

const ad2 = {
    type: 'image',
    header: 'Need a Custom Website!',
    text: 'Try Fort Developers (createawebsite.fort.com)',
    src: 'flyer fort - landscape.png',
    url: 'https://createawebsite.fort.com'
};

const ads = [ad1, ad2];

function setupAdModal() {
    // Retrieve previous index from localStorage, or default to -1 if not set
    let lastIndex = parseInt(localStorage.getItem('lastAdIndex'), 10);
    if (isNaN(lastIndex)) {
        lastIndex = -1;
    }

    // Calculate next index in sequence (loops back to 0 when end is reached)
    const nextIndex = (lastIndex + 1) % ads.length;
    
    // Save current index for the next run
    localStorage.setItem('lastAdIndex', nextIndex);

    const currentAd = ads[nextIndex];

    const headerEl = document.getElementById('ad-header');
    const textEl = document.getElementById('ad-text');
    const mediaContainer = document.getElementById('ad-media-container');
    const continueBtn = document.getElementById('ad-continue-btn');
    const visitBtn = document.getElementById('ad-visit-btn');

    // Populate header, text, and visit button
    headerEl.innerText = currentAd.header;
    textEl.innerHTML = `<strong>${currentAd.text}</strong>`;
    
    if (visitBtn) {
        visitBtn.href = currentAd.url;
    }

    mediaContainer.innerHTML = '';
    
    // Open URL when clicking the container (opens in new tab)
    mediaContainer.style.cursor = 'pointer';
    mediaContainer.onclick = (e) => {
        // Prevent triggering redirect if the user interacts with video controls
        if (e.target.tagName !== 'VIDEO') {
            window.open(currentAd.url, '_blank', 'noopener,noreferrer');
        }
    };

    // Render appropriate media element
    if (currentAd.type === 'video') {
        const video = document.createElement('video');
        video.src = currentAd.src;
        video.autoplay = true;
        video.muted = true; // Required for reliable autoplay across browsers
        video.playsInline = true;
        video.controls = true;
        
        // Open URL when clicking video background without triggering play/pause controls conflict
        video.addEventListener('click', (e) => {
            // If controls area isn't being clicked directly
            e.stopPropagation();
            window.open(currentAd.url, '_blank', 'noopener,noreferrer');
        });

        mediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = currentAd.src;
        img.alt = currentAd.header;
        mediaContainer.appendChild(img);
    }

    // Enforce 7-second timer for ALL ad types
    continueBtn.disabled = true;
    let countdown = 7;
    continueBtn.innerText = `Continue in ${countdown}s`;

    const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            continueBtn.innerText = `Continue in ${countdown}s`;
        } else {
            clearInterval(timer);
            continueBtn.disabled = false;
            continueBtn.innerText = 'Continue';
        }
    }, 1000);
}

function closeActiveModalDirectlyAd(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

window.addEventListener('DOMContentLoaded', setupAdModal);

/**
 * Fetches total document counts directly from Firebase Firestore 
 * and updates the Admin Dashboard counter UI nodes.
 */
/**
 * Example: Real-time Admin Dashboard Metrics directly from Firebase Server
 */
async function syncAdminDashboardMetricsFromFirebase() {
    try {
        // Count total users
        const usersCol = collection(db, "users");
        const usersCount = await getCountFromServer(usersCol);

        // Count total products
        const productsCol = collection(db, "products");
        const productsCount = await getCountFromServer(productsCol);

        // Update UI counters if elements exist
        const totalUsersEl = document.getElementById("admin-metric-total-users");
        const totalProductsEl = document.getElementById("admin-metric-total-products");

        if (totalUsersEl) totalUsersEl.innerText = usersCount;
        if (totalProductsEl) totalProductsEl.innerText = productsCount;

        console.log(`Metrics fetched: ${usersCount} users, ${productsCount} products.`);
    } catch (err) {
        console.error("Failed to fetch server counts:", err);
    }
}

/**
 * Ensures counts are loaded from Firebase when the web page boots up
 */
document.addEventListener("DOMContentLoaded", () => {
    // Delay slightly if needed to allow FortMartFirebase SDK script to finish loading
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        syncAdminDashboardMetricsFromFirebase();
    } else {
        // Fallback retry if SDK loads asynchronously
        window.addEventListener("load", () => {
            syncAdminDashboardMetricsFromFirebase();
        });
    }
});