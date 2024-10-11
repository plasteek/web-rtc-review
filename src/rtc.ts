const servers: RTCConfiguration = {
   iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
   ],
};

export async function createPeerConnection(
   remoteStream: MediaStream,
   stream?: MediaStream
) {
   console.log("CREATE PEER CONNECTION");
   const connection = new RTCPeerConnection(servers);

   if (stream)
      stream.getTracks().forEach((track) => connection.addTrack(track, stream)); // Add track
   connection.ontrack = (e) => {
      // Listen for reply tracks
      console.log(e.streams);
      e.streams[0].getTracks().forEach((track) => {
         remoteStream.addTrack(track);
      });
   };

   connection.onicecandidate = async (e) => {
      if (!e.candidate) return;
      // The things you want to send
      console.log("Candidate: ", e.candidate);

      // This function is used to add the ICE candidate from the other party.
      // usually it is sent by the signaling server. But in this case we don't have any
      // so we just use the object as a proxy.
      // Otherwise, just call this function when the other party sends an ICE candidate
      // through the signaling server.
      // connection.addIceCandidate(e.candidate);

      console.log(connection.localDescription);
   };

   return connection;
}

export async function createOffer(connection: RTCPeerConnection) {
   console.log("CREATE OFFER");
   const offer = await connection.createOffer();
   await connection.setLocalDescription(offer); // Generates ICE Candidates, used to establishing peer connection

   console.log("Offer: ", offer);
   return offer;
}

export async function createAnswer(
   offer: RTCSessionDescriptionInit,
   connection: RTCPeerConnection
) {
   console.log("CREATE ANSWER");
   await connection.setRemoteDescription(offer);

   const answer = await connection.createAnswer();
   await connection.setLocalDescription(answer);
   return answer;
}

export async function setRTCAnswer(
   connection: RTCPeerConnection,
   answer: RTCSessionDescriptionInit
) {
   if (connection.currentRemoteDescription) return;
   console.log("SET REMOTE DESCRIPTION");
   connection.setRemoteDescription(answer);
}
