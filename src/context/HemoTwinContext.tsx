/**
 * HemoTwin Global Context & Real-Time Polling Engine
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DigitalTwinResponse,
  RegisteredBagSummary,
  TelemetryPoint,
  DashboardMode,
  DemoScenario,
  BloodProduct,
  BagRegistrationPayload
} from '../types/hemotwin';
import { api } from '../services/api';

interface HemoTwinContextType {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  demoScenario: DemoScenario;
  setDemoScenario: (scenario: DemoScenario) => void;
  isDemoRunning: boolean;
  setIsDemoRunning: (running: boolean) => void;
  selectedBagId: string;
  setSelectedBagId: (id: string) => void;
  selectedProduct: BloodProduct;
  setSelectedProduct: (prod: BloodProduct) => void;
  bags: RegisteredBagSummary[];
  currentTwin: DigitalTwinResponse | null;
  telemetryHistory: TelemetryPoint[];
  backendConnected: boolean;
  isModelLoaded: boolean;
  lastUpdated: string | null;
  pollingInterval: number;
  setPollingInterval: (ms: number) => void;
  isLoading: boolean;
  error: string | null;
  refreshBags: () => Promise<void>;
  registerNewBag: (payload: BagRegistrationPayload) => Promise<boolean>;
  deleteBag: (bagId: string) => Promise<boolean>;
  resetDemo: () => Promise<void>;
  triggerManualSync: () => Promise<void>;
}

const HemoTwinContext = createContext<HemoTwinContextType | null>(null);

export const HemoTwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<DashboardMode>('DEMO');
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('normal');
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(true);
  const [selectedBagId, setSelectedBagId] = useState<string>('HT-001');
  const [selectedProduct, setSelectedProduct] = useState<BloodProduct>('PRBC');
  
  const [bags, setBags] = useState<RegisteredBagSummary[]>([]);
  const [currentTwin, setCurrentTwin] = useState<DigitalTwinResponse | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number>(3000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isDemoRunningRef = useRef(isDemoRunning);
  isDemoRunningRef.current = isDemoRunning;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const scenarioRef = useRef(demoScenario);
  scenarioRef.current = demoScenario;

  const selectedBagIdRef = useRef(selectedBagId);
  selectedBagIdRef.current = selectedBagId;

  const selectedProductRef = useRef(selectedProduct);
  selectedProductRef.current = selectedProduct;

  /**
   * Health and connectivity check
   */
  const checkHealth = useCallback(async () => {
    try {
      const health = await api.getHealth();
      setBackendConnected(true);
      setIsModelLoaded(health.model_loaded);
      setError(null);
      return true;
    } catch (err: any) {
      setBackendConnected(false);
      setIsModelLoaded(false);
      setError("Backend unavailable. Ensure FastAPI server is running on http://127.0.0.1:8000");
      return false;
    }
  }, []);

  /**
   * Refresh bags registry from FastAPI
   */
  const refreshBags = useCallback(async () => {
    try {
      const list = await api.getBags();
      setBags(list);
      // Auto-select first bag if none selected
      if (list.length > 0 && (!selectedBagIdRef.current || !list.some(b => b.bag_id === selectedBagIdRef.current))) {
        setSelectedBagId(list[0].bag_id);
        setSelectedProduct(list[0].blood_product);
      }
    } catch (err) {
      // Backend may be offline
    }
  }, []);

  /**
   * Append point to telemetry history
   */
  const appendTelemetryHistory = useCallback((twin: DigitalTwinResponse) => {
    const point: TelemetryPoint = {
      timestamp: new Date().toLocaleTimeString(),
      temperature_C: twin.current_temperature_C,
      target_temp_C: twin.target_temperature_C,
      deviation_C: twin.temperature_deviation_C,
      accel_rms_g: twin.accel_rms_g,
      gyro_rms_dps: twin.gyro_rms_dps,
      jerk_rms: twin.jerk_rms,
      shock_count: twin.shock_count,
      health_score: twin.health_score,
      remaining_safe_time_hours: twin.remaining_safe_time_hours,
      risk_level: twin.risk_level,
    };

    setTelemetryHistory((prev) => {
      const next = [...prev, point];
      if (next.length > 30) {
        return next.slice(next.length - 30);
      }
      return next;
    });
  }, []);

  /**
   * Single step polling action
   */
  const pollStep = useCallback(async () => {
    const isConnected = await checkHealth();
    if (!isConnected) return;

    if (modeRef.current === 'DEMO') {
      if (!isDemoRunningRef.current) return;

      try {
        const twin = await api.getDemoPrediction(
          scenarioRef.current,
          selectedProductRef.current,
          12.0,
          selectedBagIdRef.current || 'HT-001'
        );
        setCurrentTwin(twin);
        setLastUpdated(new Date().toLocaleTimeString());
        appendTelemetryHistory(twin);
        refreshBags();
      } catch (err: any) {
        console.error("Demo step error:", err);
      }
    } else {
      // LIVE MODE: Do not generate synthetic telemetry!
      // Check if real telemetry exists for bag
      if (selectedBagIdRef.current) {
        try {
          const twin = await api.getBag(selectedBagIdRef.current);
          setCurrentTwin(twin);
          setLastUpdated(new Date().toLocaleTimeString());
          if (twin.data_source === 'live') {
            appendTelemetryHistory(twin);
          }
          refreshBags();
        } catch (err) {
          // Awaiting hardware telemetry
        }
      }
    }
  }, [checkHealth, appendTelemetryHistory, refreshBags]);

  /**
   * Polling interval loop
   */
  useEffect(() => {
    // Initial health check & fetch
    checkHealth().then((ok) => {
      if (ok) {
        refreshBags();
        pollStep();
      }
    });

    const interval = setInterval(() => {
      pollStep();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval, pollStep, checkHealth, refreshBags]);

  /**
   * Register new bag
   */
  const registerNewBag = async (payload: BagRegistrationPayload): Promise<boolean> => {
    try {
      setIsLoading(true);
      await api.registerBag(payload);
      await refreshBags();
      setSelectedBagId(payload.bag_id);
      setSelectedProduct(payload.blood_product);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      setError(`Failed to register bag: ${err.message}`);
      return false;
    }
  };

  /**
   * Delete bag
   */
  const deleteBag = async (bagId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await api.deleteBag(bagId);
      await refreshBags();
      if (selectedBagId === bagId) {
        setSelectedBagId('');
        setCurrentTwin(null);
      }
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      setError(`Failed to delete bag: ${err.message}`);
      return false;
    }
  };

  /**
   * Reset demo state
   */
  const resetDemo = async () => {
    setTelemetryHistory([]);
    setDemoScenario('normal');
    setIsDemoRunning(true);
    await pollStep();
  };

  const triggerManualSync = async () => {
    await pollStep();
  };

  return (
    <HemoTwinContext.Provider
      value={{
        mode,
        setMode,
        demoScenario,
        setDemoScenario,
        isDemoRunning,
        setIsDemoRunning,
        selectedBagId,
        setSelectedBagId,
        selectedProduct,
        setSelectedProduct,
        bags,
        currentTwin,
        telemetryHistory,
        backendConnected,
        isModelLoaded,
        lastUpdated,
        pollingInterval,
        setPollingInterval,
        isLoading,
        error,
        refreshBags,
        registerNewBag,
        deleteBag,
        resetDemo,
        triggerManualSync,
      }}
    >
      {children}
    </HemoTwinContext.Provider>
  );
};

export const useHemoTwin = (): HemoTwinContextType => {
  const context = useContext(HemoTwinContext);
  if (!context) {
    throw new Error('useHemoTwin must be used within a HemoTwinProvider');
  }
  return context;
};
