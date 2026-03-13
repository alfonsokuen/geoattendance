import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceType, ZoneStatus } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttendanceService {
  private s3Client: S3Client;

  constructor(private prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'rootuser',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'rootpassword123',
      },
    });
  }

  // Haversine formula
  private getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async uploadSelfie(file: Express.Multer.File): Promise<string> {
    const key = `selfies/${uuidv4()}-${file.originalname}`;
    const bucket = process.env.MINIO_BUCKET || 'geoattendance';
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    
    return `${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucket}/${key}`;
  }

  async getAllRecords() {
    return this.prisma.attendanceRecord.findMany({
      include: {
        employee: {
          include: { branch: true }
        },
        geofence: true,
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  async recordAttendance(
    userId: string,
    data: {
      type: AttendanceType;
      latitude: number;
      longitude: number;
      gpsAccuracy: number;
      deviceOS?: string;
    },
    selfieUrl?: string
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: { branch: { include: { geofence: true } } }
    });

    if (!employee) throw new BadRequestException('Empleado no encontrado');

    let zoneStatus: ZoneStatus = ZoneStatus.OUTSIDE_REJECTED;
    let geofenceId: string | undefined = undefined;

    if (employee.branch?.geofence) {
      const gf = employee.branch.geofence;
      geofenceId = gf.id;
      const distance = this.getDistanceInMeters(data.latitude, data.longitude, gf.latitude, gf.longitude);
      if (distance <= gf.radiusMeters) {
        zoneStatus = ZoneStatus.INSIDE;
      }
    }

    return this.prisma.attendanceRecord.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        latitude: data.latitude,
        longitude: data.longitude,
        gpsAccuracy: data.gpsAccuracy,
        deviceOS: data.deviceOS,
        geofenceId,
        zoneStatus,
        selfieUrl,
      }
    });
  }
}
