import { Injectable } from '@nestjs/common';
import { JourneyPaginationQueryDto } from 'src/common/dto/journey-pagination-query.dto';
import { PrismaService } from 'src/prisma.service';
import { kmToMeters, minutesToSeconds } from 'utils/journeys';

@Injectable()
export class JourneysService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    return this.prisma.journey.findUnique({ where: { id } });
  }

  async findMany(query: JourneyPaginationQueryDto) {
    const page = query.page || 1;
    const documentsPerPage = 12;
    return this.prisma.journey.findMany({
      where: {
        departure: {
          name: {
            startsWith: query.departureStationName,
          },
        },
        return: {
          name: {
            startsWith: query.returnStationName,
          },
        },
        distance: {
          ...(query.minDistance && { gte: kmToMeters(query.minDistance) }),
          ...(query.maxDistance && { lte: kmToMeters(query.maxDistance) }),
        },
        duration: {
          ...(query.minDuration && {
            gte: minutesToSeconds(query.minDuration),
          }),
          ...(query.maxDuration && {
            lte: minutesToSeconds(query.maxDuration),
          }),
        },
      },
      ...(query.sortBy && {
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
      }),
      skip: (page - 1) * documentsPerPage,
      take: documentsPerPage,
      include: {
        departure: {
          select: {
            name: true,
          },
        },
        return: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
