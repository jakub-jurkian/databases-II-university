const { ObjectId } = require("mongodb");
const { client, heroProfiles, heroAuditLog } = require("../mongo/client");

const findByHeroId = async (heroId) => {
  return heroProfiles().findOne(
    {
      heroId: Number(heroId),
      deletedAt: null,
    },
    {
      projection: { deletedAt: 0 },
    },
  );
};

const findAllProfiles = async ({
  powers,
  minMissions,
  withBio,
  specialization,
  page = 1,
  limit = 10,
}) => {
  const query = { deletedAt: null };

  if (powers) {
    const powerList = powers
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (powerList.length > 0) {
      // checks all elements at once if any of them is in hero power
      query.power = { $in: powerList };
    }
  }

  if (minMissions !== undefined) {
    // returns hero who missions is greaterOrEqual to minMissions
    query["stats.totalMissions"] = { $gte: Number(minMissions) };
  }

  if (withBio === "true") {
    // returns hero when their bio exists
    query.bio = { $exists: true };
  }

  if (specialization) {
    query.specializations = specialization;
  }

  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.max(Number(limit) || 10, 1);
  const safeLimit = Math.min(parsedLimit, 100);
  const skip = (parsedPage - 1) * safeLimit;

  const data = await heroProfiles()
    .find(query)
    .project({ deletedAt: 0 })
    .sort({ "stats.totalMissions": -1 })
    .skip(skip)
    .limit(safeLimit)
    .toArray();

  const total = await heroProfiles().countDocuments(query);

  return {
    data,
    pagination: {
      page: parsedPage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const updateBio = async (heroId, bio) => {
  return heroProfiles().findOneAndUpdate(
    { heroId: Number(heroId), deletedAt: null },
    {
      $set: {
        bio,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      projection: { deletedAt: 0 },
    },
  );
};

const addSpecialization = async (heroId, specialization) => {
  return heroProfiles().findOneAndUpdate(
    { heroId: Number(heroId), deletedAt: null },
    {
      $addToSet: { specializations: specialization },
      $set: { updatedAt: new Date() },
    },
    {
      returnDocument: "after",
      projection: { deletedAt: 0 },
    },
  );
};

const removeSpecialization = async (heroId, specialization) => {
  return heroProfiles().findOneAndUpdate(
    { heroId: Number(heroId), deletedAt: null },
    {
      $pull: { specializations: specialization },
      $set: { updatedAt: new Date() },
    },
    {
      returnDocument: "after",
      projection: { deletedAt: 0 },
    },
  );
};

const appendResolvedIncident = async ({
  heroId,
  incidentId,
  level,
  location,
  resolvedAt,
}) => {
  return heroProfiles().updateOne(
    { heroId: Number(heroId), deletedAt: null },
    {
      $push: {
        recentIncidents: {
          $each: [
            {
              incidentId: Number(incidentId),
              level,
              location,
              resolvedAt,
            },
          ],
          $slice: -5,
        },
      },
      $inc: {
        "stats.totalMissions": 1,
        "stats.criticalMissions": level === "critical" ? 1 : 0,
      },
      $set: {
        "stats.lastMissionAt": resolvedAt,
        updatedAt: new Date(),
      },
    },
  );
};

const softDeleteWithAudit = async (heroId, { reason, forcedAuditId } = {}) => {
  // forcedAuditId allows to manually force error "Duplicate Key"
  const session = client.startSession();
  const parsedHeroId = Number(heroId);

  try {
    await session.withTransaction(async () => {
      const profile = await heroProfiles().findOne(
        { heroId: parsedHeroId, deletedAt: null },
        { session },
      );

      if (!profile) {
        const err = new Error("PROFILE_NOT_FOUND");
        err.code = "PROFILE_NOT_FOUND";
        throw err;
      }

      await heroProfiles().updateOne(
        { heroId: parsedHeroId, deletedAt: null },
        {
          $set: {
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session },
      );

      const auditEntry = {
        heroId: parsedHeroId,
        action: "PROFILE_SOFT_DELETED",
        reason: reason || null,
        createdAt: new Date(),
      };

      if (forcedAuditId) {
        auditEntry._id = new ObjectId(forcedAuditId);
      }

      await heroAuditLog().insertOne(auditEntry, { session });
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  findByHeroId,
  findAllProfiles,
  updateBio,
  addSpecialization,
  removeSpecialization,
  appendResolvedIncident,
  softDeleteWithAudit,
};
