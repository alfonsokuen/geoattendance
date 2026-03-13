"use client";

import { useRef, useState, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      setError("No se pudo acceder a la cámara frontal: " + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhoto(dataUrl);
        
        // Convert to file for multipart
        canvas.toBlob((blob) => {
          if (blob) {
            const f = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            setFile(f);
          }
        }, "image/jpeg", 0.8);
        
        stopCamera();
      }
    }
  }, [stream]);

  const retake = () => {
    setPhoto(null);
    setFile(null);
    startCamera();
  };

  return { videoRef, canvasRef, startCamera, stopCamera, takePhoto, retake, photo, file, error };
}
