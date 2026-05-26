// IGLA Records — mock dataset
// Includes one athlete (Mateo Reyes) with BOTH swim results and a water polo roster spot
// across multiple years to demonstrate the unified timeline.

window.IGLA_DATA = {
  tournament: {
    name: "Valencia 2026",
    subtitle: "IGLA World Championship",
    dates: "June 14 – 21, 2026",
    venue: "Piscina Municipal de Benimàmet",
    participants: 1842,
    nations: 34,
    clubs: 86,
  },

  // ---------- SWIMMING ----------
  swimming: [
    // 50m Free — multiple categories
    { id: "s001", event: "50m Freestyle", course: "LCM", age: "30-34", gender: "Men", athlete: "Mateo Reyes", athleteId: "a-mateo", club: "West Hollywood Aquatics", clubId: "wh2o", time: "00:23.41", place: 1, record: true, year: 2026 },
    { id: "s002", event: "50m Freestyle", course: "LCM", age: "30-34", gender: "Men", athlete: "Tomás Vidal", athleteId: "a-tomas", club: "À Contre-Courant", clubId: "acc", time: "00:24.02", place: 2, record: false, year: 2026 },
    { id: "s003", event: "50m Freestyle", course: "LCM", age: "30-34", gender: "Men", athlete: "Henrik Sørensen", athleteId: "a-henrik", club: "Copenhagen Mermen", clubId: "cmm", time: "00:24.18", place: 3, record: false, year: 2026 },

    { id: "s004", event: "50m Freestyle", course: "LCM", age: "35-39", gender: "Women", athlete: "Priya Aggarwal", athleteId: "a-priya", club: "London Out To Swim", clubId: "lots", time: "00:26.74", place: 1, record: true, year: 2026 },
    { id: "s005", event: "50m Freestyle", course: "LCM", age: "35-39", gender: "Women", athlete: "Esme Whitfield", athleteId: "a-esme", club: "London Out To Swim", clubId: "lots", time: "00:27.31", place: 2, record: false, year: 2026 },
    { id: "s006", event: "50m Freestyle", course: "LCM", age: "35-39", gender: "Women", athlete: "Yuki Tanaka", athleteId: "a-yuki", club: "Tokyo Tritons", clubId: "ttr", time: "00:27.55", place: 3, record: false, year: 2026 },

    // 100m Fly
    { id: "s007", event: "100m Butterfly", course: "LCM", age: "25-29", gender: "Men", athlete: "Mateo Reyes", athleteId: "a-mateo", club: "West Hollywood Aquatics", clubId: "wh2o", time: "00:56.12", place: 1, record: false, year: 2026 },
    { id: "s008", event: "100m Butterfly", course: "LCM", age: "25-29", gender: "Men", athlete: "Bram de Vries", athleteId: "a-bram", club: "Amsterdam Aquatic Pride", clubId: "aap", time: "00:56.88", place: 2, record: false, year: 2026 },
    { id: "s009", event: "100m Butterfly", course: "LCM", age: "30-34", gender: "Mixed", athlete: "Camille Beaulieu", athleteId: "a-camille", club: "À Contre-Courant", clubId: "acc", time: "01:01.23", place: 1, record: true, year: 2026 },

    // 200m Breast
    { id: "s010", event: "200m Breaststroke", course: "LCM", age: "40-44", gender: "Men", athlete: "Diego Fonseca", athleteId: "a-diego", club: "Berlin Tritonen", clubId: "btn", time: "02:24.05", place: 1, record: false, year: 2026 },
    { id: "s011", event: "200m Breaststroke", course: "LCM", age: "40-44", gender: "Men", athlete: "Joost van der Berg", athleteId: "a-joost", club: "Amsterdam Aquatic Pride", clubId: "aap", time: "02:25.71", place: 2, record: false, year: 2026 },
    { id: "s012", event: "200m Breaststroke", course: "LCM", age: "40-44", gender: "Women", athlete: "Astrid Karlsson", athleteId: "a-astrid", club: "Stockholm Stingrays", clubId: "sst", time: "02:39.18", place: 1, record: true, year: 2026 },

    // 400m Free
    { id: "s013", event: "400m Freestyle", course: "LCM", age: "30-34", gender: "Women", athlete: "Lucía Moreno", athleteId: "a-lucia", club: "À Contre-Courant", clubId: "acc", time: "04:32.09", place: 1, record: false, year: 2026 },
    { id: "s014", event: "400m Freestyle", course: "LCM", age: "30-34", gender: "Women", athlete: "Imani Okafor", athleteId: "a-imani", club: "Cape Town Currents", clubId: "ctc", time: "04:34.62", place: 2, record: false, year: 2026 },

    // 100m Back
    { id: "s015", event: "100m Backstroke", course: "LCM", age: "25-29", gender: "Mixed", athlete: "Camille Beaulieu", athleteId: "a-camille", club: "À Contre-Courant", clubId: "acc", time: "01:03.45", place: 1, record: false, year: 2026 },
    { id: "s016", event: "100m Backstroke", course: "LCM", age: "45-49", gender: "Men", athlete: "Marcus Holloway", athleteId: "a-marcus", club: "West Hollywood Aquatics", clubId: "wh2o", time: "01:05.92", place: 1, record: true, year: 2026 },
    { id: "s017", event: "100m Backstroke", course: "LCM", age: "45-49", gender: "Men", athlete: "Olav Lindqvist", athleteId: "a-olav", club: "Stockholm Stingrays", clubId: "sst", time: "01:07.04", place: 2, record: false, year: 2026 },

    // 800m Free
    { id: "s018", event: "800m Freestyle", course: "LCM", age: "35-39", gender: "Men", athlete: "Tomás Vidal", athleteId: "a-tomas", club: "À Contre-Courant", clubId: "acc", time: "09:14.77", place: 1, record: false, year: 2026 },

    // 200m IM
    { id: "s019", event: "200m Individual Medley", course: "LCM", age: "30-34", gender: "Men", athlete: "Mateo Reyes", athleteId: "a-mateo", club: "West Hollywood Aquatics", clubId: "wh2o", time: "02:12.84", place: 2, record: false, year: 2026 },
    { id: "s020", event: "200m Individual Medley", course: "LCM", age: "30-34", gender: "Men", athlete: "Henrik Sørensen", athleteId: "a-henrik", club: "Copenhagen Mermen", clubId: "cmm", time: "02:12.05", place: 1, record: false, year: 2026 },

    // 50m Back
    { id: "s021", event: "50m Backstroke", course: "LCM", age: "35-39", gender: "Women", athlete: "Yuki Tanaka", athleteId: "a-yuki", club: "Tokyo Tritons", clubId: "ttr", time: "00:30.11", place: 1, record: false, year: 2026 },
    { id: "s022", event: "50m Backstroke", course: "LCM", age: "35-39", gender: "Women", athlete: "Priya Aggarwal", athleteId: "a-priya", club: "London Out To Swim", clubId: "lots", time: "00:30.44", place: 2, record: false, year: 2026 },

    // 1500m Free
    { id: "s023", event: "1500m Freestyle", course: "LCM", age: "40-44", gender: "Men", athlete: "Diego Fonseca", athleteId: "a-diego", club: "Berlin Tritonen", clubId: "btn", time: "17:48.22", place: 1, record: true, year: 2026 },

    // 50m Breast
    { id: "s024", event: "50m Breaststroke", course: "LCM", age: "25-29", gender: "Men", athlete: "Bram de Vries", athleteId: "a-bram", club: "Amsterdam Aquatic Pride", clubId: "aap", time: "00:29.07", place: 1, record: false, year: 2026 },
    { id: "s025", event: "50m Breaststroke", course: "LCM", age: "25-29", gender: "Men", athlete: "Felix Whitman", athleteId: "a-felix", club: "Sydney Watermarks", clubId: "swm", time: "00:29.55", place: 2, record: false, year: 2026 },
  ],

  // ---------- WATER POLO ----------
  waterPolo: {
    divisions: [
      {
        id: "A",
        name: "Division A",
        subtitle: "Championship Division",
        standings: [
          {
            place: 1, teamId: "wh2o-wp", team: "West Hollywood Aquatics",
            wins: 7, losses: 0, goalsFor: 84, goalsAgainst: 41, points: 21,
            roster: [
              { name: "Mateo Reyes", athleteId: "a-mateo", role: "Center Forward", cap: 7 },
              { name: "Marcus Holloway", athleteId: "a-marcus", role: "Goalkeeper", cap: 1, captain: true },
              { name: "Jordan Bellamy", athleteId: "a-jordan", role: "Driver", cap: 4 },
              { name: "Andre Costa", athleteId: "a-andre", role: "Center Defender", cap: 5 },
              { name: "Kai Nakamura", athleteId: "a-kai", role: "Wing", cap: 9 },
              { name: "Rashid Al-Mansoori", athleteId: "a-rashid", role: "Driver", cap: 6 },
              { name: "Sam Patterson", athleteId: "a-sam", role: "Wing", cap: 11 },
            ],
          },
          {
            place: 2, teamId: "acc-wp", team: "À Contre-Courant",
            wins: 6, losses: 1, goalsFor: 78, goalsAgainst: 48, points: 18,
            roster: [
              { name: "Camille Beaulieu", athleteId: "a-camille", role: "Driver", cap: 8, captain: true },
              { name: "Tomás Vidal", athleteId: "a-tomas", role: "Center Forward", cap: 7 },
              { name: "Lucía Moreno", athleteId: "a-lucia", role: "Wing", cap: 4 },
              { name: "Étienne Roux", athleteId: "a-etienne", role: "Goalkeeper", cap: 1 },
              { name: "Noé Lambert", athleteId: "a-noe", role: "Center Defender", cap: 5 },
            ],
          },
          {
            place: 3, teamId: "lots-wp", team: "London Out To Swim",
            wins: 5, losses: 2, goalsFor: 71, goalsAgainst: 55, points: 15,
            roster: [
              { name: "Priya Aggarwal", athleteId: "a-priya", role: "Driver", cap: 8 },
              { name: "Esme Whitfield", athleteId: "a-esme", role: "Wing", cap: 6, captain: true },
              { name: "Oliver Hartwell", athleteId: "a-oliver", role: "Center Forward", cap: 7 },
              { name: "Theo Ashworth", athleteId: "a-theo", role: "Goalkeeper", cap: 1 },
            ],
          },
          {
            place: 4, teamId: "aap-wp", team: "Amsterdam Aquatic Pride",
            wins: 4, losses: 3, goalsFor: 62, goalsAgainst: 58, points: 12,
            roster: [
              { name: "Bram de Vries", athleteId: "a-bram", role: "Driver", cap: 8 },
              { name: "Joost van der Berg", athleteId: "a-joost", role: "Center Defender", cap: 5, captain: true },
            ],
          },
        ],
      },
      {
        id: "B",
        name: "Division B",
        subtitle: "Competitive Division",
        standings: [
          {
            place: 1, teamId: "btn-wp", team: "Berlin Tritonen",
            wins: 6, losses: 1, goalsFor: 72, goalsAgainst: 49, points: 18,
            roster: [
              { name: "Diego Fonseca", athleteId: "a-diego", role: "Center Forward", cap: 7, captain: true },
              { name: "Lukas Brenner", athleteId: "a-lukas", role: "Goalkeeper", cap: 1 },
            ],
          },
          {
            place: 2, teamId: "sst-wp", team: "Stockholm Stingrays",
            wins: 5, losses: 2, goalsFor: 65, goalsAgainst: 52, points: 15,
            roster: [
              { name: "Astrid Karlsson", athleteId: "a-astrid", role: "Driver", cap: 4, captain: true },
              { name: "Olav Lindqvist", athleteId: "a-olav", role: "Wing", cap: 6 },
            ],
          },
          {
            place: 3, teamId: "ttr-wp", team: "Tokyo Tritons",
            wins: 3, losses: 4, goalsFor: 51, goalsAgainst: 60, points: 9,
            roster: [
              { name: "Yuki Tanaka", athleteId: "a-yuki", role: "Wing", cap: 9, captain: true },
            ],
          },
        ],
      },
      {
        id: "C",
        name: "Division C",
        subtitle: "Recreational Division",
        standings: [
          {
            place: 1, teamId: "cmm-wp", team: "Copenhagen Mermen",
            wins: 5, losses: 1, goalsFor: 58, goalsAgainst: 42, points: 15,
            roster: [
              { name: "Henrik Sørensen", athleteId: "a-henrik", role: "Driver", cap: 8, captain: true },
            ],
          },
          {
            place: 2, teamId: "swm-wp", team: "Sydney Watermarks",
            wins: 4, losses: 2, goalsFor: 53, goalsAgainst: 47, points: 12,
            roster: [
              { name: "Felix Whitman", athleteId: "a-felix", role: "Center Forward", cap: 7, captain: true },
            ],
          },
          {
            place: 3, teamId: "ctc-wp", team: "Cape Town Currents",
            wins: 2, losses: 4, goalsFor: 41, goalsAgainst: 55, points: 6,
            roster: [
              { name: "Imani Okafor", athleteId: "a-imani", role: "Wing", cap: 6, captain: true },
            ],
          },
        ],
      },
    ],
  },

  // ---------- ATHLETE PROFILES ----------
  // Timeline entries reference earlier tournaments + 2026 results.
  athletes: {
    "a-mateo": {
      id: "a-mateo",
      name: "Mateo Reyes",
      club: "West Hollywood Aquatics",
      clubId: "wh2o",
      pronouns: "he/him",
      hometown: "Los Angeles, USA",
      joined: 2019,
      claimed: false,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [
            { event: "50m Freestyle", category: "Men 30-34", time: "00:23.41", place: 1, record: true },
            { event: "100m Butterfly", category: "Men 25-29", time: "00:56.12", place: 1, record: false },
            { event: "200m IM", category: "Men 30-34", time: "02:12.84", place: 2, record: false },
          ],
          waterPolo: { team: "West Hollywood Aquatics", division: "A", finish: 1, role: "Center Forward" },
        },
        {
          year: 2025, tournament: "Palm Springs 2025", flag: "🇺🇸",
          swimming: [
            { event: "50m Freestyle", category: "Men 30-34", time: "00:23.78", place: 1, record: false },
            { event: "100m Butterfly", category: "Men 25-29", time: "00:56.91", place: 2, record: false },
          ],
        },
        {
          year: 2024, tournament: "Lisbon 2024", flag: "🇵🇹",
          swimming: [
            { event: "100m Butterfly", category: "Men 25-29", time: "00:57.44", place: 3, record: false },
          ],
          waterPolo: { team: "West Hollywood Aquatics", division: "B", finish: 2, role: "Driver" },
        },
        {
          year: 2022, tournament: "Sydney 2022", flag: "🇦🇺",
          swimming: [
            { event: "50m Freestyle", category: "Men 25-29", time: "00:24.10", place: 4, record: false },
          ],
        },
      ],
    },
    "a-camille": {
      id: "a-camille",
      name: "Camille Beaulieu",
      club: "À Contre-Courant",
      clubId: "acc",
      pronouns: "they/them",
      hometown: "Paris, France",
      joined: 2018,
      claimed: true,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [
            { event: "100m Butterfly", category: "Mixed 30-34", time: "01:01.23", place: 1, record: true },
            { event: "100m Backstroke", category: "Mixed 25-29", time: "01:03.45", place: 1, record: false },
          ],
          waterPolo: { team: "À Contre-Courant", division: "A", finish: 2, role: "Driver" },
        },
        {
          year: 2025, tournament: "Palm Springs 2025", flag: "🇺🇸",
          swimming: [
            { event: "100m Butterfly", category: "Mixed 25-29", time: "01:02.10", place: 1, record: false },
          ],
        },
        {
          year: 2024, tournament: "Lisbon 2024", flag: "🇵🇹",
          waterPolo: { team: "À Contre-Courant", division: "B", finish: 1, role: "Driver" },
        },
      ],
    },
    "a-priya": {
      id: "a-priya",
      name: "Priya Aggarwal",
      club: "London Out To Swim",
      clubId: "lots",
      pronouns: "she/her",
      hometown: "London, UK",
      joined: 2020,
      claimed: false,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [
            { event: "50m Freestyle", category: "Women 35-39", time: "00:26.74", place: 1, record: true },
            { event: "50m Backstroke", category: "Women 35-39", time: "00:30.44", place: 2, record: false },
          ],
          waterPolo: { team: "London Out To Swim", division: "A", finish: 3, role: "Driver" },
        },
        {
          year: 2025, tournament: "Palm Springs 2025", flag: "🇺🇸",
          swimming: [
            { event: "50m Freestyle", category: "Women 35-39", time: "00:27.02", place: 2, record: false },
          ],
        },
      ],
    },
    "a-marcus": {
      id: "a-marcus", name: "Marcus Holloway", club: "West Hollywood Aquatics", clubId: "wh2o",
      pronouns: "he/him", hometown: "Atlanta, USA", joined: 2015, claimed: false,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [{ event: "100m Backstroke", category: "Men 45-49", time: "01:05.92", place: 1, record: true }],
          waterPolo: { team: "West Hollywood Aquatics", division: "A", finish: 1, role: "Goalkeeper" },
        },
        { year: 2024, tournament: "Lisbon 2024", flag: "🇵🇹",
          waterPolo: { team: "West Hollywood Aquatics", division: "B", finish: 2, role: "Goalkeeper" } },
      ],
    },
    "a-tomas": {
      id: "a-tomas", name: "Tomás Vidal", club: "À Contre-Courant", clubId: "acc",
      pronouns: "he/him", hometown: "Barcelona, Spain", joined: 2017, claimed: false,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [
            { event: "50m Freestyle", category: "Men 30-34", time: "00:24.02", place: 2, record: false },
            { event: "800m Freestyle", category: "Men 35-39", time: "09:14.77", place: 1, record: false },
          ],
          waterPolo: { team: "À Contre-Courant", division: "A", finish: 2, role: "Center Forward" },
        },
      ],
    },
    "a-diego": {
      id: "a-diego", name: "Diego Fonseca", club: "Berlin Tritonen", clubId: "btn",
      pronouns: "he/him", hometown: "Lisbon → Berlin", joined: 2016, claimed: true,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [
            { event: "200m Breaststroke", category: "Men 40-44", time: "02:24.05", place: 1, record: false },
            { event: "1500m Freestyle", category: "Men 40-44", time: "17:48.22", place: 1, record: true },
          ],
          waterPolo: { team: "Berlin Tritonen", division: "B", finish: 1, role: "Center Forward" },
        },
        {
          year: 2025, tournament: "Palm Springs 2025", flag: "🇺🇸",
          swimming: [{ event: "1500m Freestyle", category: "Men 40-44", time: "17:52.66", place: 1, record: false }],
        },
      ],
    },
    "a-astrid": {
      id: "a-astrid", name: "Astrid Karlsson", club: "Stockholm Stingrays", clubId: "sst",
      pronouns: "she/her", hometown: "Stockholm, Sweden", joined: 2014, claimed: false,
      timeline: [
        {
          year: 2026, tournament: "Valencia 2026", flag: "🇪🇸",
          swimming: [{ event: "200m Breaststroke", category: "Women 40-44", time: "02:39.18", place: 1, record: true }],
          waterPolo: { team: "Stockholm Stingrays", division: "B", finish: 2, role: "Driver" },
        },
      ],
    },
  },
};
