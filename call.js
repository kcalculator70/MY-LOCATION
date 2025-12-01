document.addEventListener('DOMContentLoaded', () => {
    // Firebase References (Global from index.html)
    const db = firebase.database();
    const auth = firebase.auth();

    // Variables
    let localStream = null;
    let peerConnection = null;
    let currentCallId = null;
    let incomingCallData = null;
    let callStartTime = null; // কল শুরুর সময় রাখার জন্য
    let isVideoCall = false;
    const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    // Elements
    const audioBtn = document.getElementById('audio-call-btn');
    const videoBtn = document.getElementById('video-call-btn');
    const callInterface = document.getElementById('call-interface');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    const endCallBtn = document.getElementById('end-call-btn');
    const incomingModal = document.getElementById('incoming-call-modal');
    const acceptBtn = document.getElementById('accept-call');
    const rejectBtn = document.getElementById('reject-call');
    const statusText = document.getElementById('call-status');

    // Helper: Chat ID জেনারেট করা (script.js এর মতো)
    function getChatId(u1, u2) {
        return u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
    }

    // Helper: সময় ফরম্যাট করা (যেমন: 2m 30s)
    function formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)));

        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    // Helper: কল হিস্টোরি মেসেজ হিসেবে পাঠানো
    function sendCallEndMessage() {
        if (callStartTime && auth.currentUser && window.currentChatPartner) {
            const durationMs = Date.now() - callStartTime;
            const durationStr = formatDuration(durationMs);
            const chatId = getChatId(auth.currentUser.uid, window.currentChatPartner.uid);
            
            const icon = isVideoCall ? '🎥' : '📞';
            const typeText = isVideoCall ? 'Video Call' : 'Audio Call';
            
            const msgData = {
                text: `${icon} ${typeText} ended • ${durationStr}`,
                senderId: auth.currentUser.uid,
                receiverId: window.currentChatPartner.uid,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                type: 'text', // টেক্সট হিসেবে পাঠাচ্ছি যাতে চ্যাট লিস্টে দেখা যায়
                status: 'sent'
            };

            // মেসেজ পুশ করা
            db.ref('messages/' + chatId).push(msgData);
            
            // আনরিড কাউন্ট আপডেট করা
            db.ref(`unreadCounts/${window.currentChatPartner.uid}/${auth.currentUser.uid}`).transaction(c => (c || 0) + 1);
        }
        callStartTime = null; // রিসেট
    }

    // 1. START CALL
    async function startCall(video) {
        const partner = window.currentChatPartner;
        const user = auth.currentUser;
        
        if (!partner || !user) return alert("Chat not open!");

        isVideoCall = video;

        try {
            const constraints = { audio: true, video: video ? { facingMode: 'user' } : false };
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            showCallUI(true, video);
            
            peerConnection = new RTCPeerConnection(iceServers);
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            
            peerConnection.ontrack = e => { remoteVideo.srcObject = e.streams[0]; };
            peerConnection.onicecandidate = e => {
                if (e.candidate && currentCallId) {
                    db.ref(`calls/${currentCallId}/callerCandidates`).push(e.candidate.toJSON());
                }
            };

            // কানেকশন স্ট্যাটাস চেক করে কল টাইমার শুরু
            peerConnection.onconnectionstatechange = () => {
                if (peerConnection.connectionState === 'connected') {
                    statusText.textContent = "Connected";
                    callStartTime = Date.now(); // সময় শুরু
                }
                if (peerConnection.connectionState === 'disconnected') {
                    endCall();
                }
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const callRef = db.ref('calls').push();
            currentCallId = callRef.key;
            
            await callRef.set({
                callId: currentCallId,
                callerId: user.uid,
                callerName: user.email,
                receiverId: partner.uid,
                type: video ? 'video' : 'audio',
                offer: { type: offer.type, sdp: offer.sdp },
                status: 'ringing',
                timestamp: Date.now()
            });

            db.ref(`calls/${currentCallId}`).on('value', s => {
                const data = s.val();
                if (!data) return;
                if (data.answer && !peerConnection.currentRemoteDescription) {
                    peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
                if (data.status === 'ended') endCall();
                if (data.status === 'rejected') { 
                    alert("Call Rejected"); 
                    endCall(); 
                }
            });

        } catch (e) {
            alert("Error: " + e.message);
            endCall();
        }
    }

    // 2. LISTEN FOR INCOMING CALLS
    auth.onAuthStateChanged(user => {
        if (user) {
            db.ref('calls').orderByChild('receiverId').equalTo(user.uid).on('child_added', s => {
                const data = s.val();
                if (data.status === 'ringing' && (Date.now() - data.timestamp < 60000)) {
                    incomingCallData = data;
                    document.getElementById('caller-name').textContent = data.callerName || "Friend";
                    incomingModal.classList.remove('hidden');
                }
            });
            db.ref('calls').on('child_changed', s => {
                if(s.val().receiverId === user.uid && s.val().status === 'ended') {
                    incomingModal.classList.add('hidden');
                    endCall();
                }
            });
        }
    });

    // 3. ACCEPT CALL
    acceptBtn.onclick = async () => {
        incomingModal.classList.add('hidden');
        if (!incomingCallData) return;
        
        currentCallId = incomingCallData.callId;
        isVideoCall = incomingCallData.type === 'video';
        
        // রিসিভারের সাইডে পার্টনার সেট করা দরকার মেসেজ পাঠানোর জন্য
        window.currentChatPartner = { uid: incomingCallData.callerId, name: incomingCallData.callerName };

        try {
            const constraints = { audio: true, video: isVideoCall ? { facingMode: 'user' } : false };
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            showCallUI(false, isVideoCall);

            peerConnection = new RTCPeerConnection(iceServers);
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            
            peerConnection.ontrack = e => { remoteVideo.srcObject = e.streams[0]; };
            peerConnection.onicecandidate = e => {
                if (e.candidate) db.ref(`calls/${currentCallId}/receiverCandidates`).push(e.candidate.toJSON());
            };

            // রিসিভারের কানেকশন টাইমার
            peerConnection.onconnectionstatechange = () => {
                if (peerConnection.connectionState === 'connected') {
                    statusText.textContent = "Connected";
                    callStartTime = Date.now(); // সময় শুরু
                }
                if (peerConnection.connectionState === 'disconnected') {
                    endCall();
                }
            };

            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            await db.ref(`calls/${currentCallId}`).update({
                answer: { type: answer.type, sdp: answer.sdp },
                status: 'connected'
            });

            db.ref(`calls/${currentCallId}/callerCandidates`).on('child_added', s => {
                peerConnection.addIceCandidate(new RTCIceCandidate(s.val()));
            });

        } catch (e) {
            alert("Error accepting: " + e.message);
            endCall();
        }
    };

    rejectBtn.onclick = () => {
        if (incomingCallData) db.ref(`calls/${incomingCallData.callId}`).update({ status: 'rejected' });
        incomingModal.classList.add('hidden');
    };

    // 4. END CALL BUTTON CLICK
    endCallBtn.onclick = () => {
        // যে লাল বাটন চাপবে, সে মেসেজ পাঠাবে
        sendCallEndMessage();
        
        if (currentCallId) {
            db.ref(`calls/${currentCallId}`).update({ status: 'ended' });
        }
        endCall();
    };

    function endCall() {
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        if (peerConnection) peerConnection.close();
        
        // Listener বন্ধ করা
        if (currentCallId) db.ref(`calls/${currentCallId}`).off();
        
        localStream = null;
        peerConnection = null;
        currentCallId = null;
        incomingCallData = null;
        callStartTime = null; // সেফটি রিসেট
        callInterface.classList.add('hidden');
    }
    
    // UI Helper
    function showCallUI(isCaller, isVideo) {
        callInterface.classList.remove('hidden');
        localVideo.srcObject = localStream;
        localVideo.style.display = isVideo ? 'block' : 'none';
        statusText.textContent = isCaller ? "Calling..." : "Connecting...";
    }

    // Attach Listeners
    if(audioBtn) audioBtn.onclick = () => startCall(false);
    if(videoBtn) videoBtn.onclick = () => startCall(true);
});