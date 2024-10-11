import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createPeerConnection } from "./rtc";

export function useRTC(
   localVideoRef: RefObject<HTMLVideoElement>,
   remoteVideoRef: RefObject<HTMLVideoElement>
) {
   // Initialize peer connection and local stream
   const [pc, setPC] = useState<RTCPeerConnection | null>(null);
   const localStreamRef = useRef<MediaStream>();
   const remoteStream = useMemo(() => new MediaStream(), []);
   useEffect(() => {
      if (!localVideoRef.current || !remoteVideoRef.current) return;

      const localVideo = localVideoRef.current;
      const remoteVideo = remoteVideoRef.current;
      (async function () {
         const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
         });

         localVideo.srcObject = stream;
         localStreamRef.current = stream;

         setPC(await createPeerConnection(remoteStream, stream));
         remoteVideo.srcObject = remoteStream;
      })();
   }, [remoteStream, localVideoRef, remoteVideoRef]);

   return {
      peerConnection: pc,
      localStream: localStreamRef.current,
      remoteStream: remoteStream,
   };
}
