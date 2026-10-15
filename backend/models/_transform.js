// Shared toJSON options: exposes `id` (string of _id) and strips __v,
// so the React frontend (which keys everything by `id`) works unchanged.
export const baseJSON = {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = String(ret._id);
    return ret;
  }
};
