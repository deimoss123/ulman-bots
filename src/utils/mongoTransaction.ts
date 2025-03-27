import mongoose from "mongoose";

type Strictify<T extends readonly unknown[]> = { [K in keyof T]: NonNullable<Awaited<T[K]>> };

type Result<T extends readonly unknown[]> = {
  ok: true;
  values: Strictify<T>;
};

export default async function mongoTransaction<Elem extends unknown, T extends readonly Elem[]>(
  callback: (session: mongoose.mongo.ClientSession) => { [K in keyof T]: () => Promise<T[K]> },
): Promise<Result<T> | { ok: false; values: null }> {
  const session = await mongoose.startSession();

  session.startTransaction();

  const arr = callback(session);

  let ok = true;
  const results: NonNullable<T[number]>[] = [];

  for (const item of arr) {
    const res = (await item()) as NonNullable<T[number]>;
    if (!res) {
      ok = false;
      break;
    }
    results.push(res);
  }

  if (ok) {
    await session.commitTransaction();
  } else {
    await session.abortTransaction();
  }

  await session.endSession();

  const values = results as Strictify<T>;

  if (!ok) return { ok: false, values: null };

  return { ok, values };
}
