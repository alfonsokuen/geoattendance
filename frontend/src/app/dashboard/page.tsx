"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCamera } from "@/hooks/useCamera";
import { MapPin, Camera, CheckCircle2, LogOut, Clock } from "lucide-react";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const { videoRef, canvasRef, startCamera, stopCamera, takePhoto, retake, photo, file, error: camError } = useCamera();

  const [attendanceType, setAttendanceType] = useState<string | null>(null);
  const [step, setStep] = useState<"SELECT" | "LOCATION" | "CAMERA" | "CONFIRM">("SELECT");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  const handleStartProcess = (type: string) => {
    setAttendanceType(type);
    setStep("LOCATION");
    requestLocation();
  };

  useEffect(() => {
    if (step === "LOCATION" && location && !geoLoading) {
      setStep("CAMERA");
      startCamera();
    }
  }, [step, location, geoLoading]);

  const submitAttendance = async () => {
    if (!location || !file || !attendanceType || !token) return;
    
    setSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("type", attendanceType);
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
      formData.append("gpsAccuracy", location.acc.toString());
      formData.append("deviceOS", navigator.userAgent);
      formData.append("selfie", file);

      const res = await fetch("http://localhost:3001/attendance/record", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Error al registrar asistencia");
      }

      setMessage("Marcación registrada con éxito!");
      setStep("SELECT");
      setAttendanceType(null);
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hola, {user.employee?.firstName || "Usuario"}</h1>
          <p className="text-sm text-gray-500">{user.employee?.branch?.name || "Sucursal"}</p>
        </div>
        <button onClick={logout} className="text-red-500 flex items-center gap-2">
          <LogOut size={20} /> <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      <main className="flex-1 p-6 max-w-lg w-full mx-auto flex flex-col justify-center">
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-center ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {step === "SELECT" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-8">¿Qué deseas registrar?</h2>
            <button onClick={() => handleStartProcess("IN")} className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl text-xl shadow hover:bg-blue-700 transition">
              Entrada
            </button>
            <button onClick={() => handleStartProcess("OUT")} className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl text-xl shadow hover:bg-indigo-700 transition">
              Salida
            </button>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => handleStartProcess("LUNCH_IN")} className="bg-orange-500 text-white py-3 rounded-xl font-medium shadow">
                Inicio Almuerzo
              </button>
              <button onClick={() => handleStartProcess("LUNCH_OUT")} className="bg-orange-500 text-white py-3 rounded-xl font-medium shadow">
                Fin Almuerzo
              </button>
            </div>
          </div>
        )}

        {step === "LOCATION" && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-blue-500 mx-auto animate-bounce mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Obteniendo ubicación...</h2>
            {geoError && <p className="text-red-500 mt-2">{geoError}</p>}
          </div>
        )}

        {step === "CAMERA" && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Camera /> Toma una selfie
            </h2>
            {camError && <p className="text-red-500 mb-4">{camError}</p>}
            
            <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl mb-6">
              {!photo ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
              ) : (
                <img src={photo} className="w-full h-full object-cover transform -scale-x-100" />
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            {!photo ? (
              <button onClick={takePhoto} className="bg-blue-600 w-20 h-20 rounded-full border-4 border-blue-200 shadow-xl" />
            ) : (
              <div className="flex w-full gap-4">
                <button onClick={retake} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium">Reintentar</button>
                <button onClick={() => setStep("CONFIRM")} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium">Continuar</button>
              </div>
            )}
          </div>
        )}

        {step === "CONFIRM" && photo && location && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-green-500 mb-6 shadow-lg">
              <img src={photo} className="w-full h-full object-cover transform -scale-x-100" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Resumen de Marcación</h2>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-left space-y-3 mb-8">
              <p className="flex justify-between"><span className="text-gray-500">Tipo:</span> <strong className="text-blue-600">{attendanceType}</strong></p>
              <p className="flex justify-between"><span className="text-gray-500">Hora:</span> <strong>{new Date().toLocaleTimeString()}</strong></p>
              <p className="flex justify-between"><span className="text-gray-500">Precisión GPS:</span> <strong>±{Math.round(location.acc)}m</strong></p>
            </div>

            <button
              onClick={submitAttendance}
              disabled={submitting}
              className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-xl shadow-lg hover:bg-green-600 transition flex justify-center items-center gap-2"
            >
              {submitting ? "Procesando..." : <><CheckCircle2 /> Confirmar Asistencia</>}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
