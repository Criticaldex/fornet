"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { executeODataQuery } from "@/services/odata";
import { useState } from "react";

type FormValues = {
    serviceUrl: string;
    entity: string;
    username: string;
    password: string;
    filters: {
        property: string;
        operator: string;
        value: string;
    }[];
};

export default function ODataForm() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            serviceUrl: "",
            entity: "",
            username: "",
            password: "",
            filters: [{ property: "", operator: "eq", value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "filters",
    });

    // Estado para controlar la visibilidad del diálogo
    const [showDialog, setShowDialog] = useState(false);

    const onSubmit = (data: FormValues) => {
        console.log("Datos enviados:", data);
        alert("Configuración guardada correctamente");
    };

    const [queryResults, setQueryResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queryName, setQueryName] = useState("");

    const handleSaveQuery = (name: string) => {
        console.log("Guardando consulta:", name, queryResults);
    };

    const handleExecute = handleSubmit(async (data: FormValues) => {
        setIsLoading(true);
        setError(null);
        setShowDialog(true); // Mostrar el diálogo inmediatamente

        try {
            const response = await fetch('/api/odata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceUrl: data.serviceUrl,
                    entity: data.entity,
                    username: data.username,
                    password: data.password,
                    filters: data.filters.filter(f => f.property && f.value)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la consulta');
            }

            const results = await response.json();
            setQueryResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-gray-900 p-6 rounded-lg shadow-lg border border-orange-500"
            >
                <h2 className="text-xl font-semibold mb-4 text-orange-500">Configuración OData</h2>

                {/* Campos del formulario (sin cambios) */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-orange-400">URL del Servicio OData *</label>
                    <input
                        {...register("serviceUrl", { required: "Campo obligatorio" })}
                        type="text"
                        className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white placeholder-gray-400"
                        placeholder="https://servicio.sap.com/odata"
                    />
                    {errors.serviceUrl && (
                        <p className="mt-1 text-sm text-orange-300">{errors.serviceUrl.message}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-orange-400">Entidad *</label>
                    <input
                        {...register("entity")}
                        type="text"
                        className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white placeholder-gray-400"
                        placeholder="Ej: Productos"
                    />
                    {errors.entity && (
                        <p className="mt-1 text-sm text-orange-300">{errors.entity.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-orange-400">Usuario *</label>
                        <input
                            {...register("username")}
                            type="text"
                            className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-orange-400">Contraseña *</label>
                        <input
                            {...register("password", { required: "Campo obligatorio" })}
                            type="password"
                            className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-orange-400">Filtros</label>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 mb-2 items-end">
                            <div className="col-span-5">
                                <input
                                    {...register(`filters.${index}.property`)}
                                    placeholder="Propiedad"
                                    className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white placeholder-gray-400"
                                />
                            </div>
                            <div className="col-span-3">
                                <select
                                    {...register(`filters.${index}.operator`)}
                                    className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white"
                                >
                                    <option value="eq">= (Igual)</option>
                                    <option value="ne">≠ (Distinto)</option>
                                    <option value="gt">&gt; (Mayor que)</option>
                                    <option value="lt">&lt; (Menor que)</option>
                                    <option value="ge">≥ (Mayor o igual)</option>
                                    <option value="le">≤ (Menor o igual)</option>
                                    <option value="contains">Contiene</option>
                                </select>
                            </div>
                            <div className="col-span-3">
                                <input
                                    {...register(`filters.${index}.value`)}
                                    placeholder="Valor"
                                    className="w-full p-2 border border-orange-500 rounded bg-gray-900 text-white placeholder-gray-400"
                                />
                            </div>
                            <div className="col-span-1">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-orange-500 hover:text-orange-300"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => append({ property: "", operator: "eq", value: "" })}
                        className="text-sm text-orange-500 hover:text-orange-300"
                    >
                        + Añadir filtro
                    </button>
                </div>

                {/* Botón de Ejecutar */}
                <button
                    type="button"
                    onClick={handleExecute}
                    className="w-full bg-orange-600 text-black py-2 px-4 rounded hover:bg-orange-500 font-bold transition-colors"
                >
                    Ejecutar Consulta
                </button>
            </form>

            {/* Diálogo para mostrar resultados */}
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-orange-500">Resultado de la Consulta</h3>
                            <button
                                onClick={() => setShowDialog(false)}
                                className="text-orange-500 hover:text-orange-300 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-800 p-4 rounded border border-gray-700">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                </div>
                            ) : error ? (
                                <div className="text-red-400 p-4 bg-red-900 rounded">
                                    <strong>Error:</strong> {error}
                                </div>
                            ) : queryResults ? (
                                <pre className="text-gray-300 text-sm overflow-auto">
                                    {JSON.stringify(queryResults, null, 2)}
                                </pre>
                            ) : (
                                <div className="text-gray-400">No hay resultados para mostrar</div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex-1 flex items-center space-x-2 mr-4">
                                <input
                                    type="text"
                                    value={queryName}
                                    onChange={(e) => setQueryName(e.target.value)}
                                    className="flex-1 p-2 border border-orange-500 rounded bg-gray-900 text-white placeholder-gray-400"
                                    placeholder="Nombre de la consulta"
                                    required
                                />
                                {!queryName && (
                                    <span className="text-sm text-orange-300">*</span>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        if (!queryName.trim()) {
                                            alert("Debes ingresar un nombre para la consulta");
                                            return;
                                        }
                                        // Aquí ejecutas tu función para guardar
                                        handleSaveQuery(queryName);
                                        setShowDialog(false);
                                        setQueryName("");
                                    }}
                                    className="bg-orange-600 text-black py-2 px-4 rounded hover:bg-orange-500 font-bold transition-colors"
                                >
                                    Guardar Consulta
                                </button>
                                <button
                                    onClick={() => setShowDialog(false)}
                                    className="bg-orange-600 text-black py-2 px-4 rounded hover:bg-orange-500 font-bold transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}