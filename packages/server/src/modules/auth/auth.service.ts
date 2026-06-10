import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword } from '../../lib/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { AppError } from '../../middleware/error.js';
import { Gender, InterestedIn } from '@prisma/client';
import {
  generateVerificationCode,
  sendVerificationEmail,
} from './email.service.js';

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
  const code = generateVerificationCode();

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      nickname: input.nickname,
      gender: input.gender,
      interestedIn: input.interestedIn,
      birthDate: new Date(input.birthDate),
      // P0: Email verification
      emailVerifyCode: code,
      emailVerifyExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      // P6: Detect campus email
      campusEmail: input.email.endsWith('.edu') || input.email.endsWith('.edu.cn'),
    },
    select: { id: true, email: true, nickname: true, gender: true, createdAt: true },
  });

  // Send verification email
  try {
    await sendVerificationEmail(input.email, code);
  } catch {
    console.warn(`Failed to send verification email to ${input.email}`);
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  // P0: Check account lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(429, `Account locked. Try again in ${mins} minutes`);
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    // P0: Increment login attempts
    const attempts = user.loginAttempts + 1;
    const lockedUntil = attempts >= 5
      ? new Date(Date.now() + 15 * 60 * 1000) // lock 15 min after 5 fails
      : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: attempts, lockedUntil },
    });

    throw new AppError(401, 'Invalid email or password');
  }

  // Reset login attempts on success
  if (user.loginAttempts > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Store new refresh token, revoke old ones for this user
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshToken(oldToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  // P0: Check if token is revoked
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });
  if (!stored || stored.revoked) {
    throw new AppError(401, 'Token has been revoked');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  });
  if (!user) {
    throw new AppError(401, 'User not found');
  }

  // Revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const accessToken = signAccessToken({ userId: user.id });
  const newRefreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function verifyEmail(userId: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerifyCode: true, emailVerifyExpires: true, emailVerified: true },
  });

  if (!user) throw new AppError(404, 'User not found');
  if (user.emailVerified) throw new AppError(400, 'Email already verified');
  if (!user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
    throw new AppError(400, 'Verification code expired. Request a new one.');
  }
  if (user.emailVerifyCode !== code) {
    throw new AppError(400, 'Invalid verification code');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerifyCode: null,
      emailVerifyExpires: null,
    },
  });
}

export async function resendVerificationCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });

  if (!user) throw new AppError(404, 'User not found');
  if (user.emailVerified) throw new AppError(400, 'Email already verified');

  const code = generateVerificationCode();
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerifyCode: code,
      emailVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendVerificationEmail(user.email, code);
}

export async function logout(userId: string, refreshToken?: string) {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId },
      data: { revoked: true },
    });
  }
  // Revoke all refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}
