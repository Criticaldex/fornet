export interface ODataQueryParams {
    serviceUrl: string;
    entity: string;
    username: string;
    password: string;
    filters: {
        property: string;
        operator: string;
        value: string;
    }[];
}

export async function executeODataQuery(params: ODataQueryParams) {
    try {
        // Construir la URL de consulta
        let queryUrl = `${params.serviceUrl}/${params.entity}`;

        // Añadir filtros si existen
        const validFilters = params.filters.filter(f => f.property && f.value);
        if (validFilters.length > 0) {
            const filterString = validFilters.map(filter =>
                `${filter.property} ${filter.operator} ${isNaN(Number(filter.value)) ? `'${filter.value}'` : filter.value}`
            ).join(' and ');

            queryUrl += `?$filter=${encodeURIComponent(filterString)}`;
        }

        // Realizar la petición desde el servidor
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${params.username}:${params.password}`).toString('base64'),
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la consulta: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al ejecutar consulta OData:', error);
        throw error;
    }
}