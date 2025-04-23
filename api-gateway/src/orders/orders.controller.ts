import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Query,
  } from '@nestjs/common';
  import { OrdersService } from './orders.service';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { CurrentUser } from '../auth/decorators/current-user.decorator';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Orders')
  @ApiBearerAuth()
  @Controller('orders')
  @UseGuards(JwtAuthGuard)
  export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
  
    @Post()
    @Roles('buyer')
    @ApiOperation({ summary: 'Create a new order (Buyer only)' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async create(
      @Body() createOrderDto: CreateOrderDto,
      @CurrentUser() user: any,
    ) {
      return this.ordersService.createOrder(createOrderDto, user.userId);
    }
  
    @Get()
    @Roles('buyer', 'seller')
    @ApiOperation({ summary: 'Get orders for current user' })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@CurrentUser() user: any, @Query() query: any) {
      return this.ordersService.getUserOrders(user.userId, user.role, query);
    }
  
    @Get(':id')
    @Roles('buyer', 'seller')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async findOne(@Param('id') id: string, @CurrentUser() user: any) {
      return this.ordersService.getOrderById(id, user.userId, user.role);
    }
  
    @Put(':id/status')
    @Roles('seller')
    @ApiOperation({ summary: 'Update order status (Seller only)' })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updateStatus(
      @Param('id') id: string,
      @Body() updateOrderStatusDto: UpdateOrderStatusDto,
      @CurrentUser() user: any,
    ) {
      return this.ordersService.updateOrderStatus(
        id,
        updateOrderStatusDto,
        user.userId,
      );
    }
  }