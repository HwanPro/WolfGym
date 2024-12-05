const clients = await db.clientProfile.findMany({
  include: {
    memberships: true, // Adjust as per relation name
  },
});
