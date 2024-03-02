'use client'

import React, { useEffect } from 'react';
import WebcamComponent from '../components/WebcamComponent';
import { useGoban } from '../contexts/GobanContext';

const Home = () => {
  const goban = useGoban();

  useEffect(() => {
    // goban.printGoban();
  }, [goban]);

  return (
    <div>
      <h1>Webcam Streaming with Canvas</h1>
      <WebcamComponent />
    </div>
  );
};

export default Home