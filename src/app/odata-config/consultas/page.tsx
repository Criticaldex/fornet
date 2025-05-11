"use client";
import { useState } from "react";

type SimpleRecord = {
    id: string;
    nombre: string;
};

export default function SimpleTable() {
    // Datos inventados
    const [data, setData] = useState<SimpleRecord[]>([
        { id: "1", nombre: "Clientes" },
        { id: "2", nombre: "Productos" },
        { id: "3", nombre: "Ventas" },
        { id: "4", nombre: "Proveedores" },
        { id: "5", nombre: "Empleados" },
        { id: "6", nombre: "Pedidos" },
        { id: "7", nombre: "Inventario" },
        { id: "8", nombre: "Facturas" },
        { id: "9", nombre: "Categorías" },
        { id: "10", nombre: "Usuarios" },
    ]);

    // Estado para los registros seleccionados
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    // Estado para controlar el diálogo
    const [showDialog, setShowDialog] = useState(false);
    // Estado para almacenar la tabla actual seleccionada
    const [currentTable, setCurrentTable] = useState("");

    // Manejar selección/deselección
    const handleCheckboxChange = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            } else {
                return prev.length < 5 ? [...prev, id] : prev;
            }
        });
    };

    // Función para el botón "Ver consulta"
    const handleViewQuery = (nombre: string) => {
        setCurrentTable(nombre);
        setShowDialog(true);
    };

    return (
        <div className="p-6 bg-gray-900 rounded-lg border border-orange-500">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">
                Tablas
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 border border-gray-700">
                    <thead>
                        <tr className="bg-gray-700 text-orange-400">
                            <th className="py-2 px-4 text-left">Seleccionar</th>
                            <th className="py-2 px-4 text-left">Nombre de la Consulta</th>
                            <th className="py-2 px-4 text-left">  </th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {data.map((item) => (
                            <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-750">
                                <td className="py-2 px-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleCheckboxChange(item.id)}
                                        disabled={!selectedIds.includes(item.id) && selectedIds.length >= 5}
                                        className="h-4 w-4 text-orange-600 border-gray-600 rounded bg-gray-700 focus:ring-orange-500"
                                    />
                                </td>
                                <td className="py-2 px-4">{item.nombre}</td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => handleViewQuery(item.nombre)}
                                        className="text-orange-400 hover:text-orange-300 underline"
                                    >
                                        Ver consulta
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-orange-300">
                {selectedIds.length > 0 ? (
                    <p>Seleccionados: {selectedIds.length} de 5 máximos</p>
                ) : (
                    <p>Puedes seleccionar hasta 5 tablas</p>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => {
                            const selectedNames = data
                                .filter(item => selectedIds.includes(item.id))
                                .map(item => item.nombre);
                            alert(`Tablas seleccionadas:\n${selectedNames.join('\n')}`);
                        }}
                        className="bg-orange-600 text-black py-2 px-4 rounded hover:bg-orange-500 font-bold transition-colors"
                    >
                        Procesar selección
                    </button>
                </div>
            )}

            {/* Diálogo para mostrar la consulta */}
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-orange-500">
                                Consulta para: {currentTable}
                            </h3>
                            <button
                                onClick={() => setShowDialog(false)}
                                className="text-orange-500 hover:text-orange-300 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-800 p-4 rounded border border-gray-700">
                            <pre className="text-gray-300 text-sm">
                                {`// Consulta MongoDB para la colección ${currentTable}
db.${currentTable.toLowerCase()}.find({})
  .project({ _id: 1, nombre: 1 })
  .limit(10)
  .sort({ _id: 1 });

// Resultado de ejemplo:
[
  {
    "_id": "5f8d8f9d8c9d7e8f6g5h4j3k",
    "nombre": "Ejemplo 1",
    "fechaCreacion": "${new Date().toISOString()}"
  },
  {
    "_id": "6g7h8j9k0l1m2n3b4v5c6x7",
    "nombre": "Ejemplo 2",
    "fechaCreacion": "${new Date(Date.now() - 86400000).toISOString()}"
  },
  {
    "_id": "1a2s3d4f5g6h7j8k9l0q1w2e",
    "nombre": "Ejemplo 3",
    "fechaCreacion": "${new Date(Date.now() - 172800000).toISOString()}"
  }
]`}
                            </pre>
                        </div>
                        <div className="mt-4 flex justify-end gap-x-4">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="bg-orange-600 text-black py-2 px-4 rounded hover:bg-orange-500 font-bold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}