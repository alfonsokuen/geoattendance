"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:3001/attendance", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(console.error);
    }
  }, [token]);

  if (!user || user.role === "EMPLOYEE") return <div className="p-8 text-center">Acceso Denegado</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel Administrativo</h1>
        <button onClick={logout} className="text-red-500 font-medium hover:underline">Cerrar Sesión</button>
      </header>

      <main className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Marcaciones Recientes</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600">Empleado</th>
                <th className="p-4 font-semibold text-gray-600">Sucursal</th>
                <th className="p-4 font-semibold text-gray-600">Tipo</th>
                <th className="p-4 font-semibold text-gray-600">Fecha y Hora</th>
                <th className="p-4 font-semibold text-gray-600">Zona GPS</th>
                <th className="p-4 font-semibold text-gray-600">Selfie</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{record.employee.firstName} {record.employee.lastName}</td>
                  <td className="p-4">{record.employee.branch.name}</td>
                  <td className="p-4 font-medium text-blue-600">{record.type}</td>
                  <td className="p-4">{format(new Date(record.timestamp), "dd MMM yyyy, h:mm a", { locale: es })}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${record.zoneStatus === 'INSIDE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {record.zoneStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.selfieUrl ? (
                      <a href={`http://${record.selfieUrl}`} target="_blank" className="text-blue-500 hover:underline">Ver Foto</a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">No hay marcaciones aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
