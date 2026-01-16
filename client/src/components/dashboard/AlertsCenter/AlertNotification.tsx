import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaBell, FaExclamationTriangle, FaFire, FaCheck } from 'react-icons/fa';

interface Alert {
  alert_id: number;
  alert_level: "Low" | "Medium" | "High" | "Critical";
  alert_type: string;
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  sensor?: {
    sensor_id: number;
    name: string;
  } | null;
  created_at: string;
  acknowledged_at: string | null;
}

interface AlertNotificationProps {
  alert: Alert;
  onAcknowledge: (alertId: number) => void;
  onDismiss: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({
  alert,
  onAcknowledge,
  onDismiss,
  autoClose = false,
  autoCloseDelay = 10000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(autoClose ? Math.ceil(autoCloseDelay / 1000) : 0);

  const alertConfig = {
    Critical: {
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      borderColor: 'border-red-700',
      icon: <FaFire className="text-white" />,
      sound: '/sounds/fire-alert.mp3',
      title: 'CRITICAL FIRE ALERT',
      message: 'Fire detected in the system',
    },
    High: {
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      borderColor: 'border-orange-600',
      icon: <FaExclamationTriangle className="text-white" />,
      sound: '/sounds/high-alert.mp3',
      title: 'HIGH RISK ALERT',
      message: 'High risk conditions detected',
    },
    Medium: {
      bgColor: 'bg-yellow-500',
      textColor: 'text-black',
      borderColor: 'border-yellow-600',
      icon: <FaBell className="text-black" />,
      sound: '/sounds/medium-alert.mp3',
      title: 'MEDIUM ALERT',
      message: 'Moderate risk conditions detected',
    },
    Low: {
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      borderColor: 'border-blue-600',
      icon: <FaBell className="text-white" />,
      sound: '/sounds/low-alert.mp3',
      title: 'LOW ALERT',
      message: 'Minor risk conditions detected',
    }
  };

  const config = alertConfig[alert.alert_level];

  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!(window as any).audioContext) {
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          (window as any).audioContext = new AudioContextClass();
        }

        const resumeAudio = async () => {
          if ((window as any).audioContext.state === 'suspended') {
            await (window as any).audioContext.resume();
          }
        };

        const handleInteraction = () => {
          resumeAudio();
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        await resumeAudio();

        return () => {
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };
      } catch (error) {
        console.log('Audio context initialization failed:', error);
      }
    };

    const cleanup = initAudio();

    const timer = setTimeout(() => {
      playAlertSound();

      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }

        if (Notification.permission === 'granted') {
          const notification = new Notification(config.title, {
            body: `${config.message}\nSector: ${alert.sector?.name || 'Not specified'}\nSensor: ${alert.sensor?.name || 'Not specified'}`,
            icon: '/favicon.ico',
            tag: `alert-${alert.alert_id}`,
            requireInteraction: alert.alert_level === 'Critical'
          });

          if (alert.alert_level !== 'Critical') {
            setTimeout(() => {
              notification.close();
            }, 8000);
          }
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const playAlertSound = () => {
    console.log('🎵 Attempting to play sound for alert level:', alert.alert_level);
    try {
      const audioContext = (window as any).audioContext;
      if (!audioContext) {
        console.log('❌ Audio context not available');
        return;
      }

      console.log('✅ Audio context available, state:', audioContext.state);

      if (audioContext.state === 'suspended') {
        console.log('🔄 Resuming suspended audio context...');
        audioContext.resume().then(() => {
          console.log('✅ Audio context resumed');
          playSound(audioContext);
        }).catch(error => {
          console.log('❌ Failed to resume audio context:', error);
        });
      } else {
        console.log('▶️ Playing sound directly');
        playSound(audioContext);
      }

    } catch (error) {
      console.log('❌ Audio playback failed:', error);
    }
  };

  const playSound = (audioContext: any) => {
    console.log('🎵 Generating sound pattern...');
    let frequency = 800;
    let duration = 0.3;
    let repetitions = 1;

    switch (alert.alert_level) {
      case 'Critical':
        frequency = 800;
        duration = 0.2;
        repetitions = 5;
        console.log('🔴 Critical alert: 5 beeps at 800Hz');
        break;
      case 'High':
        frequency = 600;
        duration = 0.3;
        repetitions = 3;
        console.log('🟠 High alert: 3 beeps at 600Hz');
        break;
      case 'Medium':
        frequency = 400;
        duration = 0.5;
        repetitions = 1;
        console.log('🟡 Medium alert: 1 tone at 400Hz');
        break;
      case 'Low':
        frequency = 300;
        duration = 0.3;
        repetitions = 1;
        console.log('🔵 Low alert: 1 soft tone at 300Hz');
        break;
    }

    const playTone = (freq: number, dur: number) => {
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + dur);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + dur);
      } catch (error) {
        console.log('Tone playback failed:', error);
      }
    };

    for (let i = 0; i < repetitions; i++) {
      setTimeout(() => playTone(frequency, duration), i * (duration + 0.1) * 1000);
    }
  };

  useEffect(() => {
    if (!autoClose || !isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoClose, isVisible, onDismiss]);

  const handleAcknowledge = () => {
    onAcknowledge(alert.alert_id);
    setIsVisible(false);
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Notification overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
        <div className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-in fade-in-0 zoom-in-95`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <div className="text-2xl">
                    {config.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${config.textColor} mb-1`}>
                    {config.title}
                  </h3>
                  <p className={`text-sm ${config.textColor} opacity-90 leading-relaxed`}>
                    {config.message}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className={`${config.textColor} hover:opacity-75 transition-all duration-200 hover:bg-white hover:bg-opacity-20 rounded-full p-2`}
                title="Close alert"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Alert Details */}
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-5 mb-6 border border-white border-opacity-20">
              <h4 className={`text-sm font-semibold ${config.textColor} mb-3 uppercase tracking-wide`}>
                Alert Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className={`${config.textColor} opacity-80`}>Type:</span>
                  <span className={`font-medium ${config.textColor} px-2 py-1 bg-white bg-opacity-20 rounded-md`}>
                    {alert.alert_type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${config.textColor} opacity-80`}>Sector:</span>
                  <span className={`font-medium ${config.textColor}`}>
                    {alert.sector?.name || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${config.textColor} opacity-80`}>Sensor:</span>
                  <span className={`font-medium ${config.textColor}`}>
                    {alert.sensor?.name || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${config.textColor} opacity-80`}>Time:</span>
                  <span className={`font-medium ${config.textColor}`}>
                    {new Date(alert.created_at).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Auto close timer */}
            {autoClose && timeLeft > 0 && (
              <div className="mb-6">
                <div className="bg-white bg-opacity-25 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / (autoCloseDelay / 1000)) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-center text-xs ${config.textColor} opacity-80`}>
                  Auto-close in {timeLeft} seconds
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleDismiss}
                className={`px-6 py-3 bg-white bg-opacity-20 ${config.textColor} rounded-lg hover:bg-opacity-30 transition-all duration-200 font-medium border border-white border-opacity-30 hover:border-opacity-50`}
              >
                Dismiss
              </button>
              <button
                onClick={handleAcknowledge}
                className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
              >
                <FaCheck size={16} />
                <span>Acknowledge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertNotification;