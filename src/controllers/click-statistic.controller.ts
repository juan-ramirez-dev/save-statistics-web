import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClickStatisticService } from '../services/click-statistic.service';
import { CreateClickStatisticDto } from '../dtos/create-click-statistic.dto';
import { SimpleClickStatisticDto } from '../dtos/simple-click-statistic.dto';
import { ClickStatistic } from '../schemas/click-statistic.schema';

@ApiTags('click-statistics')
@Controller('click-statistics')
export class ClickStatisticController {
  constructor(private readonly clickStatisticService: ClickStatisticService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un nuevo clic' })
  @ApiResponse({ status: 201, description: 'Estadística de clic registrada exitosamente', type: ClickStatistic })
  @ApiResponse({ status: 401, description: 'No autorizado - Token personal inválido' })
  @ApiBody({ type: CreateClickStatisticDto })
  async create(@Body() createClickStatisticDto: CreateClickStatisticDto, @Req() req) {
    return this.clickStatisticService.create(createClickStatisticDto, req.user.userId);
  }

  @Post('simple')
  @ApiOperation({ summary: 'Registrar un clic usando solo UUID sin autenticación' })
  @ApiResponse({ status: 201, description: 'Estadística de clic registrada exitosamente', type: ClickStatistic })
  @ApiResponse({ status: 401, description: 'No autorizado - UUID inválido' })
  @ApiBody({ type: SimpleClickStatisticDto })
  async createSimple(@Body() simpleClickDto: SimpleClickStatisticDto) {
    return this.clickStatisticService.createWithPersonalToken(simpleClickDto.text, simpleClickDto.uuid);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todas las estadísticas de clics (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de estadísticas de clics', type: [ClickStatistic] })
  async findAll() {
    return this.clickStatisticService.findAll();
  }

  @Get('my-clicks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener las estadísticas de clics del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de estadísticas de clics del usuario', type: [ClickStatistic] })
  async findMyClicks(@Req() req) {
    return this.clickStatisticService.findByUser(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una estadística de clic por ID' })
  @ApiResponse({ status: 200, description: 'Estadística de clic encontrada', type: ClickStatistic })
  @ApiResponse({ status: 404, description: 'Estadística de clic no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la estadística de clic' })
  async findOne(@Param('id') id: string) {
    return this.clickStatisticService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar una estadística de clic' })
  @ApiResponse({ status: 200, description: 'Estadística de clic eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Estadística de clic no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la estadística de clic' })
  async remove(@Param('id') id: string) {
    return this.clickStatisticService.remove(id);
  }


  @Post('summary/my-clicks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener resumen de clics del usuario autenticado agrupados por texto' })
  @ApiResponse({ status: 200, description: 'Resumen de clics del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token personal inválido' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        personalToken: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Token personal único del usuario'
        }
      },
      required: ['personalToken']
    }
  })
  async getUserClickSummary(@Body('personalToken') personalToken: string, @Req() req) {
    return this.clickStatisticService.getUserClickSummary(req.user.userId, personalToken);
  }
} 