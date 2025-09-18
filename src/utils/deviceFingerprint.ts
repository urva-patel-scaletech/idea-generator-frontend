export interface DeviceInfo {
  deviceId: string;
  platform: 'web' | 'mobile';
}

class DeviceService {
  private static instance: DeviceService;
  private deviceId: string | null = null;

  private constructor() {}

  static getInstance(): DeviceService {
    if (!DeviceService.instance) {
      DeviceService.instance = new DeviceService();
    }
    return DeviceService.instance;
  }

  getDeviceInfo(): DeviceInfo {
    if (!this.deviceId) {
      this.deviceId = this.getOrCreateDeviceId();
    }

    return {
      deviceId: this.deviceId,
      platform: 'web',
    };
  }

  private getOrCreateDeviceId(): string {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem('ai_factory_device_id');

    if (!deviceId) {
      // Generate simple random device ID
      deviceId = this.generateSimpleDeviceId();
      localStorage.setItem('ai_factory_device_id', deviceId);
      localStorage.setItem('ai_factory_device_created', new Date().toISOString());
    }

    return deviceId;
  }

  private generateSimpleDeviceId(): string {
    // Simple random ID with timestamp
    const randomPart = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    return `web_${timestamp}_${randomPart}`;
  }

  // For mobile app (future use)
  setMobileDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
    localStorage.setItem('ai_factory_device_id', deviceId);
  }

  clearDeviceId(): void {
    this.deviceId = null;
    localStorage.removeItem('ai_factory_device_id');
    localStorage.removeItem('ai_factory_device_created');
  }
}

export const deviceService = DeviceService.getInstance();
