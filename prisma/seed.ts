import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Sex, AgeClass } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database…");

  // ------------------------------------------------------------------
  // Locations
  // ------------------------------------------------------------------
  const [
    locationBorneo,
    locationSumatra,
    locationThailand,
    locationSabah,
    locationJava,
    locationVietnam,
  ] = await Promise.all([
    prisma.location.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Danum Valley Conservation Area",
        country: "Malaysia",
        type: "Forest Reserve",
        xCoordinate: 117.8,
        yCoordinate: 4.96,
      },
    }),
    prisma.location.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Gunung Leuser National Park",
        country: "Indonesia",
        type: "National Park",
        xCoordinate: 97.5,
        yCoordinate: 3.75,
      },
    }),
    prisma.location.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Khao Yai National Park",
        country: "Thailand",
        type: "National Park",
        xCoordinate: 101.37,
        yCoordinate: 14.43,
      },
    }),
    prisma.location.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Kinabalu Park",
        country: "Malaysia",
        type: "National Park",
        xCoordinate: 116.55,
        yCoordinate: 6.0,
      },
    }),
    prisma.location.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "Ujung Kulon National Park",
        country: "Indonesia",
        type: "National Park",
        xCoordinate: 105.35,
        yCoordinate: -6.75,
      },
    }),
    prisma.location.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: "Cat Tien National Park",
        country: "Vietnam",
        type: "National Park",
        xCoordinate: 107.43,
        yCoordinate: 11.42,
      },
    }),
  ]);
  console.log("  ✔ Locations");

  // ------------------------------------------------------------------
  // Researchers
  // ------------------------------------------------------------------
  const [alice, bob, carla, david, elena, frank] = await Promise.all([
    prisma.researcher.upsert({
      where: { id: 1 },
      update: {},
      create: {
        firstName: "Alice",
        lastName: "Chen",
        email: "alice.chen@research.org",
      },
    }),
    prisma.researcher.upsert({
      where: { id: 2 },
      update: {},
      create: {
        firstName: "Bob",
        lastName: "Raffles",
        email: "bob.raffles@research.org",
      },
    }),
    prisma.researcher.upsert({
      where: { id: 3 },
      update: {},
      create: {
        firstName: "Carla",
        lastName: "Mendez",
        email: "carla.mendez@research.org",
      },
    }),
    prisma.researcher.upsert({
      where: { id: 4 },
      update: {},
      create: {
        firstName: "David",
        lastName: "Lim",
        email: "david.lim@research.org",
      },
    }),
    prisma.researcher.upsert({
      where: { id: 5 },
      update: {},
      create: {
        firstName: "Elena",
        lastName: "Park",
        email: "elena.park@research.org",
      },
    }),
    prisma.researcher.upsert({
      where: { id: 6 },
      update: {},
      create: {
        firstName: "Frank",
        lastName: "Santos",
        email: "frank.santos@research.org",
      },
    }),
  ]);
  console.log("  ✔ Researchers");

  // ------------------------------------------------------------------
  // Methods
  // ------------------------------------------------------------------
  const [focal, scan, iad, adlibitum] = await Promise.all([
    prisma.method.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "Focal Animal Sampling" },
    }),
    prisma.method.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "Scan Sampling" },
    }),
    prisma.method.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "Instantaneous Activity Diary (IAD)" },
    }),
    prisma.method.upsert({
      where: { id: 4 },
      update: {},
      create: { name: "Ad Libitum Sampling" },
    }),
  ]);
  console.log("  ✔ Methods");

  // ------------------------------------------------------------------
  // Species
  // ------------------------------------------------------------------
  const [
    whiteHandedGibbon,
    siamang,
    agileGibbon,
    mullerGibbon,
    javaGibbon,
    redCheekedGibbon,
  ] = await Promise.all([
    prisma.species.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "White-handed Gibbon (Hylobates lar)" },
    }),
    prisma.species.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "Siamang (Symphalangus syndactylus)" },
    }),
    prisma.species.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "Agile Gibbon (Hylobates agilis)" },
    }),
    prisma.species.upsert({
      where: { id: 4 },
      update: {},
      create: { name: "Müller's Gibbon (Hylobates muelleri)" },
    }),
    prisma.species.upsert({
      where: { id: 5 },
      update: {},
      create: { name: "Javan Gibbon (Hylobates moloch)" },
    }),
    prisma.species.upsert({
      where: { id: 6 },
      update: {},
      create: { name: "Red-cheeked Gibbon (Nomascus gabriellae)" },
    }),
  ]);
  console.log("  ✔ Species");

  // ------------------------------------------------------------------
  // Ape Groups
  // ------------------------------------------------------------------
  const [
    groupDanum,
    groupLeuser,
    groupKhaoYai,
    groupKinabalu,
    groupUjung,
    groupCatTien,
  ] = await Promise.all([
    prisma.apeGroup.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Danum Alpha Group",
        notes:
          "Resident white-handed gibbon family at Danum Valley; monitored since 2024.",
      },
    }),
    prisma.apeGroup.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Leuser Siamang Family",
        notes:
          "Bonded adult siamang pair with no current offspring; Gunung Leuser lowland.",
      },
    }),
    prisma.apeGroup.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Khao Yai Agile Trio",
        notes:
          "Subadult male, juvenile female and untagged adult; Khao Yai core zone.",
      },
    }),
    prisma.apeGroup.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Kinabalu Müller Pair",
        notes: "Adult male with infant female; Kinabalu Park mid-elevation.",
      },
    }),
    prisma.apeGroup.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "Ujung Kulon Javan Group",
        notes:
          "Small family group of critically monitored Javan gibbons in Ujung Kulon.",
      },
    }),
    prisma.apeGroup.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: "Cat Tien Red-cheeked Pair",
        notes:
          "Newly documented adult pair of red-cheeked gibbons at Cat Tien National Park, Vietnam.",
      },
    }),
  ]);
  console.log("  ✔ Ape Groups");

  // ------------------------------------------------------------------
  // Apes
  // ------------------------------------------------------------------
  const [
    koko,
    luna,
    rio,
    maya,
    titan,
    nova,
    rex,
    belle,
    siku,
    fern,
    zara,
    pike,
    ori,
    dex,
  ] = await Promise.all([
    prisma.ape.upsert({
      where: { id: 1 },
      update: { groupId: groupDanum.id },
      create: {
        name: "Koko",
        speciesId: whiteHandedGibbon.id,
        groupId: groupDanum.id,
        sex: Sex.Male,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 2 },
      update: { groupId: groupDanum.id },
      create: {
        name: "Luna",
        speciesId: whiteHandedGibbon.id,
        groupId: groupDanum.id,
        sex: Sex.Female,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 3 },
      update: { groupId: groupLeuser.id },
      create: {
        name: "Rio",
        speciesId: siamang.id,
        groupId: groupLeuser.id,
        sex: Sex.Male,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 4 },
      update: { groupId: groupLeuser.id },
      create: {
        name: "Maya",
        speciesId: siamang.id,
        groupId: groupLeuser.id,
        sex: Sex.Female,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 5 },
      update: { groupId: groupKhaoYai.id },
      create: {
        name: "Titan",
        speciesId: agileGibbon.id,
        groupId: groupKhaoYai.id,
        sex: Sex.Male,
        ageClass: AgeClass.Subadult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 6 },
      update: { groupId: groupKhaoYai.id },
      create: {
        name: "Nova",
        speciesId: agileGibbon.id,
        groupId: groupKhaoYai.id,
        sex: Sex.Female,
        ageClass: AgeClass.Juvenile,
      },
    }),
    prisma.ape.upsert({
      where: { id: 7 },
      update: { groupId: groupKinabalu.id },
      create: {
        name: "Rex",
        speciesId: mullerGibbon.id,
        groupId: groupKinabalu.id,
        sex: Sex.Male,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 8 },
      update: { groupId: groupKinabalu.id },
      create: {
        name: "Belle",
        speciesId: mullerGibbon.id,
        groupId: groupKinabalu.id,
        sex: Sex.Female,
        ageClass: AgeClass.Infant,
      },
    }),
    prisma.ape.upsert({
      where: { id: 9 },
      update: { groupId: groupUjung.id },
      create: {
        name: "Siku",
        speciesId: javaGibbon.id,
        groupId: groupUjung.id,
        sex: Sex.Male,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 10 },
      update: { groupId: groupUjung.id },
      create: {
        name: "Fern",
        speciesId: javaGibbon.id,
        groupId: groupUjung.id,
        sex: Sex.Female,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 11 },
      update: { groupId: groupUjung.id },
      create: {
        name: "Zara",
        speciesId: javaGibbon.id,
        groupId: groupUjung.id,
        sex: Sex.Female,
        ageClass: AgeClass.Juvenile,
      },
    }),
    prisma.ape.upsert({
      where: { id: 12 },
      update: { groupId: groupCatTien.id },
      create: {
        name: "Pike",
        speciesId: redCheekedGibbon.id,
        groupId: groupCatTien.id,
        sex: Sex.Male,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 13 },
      update: { groupId: groupCatTien.id },
      create: {
        name: "Ori",
        speciesId: redCheekedGibbon.id,
        groupId: groupCatTien.id,
        sex: Sex.Female,
        ageClass: AgeClass.Adult,
      },
    }),
    prisma.ape.upsert({
      where: { id: 14 },
      update: { groupId: groupDanum.id },
      create: {
        name: "Dex",
        speciesId: whiteHandedGibbon.id,
        groupId: groupDanum.id,
        sex: Sex.Male,
        ageClass: AgeClass.Juvenile,
      },
    }),
  ]);
  console.log("  ✔ Apes");

  // ------------------------------------------------------------------
  // Research Projects (with locations connected)
  // ------------------------------------------------------------------
  const [projectBorneo, projectSumatra, projectThailand, projectIsland] =
    await Promise.all([
      prisma.researchProject.upsert({
        where: { id: 1 },
        update: {
          apeGroups: { set: [{ id: groupDanum.id }] },
          researchers: { set: [{ id: alice.id }, { id: bob.id }] },
        },
        create: {
          title: "Gibbon Vocal Behaviour Study – Borneo 2026",
          description:
            "Long-term study of white-handed gibbon vocal repertoire and territory defence in Danum Valley.",
          startDate: new Date("2026-01-15"),
          endDate: new Date("2026-12-31"),
          locations: { connect: [{ id: locationBorneo.id }] },
          apeGroups: { connect: [{ id: groupDanum.id }] },
          researchers: { connect: [{ id: alice.id }, { id: bob.id }] },
        },
      }),
      prisma.researchProject.upsert({
        where: { id: 2 },
        update: {
          apeGroups: { set: [{ id: groupLeuser.id }] },
          researchers: { set: [{ id: alice.id }, { id: bob.id }, { id: carla.id }] },
        },
        create: {
          title: "Siamang Social Structure – Sumatra 2026",
          description:
            "Comparative study of siamang group dynamics across two elevation gradients in Gunung Leuser.",
          startDate: new Date("2026-02-01"),
          endDate: new Date("2026-11-30"),
          locations: {
            connect: [{ id: locationBorneo.id }, { id: locationSumatra.id }],
          },
          apeGroups: { connect: [{ id: groupLeuser.id }] },
          researchers: {
            connect: [{ id: alice.id }, { id: bob.id }, { id: carla.id }],
          },
        },
      }),
      prisma.researchProject.upsert({
        where: { id: 3 },
        update: {
          apeGroups: {
            set: [{ id: groupKhaoYai.id }, { id: groupKinabalu.id }],
          },
          researchers: {
            set: [{ id: carla.id }, { id: david.id }],
          },
        },
        create: {
          title: "Agile Gibbon Ranging – Thailand 2026",
          description:
            "GPS-assisted ranging and habitat use study of agile gibbons in Khao Yai.",
          startDate: new Date("2026-03-01"),
          locations: {
            connect: [{ id: locationThailand.id }, { id: locationSabah.id }],
          },
          apeGroups: {
            connect: [{ id: groupKhaoYai.id }, { id: groupKinabalu.id }],
          },
          researchers: {
            connect: [{ id: carla.id }, { id: david.id }],
          },
        },
      }),
      prisma.researchProject.upsert({
        where: { id: 4 },
        update: {
          apeGroups: {
            set: [{ id: groupUjung.id }, { id: groupCatTien.id }],
          },
          researchers: {
            set: [{ id: elena.id }, { id: frank.id }],
          },
        },
        create: {
          title: "Southern Gibbon Conservation Survey 2026",
          description:
            "Cross-site conservation survey of critically endangered gibbon populations in Java and southern Vietnam.",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2026-10-31"),
          locations: {
            connect: [{ id: locationJava.id }, { id: locationVietnam.id }],
          },
          apeGroups: {
            connect: [{ id: groupUjung.id }, { id: groupCatTien.id }],
          },
          researchers: {
            connect: [{ id: elena.id }, { id: frank.id }],
          },
        },
      }),
    ]);
  console.log("  ✔ Research Projects");

  // ------------------------------------------------------------------
  // Sessions
  // ------------------------------------------------------------------
  const [
    session1,
    session2,
    session3,
    session4,
    session5,
    session6,
    session7,
    session8,
  ] = await Promise.all([
    prisma.session.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "Morning Transect A – Week 1" },
    }),
    prisma.session.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "Afternoon Focal – Week 1" },
    }),
    prisma.session.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "Morning Transect B – Week 2" },
    }),
    prisma.session.upsert({
      where: { id: 4 },
      update: {},
      create: { name: "Dawn Chorus – Week 3" },
    }),
    prisma.session.upsert({
      where: { id: 5 },
      update: {},
      create: { name: "Full-day Focal – Week 3" },
    }),
    prisma.session.upsert({
      where: { id: 6 },
      update: {},
      create: { name: "Ujung Kulon Morning Survey – April" },
    }),
    prisma.session.upsert({
      where: { id: 7 },
      update: {},
      create: { name: "Kitanglad Afternoon Focal – April" },
    }),
    prisma.session.upsert({
      where: { id: 8 },
      update: {},
      create: { name: "Borneo Evening Scan – Week 4" },
    }),
  ]);
  console.log("  ✔ Sessions");

  // ------------------------------------------------------------------
  // Logs
  // ------------------------------------------------------------------
  await Promise.all([
    // --- Project Borneo / Session 1
    prisma.log.upsert({
      where: { id: 1 },
      update: {},
      create: {
        behaviour: "Singing – great call",
        startDatetime: new Date("2026-03-01T06:15:00Z"),
        endDatetime: new Date("2026-03-01T06:22:00Z"),
        notes: "Adult male initiated, female joined after ~30 s",
        apeId: koko.id,
        researchProjectId: projectBorneo.id,
        sessionId: session1.id,
        methodId: focal.id,
        researcherId: alice.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 2 },
      update: {},
      create: {
        behaviour: "Foraging – figs",
        startDatetime: new Date("2026-03-01T07:05:00Z"),
        endDatetime: new Date("2026-03-01T07:45:00Z"),
        notes: "Group of 3 feeding in Ficus sp. canopy",
        apeId: luna.id,
        researchProjectId: projectBorneo.id,
        sessionId: session1.id,
        methodId: scan.id,
        researcherId: alice.id,
      },
    }),
    // --- Project Borneo / Session 2
    prisma.log.upsert({
      where: { id: 3 },
      update: {},
      create: {
        behaviour: "Grooming",
        startDatetime: new Date("2026-03-01T14:30:00Z"),
        endDatetime: new Date("2026-03-01T14:55:00Z"),
        notes: "Dyadic grooming between adult female and juvenile",
        apeId: luna.id,
        researchProjectId: projectBorneo.id,
        sessionId: session2.id,
        methodId: focal.id,
        researcherId: bob.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 4 },
      update: {},
      create: {
        behaviour: "Play",
        startDatetime: new Date("2026-03-01T15:10:00Z"),
        endDatetime: new Date("2026-03-01T15:35:00Z"),
        notes: "Juvenile chasing adult male through canopy",
        apeId: koko.id,
        researchProjectId: projectBorneo.id,
        sessionId: session2.id,
        methodId: focal.id,
        researcherId: bob.id,
      },
    }),
    // --- Project Sumatra / Session 3
    prisma.log.upsert({
      where: { id: 5 },
      update: {},
      create: {
        behaviour: "Brachiating – long-distance travel",
        startDatetime: new Date("2026-03-03T06:00:00Z"),
        endDatetime: new Date("2026-03-03T06:40:00Z"),
        notes: "Estimated 400 m traverse, high canopy",
        apeId: rio.id,
        researchProjectId: projectSumatra.id,
        sessionId: session3.id,
        methodId: iad.id,
        researcherId: bob.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 6 },
      update: {},
      create: {
        behaviour: "Resting",
        startDatetime: new Date("2026-03-03T11:00:00Z"),
        endDatetime: new Date("2026-03-03T12:30:00Z"),
        notes: "Midday rest, adult pair in sleeping tree",
        apeId: maya.id,
        researchProjectId: projectSumatra.id,
        sessionId: session3.id,
        methodId: scan.id,
        researcherId: alice.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 7 },
      update: {},
      create: {
        behaviour: "Alarm call",
        startDatetime: new Date("2026-03-03T08:20:00Z"),
        endDatetime: new Date("2026-03-03T08:23:00Z"),
        notes: "Response to raptor flyover",
        apeId: rio.id,
        researchProjectId: projectSumatra.id,
        sessionId: session3.id,
        methodId: adlibitum.id,
        researcherId: carla.id,
      },
    }),
    // --- Project Thailand / Session 4
    prisma.log.upsert({
      where: { id: 8 },
      update: {},
      create: {
        behaviour: "Singing – morning duet",
        startDatetime: new Date("2026-03-04T05:50:00Z"),
        endDatetime: new Date("2026-03-04T06:10:00Z"),
        notes: "Male–female duet, territory boundary",
        apeId: titan.id,
        researchProjectId: projectThailand.id,
        sessionId: session4.id,
        methodId: focal.id,
        researcherId: carla.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 9 },
      update: {},
      create: {
        behaviour: "Foraging – insects",
        startDatetime: new Date("2026-03-04T08:00:00Z"),
        endDatetime: new Date("2026-03-04T08:45:00Z"),
        notes: "Bark gleaning, low canopy",
        apeId: nova.id,
        researchProjectId: projectThailand.id,
        sessionId: session4.id,
        methodId: scan.id,
        researcherId: david.id,
      },
    }),
    // --- Project Thailand / Session 5
    prisma.log.upsert({
      where: { id: 10 },
      update: {},
      create: {
        behaviour: "Social interaction – aggression",
        startDatetime: new Date("2026-03-05T09:15:00Z"),
        endDatetime: new Date("2026-03-05T09:18:00Z"),
        notes: "Brief chase between two subadult males",
        apeId: rex.id,
        researchProjectId: projectThailand.id,
        sessionId: session5.id,
        methodId: adlibitum.id,
        researcherId: david.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 11 },
      update: {},
      create: {
        behaviour: "Nursing",
        startDatetime: new Date("2026-03-05T10:00:00Z"),
        endDatetime: new Date("2026-03-05T10:20:00Z"),
        notes: "Infant clinging to ventral surface, nursing observed",
        apeId: belle.id,
        researchProjectId: projectThailand.id,
        sessionId: session5.id,
        methodId: focal.id,
        researcherId: carla.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 12 },
      update: {},
      create: {
        behaviour: "Resting",
        startDatetime: new Date("2026-03-05T12:00:00Z"),
        endDatetime: new Date("2026-03-05T13:15:00Z"),
        notes: "Group resting in large emergent tree",
        apeId: titan.id,
        researchProjectId: projectThailand.id,
        sessionId: session5.id,
        methodId: scan.id,
        researcherId: david.id,
      },
    }),
    // --- Project Island / Session 6 (Ujung Kulon – Javan gibbons)
    prisma.log.upsert({
      where: { id: 13 },
      update: {},
      create: {
        behaviour: "Singing – solo call",
        startDatetime: new Date("2026-04-02T05:45:00Z"),
        endDatetime: new Date("2026-04-02T05:58:00Z"),
        notes:
          "Adult male solo territorial call; no response from neighbouring groups",
        apeId: siku.id,
        researchProjectId: projectIsland.id,
        sessionId: session6.id,
        methodId: focal.id,
        researcherId: elena.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 14 },
      update: {},
      create: {
        behaviour: "Foraging – leaves",
        startDatetime: new Date("2026-04-02T07:30:00Z"),
        endDatetime: new Date("2026-04-02T08:10:00Z"),
        notes: "Female and juvenile foraging together on young Ficus leaves",
        apeId: fern.id,
        researchProjectId: projectIsland.id,
        sessionId: session6.id,
        methodId: scan.id,
        researcherId: elena.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 15 },
      update: {},
      create: {
        behaviour: "Play",
        startDatetime: new Date("2026-04-02T09:00:00Z"),
        endDatetime: new Date("2026-04-02T09:20:00Z"),
        notes: "Juvenile play-wrestling with adult female",
        apeId: zara.id,
        researchProjectId: projectIsland.id,
        sessionId: session6.id,
        methodId: adlibitum.id,
        researcherId: frank.id,
      },
    }),
    // --- Project Island / Session 7 (Kitanglad – Philippine gibbons)
    prisma.log.upsert({
      where: { id: 16 },
      update: {},
      create: {
        behaviour: "Brachiating – canopy traverse",
        startDatetime: new Date("2026-04-03T06:20:00Z"),
        endDatetime: new Date("2026-04-03T06:55:00Z"),
        notes: "Adult pair moving together; estimated 300 m traverse",
        apeId: pike.id,
        researchProjectId: projectIsland.id,
        sessionId: session7.id,
        methodId: iad.id,
        researcherId: frank.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 17 },
      update: {},
      create: {
        behaviour: "Grooming",
        startDatetime: new Date("2026-04-03T10:15:00Z"),
        endDatetime: new Date("2026-04-03T10:45:00Z"),
        notes: "Mutual grooming between bonded adult pair",
        apeId: ori.id,
        researchProjectId: projectIsland.id,
        sessionId: session7.id,
        methodId: focal.id,
        researcherId: elena.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 18 },
      update: {},
      create: {
        behaviour: "Alarm call",
        startDatetime: new Date("2026-04-03T11:30:00Z"),
        endDatetime: new Date("2026-04-03T11:32:00Z"),
        notes: "Short alarm sequence; possible snake sighting below",
        apeId: pike.id,
        researchProjectId: projectIsland.id,
        sessionId: session7.id,
        methodId: adlibitum.id,
        researcherId: frank.id,
      },
    }),
    // --- Project Borneo / Session 8 (evening scan, Danum)
    prisma.log.upsert({
      where: { id: 19 },
      update: {},
      create: {
        behaviour: "Resting",
        startDatetime: new Date("2026-03-08T16:00:00Z"),
        endDatetime: new Date("2026-03-08T17:00:00Z"),
        notes: "Family group roosting early; overcast sky",
        apeId: koko.id,
        researchProjectId: projectBorneo.id,
        sessionId: session8.id,
        methodId: scan.id,
        researcherId: alice.id,
      },
    }),
    prisma.log.upsert({
      where: { id: 20 },
      update: {},
      create: {
        behaviour: "Foraging – fruit",
        startDatetime: new Date("2026-03-08T17:05:00Z"),
        endDatetime: new Date("2026-03-08T17:40:00Z"),
        notes: "Juvenile feeding on rambutan; adults resting nearby",
        apeId: dex.id,
        researchProjectId: projectBorneo.id,
        sessionId: session8.id,
        methodId: focal.id,
        researcherId: bob.id,
      },
    }),
  ]);
  console.log("  ✔ Logs");

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
