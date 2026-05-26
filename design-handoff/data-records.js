// IGLA+ all-time records — curated list across tournaments.
// Each record is the current standing best for an event × age × gender combo.

window.IGLA_RECORDS = {
  swimming: [
    // Held now (set this year at Valencia)
    { id: "r-1", event: "1500m Freestyle", course: "LCM", age: "40-44", gender: "Men", athlete: "Diego Fonseca", athleteId: "a-diego", club: "Berlin Tritonen", clubId: "btn", time: "17:48.22", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-2", event: "50m Freestyle", course: "LCM", age: "30-34", gender: "Men", athlete: "Mateo Reyes", athleteId: "a-mateo", club: "West Hollywood Aquatics", clubId: "wh2o", time: "00:23.41", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-3", event: "100m Backstroke", course: "LCM", age: "45-49", gender: "Men", athlete: "Marcus Holloway", athleteId: "a-marcus", club: "West Hollywood Aquatics", clubId: "wh2o", time: "01:05.92", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-4", event: "200m Breaststroke", course: "LCM", age: "40-44", gender: "Women", athlete: "Astrid Karlsson", athleteId: "a-astrid", club: "Stockholm Stingrays", clubId: "sst", time: "02:39.18", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-5", event: "50m Freestyle", course: "LCM", age: "35-39", gender: "Women", athlete: "Priya Aggarwal", athleteId: "a-priya", club: "London Out To Swim", clubId: "lots", time: "00:26.74", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-6", event: "100m Butterfly", course: "LCM", age: "30-34", gender: "Mixed", athlete: "Camille Beaulieu", athleteId: "a-camille", club: "À Contre-Courant", clubId: "acc", time: "01:01.23", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },

    // From earlier tournaments — still standing
    { id: "r-7", event: "400m Freestyle", course: "LCM", age: "30-34", gender: "Women", athlete: "Lucía Moreno", athleteId: "a-lucia", club: "À Contre-Courant", clubId: "acc", time: "04:32.09", year: 2025, tournament: "Washington DC", flag: "🇺🇸", held: true },
    { id: "r-8", event: "200m Individual Medley", course: "LCM", age: "25-29", gender: "Men", athlete: "Bram de Vries", athleteId: "a-bram", club: "Amsterdam Aquatic Pride", clubId: "aap", time: "02:11.18", year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", held: true },
    { id: "r-9", event: "800m Freestyle", course: "LCM", age: "35-39", gender: "Men", athlete: "Tomás Vidal", athleteId: "a-tomas", club: "À Contre-Courant", clubId: "acc", time: "09:14.77", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-10", event: "50m Breaststroke", course: "LCM", age: "25-29", gender: "Men", athlete: "Felix Whitman", athleteId: "a-felix", club: "Sydney Watermarks", clubId: "swm", time: "00:28.86", year: 2023, tournament: "London", flag: "🇬🇧", held: true },
    { id: "r-11", event: "50m Backstroke", course: "LCM", age: "35-39", gender: "Women", athlete: "Yuki Tanaka", athleteId: "a-yuki", club: "Tokyo Tritons", clubId: "ttr", time: "00:29.84", year: 2025, tournament: "Washington DC", flag: "🇺🇸", held: true },
    { id: "r-12", event: "100m Butterfly", course: "LCM", age: "25-29", gender: "Men", athlete: "Mateo Reyes", athleteId: "a-mateo", club: "West Hollywood Aquatics", clubId: "wh2o", time: "00:56.12", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-13", event: "100m Backstroke", course: "LCM", age: "25-29", gender: "Mixed", athlete: "Camille Beaulieu", athleteId: "a-camille", club: "À Contre-Courant", clubId: "acc", time: "01:01.95", year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", held: true },
    { id: "r-14", event: "200m Breaststroke", course: "LCM", age: "40-44", gender: "Men", athlete: "Diego Fonseca", athleteId: "a-diego", club: "Berlin Tritonen", clubId: "btn", time: "02:24.05", year: 2026, tournament: "Valencia", flag: "🇪🇸", held: true },
    { id: "r-15", event: "200m Individual Medley", course: "LCM", age: "30-34", gender: "Men", athlete: "Henrik Sørensen", athleteId: "a-henrik", club: "Copenhagen Mermen", clubId: "cmm", time: "02:09.40", year: 2023, tournament: "London", flag: "🇬🇧", held: true },
    { id: "r-16", event: "100m Freestyle", course: "LCM", age: "40-44", gender: "Women", athlete: "Astrid Karlsson", athleteId: "a-astrid", club: "Stockholm Stingrays", clubId: "sst", time: "01:00.72", year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", held: true },
    { id: "r-17", event: "200m Freestyle", course: "LCM", age: "30-34", gender: "Men", athlete: "Tomás Vidal", athleteId: "a-tomas", club: "À Contre-Courant", clubId: "acc", time: "01:55.34", year: 2025, tournament: "Washington DC", flag: "🇺🇸", held: true },
    { id: "r-18", event: "50m Butterfly", course: "LCM", age: "35-39", gender: "Men", athlete: "Olav Lindqvist", athleteId: "a-olav", club: "Stockholm Stingrays", clubId: "sst", time: "00:26.32", year: 2023, tournament: "London", flag: "🇬🇧", held: true },

    // Older records — broken at later tournaments (kept for "previous" hint)
    { id: "r-19", event: "100m Butterfly", course: "LCM", age: "30-34", gender: "Mixed", athlete: "(prev) S. Whitley", athleteId: null, club: "London Out To Swim", clubId: "lots", time: "01:02.04", year: 2023, tournament: "London", flag: "🇬🇧", held: false, brokenBy: "Camille Beaulieu" },
    { id: "r-20", event: "1500m Freestyle", course: "LCM", age: "40-44", gender: "Men", athlete: "(prev) D. Fonseca", athleteId: null, club: "Berlin Tritonen", clubId: "btn", time: "17:52.66", year: 2025, tournament: "Washington DC", flag: "🇺🇸", held: false, brokenBy: "Diego Fonseca" },

    // Short course (SCM) sample for filter testing
    { id: "r-21", event: "100m Freestyle", course: "SCM", age: "30-34", gender: "Men", athlete: "Mateo Reyes", athleteId: "a-mateo", club: "West Hollywood Aquatics", clubId: "wh2o", time: "00:50.18", year: 2025, tournament: "Washington DC", flag: "🇺🇸", held: true },
    { id: "r-22", event: "50m Butterfly", course: "SCM", age: "25-29", gender: "Women", athlete: "Imani Okafor", athleteId: "a-imani", club: "Cape Town Currents", clubId: "ctc", time: "00:26.95", year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", held: true },
  ],

  // Water polo "records" are divisional titles — most recent champion per division per year
  waterPolo: [
    { id: "wp-1", division: "A", year: 2026, tournament: "Valencia", flag: "🇪🇸", champion: "West Hollywood Aquatics", clubId: "wh2o", score: "12–9 v. À Contre-Courant", held: true },
    { id: "wp-2", division: "A", year: 2025, tournament: "Washington DC", flag: "🇺🇸", champion: "West Hollywood Aquatics", clubId: "wh2o", score: "10–7 v. Toronto Triton AC" },
    { id: "wp-3", division: "A", year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", champion: "À Contre-Courant", clubId: "acc", score: "11–8 v. London Out To Swim" },
    { id: "wp-4", division: "B", year: 2026, tournament: "Valencia", flag: "🇪🇸", champion: "Berlin Tritonen", clubId: "btn", score: "9–6 v. Stockholm Stingrays", held: true },
    { id: "wp-5", division: "B", year: 2025, tournament: "Washington DC", flag: "🇺🇸", champion: "Berlin Tritonen", clubId: "btn", score: "8–6 v. Madrid Aguafría" },
    { id: "wp-6", division: "C", year: 2026, tournament: "Valencia", flag: "🇪🇸", champion: "Copenhagen Mermen", clubId: "cmm", score: "7–5 v. Sydney Watermarks", held: true },
  ],
};

// Club tournament histories — used by Club Detail page.
// Each entry = one championship the club attended, with their finish details.
window.IGLA_CLUB_HISTORY = {
  "wh2o": [
    { year: 2026, tournament: "Valencia", flag: "🇪🇸", tournamentId: "valencia-2026", medals: { g: 14, s: 9, b: 7 }, records: 4, wpDivision: "A", wpFinish: 1, isLive: true },
    { year: 2025, tournament: "Washington DC", flag: "🇺🇸", tournamentId: "dc-2025", medals: { g: 11, s: 12, b: 8 }, records: 2, wpDivision: "A", wpFinish: 1 },
    { year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", tournamentId: "buenosaires-2024", medals: { g: 9, s: 10, b: 11 }, records: 1, wpDivision: "A", wpFinish: 2 },
    { year: 2023, tournament: "London", flag: "🇬🇧", tournamentId: "london-2023", medals: { g: 12, s: 11, b: 9 }, records: 3, wpDivision: "A", wpFinish: 2 },
    { year: 2022, tournament: "Palm Springs", flag: "🇺🇸", tournamentId: "palmsprings-2022", medals: { g: 8, s: 7, b: 6 }, records: 1, wpDivision: "A", wpFinish: 1 },
    { year: 2019, tournament: "New York", flag: "🇺🇸", tournamentId: null, medals: { g: 7, s: 8, b: 6 }, records: 1 },
    { year: 2018, tournament: "Paris", flag: "🇫🇷", tournamentId: null, medals: { g: 6, s: 7, b: 5 }, records: 0 },
  ],
  "acc": [
    { year: 2026, tournament: "Valencia", flag: "🇪🇸", tournamentId: "valencia-2026", medals: { g: 3, s: 2, b: 1 }, records: 1, wpDivision: "A", wpFinish: 2, isLive: true },
    { year: 2025, tournament: "Washington DC", flag: "🇺🇸", tournamentId: "dc-2025", medals: { g: 2, s: 3, b: 2 }, records: 0, wpDivision: "A", wpFinish: 4 },
    { year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", tournamentId: "buenosaires-2024", medals: { g: 4, s: 2, b: 1 }, records: 1, wpDivision: "A", wpFinish: 1 },
    { year: 2023, tournament: "London", flag: "🇬🇧", tournamentId: "london-2023", medals: { g: 1, s: 2, b: 3 }, records: 0, wpDivision: "A", wpFinish: 3 },
    { year: 2022, tournament: "Palm Springs", flag: "🇺🇸", tournamentId: "palmsprings-2022", medals: { g: 1, s: 1, b: 1 }, records: 0, wpDivision: "B", wpFinish: 3 },
    { year: 2019, tournament: "New York", flag: "🇺🇸", tournamentId: null, medals: { g: 0, s: 2, b: 0 }, records: 0 },
  ],
  "lots": [
    { year: 2026, tournament: "Valencia", flag: "🇪🇸", tournamentId: "valencia-2026", medals: { g: 2, s: 3, b: 3 }, records: 1, wpDivision: "A", wpFinish: 3, isLive: true },
    { year: 2025, tournament: "Washington DC", flag: "🇺🇸", tournamentId: "dc-2025", medals: { g: 1, s: 4, b: 2 }, records: 0, wpDivision: "A", wpFinish: 3 },
    { year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", tournamentId: "buenosaires-2024", medals: { g: 2, s: 2, b: 2 }, records: 0, wpDivision: "A", wpFinish: 2 },
    { year: 2023, tournament: "London", flag: "🇬🇧", tournamentId: "london-2023", medals: { g: 3, s: 4, b: 3 }, records: 1, wpDivision: "A", wpFinish: 1 },
    { year: 2022, tournament: "Palm Springs", flag: "🇺🇸", tournamentId: "palmsprings-2022", medals: { g: 1, s: 1, b: 1 }, records: 0, wpDivision: "B", wpFinish: 2 },
  ],
  // Lightweight stubs for other clubs (use a generic history when requested)
  "_default": [
    { year: 2026, tournament: "Valencia", flag: "🇪🇸", tournamentId: "valencia-2026", medals: { g: 1, s: 1, b: 1 }, records: 0, isLive: true },
    { year: 2025, tournament: "Washington DC", flag: "🇺🇸", tournamentId: "dc-2025", medals: { g: 0, s: 1, b: 2 }, records: 0 },
    { year: 2024, tournament: "Buenos Aires", flag: "🇦🇷", tournamentId: "buenosaires-2024", medals: { g: 1, s: 0, b: 1 }, records: 0 },
  ],
};
