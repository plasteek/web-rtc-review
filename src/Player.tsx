import { useMemo, useRef, useState } from "react";
import { useRTC } from "./hooks";
import { createAnswer, createOffer, setRTCAnswer } from "./rtc";

export default function Player() {
   const localVideoRef = useRef<HTMLVideoElement>(null);
   const remoteVideoRef = useRef<HTMLVideoElement>(null);

   // For the textbox
   const [offerText, setOfferText] = useState("");
   const [remoteAnswerText, setRemoteAnswerText] = useState("");

   const [remoteOfferText, setRemoteOfferText] = useState("");
   const [answer, setAnswerText] = useState("");

   // Initialize peer connection and local stream
   const { peerConnection } = useRTC(localVideoRef, remoteVideoRef);

   const actions = useMemo(
      () => ({
         createOffer: async () => {
            if (!peerConnection) return;
            await createOffer(peerConnection); // This is also the offer

            peerConnection.onicecandidate = (e) => {
               if (!e.candidate) return;
               // NOTE: this was outside and local description is basically the offer
               // we do this here otherwise the ice candidate wouldn't be done yet.
               // and we also do this to get at least one ICE candidate into the object
               // otherwise both party don't know which IP to use during connection
               setOfferText(JSON.stringify(peerConnection.localDescription));
            };
         },
         createAnswer: async (remoteOfferText: string) => {
            if (!peerConnection) return;

            let remoteOffer: RTCSessionDescriptionInit;
            try {
               remoteOffer = JSON.parse(remoteOfferText);
            } catch (err) {
               console.error(err);
               return;
            }

            await createAnswer(remoteOffer, peerConnection);
            peerConnection.onicecandidate = (e) => {
               if (!e.candidate) return;
               // NOTE: this was outside and local description is basically the ANSWER
               setAnswerText(JSON.stringify(peerConnection.localDescription));
            };
         },
         setAnswer: async (answerText: string) => {
            if (!peerConnection) return;

            let remoteAnswer: RTCSessionDescriptionInit;
            try {
               remoteAnswer = JSON.parse(answerText);
            } catch (err) {
               console.error(err);
               return;
            }
            setRTCAnswer(peerConnection, remoteAnswer);
         },
      }),
      [peerConnection]
   );

   return (
      <div className="flex justify-center gap-3 w-full h-screen min-w-64 p-16">
         <div className="h-fit w-full">
            <h1 className="text-3xl mb-2">Local Stream</h1>
            <video
               autoPlay
               ref={localVideoRef}
               className="bg-black rounded aspect-video w-full h-full"
            ></video>
            {/* Controls */}
            <div id="controls" className="flex flex-col gap-3 p-3">
               <button
                  className="border-black px-4 py-2 border hover:bg-gray-200"
                  onClick={actions.createOffer}
               >
                  Create offer
               </button>
               <label>Offer: </label>
               <textarea
                  value={offerText}
                  disabled
                  className="border bg-gray-200 p-4"
                  rows={10}
               />
               <label>Answer: </label>
               <textarea
                  value={remoteAnswerText}
                  className="border bg-gray-100 p-4"
                  rows={10}
                  onChange={(e) => setRemoteAnswerText(e.target.value)}
               />
               <button
                  className="border-black px-4 py-2 border hover:bg-gray-200"
                  onClick={() => actions.setAnswer(remoteAnswerText)}
               >
                  Set Answer Descriptor
               </button>
            </div>
         </div>
         {/* REMOTE */}
         <div className="h-fit w-full">
            <h1 className="text-3xl mb-2">Remote Stream</h1>
            <video
               autoPlay
               ref={remoteVideoRef}
               className="bg-black rounded aspect-video w-full h-full"
            ></video>

            <div id="controls" className="flex flex-col gap-3 p-3">
               <label>Remote Offer: </label>
               <textarea
                  value={remoteOfferText}
                  className="border bg-gray-100 p-4"
                  rows={10}
                  onChange={(e) => setRemoteOfferText(e.target.value)}
               />
               <button
                  className="border-black px-4 py-2 border hover:bg-gray-200 "
                  onClick={() => actions.createAnswer(remoteOfferText)}
               >
                  Create answer
               </button>

               <label>Answer Descriptor: </label>
               <textarea
                  value={answer}
                  disabled
                  className="border bg-gray-200 p-4"
                  rows={10}
               />
            </div>
         </div>
      </div>
   );
}
