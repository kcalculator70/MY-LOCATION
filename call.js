document.addEventListener('DOMContentLoaded', () => {
    // Firebase References (Global from index.html)
    const db = firebase.database();
    const auth = firebase.auth();

    // Variables
    let localStream = null;
    let peerConnection = null;
    let currentCallId = null;
    let incomingCallData = null;
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

    // 1. START CALL
    async function startCall(video) {
        const partner = window.currentChatPartner; // Get from main script
        const user = auth.currentUser;
        
        if (!partner || !user) return alert("Chat not open!");

        try {
            // Get Camera/Mic
            const constraints = { audio: true, video: video ? { facingMode: 'user' } : false };
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            showCallUI(true, video);
            
            // WebRTC Setup
            peerConnection = new RTCPeerConnection(iceServers);
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            
            peerConnection.ontrack = e => { remoteVideo.srcObject = e.streams[0]; };
            peerConnection.onicecandidate = e => {
                if (e.candidate && currentCallId) {
                    db.ref(`calls/${currentCallId}/callerCandidates`).push(e.candidate.toJSON());
                }
            };

            // Create Offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Send Signal
            const callRef = db.ref('calls').push();
            currentCallId = callRef.key;
            
            await callRef.set({
                callId: currentCallId,
                callerId: user.uid,
                callerName: user.email, // Or name if available
                receiverId: partner.uid,
                type: video ? 'video' : 'audio',
                offer: { type: offer.type, sdp: offer.sdp },
                status: 'ringing',
                timestamp: Date.now()
            });

            // Listen for Answer
            db.ref(`calls/${currentCallId}`).on('value', s => {
                const data = s.val();
                if (!data) return;
                if (data.answer && !peerConnection.currentRemoteDescription) {
                    peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                    statusText.textContent = "Connected";
                }
                if (data.status === 'ended') endCall();
                if (data.status === 'rejected') { alert("Call Rejected"); endCall(); }
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
            // Listen for remote end
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
        const isVideo = incomingCallData.type === 'video';

        try {
            const constraints = { audio: true, video: isVideo ? { facingMode: 'user' } : false };
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            showCallUI(false, isVideo);

            peerConnection = new RTCPeerConnection(iceServers);
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            
            peerConnection.ontrack = e => { remoteVideo.srcObject = e.streams[0]; };
            peerConnection.onicecandidate = e => {
                if (e.candidate) db.ref(`calls/${currentCallId}/receiverCandidates`).push(e.candidate.toJSON());
            };

            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            await db.ref(`calls/${currentCallId}`).update({
                answer: { type: answer.type, sdp: answer.sdp },
                status: 'connected'
            });

            // Listen for candidates
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

    // 4. END CALL
    function endCall() {
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        if (peerConnection) peerConnection.close();
        
        if (currentCallId) {
            db.ref(`calls/${currentCallId}`).update({ status: 'ended' });
            db.ref(`calls/${currentCallId}`).off();
        }
        
        localStream = null;
        peerConnection = null;
        currentCallId = null;
        incomingCallData = null;
        callInterface.classList.add('hidden');
    }

    endCallBtn.onclick = endCall;
    
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