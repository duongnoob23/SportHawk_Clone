import { ClubType } from "../types";



export const formatShClubsCard = (
  clubsData?: { clubs: ClubType[] } | ClubType[] | null
) => {
  // Chuẩn hóa đầu vào thành mảng ClubType
  const clubsArray: ClubType[] = Array.isArray(clubsData)
    ? clubsData
    : clubsData?.clubs ?? [];

  // Map sang dữ liệu cần cho ShClubCard
  return clubsArray.map(club => ({
    id: club.id,
    name: club.name,
    location_city: club.location_city ?? undefined,
    location_state: club.location_state ?? undefined,
    member_count: club.member_count ?? 0,
    club_badge_url: club.club_badge_url ?? undefined,
  }));
};
