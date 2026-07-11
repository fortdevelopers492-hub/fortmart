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
        nameDisplayLabelNode.innerText = APP_STATE.currentUser.identityName || APP_STATE.currentUser.username || "N/A"; 
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
 * Stage 1 Re-authentication verification modal framework step with Password & Verification Token verification checks
 */
function openProfileEditWizard(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content"); 
    if (!modalTargetNode) return;

    modalTargetNode.innerHTML = `
        <h3>Enter Authorization Credentials (Step 1 of 2)</h3>
        <p style="font-size:0.85rem; color:var(--fort-blue-dark); margin-top:4px;">Confirm your secret security keys block to allow modifications parameters access:</p>
        
        <div class="form-input-container margin-top-sm">
            <label style="font-size:0.8rem; font-weight:700;">Account Secret Password:</label>
            <input type="password" id="profile-reauth-key" class="form-field-control" placeholder="Enter active password phrase">
        </div>

        <div class="form-input-container margin-top-xs">
            <label style="font-size:0.8rem; font-weight:700;">Security Verification Code Key:</label>
            <input type="text" id="profile-verification-code-key" class="form-field-control" placeholder="Enter security verification matrix token" autocomplete="off">
            <div id="err-profile-reauth-msg" class="text-danger-alert hidden-node">Incorrect Identity Token Credentials Provided.</div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button> 
            <button onclick="executeValidateProfileReauthSessionTokenStep('${targetFieldNameStringTokenKey}')" class="btn-blue">Verify Credentials</button>
        </div>
    `; 
    document.getElementById("auth-modal").classList.add("active"); 
}

/**
 * Validates baseline input credential properties against active profiles datasets.
 */
function executeValidateProfileReauthSessionTokenStep(targetFieldNameStringTokenKey) {
    const enteredPass = document.getElementById("profile-reauth-key").value; 
    const enteredCodeToken = document.getElementById("profile-verification-code-key").value.trim();
    const errNode = document.getElementById("err-profile-reauth-msg"); 
    if (!errNode) return;

    errNode.classList.add("hidden-node"); 
    
    const validPasswordPattern = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password;
    
    // Safety check fallback matching database rules values if verificationCode elements are missing
    const secondaryVerificationToken = APP_STATE.currentUser.verificationCode || "4920";

    if(enteredPass !== validPasswordPattern) { 
        errNode.innerText = "Security Intercept: Account access password mismatch error."; 
        errNode.classList.remove("hidden-node"); 
        return; 
    }

    if(enteredCodeToken === "" || enteredCodeToken !== secondaryVerificationToken) {
        errNode.innerText = "Security Intercept: Invalid security verification key code index.";
        errNode.classList.remove("hidden-node");
        return;
    }
    
    executeFinalProfileDataEditCommitStepThreeFormLayout(targetFieldNameStringTokenKey);
}

/**
 * Displays input layout forms for the selected field workspace context.
 */
function executeFinalProfileDataEditCommitStepThreeFormLayout(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content"); 
    if (!modalTargetNode) return;

    let injectionMarkupFormHTML = ""; 
    APP_CACHE.temporaryProfileAvatarDataUrl = ""; 
    
    if(targetFieldNameStringTokenKey === 'username') { 
        injectionMarkupFormHTML = `
            <label>Define New Profile User Identity Display Label:</label>
            <input type="text" id="new-profile-val-field" class="form-field-control" value="${APP_STATE.currentUser.identityName || APP_STATE.currentUser.username || ''}">
        `; 
    } else if(targetFieldNameStringTokenKey === 'businessName') { 
        injectionMarkupFormHTML = `
            <label>Define New Corporate Entity Label:</label>
            <input type="text" id="new-profile-val-field" class="form-field-control" value="${APP_STATE.currentUser.businessName || ''}">
        `; 
    } else if(targetFieldNameStringTokenKey === 'businessInfo') { 
        injectionMarkupFormHTML = `
            <label>Define New Public Summary Overview Info Paragraph [Compulsory Overwrite]:</label>
            <input type="text" id="new-profile-val-field" class="form-field-control" value="${APP_STATE.currentUser.businessInfo || ''}">
        `; 
    } else if(targetFieldNameStringTokenKey === 'password') { 
        injectionMarkupFormHTML = `
            <label>Define New Access Password String Expression:</label>
            <input type="password" id="new-profile-val-field" class="form-field-control" placeholder="Input New Password Syntax Combo">
            <label class="margin-top-xs">Re-type Code Syntax to Confirm Parity Convergence:</label>
            <input type="password" id="new-profile-val-field-confirm" class="form-field-control" placeholder="Confirm New Password Syntax Combo">
            <div id="err-profile-pass-complex-feedback-lbl" class="text-danger-alert hidden-node"></div>
        `; 
    } else if(targetFieldNameStringTokenKey === 'avatar') { 
        const currentAvatarSrc = APP_STATE.currentUser.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230288d1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
        injectionMarkupFormHTML = `
            <label>Modify Profile Image File Vector:</label>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin: 15px 0;">
                <div class="fort-avatar-circle-container">
                    <img id="profile-edit-wizard-avatar-preview" class="fort-avatar-circle-img" src="${currentAvatarSrc}" alt="Avatar Preview">
                </div>
                <input type="file" id="new-profile-avatar-file-input" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processWizardAvatarFileSelectionDirectly()">
            </div>
            <input type="hidden" id="new-profile-val-field" value="AVATAR_MUTATION_TOKEN">
        `; 
    }
    
    modalTargetNode.innerHTML = `
        <h3>Modify Profile Parameters (Step 2 of 2)</h3>
        <div class="form-input-container margin-top-md">
            ${injectionMarkupFormHTML}
        </div>
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Discard Mutation</button>
            <button onclick="executePipelineSaveFinalProfileFieldsValuesChanges('${targetFieldNameStringTokenKey}')" class="btn-blue">Commit Overwrite</button> 
        </div>
    `; 
}

/**
 * Loads image selections locally to cache and hooks real-time previews instantly.
 */
function processWizardAvatarFileSelectionDirectly() {
    const fileNode = document.getElementById("new-profile-avatar-file-input"); 
    if(fileNode && fileNode.files && fileNode.files[0]) { 
        const readerInstance = new FileReader(); 
        readerInstance.onload = function(e) { 
            APP_CACHE.temporaryProfileAvatarDataUrl = e.target.result; 
            const previewImageElement = document.getElementById("profile-edit-wizard-avatar-preview"); 
            if(previewImageElement) { 
                previewImageElement.src = e.target.result; 
            }
        };
        readerInstance.readAsDataURL(fileNode.files[0]); 
    }
}

/**
 * CORE MODULE FIREBASE SYNC: Commits profile parameters updates directly into Firebase collections records.
 */
async function executePipelineSaveFinalProfileFieldsValuesChanges(targetFieldNameStringTokenKey) {
    const inputPrimaryElement = document.getElementById("new-profile-val-field"); 
    let targetCoreMutationStringValueValue = inputPrimaryElement ? inputPrimaryElement.value.trim() : ""; 
    const currentUserId = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;
    
    if(targetFieldNameStringTokenKey === 'password') { 
         const p2 = document.getElementById("new-profile-val-field-confirm").value; 
         const errLabel = document.getElementById("err-profile-pass-complex-feedback-lbl"); 
         if (!errLabel) return;
         errLabel.classList.add("hidden-node"); 
         
         if(targetCoreMutationStringValueValue !== p2) { 
             errLabel.innerText = "Password validation parameters do not match."; 
             errLabel.classList.remove("hidden-node"); 
             return; 
         }
         if(targetCoreMutationStringValueValue.length < 6 || !/[A-Z]/.test(targetCoreMutationStringValueValue) || !/[a-z]/.test(targetCoreMutationStringValueValue) || !/[0-9]/.test(targetCoreMutationStringValueValue) || !/[^A-Za-z0-9]/.test(targetCoreMutationStringValueValue)) { 
             errLabel.innerText = "Password must contain uppercase, lowercase, special characters, and numeric markers configurations."; 
             errLabel.classList.remove("hidden-node"); 
             return; 
         }
    }
    
    if(targetFieldNameStringTokenKey === 'avatar') { 
        if(APP_CACHE.temporaryProfileAvatarDataUrl === "") { 
            alert("Please browse and select a valid profile picture file framework first.");
            return;
        }
        targetCoreMutationStringValueValue = APP_CACHE.temporaryProfileAvatarDataUrl;
    }
    
    if(targetCoreMutationStringValueValue === "") { 
        alert("Mutation parameters mismatch: Blank information text blocks cannot be committed."); 
        return; 
    }
    
    try {
        const updatedFieldsPayload = {};
        if(targetFieldNameStringTokenKey === 'username') {
            updatedFieldsPayload.identityName = targetCoreMutationStringValueValue;
            updatedFieldsPayload.username = targetCoreMutationStringValueValue;
        } 
        else if(targetFieldNameStringTokenKey === 'businessName') updatedFieldsPayload.businessName = targetCoreMutationStringValueValue; 
        else if(targetFieldNameStringTokenKey === 'businessInfo') updatedFieldsPayload.businessInfo = targetCoreMutationStringValueValue; 
        else if(targetFieldNameStringTokenKey === 'password') {
            updatedFieldsPayload.secretKey = targetCoreMutationStringValueValue;
            updatedFieldsPayload.password = targetCoreMutationStringValueValue;
        } 
        else if(targetFieldNameStringTokenKey === 'avatar') updatedFieldsPayload.avatar = targetCoreMutationStringValueValue;

        if (window.FortMartFirebase) {
            const dbRefInstance = window.FortMartFirebase.db;
            const { doc, updateDoc } = window.FortMartFirebase;
            await updateDoc(doc(dbRefInstance, "users", currentUserId), updatedFieldsPayload);
        }

        // Apply synchronized mutations over the application data session states models references maps
        APP_STATE.currentUser = { ...APP_STATE.currentUser, ...updatedFieldsPayload };
        APP_CACHE.temporaryProfileAvatarDataUrl = ""; 
        
        closeActiveModalDirectly('auth-modal'); 
        initializeProfileDetailsAccountManagementFieldsValues(); 
        
        if (typeof showAlertModal === "function") {
            showAlertModal("Profile Synchronized", "System values successfully overwritten to cloud clusters.");
        } else {
            alert("System Profile Parameters Overwritten and Synced Successfully.");
        }
        
    } catch (cloudWriteExceptionError) {
        console.error("Firebase Cloud Storage Core Fields Overwrite Failure Event Exception:", cloudWriteExceptionError);
        alert("Cloud transaction boundary mismatch runtime error.");
    }
}


/**
 * Launches the interface overlay container workspace to edit listed marketplace inventory options items.
 */
function launchEditProductInventoryModalFormLayoutShell(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString || p.id === targetProductIdKeyValueString);
    if (!targetProduct) {
        alert("Product record could not be found inside indexed parameters.");
        return;
    }

    APP_CACHE.temporaryProductCoverPhotoUrl = targetProduct.coverPhoto || ""; 
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    if (!modalContentTargetNode) return;

    modalContentTargetNode.innerHTML = `
        <h3>Edit Product Details</h3>
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
    document.getElementById("auth-modal").classList.add("active");
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

        if (window.FortMartFirebase) {
            const dbRefInstance = window.FortMartFirebase.db;
            const { doc, updateDoc } = window.FortMartFirebase;
            await updateDoc(doc(dbRefInstance, "products", targetProductIdKeyValueString), productUpdatePayload);
        }

        APP_CACHE.temporaryProductCoverPhotoUrl = "";
        closeActiveModalDirectly('auth-modal');
        
        if (typeof showAlertModal === "function") {
            showAlertModal("Overwrites Saved", "Product configurations uploaded successfully.");
        } else {
            alert("Product Details Overwritten and Transmitted Successfully across Cloud Network Hubs.");
        }
        
        if (typeof listenForRealTimeMarketplaceSnapshots === "function") {
            listenForRealTimeMarketplaceSnapshots();
        } else if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
            renderAccountInventoryLedgerManagementDashboardGrid();
        }
        
    } catch (firebaseCloudMutationExceptionError) {
        console.error("Firebase Collection Product Mutation Failure Exception Log:", firebaseCloudMutationExceptionError);
        alert("Cloud storage submission engine pipeline execution mismatch error encountered.");
    }
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
        if (window.FortMartFirebase) {
            const dbRefInstance = window.FortMartFirebase.db;
            const { doc, setDoc } = window.FortMartFirebase;
            await setDoc(doc(dbRefInstance, "networkSuiteEntities", generatedNodeRecordId), suitePayloadData);
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