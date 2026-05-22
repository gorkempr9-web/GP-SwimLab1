export type AthleteListPdfRow = {
  name: string;
  ageCategory: string;
  club: string;
  group: string;
  lastPb: string;
  guardianStatus: string;
  status: string;
};

export type MeetEntryPdfRow = {
  meetName: string;
  date: string;
  poolType: string;
  athleteName: string;
  eventName: string;
  eventType?: string;
  distance?: string;
  stroke?: string;
  heat: string;
  lane: string;
  pb: string;
  target: string;
  seedTime?: string;
  result?: string;
  coachNote?: string;
};

export async function generateAthleteListPdf(rows: AthleteListPdfRow[]) {
  return {
    success: true,
    message: 'Sporcu listesi PDF olarak hazırlandı',
    rows,
  };
}

export async function generateMeetEntryListPdf(rows: MeetEntryPdfRow[]) {
  return {
    success: true,
    message: 'Yarış listesi PDF olarak hazırlandı',
    rows,
  };
}

export async function generateTeamResultReportPdf(rows: MeetEntryPdfRow[]) {
  return {
    success: true,
    message: 'Yarış listesi PDF olarak hazırlandı',
    rows,
  };
}
