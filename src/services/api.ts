/**
 * Centralized API Service for HemoTwin FastAPI Backend
 */
import {
  HealthResponse,
  ModelInfo,
  RegisteredBagSummary,
  DigitalTwinResponse,
  BagRegistrationPayload,
  StatelessPredictPayload,
  StatelessPredictResponse,
  DemoScenario,
  BloodProduct
} from '../types/hemotwin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(url: string = API_BASE_URL) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error [${response.status}] ${response.statusText}: ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${endpoint} timed out.`);
      }
      throw err;
    }
  }

  /**
   * Health Check
   */
  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  /**
   * Model & Experiment Metadata
   */
  public async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>('/model-info');
  }

  /**
   * Retrieve list of registered bags
   */
  public async getBags(): Promise<RegisteredBagSummary[]> {
    return this.request<RegisteredBagSummary[]>('/bags');
  }

  /**
   * Retrieve stateful digital twin state for a specific bag
   */
  public async getBag(bagId: string): Promise<DigitalTwinResponse> {
    return this.request<DigitalTwinResponse>(`/bags/${encodeURIComponent(bagId)}`);
  }

  /**
   * Register a new blood bag into digital twin tracking
   */
  public async registerBag(payload: BagRegistrationPayload): Promise<RegisteredBagSummary> {
    return this.request<RegisteredBagSummary>('/bags/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Remove a bag from tracking
   */
  public async deleteBag(bagId: string): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>(`/bags/${encodeURIComponent(bagId)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Ingest streaming telemetry into a bag's digital twin
   */
  public async sendTelemetry(bagId: string, telemetry: Partial<StatelessPredictPayload>): Promise<DigitalTwinResponse> {
    return this.request<DigitalTwinResponse>(`/bags/${encodeURIComponent(bagId)}/telemetry`, {
      method: 'POST',
      body: JSON.stringify(telemetry),
    });
  }

  /**
   * Run stateless inference without updating bag state
   */
  public async predictStateless(telemetry: StatelessPredictPayload): Promise<StatelessPredictResponse> {
    return this.request<StatelessPredictResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(telemetry),
    });
  }

  /**
   * Request synthetic scenario telemetry packet from demo generator
   */
  public async getDemoPrediction(
    scenario: DemoScenario = 'normal',
    product: BloodProduct = 'PRBC',
    storageHours: number = 12.0,
    bagId: string = 'HT-001'
  ): Promise<DigitalTwinResponse> {
    return this.request<DigitalTwinResponse>('/demo/predict', {
      method: 'POST',
      body: JSON.stringify({
        scenario,
        blood_product: product,
        storage_hours: storageHours,
        bag_id: bagId,
      }),
    });
  }
}

export const api = new ApiService();
