import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import Chart from 'react-apexcharts';
import {DatePicker} from 'antd'
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(customParseFormat);
const dateFormat = 'DD-MM-YYYY';
const url = 'http://localhost:8000/fetch_graph'

dayjs.extend(utc);
dayjs.extend(timezone);
const today = dayjs().tz('Asia/Ho_Chi_Minh')
const oneWeekAgo = today.subtract(1, 'week');
const LineChart = ({ xAxisData, yAxisData }) => {
    const [series, setSeries] = useState([{ data: yAxisData }]);
  
    const options = {
      chart: {
        type: 'line'
      },    
      xaxis: {
        categories: xAxisData
      },
      colors: ['#ff7f00']
    };
  
    return (
      <Chart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    );
  };
  
  const DrawGraph = () => {
    const dateFormat = 'DD-MM-YYYY';
    const today = dayjs().tz('Asia/Ho_Chi_Minh');
    const oneWeekAgo = today.subtract(1, 'week');

    const [xAxisData, setXAxisData] = useState([]);
    const [yAxisData, setYAxisData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [device, setDevice] = useState('Device 1');
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetch_data();
    }, [device, selectedDate]); // Trigger fetch_data on device or date change

    const fetch_data = async () => {
        setFetching(true);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Access-Control-Allow-Origin' : 'origin',
                  'Access-Control-Allow-Headers':'Content-Type, Authorization,X-Api-Key,X-Amz-Security-Token',
                  'Access-Control-Allow-Credentials' : true,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                },
                body: JSON.stringify({
                    'date': selectedDate.format(dateFormat),
                    'device': device
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            setXAxisData(data.time);
            setYAxisData(data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };


    if (fetching) {
        return (
            <div style={{ backgroundSize: 'cover', backgroundColor: '#defdfd', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundSize: 'cover', backgroundColor: '#defdfd', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3>SENSOR DATA</h3>
            <div className='d-inline-flex mt-3'>
                <h3 className='pe-3'>Device:</h3>
                <select className="form-select" style={{ width: 'fit-content' }} defaultValue={device} onChange={(e) => setDevice(e.target.value)}>
                    <option value="Device 1">Device 1</option>
                    <option value="Device 2">Device 2</option>
                </select>
                <div className='pe-3'></div>
                <h3 className='pe-3'>Date: </h3>
                <DatePicker
                    defaultValue={dayjs(today, dateFormat)}
                    minDate={dayjs(oneWeekAgo, dateFormat)}
                    maxDate={dayjs(today, dateFormat)}
                    // dateFormat={dateFormat}
                    onChange={handleDateChange}
                />
                <div className='pe-3'></div>
                {/* <button type="button" className="btn btn-secondary" onClick={handleFetchData}>Fetch Data</button> */}
            </div>
            <LineChart xAxisData={xAxisData} yAxisData={yAxisData} />
        </div>
    );
    }



    

export default DrawGraph