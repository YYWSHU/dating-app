import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword } from '../../lib/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { AppError } from '../../middleware/error.js';
import { Gender, InterestedIn } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
  gender: Gender;
  interestedIn: InterestedIn;
  birthDate: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      nickname: input.nickname,
      gender: input.gender,
      interestedIn: input.interestedIn,
      birthDate: new Date(input.birthDate),
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      gender: true,
      createdAt: true,
    },
  });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshToken(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const newRefreshToken = signRefreshToken({ userId: user.id });

  return { accessToken, refreshToken: newRefreshToken };
}
