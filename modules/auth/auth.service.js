import argon2 from "argon2";
import { UserMapper } from "../../data/mappers/index.mapper.js";

const INVALID_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,p=4,t=3$FhOUXghmO1rB04gxwFwf2g$CeSNuceV6MoY+7FYzZ3wZDLNpYJbSzx3Oc05RxKkQco";

function getUserResponse(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

export async function authenticateUser(email, password) {
  const user = await UserMapper.findUserByEmail(email);
  const passwordIsValid = await argon2.verify(
    user?.passwordHash || INVALID_PASSWORD_HASH,
    password,
  );

  return user && passwordIsValid ? getUserResponse(user) : null;
}

export async function getCurrentUser(userId) {
  const user = await UserMapper.findUserById(userId);
  return user ? getUserResponse(user) : null;
}
