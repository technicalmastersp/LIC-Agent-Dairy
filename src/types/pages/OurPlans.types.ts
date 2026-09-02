
export interface Plan {
  id: string;
  planType?: string;
  duration: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
}
