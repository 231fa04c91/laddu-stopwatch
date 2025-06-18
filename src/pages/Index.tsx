
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Sun, Moon, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Clock update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTimeRef.current);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Sound feedback functions
  const playSound = (frequency: number, duration: number = 100) => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Stopwatch functions
  const startStopwatch = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - stopwatchTime;
      setIsRunning(true);
      playSound(800, 150);
    } else {
      setIsRunning(false);
      playSound(600, 150);
    }
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setStopwatchTime(0);
    setLapTimes([]);
    playSound(400, 200);
  };

  const addLap = () => {
    if (isRunning) {
      setLapTimes(prev => [...prev, stopwatchTime]);
      playSound(1000, 100);
    }
  };

  // Format time display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const formatClockTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="container mx-auto p-4">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-cyan-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
            LADDU Stopwatch
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`${isDarkMode ? 'border-cyan-500/30 hover:border-cyan-400' : 'border-blue-300 hover:border-blue-500'} transition-all duration-300`}
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? 'text-green-500' : 'text-gray-500'}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`${isDarkMode ? 'border-cyan-500/30 hover:border-cyan-400' : 'border-blue-300 hover:border-blue-500'} transition-all duration-300`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Live Clock */}
          <Card className={`p-8 backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/20 border-cyan-500/20' : 'bg-white/40 border-blue-200/40'} transition-all duration-500 hover:shadow-2xl ${isDarkMode ? 'hover:shadow-cyan-500/20' : 'hover:shadow-blue-500/20'}`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                  Live Clock
                </h2>
              </div>
              <div className={`text-6xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} clock-glow transition-all duration-300`}>
                {formatClockTime(currentTime)}
              </div>
              <div className={`text-lg mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </Card>

          {/* Stopwatch */}
          <Card className={`p-8 backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/20 border-purple-500/20' : 'bg-white/40 border-purple-200/40'} transition-all duration-500 hover:shadow-2xl ${isDarkMode ? 'hover:shadow-purple-500/20' : 'hover:shadow-purple-500/20'}`}>
            <div className="text-center">
              <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Stopwatch
              </h2>
              <div className={`text-6xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} stopwatch-glow transition-all duration-300 mb-6`}>
                {formatTime(stopwatchTime)}
              </div>
              
              <div className="flex justify-center gap-3 mb-6">
                <Button
                  onClick={startStopwatch}
                  className={`px-6 py-3 ${isRunning 
                    ? `${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white` 
                    : `${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`
                  } transition-all duration-300 transform hover:scale-105 button-ripple`}
                >
                  {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isRunning ? 'Stop' : 'Start'}
                </Button>
                
                <Button
                  onClick={addLap}
                  disabled={!isRunning}
                  variant="outline"
                  className={`px-6 py-3 ${isDarkMode ? 'border-cyan-500/30 hover:border-cyan-400 text-cyan-400' : 'border-blue-300 hover:border-blue-500 text-blue-600'} transition-all duration-300 transform hover:scale-105 disabled:opacity-50`}
                >
                  Lap
                </Button>
                
                <Button
                  onClick={resetStopwatch}
                  variant="outline"
                  className={`px-6 py-3 ${isDarkMode ? 'border-orange-500/30 hover:border-orange-400 text-orange-400' : 'border-orange-300 hover:border-orange-500 text-orange-600'} transition-all duration-300 transform hover:scale-105`}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Lap Times */}
        {lapTimes.length > 0 && (
          <Card className={`mt-8 p-6 backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/20 border-green-500/20' : 'bg-white/40 border-green-200/40'} transition-all duration-500`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              Lap Times
            </h3>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {lapTimes.map((lapTime, index) => (
                <div 
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'} transition-all duration-300 hover:scale-[1.02] lap-item`}
                >
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Lap {index + 1}
                  </span>
                  <span className={`font-mono text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatTime(lapTime)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <style>
        {`
          .clock-glow {
            text-shadow: 0 0 20px ${isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
            animation: pulse-glow 2s ease-in-out infinite alternate;
          }
          
          .stopwatch-glow {
            text-shadow: 0 0 20px ${isDarkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(147, 51, 234, 0.3)'};
            animation: ${isRunning ? 'running-glow 0.5s ease-in-out infinite alternate' : 'pulse-glow 2s ease-in-out infinite alternate'};
          }
          
          .button-ripple {
            position: relative;
            overflow: hidden;
          }
          
          .button-ripple:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          
          .button-ripple:active:before {
            width: 300px;
            height: 300px;
          }
          
          .lap-item {
            animation: fade-in 0.3s ease-out;
          }
          
          @keyframes pulse-glow {
            from {
              text-shadow: 0 0 20px ${isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
            }
            to {
              text-shadow: 0 0 30px ${isDarkMode ? 'rgba(34, 197, 94, 0.8)' : 'rgba(59, 130, 246, 0.5)'};
            }
          }
          
          @keyframes running-glow {
            from {
              text-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
            }
            to {
              text-shadow: 0 0 40px rgba(168, 85, 247, 1);
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Index;
