export interface TeamDBResult {
  id: string;
  clubId: string;
  name: string;
  sport: string;
  teamType: string;
  isActive: boolean | null;
  ageGroup: string | null;
  foundedYear: number | null;
  homeGround: string | null;
  homeGroundAddress: string | null;
  homeGroundLatitude: number | null;
  homeGroundLongitude: number | null;
  leagueName: string | null;
  matchDay: string | null;
  matchTime: string | null;
  motto: string | null;
  teamLevel: string | null;
  teamPhotoUrl: string | null;
  teamSort: string | null;
  trainingDay1: string | null;
  trainingDay2: string | null;
  trainingTime1: string | null;
  trainingTime2: string | null;
  createdAt: string;
  updatedAt: string;
}
