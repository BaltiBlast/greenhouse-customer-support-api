class CoreMapper {
  constructor(mongoose) {
    this.mongoose = mongoose;
  }

  async withTransaction(callback) {
    const session = await this.mongoose.startSession();

    try {
      return await session.withTransaction(() => callback(session));
    } finally {
      await session.endSession();
    }
  }
}

export default CoreMapper;
