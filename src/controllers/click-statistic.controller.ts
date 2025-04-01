import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClickStatisticService } from '../services/click-statistic.service';
import { CreateClickStatisticDto } from '../dtos/create-click-statistic.dto';
import { ClickStatistic } from '../schemas/click-statistic.schema';

@ApiTags('click-statistics')
@ApiBearerAuth()
@Controller('click-statistics')
@UseGuards(JwtAuthGuard)
export class ClickStatisticController {
  constructor(private readonly clickStatisticService: ClickStatisticService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo clic' })
  @ApiResponse({ status: 201, description: 'Estadística de clic registrada exitosamente', type: ClickStatistic })
  async create(@Body() createClickStatisticDto: CreateClickStatisticDto, @Req() req) {
    return this.clickStatisticService.create(createClickStatisticDto, req.user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todas las estadísticas de clics (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de estadísticas de clics', type: [ClickStatistic] })
  async findAll() {
    return this.clickStatisticService.findAll();
  }

  @Get('my-clicks')
  @ApiOperation({ summary: 'Obtener las estadísticas de clics del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de estadísticas de clics del usuario', type: [ClickStatistic] })
  async findMyClicks(@Req() req) {
    return this.clickStatisticService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una estadística de clic por ID' })
  @ApiResponse({ status: 200, description: 'Estadística de clic encontrada', type: ClickStatistic })
  @ApiResponse({ status: 404, description: 'Estadística de clic no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.clickStatisticService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar una estadística de clic' })
  @ApiResponse({ status: 200, description: 'Estadística de clic eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Estadística de clic no encontrada' })
  async remove(@Param('id') id: string) {
    return this.clickStatisticService.remove(id);
  }

  @Get('summary/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener resumen de todos los clics agrupados por texto (solo admin)' })
  @ApiResponse({ status: 200, description: 'Resumen de clics' })
  async getClickSummary() {
    return this.clickStatisticService.getClickSummary();
  }

  @Get('summary/my-clicks')
  @ApiOperation({ summary: 'Obtener resumen de clics del usuario autenticado agrupados por texto' })
  @ApiResponse({ status: 200, description: 'Resumen de clics del usuario' })
  async getUserClickSummary(@Req() req) {
    return this.clickStatisticService.getUserClickSummary(req.user.userId);
  }
} 