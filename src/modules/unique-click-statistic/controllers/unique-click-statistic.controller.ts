import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  Put, 
  UseGuards, 
  Req
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UniqueClickStatisticService } from '../services/unique-click-statistic.service';
import { CreateUniqueClickStatisticDto } from '../dtos/create-unique-click-statistic.dto';
import { UpdateUniqueClickStatisticDto } from '../dtos/update-unique-click-statistic.dto';
import { SimpleUniqueClickStatisticDto } from '../dtos/simple-unique-click-statistic.dto';
import { UniqueClickStatistic } from '../schemas/unique-click-statistic.schema';

@ApiTags('unique-click-statistics')
@Controller('unique-click-statistics')
export class UniqueClickStatisticController {
  constructor(private readonly uniqueClickStatisticService: UniqueClickStatisticService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new unique click statistic' })
  @ApiResponse({ status: 201, description: 'Unique click statistic registered successfully', type: UniqueClickStatistic })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid personal token' })
  @ApiBody({ type: CreateUniqueClickStatisticDto })
  async create(@Body() createDto: CreateUniqueClickStatisticDto, @Req() req) {
    return this.uniqueClickStatisticService.create(createDto, req.user.userId);
  }

  @Post('simple')
  @ApiOperation({ summary: 'Register a unique click statistic using only UUID without authentication' })
  @ApiResponse({ status: 201, description: 'Unique click statistic registered successfully', type: UniqueClickStatistic })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid UUID' })
  @ApiBody({ type: SimpleUniqueClickStatisticDto })
  async createSimple(@Body() simpleClickDto: SimpleUniqueClickStatisticDto) {
    return this.uniqueClickStatisticService.createWithPersonalToken(simpleClickDto.text, simpleClickDto.uuid);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all unique click statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'List of unique click statistics', type: [UniqueClickStatistic] })
  async findAll() {
    return this.uniqueClickStatisticService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unique click statistics for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user\'s unique click statistics', type: [UniqueClickStatistic] })
  async findMyClicks(@Req() req) {
    return this.uniqueClickStatisticService.findByUser(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a unique click statistic by ID' })
  @ApiResponse({ status: 200, description: 'Unique click statistic found', type: UniqueClickStatistic })
  @ApiResponse({ status: 404, description: 'Unique click statistic not found' })
  @ApiParam({ name: 'id', description: 'ID of the unique click statistic' })
  async findOne(@Param('id') id: string) {
    return this.uniqueClickStatisticService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Update a unique click statistic' })
  @ApiResponse({ status: 200, description: 'Unique click statistic updated successfully', type: UniqueClickStatistic })
  @ApiResponse({ status: 404, description: 'Unique click statistic not found' })
  @ApiParam({ name: 'id', description: 'ID of the unique click statistic' })
  @ApiBody({ type: UpdateUniqueClickStatisticDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateUniqueClickStatisticDto) {
    return this.uniqueClickStatisticService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a unique click statistic' })
  @ApiResponse({ status: 200, description: 'Unique click statistic deleted successfully' })
  @ApiResponse({ status: 404, description: 'Unique click statistic not found' })
  @ApiParam({ name: 'id', description: 'ID of the unique click statistic' })
  async remove(@Param('id') id: string) {
    return this.uniqueClickStatisticService.remove(id);
  }

  @Get('me/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get summary of unique click statistics for authenticated user' })
  @ApiResponse({ status: 200, description: 'User\'s click summary' })
  async getMyClicksSummary(@Req() req) {
    return this.uniqueClickStatisticService.findByUser(req.user.userId);
  }

  @Post('me/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get click statistics summary for authenticated user using personal token' })
  @ApiResponse({ status: 200, description: 'User\'s click summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid personal token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        personalToken: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'User\'s personal token'
        }
      },
      required: ['personalToken']
    }
  })
  async getUserClickSummary(@Body('personalToken') personalToken: string, @Req() req) {
    return this.uniqueClickStatisticService.getUserClickSummary(req.user.userId, personalToken);
  }
} 