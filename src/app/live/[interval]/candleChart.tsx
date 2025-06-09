'use client'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import HighchartsPriceIndicator from 'highcharts/modules/price-indicator'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import { useRef, useState, useEffect } from 'react'
import { chartOptions } from '@/components/chart.components'
import { getMappedCandleValues } from '@/services/values'
import { useSession } from 'next-auth/react'

if (typeof Highcharts === "object") {
    HighchartsExporting(Highcharts)
    HighchartsExportData(Highcharts)
    HighchartsData(Highcharts)
    HighchartsPriceIndicator(Highcharts)
    HighchartsAccessibility(Highcharts)
}

export function CandleChart({ i, line, name, unit, interval }: any) {
    const candleDuration = 30 * 60 * 1000; // 30 minutos
    const currentCandleRef = useRef<any>(null); // Inicializar como null
    const lastTimestampRef = useRef<number>(0);
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [initialData, setInitialData] = useState<any[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMappedCandleValues(
                    { line: line, name: name, interval: interval },
                    session?.user.db
                );
                setInitialData(data);

                // Inicializar currentCandleRef con la última vela histórica
                if (data.length > 0) {
                    const lastCandle = data[data.length - 1];
                    currentCandleRef.current = {
                        open: lastCandle[1],
                        high: lastCandle[2],
                        low: lastCandle[3],
                        close: lastCandle[4],
                        timestamp: lastCandle[0],
                    };
                    setLastPrice(lastCandle[4]);
                    lastTimestampRef.current = lastCandle[0];
                }
            } catch (error) {
                console.error('Error fetching candle data:', error);
            }
        };

        fetchData();
    }, [line, name, interval, session]);

    const fetchLastValue = async (line: string, name: string) => {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/lastValue`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
                return data[0][1];
            }
            throw new Error('Formato de datos no reconocido');
        } catch (error) {
            console.error('Error en fetchLastValue:', error);
            return null;
        }
    };

    const updateCandleData = async (series: any, timestamp: number, line: string, name: string) => {
        try {
            if (!series || !series.data) return;

            const now = Date.now();
            const candleStart = Math.floor(now / candleDuration) * candleDuration;
            const shouldCreateNewCandle =
                !currentCandleRef.current || currentCandleRef.current.timestamp < candleStart;

            const apiValue = await fetchLastValue(line, name);
            if (apiValue === null) return;

            if (shouldCreateNewCandle) {
                if (currentCandleRef.current) {
                    series.addPoint(
                        [
                            currentCandleRef.current.timestamp,
                            currentCandleRef.current.open,
                            currentCandleRef.current.high,
                            currentCandleRef.current.low,
                            currentCandleRef.current.close,
                        ],
                        true,
                        false
                    );
                }

                const lastClose = series.data.length > 0 ? series.data[series.data.length - 1].close : apiValue;

                currentCandleRef.current = {
                    open: lastClose,
                    high: apiValue,
                    low: apiValue,
                    close: apiValue,
                    timestamp: candleStart,
                };
                lastTimestampRef.current = candleStart;

                series.addPoint([candleStart, lastClose, apiValue, apiValue, apiValue], true, false);
            } else {
                const newPrice = apiValue;

                currentCandleRef.current = {
                    open: currentCandleRef.current.open,
                    high: Math.max(currentCandleRef.current.high, newPrice),
                    low: Math.min(currentCandleRef.current.low, newPrice),
                    close: newPrice,
                    timestamp: currentCandleRef.current.timestamp,
                };

                setLastPrice(newPrice);

                const lastPoint = series.data[series.data.length - 1];
                if (lastPoint && lastPoint.update) {
                    lastPoint.update(
                        {
                            high: currentCandleRef.current.high,
                            low: currentCandleRef.current.low,
                            close: currentCandleRef.current.close,
                        },
                        true
                    );
                }
            }
        } catch (error) {
            console.error('Error en updateCandleData:', error);
        }
    };

    const options = {
        title: { text: '' },
        chart: {
            marginLeft: 30,
            marginRight: 30,
            events: {
                load: function (this: any) {
                    const chart = this;
                    const series = chart.series[0];
                    if (series && series.data.length > 0) {
                        const lastPoint = series.data[series.data.length - 1];
                        currentCandleRef.current = {
                            open: lastPoint.open,
                            high: lastPoint.high,
                            low: lastPoint.low,
                            close: lastPoint.close,
                            timestamp: lastPoint.x,
                        };
                        setLastPrice(lastPoint.close);
                        lastTimestampRef.current = lastPoint.x;
                    }

                    const intervalId = setInterval(() => {
                        updateCandleData(series, Date.now(), line, name);
                    }, 1000);

                    chart.intervalId = intervalId;
                },
                destroy: function (this: any) {
                    if (this.intervalId) {
                        clearInterval(this.intervalId);
                    }
                },
            },
        },
        xAxis: {
            type: 'datetime',
            gridLineWidth: 2,
            tickInterval: 30 * 60 * 1000, // Ticks cada 30 minutos
        },
        legend: {
            enabled: false,
        },
        yAxis: {
            labels: {
                align: 'left',
                x: -10,
                overflow: 'justify',
            },
            opposite: false,
        },
        rangeSelector: {
            enabled: false,
        },
        navigator: {
            enabled: false,
        },
        exporting: {
            enabled: true,
        },
        credits: {
            enabled: false,
        },
        tooltip: {
            backgroundColor: '#f76f20',
            borderColor: '#ff9900',
            borderRadius: 8,
            style: {
                color: 'white',
                fontWeight: 'bold',
            },
            positioner: function (labelWidth: number, labelHeight: number, point: any) {
                return {
                    x: point.plotX + 20,
                    y: point.plotY - labelHeight - 10,
                };
            },
        },
        plotOptions: {
            candlestick: {
                dataGrouping: { enabled: false },
                lastPrice: {
                    enabled: true,
                    color: '#f76f20',
                    label: {
                        enabled: true,
                        align: 'left',
                        x: 20,
                        y: 10,
                        style: {
                            color: '#f76f20',
                            fontWeight: 'bold',
                        },
                        backgroundColor: '#f76f20',
                        borderColor: '#FF0000',
                        borderRadius: 3,
                        borderWidth: 1,
                        padding: 4,
                        formatter: function (this: any) {
                            return Highcharts.numberFormat(lastPrice || 0, 2);
                        },
                    },
                },
            },
        },
        series: [
            {
                type: 'candlestick',
                name: 'Value',
                color: '#FF7F7F',
                upColor: '#90EE90',
                data: initialData,
            },
        ],
    };

    if (initialData.length === 0) {
        return <div className="m-2">Loading chart data...</div>;
    }

    return (
        <div className="m-2" style={{ width: '100%', minWidth: '600px' }}>
            <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options} />
        </div>
    );
}