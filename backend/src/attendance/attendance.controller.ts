import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, ParseFloatPipe, Get } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttendanceType, Role } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(Role.SUPERADMIN, Role.HR, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll() {
    return this.attendanceService.getAllRecords();
  }

  @UseGuards(JwtAuthGuard)
  @Post('record')
  @UseInterceptors(FileInterceptor('selfie'))
  async record(
    @Request() req,
    @UploadedFile() selfie: Express.Multer.File,
    @Body('type') type: string,
    @Body('latitude', ParseFloatPipe) latitude: number,
    @Body('longitude', ParseFloatPipe) longitude: number,
    @Body('gpsAccuracy', ParseFloatPipe) gpsAccuracy: number,
    @Body('deviceOS') deviceOS: string,
  ) {
    let selfieUrl: string | undefined = undefined;
    if (selfie) {
      selfieUrl = await this.attendanceService.uploadSelfie(selfie);
    }

    return this.attendanceService.recordAttendance(
      req.user.id,
      {
        type: type as AttendanceType,
        latitude,
        longitude,
        gpsAccuracy,
        deviceOS,
      },
      selfieUrl
    );
  }
}
