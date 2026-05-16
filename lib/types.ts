export type LeadStatus =
  | "novo_lead"
  | "qualificacao"
  | "call_agendada"
  | "proposta_enviada"
  | "negociacao"
  | "fechado"
  | "onboarding"
  | "retainer"
  | "upsell"
  | "perdido";

export type LeadSource =
  | "instagram"
  | "tiktok"
  | "meta_ads"
  | "indicacao"
  | "site"
  | "networking";

export type ServiceType =
  | "social_media"
  | "meta_ads"
  | "google_ads"
  | "landing_page"
  | "recruiting_ads"
  | "branding";

export type ContentStatus =
  | "ideia"
  | "roteiro"
  | "aprovado"
  | "design"
  | "edicao"
  | "agendamento"
  | "postado"
  | "analytics";

export type CampaignObjective =
  | "leads"
  | "recruiting"
  | "awareness"
  | "conversion";

export type PaymentStatus = "pago" | "pendente" | "atrasado" | "cancelado";

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  niche: string;
  revenue: string;
  advertises: boolean;
  need: string;
  ticket: string;
  createdAt: string;
  lastContact: string;
  notes: string;
  assignedTo: string;
}

export interface Client {
  id: string;
  company: string;
  owner: string;
  phone: string;
  email: string;
  city: string;
  niche: string;
  website: string;
  instagram: string;
  tiktok: string;
  objective: string;
  icp: string;
  offer: string;
  pains: string;
  differentials: string;
  competitors: string;
  services: ServiceType[];
  monthlyFee: number;
  dueDate: number;
  paymentStatus: PaymentStatus;
  startDate: string;
  status: "active" | "inactive" | "churned";
}

export interface ContentItem {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  type: "reel" | "post" | "story" | "carousel";
  status: ContentStatus;
  assignedTo: string;
  deadline: string;
  platform: string[];
  notes: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  objective: CampaignObjective;
  budget: number;
  startDate: string;
  endDate: string;
  status: "ativa" | "pausada" | "encerrada" | "draft";
  cpm: number;
  ctr: number;
  cpl: number;
  roas: number;
  frequency: number;
  leads: number;
  spend: number;
}

export interface RecruitingJob {
  id: string;
  clientId: string;
  clientName: string;
  position: string;
  location: string;
  briefingDate: string;
  status:
    | "briefing"
    | "criativo"
    | "meta_ads"
    | "leads"
    | "qualificacao"
    | "entrega_rh"
    | "contratado";
  budget: number;
  leads: number;
  qualified: number;
  hired: number;
  cpl: number;
}

export interface FinancialRecord {
  id: string;
  clientId: string;
  clientName: string;
  type: "receita" | "despesa";
  category: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  invoice: string;
  notes: string;
}

export interface KPIs {
  leadsMonth: number;
  callsScheduled: number;
  activeClients: number;
  mrr: number;
  forecastRevenue: number;
  cac: number;
  avgRoas: number;
  pendingProduction: number;
  reelsDelivered: number;
  activeAds: number;
}
