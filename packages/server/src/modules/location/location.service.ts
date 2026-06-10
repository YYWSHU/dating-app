import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

export async function updateLocation(
  userId: string,
  latitude: number,
  longitude: number
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { latitude, longitude },
    select: {
      id: true,
      latitude: true,
      longitude: true,
    },
  });

  return user;
}

export async function getNearbyUsers(
  userId: string,
  maxDistanceKm: number = 50,
  limit: number = 50
) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { latitude: true, longitude: true, id: true },
  });

  if (!me || !me.latitude || !me.longitude) {
    throw new AppError(400, 'Your location is not set');
  }

  // Use raw SQL with PostGIS for distance calculation
  // Simple fallback: approximate distance using Haversine in application
  // For production, use PostGIS ST_DWithin for efficient spatial queries
  const nearbyUsers = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      nickname: string;
      avatar_url: string | null;
      bio: string | null;
      tags: string[];
      distance_km: number;
    }>
  >(
    `SELECT
      u.id,
      u.nickname,
      u.avatar_url,
      u.bio,
      u.tags,
      (
        6371 * acos(
          cos(radians($1::float)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians($2::float)) +
          sin(radians($1::float)) * sin(radians(u.latitude))
        )
      ) AS distance_km
    FROM "User" u
    WHERE u.id != $3::text
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
      AND (
        6371 * acos(
          cos(radians($1::float)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians($2::float)) +
          sin(radians($1::float)) * sin(radians(u.latitude))
        )
      ) <= $4::int
    ORDER BY distance_km ASC
    LIMIT $5::int`,
    me.latitude,
    me.longitude,
    userId,
    maxDistanceKm,
    limit
  );

  return nearbyUsers;
}
