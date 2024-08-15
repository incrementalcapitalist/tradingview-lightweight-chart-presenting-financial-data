/**
 * @fileoverview React component to display historical stock data using Lightweight Charts
 * @author Incremental Capitalist
 */

import React, { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, Time, LayoutOptions } from 'lightweight-charts';
import './App.css'; // We'll create this file for custom styles

/**
 * Interface for individual stock data points
 * @interface StockData
 * @property {number} t - The timestamp of the data point in milliseconds
 * @property {number} o - The opening price
 * @property {number} h - The highest price
 * @property {number} l - The lowest price
 * @property {number} c - The closing price
 * @property {number} v - The trading volume
 */
interface StockData {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

/**
 * Main App component for displaying stock data chart
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  // State to store the fetched stock data
  const [data, setData] = useState<StockData[]>([]);
  // State to manage loading status
  const [loading, setLoading] = useState<boolean>(false);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);
  // State to store the current stock symbol
  const [symbol, setSymbol] = useState<string>('AAPL');
  // State to keep track of the current page number for pagination
  const [page, setPage] = useState<number>(1);
  // State to indicate if there are more pages of data to load
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Ref to store the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  /**
   * Fetches stock data from the server-side API
   * @param {number} pageNum - The page number to fetch
   * @param {boolean} append - Whether to append the new data or replace existing data
   */
  const fetchData = async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const limit = 50;
      const offset = (pageNum - 1) * limit;
      
      // Call your server-side API endpoint
      const response = await fetch(`/api/stock-data?symbol=${symbol}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Assuming the server returns data in the same format as before
      const newData: StockData[] = result.data.map((item: any) => ({
        t: item.t,
        o: item.o,
        h: item.h,
        l: item.l,
        c: item.c,
        v: item.v
      }));

      if (append) {
        setData(prevData => [...prevData, ...newData]);
      } else {
        setData(newData);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch initial data on component mount or when symbol changes
  useEffect(() => {
    fetchData(1);
  }, [symbol]);

  // Effect to create and update chart when data changes
useEffect(() => {
    // Check if chart container exists and data is available
  if (chartContainerRef.current && data.length > 0) {
      // Create new chart if it doesn't exist
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { 
            type: 'solid',
            color: '#ffffff' 
          },
          textColor: '#333',
        } as LayoutOptions,
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
      });
      window.addEventListener('resize', handleResize);
    }

      // Add and configure candlestick series
    const candlestickSeries = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a', 
      downColor: '#ef5350', 
      borderVisible: false,
      wickUpColor: '#26a69a', 
      wickDownColor: '#ef5350',
    });
    
      // Set data for the candlestick series
    candlestickSeries.setData(data.map(d => ({
      time: d.t / 1000 as Time,
      open: d.o,
      high: d.h,
      low: d.l,
      close: d.c,
    })));
  }

    // Cleanup function to remove chart when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
}, [data]);

  /**
   * Handles window resize events to adjust chart width
   */
  const handleResize = () => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    }
  };

  /**
   * Handles changes in the symbol input field
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(event.target.value.toUpperCase());
  };

  /**
   * Handles form submission to fetch data for a new symbol
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchData(1);
  };

  /**
   * Loads more data when the "Load More" button is clicked
   */
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchData(page + 1, true);
    }
  };

  return (
    <div className="app-container">
      <h1>Stock Data Visualization</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={symbol}
          onChange={handleSymbolChange}
          placeholder="Enter stock symbol"
          className="search-input"
        />
        <button type="submit" className="search-button">Fetch Data</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      <div ref={chartContainerRef} className="chart-container" />
      {loading && <div className="loading-spinner">Loading...</div>}
      {hasMore && !loading && (
        <button onClick={loadMore} className="load-more-button">Load More</button>
      )}
    </div>
  );
};

export default App;