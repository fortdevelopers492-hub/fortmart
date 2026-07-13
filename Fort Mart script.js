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

// Local System Caching Array State - Preserving Default Admin, Sarah, and Account Manager accounts
let SYSTEM_DATABASE = {
    users: [
        { uid: "admin", identityName: "Fort Mart Admin", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "Fort Mart", secretKey: "Fortmart492#", avatar: "Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Core Operations", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified" },
        { uid: "account_manager", identityName: "Fort Mart Account Manager", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "Fort Mart 2", secretKey: "Fortmart492#", avatar:"Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Account Manager", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified"  }
    ],
    products: [],
    chats: [],
    networkSuiteEntities: [],
    pinnedLeaderboard: [] 
};

// Destructure references comprehensively from your main global Firebase configuration script
const { db, collection, onSnapshot, doc, setDoc, updateDoc } = window.FortMartFirebase;

/**
 * REAL-TIME DATABASE LIFECYCLE LISTENERS
 * Syncs Firestore changes into your SYSTEM_DATABASE cache while preserving hardcoded defaults.
 */
function initializeRealtimeSystemSync() {
    // 1. Live Sync Users (Appends Firebase users while preserving all three hardcoded baseline profiles securely)
    onSnapshot(collection(db, "users"), (snapshot) => {
        // Reset to default accounts first to avoid infinite duplication arrays on snapshot triggers
        SYSTEM_DATABASE.users = [
            { uid: "admin", identityName: "Fort Mart Admin", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "Fort Mart", secretKey: "Fortmart492#", avatar: "Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Core Operations", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified" },
            { uid: "account_manager", identityName: "Fort Mart Account Manager", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "Fort Mart 2", secretKey: "Fortmart492#", avatar:"Fort Mart Logo Circle Cropped.png", businessName: "Fort Mart Account Manager", businessInfo: "Primary global system marketplace monitoring profile.", status: "verified"  }
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
            <input type="text" id="auth-signin-identifier" class="form-field-control" placeholder="Input registered email address" oninput="if(typeof executeLiveProfilePictureLookup === 'function') executeLiveProfilePictureLookup(this.value)">
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
            <input type="text" id="reg-identifier" class="form-field-control" placeholder="Input email address" oninput="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <div id="err-reg-step1-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Input all information properly</div>
        </div>
        
        <div class="form-checkbox-group-row margin-top-xs">
            <input type="checkbox" id="chk-reg-terms" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <label for="chk-reg-terms" style="font-size:0.82rem;">I accept the <a href="fort mart terms and conditions.html" target="_blank">terms and conditions</a></label>
        </div>
        <div class="form-checkbox-group-row margin-top-xs">
            <input type="checkbox" id="chk-reg-privacy" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <label for="chk-reg-privacy" style="font-size:0.82rem;">I accept the <a href="fort mart privacy policy.html" target="_blank">privacy policy</a></label>
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
                <input type="text" id="reg-personal-name" class="form-field-control" placeholder="Enter personal name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
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
                <input type="text" id="reg-personal-name" class="form-field-control" placeholder="Enter personal name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
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
                <input type="text" id="reg-personal-name" class="form-field-control" placeholder="Enter operational manager name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Inventory Specification:</label>
                <input type="text" id="reg-biz-deals" class="form-field-control" placeholder="e.g. Mobile Accessories, Clothing apparel, Laptops" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
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
    if(fileNode && fileNode.files && fileNode.files[0]) {
        const readerInstance = new FileReader();
        readerInstance.onload = function(e) {
            SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = e.target.result;
        };
        readerInstance.readAsDataURL(fileNode.files[0]);
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

    if(submitBtn) submitBtn.disabled = true;

    const assignedUidStr = "user_" + Date.now();
    const finalNewUserRecord = {
        uid: assignedUidStr,
        identityName: SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
        accountType: SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType,
        country: SIGNUP_WIZARD_TEMPORARY_OBJECT.country,
        dialingCode: SIGNUP_WIZARD_TEMPORARY_OBJECT.dialingCode,
        identifierText: SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText,
        secretKey: SIGNUP_WIZARD_TEMPORARY_OBJECT.secretKey,
        password: SIGNUP_WIZARD_TEMPORARY_OBJECT.secretKey,
        avatar: SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar || "", 
        verificationStatus: "verified",
        businessName: SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName || SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
        businessInfo: SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo || "No descriptions detailed yet."
    };

    try {
        // Safe document commits directly down to Firebase Firestore cloud instances
        await setDoc(doc(db, "users", assignedUidStr), finalNewUserRecord);
        
        const welcomeThreadId = "chat_admin_" + assignedUidStr;
        const systemAdminWelcomeThreadNode = {
            chatId: welcomeThreadId,
            dynamicParticipants: ["admin", assignedUidStr],
            messageLog: [
                { 
                    mid: "wel1", 
                    senderUid: "admin", 
                    text: "Thanks for choosing Fort Mart. We are here with an amazing web app when it comes to online shopping. We wish you best of luck as you explore the market.", 
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "bold-double"
                }
            ]
        };
        await setDoc(doc(db, "chats", welcomeThreadId), systemAdminWelcomeThreadNode);
        
        // Synchronize state down to internal memory array tracking definitions
        SYSTEM_DATABASE.users.push(finalNewUserRecord);
        if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
            syncPlatformDatabaseStateToWebStorage();
        }

        APP_STATE.currentUser = finalNewUserRecord;
        
        if (typeof closeActiveModalDirectly === "function") {
            closeActiveModalDirectly('auth-modal');
        } else {
            document.getElementById("auth-modal").classList.remove("active");
        }
        
        const welcomeModal = document.getElementById("welcome-modal");
        if(welcomeModal) welcomeModal.classList.add("active");
        
    } catch (error) {
        console.error("Firebase registration failure sequence exception logging report trace:", error);
        if (feedbackElement) {
            feedbackElement.innerText = "Network Registry Error: Could not verify and sync account profile securely down to the global server.";
            feedbackElement.classList.remove("hidden-node");
        } else {
            alert("Network Registry Error: Could not verify and sync account profile securely down to the global server.");
        }
        if(submitBtn) submitBtn.disabled = false;
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
                <option value="+1">United States / Canada (+1)</option>
                <option value="+44">United Kingdom (+44)</option>
                <option value="+254">Kenya (+254)</option>
                <option value="+27">South Africa (+27)</option>
            </select>
        </div>

        <div class="form-input-container margin-top-xs">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Registration Contact (Email Address):</label>
            <input type="text" id="forgot-id" class="form-field-control" placeholder="example@domain.com">
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
    const structuralCategoryListArray = ["Trending", "Electrical Appliances", "Mobile Devices & Computers", "Home Furniture", "Fashion Clothing Apparel", "Automotive Parts & Engines", "Others"];
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
 * Fetches real-time localized listings and associated vendor profiles directly from Firestore collections.
 */
async function renderMarketplaceProductsDisplayLoop() {
    const loopDisplayTargetGrid = document.getElementById("products-display-grid");
    if(!loopDisplayTargetGrid) return;
    
    loopDisplayTargetGrid.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fort-blue-primary); width:100%;">Syncing secure inventory pipelines with cloud matrix...</div>`;
    
    let baselineCurrencyIndicatorSymbol = "₦";
    let locationFilteringCriteriaString = "Nigeria";
    
    if(APP_STATE.currentUser) {
        locationFilteringCriteriaString = APP_STATE.currentUser.country || "Nigeria";
        baselineCurrencyIndicatorSymbol = (locationFilteringCriteriaString === 'Nigeria') ? '₦' : '$';
    }
    
    let activeProductsList = [];
    let activeUsersCache = [];
    let leaderboard = [];

    try {
        // Fetch Live Collections safely from cloud platform infrastructure
        if (window.FortMartFirebase) {
            const { db, collection, getDocs } = window.FortMartFirebase;
            
            // 1. Fetch Pinned Leaderboard Config Document
            const systemMetaRef = await getDocs(collection(db, "system_metadata"));
            systemMetaRef.forEach(doc => {
                if (doc.id === "leaderboardConfig") {
                    leaderboard = doc.data().pinnedLeaderboard || [];
                }
            });
            SYSTEM_DATABASE.pinnedLeaderboard = leaderboard;

            // 2. Fetch all registered product profiles
            const productsSnapshot = await getDocs(collection(db, "products"));
            productsSnapshot.forEach(doc => {
                activeProductsList.push({ pid: doc.id, ...doc.data() });
            });
            SYSTEM_DATABASE.products = activeProductsList;

            // 3. Fetch all verified users profiles to resolve avatars and names accurately
            const usersSnapshot = await getDocs(collection(db, "users"));
            usersSnapshot.forEach(doc => {
                activeUsersCache.push({ uid: doc.id, ...doc.data() });
            });
            SYSTEM_DATABASE.users = activeUsersCache;

        } else {
            // Local memory arrays configuration fallback strategy
            activeProductsList = [...(SYSTEM_DATABASE.products || [])];
            activeUsersCache = [...(SYSTEM_DATABASE.users || [])];
            leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
        }

        // Apply strict localization bounding filters, category tags, and search matching expressions
        let computedInventoryOutputArray = activeProductsList.filter(item => {
            const structuralOwnerAccountPointer = activeUsersCache.find(u => u.uid === item.ownerUid);
            if(!structuralOwnerAccountPointer) return false;
            
            if(structuralOwnerAccountPointer.country !== locationFilteringCriteriaString) return false;
            
            if(APP_STATE.currentSelectedCategory !== 'Trending' && item.category !== APP_STATE.currentSelectedCategory) return false;
            
            if(APP_STATE.searchQuery !== '') {
                const matchTitleFlag = String(item.name).toLowerCase().includes(APP_STATE.searchQuery);
                const matchInfoFlag = String(item.info).toLowerCase().includes(APP_STATE.searchQuery);
                if(!matchTitleFlag && !matchInfoFlag) return false;
            }
            return true;
        });

        // Split arrays to arrange pinned items in primary slots safely
        let pinnedItems = computedInventoryOutputArray.filter(item => leaderboard.includes(item.pid));
        let normalItems = computedInventoryOutputArray.filter(item => !leaderboard.includes(item.pid));

        pinnedItems.sort((a, b) => leaderboard.indexOf(a.pid) - leaderboard.indexOf(b.pid));
        normalItems.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));

        let displayArrayToProcess = [...pinnedItems, ...normalItems];

        const productDisplayImage = targetedProductItemMatch.coverPhoto || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e0'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>`;

        // Fill empty listing array deficits if total matched profiles are lower than threshold metrics
        if(displayArrayToProcess.length < 20) {
            let backfillDeficitCount = 20 - displayArrayToProcess.length;
            const structuralExternalAffiliateSourcesNamesArray = ["Jumia Hub Feed", "Temu Global Logistic Feed", "Jiji Local Ad Scraping Matrix", "Konga Digital Marketplace Warehouse"];
            for(let idx = 0; idx < backfillDeficitCount; idx++) {
                let sourcePointerString = structuralExternalAffiliateSourcesNamesArray[idx % structuralExternalAffiliateSourcesNamesArray.length];
                displayArrayToProcess.push({
                    pid: `ext_mock_${idx}`,
                    ownerUid: "admin",
                    name: `[Affiliate External Entity - ${sourcePointerString}] Standard Retail Inventory Match Log Block Unit #${1042 + idx}`,
                    category: APP_STATE.currentSelectedCategory,
                    info: "Synchronized fallback inventory data stream pulled from global merchant network endpoints channels tracking configurations metrics models.",
                    price: parseFloat(2250 * (idx + 3)),
                    coverPhoto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e0'><path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z'/></svg>",
                    aiInfo: "External cross-network catalog matrix item profile baseline validation data structure trace.",
                    clickCount: 12,
                    isExternalAffiliateNodeFlag: true
                });
            }
        }

        loopDisplayTargetGrid.innerHTML = "";

        // Inject elements into DOM grid layout safely
        displayArrayToProcess.forEach((product) => {
            const contextualOwnerRecord = activeUsersCache.find(u => u.uid === product.ownerUid);
            const ownerCorporateEntityLabel = contextualOwnerRecord ? (contextualOwnerRecord.businessName || contextualOwnerRecord.identityName) : "External Global Distribution Partner Hub";
            const ownerCircularAvatarSrcString = (contextualOwnerRecord && contextualOwnerRecord.avatar) ? contextualOwnerRecord.avatar : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23718096'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
            
            const cardContainerBlockElement = document.createElement("div");
            cardContainerBlockElement.className = "product-item-card-container rounded-rect";
            
            // Look up position within the leaderboard array to use as a dynamic badge text identifier
            const pinnedPositionIndex = leaderboard.indexOf(product.pid);
            const isProductPinned = pinnedPositionIndex > -1;
            const pinnedBadgeHTML = isProductPinned ? `<span style="background:var(--fort-blue-light, #0066cc); color:white; padding:2px 6px; font-size:0.65rem; border-radius:4px; font-weight:bold; margin-left:auto;">📌 PINNED #${pinnedPositionIndex + 1}</span>` : '';
                
            cardContainerBlockElement.innerHTML = `
                <div class="poster-profile-strip" onclick="event.stopPropagation(); launchDetailedUserProfileContextOverlaySummaryModal('${product.ownerUid}')">
                    <img class="mini-profile-avatar circle-container" src="${ownerCircularAvatarSrcString}" alt="Avatar">
                    <span class="mini-profile-business-name" style="font-weight:600; font-size:0.85rem;">${ownerCorporateEntityLabel}</span>
                    ${pinnedBadgeHTML}
                </div>
                <div class="product-card-image-box" onclick="launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')">
                    <img src="${product.coverPhoto}" alt="Product Render">
                </div>
                <div class="product-card-details-block" onclick="launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')">
                    <h4 class="product-card-title">${product.name}</h4>
                    <p class="product-card-description">${String(product.info).substring(0, 85)}...</p>
                    <div class="product-card-price-tag" style="font-weight:700; color:#d32f2f;">${baselineCurrencyIndicatorSymbol}${parseFloat(product.price).toLocaleString()}</div>
                    <div class="btn-group" style="margin-top:auto;">
                        ${product.isExternalAffiliateNodeFlag ?
                            `<button class="btn-gray" style="width:100%; font-size:0.8rem;" onclick="event.stopPropagation(); alert('Redirecting external data streams securely to merchant endpoints portals.')">Visit Merchant Channel Portal</button>` :
                            `<button class="btn-blue" style="width:100%; font-size:0.8rem;" onclick="event.stopPropagation(); initialDirectMessageCommunicationPipelineSetup('${product.ownerUid}')">Message Seller</button>`
                        }
                    </div>
                </div>
            `;
            loopDisplayTargetGrid.appendChild(cardContainerBlockElement);
        });

    } catch (err) {
        console.error("Critical crash tracing registry rows compilation mapping execution loop:", err);
        loopDisplayTargetGrid.innerHTML = `<div style="color:red; text-align:center; padding:20px; width:100%;">Infrastructure Pipeline Sync Fault: Unable to display real-time listings map rows.</div>`;
    }
}

/**
 * EXPANDED SPECIFICATIONS VIEW MODEL
 * Looks up tracking parameters directly from Firestore using the verified Product Id to avoid discrepancies.
 */
async function launchComprehensiveProductSpecificationsExpandedModalView(productIdTokenKey) {
    if(!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }
    
    const detailOverlayBodyNode = document.getElementById("product-detail-modal-body");
    if (!detailOverlayBodyNode) return;

    detailOverlayBodyNode.innerHTML = `<div style="text-align:center; padding:40px; color:var(--fort-blue-dark);">Fetching complete product metadata from cloud servers...</div>`;
    document.getElementById("product-detail-modal").classList.add("active");

    try {
        let targetedProductItemMatch = null;
        let operationalTargetProfileOwnerRecord = null;

        // Fetch exact matched document live from cloud vectors to eliminate data discrepancies
        if (window.FortMartFirebase) {
            const { db, doc, getDoc, setDoc } = window.FortMartFirebase;
            
            const productDocRef = doc(db, "products", productIdTokenKey);
            const productSnapshot = await getDoc(productDocRef);
            
            if (productSnapshot.exists()) {
                targetedProductItemMatch = { pid: productSnapshot.id, ...productSnapshot.data() };
                
                // Track click conversions increments directly on live database document safely
                targetedProductItemMatch.clickCount = (targetedProductItemMatch.clickCount || 0) + 1;
                await setDoc(productDocRef, { clickCount: targetedProductItemMatch.clickCount }, { merge: true });
            }
        }

        // Mock lookup configurations fallback boundary parameters strategy
        if (!targetedProductItemMatch) {
            targetedProductItemMatch = SYSTEM_DATABASE.products.find(p => p.pid === productIdTokenKey) || {
                pid: productIdTokenKey, ownerUid: "admin", name: "Synchronized Affiliate System Feed Record", category: "General Ledger", info: "Fallback inventory trace mapping record placeholder data structural component metrics analysis logs references.", price: 12500, coverPhoto: "", aiInfo: "External baseline mapping tracking references model arrays values.", clickCount: 1
            };
        }

        // Fetch corresponding merchant owner document explicitly to ensure structural zero mismatched states
        if (window.FortMartFirebase && !productIdTokenKey.startsWith("ext_mock_")) {
            const { db, doc, getDoc } = window.FortMartFirebase;
            const userSnapshot = await getDoc(doc(db, "users", targetedProductItemMatch.ownerUid));
            if (userSnapshot.exists()) {
                operationalTargetProfileOwnerRecord = { uid: userSnapshot.id, ...userSnapshot.data() };
            }
        }

        if (!operationalTargetProfileOwnerRecord) {
            operationalTargetProfileOwnerRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetedProductItemMatch.ownerUid) || {
                businessName: "External Distribution Partner Network", country: "Nigeria", avatar: ""
            };
        }

        let baselineCurrencySymbolSign = (APP_STATE.currentUser.country === 'Nigeria') ? '₦' : '$';
        let operationalActionControlsLayoutStringHTML = "";
        
        if(APP_STATE.currentUser.uid === targetedProductItemMatch.ownerUid) {
            operationalActionControlsLayoutStringHTML = `
                <button class="btn-gray" onclick="closeActiveModalDirectly('product-detail-modal'); switchSettingsSection('my-products'); navigateToPage('my-account');">⚙️ Manage Details & Inventory Post Structure</button>
            `;
        } else {
            operationalActionControlsLayoutStringHTML = `
                <button class="btn-blue" onclick="closeActiveModalDirectly('product-detail-modal'); initialDirectMessageCommunicationPipelineSetup('${targetedProductItemMatch.ownerUid}')">💬 Message Seller</button>
            `;
        }

        let adminPinControlHTML = "";
        const isUserAdmin = (APP_STATE.currentUser.uid === 'admin');
        const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
        
        if (isUserAdmin) {
            const isCurrentPinned = leaderboard.includes(targetedProductItemMatch.pid);
            adminPinControlHTML = `
                <div style="background: #edf2f7; border: 1px dashed var(--fort-blue-primary); padding: 12px; border-radius: 6px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 0.85rem; font-weight: bold; color: var(--fort-blue-dark);">🛡️ Admin Controls: Listing Pin Option</span>
                        <button class="${isCurrentPinned ? 'btn-gray' : 'btn-blue'}" style="padding: 6px 12px; font-size: 0.8rem; font-weight: bold;"
                            onclick="executeToggleProductPinState('${targetedProductItemMatch.pid}')">
                            ${isCurrentPinned ? '🛑 Unpin Listing' : '📌 Pin to Top'}
                        </button>
                    </div>
                    <button class="btn-blue" style="width: 100%; padding: 6px; font-size: 0.8rem; font-weight: bold; margin-top: 4px;" 
                        onclick="launchPinnedProductsLeaderboardModal()">
                        🏆 Open Pinned Products Leaderboard
                    </button>
                </div>
            `;
        }
        
        const productDisplayImage = targetedProductItemMatch.coverPhoto || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e0'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>`;
        const vendorAvatarImage = operationalTargetProfileOwnerRecord.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

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
            alert("Administrative Action Blocked: The leaderboard has hit its maximum limit of 20 slots.");
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
            // Safe extraction handling fallback for Firebase native numerical IDs or date string codes
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
        
        const lastMessageLogEntry = thread.messageLog[thread.messageLog.length - 1];
        let previewTextLineString = "Click thread node to initiate workspace session.";
        if (lastMessageLogEntry) {
            if (lastMessageLogEntry.isFile) {
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
        alert("System Architecture Constraint Notice: Disallowed executing messenger loop initialization pipelines pointing to tracking origin logged profile instance identifiers values.");
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

/**
 * CACHE ROUTINE: Reads message arrays from browser cache layer to shield scroll events from remote calls
 */
function getChannelConversationMemoryCache(currentUserId, activePartnerId) {
    try {
        const cachedBlob = localStorage.getItem(`fortmart_msg_cache_${currentUserId}_${activePartnerId}`);
        return cachedBlob ? JSON.parse(cachedBlob) : null;
    } catch (e) {
        console.error("Cache memory read structural block error: ", e);
        return null;
    }
}

/**
 * CACHE ROUTINE: Writes and completely commits message arrays to client hardware memory blocks
 */
function setChannelConversationMemoryCache(currentUserId, activePartnerId, messagesArray) {
    try {
        localStorage.setItem(`fortmart_msg_cache_${currentUserId}_${activePartnerId}`, JSON.stringify(messagesArray));
    } catch (e) {
        console.error("Cache memory storage register allocation fault: ", e);
    }
}

/**
 * NEW LOGIC LAYER: Hooks live real-time streams with Firebase, loading cache instantly to guard against scroll lag
 */
function initializeFirebaseRealtimeMessageStream(currentUserId, activePartnerId) {
    if (typeof ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER === "function") {
        ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER();
        ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER = null;
    }

    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(currentUserId) && c.dynamicParticipants.includes(activePartnerId));
    if (!operationalThreadRecordData) return;

    // 1. Immediately read temporary local device cache so scroll views don't trigger server calls
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

    // 2. Open up real-time network stream pipeline listener
    ACTIVE_CHAT_REALTIME_UNSUBSCRIBE_WORKER = onSnapshot(queryConstraints, (querySnapshot) => {
        const freshlySynchronizedMessages = [];
        
        querySnapshot.forEach((docNode) => {
            const dataPayload = docNode.data();
            
            // Re-convert timestamps gracefully to human configurations layout strings
            let resolvedTimeString = dataPayload.timestamp;
            if (dataPayload.serverTimestamp && typeof dataPayload.serverTimestamp.toDate === 'function') {
                resolvedTimeString = dataPayload.serverTimestamp.toDate().toLocaleTimeString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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
                deletedBy: dataPayload.deletedBy || []
            });
        });

        // 3. STIPULATION: New network reads completely replace former cache maps
        operationalThreadRecordData.messageLog = freshlySynchronizedMessages;
        setChannelConversationMemoryCache(currentUserId, activePartnerId, freshlySynchronizedMessages);
        
        // Re-render display layout lists cleanly
        refreshMessengerActiveStreamBubblesDisplayList();
        renderUserConversationsLogRoster();
    }, (errorTrace) => {
        console.error("Firebase Snapshot listener connection failure boundary condition: ", errorTrace);
    });
}

function activateMessengerConversationWorkspaceSessionBlock(targetCounterpartyUidValue) {
    // Responsive View Handling Validation
    if (window.innerWidth <= 768) {
        APP_STATE.deviceMode = 'phone';
    } else {
        APP_STATE.deviceMode = 'laptop';
    }

    APP_STATE.activeChatTargetUserHash = targetCounterpartyUidValue;
    
    document.getElementById("chat-pane-empty-notice").classList.add("hidden-node");
    const activeWorkspaceBlockNode = document.getElementById("chat-pane-active-view");
    activeWorkspaceBlockNode.classList.remove("hidden-node");
    
    // Toggle mobile screen slider styling class dynamically matching your responsive layout rules
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
        
        // Connect real-time synchronization pipelines while protecting user interaction scopes via cache
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
        if (msg.deletedBy && msg.deletedBy.includes(APP_STATE.currentUser.uid)) return;

        const outboundFlagCondition = msg.senderUid === APP_STATE.currentUser.uid;
        const bubbleWrapperElementNode = document.createElement("div");
        bubbleWrapperElementNode.className = `chat-bubble-node rounded-rect ${outboundFlagCondition ? 'outgoing-msg' : 'incoming-msg'}`;
        
        let dynamicTicksLayoutHTML = "";
        if(outboundFlagCondition) {
            if(msg.status === 'bold-double') {
                dynamicTicksLayoutHTML = `<span class="tick-mark-node seen">✓✓</span>`;
            } else if(msg.status === 'double') {
                dynamicTicksLayoutHTML = `<span class="tick-mark-node">✓✓</span>`;
            } else {
                dynamicTicksLayoutHTML = `<span class="tick-mark-node">✓</span>`;
            }
        }
        
        let bodyLayoutHTML = "";
        let downloadControlHTML = "";
        
        if (msg.isFile) {
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
            downloadControlHTML = `<button class="msg-action-btn" onclick="executeMessageFileDownloadTracker('${msg.mid}')">📥 Download</button>`;
        } else {
            bodyLayoutHTML = `<p style="word-break:break-word;">${msg.text}</p>`;
        }
        
        let deleteForAllControlHTML = "";
        if (outboundFlagCondition) {
            deleteForAllControlHTML = `<button class="msg-action-btn" style="color:#c53030; font-weight:700;" onclick="executeSelectedBubbleMessagePurgeForAll('${msg.mid}')">💥 Delete for All</button>`;
        }
        
        bubbleWrapperElementNode.innerHTML = `
            ${bodyLayoutHTML}
            <div class="msg-meta-row">
                <span>${msg.timestamp}</span> 
                ${dynamicTicksLayoutHTML}
            </div>
            <div class="msg-hover-actions">
                <button class="msg-action-btn" onclick="executeMessageTextCopyClipboard('${msg.mid}')">📋 Copy</button>
                ${downloadControlHTML}
                <button class="msg-action-btn" style="color:#9b2c2c;" onclick="executeSelectedBubbleMessagePurge('${msg.mid}')">🗑️ Delete</button>
                ${deleteForAllControlHTML}
            </div>
        `;
        streamTargetBoxNode.appendChild(bubbleWrapperElementNode);
    });
    
    streamTargetBoxNode.scrollTop = streamTargetBoxNode.scrollHeight;
}

/**
 * CORE WRITE IMPLEMENTATION: Saves directly into Firebase Firestore infrastructure
 */
async function sendChatMessageDirect() {
    const textInputNodeElement = document.getElementById("chat-text-input-field");
    if (!textInputNodeElement) return;
    
    const enteredMessageTextString = textInputNodeElement.value.trim();
    if(enteredMessageTextString === "" || !APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;
    
    // --- FEATURE: EXECUTE DISPATCH BROADCAST PROCESSOR PIPELINES ---
    if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
        executeSystemWideBroadcastTransmission(enteredMessageTextString, null);
        textInputNodeElement.value = "";
        return;
    }
    
    if(APP_STATE.activeChatTargetUserHash === 'admin') {
         alert("The Fort Mart profile can't be replied.");
         textInputNodeElement.value = "";
         return;
    }
    
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if(operationalThreadRecordData) {
        textInputNodeElement.value = "";

        const ninetyDayRetentionHorizonMs = 90 * 24 * 60 * 60 * 1000;
        const expectedAutoDeletionDeadlineDate = new Date(Date.now() + ninetyDayRetentionHorizonMs);

        const messagePayload = {
            chatId: operationalThreadRecordData.chatId,
            senderUid: APP_STATE.currentUser.uid,
            text: enteredMessageTextString,
            status: "single",
            isFile: false,
            isImage: false,
            isVideo: false,
            fileData: null,
            deletedBy: [],
            autoDeleteAt: expectedAutoDeletionDeadlineDate
        };

        // Write directly to cloud Firebase backend
        if (window.FortMartFirebase) {
            try {
                const { db, collection, addDoc, serverTimestamp } = window.FortMartFirebase;
                await addDoc(collection(db, "messages"), {
                    ...messagePayload,
                    serverTimestamp: serverTimestamp()
                });
            } catch (err) {
                console.error("Database tracking fault dispatching payload message cluster:", err);
            }
        }
        
        executeAutoReplyEvaluationProcessFrame(operationalThreadRecordData);
    }
}

function handleMessageAttachedFileSelectionEvent(inputNodeContextElement) {
    if (!inputNodeContextElement.files || inputNodeContextElement.files.length === 0) return;
    if (!APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;
    if (APP_STATE.activeChatTargetUserHash === 'admin') {
         alert("The Fort Mart profile can't be replied.");
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

            const ninetyDayRetentionHorizonMs = 90 * 24 * 60 * 60 * 1000;
            const expectedAutoDeletionDeadlineDate = new Date(Date.now() + ninetyDayRetentionHorizonMs);

            const messagePayload = {
                chatId: operationalThreadRecordData.chatId,
                senderUid: APP_STATE.currentUser.uid,
                text: singleFileReference.name,
                status: "single",
                isFile: true,
                isImage: checkIsImageFormatCondition,
                isVideo: checkIsVideoFormatCondition,
                fileData: readerEvent.target.result,
                deletedBy: [],
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
                }
            }
            
            executeAutoReplyEvaluationProcessFrame(operationalThreadRecordData);
        }
    };
    
    fileStorageProcessingReader.readAsDataURL(singleFileReference);
}

/**
 * --- FEATURE: ADMIN BROADCAST ROUTING SYSTEM ENGINE ---
 * Writes broadcast nodes dynamically directly into the Firestore messaging context logs
 */
async function executeSystemWideBroadcastTransmission(textPayloadString, filePackageConfigObject) {
    const targetGroupString = APP_STATE.activeChatTargetUserHash === 'broadcast_personal' ? 'personal' : 'business';
    const destinationAccountsArray = SYSTEM_DATABASE.users.filter(u => u.accountType === targetGroupString && u.uid !== 'admin');
    if (destinationAccountsArray.length === 0) {
        alert("System Notice: Broadcast processing aborted. Target account dataset matches zero profile indices records.");
        return;
    }
    
    if (!window.FortMartFirebase) {
        alert("Firebase infrastructure not configured.");
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
                status: "single",
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
        alert(`Broadcast routed successfully to all ${destinationAccountsArray.length} active ${targetGroupString} profile logs.`);
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

    alert("Text Copied Successfully");
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
                        status: "bold-double",
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
        alert("Personal Accounts can't upload products.");
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
                <option value="Others">Others</option>
            </select>
        </div>
        <div class="form-input-container">
            <label>Primary Short Public Marketing Overview Description (Max 100 Chars):</label>
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

/**
 * Final Submission: Gathers fields and commits record details to Firestore
 */
function executePipelineCommitNewInventoryPostRecord() {
    const name = document.getElementById("newprod-name").value.trim();
    const cat = document.getElementById("newprod-cat").value;
    const info = document.getElementById("newprod-info").value.trim();
    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const aiInfo = document.getElementById("newprod-aiinfo").value.trim();
    const priceRaw = document.getElementById("newprod-price").value;

    if(name === "" || info === "" || priceRaw === "" || !imageInput.files[0]) {
        alert("All compulsory info must be imputed.");
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

    // Save to local tracked state
    SYSTEM_DATABASE.products.push(finalProductInstanceObjectNode);

    // Sync live payload changes directly up to Firestore if layer configuration is present
    if (window.FortMartFirebase) {
        const { db, doc, setDoc } = window.FortMartFirebase;
        setDoc(doc(db, "products", finalProductInstanceObjectNode.pid), finalProductInstanceObjectNode)
            .catch(err => console.error("Cloud inventory post storage failure synchronization traceback:", err));
    }

    syncPlatformDatabaseStateToWebStorage();
    
    closeActiveModalDirectly('auth-modal');
    alert("System Pipeline Core Notification Process Switch Event Alert: Product Uploading Request Sent Succesfully.");
    
    renderMarketplaceProductsDisplayLoop();
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
            alert("System Profile Parameters Overwritten and Synced Successfully.");
        }
        
    } catch (cloudWriteExceptionError) {
        console.error("Firebase Cloud Storage Core Fields Overwrite Failure Event Exception:", cloudWriteExceptionError);
        alert("Cloud transaction boundary mismatch runtime error. Check device tracking configurations.");
    }
}

/**
 * CORE MODULE FIREBASE SYNC: Fetches and displays the logged-in user's 
 * products in real-time from the Firestore collection.
 */
function renderAccountInventoryLedgerManagementDashboardGrid() {
    const listContainerNodeElement = document.getElementById("my-products-list-container");
    if (!listContainerNodeElement) return;
    
    listContainerNodeElement.innerHTML = "";
    
    if (!APP_STATE.currentUser) return;

    // Check availability of Firebase configuration instances
    if (window.FortMartFirebase || window.firebase) {
        const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
        
        if (window.FortMartFirebase) {
            const { collection, query, where, onSnapshot } = window.FortMartFirebase;
            
            // Build query matching owner UID parameters
            const userProductsQuery = query(
                collection(dbRefInstance, "products"), 
                where("ownerUid", "==", APP_STATE.currentUser.uid)
            );
            
            // Establish real-time listener context
            onSnapshot(userProductsQuery, (querySnapshot) => {
                populateDashboardInventoryGridItems(listContainerNodeElement, querySnapshot);
            }, (error) => {
                console.error("Error listening to user products stream:", error);
            });
        } else {
            // Legacy Firebase SDK Firestore implementation
            dbRefInstance.collection("products")
                .where("ownerUid", "==", APP_STATE.currentUser.uid)
                .onSnapshot((querySnapshot) => {
                    populateDashboardInventoryGridItems(listContainerNodeElement, querySnapshot);
                }, (error) => {
                    console.error("Error fetching user products collection snapshot:", error);
                });
        }
    }
}

/**
 * Helper utility to build the individual DOM elements from database snapshot payloads
 */
function populateDashboardInventoryGridItems(containerElement, querySnapshot) {
    containerElement.innerHTML = "";
    
    if (querySnapshot.empty) {
        containerElement.innerHTML = `<div style="padding:16px; color:var(--fort-gray-slate); font-size:0.85rem;"><p>You have no posted products.</p></div>`;
        return;
    }
    
    querySnapshot.forEach((docSnapshot) => {
        const item = docSnapshot.data();
        const productId = docSnapshot.id; // Extract doc id string from Firebase collection reference
        
        const itemRowRowStripContainerElementNode = document.createElement("div");
        itemRowRowStripContainerElementNode.className = "rounded-rect";
        itemRowRowStripContainerElementNode.style.display = "flex";
        itemRowRowStripContainerElementNode.style.alignItems = "center";
        itemRowRowStripContainerElementNode.style.justifyContent = "between";
        itemRowRowStripContainerElementNode.style.padding = "12px";
        itemRowRowStripContainerElementNode.style.border = "1px solid var(--fort-gray-border)";
        itemRowRowStripContainerElementNode.style.marginBottom = "10px";
        itemRowRowStripContainerElementNode.style.backgroundColor = "var(--fort-white-snow)";
        
        itemRowRowStripContainerElementNode.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; flex:1;">
                <img src="${item.coverPhoto || ''}" style="width:40px; height:40px; object-fit:cover;" class="rounded-rect" alt="Thumb">
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
    });
}

/**
 * Step 1: Launches the password verification screen to confirm account ownership.
 */
function launchEditProductInventoryModalFormLayoutShell(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
    if (!targetProduct) {
        alert("Product record could not be found inside indexed parameters.");
        return;
    }

    const modalContentTargetNode = document.getElementById("auth-modal-content");
    if (!modalContentTargetNode) return;

    modalContentTargetNode.innerHTML = `
        <h3>Enter Current Password (Step 1 of 2)</h3>
        
        <div class="form-input-container margin-top-sm">
            <label>Active Password:</label>
            <input type="password" id="edit-verify-password" class="form-field-control" placeholder="Enter password to verify ownership context">
            
            <div id="err-edit-reauth-msg" class="text-danger-alert hidden-node">Incorrect Password</div>
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

/**
 * Validates the password inline and proceeds to Step 2
 */
function verifyEditPasswordAndProceedFirebase(targetProductIdKeyValueString) {
    const enteredPassword = document.getElementById("edit-verify-password").value;
    const errNode = document.getElementById("err-edit-reauth-msg");
    
    errNode.classList.add("hidden-node");
    
    if (enteredPassword !== APP_STATE.currentUser.secretKey) {
        errNode.innerText = "Incorrect Password"; 
        errNode.classList.remove("hidden-node"); 
        return;
    }
    
    // Proceed to Step 2 Form Presentation
    renderActualEditProductFormFirebase(targetProductIdKeyValueString);
}

/**
 * Step 2: Displays the full inventory overwriting form layout container
 */
function renderActualEditProductFormFirebase(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
    if (!targetProduct) return;

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
                <option value="Others" ${targetProduct.category === 'Others' ? 'selected' : ''}>Others</option>
            </select>
        </div>
        
        <div class="form-input-container">
            <label>Primary Marketing Summary Description (Max 100 Chars) [Compulsory Overwrite]:</label>
            <input type="text" id="editprod-info" class="form-field-control" maxlength="100" value="${targetProduct.info || ''}">
        </div>
        
        <div class="form-input-container-image" style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom:6px; font-weight:700;">Update Product Asset Image Coverage View</label>
            <div class="fort-avatar-circle-container" style="width: 120px; height: 120px; border-radius: 8px; margin-bottom:10px;">
                <img id="imagePreview" class="fort-avatar-circle-img" src="${targetProduct.coverPhoto || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23718096\'><path d=\'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z\'/></svg>'}" alt="Image Preview">
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

/**
 * Captures image changes for the dynamic product layout panel using the local image picker.
 */
function processWizardProductImageSelectionDirectly() {
    const fileNode = document.getElementById("imageInput");
    if(fileNode && fileNode.files && fileNode.files[0]) {
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
    
    if(name === "" || info === "" || priceRaw === "" || !APP_CACHE.temporaryProductCoverPhotoUrl || APP_CACHE.temporaryProductCoverPhotoUrl === "") {
        alert("All compulsory info items parameters must be filled to trigger core system mutations.");
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

        // Update local database array sync
        const idx = SYSTEM_DATABASE.products.findIndex(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
        if(idx !== -1) {
            SYSTEM_DATABASE.products[idx] = { ...SYSTEM_DATABASE.products[idx], ...productUpdatePayload };
            syncPlatformDatabaseStateToWebStorage();
        }
        
        // Write modifications downstream to Cloud Firebase collection endpoints
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
        
        if (typeof showAlertModal === "function") {
            showAlertModal("Overwrites Saved", "Product configurations uploaded successfully.");
        } else {
            alert("Product Details Updated Successfully");
        }
        
        // Trigger live streams updates
        listenForRealTimeMarketplaceSnapshots();
        
    } catch (firebaseCloudMutationExceptionError) {
        console.error("Firebase Collection Product Mutation Failure Exception Log:", firebaseCloudMutationExceptionError);
        alert("Cloud storage submission engine pipeline execution mismatch error encountered.");
    }
}

/**
 * Extends working delete feature with inline password verification inside the confirmation modal 
 * before purging data from local repositories and remote cloud streams.
 */
function executeDeletePlatformInventoryItemListingPostRecord(targetProductIdKeyValueString) {
    const confirmationPromptMessage = "Are you sure you want to delete this product?";
    
    displayConfirmationModalOverlayAction(confirmationPromptMessage, async () => {
        try {
            // 1. Delete from Cloud Firestore first if online configurations are present
            if (window.FortMartFirebase || window.firebase) {
                const dbRefInstance = window.FortMartFirebase ? window.FortMartFirebase.db : window.firebase.firestore();
                if (window.FortMartFirebase) {
                    const { doc, deleteDoc } = window.FortMartFirebase;
                    await deleteDoc(doc(dbRefInstance, "products", targetProductIdKeyValueString));
                } else {
                    await dbRefInstance.collection("products").doc(targetProductIdKeyValueString).delete();
                }
            }
            
            // 2. Splice and remove from local application memory arrays safely
            const structuralIndexMatchPointerId = SYSTEM_DATABASE.products.findIndex(p => p.pid === targetProductIdKeyValueString);
            if (structuralIndexMatchPointerId !== -1) {
                SYSTEM_DATABASE.products.splice(structuralIndexMatchPointerId, 1);
                syncPlatformDatabaseStateToWebStorage();
            }

            alert("Product successfully purged from system and Cloud Infrastructure layers.");
            
            // 3. Trigger user interface lifecycle rendering view loops
            if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
                renderAccountInventoryLedgerManagementDashboardGrid();
            }
            if (typeof renderMarketplaceProductsDisplayLoop === "function") {
                renderMarketplaceProductsDisplayLoop();
            }
            if (typeof listenAndRenderUserInventoryFromFirebase === "function") {
                listenAndRenderUserInventoryFromFirebase();
            }

        } catch (err) {
            console.error("Error executing backend document purge context execution mutation:", err);
            alert("Failed to securely purge matching collection element from network streams.");
        }
    });
}

/**
 * Enhanced Confirmation Modal Overlay Action incorporating an inline security 
 * validation form layout with visibility controls.
 */
function displayConfirmationModalOverlayAction(messageStringText, callbackFunctionReference) {
    const confirmModalNode = document.getElementById("confirm-modal");
    if (!confirmModalNode) return;

    // Inject password confirmation fields and elements directly inside the text node block
    document.getElementById("confirm-modal-text").innerHTML = `
        <p style="margin-bottom: 12px; font-weight: 500;">${messageStringText}</p>
        
        <div class="form-input-container" style="text-align: left; margin-top: 14px;">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--fort-blue-dark);">Confirm Password:</label>
            <input type="password" id="delete-verify-password" class="form-field-control" placeholder="Enter password to authorize permanent deletion" style="margin-top: 4px;">
            
            <div id="err-delete-reauth-msg" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px; display: none;">Incorrect Password Phrase</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-delete-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'delete-verify-password')">
            <label for="chk-delete-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>
    `;

    confirmModalNode.classList.add("active");
    
    const yesButtonNode = document.getElementById("confirm-yes-btn");
    const noButtonNode = document.getElementById("confirm-no-btn");
    
    // Unbind prior event loops to prevent payload stack leaking duplicate clicks
    const cleanYesNode = yesButtonNode.cloneNode(true);
    const cleanNoNode = noButtonNode.cloneNode(true);
    yesButtonNode.parentNode.replaceChild(cleanYesNode, yesButtonNode);
    noButtonNode.parentNode.replaceChild(cleanNoNode, noButtonNode);
    
    cleanYesNode.addEventListener("click", () => {
        const enteredPassword = document.getElementById("delete-verify-password").value;
        const errNode = document.getElementById("err-delete-reauth-msg");
        
        // Match string parameter against current user database key credentials 
        if (enteredPassword !== APP_STATE.currentUser.secretKey) {
            errNode.style.display = "block";
            errNode.classList.remove("hidden-node");
            return;
        }
        
        errNode.style.display = "none";
        errNode.classList.add("hidden-node");
        
        confirmModalNode.classList.remove("active");
        callbackFunctionReference();
    });

    cleanNoNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
    });
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
        alert("Missing system criteria: All registration inputs are required.");
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
        
        alert("Admin Framework Master Ledger Synchronization Engine: Added entity block safely.");
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
function launchDetailedUserProfileContextOverlaySummaryModal(userIdTokenKeyParameterValue) {
    const targetUserObjMatchRecord = SYSTEM_DATABASE.users.find(u => u.uid === userIdTokenKeyParameterValue || u.id === userIdTokenKeyParameterValue);
    if(!targetUserObjMatchRecord) return;
    const standardModalBodyElementNode = document.getElementById("product-detail-modal-body");
    if (!standardModalBodyElementNode) return;
    
    let subAccountClassificationMetadataDetailsBlockHTML = "";
    if(targetUserObjMatchRecord.accountType === 'business' || targetUserObjMatchRecord.type === 'business') {
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
    if (APP_STATE.currentUser && (APP_STATE.currentUser.uid === 'admin' || APP_STATE.currentUser.id === 'admin')) {
        const rawVerificationCode = targetUserObjMatchRecord.UserAccountAuthenticationVerificationCode || targetUserObjMatchRecord.verificationCode || 'N/A';
        const currentGovernanceStatus = targetUserObjMatchRecord.verificationStatus || targetUserObjMatchRecord.status || 'unverified';
        const currentAccountType = targetUserObjMatchRecord.accountType || targetUserObjMatchRecord.type || 'personal';
        const registrationContactIdentifier = targetUserObjMatchRecord.identifierText || '';
        const securityAccessPassword = targetUserObjMatchRecord.secretKey || targetUserObjMatchRecord.password || '';
        
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
                    <div class="profile-product-item-row" style="display:flex; align-items:center; gap:12px; padding:8px; background:var(--fort-white-snow); border:1px solid var(--fort-gray-border); border-radius:6px; cursor:pointer; transition:background 0.2s;" onclick="launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')" onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='var(--fort-white-snow)'">
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
            productsGridItemsHTML = `<p style="font-size:0.88rem; color:var(--fort-gray-slate); font-style:italic; margin:0; padding:4px;">This business user hasn't uploaded any active product catalog listings yet.</p>`;
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

    let userProfilePhotoSrc = targetUserObjMatchRecord.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    
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