/**
 * @fileoverview React component to display historical stock data using Lightweight Charts
 * @author Incremental Capitalist
 */

import React, { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
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
   * Fetches stock data from the API
   * @param {number} pageNum - The page number to fetch
   * @param {boolean} append - Whether to append the new data or replace existing data
   */
  const fetchData = async (pageNum: number, append: boolean = false) => {
    try {
      // Set loading state to true before fetching data
      setLoading(true);
      setError(null);
      // Replace this with actual API call when backend is set up
      const response = { 
        data: Array(50).fill(null).map((_, i) => ({
          t: Date.now() + i * 86400000,
          o: 100 + Math.random() * 10,
          h: 105 + Math.random() * 10,
          l: 95 + Math.random() * 10,
          c: 100 + Math.random() * 10,
          v: 1000000 + Math.random() * 1000000
        })), 
        hasMore: pageNum < 3 
      };
      
      if (append) {
        setData(prevData => [...prevData, ...response.data]);
      } else {
        setData(response.data);
      }
      
      // Update other states based on API response
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      // Set error state if API call fails
      setError('Failed to fetch data. Please try again.');
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
            background: { type: 'solid', color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
        });
        window.addEventListener('resize', handleResize);
      }

      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });
      candlestickSeries.setData(data.map(d => ({
        time: new Date(d.t).getTime() / 1000 as Time,
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

  // Render error message if there's an error
  if (error) return <div>{error}</div>;

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