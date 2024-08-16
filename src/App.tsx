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
   * @fileoverview This file contains the fetchData function for retrieving stock data using AWS Amplify Gen 2.
   * @author Incremental Capitalist
   * @requires aws-amplify/auth
   * @requires aws-amplify/api
   */

  import { fetchAuthSession } from 'aws-amplify/auth';
  import { generateClient } from 'aws-amplify/api';

  // Generate a reusable API client
  const client = generateClient();

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
   * Fetches stock data from the server-side API using AWS Amplify
   * @async
   * @function fetchData
   * @param {number} pageNum - The page number to fetch
   * @param {boolean} append - Whether to append the new data or replace existing data
   * @throws {Error} Throws an error if the API call fails
   */
  const fetchData = async (pageNum: number, append: boolean = false): Promise<void> => {
    try {
      // Set loading state to true as the fetch operation starts
      setLoading(true);
      // Clear any previous errors
      setError(null);
      
      // Fetch the current auth session to get the access token
      // This is required for authenticated API calls
      const { accessToken } = await fetchAuthSession();
      
      // Make a GET request to the '/stock' endpoint using the Amplify API client
      // Pass query parameters and authorization header
      const response = await client.get('/stock', {
        queryParams: {
          symbol: symbol, // The stock symbol to fetch data for
          page: pageNum.toString() // Convert page number to string for query parameter
        },
        headers: {
          Authorization: `Bearer ${accessToken.token}` // Set the Authorization header with the access token
        }
      });
      
      // Check if the response status is not 200 (OK)
      if (response.status !== 200) {
        // If status is not 200, throw an error
        throw new Error('Failed to fetch data from API');
      }
      
      // Extract the data from the response
      const result = response.data;
      // Map the API response to our StockData interface
      const newData: StockData[] = result.data;

      // Update the state based on whether we're appending or replacing data
      if (append) {
        // If appending, combine the new data with the existing data
        setData(prevData => [...prevData, ...newData]);
      } else {
        // If not appending, replace the existing data with the new data
        setData(newData);
      }
      
      // Update the hasMore state to indicate if there's more data to load
      setHasMore(result.hasMore);
      // Update the current page number
      setPage(pageNum);
    } catch (err) {
      // If an error occurs during the fetch operation
      // Set an error message for the user
      setError('Failed to fetch data. Please try again.');
      // Log the detailed error to the console for debugging
      console.error('Detailed error:', err);
    } finally {
      // Regardless of success or failure, set loading to false
      // This indicates that the fetch operation has completed
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