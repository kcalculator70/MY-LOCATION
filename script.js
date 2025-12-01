// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('SW Registered!', reg.scope))
      .catch(err => console.log('SW Failed:', err));
  });
}

// ========= CLOUDINARY CONFIGURATION =========
const CLOUDINARY_CLOUD_NAME = 'dinorzrp4'; 
const CLOUDINARY_UPLOAD_PRESET = 'kcalculator07'; 
// ============================================

document.addEventListener('DOMContentLoaded',()=>{
const firebaseConfig={apiKey:"AIzaSyBh7oN1SOlJvTdV4ld5JRP6wBRWu-DL_nQ",authDomain:"kawsar-messaging-apps.firebaseapp.com",databaseURL:"https://kawsar-messaging-apps-default-rtdb.firebaseio.com",projectId:"kawsar-messaging-apps",storageBucket:"kawsar-messaging-apps.firebasestorage.app",messagingSenderId:"738233086903",appId:"1:738233086903:web:9357e641d888c2f9a76e32",measurementId:"G-18N3ZJFVKW"};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
let currentUser=null,currentUserData=null,appInitialized=false,authStateInitialized=false,authStateResolve=null;
const authReadyPromise=new Promise(resolve=>{authStateResolve=resolve;});
let userDataResolve=null;
const userDataReadyPromise=new Promise(resolve=>{userDataResolve=resolve;});
let currentChatPartner=null,currentChatListener=null,unreadListeners={},contactListeners={},lastMessageTimestamps={},messageElements={};
let customPromptResolver=null,customConfirmResolver=null,customAlertResolver=null;
let notificationListener=null,unreadNotificationCount=0,supportListener=null;
let mediaRecorder=null,audioChunks=[],isRecording=false,recordingTimerInterval=null,autoStopTimeout=null;
let currentAudioBlob = null;
let isRecordingSaved = false;
let sendImmediately = false;

let currentSelectedMsgId=null,currentSelectedMsgText=null,currentSelectedMsgIsSender=false;
const appContainer=document.getElementById('app-container'),authView=document.getElementById('auth-view'),mainView=document.getElementById('main-view'),chatView=document.getElementById('chat-view'),calculatorLockView=document.getElementById('calculator-lock-view'),allViews=document.querySelectorAll('.view');
const addFriendModal=document.getElementById('add-friend-modal'),profileViewModal=document.getElementById('profile-view-modal'),customPromptModal=document.getElementById('custom-prompt-modal'),customPromptForm=document.getElementById('custom-prompt-form'),promptInput=document.getElementById('prompt-input'),pinSetupModal=document.getElementById('pin-setup-modal'),pinInputField=document.getElementById('pin-input-field'),setPinButton=document.getElementById('set-pin-button'),pinSetupError=document.getElementById('pin-setup-error'),allModals=document.querySelectorAll('.modal');
const loginForm=document.getElementById('login-form'),signupForm=document.getElementById('signup-form'),addFriendBtn=document.getElementById('add-friend-btn'),menuBtn=document.getElementById('menu-btn'),navHome=document.getElementById('nav-home'),navCalls=document.getElementById('nav-calls'),homeContent=document.getElementById('home-content'),callsContent=document.getElementById('calls-content'),allNavTabs=document.querySelectorAll('.nav-tab'),allContentPanels=document.querySelectorAll('.content-panel'),chatsBadge=document.getElementById('chats-badge'),chatBackBtn=document.getElementById('chat-back-btn'),chatHeaderInfo=document.getElementById('chat-header-info'),chatHeaderPicWrapper=document.getElementById('chat-header-pic-wrapper'),chatHeaderName=document.getElementById('chat-header-name'),chatMessages=document.getElementById('chat-messages'),chatInput=document.getElementById('chat-input'),chatSendBtn=document.getElementById('chat-send-btn');
const voiceRecordBtn=document.getElementById('voice-record-btn'),recordingUi=document.getElementById('recording-ui'),recordingTimer=document.getElementById('recording-timer'),cancelRecordingBtn=document.getElementById('cancel-recording-btn'),chatInputContainer=document.getElementById('chat-input-container');
const audioPreviewContainer=document.getElementById('audio-preview-container'),deleteRecordingBtn=document.getElementById('delete-recording-btn'),previewAudioPlayer=document.getElementById('preview-audio-player');

const addFriendForm=document.getElementById('add-friend-form'),friendIdInput=document.getElementById('friend-id-input'),profilePicWrapper=document.getElementById('profile-pic-wrapper'),profileViewName=document.getElementById('profile-view-name'),profileViewEmail=document.getElementById('profile-view-email'),profileEditNameBtn=document.getElementById('profile-edit-name-btn'),profileEditNameForm=document.getElementById('profile-edit-name-form'),profileNameInput=document.getElementById('profile-name-input'),profileSaveNameBtn=document.getElementById('profile-save-name-btn'),profileUserIdText=document.getElementById('profile-user-id-text'),profileUserEmailText=document.getElementById('profile-user-email-text'),profileCopyIdBtn=document.getElementById('profile-copy-id-btn'),profileCopyEmailBtn=document.getElementById('profile-copy-email-btn'),notificationContainer=document.getElementById('notification-container'),partnerProfileModal=document.getElementById('partner-profile-modal'),partnerModalName=document.getElementById('partner-modal-name'),partnerModalIdText=document.getElementById('partner-modal-id-text'),partnerModalCopyIdBtn=document.getElementById('partner-modal-copy-id-btn'),blockedUsersListEl=document.getElementById('blocked-users-list'),partnerModalBlockBtn=document.getElementById('partner-modal-block-btn'),partnerModalDeleteChatBtn=document.getElementById('partner-modal-delete-chat-btn'),logoutBtn=document.getElementById('logout-btn'),showSignupBtn=document.getElementById('show-signup'),showLoginBtn=document.getElementById('show-login');
const customConfirmModal=document.getElementById('custom-confirm-modal'),customConfirmMessage=document.getElementById('custom-confirm-message'),customConfirmBtnYes=document.getElementById('custom-confirm-btn-yes'),customConfirmBtnNo=document.getElementById('custom-confirm-btn-no'),customAlertModal=document.getElementById('custom-alert-modal'),customAlertMessage=document.getElementById('custom-alert-message'),customAlertBtnOk=document.getElementById('custom-alert-btn-ok'),verifiedInfoModal=document.getElementById('verified-info-modal'),verifiedInfoBtnOk=document.getElementById('verified-info-btn-ok'),messageOptionsModal=document.getElementById('message-options-modal'),msgOptCopy=document.getElementById('msg-opt-copy'),msgOptDeleteMe=document.getElementById('msg-opt-delete-me'),msgOptDeleteEveryone=document.getElementById('msg-opt-delete-everyone'),msgOptCancel=document.getElementById('msg-opt-cancel');
const notificationView=document.getElementById('notification-view'),notificationBtn=document.getElementById('notification-btn'),notificationBadge=document.getElementById('notification-badge'),notificationListContent=document.getElementById('notification-list-content'),notificationBackBtn=document.getElementById('notification-back-btn'),supportFabBtn=document.getElementById('support-fab-btn'),supportView=document.getElementById('support-view'),supportBackBtn=document.getElementById('support-back-btn'),supportMessages=document.getElementById('support-messages'),supportInput=document.getElementById('support-input'),supportSendBtn=document.getElementById('support-send-btn');
const calculatorScreen=document.getElementById('calculator-screen'),calcButtons=document.querySelectorAll('#calculator-lock-view .calc-btn');

// MEDIA VARIABLES
const attachMediaBtn=document.getElementById('attach-media-btn'),mediaFileInput=document.getElementById('media-file-input'),mediaViewModal=document.getElementById('media-view-modal'),mediaContentDisplay=document.getElementById('media-content-display'),closeMediaBtn=document.getElementById('close-media-btn');
let currentViewingMsgId=null;
// NEW VARIABLES FOR DOWNLOAD
let currentMediaUrl = null;
let currentMediaType = null;
const modalDownloadBtn = document.getElementById('modal-download-btn');

let currentExpression='0',userSecretPin=null,isAppUnlocked=false;
function resetCalculator(){currentExpression='0';calculatorScreen.textContent=currentExpression;}
function updateCalculatorScreen(){calculatorScreen.textContent=currentExpression||'0';}
function isOperator(value){return['+','-','*','/','%'].includes(value);}
function handleCalculatorInput(value){
userSecretPin=currentUserData?currentUserData.secretPin:null;
if(value>='0'&&value<='9'||value==='.'){
if(currentExpression==='0'&&value!=='.')currentExpression=value;else currentExpression+=value;
}else if(isOperator(value)){
if(currentExpression==='0')return;
if(!isOperator(currentExpression.slice(-1)))currentExpression+=value;else currentExpression=currentExpression.slice(0,-1)+value;
}else if(value==='C')resetCalculator();else if(value==='D'){
currentExpression=currentExpression.slice(0,-1);if(currentExpression.length===0)currentExpression='0';
}else if(value==='='){
if(userSecretPin&&currentExpression===userSecretPin){showMainAppView();return;}
try{const result=eval(currentExpression.replace(/×/g,'*').replace(/÷/g,'/'));currentExpression=String(result);}catch(e){currentExpression='Error';showNotification('Invalid expression.',3000);}
}
if(userSecretPin&&currentExpression.length===4&&currentExpression===userSecretPin){showMainAppView();currentExpression='0';isAppUnlocked=true;return;}
updateCalculatorScreen();
}
calcButtons.forEach(button=>{button.addEventListener('click',()=>{handleCalculatorInput(button.dataset.value);});});
function showView(viewId){
allViews.forEach(view=>{view.classList.add('hidden');});
calculatorLockView.classList.add('hidden');
if(viewId==='calculator-lock-view'){calculatorLockView.classList.remove('hidden');resetCalculator();}
else if(viewId==='main-view')mainView.classList.remove('hidden');
else if(viewId==='auth-view')authView.classList.remove('hidden');
else if(viewId==='chat-view')chatView.classList.remove('hidden');
else if(viewId==='notification-view')notificationView.classList.remove('hidden');
else if(viewId==='support-view')supportView.classList.remove('hidden');
}
function handleSuccessfulAuth(user){
db.ref('users/'+user.uid).once('value').then(snapshot=>{
if(snapshot.exists()){currentUserData=snapshot.val();checkPinStatus(user);}else{showCustomAlert("প্রোফাইল ডাটা পাওয়া যায়নি।");auth.signOut();}
}).catch(error=>{showCustomAlert("ডাটা লোড সমস্যা: "+error.message);auth.signOut();});
}
function checkPinStatus(user){
db.ref(`users/${user.uid}/secretPin`).once('value').then(snapshot=>{
const secretPin=snapshot.val();
if(secretPin){currentUserData.secretPin=secretPin;showView('calculator-lock-view');}else{showModal('pin-setup-modal');history.pushState(null,'',window.location.pathname);}
}).catch(err=>{showCustomAlert("কোড চেক সমস্যা: "+err.message);auth.signOut();});
}
setPinButton.addEventListener('click',()=>{
const newPin=pinInputField.value.trim();
if(newPin.length===4&&/^\d{4}$/.test(newPin)){
db.ref(`users/${currentUser.uid}/secretPin`).set(newPin).then(()=>{
currentUserData.secretPin=newPin;showModal('pin-setup-modal',false);showNotification('গোপন কোড সেট করা হয়েছে!');showView('calculator-lock-view');resetCalculator();if(history.state)history.back();
}).catch(err=>{pinSetupError.textContent='সমস্যা হয়েছে: '+err.message;});
}else pinSetupError.textContent='দয়া করে ৪-সংখ্যার সংখ্যা দিন।';
});
function showMainAppView(){showPanel('home-content');listenForContacts();populateAllFriendsList();listenForNotifications();appInitialized=true;isAppUnlocked=true;showView('main-view');}
function initializeAuthListener(){
auth.onAuthStateChanged(user=>{
cleanupListeners();isAppUnlocked=false;
if(user){
currentUser=user;if(!authStateInitialized){authStateInitialized=true;authStateResolve();}
const userRef=db.ref('users/'+user.uid);if(contactListeners.currentUser)contactListeners.currentUser.off();contactListeners.currentUser=userRef;
userRef.on('value',snapshot=>{
const wasNotInitialized=!currentUserData;
if(snapshot.exists()){
currentUserData=snapshot.val();if(!currentUserData.blockedUsers)currentUserData.blockedUsers={};
if(!profileViewModal.classList.contains('hidden')){
profilePicWrapper.innerHTML=getProfilePicHTML(currentUserData,'4.5rem');
profileViewName.innerHTML=`${currentUserData.name}${getVerifiedBadgeHTML(currentUserData)}`;
profileViewEmail.textContent=currentUserData.email;profileUserEmailText.textContent=currentUserData.email;
}
if(wasNotInitialized){checkPinStatus(user);listenForBlockedUsers(user.uid);listenForUnreadCounts();}else if(!isAppUnlocked&&calculatorLockView.classList.contains('hidden')&&authView.classList.contains('hidden'))checkPinStatus(user);
}else currentUserData=null;
if(userDataResolve){userDataResolve();userDataResolve=null;}
});
}else{
currentUser=null;currentUserData=null;appInitialized=false;
if(calculatorLockView&&!calculatorLockView.classList.contains('hidden'))showView('auth-view');else showView('auth-view');
if(notificationBadge){notificationBadge.classList.add('hidden');notificationBadge.textContent='0';unreadNotificationCount=0;}
if(!authStateInitialized){authStateInitialized=true;authStateResolve();}
if(userDataResolve){userDataResolve();userDataResolve=null;}
}
});
}
loginForm.addEventListener('submit',(e)=>{e.preventDefault();auth.signInWithEmailAndPassword(loginForm['login-email'].value,loginForm['login-password'].value).then((u)=>handleSuccessfulAuth(u.user)).catch(e=>showCustomAlert(getBengaliErrorMessage(e.code)));});
signupForm.addEventListener('submit',(e)=>{e.preventDefault();auth.createUserWithEmailAndPassword(signupForm['signup-email'].value,signupForm['signup-password'].value).then((u)=>{const user=u.user;db.ref('users/'+user.uid).set({uid:user.uid,email:user.email,name:user.uid,profilePicUrl:"",isVerified:false}).then(()=>handleSuccessfulAuth(user)).catch(e=>showCustomAlert(e.message));}).catch(e=>showCustomAlert(getBengaliErrorMessage(e.code)));});

voiceRecordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecordingForPreview();
    }
});
cancelRecordingBtn.addEventListener('click', () => { stopRecording(false); });
deleteRecordingBtn.addEventListener('click', () => { 
    currentAudioBlob = null;
    resetChatInputUI();
});

async function startRecording(){
    try {
        currentAudioBlob = null;
        isRecordingSaved = false;
        sendImmediately = false; 
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        isRecording = true;
        
        chatInputContainer.classList.add('recording');
        recordingUi.classList.remove('hidden');
        audioPreviewContainer.classList.add('hidden');
        voiceRecordBtn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        
        let seconds=0;recordingTimer.textContent="00:00";
        recordingTimerInterval=setInterval(()=>{seconds++;const m=Math.floor(seconds/60),s=seconds%60;recordingTimer.textContent=`${m<10?'0'+m:m}:${s<10?'0'+s:s}`;},1000);
        
        mediaRecorder.addEventListener("dataavailable",e=>{audioChunks.push(e.data);});
        mediaRecorder.addEventListener("stop",()=>{
            stream.getTracks().forEach(t=>t.stop());
            if (isRecordingSaved) {
                const audioBlob = new Blob(audioChunks, {type: 'audio/webm;codecs=opus'});
                currentAudioBlob = audioBlob;
                
                if (sendImmediately) {
                    sendImmediately = false;
                    handleMediaSend(audioBlob, 'audio'); // New Optimistic Handler
                    currentAudioBlob = null;
                    resetChatInputUI();
                } else {
                    showAudioPreviewUI(audioBlob);
                }
            }
        });
        mediaRecorder.start();
    } catch(error){showNotification("Mic error: "+error.message);}
}

function stopRecording(save){
    if(!mediaRecorder||!isRecording)return;
    isRecordingSaved = save;
    mediaRecorder.stop();
    isRecording = false;
    clearInterval(recordingTimerInterval);
    
    if(!save) resetChatInputUI();
}

function stopRecordingForPreview() {
    stopRecording(true);
}

function showAudioPreviewUI(blob) {
    chatInputContainer.classList.remove('recording');
    recordingUi.classList.add('hidden');
    chatInput.style.display = 'none';
    voiceRecordBtn.classList.add('hidden');
    attachMediaBtn.classList.add('hidden'); 
    audioPreviewContainer.classList.remove('hidden');
    
    const audioUrl = URL.createObjectURL(blob);
    previewAudioPlayer.src = audioUrl;
}

function resetChatInputUI() {
    chatInputContainer.classList.remove('recording');
    recordingUi.classList.add('hidden');
    audioPreviewContainer.classList.add('hidden');
    chatInput.style.display = 'block';
    voiceRecordBtn.classList.remove('hidden');
    attachMediaBtn.classList.remove('hidden');
    chatInput.value = '';
    
    voiceRecordBtn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>';
}

// ==== CLOUDINARY UPLOAD FUNCTION ====
async function uploadToCloudinary(file, resourceType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, { // Modified to use correct resource type
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if(data.error) {
            console.error("Cloudinary Error:", data.error);
            throw new Error(data.error.message);
        }
        return data.secure_url;
    } catch (error) {
        console.error("Upload error:", error);
        showNotification("Upload Failed: " + error.message);
        return null;
    }
}
// =====================================

attachMediaBtn.addEventListener('click', () => {
    mediaFileInput.click();
});

mediaFileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) { 
        showNotification("File too large! Max 100MB allowed.");
        this.value = '';
        return;
    }

    const msgType = file.type.startsWith('image/') ? 'image' : 'video';
    handleMediaSend(file, msgType); // Optimistic handling
    this.value = '';
});

// ==== NEW OPTIMISTIC SEND HANDLER ====
function handleMediaSend(fileOrBlob, type) {
    if (!currentChatPartner) return;

    const tempId = 'temp_' + Date.now();
    const blobUrl = URL.createObjectURL(fileOrBlob);
    const chatId = getChatId(currentUser.uid, currentChatPartner.uid);

    // Create fake message object
    let textLabel = '';
    if(type==='audio') textLabel = '🎤 Voice Message';
    else if(type==='image') textLabel = '📷 Photo';
    else if(type==='video') textLabel = '🎥 Video';

    const tempMsg = {
        text: textLabel,
        type: type,
        content: blobUrl,
        senderId: currentUser.uid,
        receiverId: currentChatPartner.uid,
        timestamp: Date.now(),
        status: 'sending' // Custom status for optimistic UI
    };

    // Render immediately
    renderMessage(tempId, tempMsg);

    // Upload in background
    const resourceType = (type === 'audio' || type === 'video') ? 'video' : 'image';
    
    uploadToCloudinary(fileOrBlob, resourceType).then(url => {
        if(url) {
            // Send to Real DB
            const dbMsg = { ...tempMsg, content: url, status: 'sent' }; // Usually 'sent', but let's push 'sent' directly
            // Note: Firebase server timestamp will slightly differ, but that's okay.
            dbMsg.timestamp = firebase.database.ServerValue.TIMESTAMP;
            
            db.ref('messages/' + chatId).push(dbMsg);
            db.ref(`unreadCounts/${currentChatPartner.uid}/${currentUser.uid}`).transaction(count => (count || 0) + 1);

            // Remove the temp message (the real one comes via listener)
            const tempEl = document.getElementById('msg-' + tempId);
            if(tempEl) tempEl.remove();
            delete messageElements[tempId]; 
        } else {
             showNotification("Failed to send media.");
             const tempEl = document.getElementById('msg-' + tempId);
             if(tempEl) tempEl.style.opacity = '0.5'; // Visual cue for failure
        }
    });
}
// =====================================

closeMediaBtn.addEventListener('click', () => {
    mediaViewModal.classList.add('hidden');
    mediaContentDisplay.innerHTML = ''; 
    currentViewingMsgId = null;
    currentMediaUrl = null;
    currentMediaType = null;
});

// NEW DOWNLOAD FUNCTIONALITY
modalDownloadBtn.addEventListener('click', () => {
    if(currentMediaUrl && currentMediaType) {
        downloadMedia(currentMediaUrl, currentMediaType);
    }
});

function createOrUpdateContactItem(contact,isFriendList=false){
const listContainer=isFriendList?callsContent:homeContent;
const existingItem=listContainer.querySelector(`.list-item[data-uid="${contact.uid}"]`);
if(!isFriendList&&currentUserData.blockedUsers&&currentUserData.blockedUsers[contact.uid]){if(existingItem)existingItem.remove();return;}
const lastMsgData=lastMessageTimestamps[contact.uid]||{text:'Tap to chat',timestamp:0};
if(existingItem){
existingItem.querySelector('.item-emoji').innerHTML=getProfilePicHTML(contact);
existingItem.querySelector('.item-name-text').textContent=contact.name;
const badgeContainer=existingItem.querySelector('.item-name.name-with-badge');
if(badgeContainer.querySelector('.verified-badge'))badgeContainer.querySelector('.verified-badge').remove();
badgeContainer.insertAdjacentHTML('beforeend',getVerifiedBadgeHTML(contact));
if(!isFriendList){
existingItem.querySelector('.item-subtext').textContent=lastMsgData.text;
existingItem.classList.toggle('hidden',lastMsgData.timestamp===0);
}
}else{
const item=document.createElement('div');item.className='list-item';
if(!isFriendList&&lastMsgData.timestamp===0)item.classList.add('hidden');
item.dataset.uid=contact.uid;
let itemHTML=`<div class="item-emoji">${getProfilePicHTML(contact)}</div><div class="item-details"><div class="item-name name-with-badge"><span class="item-name-text">${contact.name}</span>${getVerifiedBadgeHTML(contact)}</div>`;
if(isFriendList)itemHTML+=`</div>`;else itemHTML+=`<div class="item-subtext" id="subtext-${contact.uid}">${lastMsgData.text}</div></div><div class="item-actions"><span class="badge hidden" id="badge-${contact.uid}"></span></div>`;
item.innerHTML=itemHTML+'</div>';
item.addEventListener('click',(e)=>{if(e.target.closest('.verified-badge'))return;openChat(contact);});
listContainer.appendChild(item);
}
if(!isFriendList)sortChatList();
}
function handleCustomBack(){
if(!verifiedInfoModal.classList.contains('hidden')){verifiedInfoBtnOk.click();return true;}
if(!messageOptionsModal.classList.contains('hidden')){showModal('message-options-modal',false);return true;}
if(!customAlertModal.classList.contains('hidden')){customAlertBtnOk.click();return true;}
if(!customConfirmModal.classList.contains('hidden')){customConfirmBtnNo.click();return true;}
if(!partnerProfileModal.classList.contains('hidden')){showModal('partner-profile-modal',false);return true;}
if(!profileViewModal.classList.contains('hidden')){showModal('profile-view-modal',false);return true;}
if(!addFriendModal.classList.contains('hidden')){showModal('add-friend-modal',false);return true;}
if(!mediaViewModal.classList.contains('hidden')){closeMediaBtn.click();return true;}
if(!pinSetupModal.classList.contains('hidden'))return true;
if(!notificationView.classList.contains('hidden')){notificationBackBtn.click();return true;}
if(!supportView.classList.contains('hidden')){supportBackBtn.click();return true;}
if(!chatView.classList.contains('hidden')){showView('main-view');currentChatPartner=null;if(currentChatListener)currentChatListener.off();resetChatInputUI();return true;}
if(!mainView.classList.contains('hidden')){if(!homeContent.classList.contains('active')){showPanel('home-content');return true;}else{showView('calculator-lock-view');isAppUnlocked=false;return true;}}
if(!calculatorLockView.classList.contains('hidden')){auth.signOut();return true;}
return false;
}
function showNotification(msg,duration=3000){
const notification=document.createElement('div');notification.className='custom-notification';notification.textContent=msg;notificationContainer.appendChild(notification);
setTimeout(()=>notification.classList.add('show'),10);setTimeout(()=>{notification.classList.remove('show');setTimeout(()=>notification.remove(),300);},duration);
}
function customConfirm(msg){return new Promise(resolve=>{customConfirmResolver=resolve;customConfirmMessage.textContent=msg;showModal('custom-confirm-modal');history.pushState(null,'',window.location.pathname);});}
customConfirmBtnYes.addEventListener('click',()=>{if(customConfirmResolver)customConfirmResolver(true);showModal('custom-confirm-modal',false);if(history.state)history.back();});
customConfirmBtnNo.addEventListener('click',()=>{if(customConfirmResolver)customConfirmResolver(false);showModal('custom-confirm-modal',false);if(history.state)history.back();});
function showCustomAlert(msg){customAlertMessage.textContent=msg;showModal('custom-alert-modal');history.pushState(null,'',window.location.pathname);}
customAlertBtnOk.addEventListener('click',()=>{showModal('custom-alert-modal',false);if(history.state)history.back();});
verifiedInfoBtnOk.addEventListener('click',()=>{showModal('verified-info-modal',false);if(history.state)history.back();});
document.addEventListener('click',e=>{if(e.target.closest('.verified-badge')){e.stopPropagation();showModal('verified-info-modal');history.pushState(null,'',window.location.pathname);}});
function getBengaliErrorMessage(code){
switch(code){
case 'auth/email-already-in-use':return"ইমেইলটি ইতিমধ্যে ব্যবহার হয়েছে।";
case 'auth/invalid-email':return"ইমেইল ঠিকানাটি সঠিক নয়।";
case 'auth/weak-password':return"পাসওয়ার্ড দুর্বল (৬+ অক্ষর)।";
case 'auth/user-not-found':return"অ্যাকাউন্ট পাওয়া যায়নি।";
case 'auth/wrong-password':return"পাসওয়ার্ড ভুল।";
default:return"সমস্যা: "+code;
}
}
function customPrompt(title,val=''){return new Promise(resolve=>{customPromptResolver=resolve;document.getElementById('prompt-modal-title').textContent=title;promptInput.value=val;showModal('custom-prompt-modal');history.pushState(null,'',window.location.pathname);});}
customPromptForm.addEventListener('submit',e=>{e.preventDefault();if(customPromptResolver)customPromptResolver(promptInput.value);showModal('custom-prompt-modal',false);if(history.state)history.back();});
document.querySelectorAll('.close-modal-btn').forEach(btn=>{btn.addEventListener('click',e=>{const m=e.target.closest('.modal');if(m){showModal(m.id,false);if(history.state)history.back();}});});
function showModal(id,show=true){const m=document.getElementById(id);if(m)m.classList.toggle('hidden',!show);}
function showPanel(id){allContentPanels.forEach(p=>p.classList.toggle('active',p.id===id));allNavTabs.forEach(t=>t.classList.toggle('active',t.id===`nav-${id.split('-')[0]}`));}
function getChatId(u1,u2){return u1<u2?`${u1}_${u2}`:`${u2}_${u1}`;}
function formatTimestamp(ts){const d=new Date(ts);let h=d.getHours();const m=d.getMinutes();const ap=h>=12?'PM':'AM';h=h%12||12;return`${h}:${m<10?'0'+m:m} ${ap}`;}
function formatFullTimestamp(ts){const d=new Date(ts);return`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} at ${formatTimestamp(ts)}`;}
function getProfilePicHTML(u,sz='2.5rem'){return u.profilePicUrl?`<img src="${u.profilePicUrl}" alt="Pic">`:`<span style="font-size:${sz};line-height:1;user-select:none;">${u.name?u.name.charAt(0).toUpperCase():'?'}</span>`;}
function getVerifiedBadgeHTML(u){return(u&&u.isVerified)?`<span class="verified-badge" title="Verified"><svg viewBox="0 0 16 16"><path d="M6.75 12.13l-3.48-3.48c-.3-.3-.78-.3-1.06 0s-.3.78 0 1.06l4 4c.3.3.78.3 1.06 0l8.5-8.5c.3-.3.3-.78 0-1.06s-.78-.3-1.06 0L6.75 12.13z"/></svg></span>`:'';}
function cleanupListeners(){if(currentChatListener)currentChatListener.off();if(notificationListener)notificationListener.off();if(supportListener)supportListener.off();if(contactListeners.currentUser)contactListeners.currentUser.off();Object.values(unreadListeners).forEach(l=>l&&l.off());Object.values(contactListeners).forEach(l=>l&&l.off());unreadListeners={};contactListeners={};lastMessageTimestamps={};messageElements={};}
function copyText(txt,msg){if(!txt)return;const el=document.createElement('textarea');el.value=txt;el.setAttribute('readonly','');el.style.position='absolute';el.style.left='-9999px';document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el);showNotification(msg);}
window.addEventListener('popstate',()=>{if(handleCustomBack())history.pushState(null,'',window.location.pathname);});
history.pushState(null,'',window.location.pathname);
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(initializeAuthListener).catch(initializeAuthListener);
function listenForBlockedUsers(uid){
const r=db.ref('blockedUsers/'+uid);if(contactListeners.blocked)contactListeners.blocked.off();
r.on('value',s=>{currentUserData.blockedUsers=s.val()||{};if(!profileViewModal.classList.contains('hidden'))populateBlockedUsersList();populateAllFriendsList();});
contactListeners.blocked=r;
}
logoutBtn.addEventListener('click',()=>{appInitialized=false;isAppUnlocked=false;showModal('pin-setup-modal',false);auth.signOut();showModal('profile-view-modal',false);});
showSignupBtn.addEventListener('click',()=>{loginForm.classList.add('hidden');signupForm.classList.remove('hidden');});
showLoginBtn.addEventListener('click',()=>{loginForm.classList.remove('hidden');signupForm.classList.add('hidden');});
menuBtn.addEventListener('click',()=>{
if(!currentUserData)return;
profilePicWrapper.innerHTML=getProfilePicHTML(currentUserData,'4.5rem');profileViewName.innerHTML=`${currentUserData.name}${getVerifiedBadgeHTML(currentUserData)}`;
profileViewEmail.textContent=currentUserData.email;profileUserIdText.textContent=currentUserData.uid;profileUserEmailText.textContent=currentUserData.email;
profileEditNameForm.classList.add('hidden');profileViewName.classList.remove('hidden');profileEditNameBtn.classList.remove('hidden');populateBlockedUsersList();
showModal('profile-view-modal');history.pushState(null,'',window.location.pathname);
});
profilePicWrapper.addEventListener('click',async()=>{
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        showNotification("Uploading profile pic...");
        const url = await uploadToCloudinary(file, 'image');
        
        if(url){
            db.ref(`users/${currentUser.uid}/profilePicUrl`).set(url)
            .then(()=>{showNotification('Profile picture updated!');})
            .catch(e=>showNotification('Error: '+e.message));
        }
    };
    fileInput.click();
});
profileEditNameBtn.addEventListener('click',()=>{profileEditNameForm.classList.remove('hidden');profileNameInput.value=currentUserData.name;profileViewName.classList.add('hidden');profileEditNameBtn.classList.add('hidden');});
profileSaveNameBtn.addEventListener('click',()=>{
const n=profileNameInput.value.trim();
if(n&&n!==currentUserData.name){db.ref(`users/${currentUser.uid}/name`).set(n).then(()=>{showNotification('Name updated!');}).finally(()=>{profileEditNameForm.classList.add('hidden');profileViewName.classList.remove('hidden');profileEditNameBtn.classList.remove('hidden');});}
else{profileEditNameForm.classList.add('hidden');profileViewName.classList.remove('hidden');profileEditNameBtn.classList.remove('hidden');}
});
profileCopyIdBtn.addEventListener('click',()=>{copyText(currentUserData.uid,'ID copied!');});
profileCopyEmailBtn.addEventListener('click',()=>{copyText(currentUserData.email,'Email copied!');});
partnerModalCopyIdBtn.addEventListener('click',()=>{if(currentChatPartner)copyText(currentChatPartner.uid,'Friend ID copied!');});
chatHeaderInfo.addEventListener('click',e=>{if(e.target.closest('.verified-badge'))return;if(currentChatPartner){partnerModalName.innerHTML=`${currentChatPartner.name}${getVerifiedBadgeHTML(currentChatPartner)}`;partnerModalIdText.textContent=currentChatPartner.uid;showModal('partner-profile-modal');history.pushState(null,'',window.location.pathname);}});
notificationBtn.addEventListener('click',()=>{
showView('notification-view');history.pushState(null,'',window.location.pathname);
if(unreadNotificationCount>0&&currentUser){
const r=db.ref('notifications/'+currentUser.uid);r.orderByChild('read').equalTo(false).once('value',s=>{const u={};s.forEach(c=>{u[c.key+'/read']=true;});if(Object.keys(u).length)r.update(u);});
}
unreadNotificationCount=0;updateNotificationBadge();
});
notificationBackBtn.addEventListener('click',()=>{showView('main-view');});
supportFabBtn.addEventListener('click',()=>{showView('support-view');history.pushState(null,'',window.location.pathname);listenForSupportMessages();});
supportBackBtn.addEventListener('click',()=>{showView('main-view');if(supportListener)supportListener.off();supportListener=null;});
supportSendBtn.addEventListener('click',()=>{
const t=supportInput.value.trim();if(!t||!currentUser)return;
db.ref(`support_chats/${currentUser.uid}`).push({text:t,sender:'user',timestamp:firebase.database.ServerValue.TIMESTAMP});
db.ref('support_requests').push({uid:currentUser.uid,message:t,timestamp:firebase.database.ServerValue.TIMESTAMP}).then(()=>{supportInput.value='';supportMessages.scrollTop=supportMessages.scrollHeight;});
});
function listenForSupportMessages(){
if(!currentUser)return;if(supportListener)supportListener.off();supportMessages.innerHTML='';
supportListener=db.ref(`support_chats/${currentUser.uid}`).on('child_added',s=>{
const m=s.val();const b=document.createElement('div');b.className=`support-bubble ${m.sender==='user'?'sent':'received'}`;b.textContent=m.text;supportMessages.appendChild(b);supportMessages.scrollTop=supportMessages.scrollHeight;
});
}
async function populateAllFriendsList(){
if(!callsContent||!currentUser)return;callsContent.innerHTML='';
try{
const snap=await db.ref('contacts/'+currentUser.uid).once('value');
if(!snap.exists()){callsContent.innerHTML='<p style="padding:20px;text-align:center;color:var(--wa-text-secondary);">No friends found.</p>';return;}
const uids=Object.keys(snap.val()),snaps=await Promise.all(uids.map(u=>currentUserData.blockedUsers&&currentUserData.blockedUsers[u]?null:db.ref('users/'+u).once('value')).filter(p=>p!==null));
const friends=snaps.filter(s=>s.exists()).map(s=>s.val()).sort((a,b)=>a.name.localeCompare(b.name));
friends.forEach(f=>createOrUpdateContactItem(f,true));
if(friends.length===0)callsContent.innerHTML='<p style="padding:20px;text-align:center;color:var(--wa-text-secondary);">No friends found.</p>';
}catch(e){callsContent.innerHTML='<p style="padding:20px;text-align:center;color:var(--call-end-red);">Error.</p>';}
}
addFriendBtn.addEventListener('click',()=>{addFriendForm.reset();showModal('add-friend-modal');history.pushState(null,'',window.location.pathname);});
addFriendForm.addEventListener('submit',e=>{
e.preventDefault();const fid=friendIdInput.value.trim();
if(fid===currentUser.uid){showNotification("Cannot add yourself.");return;}
db.ref('users/'+fid).once('value',s=>{
if(s.exists()){
if(currentUserData.blockedUsers&&currentUserData.blockedUsers[fid]){showNotification("User blocked.");return;}
const u={};u[`contacts/${currentUser.uid}/${fid}`]=true;u[`contacts/${fid}/${currentUser.uid}`]=true;
db.ref().update(u).then(()=>{showNotification('Friend added!');showModal('add-friend-modal',false);if(history.state)history.back();populateAllFriendsList();});
}else showNotification('User not found.');
});
});
function sortChatList(){
const items=Array.from(homeContent.querySelectorAll('.list-item'));
items.sort((a,b)=>{
const ta=(lastMessageTimestamps[a.dataset.uid]||{}).timestamp||0;
const tb=(lastMessageTimestamps[b.dataset.uid]||{}).timestamp||0;
return tb-ta;
});
items.forEach(i=>homeContent.appendChild(i));
const vis=items.filter(i=>!i.classList.contains('hidden'));
let msg=homeContent.querySelector('#no-chats-message');
if(vis.length===0){if(!msg){msg=document.createElement('p');msg.id='no-chats-message';msg.style.cssText='padding:20px;text-align:center;color:var(--wa-text-secondary);';msg.textContent='No active chats.';homeContent.appendChild(msg);}}
else if(msg)msg.remove();
}
function listenForLastMessageUpdates(cid){
if(currentUserData.blockedUsers&&currentUserData.blockedUsers[cid])return;
const ref=db.ref('messages/'+getChatId(currentUser.uid,cid)).limitToLast(1);
if(contactListeners[cid+'_msg'])contactListeners[cid+'_msg'].off();contactListeners[cid+'_msg']=ref;
ref.on('child_added',s=>{
const m=s.val();if(currentUserData.blockedUsers&&currentUserData.blockedUsers[m.senderId])return;
let previewText = '';
if(m.type==='audio') previewText = '🎤 Voice Message';
else if(m.type==='image') previewText = '📷 Photo';
else if(m.type==='video') previewText = '🎥 Video';
else previewText = m.text;

lastMessageTimestamps[cid]={text:(m.senderId===currentUser.uid?'You: ':'')+previewText,timestamp:m.timestamp};
const i=homeContent.querySelector(`.list-item[data-uid="${cid}"]`);
if(i){i.querySelector('.item-subtext').textContent=lastMessageTimestamps[cid].text;i.classList.remove('hidden');sortChatList();}
});
ref.on('child_removed',()=>{
db.ref('messages/'+getChatId(currentUser.uid,cid)).limitToLast(1).once('value',s=>{
const i=homeContent.querySelector(`.list-item[data-uid="${cid}"]`);if(!i)return;
if(s.exists()){
s.forEach(c=>{
    const m=c.val();
    let previewText = '';
    if(m.type==='audio') previewText = '🎤 Voice Message';
    else if(m.type==='image') previewText = '📷 Photo';
    else if(m.type==='video') previewText = '🎥 Video';
    else previewText = m.text;
    
    lastMessageTimestamps[cid]={text:(m.senderId===currentUser.uid?'You: ':'')+previewText,timestamp:m.timestamp};i.querySelector('.item-subtext').textContent=lastMessageTimestamps[cid].text;});
}else{lastMessageTimestamps[cid]={text:'Tap to chat',timestamp:0};i.querySelector('.item-subtext').textContent='Tap to chat';i.classList.add('hidden');}
sortChatList();
});
});
}
function listenForContacts(){
if(contactListeners.main)contactListeners.main.off();
const r=db.ref('contacts/'+currentUser.uid);contactListeners.main=r;
r.on('child_added',s=>{const id=s.key;if(currentUserData.blockedUsers&&currentUserData.blockedUsers[id])return;
const ur=db.ref('users/'+id);if(contactListeners[id+'_user'])contactListeners[id+'_user'].off();
contactListeners[id+'_user']=ur;ur.on('value',sn=>{if(sn.exists())createOrUpdateContactItem(sn.val());});
listenForLastMessageUpdates(id);
});
r.on('child_removed',s=>{const id=s.key;if(contactListeners[id+'_user'])contactListeners[id+'_user'].off();if(contactListeners[id+'_msg'])contactListeners[id+'_msg'].off();const i=homeContent.querySelector(`.list-item[data-uid="${id}"]`);if(i)i.remove();delete lastMessageTimestamps[id];sortChatList();});
}
function deleteChatHistory(pid){
const cid=getChatId(currentUser.uid,pid);
const u={};u[`messages/${cid}`]=null;u[`unreadCounts/${currentUser.uid}/${pid}`]=null;u[`unreadCounts/${pid}/${currentUser.uid}`]=null;
db.ref().update(u).then(()=>{
showNotification('Chat history removed.');
const i=homeContent.querySelector(`.list-item[data-uid="${pid}"]`);
if(i){lastMessageTimestamps[pid]={text:'Tap to chat',timestamp:0};i.querySelector('.item-subtext').textContent='Tap to chat';i.classList.add('hidden');sortChatList();}
});
}
allNavTabs.forEach(t=>{t.addEventListener('click',()=>{showPanel(t.id.split('-')[1]+'-content');history.pushState(null,'',window.location.pathname);});});
function openChat(p){
window.currentChatPartner = p; // এই লাইনটা যোগ করেছি যাতে কল ফিচার কাজ করে
currentChatPartner=p;chatHeaderPicWrapper.innerHTML=getProfilePicHTML(p,'1.8rem');
chatHeaderName.innerHTML=`<span class="item-name-text">${p.name}</span>${getVerifiedBadgeHTML(p)}`;
chatMessages.innerHTML='';messageElements={};showView('chat-view');history.pushState(null,'',window.location.pathname);
db.ref(`unreadCounts/${currentUser.uid}/${p.uid}`).remove();
if(currentChatListener)currentChatListener.off();
const ref=db.ref('messages/'+getChatId(currentUser.uid,p.uid));
currentChatListener=ref.limitToLast(50);
currentChatListener.on('child_added',s=>{
const m=s.val();if(currentUserData.blockedUsers&&currentUserData.blockedUsers[m.senderId])return;
renderMessage(s.key,m);if(m.receiverId===currentUser.uid&&m.status!=='seen')ref.child(s.key).update({status:'seen'});
});
currentChatListener.on('child_changed',s=>{if(s.val().senderId===currentUser.uid&&messageElements[s.key])document.getElementById(`status-${s.key}`).innerHTML=getStatusSVG(s.val().status);});
currentChatListener.on('child_removed',s=>{if(messageElements[s.key]){messageElements[s.key].remove();delete messageElements[s.key];}});
}
function getStatusSVG(s){
    // If sending, show a clock icon with animation
    if(s === 'sending') return `<svg class="message-status-icon sending" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>`;
    
    const seen=s==='seen';
    return `<svg class="message-status-icon ${seen?'seen':''}" viewBox="0 0 24 24" fill="${seen?'var(--wa-accent-blue)':'var(--wa-text-secondary)'}"><path d="${seen?'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z':'M9.01 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 13.4l7-7z'}"/></svg>`;
}

async function downloadMedia(url, type) {
    showNotification("Downloading...");
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `secret_media_${Date.now()}.${type==='image'?'jpg':'mp4'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch(e) { 
        showNotification("Download failed. Opening in new tab...");
        window.open(url, '_blank');
    }
}

function renderMessage(mid,m){
const isMe=m.senderId===currentUser.uid;
const hidden=JSON.parse(localStorage.getItem(`hidden_msgs_${currentUser.uid}`))||[];
if(hidden.includes(mid)||messageElements[mid])return;
const b=document.createElement('div');b.className=`message-bubble ${isMe?'message-sent':'message-received'}`;b.id=`msg-${mid}`;

// Reduce opacity slightly if sending
if(m.status === 'sending') b.style.opacity = '0.8';

let pt;const sp=()=>{pt=setTimeout(()=>{openMessageOptions(mid,m.text,isMe);},600);},cp=()=>{clearTimeout(pt);};
b.addEventListener('mousedown',sp);b.addEventListener('mouseup',cp);b.addEventListener('mouseleave',cp);b.addEventListener('touchstart',sp);b.addEventListener('touchend',cp);b.addEventListener('touchmove',cp);
const cw=document.createElement('div');cw.className='message-content-wrapper';

if(m.type==='audio'){
const aud=document.createElement('audio');aud.controls=true;aud.className='audio-player';aud.src=m.content;cw.appendChild(aud);
}
else if(m.type==='image'||m.type==='video'){
    const d=document.createElement('div');d.className='media-bubble';
    
    let iconSvg = '';
    if (m.type === 'image') iconSvg = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:var(--wa-text-primary);"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
    else iconSvg = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:var(--wa-text-primary);"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>';

    let label = m.type === 'image' ? '📷 Photo' : '🎥 Video';
    d.innerHTML=`${iconSvg}<span class="media-text">${label}</span>`;
    
    // DOWNLOAD BUTTON REMOVED FROM HERE

    d.addEventListener('click',()=>{
        currentViewingMsgId=mid;
        currentMediaUrl = m.content;
        currentMediaType = m.type;
        
        // LOGIC: IF I SENT IT, HIDE DOWNLOAD. IF PARTNER SENT IT, SHOW DOWNLOAD.
        if (isMe) {
            modalDownloadBtn.style.display = 'none';
        } else {
            modalDownloadBtn.style.display = 'flex';
        }

        mediaViewModal.classList.remove('hidden');
        mediaContentDisplay.innerHTML='';
        
        if(m.type==='image'){
            const el=document.createElement('img');
            el.src=m.content;
            el.style.cssText='max-width:100%;max-height:100%;object-fit:contain;';
            mediaContentDisplay.appendChild(el);
        } else {
            const el=document.createElement('video');
            el.src=m.content;
            el.controls=true;
            el.autoplay=true;
            el.style.cssText='max-width:100%;max-height:100%;';
            el.onended=()=>closeMediaBtn.click();
            mediaContentDisplay.appendChild(el);
        }
    });
    cw.appendChild(d);
}
else{
const t=document.createElement('span');t.className='message-text';t.textContent=m.text;cw.appendChild(t);
}

const tw=document.createElement('div');tw.className='message-time-status';
const ts=document.createElement('span');ts.textContent=formatTimestamp(m.timestamp);tw.appendChild(ts);
if(isMe){const si=document.createElement('span');si.id=`status-${mid}`;si.innerHTML=getStatusSVG(m.status||'sent');tw.appendChild(si);}
cw.appendChild(tw);b.appendChild(cw);chatMessages.appendChild(b);messageElements[mid]=b;
if(chatMessages.scrollHeight-chatMessages.clientHeight<=chatMessages.scrollTop+100)chatMessages.scrollTop=chatMessages.scrollHeight;
}

chatSendBtn.addEventListener('click', sendMessage);

function sendMessage(){
    if(!currentChatPartner)return;

    if (isRecording) {
        sendImmediately = true;
        stopRecording(true); 
        return;
    }

    if (currentAudioBlob) {
        handleMediaSend(currentAudioBlob, 'audio'); // Optimistic
        currentAudioBlob = null;
        resetChatInputUI();
        return; 
    }

    const t=chatInput.value.trim();
    if(!t)return;

    // Optimistic Text Send
    const msgData = {
        text:t,
        senderId:currentUser.uid,
        receiverId:currentChatPartner.uid,
        timestamp:firebase.database.ServerValue.TIMESTAMP,
        status:'sending' // Start as sending
    };

    const pushRef = db.ref('messages/'+getChatId(currentUser.uid,currentChatPartner.uid)).push(msgData);
    
    // When successfully synced to server, update status to 'sent'
    pushRef.then(() => {
        pushRef.update({status: 'sent'});
    });

    db.ref(`unreadCounts/${currentChatPartner.uid}/${currentUser.uid}`).transaction(c=>(c||0)+1);
    chatInput.value='';
    chatInput.focus();
}

chatBackBtn.addEventListener('click',()=>{showView('main-view');currentChatPartner=null;if(currentChatListener)currentChatListener.off();resetChatInputUI();});
function openMessageOptions(mid,txt,isMe){
currentSelectedMsgId=mid;currentSelectedMsgText=txt;currentSelectedMsgIsSender=isMe;
msgOptDeleteEveryone.classList.toggle('hidden',!isMe);showModal('message-options-modal');history.pushState(null,'',window.location.pathname);
}
msgOptCopy.addEventListener('click',()=>{copyText(currentSelectedMsgText,'Message copied');showModal('message-options-modal',false);if(history.state)history.back();});
msgOptCancel.addEventListener('click',()=>{showModal('message-options-modal',false);if(history.state)history.back();});
msgOptDeleteMe.addEventListener('click',()=>{
if(!currentSelectedMsgId)return;
const k=`hidden_msgs_${currentUser.uid}`;const h=JSON.parse(localStorage.getItem(k))||[];h.push(currentSelectedMsgId);localStorage.setItem(k,JSON.stringify(h));
const b=document.getElementById(`msg-${currentSelectedMsgId}`);if(b)b.remove();delete messageElements[currentSelectedMsgId];
showNotification('Deleted for you');showModal('message-options-modal',false);if(history.state)history.back();
});
msgOptDeleteEveryone.addEventListener('click',()=>{
if(!currentSelectedMsgId||!currentChatPartner)return;
db.ref(`messages/${getChatId(currentUser.uid,currentChatPartner.uid)}/${currentSelectedMsgId}`).remove().then(()=>{showNotification('Deleted for everyone');});
showModal('message-options-modal',false);if(history.state)history.back();
});
function listenForUnreadCounts(){
const ur=db.ref('unreadCounts/'+currentUser.uid);if(unreadListeners.main)unreadListeners.main.off();
ur.on('value',s=>{
let tot=0;const c=s.val()||{},blk=currentUserData.blockedUsers||{};
document.querySelectorAll('.list-item').forEach(i=>{
const uid=i.dataset.uid;if(uid&&!blk[uid]){const cnt=c[uid]||0;const b=document.getElementById(`badge-${uid}`);if(b){b.textContent=cnt;b.classList.toggle('hidden',cnt===0);}tot+=cnt;}
});
chatsBadge.textContent=tot;chatsBadge.classList.toggle('hidden',tot===0);
});
unreadListeners.main=ur;
}
function updateNotificationBadge(){notificationBadge.textContent=unreadNotificationCount;notificationBadge.classList.toggle('hidden',unreadNotificationCount===0);}
function listenForNotifications(){
if(notificationListener)notificationListener.off();if(!currentUser)return;
const nr=db.ref('notifications/'+currentUser.uid);notificationListener=nr.orderByChild('timestamp').limitToLast(30);
notificationListContent.innerHTML='';unreadNotificationCount=0;
notificationListener.on('child_added',s=>{
const n=s.val(),id=s.key;if(document.getElementById(id))return;
const i=document.createElement('div');i.className='notification-item';i.id=id;
i.innerHTML=`<div class="notification-item-text">${n.message}</div><div class="notification-item-time">${formatFullTimestamp(n.timestamp)}</div>`;
const delBtn=document.createElement('button');delBtn.className='notif-delete-btn';delBtn.innerHTML='&times;';
delBtn.addEventListener('click',e=>{e.stopPropagation();customConfirm('Delete notification?').then(y=>{if(y)db.ref(`notifications/${currentUser.uid}/${id}`).remove();});});
i.appendChild(delBtn);
const nm=notificationListContent.querySelector('#no-notifications-msg');if(nm)nm.remove();notificationListContent.prepend(i);
if(!n.read){unreadNotificationCount++;updateNotificationBadge();}
});
notificationListener.on('child_removed',s=>{const el=document.getElementById(s.key);if(el)el.remove();if(!notificationListContent.children.length)notificationListContent.innerHTML='<p id="no-notifications-msg">No notifications.</p>';});
}
async function populateBlockedUsersList(){
if(!blockedUsersListEl)return;blockedUsersListEl.innerHTML='Loading...';
const blk=Object.keys(currentUserData.blockedUsers||{});
if(!blk.length){blockedUsersListEl.innerHTML='No users blocked.';return;}
blockedUsersListEl.innerHTML='';
for(const uid of blk){
const s=await db.ref('users/'+uid).once('value'),u=s.exists()?s.val():{name:uid};
const d=document.createElement('div');d.className='blocked-user-item';
d.innerHTML=`<span class="name-with-badge"><span class="item-name-text">${u.name}</span>${getVerifiedBadgeHTML(u)}</span><button class="unblock-btn" data-uid="${uid}">Unblock</button>`;
blockedUsersListEl.appendChild(d);
}
}
blockedUsersListEl.addEventListener('click',e=>{if(e.target.classList.contains('unblock-btn'))unblockUser(e.target.dataset.uid);});
function unblockUser(uid){
const u={};u[`blockedUsers/${currentUser.uid}/${uid}`]=null;u[`contacts/${currentUser.uid}/${uid}`]=true;u[`contacts/${uid}/${currentUser.uid}`]=true;
db.ref().update(u).then(()=>{showNotification('Unblocked.');});
}
partnerModalBlockBtn.addEventListener('click',()=>{
if(currentChatPartner)customConfirm("Block user?").then(y=>{
if(y){
const uid=currentChatPartner.uid,u={};
u[`blockedUsers/${currentUser.uid}/${uid}`]=true;u[`contacts/${currentUser.uid}/${uid}`]=null;u[`contacts/${uid}/${currentUser.uid}`]=null;u[`messages/${getChatId(currentUser.uid,uid)}`]=null;
db.ref().update(u).then(()=>{showNotification('Blocked.');showModal('partner-profile-modal',false);if(history.state)history.back();chatBackBtn.click();});
}
});
});
partnerModalDeleteChatBtn.addEventListener('click',()=>{
if(currentChatPartner)customConfirm("Delete chat history?").then(y=>{if(y){deleteChatHistory(currentChatPartner.uid);showModal('partner-profile-modal',false);if(history.state)history.back();chatBackBtn.click();}});
});
});