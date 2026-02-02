import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JwtPayload, TokenPair } from '../types/index.js';
import { parseMs } from './helpers.js';

export function generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function generateTokenPair(userId: string, email: string): TokenPair {
  return {
    accessToken: generateAccessToken({ userId, email }),
    refreshToken: generateRefreshToken({ userId, email }),
  };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + parseMs(config.jwt.refreshExpiresIn));
}
