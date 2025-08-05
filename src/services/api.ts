export interface UserData {
  id: number;
  email: string;
  photo: string | null;
  nickname: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthdate: string;
  phone_number: string;
  profile_picture: string | null;
  social_accounts: any[];
  emails_alerts: boolean;
  notifications_alerts: boolean;
}

export interface ParticipantData {
  id: number;
  user: UserData;
}

export interface ListingWinnerResponse {
  purchase_percentage: number;
  winner: ParticipantData;
  data: ParticipantData[];
}

const API_BASE_URL = '/api/v1';

export const fetchListingWinner = async (listingId: number): Promise<ListingWinnerResponse> => {
  const response = await fetch(`${API_BASE_URL}/listings/listing/winner/?listing=${listingId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch listing winner: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};