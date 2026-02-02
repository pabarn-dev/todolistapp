import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { generateTokenPair, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { omit } from '../utils/helpers.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import type { TokenPair, UserWithoutPassword } from '../types/index.js';

const SALT_ROUNDS = 12;

export async function register(data: RegisterInput): Promise<{ user: UserWithoutPassword; tokens: TokenPair }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
    },
  });

  const tokens = generateTokenPair(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: omit(user, ['passwordHash']),
    tokens,
  };
}

export async function login(data: LoginInput): Promise<{ user: UserWithoutPassword; tokens: TokenPair }> {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase(), deletedAt: null },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const tokens = generateTokenPair(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: omit(user, ['passwordHash']),
    tokens,
  };
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (payload.type !== 'refresh') {
    throw new UnauthorizedError('Invalid token type');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is invalid or expired');
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Generate new tokens
  const tokens = generateTokenPair(storedToken.user.id, storedToken.user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: storedToken.user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getProfile(userId: string): Promise<UserWithoutPassword> {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return omit(user, ['passwordHash']);
}
